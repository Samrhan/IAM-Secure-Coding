import {BeforeInsert, Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";
import {IsNotEmpty, IsString, validateOrReject} from "class-validator";
import {ValidationError} from "../errors/validation.error";

@Entity()
@Unique(["email"])
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
    @Column({select: false})
    passwordHash: string;

    constructor(firstname: string, lastname: string, email: string, passwordHash: string) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.passwordHash = passwordHash;
    }
}
