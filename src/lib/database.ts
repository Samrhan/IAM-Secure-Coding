import {DataSource} from "typeorm"
import {UserEntity} from "../user/entity/user.entity";
import dotenv from 'dotenv';
import {InsertSubscriber} from "../subcribers/insert.subcriber";


dotenv.config({path: '.env'});


export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env["NODE_ENV"] === 'production' ? process.env[`TYPEORM_URL`] : process.env[`TYPEORM_URL_TEST`],
    database: "test",
    synchronize: true,
    logging: false,
    entities: ['./**/*.entity.{ts,js}'],
    subscribers: [InsertSubscriber],
    migrations: [],
})
