import {UserEntity} from "../entity/user.entity";
import {IsEmail, IsNotEmpty, IsString, IsUUID} from "class-validator";

export class UserResponseDto {
    constructor({id, firstname, lastname, email}: UserEntity) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
    }

    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    firstname: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
