import {Service} from "../lib/dependency-injection";
import {SessionEntity} from "../session/entity/session.entity";
import {Repository} from "typeorm";
import {ApplicationEntity} from "./entity/application.entity";
import {AppDataSource} from "../lib/database";
import crypto from "crypto";
import {RedirectUriEntity} from "./entity/redirect-uri.entity";
import {UnauthorizedException} from "../lib/web/exceptions/unauthorized.exception";
import * as fs from "fs";
import path from "path";
import {ReadStream} from "fs";

@Service()
export class OauthService {

    private applicationRepository: Repository<ApplicationEntity>;
    private redirectUriRepository: Repository<RedirectUriEntity>;

    constructor() {
        this.applicationRepository = AppDataSource.getRepository(ApplicationEntity);
        this.redirectUriRepository = AppDataSource.getRepository(RedirectUriEntity);
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
        console.log(application)
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
        if(responseType !== "code") {
            throw new UnauthorizedException("Invalid response type");
        }
        const application = await this.applicationRepository.findOne({where: {clientId: clientId}, relations: ["redirectUris"]});
        if (!application) {
            throw new UnauthorizedException("Invalid client id");
        }
        const redirectUri = application.redirectUris.find(uri => uri.redirectUri === redirectUrl);
        if (!redirectUri) {
            throw new UnauthorizedException("Invalid redirect uri");
        }
        return fs.createReadStream(path.join(__dirname, "../../public", "authorize.html"), "utf-8");
    }
}