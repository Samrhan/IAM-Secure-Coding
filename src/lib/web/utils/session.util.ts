import {AppDataSource} from "../../database";
import {FastifyRequest} from "fastify";
import cookie from "@fastify/cookie";
import {SessionEntity} from "../../../session/entity/session.entity";

/**
 * This shouldn't be here, because framework should be independent of database
 * but in order to simplify the requirements, I will leave it here
 * @param request
 */
export async function getSession(request: FastifyRequest) {
    const id = request.cookies.sid;
    if(id === undefined) {
        return null;
    }
    const token = cookie.unsign(id, process.env.SESSION_SECRET);
    if (!token.valid) {
        return null;
    }
    const session = await AppDataSource.getRepository(SessionEntity).findOne({
        where: {token: token.value},
        relations: ["user"]
    });

    if (session.revokedAt !== undefined) {
        return null;
    }
    if (session.expiresAt < new Date()) {
        return null;
    }
    return session;
}