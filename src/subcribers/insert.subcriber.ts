import {EntitySubscriberInterface, EventSubscriber, InsertEvent} from "typeorm";
import {ValidationError} from "class-validator";

@EventSubscriber()
export class InsertSubscriber implements EntitySubscriberInterface {
    async beforeInsert(event: InsertEvent<any>) {
        await event.entity.validateOrReject().catch((errors: ValidationError[]) => {
            throw errors;
        });
    }
}
