export function Body() {
    return function (target: object, key: string | symbol, parameterIndex: number) {
        Reflect.defineMetadata('body', {index: parameterIndex}, target, key);
    };
}
