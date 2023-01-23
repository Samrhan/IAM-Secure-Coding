export function Session(sessionTable = 'session') {
    return function (target: object, key: string | symbol, parameterIndex: number) {
        Reflect.defineMetadata('session', {index: parameterIndex, option: sessionTable}, target, key);
    };
}
