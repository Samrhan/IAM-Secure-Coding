import {DataSource} from "typeorm";
import {registerController, server} from "../../../lib/fastify";
import {AppDataSource} from "../../../lib/database";
import {OauthController} from "../../../oauth/oauth.controller";
import {UserEntity} from "../../../user/entity/user.entity";
import {ApplicationEntity} from "../../../oauth/entity/application.entity";
import {createSessionFixture} from "../../session/fixture/session.fixture";
import cookie from "@fastify/cookie";
import {SessionEntity} from "../../../session/entity/session.entity";
import {RedirectUriEntity} from "../../../oauth/entity/redirect-uri.entity";
import {AuthorizationCodeEntity} from "../../../oauth/entity/authorization-code.entity";
import {AccessTokenEntity} from "../../../oauth/entity/access-token.entity";
import {createApplicationFixture} from "../fixture/application.fixture";
import {createAuthorizationCodeFixture} from "../fixture/authorization-code.fixture";

describe("OAuth Controller", () => {
    let dataSource: DataSource;
    beforeAll(async () => {
        dataSource = await AppDataSource.initialize();
        registerController(OauthController);
    });

    beforeEach(async () => {
        // Use Delete instead of truncate because of foreign key constraints
        await dataSource.getRepository(SessionEntity).delete({});
        await dataSource.getRepository(RedirectUriEntity).delete({});
        await dataSource.getRepository(AuthorizationCodeEntity).delete({});
        await dataSource.getRepository(AccessTokenEntity).delete({})
        await dataSource.getRepository(ApplicationEntity).delete({})
        await dataSource.getRepository(UserEntity).delete({})
    });

    afterAll(async () => {
        await dataSource.getRepository(SessionEntity).delete({});
        await dataSource.getRepository(RedirectUriEntity).delete({});
        await dataSource.getRepository(AuthorizationCodeEntity).delete({});
        await dataSource.getRepository(AccessTokenEntity).delete({});
        await dataSource.getRepository(ApplicationEntity).delete({})
        await dataSource.getRepository(UserEntity).delete({})
        await dataSource.destroy();
    });

    describe("Application", () => {

        it("should register the application", async () => {
            const session = await createSessionFixture();
            const encryptedCookie = cookie.sign(session.token, process.env.SESSION_SECRET);
            const cookies = `sid=${encryptedCookie}`;
            const response = await server.inject({
                url: `/oauth/application`,
                method: 'POST',
                headers: {cookie: cookies},
                payload: {
                    name: "Test Application",
                    redirectUris: ["https://example.com"]
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toHaveProperty("name", "Test Application");
            expect(response.json()).toHaveProperty("clientId");
            expect(response.json()).not.toHaveProperty("clientSecret");
            expect(response.json()).toHaveProperty("redirectUris");
            expect(response.json().redirectUris).toHaveLength(1);
            expect(response.json().redirectUris[0]).toBe("https://example.com");
        });

        it("should raise error if name is missing", async () => {
            const session = await createSessionFixture();
            const encryptedCookie = cookie.sign(session.token, process.env.SESSION_SECRET);
            const cookies = `sid=${encryptedCookie}`;
            const response = await server.inject({
                url: `/oauth/application`,
                method: 'POST',
                headers: {cookie: cookies},
                payload: {
                    redirectUris: ["https://example.com"]
                }
            });

            expect(response.statusCode).toBe(400);
        })

        it("should raise error if redirectUris is missing", async () => {
            const session = await createSessionFixture();
            const encryptedCookie = cookie.sign(session.token, process.env.SESSION_SECRET);
            const cookies = `sid=${encryptedCookie}`;
            const response = await server.inject({
                url: `/oauth/application`,
                method: 'POST',
                headers: {cookie: cookies},
                payload: {
                    name: "Test Application"
                }
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("Authorization", () => {
        it("should show login HTML page", async () => {
            const application = await createApplicationFixture();
            const response = await server.inject({
                url: `/oauth/authorize?client_id=${application.clientId}&redirect_uri=${application.redirectUris[0].redirectUri}&response_type=code&scopes=test&state=1234`,
            });
            expect(response.statusCode).toBe(200);
            expect(response.headers["content-type"]).toBe("text/html");
        })
        it("should raise error if client_id is missing", async () => {
            const application = await createApplicationFixture();
            const response = await server.inject({
                url: `/oauth/authorize?redirect_uri=${application.redirectUris[0].redirectUri}&response_type=code&scopes=test&state=1234`,
            });
            expect(response.statusCode).toBe(400);
        });
        it("should raise error if redirect_uri is missing", async () => {
            const application = await createApplicationFixture();
            const response = await server.inject({
                url: `/oauth/authorize?client_id=${application.clientId}&response_type=code&scopes=test&state=1234`,
            });
            expect(response.statusCode).toBe(400);
        });
        it("should raise error if response_type is missing", async () => {
            const application = await createApplicationFixture();
            const response = await server.inject({
                url: `/oauth/authorize?client_id=${application.clientId}&redirect_uri=${application.redirectUris[0].redirectUri}&scopes=test&state=1234`,
            });
            expect(response.statusCode).toBe(400);
        });
        it("should raise error if scopes is missing", async () => {
            const application = await createApplicationFixture();
            const response = await server.inject({
                url: `/oauth/authorize?client_id=${application.clientId}&redirect_uri=${application.redirectUris[0].redirectUri}&response_type=code&state=1234`,
            });
            expect(response.statusCode).toBe(400);
        });
        it("should return authorization code", async () => {
            const application = await createApplicationFixture();
            const data = {
                email: application.user.email,
                password: 'changethat',
                clientId: application.clientId,
                redirectUri: application.redirectUris[0].redirectUri,
                responseType: 'code',
                scopes: 'test',
                state: "1234"
            }
            const response = await server.inject({
                url: `/oauth/authorize`,
                method: 'POST',
                payload: data
            });
            expect(response.statusCode).toBe(200);
            expect(response.json()).toHaveProperty("redirect_url");
            const url = new URL(response.json().redirect_url);
            expect(url.searchParams.get("code")).not.toBeNull();
            expect(url.searchParams.get("state")).toBe("1234");
        });

        it("should fail with bad credentials", async () => {
            const application = await createApplicationFixture();
            const data = {
                email: application.user.email,
                password: 'badpassword',
                clientId: application.clientId,
                redirectUri: application.redirectUris[0].redirectUri,
                responseType: 'code',
                scopes: 'test',
                state: "1234"
            }
            const response = await server.inject({
                url: `/oauth/authorize`,
                method: 'POST',
                payload: data
            });
            expect(response.statusCode).toBe(404);
        })

        it("should fail with bad redirect_uri", async () => {
            const application = await createApplicationFixture();
            const data = {
                email: application.user.email,
                password: 'changethat',
                clientId: application.clientId,
                redirectUri: 'https://badurl.com',
                responseType: 'code',
                scopes: 'test',
                state: "1234"
            }
            const response = await server.inject({
                url: `/oauth/authorize`,
                method: 'POST',
                payload: data
            });
            expect(response.statusCode).toBe(401);
        });

        it("should fail with bad client_id", async () => {
            const application = await createApplicationFixture();
            const data = {
                email: application.user.email,
                password: 'changethat',
                clientId: 'badclientid',
                redirectUri: application.redirectUris[0].redirectUri,
                responseType: 'code',
                scopes: 'test',
                state: "1234"
            }
            const response = await server.inject({
                url: `/oauth/authorize`,
                method: 'POST',
                payload: data
            });
            expect(response.statusCode).toBe(401);
        });

        it("should fail with bad response_type", async () => {
            const application = await createApplicationFixture();
            const data = {
                email: application.user.email,
                password: 'changethat',
                clientId: application.clientId,
                redirectUri: application.redirectUris[0].redirectUri,
                responseType: 'badresponse',
                scopes: 'test',
                state: "1234"
            }
            const response = await server.inject({
                url: `/oauth/authorize`,
                method: 'POST',
                payload: data
            });
            expect(response.statusCode).toBe(401);
        });

        it("should return access token", async () => {
            const code = await createAuthorizationCodeFixture();
            const response = await server.inject({
                url: `/oauth/token`,
                method: 'POST',
                payload: {
                    code: code.code,
                    clientId: code.application.clientId,
                    clientSecret: code.application.clientSecret
                }
            });
            expect(response.statusCode).toBe(200);
            expect(response.json()).toHaveProperty("access_token");
            expect(response.json()).toHaveProperty("scope");
            expect(response.json()).toHaveProperty("expires_in");
        })

        it("should fail with bad code", async () => {
            const code = await createAuthorizationCodeFixture();
            const response = await server.inject({
                url: `/oauth/token`,
                method: 'POST',
                payload: {
                    code: 'badcode',
                    clientId: code.application.clientId,
                    clientSecret: code.application.clientSecret
                }
            });
            expect(response.statusCode).toBe(404);
        });

        it("should fail with bad client_id", async () => {
            const code = await createAuthorizationCodeFixture();
            const response = await server.inject({
                url: `/oauth/token`,
                method: 'POST',
                payload: {
                    code: code.code,
                    clientId: 'badclientid',
                    clientSecret: code.application.clientSecret
                }
            });
            expect(response.statusCode).toBe(401);
        });

        it("should fail with bad client_secret", async () => {
            const code = await createAuthorizationCodeFixture();
            const response = await server.inject({
                url: `/oauth/token`,
                method: 'POST',
                payload: {
                    code: code.code,
                    clientId: code.application.clientId,
                    clientSecret: 'badclientsecret'
                }
            });
            expect(response.statusCode).toBe(401);
        });
    });


})
