import {AppDataSource} from "../../lib/database";
import {DataSource} from "typeorm";
import {UserEntity} from "../../entity/user.entity";
import {ValidationError} from "../../errors/validation.error";

describe('User', function () {
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await AppDataSource.initialize().catch((error) => {
            throw new Error(`Error initializing database: ${error.message}`);
        });
        await dataSource.getRepository(UserEntity.name).clear()
    })

    afterEach(async () => {
        await dataSource.getRepository(UserEntity.name).clear()
    })

    describe('validations', function () {
        it('should create a new User in database', async () => {
            const user = new UserEntity("John", "Doe", "john.doe@live.com", "password");
            await dataSource.getRepository(UserEntity.name).save(user);
            const users = await dataSource.getRepository(UserEntity.name).find();
            expect(users.length).toBe(1);
            expect(users[0].firstname).toBe("John");
            expect(users[0].lastname).toBe("Doe");
            expect(users[0].email).toBe("john.doe@live.com");
            expect(users[0].passwordHash).toBe("password");
        });

        it('should raise error if email is missing', async function () {
            const user = new UserEntity("John", "Doe", undefined, "password");
            const error = new ValidationError("Validation error", user, "email");
            await expect(dataSource.getRepository(UserEntity.name).save(user)).rejects.toThrowError(error);
        })
    })
})
