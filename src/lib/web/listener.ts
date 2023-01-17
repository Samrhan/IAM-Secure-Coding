import {server} from "../fastify";
import {Container} from "../dependency-injection/container";
import {validateOrReject, ValidationError} from "class-validator";
import {FastifyReply, FastifyRequest} from "fastify";
import {ClassConstructor, plainToInstance} from "class-transformer";

export enum ParamTypes {
    body = 'body',
    query = 'query',
    params = 'params',
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

export interface ParamType {
    index: number,
    paramType: ParamTypes,
    type: any
}

function isEmpty(obj: unknown) {
    return Object.keys(obj).length === 0;
}

async function defineParameters(paramsTypes: ParamType[], request: FastifyRequest, reply: FastifyReply) {
    if (!isEmpty(request.body) && !paramsTypes.find((paramType) => paramType.paramType === ParamTypes.body)) {
        throw new Error(`The body is not expected in this route`)
    }
    if (!isEmpty(request.query) && !paramsTypes.find((paramType) => paramType.paramType === ParamTypes.query)) {
        throw new Error(`The query is not expected in this route`)
    }
    if (!isEmpty(request.params) && !paramsTypes.find((paramType) => paramType.paramType === ParamTypes.params)) {
        throw new Error(`The params is not expected in this route`)
    }
    const args = []
    for (const i of paramsTypes) {
        switch (i.paramType) {
            case ParamTypes.body:
                args.push(await getValidatedObject(i.type, request.body as object))
                break;
            case ParamTypes.query:
                args.push(await getValidatedObject(i.type, request.query as object))
                break;
            case ParamTypes.params:
                args.push(await getValidatedObject(i.type, request.params as object))
                break;
        }
    }
    return args;
}

async function getValidatedObject(type: ClassConstructor<object>, requestBody: object) {
    const arg: object = plainToInstance(type, requestBody, {excludeExtraneousValues: true})
    await validateOrReject(arg, {forbidUnknownValues: true})
    return arg
}

export function handleListener(routeMethod: 'get' | 'post' | 'put' | 'delete', uri: string, parametersFromMetadata: ParamType[], target: unknown, methodeName: string) {
    server[routeMethod](formatRoute(uri), async (request, reply) => {
        const controller = Container.get(target.constructor.name);
        if (!controller) {
            // The controller is not registered in the container
            await reply.status(500).send();
            throw new Error("Route must be in a controller");
        }
        let methodCallParameters;
        try {
            methodCallParameters = await defineParameters(parametersFromMetadata, request, reply);
        } catch (error) {
            if (Array.isArray(error) && error[0] instanceof ValidationError) {
                if (process.env.NODE_ENV !== 'production') {
                    return reply.status(400).send(error.map((e) => {
                        return Object.values(e.constraints);
                    }))
                } else {
                    return reply.status(400).send();
                }
            } else if (error instanceof Error) {
                return reply.status(400).send({message: error.message});
            }
        }
        try {
            // Call the controller method
            const resultInstance = await controller[methodeName](...methodCallParameters)

            // Ensure the returned object is not a plain object
            if (resultInstance?.constructor === Object) {
                return reply.status(500).send();
            }
            // Validate it
            return await validateOrReject(resultInstance)
                .then(() => reply.send(resultInstance))
                .catch(() => reply.status(500).send())
        } catch (e) {
            // If the controller method throw an error, send the right code to the client
            if (Array.isArray(e) && e[0] instanceof ValidationError) {
                if (process.env.NODE_ENV !== 'production') {
                    return reply.status(400).send(e.map((e) => {
                        return Object.values(e.constraints);
                    }))
                } else {
                    return reply.status(400).send();
                }
            }
            console.error(e)
            return reply.status(500).send();
        }
    })
}
