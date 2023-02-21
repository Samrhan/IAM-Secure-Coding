import {Column, Entity, Unique, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {RedirectUriEntity} from "./redirect-uri.entity";
import {UserEntity} from "../../user/entity/user.entity";
import {IsNotEmpty, IsString} from "class-validator";

@Entity({name: "application"})
@Unique(["clientId", "clientSecret"])
export class ApplicationEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Column({name: "client_id"})
    @IsString()
    @IsNotEmpty()
    clientId: string;

    @Column({name: "client_secret"})
    @IsString()
    @IsNotEmpty()
    clientSecret: string;

    @OneToMany(() => RedirectUriEntity, r => r.application)
    redirectUris: RedirectUriEntity[];

    @ManyToOne(() => UserEntity)
    @JoinColumn({name: "user_id"})
    user: UserEntity;

    constructor(name: string, clientId: string, clientSecret: string, user: UserEntity) {
        this.name = name;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.user = user;
    }
}