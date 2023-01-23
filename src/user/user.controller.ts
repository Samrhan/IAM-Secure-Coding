import {Controller, Inject, Post} from "../lib/dependency-injection";
import {UserService} from "./user.service";
import {Body} from "../lib/web/utils-decorators/body.decorator";
import {CreateUserDto} from "./dto/create-user.dto";
import {UserResponseDto} from "./dto/user-response.dto";
import {Get} from "../lib/web/request-decorator/get.decorator";
import {Session} from "../lib/web/utils-decorators/session.decorator";
import {SessionEntity} from "../session/entity/session.entity";

@Controller()
export class UserController {
    userService: UserService

    constructor(@Inject() userService: UserService) {
        this.userService = userService;
    }

    @Post("users")
    async createUser(@Body() body: CreateUserDto): Promise<UserResponseDto> {
        return new UserResponseDto(
            await this.userService.createUser(
                body.firstname,
                body.lastname,
                body.email,
                body.password,
                body.passwordConfirmation
            )
        );
    }

    @Get("/users/me")
    getMe(@Session() session: SessionEntity) {
        return new UserResponseDto(session.user);
    }
}
