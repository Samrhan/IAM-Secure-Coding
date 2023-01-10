import {EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent} from "typeorm";
import {validateOrReject, ValidationError} from "class-validator";

@EventSubscriber()
export class InsertSubscriber implements EntitySubscriberInterface {
    async beforeInsert(event: InsertEvent<object>) {
        // Only validate if the entity TypeORM is about to insert does exist
        // Indeed, for relations, TypeORM will call this with event.entity = undefined which would make the validation fail
        if (event.entity) {
            await validateOrReject(event.entity).catch((errors: ValidationError[]) => {
                throw errors;
            });
        }
    }

    async beforeUpdate(event: UpdateEvent<object>) {
        // Only validate if the entity TypeORM is about to update does exist
        // Indeed, for relations, TypeORM will call this with event.entity = undefined which would make the validation fail
        if (event.entity) {
            await validateOrReject(event.entity).catch((errors: ValidationError[]) => {
                throw errors;
            })
        }
    }
}
