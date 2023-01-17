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
                "email": undefined,
            }
        })
        expect(response.statusCode).toBe(400);
    });

})
