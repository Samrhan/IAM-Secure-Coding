import Joi from "joi";

const schema = Joi.object({url: Joi.string().uri().required()});
const config = {url: process.env[`TYPEORM_URL`] as string};
const {error, value} = schema.validate(config) as { error: Error, value: { url: string } };
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export {value as config};
