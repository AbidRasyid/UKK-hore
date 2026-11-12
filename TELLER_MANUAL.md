# Teller Manual

## Role overview
Teller is responsible for customer transactions, daily cash operations, and simple account follow-up during the open shift.

## Daily workflow
1. Log in with the teller account.
2. Open a teller shift from the dashboard.
3. Enter the opening cash balance in the shift form.
4. Process customer deposits and withdrawals using the customer transaction page.
5. Confirm the amount and submit the transaction request for PIN verification.
6. Check the customer balance in the transaction list after the request is completed.
7. Close the shift at the end of the workday with the physical cash counted.

## Transaction rules
- Amounts must be positive numeric values.
- The app now stores money-related fields as decimal values to avoid integer truncation or rounding issues.
- Quick amount shortcuts are available for 10,000, 50,000, and 100,000.
- The newest transactions appear first in the list.

## Important notes
- Do not process transactions outside the active teller shift.
- If the balance is not updated immediately, wait for the realtime event or refresh the page once.
- Keep a valid physical cash count before closing the shift.

## Common issues
- If the transaction modal refuses a value, make sure the amount is greater than zero and matches the requested format.
- If the page does not receive updates, confirm that the teller ID is available and the shift is still open.
