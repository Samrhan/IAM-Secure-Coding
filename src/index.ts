// init dotenv
import {AppDataSource} from "./lib/database";

AppDataSource.initialize().then(() => {
    console.log("Database initialized")
});


