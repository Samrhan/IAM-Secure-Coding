import {IsEmail, IsNotEmpty, IsString} from "class-validator";
import {Expose} from "class-transformer";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @Expose()
    firstname: string;

    @IsNotEmpty()
    @IsString()
    @Expose()
    lastname: string;

    @IsNotEmpty()
    @IsEmail()
    @Expose()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Expose()
    password: string;

    @IsNotEmpty()
    @IsString()
    @Expose()
    passwordConfirmation: string;

}
