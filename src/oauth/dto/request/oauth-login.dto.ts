import {IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Expose} from "class-transformer";

export class OauthLoginDto {
    @IsString()
    @IsNotEmpty()
    @Expose()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    password: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    clientId: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    redirectUri: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    responseType: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    scopes: string;

    @IsString()
    @IsOptional()
    @Expose()
    state: string;

}
