import { Container, Injection } from './container';

export function Controller() {
    return function injectionTarget<T extends { new(...args: any[]): object }>(constructor: T): T | void {
        // replacing the original constructor with a new one that provides the injections from the Container
        const newConstructor = class extends constructor {
            constructor(...args: any[]) {
                const injections = (constructor as any).injections as Injection[];
                if(injections) {
                    const injectedArgs: any[] = injections.map(({key}) => {
                        return Container.get(key);
                    });

                    super(...injectedArgs);
                }
                else {
                    super(...args);
                }
            }
        };

        // Adding the controller to the container
        Container.register(constructor.name, new newConstructor());
        return newConstructor;
    };

}
