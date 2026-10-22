# Status Proyek & Serah-Terima Sesi (STATE.md)

Dokumen satu halaman ini adalah ringkasan status terkini repositori yang wajib dibaca pada awal setiap sesi dan diperbarui saat perintah `checkpoint` diberikan.

---

## 1. Ringkasan Status
- **Tanggal Pembaruan:** Kamis, 22 Okt 2026
- **Fase Aktif:** Fase 2 (Build Core Loop) — Dimulai (Gate 1 diterima pemilik via DEC-010)
- **Status Audit per Gate:**
  - **Gate 0:** belum ada laporan audit
  - **Gate 1:** laporan docs/audit/gate-1-2026-10-22.md ada (verdict LULUS DENGAN CATATAN, kualitas pemeriksaan terbatas, lihat DEC-009 & DEC-010)
  - **Gate 2:** belum ada laporan audit
  - **Gate 3:** belum ada laporan audit
  - **Gate 4:** belum ada laporan audit
- **Tujuan Berikutnya:** Menunggu persetujuan pemilik terhadap kontrak [docs/tasks/T-001.md](file:///d:/yayaya/docs/tasks/T-001.md), dilanjutkan implementasi T-001 (parsing & kalkulasi Panic Score deterministik + test suite)
- **Klaim 'Tidak Terbukti' Terbuka (Open Claims):**
  - **C-002:** Body text contrast ratio memenuhi standar WCAG AA (> 4.5:1) — Target verifikasi: Gate 3
  - **C-003:** Hard spending quota dikonfigurasi pada provider AI sebelum deployment — Target verifikasi: Gate 2 (sebelum deployment / T-007a)
  - **C-005:** Model gemini-3.8-flash dapat menghasilkan teks respons yang valid (generateContent) — Target verifikasi: sebelum model dipilih untuk Fase 2 / T-007a
- **Daftar & Urutan Tugas Fase 2 (Disetujui Pemilik):**
  1. **T-001:** Parsing input & kalkulasi Panic Score deterministik + unit test (`tests/panic-score.test.ts`)
  2. **T-002:** Output guardrail validasi nama file terhadap input + unit test (`tests/guardrails.test.ts`)
  3. **T-003:** Skema Zod & AI engine swappable (`generateReport`, batas waktu 28s, retry HTTP 503/429)
  4. **T-004:** Route handler server Next.js `/api/confess` terintegrasi
  5. **T-007a:** Deploy kerangka awal: halaman minimal + `/api/confess` ke server tujuan/Vercel, verifikasi jalur transmisi, dan pembuktian C-003 serta C-005
  6. **T-005:** Antarmuka pengguna dedicated core loop screen `/app` (input, preset chips, loading, ScoreBar, popover, dual panel, copy buttons)
  7. **T-007b:** Verifikasi preset runs 3x5 + pencatatan evaluasi di `docs/evidence/preset-runs.md` (syarat Gate 2)
  8. **T-006:** Halaman landing `/` (Hero, HowItWorks, PricingCards) — dijadwalkan Sabtu, bukan syarat Gate 2
- **Hambatan / Isu Aktif:** Model `gemini-3.8-flash` mengalami lonjakan trafik di sisi server Google (HTTP 503); kredensial dan alur komunikasi `x-goog-api-key` terbukti berfungsi via `gemini-3.5-flash` (HTTP 200)
- **Temuan P0 / P1 Terbuka:** **0** (Temuan P1 auditor pada Gate 1 dikalibrasi ulang sebagai status wajar klaim terbuka sesuai DEC-010)
- **Hash Commit Terakhir:** `7d32e37` (docs: record DEC-010 Gate 1 acceptance and start Fase 2)

---

## 2. Lokasi Penting & Konfigurasi
- **Repositori Git:** `d:\yayaya` (Remote: `https://github.com/Teaquilla/Commit-Confessional`, status: privat)
- **Target URL Deploy:** Self-hosted Linux server dengan HTTPS reverse proxy (Fallback: Vercel Free Plan)
- **Model AI Aktif:** Dikonfigurasi dinamis via `AI_MODEL_NAME` (Target utama: `gemini-3.8-flash`; pembanding teruji: `gemini-3.5-flash`)
- **Kredensial:** `.env.local` terisolasi dari Git (aturan ignore aktif di `.gitignore`)

---

## 3. Bukti Pengujian Terbaru
- **Uji Deterministik Panic Score:**
  - `node --test tests/panic-score.test.ts` $\rightarrow$ **1 pass, 0 fail**.
  - Hasil normalisasi diff-only $>300$ baris: skor **50** (Severity `MAJOR`).
- **Uji Transmisi API (Smoke Test):**
  - `gemini-3.5-flash` $\rightarrow$ **HTTP status 200** (panjang respons: 1152 karakter).
  - `gemini-3.8-flash` $\rightarrow$ **HTTP status 503** (high demand spike).
- **Audit Jejak Kunci Lama & Pemindaian Rahasia:**
  - `git grep` & `git log` $\rightarrow$ **0 kecocokan secret**. Pemindaian mekanis pemilik bersih. Seluruh berkas dokumentasi telah disamarkan (`[key-prefix]`).

---

## 4. Hal yang BELUM Boleh Dikerjakan (Strict Locks)
1. **DILARANG** menulis kode implementasi produk di `src/` sebelum kontrak tugas disetujui oleh pemilik (Zidane).
2. **DILARANG** menambahkan sistem autentikasi pengguna, basis data persisten multi-tenant, pembayaran, atau webhook GitHub App.
3. **DILARANG** merancang logika perpindahan model otomatis (*no automatic fallback*). Model strictly dibaca dari `AI_MODEL_NAME`.
4. **DILARANG** membuka, mencetak, atau menyalin isi berkas `.env*` ke layar atau dokumen.

---

## 5. Pesan Serah-Terima (Handover Message)
> Gate 1 telah resmi diterima oleh pemilik melalui DEC-010 dengan penegasan pemindaian rahasia bersih dan hasil tes unit 100% lulus. Repositori resmi memasuki Fase 2 (Build Core Loop). Daftar tugas T-001 s/d T-007 telah disusun dan kontrak kerja T-001 siap ditinjau untuk persetujuan pemilik sebelum kode produk di `src/` mulai ditulis.
