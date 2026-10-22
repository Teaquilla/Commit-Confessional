# TASK-NNN: [Nama Singkat Tugas]

- **ID Tugas:** TASK-NNN
- **Fase / Gate:** [Fase 2 / Gate 2, dsb.]
- **Status:** DRAFT | SIAP | DALAM PENGERJAAN | SELESAI | DIBATALKAN
- **ID Kegagalan Terkait:** [F-xxx atau 'tidak ada']
- **ID Klaim Terkait:** [C-xxx dari claims-register.md atau 'tidak ada']

---

## 1. Tujuan
Satu hasil akhir konkret yang dapat diamati secara objektif dari luar sistem (misalnya: rute `/api/confess` mengembalikan respons JSON terstruktur valid, atau komponen ScoreBar menampilkan animasi Panic Score).

## 2. Alasan & Kriteria Juri Terkait
Alasan tugas ini dikerjakan sekarang dan kaitannya dengan kriteria penilaian hackathon BWAI Basics:
- **Design:** [kontribusi terhadap estetika, layout, tipografi IBM Plex, atau kejelasan visual]
- **Innovation (Unique Kernel):** [kontribusi terhadap kontras Confession vs PR formal dan Panic Score]
- **Presentation:** [kontribusi terhadap demo video 1-3 menit dan kemudahan dipahami dalam 30 detik pertama]

## 3. Konteks
Latar belakang arsitektur atau keputusan sebelumnya yang menjadi rujukan (rujuk bagian terkait di `devpost/spec.md`, `devpost/prd.md`, atau `docs/decisions.md`).

## 4. Berkas yang Dibaca Dulu
Daftar berkas yang wajib dipelajari sebelum mengubah kode:
- `AGENTS.md`
- `docs/STATE.md`
- `devpost/spec.md` (bagian relevan)
- [berkas target implementasi]

## 5. Persyaratan
Daftar langkah spesifik yang wajib diimplementasikan:
1. ...
2. ...
3. ...

## 6. Di Luar Scope (Explicitly Out of Scope)
Hal-hal yang secara tegas TIDAK boleh disentuh atau ditambahkan dalam tugas ini:
- Dilarang menambah autentikasi, database, atau payment gateway.
- Dilarang refactor kode di luar cakupan langsung tugas ini.
- Dilarang mengubah skema data tanpa pembaruan spec yang disetujui.

## 7. Batasan & Invarian
- **Batasan:** Menggunakan hanya dependensi yang sudah terpasang via lockfile (`npm ci`); dependensi baru memerlukan izin tertulis di `docs/decisions.md`.
- **Invarian yang Wajib Terjaga:**
  1. Berkas `.env*` tidak pernah dibuka, dicetak, atau dimasukkan ke riwayat commit.
  2. Input pengguna dibatasi maksimal 10.000 karakter dan tidak pernah disimpan ke disk atau log server.
  3. Nilai Panic Score deterministik di kode dibatasi pada rentang 0–100.
  4. Perubahan tidak merusak tes yang sudah ada.

## 8. Penanganan Kasus Tepi (Edge Cases)
- **Input Rusak / Tak Masuk Akal:** [cara mendeteksi dan pesan error yang dikembalikan]
- **Batas Waktu (Timeout):** [penanganan jika durasi melampaui batas total 28 detik]
- **Kegagalan Penyedia AI:** [penanganan respons HTTP 503/429, single retry jika sisa waktu >= 10 detik]
- **Hasil Kosong / Malformed Output:** [validasi skema Zod dan penolakan output dengan nama file karangan]

## 9. Kriteria Selesai (Dapat Diamati dari Luar)
Kondisi eksternal yang membuktikan tugas tuntas:
- [ ] Perilaku baru dapat dijalankan dan diamati di lingkungan lokal.
- [ ] Perintah verifikasi (build, lint, test) berjalan bersih tanpa error.
- [ ] Tidak ada regresi pada fitur yang sudah ada sebelumnya.

## 10. Perintah Verifikasi & Bukti Keluaran
Perintah yang dijalankan untuk memvalidasi hasil tugas beserta rekaman output terminal:
- Perintah uji: `npm run lint` / `node --test tests/...` / `npm run build`
- Keluaran terminal yang ditempel:
  ```text
  [Tempelkan keluaran terminal lengkap di sini]
  ```

## 11. Anggaran Perubahan (Change Budget)
- **Estimasi berkas yang diubah:** Maksimal [X] berkas.
- **Estimasi baris kode (diff):** Maksimal ~[Y] baris.
- **Aturan Penghentian:** Jika pekerjaan melampaui estimasi ini secara material, menemukan persyaratan yang bertentangan, memerlukan dependensi baru, atau berisiko melanggar batas scope: **BERHENTI SEGERA DAN TANYA KEPADA ZIDANE (PEMILIK)**.
