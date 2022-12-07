import {EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent} from "typeorm";
import {validateOrReject, ValidationError} from "class-validator";

@EventSubscriber()
export class InsertSubscriber implements EntitySubscriberInterface {
    async beforeInsert(event: InsertEvent<object>) {
        await validateOrReject(event.entity).catch((errors: ValidationError[]) => {
            throw errors;
        });
    }

    async beforeUpdate(event: UpdateEvent<object>) {
        await validateOrReject(event.entity).catch((errors: ValidationError[]) => {
            throw errors;
        })
    }
}
