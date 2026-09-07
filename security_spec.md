# Security Specification & Threat Model: ApexCore Bank Management System

## 1. Data Invariants
- **Customers**: Account numbers must be numeric (9-18 digits). Balances must be non-negative.
- **Transactions**: Immutable once created. No updates or deletions allowed.
- **Doorstep Requests**: Require valid customerId, matching account number, non-negative amounts, and lifecycle status progression.
- **Audit Logs**: Append-only. Updates and deletions strictly denied.
- **Settings**: Modifiable only by authorized admin.
- **Admin Privileges**: saic35141@gmail.com and authorized bank admins have supervisory privileges.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Unauthenticated Write**: An unauthenticated user attempting to create a customer account.
2. **Negative Balance Injection**: Customer write payload with negative balance (`balance: -50000`).
3. **Transaction Tampering**: An update request to change the amount of an existing transaction.
4. **Transaction Deletion**: Attempting to delete a ledger transaction.
5. **Ghost Field Injection**: Adding `isAdmin: true` or `bypassedKYC: true` to a customer profile.
6. **Audit Trail Destruction**: Attempting to delete an audit log.
7. **Junk ID Poisoning**: Using a 2KB junk character string as customer document ID.
8. **Doorstep OTP Bypass**: Modifying `verificationOtp` directly during in-flight delivery.
9. **Employee Counter Tampering**: Arbitrary decrementing of completedCount by non-admins.
10. **Spoofed Admin Email**: Modifying admin settings with `email_verified == false`.
11. **Account Number Collision / Spoofing**: Attempting to create an account with malformed account number string.
12. **Blanket Query Scraping**: Attempting an unrestricted list without matching query constraints.
