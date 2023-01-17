export class Container {
    // holding instances of injectable classes by key
    private static registry: Map<string, any> = new Map();
    static register(key: string, instance: any) {
        if (!Container.registry.has(key)) {
            Container.registry.set(key, instance);
        }
    }

    static get(key: string) {
        return Container.registry.get(key);
    }

}

export interface Injection {
    index: number;
    key: string;
}
