### Why should you reset the database before each test case? Give examples of issues you may meet otherwise.

If you don't reset the database before each test case, you may end up with data from a previous test case affecting the current one. For example, if you're testing the functionality of a "add to cart" button on an e-commerce site, and the database is not reset before each test, the cart may already have items in it from a previous test, which would affect the current test.

### What kind of error is currently thrown in test case "should raise error if email is missing"? Is it an SQL error (occurring in the database server) or a validation error before the query got executed? What should it be, so it is easy and secure to format an error message to the end user (considering security, message internationalization, etc.)?

This a SQL error, because the column “email” is non nullable. We should use server-side validations so it’s easier to parse et format error messages, and we don’t take the risk to leak the database error to the client.

### Why do we need both a database constraint and a validation in typescript for the same check?

We use both database constraint and typescript constraint first because it’s a business rules, and business rules should be managed by the business domain, and because it’s easier to manage error messages and internationalization manually in the code.

### How models validations, such as the one you just wrote, can serve the security of your application? Give an example. In addition, which database mechanism can be leveraged for security hardening in case a validation fails (ex. while persisting 2 entities in response to the same action)? Clue: the mechanism I am thinking about could also operate on afterUpdate subscriptions.

These model validations make our application more secure because it makes it easier to deal with errors. Database error messages are complicated to work with and susceptible to change (if one of the table or column changes name, type and so on). Thus, needing to parse back the error from the database may break easily. Moreover, letting the database deal with errors opens the possibility of leaking a database stack trace to the API caller, which we must avoid.

If we chain two insertions, updates and so on, we run into the risk of having a valid first query, but an invalid second one. In that case, the system would end up in an invalid state where the first entity has been persisted but not the second one. To prevent this, we can use transactions to make a set of operations atomic : either they all succeed, or they all fail. For instance, in a banking application, if the first operation is to insert a new payment, and the second to update the account total, it would be bad to store the payment, but have a bug in the update of the total that would leave it unchanged. If we use a transaction, a problem in the second update will lead to a rejection of the whole transaction and thus revert the insertion of the payment.