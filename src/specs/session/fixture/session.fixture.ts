import {SessionEntity} from "../../../session/entity/session.entity";
import {UserEntity} from "../../../user/entity/user.entity";
import {AppDataSource} from "../../../lib/database";
import {buildUserFixture} from "../../user/fixture/users.fixture";

type SessionFixtureOptions = { user?: UserEntity, expiresAt?: Date, revokedAt?: Date }

export function buildSessionFixture(opts: SessionFixtureOptions = {}) {
    const user = opts.user ?? buildUserFixture()
    const session = new SessionEntity(user)
    if (opts.expiresAt) {
        session.expiresAt = opts.expiresAt
    }
    if (opts.revokedAt) {
        session.revokedAt = opts.revokedAt
    }
    return session
}

export async function createSessionFixture(opts: SessionFixtureOptions = {}) {
    return AppDataSource.getRepository(SessionEntity).save(buildSessionFixture(opts))
}
