import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "../../user/entity/user.entity";
import crypto from "crypto";
import {IsBase64, IsDate, IsDefined, IsNotEmpty, IsOptional} from "class-validator";


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

@Entity({name: "session"})
export class SessionEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @IsDefined()
    @ManyToOne(() => UserEntity, {cascade: true})
    @JoinColumn({name: 'user_id'})
    user: UserEntity;

    @IsBase64()
    @IsNotEmpty()
    @Column({length: 512})
    token: string;

    @CreateDateColumn({
        name: "created_at",
        transformer: dateTransformer,
    })
    createdAt: Date;

    @IsDate()
    @IsNotEmpty()
    @Column({
        type: "timestamp without time zone",
        name: "expires_at",
        transformer: dateTransformer
    })
    expiresAt: Date;

    @IsDate()
    @IsOptional()
    @Column({
        type: "timestamp without time zone",
        name: "revoked_at",
        nullable: true,
        transformer: dateTransformer
    })
    revokedAt: Date;

    constructor(user: UserEntity) {
        this.user = user;
        this.token = crypto.randomBytes(384).toString('base64');
        this.expiresAt = new Date(new Date().getTime() + Number(process.env.SESSION_TIMEOUT) * 3600 * 1000);
    }
}
