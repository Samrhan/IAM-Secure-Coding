import {Controller, Inject, Post} from "../lib/dependency-injection";
import {SessionService} from "./session.service";
import {Body} from "../lib/web/utils-decorators/body.decorator";
import {Response} from "../lib/web/utils-decorators/response.decorator";
import {CreateSessionDto} from "./dto/create-session.dto";
import {CustomResponse} from "../lib/web/utils/custom-response.util";
import {Session} from "../lib/web/utils-decorators/session.decorator";
import {SessionEntity} from "./entity/session.entity";
import {Delete} from "../lib/web/request-decorator/delete.decorator";

@Controller()
export class SessionController {

    sessionService: SessionService;

    constructor(@Inject() sessionService: SessionService) {
        this.sessionService = sessionService;
    }

    @Post("/sessions")
    async createSession(@Body() body: CreateSessionDto, @Response() response: CustomResponse) {
        const token = await this.sessionService.createSession(body.email, body.password);
        response.setCookie("sid", token, {
            path: "/",
            httpOnly: true,
            secure: true,
            signed: true,
        });
        return response;
    }

    @Delete("/sessions/current")
    async deleteSession(@Session() session: SessionEntity) {
        await this.sessionService.deleteSession(session);
    }

}