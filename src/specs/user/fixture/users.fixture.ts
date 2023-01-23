import {faker} from '@faker-js/faker'
import {UserEntity} from "../../../user/entity/user.entity";
import {AppDataSource} from "../../../lib/database";

type UserFixtureOptions = Partial<Pick<UserEntity, 'firstname' | 'lastname' | 'email'>>

export function buildUserFixture(opts: UserFixtureOptions = {}) {
    const firstname = opts.firstname ?? faker.name.firstName()
    const lastname = opts.lastname ?? faker.name.lastName()
    const email = opts.email ?? faker.internet.email()
    // that hash matches password 'changethat', hardcoded so we save CPU hasing time
    const passwordHash = '$2a$12$dm2t30Y07Mt9TklkLOuy.efFIJ69WTW3f7NmwH8uioX9R6NHMQSXO'
    return new UserEntity(firstname, lastname, email, passwordHash)
}

export function createUserFixture(opts: UserFixtureOptions = {}) {
    return AppDataSource.getRepository(UserEntity).save(buildUserFixture(opts))
}
