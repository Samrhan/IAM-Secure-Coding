import {UserEntity} from "../entity/user.entity";
import {IsEmail, IsNotEmpty, IsString, IsUUID} from "class-validator";
import { Expose } from "class-transformer";

export class UserResponseDto {
    constructor({id, firstname, lastname, email}: UserEntity) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
    }

    @IsUUID()
    @IsNotEmpty()
    @Expose()
    id: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    firstname: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    lastname: string;

    @IsEmail()
    @IsNotEmpty()
    @Expose()
    email: string;
}
