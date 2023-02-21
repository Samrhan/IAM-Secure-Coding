import {UserEntity} from "../../../user/entity/user.entity";
import {RedirectUriEntity} from "../../../oauth/entity/redirect-uri.entity";
import {ApplicationEntity} from "../../../oauth/entity/application.entity";
import {faker} from "@faker-js/faker";
import crypto from "crypto";
import {createUserFixture} from "../../user/fixture/users.fixture";
import {AppDataSource} from "../../../lib/database";
import {createRedirectUri} from "./redirect-uri.fixture";

type ApplicationFixtureOptions = { name?: string, clientId?: string, clientSecret?: string, user?: UserEntity}

export async function buildApplicationFixture(opts?: ApplicationFixtureOptions) {
    const name = opts.name ?? faker.animal.dog();
    const clientId = opts.clientId ?? crypto.randomBytes(16).toString("hex");
    const clientSecret = opts.clientSecret ?? crypto.randomBytes(32).toString("hex");
    const user = opts.user ?? await createUserFixture();
    return new ApplicationEntity(name, clientId, clientSecret, user);
}

export async function createApplicationFixture(opts?: ApplicationFixtureOptions) {
    const application = await AppDataSource.getRepository(ApplicationEntity).save(await buildApplicationFixture(opts ?? {}));
    const redirectUri = await createRedirectUri({application})
    application.redirectUris = [redirectUri];
    return application
}
