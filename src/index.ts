// init dotenv
import dotenv from 'dotenv';
import {AppDataSource} from "./lib/database";
import {registerController, server} from "./lib/fastify";
import {UserController} from "./user/user.controller";
import {SessionController} from "./session/session.controller";
import {OauthController} from "./oauth/oauth.controller";
dotenv.config({path: '.env'});

async function run(){
    await AppDataSource.initialize();
    const port = process.env.FASTIFY_PORT;
    await server.listen(port);
    console.log(`Server is running on port ${port}`);
    registerController(UserController, SessionController, OauthController)
}

run().catch(err => console.log(err));

