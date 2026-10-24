# Claims Register

Register ini mencatat setiap klaim yang menyatakan sesuatu **berfungsi, lulus, aman, atau sudah diuji**, serta setiap janji di landing page atau pricing, sebelum dipakai di README, landing page, atau video demo.

Status yang digunakan:
- `terverifikasi`: Didukung bukti konkrit (file, commit, screenshot, atau log perintah).
- `tidak terbukti`: Belum ada bukti valid pendukung.
- `menyesatkan`: Klaim terbukti salah atau berlebihan.
- `dikoreksi`: Klaim telah diperbaiki di semua lokasi.

---

| ID | Klaim | Lokasi (file / slide / menit video) | Bukti | Status | Catatan |
|---|---|---|---|---|---|
| C-001 | Struktur kerangka repo, AGENTS.md, dan konfigurasi lingkungan awal Fase 0 telah disiapkan | README.md, docs/plan/execution-plan.md | Inisialisasi struktur repo & commit Git Fase 0 | terverifikasi | Inisialisasi awal repositori |
| C-002 | Body text contrast ratio memenuhi standar WCAG AA (> 4.5:1) | devpost/spec.md > 5. Look and Feel Implementation | Pemeriksaan contrast checker sebelum Gate 3 | tidak terbukti | Wajib diverifikasi sebelum Gate 3 |
| C-003 | Hard spending quota dikonfigurasi pada provider AI sebelum deployment | devpost/spec.md > 4. Where It Runs | Pernyataan pemilik di AI Studio (Free tier tanpa billing aktif) | dikoreksi | Diperbarui via C-012: Free tier tanpa kartu kredit/billing; risiko tagihan nihil |
| C-004 | Kredensial lingkungan lokal aman (.env* terabaikan git, tidak terlacak) dan transmisi API terverifikasi | docs/decisions.md > DEC-004, scripts/ | git ls-files kosong, check-ignore aktif, smoke test HTTP 200 (1152 chars) | terverifikasi | Kredensial baru terpasang di .env.local |
| C-005 | Model gemini-3.8-flash dapat menghasilkan teks respons yang valid (generateContent) | devpost/spec.md > 3. Stack, docs/decisions.md > DEC-004 | Ditutup: model tidak dipakai (DEC-020) | dikoreksi | Ditutup: model tidak dipakai, digantikan klaim C-013 |
| C-006 | T-001: 17 tes lulus | docs/log/2026-10-22-05.md, docs/failures/failure-log.md | Log mentah F-008 & eksekusi 17 tes lulus setelah perbaikan di commit 4fb7232 | dikoreksi | Dikoreksi: ada 3 tes yang tadinya gagal (F-008) lalu diperbaiki |
| C-007 | 32 tes lulus pada 22 Okt 2026, lihat keluaran | docs/tasks/T-002.md, docs/STATE.md | Keluaran lengkap eksekusi "node --test tests/guardrails.test.ts tests/panic-score.test.ts" (32 pass, 0 fail) | terverifikasi | 21 tes panic-score dan 11 tes guardrail nama file |
| C-008 | 43 tes lulus pada 22 Okt 2026, lihat keluaran | docs/tasks/T-003.md, docs/STATE.md | Keluaran lengkap eksekusi "npm test" (43 pass, 0 fail) | terverifikasi | 23 tes panic-score, 12 tes guardrail nama file, 8 tes ai-engine |
| C-009 | 58 tes lulus pada 22 Okt 2026, lihat keluaran | docs/tasks/T-004.md, docs/STATE.md | Keluaran lengkap eksekusi "npm test" (58 pass, 0 fail) | terverifikasi | 23 tes panic-score, 12 tes guardrail, 8 tes ai-engine, 15 tes confess/samples |
| C-010 | 59 tes lulus pada 22 Okt 2026, lihat keluaran | docs/log/2026-10-22-12.md, docs/STATE.md | Keluaran lengkap eksekusi "npm test" (59 pass, 0 fail) | terverifikasi | Penambahan tes isolasi galat HTTP di ai-engine |
| C-011 | Pemilik menyatakan key lama sudah dicabut di AI Studio pada 2026-10-22 (pernyataan pemilik, tidak diverifikasi agen) | docs/failures/failure-log.md > F-005 | Pernyataan pemilik | terverifikasi | Pernyataan pemilik, tidak diverifikasi agen |
| C-012 | Project API berada di Free tier; billing belum diaktifkan (dilihat pemilik di AI Studio pada 2026-10-24). Tidak ada tagihan yang mungkin terjadi; risiko yang tersisa adalah kuota habis (HTTP 429). | docs/evidence/deploy-smoke.md, devpost/spec.md > 4 | Pernyataan pemilik di AI Studio pada 2026-10-24 | terverifikasi | Pernyataan pemilik, bukan oleh agen. Tanpa screenshot ke repo demi privasi email dan project ID |
| C-013 | Model yang dipakai menghasilkan keluaran valid pada 3 preset x 5 | devpost/spec.md, docs/evidence/preset-runs.md | Menunggu eksekusi 15 run pada scripts/preset-runs.mjs | tidak terbukti | Pengganti C-005 untuk model aktif; belum terbukti sampai docs/evidence/preset-runs.md terisi |

---

## Adendum Pemutakhiran Klaim (2026-10-24)

### 1. Pemutakhiran C-003 -> C-012
- **Fakta:** Project API berada di Free tier; billing belum diaktifkan (dilihat pemilik di AI Studio pada 2026-10-24). Tidak ada tagihan yang mungkin terjadi; risiko yang tersisa adalah kuota habis (HTTP 429).
- **Status:** `terverifikasi` sebagai pernyataan pemilik, bukan oleh agen.
- **Privasi:** Screenshot dashboard AI Studio tidak diunggah ke repositori karena memuat email pribadi dan project ID pemilik.

### 2. Penutupan C-005 & Klaim Baru C-013
- **C-005:** Ditutup (`dikoreksi`) karena model `gemini-3.8-flash` tidak dipakai (DEC-020).
- **C-013:** "Model yang dipakai menghasilkan keluaran valid pada 3 preset x 5".
- **Status:** `tidak terbukti` sampai pengujian 15 run tuntas dan dicatat di `docs/evidence/preset-runs.md`.


