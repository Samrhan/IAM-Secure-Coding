import {Expose} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";

export class AccessTokenDto {
    @IsNotEmpty()
    @IsString()
    @Expose()
    code: string;

    @IsNotEmpty()
    @IsString()
    @Expose()
    clientId: string;

    @IsNotEmpty()
    @IsString()
    @Expose()
    clientSecret: string;

}
