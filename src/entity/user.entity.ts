import {BeforeInsert, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsNotEmpty, IsString, validateOrReject} from "class-validator";
import {ValidationError} from "../errors/validation.error";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @IsNotEmpty()
    @IsString()
    @Column()
    firstname: string;

    @IsNotEmpty()
    @IsString()
    @Column()
    lastname: string;

    @IsNotEmpty()
    @IsString()
    @Column()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Column()
    passwordHash: string;

    constructor(firstname: string, lastname: string, email: string, passwordHash: string) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.passwordHash = passwordHash;
    }
}
