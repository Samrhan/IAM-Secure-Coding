import {SessionEntity} from "../../../session/entity/session.entity";
import {UserEntity} from "../../../user/entity/user.entity";
import {AppDataSource} from "../../../lib/database";
import {buildUserFixture} from "../../user/fixture/users.fixture.spec";

type SessionFixtureOptions = { user?: UserEntity }

export function buildSessionFixture(opts: SessionFixtureOptions = {}) {
    const user = opts.user ?? buildUserFixture()
    return new SessionEntity(user)
}

export async function createSessionFixture(opts: SessionFixtureOptions = {}) {
    return AppDataSource.getRepository(SessionEntity).save(buildSessionFixture(opts))
}
