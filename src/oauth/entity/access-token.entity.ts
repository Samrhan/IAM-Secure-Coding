import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "../../user/entity/user.entity";
import {ApplicationEntity} from "./application.entity";

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

@Entity()
export class AccessTokenEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({name: 'access_token'})
    token: string;

    @Column()
    scopes: string;

    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @ManyToOne(() => ApplicationEntity)
    application: ApplicationEntity;

    @Column({
        type: "timestamp without time zone",
        name: "expires_at",
        transformer: dateTransformer
    })
    expiresAt: Date;

    @Column({default: false})
    revoked: boolean;


}
