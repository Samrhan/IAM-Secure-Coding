import {createUserFixture} from "../../user/fixture/users.fixture";
import {SessionEntity} from "../../../session/entity/session.entity";
import {AppDataSource} from "../../../lib/database";
import {DataSource} from "typeorm";
import {ValidationError} from "class-validator";

describe("Session Entity", () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        jest.setTimeout(10000);
        dataSource = await AppDataSource.initialize().catch((error: Error) => {
            throw new Error(`Error initializing database: ${error.message}`);
        });
        await dataSource.getRepository(SessionEntity.name).clear()
    })

    afterEach(async () => {
        await dataSource.getRepository(SessionEntity.name).clear()
    })

    afterAll(() => {
        jest.setTimeout(5000);
    })

    it("should generate a token and an expire date", async () => {
        const user = await createUserFixture();
        const session = new SessionEntity(user);
        await dataSource.getRepository(SessionEntity.name).save(session);
        const sessions = await dataSource.getRepository(SessionEntity.name).find();
        expect(sessions.length).toBe(1);
        expect(sessions[0].token).toBeDefined();
        expect(sessions[0].token).toHaveLength(512);
        expect(sessions[0].expiresAt).toBeDefined();
    })

    it("should not generate a session if user is missing", async () => {
        const session = new SessionEntity(undefined);
        let caughtError: ValidationError[];
        try {
            await dataSource.getRepository(SessionEntity.name).save(session);
        } catch (e) {
            if (Array.isArray(e) && e[0] instanceof ValidationError) {
                caughtError = e as ValidationError[];
            }
        }
        expect(caughtError).toBeDefined();
        expect(caughtError.length).toBe(1);
        expect(caughtError[0].property).toEqual("user");
    });

    afterAll(async () => {
        await dataSource.destroy();
    });
})
