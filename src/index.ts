// init dotenv
import dotenv from 'dotenv';
import {AppDataSource} from "./lib/database";
import {registerController, server} from "./lib/fastify";
import {UserController} from "./user/user.controller";
dotenv.config({path: '.env'});

async function run(){
    await AppDataSource.initialize();
    await server.listen(process.env.FASTIFY_PORT);
    console.log("Server is running on port 3000");
    registerController(UserController)
}

run().catch(err => console.log(err));

