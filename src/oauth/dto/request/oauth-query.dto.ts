import {Expose, Transform} from "class-transformer";
import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class OauthQueryDto {
    @IsString()
    @IsNotEmpty()
    @Expose()
    response_type: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    client_id: string;

    @IsString()
    @IsNotEmpty()
    @Expose()
    redirect_uri: string;

    @Transform(({value}) => value.split(' '))
    @IsString({each: true})
    @IsOptional()
    @Expose()
    scopes: string[];

    @IsString()
    @IsOptional()
    @Expose()
    state: string;
}