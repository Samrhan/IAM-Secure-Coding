import {FastifyReply} from "fastify";
import {ReadStream} from "fs";

/**
 * This class is used to wrap the default response of fastify
 * in order to be table to return it from the controller
 */
export class CustomResponse {
    constructor(private defaultResponse: FastifyReply){
    }

    setCookie(name: string, value: string, options: any) {
        void this.defaultResponse.setCookie(name, value, options);
    }

    send(data: any) {
        return this.defaultResponse.send(data);
    }

    status(statusCode: number) {
        return this.defaultResponse.status(statusCode);
    }

    get cookies(){
        return this.defaultResponse.cookies;
    }

    sendHtml(file: ReadStream){
        return this.defaultResponse.type('text/html').send(file);
    }

    redirect(url: string){
        return this.defaultResponse.redirect(url)
    }
}
