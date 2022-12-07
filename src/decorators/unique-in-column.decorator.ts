import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';
import {AppDataSource} from "../lib/database";
import {ILike} from "typeorm";

interface UniqueInColumnProps {
    caseSensitive?: boolean;
    targetColumn?: string;
}

export function UniqueInColumn(props?: UniqueInColumnProps, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'uniqueInColumn',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                async validate(value: any, args: ValidationArguments) {
                    const property = args.property;
                    const entity = args.targetName;
                    const propertyValue = args.value;
                    const repository = await AppDataSource.getRepository(entity);
                    if(!repository) {
                        throw new Error(`Repository for entity ${entity} not found`);
                    }

                    const entities = await repository.findOne({
                        where: {
                            [props?.targetColumn ?? property]: props?.caseSensitive ? propertyValue : ILike(propertyValue)
                        }
                    });
                    return !entities;
                }
            },
        });
    };
}
