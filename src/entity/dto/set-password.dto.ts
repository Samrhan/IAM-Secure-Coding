import {IsNotEmpty, IsString} from "class-validator";
import {Match} from "../../decorators/match.decorator";

export class SetPasswordDto {
    constructor(password: string, confirmation: string) {
        this.password = password;
        this.confirmation = confirmation;
    }

    @IsNotEmpty()
    @IsString()
    @Match("confirmation")
    password: string;

    @IsNotEmpty()
    @IsString()
    confirmation: string;
}
