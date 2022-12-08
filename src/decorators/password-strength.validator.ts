import {registerDecorator, ValidationOptions} from 'class-validator';

function computeBinaryEntropy(value: string): number {
    let possibleSymbols = 0;

    // Check the size of the character set of the string
    if (/\d/.test(value)) possibleSymbols += 10;    // If it contains a digit, add 10 to the character set since there are 10 digits
    if (/[a-z]/.test(value)) possibleSymbols += 26; // etc...
    if (/[A-Z]/.test(value)) possibleSymbols += 26;
    if (/[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(value)) possibleSymbols += 32;

    // The entropy a string of length L build randomly from a set of N characters is N^L
    // To get the equivalent number of bits a key would need to have to match that entropy, we take the Log2 of that value
    return Math.log2(Math.pow(possibleSymbols, value.length));
}

function validate(value: string): boolean {
    return computeBinaryEntropy(value) >= 80;
}

export function PasswordStrength(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'match',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate
            },
        });
    };
}