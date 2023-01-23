
export function Response() {
    return function (target: object, key: string | symbol, parameterIndex: number) {
        Reflect.defineMetadata('response', {index: parameterIndex}, target, key);
    };
}
