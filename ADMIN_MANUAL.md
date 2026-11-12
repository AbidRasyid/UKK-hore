# Buku Panduan Admin

Panduan khusus untuk mengelola akun petugas dan data nasabah, memeriksa permintaan PIN, serta meninjau jurnal dan aktivitas aplikasi.

Untuk petunjuk login, navigasi, arti status, pemecahan masalah umum, dan keamanan, lihat [Panduan Pengguna E-Teller Bank Mini](./PANDUAN_PENGGUNA.md).

## Alur kerja singkat

1. Masuk menggunakan akun admin/administrator.
2. Periksa dashboard dan aktivitas terbaru.
3. Kelola akun petugas serta aksesnya.
4. Perbarui data nasabah melalui menu Accounts.
5. Tinjau permintaan PIN dan jurnal sesuai kebutuhan.
6. Teruskan persoalan transaksi atau laporan kepada supervisor/pengelola yang berwenang.

## Membuat dan mengelola akun petugas

### Membuat satu akun

1. Buka **Users**, lalu pilih **Add User**.
2. Isi nama lengkap, username, password, dan role.
3. Jika membuat akun teller, isi informasi teller tambahan yang diwajibkan aplikasi.
4. Simpan dan pastikan akun muncul pada daftar.
5. Sampaikan kredensial langsung kepada pemilik akun menggunakan cara yang aman.

### Mengubah atau menonaktifkan akses

1. Cari pengguna pada daftar **Users**.
2. Pilih edit untuk memperbarui data yang tersedia.
3. Gunakan tindakan blokir/aktifkan hanya setelah memverifikasi akun dan alasan perubahan.
4. Pastikan pesan berhasil muncul dan status daftar berubah.

Jangan membagikan password melalui grup umum. Jangan mengaktifkan kembali akun yang dinonaktifkan tanpa memastikan kewenangan dan kebutuhan pemiliknya.

## Mengelola akun nasabah

1. Buka **Accounts**.
2. Cari nasabah dengan nama, NIS, nomor rekening, atau jurusan.
3. Pilih **Add Customer** untuk membuat akun atau tindakan edit pada baris nasabah untuk memperbarui data.
Jangan memasukkan informasi nasabah yang tidak diminta aplikasi. Pastikan identitas dan nomor rekening benar sebelum memperbarui data.

## Meninjau permintaan PIN

1. Buka **PIN Requests**.
2. Cari permintaan dan gunakan filter status.
3. Verifikasi identitas pemilik akun dan konteks permintaan melalui prosedur yang berlaku.
4. Ubah status hanya jika permintaan valid dan admin berwenang melakukannya.
5. Jika tidak yakin, jangan menyetujui; minta pemeriksaan lanjutan.

PIN bersifat rahasia. Admin tidak boleh meminta PIN lengkap dari nasabah.

## Memeriksa aktivitas dan jurnal

1. Tinjau **Dashboard** untuk melihat ringkasan pengguna, nasabah, rekening aktif, dan aktivitas terbaru.
2. Buka **Journals** untuk menelusuri catatan yang perlu diperiksa.
3. Gunakan tanggal, jenis transaksi, jumlah, dan referensi yang tersedia untuk mencocokkan catatan.
4. Jika ada anomali, dokumentasikan referensi yang diperlukan dan eskalasikan kepada supervisor/pengelola.

Jangan mengoreksi saldo atau transaksi langsung tanpa prosedur perubahan resmi dan jejak audit yang sesuai.

## Pemeriksaan sebelum selesai

- [ ] Perubahan akun hanya dilakukan setelah verifikasi.
- [ ] Kredensial awal disampaikan dengan aman.
- [ ] Permintaan PIN diputuskan setelah verifikasi kewenangan.
- [ ] Anomali dicatat menggunakan referensi yang tidak membocorkan kredensial atau PIN.
- [ ] Sesi admin ditutup setelah selesai.
