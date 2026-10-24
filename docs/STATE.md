# Status Proyek & Serah-Terima Sesi (STATE.md)

Dokumen satu halaman ini adalah ringkasan status terkini repositori yang wajib dibaca pada awal setiap sesi dan diperbarui saat perintah `checkpoint` diberikan.

---

## 1. Ringkasan Status
- **Tanggal Pembaruan:** Sabtu, 24 Okt 2026
- **Fase Aktif:** Fase B (Deploy Kerangka Selesai) $\rightarrow$ Persiapan Fase C (Preset 3x5 & Nada)
- **Status Audit per Gate:**
  - **Gate 0:** belum ada laporan audit
  - **Gate 1:** laporan docs/audit/gate-1-2026-10-22.md ada (verdict LULUS DENGAN CATATAN, DEC-009 & DEC-010)
  - **Gate 2:** TERTUNDA (menunggu uji preset 3x5 di Fase C dan validasi kuota)
  - **Gate 3:** belum ada laporan audit
  - **Gate 4:** belum ada laporan audit
- **Urutan Jadwal Proyek Terkini (Sabtu 24 Okt 2026):**
  1. **Deploy Kerangka:** Vercel deployment aktif (`https://commit-confessional.vercel.app`), remote smoke test GET selesai. [SELESAI]
  2. **Preset 3x5 dan Nada:** Eksekusi `scripts/preset-runs.mjs` dengan 15 run & evaluasi nada incident report C2. [BERIKUTNYA]
  3. **Landing Page & Kontras WCAG:** Pembangunan `/` (Hero, How It Works, Pricing Cards) dan audit rasio kontras `scripts/check-contrast.mjs`.
  4. **Demo Freeze:** Verifikasi menyeluruh `npm run verify` dan pemberian tag `known-good-gate3`.
  5. **Perekaman Video Demo:** Dijadwalkan hari Minggu, 25 Okt 2026 (durasi 1:45–2:30, tanpa mock).
  6. **Devpost Submission:** Finalisasi teks `docs/SUBMISSION.md` dan pengiriman formulir hari Senin, 26 Okt 2026 (Deadline: 27 Okt 2026, 04.00 WIB).
- **Klaim Terbuka (Open Claims):**
  - **C-002:** Body text contrast ratio memenuhi standar WCAG AA (> 4.5:1) — Target verifikasi: Gate 3 / Fase D
  - **C-013:** Model yang dipakai menghasilkan keluaran valid pada 3 preset x 5 — Target verifikasi: Fase C (`docs/evidence/preset-runs.md`)
  - *(Catatan: C-003/C-012 telah terverifikasi sebagai pernyataan pemilik: Free tier tanpa billing; C-005 ditutup/dikoreksi karena gemini-3.8-flash tidak dipakai).*
- **Hambatan / Isu Aktif:** Kuota harian provider Free tier (500 RPD pada `gemini-3.5-flash-lite`, batas RPM 15) diantisipasi dengan jeda `--spacing-ms=6000` dan pembatasan panggilan harian (maks 40 panggilan).
- **Temuan P0 / P1 Terbuka:** **0**
- **Hash Commit Terakhir:** `5242d7d` (docs: create deployment documentation and remote smoke test script)

---

## 2. Lokasi Penting & Konfigurasi
- **Repositori Git:** `d:\yayaya` (Remote: `https://github.com/Teaquilla/Commit-Confessional`, status: privat)
- **Target URL Deploy:** `https://commit-confessional.vercel.app` (Vercel Production)
- **Model AI Aktif:** `gemini-3.5-flash-lite` (Ditetapkan Zidane via DEC-020, dibaca dari `AI_MODEL_NAME`)
- **Kredensial:** `.env.local` terisolasi dari Git (aturan ignore aktif di `.gitignore`)

---

## 3. Bukti Pengujian Terbaru
- **Remote Smoke Test Publik (`https://commit-confessional.vercel.app`):**
  - `GET /api/health` $\rightarrow$ **HTTP 200** (624 ms, valid `{"ok":true}`).
  - `GET /app` $\rightarrow$ **HTTP 200** (45 ms, valid memuat wordmark antarmuka).
  - Dicatat di `docs/evidence/deploy-smoke.md`.
- **Uji Unit & Integritas Build:**
  - 66 tes lulus pada 24 Okt 2026 (`npm test` $\rightarrow$ **66 pass, 0 fail** across 8 suites).
  - Next.js build sukses (`next build` $\rightarrow$ exit code 0).
  - Skrip verifikasi mekanis `npm run verify` $\rightarrow$ **ALL CHECKS PASSED** (0 secrets, 0 forbidden words, hygiene clean, mock isolation confirmed).
- **Uji Evaluasi Nada C2 & Kuota Model:**
  - 3 preset lolos inferensi di `gemini-3.5-flash-lite` (HTTP 200, 1,8–2,6 detik, mengutip fakta sinyal, tanpa lelucon/emoji/repetisi cause).
  - `docs/evidence/call-budget.md` mencatat 6 panggilan live real-time pada 2026-10-24.

---

## 4. Hal yang BELUM Boleh Dikerjakan (Strict Locks)
1. **DILARANG** menambahkan sistem autentikasi pengguna, basis data persisten multi-tenant, pembayaran, atau webhook GitHub App.
2. **DILARANG** membuka, mencetak, atau menyalin isi berkas `.env*` ke layar atau dokumen.
3. **DILARANG** menjalankan panggilan live ke Gemini API di luar batas yang diizinkan pemilik (`call-budget.md`).
4. **DILARANG** menggunakan mode mock (`AI_MOCK=1`) dalam video rekaman demo resmi.

---

## 5. Pesan Serah-Terima (Handover Message)
> Remote smoke test publik pada `https://commit-confessional.vercel.app` sukses dijalankan untuk GET /api/health (200, 624ms) dan GET /app (200, 45ms). C-003 dimutakhirkan sebagai pernyataan pemilik (Free tier tanpa billing aktif, C-012) dan C-005 ditutup digantikan C-013. Known limitations di README dan spec telah memuat batas kuota harian Free tier (HTTP 429). DEPLOY.md telah memuat verifikasi batas durasi platform. Jadwal diperbarui menuju Fase C (Preset 3x5 & Nada).
