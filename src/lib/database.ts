import {DataSource} from "typeorm"
import {UserEntity} from "../entity/user.entity";
import {InsertSubscriber} from "../subcribers/insert.subcriber";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env[`TYPEORM_URL`],
    database: process.env[`NODE_ENV`] === 'production' ? 'iam' : "test",
    synchronize: true,
    logging: true,
    entities: [UserEntity],
    subscribers: [InsertSubscriber],
    migrations: [],
})
