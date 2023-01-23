import {HttpException} from "./http.exception";

export class UnauthorizedException extends HttpException {
    constructor(response: string) {
        super(response, 401);
    }
}