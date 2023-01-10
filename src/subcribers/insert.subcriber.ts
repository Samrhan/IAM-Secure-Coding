import {EntitySubscriberInterface, EventSubscriber, InsertEvent, ObjectLiteral, UpdateEvent} from "typeorm";
import {validateOrReject, ValidationError} from "class-validator";

@EventSubscriber()
export class InsertSubscriber implements EntitySubscriberInterface {

    async beforeInsert(event: InsertEvent<object>) {
        await this.validateEntity(event.entity);
    }

    async beforeUpdate(event: UpdateEvent<object>) {
        await this.validateEntity(event.entity);
    }

    async validateEntity(entity: ObjectLiteral | undefined){
        // Only validate if the entity TypeORM is about to update does exist
        // Indeed, for relations, TypeORM will call this with event.entity = undefined which would make the validation fail
        if (entity) {
            await validateOrReject(entity).catch((errors: ValidationError[]) => {
                throw errors;
            })
        }
    }
}
