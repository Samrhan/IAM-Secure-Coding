import {Service} from "../lib/dependency-injection";
import {AppDataSource} from "../lib/database";
import {UserEntity} from "../user/entity/user.entity";
import {SessionEntity} from "./entity/session.entity";
import {SessionController} from "./session.controller";
import {Repository} from "typeorm";
import {NotFoundException} from "../lib/web/exceptions/not-found.exception";

@Service()
export class SessionService {
    sessionRepository: Repository<SessionEntity>
    userRepository: Repository<UserEntity>

    constructor() {
        this.sessionRepository = AppDataSource.getRepository(SessionEntity);
        this.userRepository = AppDataSource.getRepository(UserEntity);
    }

    /**
     * Create a session for a user
     * @param email
     * @param password
     * @return token
     */
    async createSession(email: string, password: string): Promise<string> {
        const user = await this.userRepository.findOne({
            select: ["id", "password", "email", "firstname", "lastname"],
            where: {
                email: email
            }
        });
        if(!user || !await user.isPasswordValid(password)) {
            throw new NotFoundException("User not found");
        }
        const session = await this.sessionRepository.save(new SessionEntity(user));
        return session.token;
    }

    deleteSession(session: SessionEntity) {
        session.revokedAt = new Date();
        return this.sessionRepository.save(session);
    }
}