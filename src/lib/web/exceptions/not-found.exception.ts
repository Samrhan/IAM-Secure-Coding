import {HttpException} from "./http.exception";

export class NotFoundException extends HttpException {
    constructor(response: string) {
        super(response, 404);
    }
}