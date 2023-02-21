import {Service} from "../lib/dependency-injection";
import {SessionEntity} from "../session/entity/session.entity";
import {Repository} from "typeorm";
import {ApplicationEntity} from "./entity/application.entity";
import {AppDataSource} from "../lib/database";
import crypto from "crypto";
import {RedirectUriEntity} from "./entity/redirect-uri.entity";
import {UnauthorizedException} from "../lib/web/exceptions/unauthorized.exception";
import * as fs from "fs";
import {ReadStream} from "fs";
import path from "path";
import {AuthorizationCodeEntity} from "./entity/authorization-code.entity";
import {NotFoundException} from "../lib/web/exceptions/not-found.exception";
import {UserEntity} from "../user/entity/user.entity";
import {AccessTokenEntity} from "./entity/access-token.entity";

@Service()
export class OauthService {

    private applicationRepository: Repository<ApplicationEntity>;
    private redirectUriRepository: Repository<RedirectUriEntity>;
    private authorizationCodeRepository: Repository<AuthorizationCodeEntity>;
    private userRepository: Repository<UserEntity>;

    private accessTokenRepository: Repository<AccessTokenEntity>;

    constructor() {
        this.applicationRepository = AppDataSource.getRepository(ApplicationEntity);
        this.redirectUriRepository = AppDataSource.getRepository(RedirectUriEntity);
        this.authorizationCodeRepository = AppDataSource.getRepository(AuthorizationCodeEntity);
        this.userRepository = AppDataSource.getRepository(UserEntity);
        this.accessTokenRepository = AppDataSource.getRepository(AccessTokenEntity);
    }

    async createApplication(session: SessionEntity, name: string, redirectUris: string[]) {
        const {clientId, clientSecret} = this.generateClientCredentials();
        const application = await this.applicationRepository.save(new ApplicationEntity(name, clientId, clientSecret, session.user));
        const redirectUriEntities: RedirectUriEntity[] = [];
        for (const redirectUri of redirectUris) {
            const entity = new RedirectUriEntity(application, redirectUri);
            redirectUriEntities.push(await this.redirectUriRepository.save(entity));
        }
        application.redirectUris = redirectUriEntities;
        return application;

    }

    private generateClientCredentials(): { clientId: string, clientSecret: string } {
        // based on uuid
        return {
            clientId: crypto.randomBytes(16).toString("hex"),
            clientSecret: crypto.randomBytes(32).toString("hex")
        }
    }

    async authorize(clientId: string, redirectUrl: string, responseType: string, scopes: string[], state: string): Promise<ReadStream> {
        if (responseType !== "code") {
            throw new UnauthorizedException("Invalid response type");
        }
        const application = await this.applicationRepository.findOne({
            where: {clientId: clientId},
            relations: ["redirectUris"]
        });
        if (!application) {
            throw new UnauthorizedException("Invalid client id");
        }
        const redirectUri = application.redirectUris.find(uri => uri.redirectUri === redirectUrl);
        if (!redirectUri) {
            throw new UnauthorizedException("Invalid redirect uri");
        }
        return fs.createReadStream(path.join(__dirname, "../../public", "authorize.html"), "utf-8");
    }

    async getAuthorizationCode(clientId: string, redirectUri: string, responseType: string, scopes: string, email: string, password: string) {
        if (responseType !== "code") {
            throw new UnauthorizedException("Invalid response type");
        }
        const user = await this.authenticateUser(email, password);
        const application = await this.applicationRepository.findOne({
            where: {clientId: clientId},
            relations: ["redirectUris"]
        });
        if (!application) {
            throw new UnauthorizedException("Invalid client id");
        }
        const redirectUriEntity = application.redirectUris.find(uri => uri.redirectUri === redirectUri);
        if (!redirectUriEntity) {
            throw new UnauthorizedException("Invalid redirect uri");
        }
        const authorizationCode = await this.generateAuthorizationCode(application, scopes, user);
        return authorizationCode.code;
    }

    private async generateAuthorizationCode(application: ApplicationEntity, scopes: string, user: UserEntity) {
        const entity = new AuthorizationCodeEntity();
        entity.application = application;
        entity.scopes = scopes;
        entity.code = crypto.randomBytes(16).toString("hex");
        entity.user = user;
        entity.expiresAt = new Date(new Date().getTime() + 15 * 60 * 1000);
        return await this.authorizationCodeRepository.save(entity);
    }

    private async authenticateUser(email: string, password: string) {
        const user = await this.userRepository.findOne({
            select: ["id", "password", "email", "firstname", "lastname"],
            where: {
                email: email
            }
        });
        if (!user || !await user.isPasswordValid(password)) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    async getAccessToken(clientId: string, clientSecret: string, code: string) {
        const codeEntity = await this.authorizationCodeRepository.findOne({
            where: {code: code},
            relations: ["application", "user"]
        });
        if (!codeEntity) {
            throw new NotFoundException("Invalid authorization code");
        }
        if (codeEntity.application.clientId !== clientId || codeEntity.application.clientSecret !== clientSecret) {
            throw new UnauthorizedException("Invalid client credentials");
        }
        if (codeEntity.expiresAt.getTime() < new Date().getTime()) {
            throw new UnauthorizedException("Authorization code expired");
        }
        return await this.generateAccessToken(codeEntity);

    }

    private async generateAccessToken(codeEntity: AuthorizationCodeEntity) {
        const entity = new AccessTokenEntity();
        entity.application = codeEntity.application;
        entity.scopes = codeEntity.scopes;
        entity.token = crypto.randomBytes(32).toString("hex");
        entity.user = codeEntity.user;
        entity.expiresAt = new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000);
        return await this.accessTokenRepository.save(entity);
    }
}
