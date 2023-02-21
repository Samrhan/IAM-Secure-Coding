import {IsNotEmpty, IsNumber, IsString} from "class-validator";
import {Expose} from "class-transformer";

export class TokenResponseDto {
    @IsNotEmpty()
    @IsString()
    @Expose()
    access_token: string;

    @IsNotEmpty()
    @IsString()
    @Expose()
    scope: string;

    @IsNotEmpty()
    @IsNumber()
    @Expose()
    expires_in: number;

    constructor(token: string, scopes: string, expiresIn: number) {
        this.access_token = token;
        this.scope = scopes;
        this.expires_in = expiresIn;
    }
}
