import {AppDataSource} from "../../lib/database";
import {DataSource} from "typeorm";
import {UserEntity} from "../../entity/user.entity";
import {ValidationError} from "class-validator";
import * as bcrypt from "bcrypt";

describe('User', function () {
    let dataSource: DataSource;

    beforeAll(async () => {
    })

    afterEach(async () => {
    })

    describe('validations', function () {
        it('should create a new User in database', async () => {
        });

        it('should raise error if email is missing', async function () {
        })


    })

    afterAll(async () => {
        await dataSource.destroy();
    });
})
