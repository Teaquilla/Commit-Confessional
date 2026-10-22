# Lembar Kesiapan Demo & Pengiriman (Demo Readiness)

Dokumen satu halaman ini adalah daftar periksa wajib sebelum perekaman video demo, penetapan Demo Freeze, dan pengiriman akhir ke Devpost.

---

## 1. Daftar Periksa Kesiapan Demo (Demo Checklist)

- [ ] **Aksesibilitas Eksternal:** URL aplikasi publik dapat dibuka dan digunakan dengan lancar dari perangkat/jaringan lain di luar localhost.
- [ ] **Keandalan Model (3x5 Runs):** 3 preset sampel diff telah diuji dan lolos 5 kali berturut-turut (skema JSON valid & lolos guardrail) menggunakan model yang tercatat di `docs/evidence/preset-runs.md`.
- [ ] **Ketahanan Alur (Graceful Handling):** Tidak ada satu pun respons AI (termasuk timeout atau error 503) yang membuat aplikasi crash atau layar menjadi blank; pesan error tampil tenang dan informatif.
- [ ] **Rencana Cadangan (Fallback Strategy):** Telah disiapkan rekaman video cadangan lokal yang berhasil sebagai antisipasi jika koneksi jaringan atau penyedia API mengalami kendala saat perekaman live.
- [ ] **Kebersihan Kredensial:** Layar browser, berkas yang terbuka, tab VS Code, dan riwayat terminal bersih mutlak dari secret, token API, atau berkas `.env*`.
- [ ] **Kualitas Visual & Fokus:** Notifikasi sistem operasi dinonaktifkan (*Do Not Disturb*), resolusi rekaman bersih, ukuran teks terbaca tajam tanpa zoom berlebih, dan kontras warna memenuhi standar WCAG.
- [ ] **Struktur Aha-Moment (30 Detik Pertama):** Video langsung menampilkan aksi inti dalam 30 detik awal: menempelkan diff/commit berantakan, menekan Confess, lalu memunculkan dua panel berdampingan (Confession kiri, PR formal kanan) bersama Panic Score.
- [ ] **Durasi Video Tepat:** Durasi total video berada di rentang **1 hingga 3 menit** (memenuhi batas resmi aturan Devpost).
- [ ] **Aksesibilitas Tautan Video:** Video diunggah (YouTube/Loom/Vimeo) dengan setelan publik/unlisted dan telah diuji dapat diputar langsung tanpa login dari peramban privat (incognito).
- [ ] **Kesesuaian Klaim:** Setiap narasi yang disampaikan dalam video dan teks pendukung diverifikasi selaras 100% dengan status `terverifikasi` di `docs/failures/claims-register.md`.

---

## 2. Protokol Demo Freeze (Sabtu Malam, Akhir Gate 3)

Setelah Gate 3 dinyatakan lulus, proyek memasuki tahap **Demo Freeze**:
1. Tandai commit stabil dengan tag Git: `git tag known-good-gate3`.
2. **Kunci Kode Produk:** Dilarang menambah fitur baru, mengubah antarmuka, atau melakukan pembersihan kode (refactor).
3. Pengecualian hanya berlaku untuk perbaikan kritis (P0) yang memblokir video atau pengiriman, dan wajib dicatat di `docs/decisions.md` sebelum disentuh.

---

## 3. Daftar Periksa Pengiriman Akhir (Submission Checklist — Gate 4)

- [ ] **Visibilitas Repositori:** Repositori GitHub disetel menjadi **Publik** sebelum formulir submit dikirimkan.
- [ ] **Tiga Dokumen Wajib:** Berkas `devpost/scope.md`, `devpost/prd.md`, dan `devpost/spec.md` lengkap, konsisten, dan berstatus `approved`.
- [ ] **Validasi Tautan Silang:** Semua tautan (tautan repositori publik, URL demo aplikasi, tautan video) telah diklik dan diverifikasi berfungsi dari akun/peramban lain.
- [ ] **Profil Anggota Tim:** Nama dan detail anggota tim pada formulir pendaftaran Devpost sudah terverifikasi benar.
- [ ] **Kepatuhan Aturan Devpost:** Pengecekan akhir bahwa proyek tidak menggunakan materi berhak cipta tanpa lisensi, sesuai tema hackathon, dan mematuhi batas waktu pengiriman (27 Okt 2026, 04.00 WIB).
