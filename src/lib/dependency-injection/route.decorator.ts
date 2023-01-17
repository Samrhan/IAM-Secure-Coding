import {Container} from "./container";
import {server} from "../fastify";
import {FastifyReply, FastifyRequest} from "fastify";
import {validateOrReject, ValidationError} from "class-validator";
import {plainToInstance} from "class-transformer";

enum ParamTypes {
    body = 'body'
}

function formatRoute(route: string) {
    if (!route) {
        return "/"
    }
    if (route.charAt(0) !== '/') {
        return `/${route}`
    }
    return route
}

async function defineParameters(paramsTypes: { index: number, paramType: ParamTypes, type: any }[], request: FastifyRequest, reply: FastifyReply) {
    const args = []
    for (let i of paramsTypes) {
        switch (i.paramType) {
            case ParamTypes.body:
                const arg = plainToInstance(i.type, request.body) as object
                await validateOrReject(arg)
                args.push(arg)
        }
    }
    return args;
}

export function Post(uri?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadatas = Reflect.getOwnMetadataKeys(target, propertyKey) as (keyof typeof ParamTypes)[];
        const methodParamTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        const callParams: { index: number, paramType: ParamTypes, type: any }[] = [];
        for (const metadata of metadatas) {
            if (ParamTypes[metadata]) {
                const index = Reflect.getOwnMetadata(metadata, target, propertyKey);
                callParams.push({index, paramType: ParamTypes[metadata], type: methodParamTypes[index]});
            }
        }
        server.post(formatRoute(uri), async (request, reply) => {
            const controller = Container.get(target.constructor.name);
            if (!controller) {
                reply.status(500).send();
                throw new Error("Route must be in a controller");
            }
            let parameters;
            try {
                parameters = await defineParameters(callParams, request, reply);
            } catch (e) {
                if (Array.isArray(e) && e[0] instanceof ValidationError) {
                    if (process.env.NODE_ENV !== 'production') {
                        return reply.status(400).send(e.map((e) => {
                            return Object.values(e.constraints);
                        }))
                    } else {
                        return reply.status(400).send();
                    }
                }
            }
            const resultType = Reflect.getMetadata('design:returntype', target, propertyKey);
            try {
                const resultInstance = plainToInstance(resultType, await controller[propertyKey](...parameters));
                return await validateOrReject(resultInstance).then(() => {
                    return reply.send(resultInstance);
                }).catch((e) => {
                    return reply.status(500).send();
                })
            } catch (e) {
                if (Array.isArray(e) && e[0] instanceof ValidationError) {
                    if (process.env.NODE_ENV !== 'production') {
                        return reply.status(400).send(e.map((e) => {
                            return Object.values(e.constraints);
                        }))
                    } else {
                        return reply.status(400).send();
                    }
                }
                return reply.status(500).send();
            }
        });
    };
}

function isValidInput(input: any, type: any) {
    return input instanceof type;
}
