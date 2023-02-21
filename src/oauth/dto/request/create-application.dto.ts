import {IsNotEmpty, IsString, IsUrl} from "class-validator";
import {Expose} from "class-transformer";

export class CreateApplicationDto{
    @IsString()
    @Expose()
    name: string;

    @IsUrl({require_protocol: true, require_tld: false}, {each: true})
    @IsNotEmpty()
    @Expose()
    redirectUris: string[];
}