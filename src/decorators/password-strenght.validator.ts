import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';

export function PasswordStrength(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'match',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                 validate(value: any) {
                    const possibleSymbols = 90;
                    const passwordLength = value.length;
                    const entropy = Math.log(Math.pow(possibleSymbols, passwordLength)) / Math.log(2);
                    return entropy >= 80;
                }
            },
        });
    };
}
