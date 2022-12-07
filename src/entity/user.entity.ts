import {BeforeInsert, Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";
import {IsNotEmpty, IsString, validateOrReject, ValidationError} from "class-validator";
import {UniqueInColumn} from "../decorators/unique-in-column.decorator";
import * as bcrypt from "bcrypt";
import {SetPasswordDto} from "./dto/set-password.dto";

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
    @UniqueInColumn()
    @Column()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Column({select: false})
    password: string;

    constructor(firstname: string, lastname: string, email: string, password?: string) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
    }

    async setPassword(password: string, confirmation: string) {
        const dto = new SetPasswordDto(password, confirmation);
        await validateOrReject(dto).catch((errors: ValidationError[]) => {
            throw errors;
        });

        this.password = await bcrypt.hash(password, 10);
    }

}
