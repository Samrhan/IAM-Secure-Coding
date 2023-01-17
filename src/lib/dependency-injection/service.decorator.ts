import { Container } from './container';
import 'reflect-metadata';

export function Service() {
    return function(target: any) {
        // get the class name as key
        const key = target.name;
        // register the instance in the Container
        Container.register(key, new target());
    };
}
