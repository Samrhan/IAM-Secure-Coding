import {DataSource} from "typeorm"
import {UserEntity} from "../entity/user.entity";
import * as dotenv from "dotenv";
import {InsertSubscriber} from "../subcribers/insert.subcriber";


dotenv.config();


export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env["NODE_ENV"] === 'production' ? process.env[`TYPEORM_URL`] : process.env[`TYPEORM_URL_TEST`],
    database: "test",
    synchronize: true,
    logging: true,
    entities: [UserEntity],
    subscribers: [InsertSubscriber],
    migrations: [],
})