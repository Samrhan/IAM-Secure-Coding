export class HttpException extends Error {
    response: string;
    status: number;

    constructor(response: string,
                status: number
    ) {
        super();
        this.response = response;
        this.status = status;
        this.initMessage();

    }

    public initMessage() {
        if (typeof this.response === 'string') {
            this.message = this.response;
        } else if (this.constructor) {
            this.message = this.constructor.name
        }
    }
}