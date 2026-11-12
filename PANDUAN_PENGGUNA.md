# Panduan Pengguna E-Teller Bank Mini

Panduan ini menjelaskan penggunaan aplikasi web E-Teller Bank Mini untuk **admin**, **teller**, dan **supervisor**. Ikuti bagian sesuai peran akun Anda. Tampilan dapat sedikit berbeda sesuai ukuran layar dan bahasa aplikasi.

> **Batas panduan:** aplikasi web digunakan oleh petugas. Nasabah menggunakan aplikasi mobile Bank Mini untuk melihat saldo, riwayat transaksi, dan menyetujui transaksi dengan PIN.

## Daftar isi

- [Sebelum mulai](#sebelum-mulai)
- [Masuk dan navigasi](#masuk-dan-navigasi)
- [Panduan admin](#panduan-admin)
- [Panduan teller](#panduan-teller)
- [Panduan supervisor](#panduan-supervisor)
- [Status dan pembaruan data](#status-dan-pembaruan-data)
- [Pemecahan masalah](#pemecahan-masalah)
- [Keamanan dan perlindungan data](#keamanan-dan-perlindungan-data)

## Sebelum mulai

Siapkan:

- alamat aplikasi web dari pengelola;
- akun petugas yang masih aktif;
- koneksi internet yang stabil;
- perangkat dengan browser terbaru.

Admin membuat akun petugas. Jika Anda belum memiliki akun atau akun dinonaktifkan, hubungi admin. Jangan menggunakan akun milik orang lain.

## Masuk dan navigasi

1. Buka alamat aplikasi web.
2. Masukkan username dan password, lalu pilih **Masuk**.
3. Halaman utama dan menu yang tersedia mengikuti peran akun.
4. Gunakan menu samping untuk berpindah halaman. Pada layar kecil, buka menu navigasi terlebih dahulu.
5. Untuk mengganti bahasa, gunakan kontrol bahasa pada header jika tersedia.
6. Setelah selesai, pilih **Logout** dari menu akun.

### Menu berdasarkan peran

| Peran | Menu utama |
|---|---|
| Admin / Administrator | Dashboard, Users, Accounts, Journals, PIN Requests |
| Teller | Dashboard, Transactions, Reports; pencarian nasabah dan transaksi tersedia melalui dashboard |
| Supervisor | Dashboard, Reports, Journals, Transactions |

Menu yang tidak tercantum mungkin memang tidak tersedia untuk peran Anda. Jika akses terasa keliru, minta admin memeriksa peran akun.

## Panduan admin

Admin mengelola akun petugas, data nasabah, permintaan PIN, dan pemeriksaan jurnal. Admin tidak menggantikan supervisor dalam meninjau laporan harian.

### Memeriksa dashboard

1. Buka **Dashboard**.
2. Tinjau jumlah pengguna, nasabah, rekening aktif, dan aktivitas terbaru.
3. Gunakan **View all** untuk membuka jurnal jika perlu pemeriksaan lebih lanjut.

Dashboard merupakan ringkasan. Untuk memastikan catatan transaksi, periksa halaman jurnal atau riwayat yang relevan.

### Membuat akun petugas

1. Buka **Users**, lalu pilih **Add User**.
2. Isi nama lengkap, username, password, dan role.
3. Jika role adalah teller, lengkapi juga informasi teller yang diminta, seperti kelas dan nomor telepon.
4. Periksa kembali data, lalu simpan.
5. Berikan username dan password kepada pemilik akun melalui cara yang aman.

### Mengubah akses akun petugas

1. Di halaman **Users**, cari akun menggunakan pencarian.
2. Pilih tindakan edit untuk memperbarui data yang tersedia.
3. Gunakan tindakan blokir/aktifkan untuk menghentikan atau memulihkan akses.
4. Pastikan perubahan status berhasil sebelum menutup halaman.

Menonaktifkan atau memblokir akun menghentikan akses akun tersebut; jangan menghapus atau mengubah akun sebagai pengganti pemeriksaan insiden.

### Mengelola akun nasabah

1. Buka **Accounts**.
2. Cari nasabah dengan nama, NIS, nomor rekening, atau jurusan.
3. Untuk membuat satu akun, pilih **Add Customer**, isi data yang diminta, lalu simpan.
4. Untuk memperbarui data, pilih akun nasabah lalu tindakan edit.
5. Gunakan tindakan status yang tersedia hanya setelah memastikan identitas nasabah dan alasan perubahan.

### Meninjau permintaan PIN

1. Buka **PIN Requests**.
2. Cari permintaan berdasarkan nasabah atau gunakan filter status.
3. Periksa identitas nasabah dan detail permintaan.
4. Ubah status hanya setelah verifikasi sesuai prosedur sekolah.
5. Jika data meragukan atau permintaan tidak dikenal, jangan menyetujuinya; minta klarifikasi melalui jalur resmi.

### Memeriksa jurnal

1. Buka **Journals**.
2. Gunakan pencarian dan filter yang tersedia untuk menemukan catatan.
3. Periksa tanggal, jenis transaksi, jumlah, rekening, dan informasi jurnal terkait.
4. Jika ada perbedaan, catat referensi transaksi dan waktu pemeriksaan, lalu teruskan kepada supervisor/pengelola.

Jangan mengubah atau menyimpulkan catatan keuangan hanya dari tampilan ringkasan.

## Panduan teller

Teller melayani pencarian nasabah, setoran dan penarikan, serta penutupan shift dan pengajuan laporan harian.

### Membuka shift

Shift wajib dibuka sebelum memproses transaksi.

1. Masuk ke **Dashboard** teller.
2. Jika belum ada shift aktif, isi **Opening balance** dengan jumlah uang awal di laci.
3. Pilih anggota teller lain yang ikut dalam shift jika diperlukan. Teller yang sedang masuk harus termasuk dalam tim.
4. Periksa nilainya, lalu pilih **Open Shift**.
5. Pastikan halaman menunjukkan shift aktif dan saldo awal yang benar.

Jangan membuka shift dengan perkiraan saldo. Hitung uang fisik terlebih dahulu. Jika pembukaan shift gagal, pastikan tidak ada shift lain yang masih terbuka.

### Mencari nasabah

1. Pastikan shift aktif.
2. Di dashboard, masukkan nomor rekening, lalu pilih **Search**; atau pilih **Scan QR** dan izinkan akses kamera.
3. Pastikan nama, nomor rekening, dan status nasabah sesuai dengan orang yang dilayani.
4. Jika hasil tidak sesuai, jangan lanjutkan transaksi. Periksa kembali nomor rekening atau lakukan pencarian ulang.

### Memproses setoran atau penarikan

1. Dari hasil pencarian nasabah, buka halaman transaksi nasabah.
2. Pastikan nama dan nomor rekening yang ditampilkan benar.
3. Pilih **Deposit** atau **Withdrawal**.
4. Masukkan jumlah. Tombol nominal cepat tersedia untuk Rp10.000, Rp50.000, dan Rp100.000; jumlah lain dapat dimasukkan pada kolom.
5. Periksa jenis transaksi dan jumlah bersama nasabah, lalu pilih **Send request**.
6. Minta nasabah menyetujui transaksi melalui aplikasi mobile dengan PIN mereka.
7. Tunggu sampai transaksi selesai. Saldo dan riwayat diperbarui ketika server mengonfirmasi transaksi; jangan mengirim transaksi yang sama berulang kali hanya karena pembaruan sedang menunggu.
8. Periksa bahwa transaksi terbaru muncul di urutan paling atas. Untuk mencetak bukti, buka **Transactions** dan pilih **Print receipt** pada transaksi yang benar.

Setoran/penarikan belum berhasil hanya karena permintaan terkirim. Pastikan nasabah menyelesaikan konfirmasi dan aplikasi menunjukkan transaksi selesai.

### Melihat riwayat transaksi teller

1. Buka **Transactions**.
2. Gunakan pencarian dan filter tanggal untuk mempersempit daftar.
3. Daftar menampilkan transaksi terbaru terlebih dahulu.
4. Gunakan **Refresh** bila perlu memperbarui daftar, dan **Export** untuk mengunduh hasil sesuai filter.
5. Sebelum mencetak, pastikan nomor rekening, tanggal, jenis transaksi, dan jumlah pada baris yang dipilih benar.

Ekspor dan struk merupakan salinan informasi. Catatan pada sistem tetap menjadi rujukan utama.

### Menutup shift dan mengajukan laporan

1. Dari dashboard, pilih **Close shift**.
2. Periksa saldo awal, total setoran, total penarikan, dan saldo sistem.
3. Hitung uang fisik per pecahan. Masukkan jumlah lembar/keping pada kolom kuantitas, bukan nilai rupiah.
4. Cocokkan **Counted total** dengan uang yang benar-benar ada.
5. Isi **Closing balance** sesuai hasil hitung dan pilih **Close shift and submit report**.
6. Simpan atau catat status laporan untuk tindak lanjut.

Jika jumlah fisik berbeda dari saldo sistem, hitung ulang. Jangan mengubah angka agar tampak cocok. Laporkan selisih yang tetap ada kepada supervisor dan jelaskan sesuai prosedur.

### Melihat laporan harian

1. Buka **Reports**.
2. Pilih tanggal atau rentang tanggal menggunakan filter.
3. Periksa saldo awal, total setoran, total penarikan, saldo sistem, saldo penutupan, serta status.
4. Buka detail laporan untuk melihat transaksi dan hitungan per pecahan.
5. Jika laporan belum tersedia, pastikan shift sudah ditutup dan filter tanggal benar.

## Panduan supervisor

Supervisor memantau aktivitas teller, memeriksa riwayat transaksi, dan meninjau laporan harian.

### Memantau dashboard dan transaksi

1. Buka **Dashboard** untuk melihat jumlah laporan yang perlu ditinjau dan volume transaksi harian.
2. Buka **Transactions** untuk mencari riwayat transaksi.
3. Gunakan pencarian dan filter tanggal; transaksi terbaru ditampilkan lebih dahulu.
4. Periksa aktivitas yang tidak biasa menggunakan referensi, tanggal, teller, jenis, dan jumlah transaksi.

Dashboard membantu pemantauan, tetapi bukan pengganti pemeriksaan laporan dan bukti yang sesuai.

### Meninjau laporan teller

1. Buka **Reports** dan gunakan pencarian/filter untuk menemukan laporan yang perlu ditinjau.
2. Buka detail laporan.
3. Cocokkan tanggal, teller/tim shift, saldo awal, setoran, penarikan, saldo sistem, saldo penutupan, dan hitungan pecahan.
4. Periksa daftar transaksi yang tercakup dalam laporan.
5. Jika ada perbedaan atau informasi yang belum jelas, hubungi teller sebelum mengambil keputusan.
6. Jika laporan sesuai, pilih **Approve Report**. Jika tidak sesuai, pilih **Reject Report** sesuai prosedur dan sampaikan tindak lanjut yang diperlukan.
7. Pastikan status berubah setelah tindakan.

Persetujuan laporan adalah tindakan operasional penting. Jangan menyetujui laporan hanya berdasarkan ringkasan dashboard atau tekanan untuk menyelesaikan proses.

### Meninjau jurnal

Supervisor dapat membuka **Journals** untuk menelaah catatan transaksi dan informasi akuntansi. Jika ditemukan perbedaan, simpan referensi yang diperlukan dan koordinasikan dengan admin/pengelola tanpa mengubah catatan sumber.

## Status dan pembaruan data

| Status/indikator | Makna dan tindakan |
|---|---|
| **Shift open** | Shift aktif dan transaksi dapat diproses sesuai izin akun. |
| **Draft / Pending** | Laporan belum disetujui atau menunggu peninjauan. Periksa detail sebelum bertindak. |
| **Approved** | Laporan telah disetujui supervisor. |
| **Rejected** | Laporan ditolak untuk tindak lanjut. Hubungi supervisor untuk mengetahui langkah berikutnya. |
| **Active / Blocked / Inactive** | Status akses akun. Hubungi admin bila status tidak sesuai. |
| **Request sent / menunggu konfirmasi** | Permintaan transaksi sudah dikirim, tetapi belum berarti transaksi selesai. Tunggu nasabah mengonfirmasi. |
| **Saldo/riwayat berubah** | Server telah memberikan data terbaru; transaksi paling baru berada di urutan teratas. |

Pembaruan realtime memerlukan koneksi yang aktif. Jika perangkat terputus dari jaringan atau realtime tidak tersedia, muat ulang halaman atau gunakan **Refresh** pada daftar. Pastikan transaksi telah dikonfirmasi sebelum mencoba ulang.

## Pemecahan masalah

| Masalah | Langkah yang disarankan |
|---|---|
| Tidak bisa masuk | Periksa username/password dan koneksi. Jika akun terkunci, nonaktif, atau kredensial tidak diketahui, hubungi admin. |
| Menu tidak terlihat | Pastikan peran akun benar. Minta admin memeriksa akses; jangan menggunakan akun peran lain. |
| Shift tidak dapat dibuka | Pastikan tidak ada shift aktif, jumlah saldo awal valid, dan teller yang masuk termasuk dalam tim shift. |
| Nasabah tidak ditemukan | Periksa nomor rekening atau pindai ulang QR. Pastikan kamera diizinkan. |
| Transaksi masih menunggu | Minta nasabah membuka aplikasi mobile dan menyelesaikan konfirmasi PIN. Jangan kirim ulang transaksi yang sama. |
| Saldo/riwayat belum berubah | Tunggu sebentar, periksa koneksi, lalu refresh data. Jika transaksi belum tercatat atau status tidak jelas, hubungi supervisor/admin dengan referensinya. |
| Laporan tidak muncul | Pastikan shift sudah ditutup dan rentang tanggal/filter benar. |
| Saldo fisik berbeda | Hitung ulang per pecahan. Jika tetap berbeda, catat jumlah selisih dan laporkan kepada supervisor. Jangan menyesuaikan angka tanpa prosedur. |
| Ekspor atau cetak gagal | Coba lagi setelah koneksi pulih. Untuk cetak, periksa printer atau gunakan opsi simpan sebagai PDF bila tersedia. |
| Pesan kesalahan tidak jelas | Catat tindakan yang dilakukan, waktu, halaman, dan referensi yang tidak sensitif. Jangan mengirim password, PIN, token, atau tangkapan layar yang memuat data rahasia. |

## Keamanan dan perlindungan data

- Jangan membagikan password, PIN nasabah, token, atau kode pemulihan kepada siapa pun.
- Jangan meminta nasabah menyebutkan PIN kepada teller. Nasabah memasukkan PIN sendiri di aplikasi mobile.
- Periksa nama dan nomor rekening nasabah sebelum mengirim transaksi.
- Jangan meninggalkan sesi terbuka di perangkat bersama; pilih **Logout** setelah selesai.
- Simpan ekspor, struk, dan data nasabah hanya pada lokasi yang disetujui sekolah, dan hapus salinan yang tidak diperlukan dengan aman.
- Gunakan hanya data yang diperlukan untuk tugas. Jangan mengirim data pribadi ke grup atau kanal publik.
- Laporkan dugaan salah transaksi, selisih kas, atau akses akun yang tidak sah segera melalui jalur resmi sekolah.

Untuk bantuan operasional, hubungi supervisor atau admin sesuai masalah. Jangan mencoba memperbaiki saldo, status laporan, atau catatan transaksi secara manual.
