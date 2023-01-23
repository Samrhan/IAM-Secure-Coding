import {DataSource} from "typeorm";
import {AppDataSource} from "../../../lib/database";
import {registerController, server} from "../../../lib/fastify";
import {UserEntity} from "../../../user/entity/user.entity";
import {SessionController} from "../../../session/session.controller";
import {SessionEntity} from "../../../session/entity/session.entity";
import {createUserFixture} from "../../user/fixture/users.fixture";
import cookie from "@fastify/cookie";
import {createSessionFixture} from "../fixture/session.fixture";
import {UserController} from "../../../user/user.controller";

describe("Session Controller", () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await AppDataSource.initialize();
        registerController(SessionController, UserController);
    })

    beforeEach(async () => {
        await dataSource.getRepository(SessionEntity).delete({});
        await dataSource.getRepository(UserEntity).delete({});
    });

    afterAll(async () => {
        await dataSource.getRepository(SessionEntity).delete({});
        await dataSource.getRepository(UserEntity).delete({});
    })

    it("should create a session", async () => {
        const user = await createUserFixture();
        const reply = await server.inject({
            url: `/sessions`, method: 'POST', payload: {
                email: user.email,
                password: "changethat"
            }
        })
        expect(reply.statusCode).toBe(201);
        expect(reply.cookies[0]).toHaveProperty("name", "sid")
        expect(reply.cookies[0]).toHaveProperty("secure", true)
        expect(reply.cookies[0]).toHaveProperty("httpOnly", true)
        expect(reply.cookies[0]).toHaveProperty("path", "/")

        const sessionSecret = process.env.SESSION_SECRET;
        const cookieValue = (reply.cookies[0] as any).value;
        const decodeCookie = cookie.unsign(cookieValue, sessionSecret);
        expect(decodeCookie.valid).toBeTruthy();
    });

    it('should create a session after lowering email', async () => {
        const user = await createUserFixture();
        const reply = await server.inject({
            url: `/sessions`, method: 'POST', payload: {
                email: user.email.toUpperCase(),
                password: "changethat"
            }
        })
        expect(reply.statusCode).toBe(201);

        const sessionSecret = process.env.SESSION_SECRET;
        const cookieValue = (reply.cookies[0] as any).value;
        const decodeCookie = cookie.unsign(cookieValue, sessionSecret);
        expect(decodeCookie.valid).toBeTruthy();
    })

    it('should reject with 404 if email not found', async () => {
        const response = await server.inject({
            url: `/sessions`, method: 'POST', payload: {
                email: "test@notanemail.com",
                password: "changethat"
            }
        })
        expect(response.statusCode).toBe(404);
    })

    it('should reject with 404 if password does not match', async () => {
        const user = await createUserFixture();
        const response = await server.inject({
            url: `/sessions`, method: 'POST', payload: {
                email: user.email,
                password: "changethat2"
            }
        })
        expect(response.statusCode).toBe(404);
    });

    it("should delete a session", async () => {
        const session = await createSessionFixture();
        const encryptedCookie = cookie.sign(session.token, process.env.SESSION_SECRET);
        const cookies = `sid=${encryptedCookie}`;
        const response = await server.inject({url: `/sessions/current`, method: 'DELETE', headers: {cookie: cookies}});
        expect(response.statusCode).toBe(204);
        const checkDeletion = await server.inject({url: `/users/me`, method: 'GET', headers: {cookie: cookies}});
        expect(checkDeletion.statusCode).toBe(401);
    });

    afterAll(async () => {
        await dataSource.destroy();
    });
})