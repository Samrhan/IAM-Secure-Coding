import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {IsDate, IsNotEmpty, IsString} from "class-validator";
import {ApplicationEntity} from "./application.entity";
import {UserEntity} from "../../user/entity/user.entity";

const dateTransformer = {
    to(value: Date): string | undefined {
        return value?.toISOString()
    },
    from(value: string): Date | undefined {
        if (value) {
            return new Date(value)
        }
    }
}
@Entity({
    name: "authorization_code"
})
export class AuthorizationCodeEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    code: string;

    @Column({name: "scopes"})
    @IsString()
    @IsNotEmpty()
    scopes: string;

    @ManyToOne(() => ApplicationEntity)
    @JoinColumn({name: "application_id"})
    application: ApplicationEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({name: "user_id"})
    user: UserEntity;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @IsDate()
    @IsNotEmpty()
    @Column({
        type: "timestamp without time zone",
        name: "expires_at",
        transformer: dateTransformer
    })
    expiresAt: Date;

    @Column({default: false})
    revoked: boolean;
}
