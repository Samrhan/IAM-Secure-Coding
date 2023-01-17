import 'reflect-metadata';
import { Injection } from './container';
export function Inject() {
    return function(target: object, propertyKey: string | symbol, parameterIndex: number) {
        const key = Reflect.getMetadata('design:paramtypes', target)[parameterIndex].name;

        const injection: Injection = { index: parameterIndex, key };
        const existingInjections: Injection[] = (target as any).injections || [];
        // create property 'injections' holding all constructor parameters, which should be injected
        Object.defineProperty(target, 'injections', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: [...existingInjections, injection]
        });
    };
}
