import fastify from "fastify";
import cookie from '@fastify/cookie'

const secret = process.env["SESSION_SECRET"];
export const server = fastify();
void server.register(cookie, {
    secret, 
    parseOptions: {}
})

// Does nothing but is necessary for resolving metadata when importing
// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
export function registerController(..._controllers: object[]) {
}



