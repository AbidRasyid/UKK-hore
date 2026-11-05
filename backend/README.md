# UKK Hore Backend

Backend API untuk aplikasi sistem tabungan siswa / perbankan sekolah berbasis Laravel. Aplikasi ini menangani autentikasi, manajemen user, data nasabah, transaksi setoran dan penarikan, serta pencatatan jurnal akuntansi.

## Ringkasan Proyek

Proyek ini dirancang untuk mendukung alur operasional berikut:

- Login untuk admin/staf internal
- Login khusus untuk customer siswa
- Role-based access control berdasarkan peran:
  - administrator
  - supervisor
  - teller
- CRUD data user dan customer
- Transaksi deposit dan withdrawal
- Validasi saldo minimum saat penarikan
- Pencatatan jurnal akuntansi otomatis untuk setiap transaksi
- Integrasi dengan Laravel Sanctum untuk autentikasi token

## Teknologi yang Digunakan

- PHP 8.3
- Laravel 13
- Laravel Sanctum
- MySQL / SQLite / database yang didukung Laravel
- Vite untuk asset frontend
- Composer & npm

## Struktur Folder Utama

```bash
backend/
├── app/
│   ├── Http/Controllers/
│   ├── Models/
│   ├── Providers/
│   ├── Status.php
│   ├── UserRole.php
│   └── ...
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
├── public/
├── resources/
├── routes/
│   ├── api.php
│   └── web.php
├── tests/
├── .env.example
├── artisan
├── composer.json
├── package.json
├── phpunit.xml
├── README.md
├── vite.config.js
└── ...
```

## Persyaratan Sistem

Pastikan perangkat Anda sudah terinstall:

- PHP 8.3+
- Composer
- Node.js 18+
- Database server (MySQL/PostgreSQL/SQLite)
- Extension PHP yang dibutuhkan Laravel (PDO, OpenSSL, Mbstring, Tokenizer, XML, Ctype, JSON, BCMath)

## Cara Menjalankan Proyek

1. Masuk ke folder backend

```bash
cd backend
```

2. Salin file environment

```bash
cp .env.example .env
```

3. Atur konfigurasi database di file `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ukk_hore
DB_USERNAME=root
DB_PASSWORD=
```

4. Install dependency PHP dan Node

```bash
composer install
npm install
```

5. Install dependencies, generate the application key, and run the initial migration

```bash
composer run setup
```

> Jika dependency sudah terinstall, Anda dapat menjalankan langkah-langkah tersebut secara terpisah dengan `php artisan key:generate`, `php artisan migrate`, dan `npm install && npm run build`.

6. Jalankan server aplikasi

```bash
php artisan serve
```

Atau jalankan mode development dengan frontend dan background process sekaligus:

```bash
composer run dev
```

## Endpoint Utama

Semua endpoint API berada di prefix `/api`.

### 1. Autentikasi

Endpoint yang membutuhkan autentikasi menggunakan token Sanctum pada header berikut:

```http
Authorization: Bearer <token>
```

#### Login admin/staf

```http
POST /api/login
```

Body:

```json
{
  "username": "admin",
  "password": "password123"
}
```

#### Login customer/siswa

```http
POST /api/customer/login
```

Body:

```json
{
  "student_id": "2024001",
  "password": "secret123"
}
```

### 2. User Management

```http
GET /api/users
GET /api/user/{id}
POST /api/users
PATCH /api/user/{id}/edit
```

Peran user yang didukung:

- administrator
- supervisor
- teller

Status user yang didukung:

- active
- inactive
- blocked

### 3. Customer Management

```http
GET /api/customers
GET /api/customer/{id}
POST /api/customers
PATCH /api/customer/{id}/edit
DELETE /api/customer/{id}/delete
```

### 4. Transaksi teller dan customer

Transaksi menggunakan alur dua langkah. Teller membuat permintaan transaksi, lalu customer mengonfirmasi menggunakan PIN.

#### Teller: membuat permintaan transaksi

```http
POST /api/user/{customer_id}/transaction/initiate
```

Body:

```json
{
    "transaction_type": "deposit",
    "amount": 500000
}
```

  Nilai `transaction_type` yang tersedia adalah `deposit` dan `withdrawal`. Endpoint ini mengembalikan `reference_id` yang berlaku selama 5 menit.

  #### Customer: mengonfirmasi transaksi

```json
  POST /api/customer/{customer_id}/transaction/confirm
  ```

  ```json
  {
    "reference_id": "TRX-uuid",
    "pin": "123456"
  }
  ```

  Customer juga dapat melihat riwayat transaksinya:

  ```http
  GET /api/customer/{customer_id}/transactions
```

Fitur penting:

- cek saldo minimum saat penarikan
- transaksi dijamin dalam satu database transaction
- jurnal akuntansi dibuat otomatis untuk tiap transaksi
- validasi amount > 0

### 5. Shift teller dan laporan harian

Teller harus membuka shift sebelum memproses transaksi. Saat shift ditutup, sistem menghitung saldo sistem dari saldo awal dan transaksi shift, lalu membuat laporan harian untuk ditinjau supervisor. `teller_id` pada permintaan buka shift adalah ID profil teller dan relasinya disimpan pada tabel pivot `shift_teller`.

```http
GET /api/teller/shift
POST /api/teller/shift/open
POST /api/teller/shift/{shift_id}/close
GET /api/daily-reports
GET /api/daily-report/{id}
PATCH /api/daily-report/{id}/approve
```

Body saat membuka shift:

```json
{
  "opening_balance": 1000000,
  "teller_id": 1
}
```

Body saat menutup shift:

```json
{
  "closing_balance": 1300000,
  "system_balance": 1300000,
  "cash_denominations": [
    { "cash_denomination_id": 1, "quantity": 10 },
    { "cash_denomination_id": 2, "quantity": 5 }
  ]
}
```

## Role dan Access Control

Rute dikelompokkan berdasarkan middleware auth dan role:

- Administrator + Supervisor: melihat data user
- Administrator + Teller + Supervisor: melihat data customer
- Administrator: membuat, memperbarui user/customer, dan menghapus customer
- Supervisor: melihat serta menyetujui laporan harian
- Teller: membuat transaksi dan laporan harian
- Customer: mengonfirmasi transaksi dengan PIN dan melihat riwayat transaksinya

## Model Data Utama

### User

Field utama:

- id
- username
- password
- fullname
- role
- status
- timestamps

### Customer

Field utama:

- id
- account_number
- student_id
- student_name
- student_class
- balance
- password
- pin
- status
- timestamps

### Transaction

Field utama:

- id
- customer_id
- user_id
- transaction_date
- transaction_type
- amount
- timestamps

### Accounting Journal

Field utama:

- id
- transaction_id
- account_code
- position
- amount
- timestamps

## Catatan Pengembangan

Proyek ini masih dalam tahap pengembangan. Beberapa bagian seperti route tertentu, validasi, serta fitur ekstensif masih dapat disesuaikan dan dikembangkan sesuai kebutuhan bisnis.

## Perintah Umum

```bash
php artisan test
php artisan migrate
php artisan migrate:fresh --seed
php artisan route:list
php artisan make:controller NamaController
```

## License

Proyek ini menggunakan lisensi default Laravel / MIT sesuai konfigurasi project.
