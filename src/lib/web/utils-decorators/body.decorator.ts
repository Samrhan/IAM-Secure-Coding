
export function Body() {
    return function (target: object, key: string | symbol, parameterIndex: number) {
        Reflect.defineMetadata('body', parameterIndex, target, key);
    };
}
