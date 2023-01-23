import {IsEmail, IsNotEmpty, IsString} from "class-validator";
import {Expose} from "class-transformer";

export class CreateSessionDto{
    @IsNotEmpty()
    @IsEmail()
    @Expose()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Expose()
    password: string;
}