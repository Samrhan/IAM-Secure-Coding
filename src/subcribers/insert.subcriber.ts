import {EntitySubscriberInterface, EventSubscriber, InsertEvent} from "typeorm";
import {validateOrReject, ValidationError} from "class-validator";

@EventSubscriber()
export class InsertSubscriber implements EntitySubscriberInterface {
    async beforeInsert(event: InsertEvent<any>) {
        await validateOrReject(event.entity).catch((errors: ValidationError[]) => {
            throw errors;
        });
    }
}
