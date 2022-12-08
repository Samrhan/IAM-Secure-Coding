import { validateOrReject } from "class-validator";
import {PasswordStrength} from "../../decorators/password-strength.validator";

class PasswordStrengthStub {
    constructor(password: string) {
        this.password = password;
    }

    @PasswordStrength()
    password: string;
}

describe('Password strength validator', function () {
    it('Should throw if the password is an empty string', async () => {
        const stub = new PasswordStrengthStub("");
        await expect(validateOrReject(stub)).rejects.toContainEqual(
            expect.objectContaining({
                "property": "password"
            })
        )
    })

    it('Should throw if the password has less than 80 bits of entropy', async () => {
        // Password contains 24 characters, with a character set of length 10, so its binary entropy is ~79.73
        let stub = new PasswordStrengthStub("123456789123456789123456");
        await expect(validateOrReject(stub)).rejects.toContainEqual(
            expect.objectContaining({
                "property": "password"
            })
        )

        // Password contains 14 characters, with a character set of length 52, so its binary entropy is ~79.80
        stub = new PasswordStrengthStub("aBcDeFgHiJkLmN");
        await expect(validateOrReject(stub)).rejects.toContainEqual(
            expect.objectContaining({
                "property": "password"
            })
        )

        // Password contains 12 characters, with a character set of length 94, so its binary entropy is ~78.66
        stub = new PasswordStrengthStub("123456789aB!");
        await expect(validateOrReject(stub)).rejects.toContainEqual(
            expect.objectContaining({
                "property": "password"
            })
        )
    })

    it('Should not throw if the password has more than 80 bits of entropy', async () => {
        // Password contains 25 characters, with a character set of length 10, so its binary entropy is ~83
        let stub = new PasswordStrengthStub("1234567891234567891234567");
        await expect(validateOrReject(stub)).resolves.toBeUndefined()

        // Password contains 15 characters, with a character set of length 52, so its binary entropy is ~85
        stub = new PasswordStrengthStub("aBcDeFgHiJkLmNo");
        await expect(validateOrReject(stub)).resolves.toBeUndefined()

        // Password contains 13 characters, with a character set of length 94, so its binary entropy is ~85
        stub = new PasswordStrengthStub("123456789aB[[");
        await expect(validateOrReject(stub)).resolves.toBeUndefined()
    })
});