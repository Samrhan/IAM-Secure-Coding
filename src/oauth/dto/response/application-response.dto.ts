import {IsNotEmpty, IsString, isUUID, IsUUID} from "class-validator";
import {Expose} from "class-transformer";
import {ApplicationEntity} from "../../entity/application.entity";

export class ApplicationResponse {
    @IsUUID(4)
    @IsNotEmpty()
    @Expose()
    id: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    name: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    clientId: string;

    @IsString({each: true})
    @IsNotEmpty()
    @Expose()
    redirectUris: string[];

    @IsUUID(4)
    @IsNotEmpty()
    @Expose()
    userId: string;

    constructor(applicationEntity: ApplicationEntity) {
        this.id = applicationEntity.id;
        this.name = applicationEntity.name;
        this.clientId = applicationEntity.clientId;
        this.redirectUris = applicationEntity.redirectUris.map(r => r.redirectUri);
        this.userId = applicationEntity.user.id;
        console.log(this)
    }
}