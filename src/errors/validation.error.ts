export class ValidationError extends Error {
    target: object;
    property: string;
    constructor(message: string, target: object, property: string) {
        super(message);
        this.target = target;
        this.property = property;
    }
}
