export function Query() {
    return function (target: object, key: string | symbol, parameterIndex: number) {
        Reflect.defineMetadata('query', {index: parameterIndex}, target, key);
    };
}
