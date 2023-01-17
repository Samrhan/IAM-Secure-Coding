import fastify from "fastify";

export const server = fastify();

// Does nothing but is necessary for resolving metadata when importing
// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
export function registerController(..._controllers: object[]){}


