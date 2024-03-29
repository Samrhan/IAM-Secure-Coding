import {Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";
import {IsEmail, IsNotEmpty, IsString, validateOrReject} from "class-validator";
import {UniqueInColumn} from "../../decorators/unique-in-column.decorator";
import * as bcrypt from "bcrypt";
import {SetPasswordDto} from "./dto/set-password.dto";

@Entity({name: "user"})
@Unique(["email"])
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsString()
    @Column()
    firstname: string;

    @IsNotEmpty()
    @IsString()
    @Column()
    lastname: string;

    @IsNotEmpty()
    @IsEmail()
    @UniqueInColumn({
        primaryKeys: ['id'],
        caseSensitive: false
    })
    @Column({
        // Force the email to be lowercase
        // Idea from Nicolas Orvain
        transformer: {
            // Use any since `value` can also be a class specific to TypeORM if we have complex where clauses
            to(value: any): any {
                return typeof value === 'string' ? value.toLowerCase() : value;
            },
            from(value: any): any {
                return value
            }
        }
    })
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
        await validateOrReject(dto)
        this.password = await bcrypt.hash(password, 10);
    }

    isPasswordValid(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

}
