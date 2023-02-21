import {registerController, server} from "../../../lib/fastify";
import {UserController} from "../../../user/user.controller";
import {AppDataSource} from "../../../lib/database";
import {UserEntity} from "../../../user/entity/user.entity";
import {DataSource} from "typeorm";
import {createSessionFixture} from "../../session/fixture/session.fixture";
import cookie from "@fastify/cookie";
import {SessionEntity} from "../../../session/entity/session.entity";
import {createUserFixture} from "../fixture/users.fixture";

describe("User Controller", () => {
    let dataSource: DataSource;
    const createUserPayload = {
        "firstname": "test",
        "lastname": "test",
        "email": "test@gmail.com",
        "password": "Test12345678990",
        "passwordConfirmation": "Test12345678990"
    }
    beforeAll(async () => {
        dataSource = await AppDataSource.initialize();
        registerController(UserController);
    })

    beforeEach(async () => {
        // Use Delete instead of truncate because of foreign key constraints
        await dataSource.getRepository(SessionEntity).delete({})
        await dataSource.getRepository(UserEntity).delete({})
    });

    afterAll(async () => {
        await dataSource.getRepository(SessionEntity).delete({})
        await dataSource.getRepository(UserEntity).delete({})
        await dataSource.destroy();
    })

    it('should register the user', async function () {
        const response = await server.inject({url: `/users`, method: 'POST', payload: createUserPayload});
        expect(response.statusCode).toBe(200);
        const responseData: any = response.json();
        const uuidRegex = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$");
        expect(responseData?.firstname).toBe("test");
        expect(responseData?.lastname).toBe("test");
        expect(responseData?.email).toBe("test@gmail.com");
        expect(responseData?.passwordHash).toBeUndefined();
        expect(responseData?.id).toMatch(uuidRegex);
    })

    it('should raise error if email is missing', async () => {
        const response = await server.inject({
            url: `/users`, method: 'POST', payload: {
                "firstname": "test",
                "lastname": "test",
            }
        })
        expect(response.statusCode).toBe(400);
    });

    it("should raise error on unexpected query params", async () => {
        const response = await server.inject({url: `/users?test=1`, method: 'POST', payload: createUserPayload});
        expect(response.statusCode).toBe(400);
        expect(response.json().message).toBe("The query is not expected in this route");
    })

    describe("Me endpoint", () => {
        it("should return the user", async () => {
            const user = await createUserFixture();
            const session = await createSessionFixture({user});
            const encryptedCookie = cookie.sign(session.token, process.env.SESSION_SECRET);
            const cookies = `sid=${encryptedCookie}`;
            const response = await server.inject({url: `/users/me`, method: 'GET', headers: {cookie: cookies}});
            expect(response.statusCode).toBe(200);
            expect(response.json().id).toBe(user.id);
        });
        it("should respond with 401 if user is not logged in", async () => {
            const response = await server.inject({url: `/users/me`, method: 'GET'});
            expect(response.statusCode).toBe(401);
        });
        it('should respond with 401 if unsigned cookie', async ()=>{
            const user = await createUserFixture();
            const session = await createSessionFixture({user});
            const cookies = `sid=${session.token}`;
            const response = await server.inject({url: `/users/me`, method: 'GET', headers: {cookie: cookies}});
            expect(response.statusCode).toBe(401);
        })
        it('should respond with 401 if cookie signature with a wrong key', async ()=>{
            const user = await createUserFixture();
            const session = await createSessionFixture({user});
            const encryptedCookie = cookie.sign(session.token, 'wrong-key');
            const cookies = `sid=${encryptedCookie}`;
            const response = await server.inject({url: `/users/me`, method: 'GET', headers: {cookie: cookies}});
            expect(response.statusCode).toBe(401);
        })
        it('should respond with 401 if session has expired', async ()=>{
            const user = await createUserFixture();
            const expiredDate = new Date(1970, 1, 1);
            const session = await createSessionFixture({user, expiresAt: expiredDate});
            const encryptedCookie = cookie.sign(session.token, process.env.SESSION_SECRET);
            const cookies = `sid=${encryptedCookie}`;
            const response = await server.inject({url: `/users/me`, method: 'GET', headers: {cookie: cookies}});
            expect(response.statusCode).toBe(401);
        })
        it('should respond with 401 if session has been revoked', async ()=>{
            const user = await createUserFixture();
            const session = await createSessionFixture({user, revokedAt: new Date()});
            const encryptedCookie = cookie.sign(session.token, process.env.SESSION_SECRET);
            const cookies = `sid=${encryptedCookie}`;
            const response = await server.inject({url: `/users/me`, method: 'GET', headers: {cookie: cookies}});
            expect(response.statusCode).toBe(401);
        })

    });
});
