import {registerController, server} from "../../../lib/fastify";
import {UserController} from "../../../user/user.controller";
import {AppDataSource} from "../../../lib/database";
import {UserEntity} from "../../../user/entity/user.entity";
import {DataSource} from "typeorm";

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
        await dataSource.getRepository(UserEntity).clear()
    });

    afterAll(async () => {
        await dataSource.getRepository(UserEntity).clear()
    })

    it('should register the user', async function () {
        const response = await server.inject({url: `/users`, method: 'POST', payload: createUserPayload});
        expect(response.statusCode).toBe(200);
        expect(response.json().firstname).toBe("test");
        expect(response.json().lastname).toBe("test");
        expect(response.json().email).toBe("test@gmail.com");
        expect(response.json().passwordHash).toBeUndefined();

        const uuidRegex = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$");
        expect(response.json().id).toMatch(uuidRegex);
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
})
