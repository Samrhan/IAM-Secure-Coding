import {RedirectUriEntity} from "../../../oauth/entity/redirect-uri.entity";
import {faker} from "@faker-js/faker";
import {ApplicationEntity} from "../../../oauth/entity/application.entity";
import {AppDataSource} from "../../../lib/database";

function buildRedirectUri(opts: {uri?: string, application: ApplicationEntity}){
    const uri = opts.uri ?? faker.internet.url();
    return new RedirectUriEntity(opts.application, uri);
}

export function createRedirectUri(opts: {uri?: string, application: ApplicationEntity}){
    return AppDataSource.getRepository(RedirectUriEntity).save(buildRedirectUri(opts));
}
