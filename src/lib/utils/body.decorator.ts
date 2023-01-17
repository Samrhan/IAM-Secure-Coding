
export function Body() {
    return function (target: Object, key: string | symbol, parameterIndex: number) {
        Reflect.defineMetadata('body', parameterIndex, target, key);
    };
}
