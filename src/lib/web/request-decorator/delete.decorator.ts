import {handleListener, ParamType, ParamTypes} from "../listener";

export function Delete(uri?: string) {
    return function (target: unknown, propertyKey: string) {
        const metadatas = Reflect.getOwnMetadataKeys(target, propertyKey) as (keyof typeof ParamTypes)[];
        const methodParamTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        const parametersFromMetadata: ParamType[] = [];
        for (const metadata of metadatas) {
            if (ParamTypes[metadata]) {
                const params= Reflect.getOwnMetadata(metadata, target, propertyKey);
                parametersFromMetadata.push({params, paramType: ParamTypes[metadata], type: methodParamTypes[params.index]});
            }
        }
        handleListener('delete', uri, parametersFromMetadata, target, propertyKey);
    };
}

