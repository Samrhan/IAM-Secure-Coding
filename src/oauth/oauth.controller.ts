import {Controller, Inject, Post} from "../lib/dependency-injection";
import {OauthService} from "./oauth.service";
import {Get} from "../lib/web/request-decorator/get.decorator";
import {Query} from "../lib/web/utils-decorators/query.decorator";
import {OauthQueryDto} from "./dto/request/oauth-query.dto";
import {Session} from "../lib/web/utils-decorators/session.decorator";
import {SessionEntity} from "../session/entity/session.entity";
import {Body} from "../lib/web/utils-decorators/body.decorator";
import {CreateApplicationDto} from "./dto/request/create-application.dto";
import {ApplicationResponse} from "./dto/response/application-response.dto";
import {CustomResponse} from "../lib/web/utils/custom-response.util";
import {Response} from "../lib/web/utils-decorators/response.decorator";
@Controller()
export class OauthController {
    private oauthService: OauthService;

    constructor(@Inject() oauthService: OauthService) {
        this.oauthService = oauthService;
    }

    @Post("/oauth/application")
    async createApplication(@Session() session: SessionEntity, @Body() body: CreateApplicationDto) {
        return new ApplicationResponse(await this.oauthService.createApplication(session, body.name, body.redirectUris));
    }

    @Get("/oauth/authorize")
    async authorize(@Query() query: OauthQueryDto, @Response() response: CustomResponse) {
        return response.sendHtml(await this.oauthService.authorize(query.client_id, query.redirect_uri, query.response_type, query.scopes, query.state));
    }
}