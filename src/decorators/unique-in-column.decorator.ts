import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';
import {AppDataSource} from "../lib/database";
import {ILike, Not} from "typeorm";

interface UniqueInColumnProps {
    primaryKeys: string[];
    caseSensitive?: boolean;
    targetColumn?: string;
}

export function UniqueInColumn(props?: UniqueInColumnProps, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'uniqueInColumn',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [props],
            validator: {
                async validate(value: any, args: ValidationArguments) {
                    const props = (args.constraints[0] as UniqueInColumnProps);

                    // Get the PK fields names and values
                    const primaryKeys = props.primaryKeys;
                    const primaryKeyValues = primaryKeys.map(key => (args.object as any)[key]);

                    // Get the property field name and value
                    const property = args.property;
                    const propertyValue = args.value;

                    // Get the entity repository
                    const entity = args.targetName;
                    const repository = AppDataSource.getRepository(entity);

                    // Construct the where clause of the select
                    // Always search for rows that have a value in the column {property} matching the given propertyValue. Use the prop to know if the search should be case-sensitive or not
                    const where = {
                        [props?.targetColumn ?? property]: props?.caseSensitive ? propertyValue : ILike(propertyValue)
                    }
                    // If a PK exists, this means the entity is being updated and not created, thus we need to exclude its own row from the select
                    for (let i = 0; i < primaryKeys.length; i++){
                        if (primaryKeyValues[i]) { where[primaryKeys[i]] = Not(primaryKeyValues[i]) }
                    }

                    const entities = await repository.find({
                        where
                    });

                    // If there is no match, then the value of {property} is unique in the column
                    return entities.length === 0;
                }
            },
        });
    };
}
