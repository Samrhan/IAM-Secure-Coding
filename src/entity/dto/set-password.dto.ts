import {IsNotEmpty, IsString} from "class-validator";
import {Match} from "../../decorators/match.decorator";
import {PasswordStrength} from "../../decorators/password-strenght.validator";

export class SetPasswordDto {
    constructor(password: string, confirmation: string) {
        this.password = password;
        this.confirmation = confirmation;
    }

    @IsNotEmpty()
    @IsString()
    @Match("confirmation")
    @PasswordStrength()
    password: string;

    @IsNotEmpty()
    @IsString()
    confirmation: string;
}
