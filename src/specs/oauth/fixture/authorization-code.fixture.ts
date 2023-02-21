import {ApplicationEntity} from "../../../oauth/entity/application.entity";
import {createApplicationFixture} from "./application.fixture";
import {faker} from "@faker-js/faker";
import {AuthorizationCodeEntity} from "../../../oauth/entity/authorization-code.entity";
import crypto from "crypto";
import {AppDataSource} from "../../../lib/database";

type AuthorizationCodeFixtureOptions = {
    application?: ApplicationEntity,
    scopes?: string,
}
async function buildAuthorizationCodeFixture(opts? :AuthorizationCodeFixtureOptions){
    const application = opts.application ?? await createApplicationFixture();
    const scopes = opts.scopes ?? faker.random.word();
    const entity =  new AuthorizationCodeEntity();
    entity.application = application;
    entity.scopes = scopes;
    entity.code = crypto.randomBytes(32).toString("hex");
    entity.expiresAt = new Date(new Date().getTime() + 15 * 60 * 1000);
    return entity;
}

export async function createAuthorizationCodeFixture(opts? :AuthorizationCodeFixtureOptions){
    return await AppDataSource.getRepository(AuthorizationCodeEntity).save(await buildAuthorizationCodeFixture(opts ?? {}));
}
