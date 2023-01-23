import {DataSource} from "typeorm"
import dotenv from 'dotenv';
import {InsertSubscriber} from "../subcribers/insert.subcriber";


dotenv.config({path: '.env'});


export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env["NODE_ENV"] === 'production' ? process.env[`TYPEORM_URL`] : process.env[`TYPEORM_URL_TEST`],
    database: "test",
    synchronize: true,
    logging: false,
    entities: [ process.env["NODE_ENV"] === 'test' ? '**/*.entity.{ts,js}' : '**/*.entity.js'],
    subscribers: [InsertSubscriber],
    migrations: [],
})
