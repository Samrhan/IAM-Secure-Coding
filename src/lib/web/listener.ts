import {server} from "../fastify";
import {Container} from "../dependency-injection/container";
import {validateOrReject, ValidationError} from "class-validator";
import {FastifyReply, FastifyRequest} from "fastify";
import {ClassConstructor, plainToInstance} from "class-transformer";
import {HttpException} from "./exceptions/http.exception";
import {CustomResponse} from "./utils/custom-response.util";
import {getSession} from "./utils/session.util";
import {UnauthorizedException} from "./exceptions/unauthorized.exception";

export enum ParamTypes {
    body = 'body',
    query = 'query',
    params = 'params',
    response = 'response',
    session = 'session',
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
    params: { index: number, options: any },
    paramType: ParamTypes,
    type: any
}

function isEmpty(obj: unknown) {
    if (!obj) return true;
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

    let session = null;
    if (paramsTypes.find((paramType) => paramType.paramType === ParamTypes.session)) {
        session = await getSession(request);
        if (session === null) {
            throw new UnauthorizedException("You must be logged in to access this route")
        }
    }

    const args = []
    paramsTypes = paramsTypes.sort((a, b) => a.params.index - b.params.index);
    for (const i of paramsTypes) {
        switch (i.paramType) {
            case ParamTypes.body:
                args.push(await getValidatedObject(i.type, (request.body ?? {}) as object))
                break;
            case ParamTypes.query:
                args.push(await getValidatedObject(i.type, (request.query ?? {}) as object))
                break;
            case ParamTypes.params:
                args.push(await getValidatedObject(i.type, (request.params ?? {}) as object))
                break;
            case ParamTypes.response:
                args.push(new CustomResponse(reply))
                break;
            case ParamTypes.session:
                args.push(session)
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
            } else if (error instanceof HttpException) {
                return reply.status(error.status).send(error.response)
            } else if (error instanceof Error) {
                return reply.status(400).send({message: error.message});
            }
        }
        try {
            // Call the controller method
            const resultInstance = await controller[methodeName](...methodCallParameters)

            // If the controller returns directly the fastify reply return it
            if (resultInstance instanceof CustomResponse) {
                await resultInstance.status(201).send();
            }
            if (resultInstance === undefined) {
                return reply.status(204).send();
            }
            // Ensure the returned object is not a plain object
            if (resultInstance?.constructor === Object) {
                return reply.status(500).send();
            }
            // Validate it
            return await validateOrReject(resultInstance as object)
                .then(() => reply.send(resultInstance))
                .catch(() => reply.status(500).send())
        } catch (error) {
            // If the controller method throw an error, send the right code to the client
            if (Array.isArray(error) && error[0] instanceof ValidationError) {
                if (process.env.NODE_ENV !== 'production') {
                    return reply.status(400).send(error.map((e) => {
                        return Object.values(e.constraints);
                    }))
                } else {
                    return reply.status(400).send();
                }
            } else if (error instanceof HttpException) {
                return reply.status(error.status).send(error.response)
            }
            console.error(error)
            return reply.status(500).send();
        }
    })
}
