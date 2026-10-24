# Project References & Third-Party Attributions

Dokumen ini mencatat seluruh dependensi, pustaka perangkat lunak pihak ketiga, model kecerdasan buatan, aset tipografi, dan sumber inspirasi metodologis yang digunakan dalam proyek Commit Confessional.

---

## 1. Model Kecerdasan Buatan (AI Model)

- **Penyedia Layanan:** Google AI Studio (Google DeepMind)
- **Model Aktif:** `gemini-3.5-flash-lite`
  - Tanggal Konfigurasi & Uji: 24 Oktober 2026
  - Bukti Empiris: 15 dari 15 pengujian preset berturut-turut menghasilkan skema valid dan lolos guardrail pada 24 Oktober 2026 (tercatat di `docs/evidence/preset-runs.md`).
  - Kuota Terlihat Dashboard: 15 RPM, 250K TPM, 500 RPD (Free Tier tanpa penagihan aktif).
- **Model Lain yang Diuji (Eksploratori):**
  - `gemini-3.5-flash`: Diuji pada 22 dan 24 Oktober 2026; menghasilkan galat HTTP 503 UNAVAILABLE dan 429 pada pengujian beban berturut-turut (`docs/failures/raw/2026-10-24-F-026.txt`).
  - `gemini-3.8-flash`: Diuji pada 22 Oktober 2026; menghasilkan 2x HTTP 503 dan 8x timeout >20 detik (`docs/evidence/model-probe-2026-10-22.md`).

---

## 2. Pustaka Perangkat Lunak Utama & Lisensi

Lisensi diperiksa langsung dari ruas `"license"` pada berkas `package.json` masing-masing paket di direktori `node_modules`:

| Paket | Versi Terpasang | Lisensi Resmi | Sumber Pemeriksaan |
|---|---|---|---|
| `next` | ^16.4.2 | MIT | `node_modules/next/package.json` |
| `react` | ^19.3.1 | MIT | `node_modules/react/package.json` |
| `react-dom` | ^19.3.1 | MIT | `node_modules/react-dom/package.json` |
| `zod` | ^4.6.7 | MIT | `node_modules/zod/package.json` |
| `tailwindcss` | ^4.3.3 | MIT | `node_modules/tailwindcss/package.json` |
| `typescript` | ^7.0.2 | Apache-2.0 | `node_modules/typescript/package.json` |
| `@tailwindcss/postcss` | ^4.3.3 | MIT | `node_modules/@tailwindcss/postcss/package.json` |
| `postcss` | ^8.5.31 | MIT | `node_modules/postcss/package.json` |
| `autoprefixer` | ^10.6.1 | MIT | `node_modules/autoprefixer/package.json` |

---

## 3. Aset Tipografi

- **IBM Plex Sans:** Digunakan untuk antarmuka pengguna umum dan panel PR Description.
  - Catatan Lisensi: Lisensi belum diverifikasi dari sumber resmi.
- **IBM Plex Mono:** Digunakan untuk masukan diff kode dan panel monospace Incident Report.
  - Catatan Lisensi: Lisensi belum diverifikasi dari sumber resmi.

---

## 4. Paket Keahlian & Alur Kerja (Skill Pack)

- **Skill Pack Hackathon:** `challengepost/learn-ai-basics` (Devpost *Build With AI: Basics*).
  - Dipasang pada Fase 0 untuk memandu metodologi perencanaan, penajaman skop (*flipped interaction*), dan pembatasan bukti PoC.

---

## 5. Sumber Inspirasi & Metodologi Rekayasa

- **Inspirasi Struktur Kerja:** Terinspirasi oleh disiplin pelacakan kegagalan (*failure-driven log*) dan register klaim dari repositori rekan tim (`Teaquilla/Hakaton`).
  - Catatan: Seluruh kode implementasi, skrip verifikasi, dan penanganan alur ditulis secara independen tanpa menyalin berkas atau konten mentah.

---

## 6. Data Sampel Pengujian (Sample Diffs)

- **Penulis:** Tim proyek (Zidane).
- **Sampel:**
  1. `lateNightHotfix`: Perubahan penanganan validasi checkout dengan log commit tergesa-gesa (`src/samples/late-night-hotfix.ts`).
  2. `rebaseConflict`: Resolusi konflik token sesi autentikasi (`src/samples/rebase-conflict.ts`).
  3. `worksOnMachine`: Perbaikan konfigurasi direktori container dan permission (`src/samples/works-on-machine.ts`).
- Seluruh diff dan pesan commit disusun sendiri secara khusus untuk mensimulasikan kepanikan rekayasa perangkat lunak tanpa memuat data rahasia atau kode milik pihak ketiga.
