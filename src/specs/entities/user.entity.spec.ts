import {AppDataSource} from "../../lib/database";
import {DataSource} from "typeorm";
import {UserEntity} from "../../entity/user.entity";
import {ValidationError} from "class-validator";
import * as bcrypt from "bcrypt";

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

            // We don't want to expose the password hash
            expect(users[0].passwordHash).toBeUndefined();
        });

        it('should raise error if email is missing', async function () {
            const user = new UserEntity("John", "Doe", undefined, "password");
            let catchedError: ValidationError[];
            try {
                await dataSource.getRepository(UserEntity.name).save(user);
            } catch (e) {
                if (Array.isArray(e) && e[0] instanceof ValidationError) {
                    catchedError = e;
                }
            }
            expect(catchedError).toBeDefined();
            expect(catchedError.length).toBe(1);
            expect(catchedError[0].property).toEqual("email");
        })

        it("should raise error if email is not unique", async function () {
            const user1 = new UserEntity("John", "Doe", "john.doe@live.com", "password");
            const user2 = new UserEntity("John", "Doe", "john.doe@live.com", "password");
            await dataSource.getRepository(UserEntity.name).save(user1);
            let catchedError: ValidationError[];
            try {
                await dataSource.getRepository(UserEntity.name).save(user2);
            } catch (e) {
                if (Array.isArray(e) && e[0] instanceof ValidationError) {
                    catchedError = e;
                }
            }
            expect(catchedError).toBeDefined();
            expect(catchedError.length).toBe(1);
            expect(catchedError[0].property).toEqual("email");
        });

        it("should hash password if password match confirmation", async () => {
            const user = new UserEntity("John", "Doe", "john.doe@live.com");
            await user.setPassword("passwordpassword", "passwordpassword");
            const hashedPassword = await bcrypt.hash("password", 10);
            const match = bcrypt.compare("password", hashedPassword);
            expect(match).toBeTruthy();
        })

        it("should raise error if password doesn't match confirmation", async () => {
            const user = new UserEntity("John", "Doe", "john.doe@live.com");
            let caughtError: ValidationError[];
            try {
                await user.setPassword("passwordpassword", "notpassword");
            } catch (e) {
                if (Array.isArray(e) && e[0] instanceof ValidationError) {
                    caughtError = e;
                }
            }
            expect(caughtError).toBeDefined();
            expect(caughtError.length).toBe(1);
            expect(caughtError[0].property).toEqual("password");
        })

        it("should raise error if password is too weak", async () => {
            const user = new UserEntity("John", "Doe", "john.doe@live.com");
            let caughtError: ValidationError[];
            try {
                await user.setPassword("password", "password");
            } catch (e) {
                if (Array.isArray(e) && e[0] instanceof ValidationError) {
                    caughtError = e;
                }
            }
            expect(caughtError).toBeDefined();
            expect(caughtError.length).toBe(1);
            expect(caughtError[0].property).toEqual("password");
        })

        it("should return false if password doesn't match the actual password", async () => {
            const user = new UserEntity("John", "Doe", "john.doe@live.com");
            await user.setPassword("passwordpassword", "passwordpassword");
            const match = await user.isPasswordValid("notpassword");
            expect(match).toBeFalsy();
        })

        it("should return true if password match the actual password", async () => {
            const user = new UserEntity("John", "Doe", "john.doe@live.com");
            await user.setPassword("passwordpassword", "passwordpassword");
            const match = await user.isPasswordValid("passwordpassword");
            expect(match).toBeTruthy();

        });
    })

    afterAll(async () => {
        await dataSource.destroy();
    });
})
