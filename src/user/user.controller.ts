import {Controller, Inject, Post} from "../lib/dependency-injection";
import {UserService} from "./user.service";
import {Body} from "../lib/utils/body.decorator";
import {CreateUserDto} from "./dto/create-user.dto";
import {UserResponseDto} from "./dto/user-response.dto";

@Controller()
export class UserController {
    userService: UserService

    constructor(@Inject() userService: UserService) {
        this.userService = userService;
    }

    @Post("users")
    async createUser(@Body() body: CreateUserDto): Promise<UserResponseDto> {
        return new UserResponseDto(await this.userService.createUser(body.firstname, body.lastname, body.email, body.password, body.passwordConfirmation));
    }
}
