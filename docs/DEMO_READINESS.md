# Lembar Kesiapan Demo & Pengiriman (Demo Readiness)

Dokumen satu halaman ini adalah daftar periksa wajib sebelum perekaman video demo, penetapan Demo Freeze, dan pengiriman akhir ke Devpost.

---

## 1. Daftar Periksa Kesiapan Demo (Demo Checklist)

- [ ] **Aksesibilitas Eksternal:** URL aplikasi publik dapat dibuka (hanya GET terbukti pada `docs/evidence/deploy-smoke.md`; pengujian end-to-end POST /api/confess dari jaringan eksternal belum diuji).
- [x] **Keandalan Model (3x5 Runs):** 3 preset sampel diff telah diuji dan lolos 5 kali berturut-turut (skema JSON valid & lolos guardrail) menggunakan model yang tercatat di `docs/evidence/preset-runs.md` (15/15 lolos pada `gemini-3.5-flash-lite`).
- [x] **Kontras Token Memenuhi 4,5:1:** Pasangan warna token yang dipakai memenuhi rasio 4,5:1 (diperiksa `scripts/check-contrast.mjs`; 9 dari 9 pasangan token warna lulus threshold WCAG AA; bukan pengujian teks yang dirender).
- [ ] **Ketahanan Alur (Graceful Handling):** Pengujian unit penanganan error lulus di `tests/confess.test.ts` via `npm test`; ketahanan live di browser saat perekaman belum diuji secara langsung.
- [ ] **Larangan Mock di Video:** Video demo TIDAK BOLEH memakai mode mock (`AI_MOCK=1`); wajib menggunakan respons panggilan live API atau rekaman cadangan live nyata tanpa mock (perekaman dijadwalkan Minggu, 25 Okt 2026).
- [ ] **Rencana Cadangan (Fallback Strategy):** Telah disiapkan prosedur rekaman cadangan lokal sebagai antisipasi jika koneksi jaringan atau penyedia API mengalami kendala saat perekaman live.
- [ ] **Kebersihan Kredensial, Layar, dan Terminal:** Layar browser, berkas yang terbuka, tab VS Code, dan riwayat terminal bersih dari secret, token API, atau berkas `.env*` saat perekaman video.
- [ ] **Kualitas Visual & Fokus:** Notifikasi sistem operasi dinonaktifkan (*Do Not Disturb*), resolusi rekaman bersih, dan ukuran teks terbaca tajam saat perekaman video.
- [ ] **Struktur Aha-Moment (30 Detik Pertama):** Video menampilkan aksi inti dalam 30 detik awal sesuai `docs/DEMO_SCRIPT.md` (diverifikasi saat video selesai direkam).
- [ ] **Durasi Video Tepat:** Durasi total video berada di rentang **1:45 hingga 2:30 menit** (memenuhi batas resmi aturan Devpost; diverifikasi setelah render video selesai).
- [ ] **Aksesibilitas Tautan Video:** Video diunggah (YouTube/Loom/Vimeo) dengan setelan publik/unlisted dan telah diuji dapat diputar langsung tanpa login dari peramban privat (incognito).
- [ ] **Kesesuaian Klaim:** Setiap narasi yang disampaikan dalam video dan teks pendukung diverifikasi selaras sepenuhnya dengan status `terverifikasi` di `docs/failures/claims-register.md` saat materi final video siap.

---

## 2. Protokol Demo Freeze (Sabtu Malam, Akhir Gate 3)

Setelah Gate 3 dinyatakan lulus, proyek memasuki tahap **Demo Freeze**:
1. Tandai commit stabil dengan tag Git: `git tag known-good-gate3`.
2. **Kunci Kode Produk:** Dilarang menambah fitur baru, mengubah antarmuka, atau melakukan pembersihan kode (refactor).
3. Pengecualian hanya berlaku untuk perbaikan kritis (P0) yang memblokir video atau pengiriman, dan wajib dicatat di `docs/decisions.md` sebelum disentuh.

---

## 3. Daftar Periksa Pengiriman Akhir (Submission Checklist — Gate 4)

- [ ] **Visibilitas Repositori:** Repositori GitHub disetel menjadi **Publik** sebelum formulir submit dikirimkan (saat ini tetap privat sampai hari Senin).
- [x] **Tiga Dokumen Wajib:** Berkas `devpost/scope.md`, `devpost/prd.md`, dan `devpost/spec.md` lengkap, konsisten, dan berstatus `approved`.
- [ ] **Validasi Tautan Silang:** Semua tautan (tautan repositori publik, URL demo aplikasi, tautan video) telah diklik dan diverifikasi berfungsi dari akun/peramban lain (menunggu tautan video demo).
- [ ] **Profil Anggota Tim:** Nama dan detail anggota tim pada formulir pendaftaran Devpost diverifikasi saat submit (Zidane / Teaquilla).
- [ ] **Kepatuhan Aturan Devpost:** Pengecekan akhir bahwa proyek tidak menggunakan materi berhak cipta tanpa lisensi, sesuai tema hackathon, dan mematuhi batas waktu pengiriman (27 Okt 2026, 04.00 WIB) saat submit.
