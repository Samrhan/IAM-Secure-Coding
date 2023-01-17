import {handleListener, ParamType, ParamTypes} from "../listener";

export function Post(uri?: string) {
    return function (target: unknown, propertyKey: string) {
        const metadatas = Reflect.getOwnMetadataKeys(target, propertyKey) as (keyof typeof ParamTypes)[];
        const methodParamTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        const parametersFromMetadata: ParamType[] = [];
        for (const metadata of metadatas) {
            if (ParamTypes[metadata]) {
                const index = Reflect.getOwnMetadata(metadata, target, propertyKey);
                parametersFromMetadata.push({index, paramType: ParamTypes[metadata], type: methodParamTypes[index]});
            }
        }
        handleListener('post', uri, parametersFromMetadata, target, propertyKey);
    };
}

