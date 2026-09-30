# Project ERD

This ERD covers the core business tables for the savings/transaction system. Laravel framework tables such as `sessions`, `jobs`, and token tables are intentionally omitted for clarity.

```mermaid
erDiagram
    USERS {
        bigint id PK
        string username UK
        string password
        string fullname
        enum role
        enum status
        datetime created_at
        datetime updated_at
    }

    CUSTOMERS {
        bigint id PK
        string account_number UK
        string student_id UK
        string student_name
        string student_class
        bigint balance
        string password
        string pin
        enum status
        datetime created_at
        datetime updated_at
    }

    DAILY_REPORTS {
        bigint id PK
        bigint user_id FK
        date report_date UK
        bigint opening_balance
        bigint total_deposits
        bigint total_withdrawals
        bigint system_balance
        bigint physical_balance
        enum status
        bigint approved_by FK "nullable"
        datetime created_at
        datetime updated_at
    }

    TRANSACTIONS {
        bigint id PK
        bigint customer_id FK
        bigint user_id FK
        bigint daily_report_id FK "nullable"
        date transaction_date
        enum transaction_type
        bigint amount
        datetime created_at
        datetime updated_at
    }

    ACCOUNTING_JOURNALS {
        bigint id PK
        bigint transaction_id FK
        string account_code
        enum position
        bigint amount
        datetime created_at
        datetime updated_at
    }

    CONFIGURATIONS {
        bigint id PK
        string key
        string value
        datetime created_at
        datetime updated_at
    }

    USERS ||--o{ DAILY_REPORTS : creates
    USERS ||--o{ DAILY_REPORTS : approves
    USERS ||--o{ TRANSACTIONS : processes
    CUSTOMERS ||--o{ TRANSACTIONS : performs
    DAILY_REPORTS ||--o{ TRANSACTIONS : groups
    TRANSACTIONS ||--o{ ACCOUNTING_JOURNALS : records
```

## Relationship notes

- A user may create multiple daily reports and perform multiple transactions.
- A customer may have many transactions but each transaction belongs to one customer.
- Each transaction can create multiple accounting journal entries (debit/credit split).
- A daily report may be approved by another user and can include many transactions.
- `configurations` is a generic key/value table used for app settings.
