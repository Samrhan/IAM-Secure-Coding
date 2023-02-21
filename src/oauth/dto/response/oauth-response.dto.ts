import {IsNotEmpty, IsOptional, IsString, IsUrl} from "class-validator";
import {Expose} from "class-transformer";

export class OauthResponseDto{
    @IsUrl({require_protocol: true, require_tld: false}, {each: true})
    @IsNotEmpty()
    @Expose()
    redirect_url: string;

    constructor(uri: string) {
        this.redirect_url = uri;
    }
}
