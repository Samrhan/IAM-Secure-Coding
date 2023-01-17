import {Service} from "../lib/dependency-injection";
import {UserEntity} from "./entity/user.entity";
import {AppDataSource} from "../lib/database";

@Service()
export class UserService {
    async createUser(firstname: string, lastname: string, email: string, password: string, passwordConfirmation: string) {
        const repository = AppDataSource.getRepository(UserEntity);
        const userEntity = new UserEntity(firstname, lastname, email);
        await userEntity.setPassword(password, passwordConfirmation);
        return await repository.save(userEntity);
    }
}
