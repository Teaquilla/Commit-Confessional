# Decisions & Scope Changelog

Dokumen ini mencatat setiap keputusan arsitektural, teknis, atau penyesuaian scope yang disepakati oleh Pemilik (Zidane) dan Tim.

---

## DEC-001 | 2026-10-20 | Pemilihan Tema Proyek
- **Keputusan:** Menetapkan tema proyek hackathon *Build With AI: Basics* sebagai **Commit Confessional & PR Therapist** dalam kemasan SaaS.
- **Rasional:** Memiliki *Unique Kernel* yang sangat kuat (kontras antara *Confession* komedi vs *PR Description* formal, plus *Panic Score*), bukan sekadar AI code review generik, serta sangat cocok untuk demo video 1-3 menit dengan aha-moment dalam 30 detik pertama.
- **Status:** Disetujui (Zidane).

---

## DEC-002 | 2026-10-20 | Protokol Kolaborasi Multi-Agen
- **Keputusan:** Pembagian peran ketat: Antigravity sebagai Builder (merencanakan, membangun, menulis log), Codex sebagai Auditor Independen (mode read-only, checklist audit di `docs/audit/`), dan Zidane sebagai Pemilik / Pengambil Keputusan.
- **Rasional:** Menjamin integritas proses, objektivitas pengujian, serta validasi ketat di setiap gate (Gate 0 hingga Gate 4).
- **Status:** Disetujui (Zidane).

---

## DEC-003 | 2026-10-20 | Scope Lock & Explicitly Cut
- **Keputusan:** Mengunci batas PoC (*Strict Scope Lock*). "SaaS" diartikan sebagai kemasan visual dan positioning (landing page, visual 3-tier pricing mockup).
- **Daftar Explicitly Cut:**
  1. Autentikasi / user login.
  2. Database multi-tenant / persistent database.
  3. Sistem pembayaran / payment gateway riil.
  4. Integrasi GitHub App webhook langsung.
- **Rasional:** Menjaga fokus implementasi pada core loop berkualitas tinggi yang dapat diselesaikan dalam 2-4 jam kerja aktif sesuai batasan waktu hackathon.
- **Status:** Disetujui (Zidane).

---

## DEC-004 | 2026-10-20 | Pemilihan dan Verifikasi Model AI
- **Keputusan:** Menggunakan provider Google Gemini dengan model yang dikonfigurasi melalui environment variable `AI_MODEL_NAME`.
- **Status Verifikasi Model:**
  - `gemini-3.8-flash`: listed in the model catalog on 2026-10-20; generateContent returned HTTP 503 (high demand); gemini-3.5-flash returned HTTP 200 with the new key.
  - **Catatan Validasi Kemampuan:** Belum dibuktikan bahwa `gemini-3.8-flash` bisa menghasilkan teks (belum ada respons HTTP 200). Kredensial API key baru terbukti dapat melakukan pemanggilan API via `gemini-3.5-flash` (HTTP 200, panjang teks 1152 karakter).
- **Entri Katalog Model (Kueri API 2026-10-20):**
  ```json
  {
    "name": "models/gemini-3.8-flash",
    "supportedGenerationMethods": [
      "generateContent",
      "countTokens",
      "createCachedContent",
      "batchGenerateContent"
    ]
  }
  ```
- **Kebijakan Retry & Tanpa Fallback Otomatis:**
  - Tidak ada perpindahan model otomatis (*no automatic fallback*). Model tetap diambil secara ketat dari `AI_MODEL_NAME`.
  - Jika API mengembalikan HTTP 503 atau 429: dilakukan tepat 1 kali percobaan ulang (*retry*) setelah jeda 1-2 detik, hanya jika sisa waktu dalam batas total 28 detik masih minimal 10 detik.
  - Setiap percobaan ulang dicatat ke console server (hanya kode error HTTP, tanpa isi input/prompt).
- **Kriteria Pemilihan Model untuk Demo Video & README:**
  - Model yang dipakai dalam video demonstrasi dan README wajib lolos 5 kali berturut-turut pada masing-masing dari 3 sample diff (skema JSON valid dan lolos output guardrails). Nama model terpilih dan tanggal pengujian wajib dicatat di sini.
- **Dokumentasi Resmi:** https://ai.google.dev/gemini-api/docs/models/gemini
- **Status:** Disetujui (Zidane).

---

## DEC-005 | 2026-10-20 | Arsitektur Hosting dan Deployment
- **Keputusan:** Deployment produksi utama menggunakan server self-hosted milik rekan tim yang dikelola dengan process manager (`next start` di bawah pm2 / systemd / Docker) dan reverse proxy (nginx / Caddy) dengan HTTPS dan read timeout >= 35 detik. Vercel Free Plan ditetapkan sebagai opsi deployment cadangan (*fallback*).
- **Rasional:** Memberikan kendali infrastruktur penuh, privasi server-side environment variables, dan keandalan timeout eksekusi.
- **Status:** Disetujui (Zidane).

---

## DEC-006 | 2026-10-20 | Pemetaan Poin Panic Score Bertahap (Discrete Step Mapping)
- **Keputusan:** Menggunakan fungsi pemetaan bertahap (step function) diskrit alih-alih kurva matematis kontinu untuk menghitung 5 sinyal Panic Score (contoh: ukuran diff >300 baris = 20 pts, 100–300 baris = 10 pts, <100 baris = 0 pts; sentuhan berkas >= 3 commit = 20 pts, 2 commit = 10 pts; ALL CAPS >= 4 huruf = 10 pts).
- **Rasional:**
  1. **Transparansi & Auditabilitas:** Memudahkan verifikasi manual dan pengujian unit otomatis tanpa ketidakpastian pembulatan angka desimal.
  2. **Menghindari False Precision:** Panic Score adalah heuristik psikologis pengalaman developer, bukan metrik saintifik mutlak; skala kontinu memberikan ilusi akurasi semu.
  3. **Kejelasan UX:** Nilai bulat yang dihasilkan dari tiap tahapan memudahkan developer memahami breakdown alasan di popover *"Why this score?"*.
- **Keluaran Lengkap Perintah Tes (`tests/panic-score.test.ts`):**
  Perintah: `node --test tests/panic-score.test.ts`
  ```text
  ▶ Panic Score - Diff Only Edge Cases
    ✔ computes score 50 (MAJOR) for diff-only input with >300 lines and no other signals (0.62ms)
  ✔ Panic Score - Diff Only Edge Cases (1.1755ms)
  ℹ tests 1
  ℹ suites 1
  ℹ pass 1
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 95.6922
  ```
- **Status:** Disetujui (Zidane).

---

## DEC-007 | 2026-10-22 | Adopsi Tata Kerja dan Berkas Kelayakan Demo (Workflow v3)
- **Keputusan:** Mengadopsi struktur tata kerja rekayasa v3 mencakup pembaruan `AGENTS.md` (alur build terstruktur, protokol recovery, checkpoint serah-terima sesi, aturan dependensi `npm ci`), template kontrak tugas (`docs/tasks/TASK_TEMPLATE.md`), lembar status sesi (`docs/STATE.md`), daftar kelayakan demo & freeze (`docs/DEMO_READINESS.md`), pencatatan bukti evaluasi (`docs/evidence/preset-runs.md` dan `docs/evidence/eval-report.md`), serta kredit referensi (`docs/references.md`).
- **Rasional & Asal Usul:** Terinspirasi dari kerangka kerja repositori rekan tim (`Teaquilla/Hakaton`) guna meningkatkan disiplin eksekusi, kesiapan demo, dan integritas pengujian tanpa menyalin isi berkasnya secara mentah (ditulis ulang dengan kata-kata sendiri sesuai konteks Commit Confessional).
- **Status:** Disetujui (Zidane).

---

## DEC-008 | 2026-10-22 | Status Audit Gate 1, Siklus Tag Git, dan Repositori Remote
- **Keputusan:**
  1. **Status Laporan Audit Gate 1:** Berkas laporan audit lama `docs/audit/gate-1-2026-10-20.md` ditandai **tidak valid** karena tidak mengikuti format standar Bagian 9.3 (tanpa verdict resmi dan tanpa rincian hasil per pemeriksaan). Berkas tersebut **tidak dihapus** dari riwayat untuk menjaga integritas jejak audit (*auditability*), dan akan digantikan oleh audit ulang resmi oleh Auditor Independen.
  2. **Tag Git `known-good-gate1`:** Tag `known-good-gate1` dibuat sementara sebagai penanda checkpoint sebelum pelaksanaan audit Gate 1, dan akan dibuat ulang (*re-tagged*) secara resmi setelah Gate 1 dinyatakan **LULUS** oleh Auditor Independen.
  3. **Konfigurasi Repositori Remote:** Repositori remote resmi beralamat di `https://github.com/Teaquilla/Commit-Confessional` dengan status saat ini **privat**, dan baru akan diubah menjadi publik pada fase submit akhir sesuai aturan Devpost.
- **Rasional:** Menjaga transparansi, mencegah klaim verdict palsu tanpa laporan yang valid, dan mematuhi batasan publikasi hackathon.
- **Status:** Disetujui (Zidane).

---

## DEC-009 | 2026-10-22 | Sinkronisasi Batas Waktu PRD ke 28 Detik dan Evaluasi Keterbatasan Laporan Audit Gate 1
- **Keputusan:**
  1. **Sinkronisasi Batas Waktu PRD:** Memperbarui frasa "Timeout (30s)" pada bagian API Failure di `devpost/prd.md` menjadi "Timeout (28s total deadline)". Ini merupakan perbaikan konsistensi semata agar selaras dengan batas total 28 detik yang telah didefinisikan di `devpost/spec.md` (bagian 3.2.1), dan sama sekali tidak mengubah definisi maupun perilaku produk. Status dokumen `devpost/prd.md` tetap **approved**.
  2. **Penerimaan & Evaluasi Keterbatasan Laporan Audit Gate 1 (2026-10-22):** Kedua laporan audit (`docs/audit/gate-1-2026-10-20.md` dan `docs/audit/gate-1-2026-10-22.md`) dimasukkan ke repositori apa adanya. Berdasarkan evaluasi, laporan `docs/audit/gate-1-2026-10-22.md` yang memberikan verdict "LULUS DENGAN CATATAN" memiliki sejumlah keterbatasan:
     - **Bagian D:** Dinyatakan lulus tanpa melampirkan bukti pemindaian teks/rahasia (*secret scan output*).
     - **Pemeriksaan F1:** Mengalami salah tafsir, di mana perintah `node --test tests/` gagal karena sintaks argumen Node.js test runner terhadap folder tanpa wildcard/berkas spesifik, bukan karena tes unit tidak ada (tes unit deterministik `tests/panic-score.test.ts` ada dan lulus saat dijalankan secara spesifik).
     - **Tiga Temuan P1 Salah Kalibrasi:** Temuan C-002, C-003, dan C-005 dikategorikan P1 padahal ketiga klaim tersebut memang berstatus wajar `tidak terbukti` pada Fase 1 karena ditargetkan untuk diverifikasi pada fase deployment/Gate 3 (bukan cacat pemblokir Gate 1).
     - **Commit Basis Audit:** Commit yang diaudit oleh auditor adalah `e1fb119`, yaitu kondisi repositori sebelum perbaikan berkas tata kerja dan sinkronisasi batas waktu dilakukan.
- **Rasional:** Menjaga transparansi teknis, memelihara jejak historis audit secara utuh, dan mendokumentasikan konteks objektif di balik temuan audit tanpa mengubah integritas berkas laporan asli auditor.
- **Status:** Disetujui (Zidane).

---

## DEC-010 | 2026-10-22 | Penerimaan Gate 1 oleh Pemilik, Pemeriksaan Mekanis, Hasil Tes Unit, dan Koreksi Target Verifikasi Klaim
- **Keputusan:**
  1. **Penerimaan Gate 1:** Gate 1 diterima oleh pemilik dengan keterbatasan (lihat DEC-009). Pemeriksaan mekanis dijalankan pemilik: pemindaian rahasia bersih (satu hit 'AIza' di commit 38eff75 hanya teks perintah pemindaian di docs/plan/execution-plan.md).
  2. **Hasil Tes Unit:** Builder telah menjalankan tes unit deterministik secara langsung di lingkungan lokal dan mengonfirmasi seluruh tes lulus:
     ```text
     ▶ Panic Score - Diff Only Edge Cases
       ✔ computes score 50 (MAJOR) for diff-only input with >300 lines and no other signals (0.6502ms)
     ✔ Panic Score - Diff Only Edge Cases (1.259ms)
     ℹ tests 1
     ℹ suites 1
     ℹ pass 1
     ℹ fail 0
     ℹ cancelled 0
     ℹ skipped 0
     ℹ todo 0
     ℹ duration_ms 83.5341
     ```
  3. **Koreksi Target Verifikasi Klaim (Koreksi terhadap Evaluasi DEC-009):** Sebagai koreksi atas catatan target verifikasi klaim pada DEC-009 (dicatat lewat entri baru ini tanpa menulis ulang dokumen historis):
     - **C-003** (*Hard spending quota dikonfigurasi pada provider AI sebelum deployment*): Wajib terbukti sebelum deployment (Gate 2).
     - **C-005** (*Model gemini-3.8-flash dapat menghasilkan teks respons yang valid (generateContent)*): Wajib terbukti sebelum model dipilih untuk Fase 2.
     - **C-002** (*Body text contrast ratio memenuhi standar WCAG AA (> 4.5:1)*): Hanya klaim ini yang ditargetkan untuk diverifikasi pada Gate 3.
- **Rasional:** Menegaskan kesiapan resmi memasuki Fase 2 (Build Core Loop) dengan parameter verifikasi klaim yang telah dikalibrasi secara tepat sesuai fase pengerjaan.
- **Status:** Disetujui (Zidane).

---

## DEC-011 | 2026-10-22 | Penyempurnaan Spesifikasi Aturan Ekstraksi Token Backtick pada Guardrail Nama File
- **Keputusan:**
  1. Token di dalam backtick (`...`) hanya dianggap sebagai kandidat nama file jika memuat karakter pemisah path `/` ATAU berakhiran salah satu dari 30 ekstensi terdaftar (`ts, tsx, js, jsx, mjs, cjs, py, json, md, css, scss, html, yml, yaml, toml, sh, java, kt, go, rs, c, cpp, h, hpp, php, rb, sql, vue, svelte, txt`).
  2. Pengecualian pemanggilan fungsi: token yang diikuti langsung oleh `(` atau memuat `()` (contoh: `parse()`) adalah pemanggilan fungsi kode, bukan nama berkas.
  3. Pengecualian tetap metode/properti: `res.json`, `req.json`, `response.json`, dan `request.json` secara permanen dikecualikan dari deteksi nama file.
  4. Perubahan ini disepakati sebagai perubahan spesifikasi heuristik guardrail untuk meminimalkan *false positive* terhadap nama variabel/fungsi/modul abstrak, dan bukan kegagalan sistem.
- **Rasional:** Menjaga keandalan guardrail nama file agar tidak salah menandai fungsi atau istilah teknis sah sebagai nama file fiktif, tanpa mengurangi kemampuan menangkap berkas fiktif nyata.
- **Status:** Disetujui (Zidane).

---

## DEC-012 | 2026-10-22 | Inisialisasi Kerangka Kerja Next.js App Router, Tailwind CSS, Zod, dan Pembentukan Lockfile
- **Keputusan:**
  1. Menginisialisasi kerangka aplikasi web Next.js (App Router, TypeScript, Tailwind CSS) langsung di repositori tanpa menimpa direktori yang sudah ada (`docs/`, `devpost/`, `tests/`, `src/lib/`, `AGENTS.md`, `scripts/`).
  2. Ini adalah satu-satunya momen eksekusi `npm install` diperbolehkan untuk membentuk `package-lock.json` awal; seluruh instalasi dependensi setelah ini strictly menggunakan `npm ci`.
  3. Versi dependensi yang terpasang dan terkunci dalam lockfile:
     - `next`: `16.4.2`
     - `react`: `19.3.1`
     - `react-dom`: `19.3.1`
     - `zod`: `4.6.7`
     - `tailwindcss`: `4.3.3`
     - `@tailwindcss/postcss`: `4.3.3`
     - `typescript`: `7.0.2`
     - `@types/node`: `26.6.5`
     - `@types/react`: `19.3.0`
     - `@types/react-dom`: `19.3.0`
     - `postcss`: `8.5.31`
     - `autoprefixer`: `10.6.1`
     Seluruh versi dependensi di atas merupakan rilis publik terbaru pada registry npm per 22 Okt 2026. Ringkasan audit keamanan paket (`npm audit`):
     ```text
     found 0 vulnerabilities
     ```
  4. Menyetel `"type": "module"` di `package.json` dan mengaktifkan `"allowImportingTsExtensions": true` pada `tsconfig.json` sehingga test runner Node.js native (`node --test`) dapat menjalankan berkas `.ts` secara langsung bersamaan dengan build Next.js.
- **Rasional:** Memenuhi arsitektur tumpukan teknologi Fase 2 (T-003) untuk mendukung runtime server RSC, Route Handler `/api/confess`, validasi Zod, dan styling Tailwind tanpa merusak eksekusi suite tes deterministik yang telah ada.
- **Status:** Disetujui (Zidane).

---

## DEC-013 | 2026-10-22 | Pelonggaran Batas Panjang String Skema AIOutput dan PRDescription
- **Keputusan:**
  1. Melonggarkan batas panjang string Zod pada `AIOutputSchema` dan `PRDescriptionSchema` di `src/lib/schema.ts` sedikit di atas batas target yang diminta prompt sistem:
     - `aiAdjustmentReason`: target prompt ~160 karakter $\rightarrow$ batas skema Zod `max(240)`.
     - `whatHappened`, `cause`, `fix`, `lessonsLearned`: target prompt ~160 karakter $\rightarrow$ batas skema Zod `max(300)`.
     - `prSummary`: target prompt ~250 karakter $\rightarrow$ batas skema Zod `max(400)`.
     - Butir `whatChanged` dan `howToCheck`: target prompt ~160 karakter $\rightarrow$ batas skema Zod `max(200)` per item.
- **Rasional:** Mencegah penolakan palsu (*false rejection*) pada respons AI valid yang kebetulan melebihi beberapa karakter dari target deskripsi prompt, sementara tetap menjaga batasan struktural ringkas.
- **Status:** Disetujui (Zidane).

---

## DEC-014 | 2026-10-22 | Penyesuaian ConfessRequestSchema dan Pemotongan Input > 10.000 Karakter
- **Keputusan:**
  1. Menyesuaikan `ConfessRequestSchema` di `src/lib/schema.ts` dari sebelumnya `z.string().min(20).max(10000)` menjadi `z.string().min(1).max(100000)` agar muatan hingga batas raw body 100 KB dapat diterima sebelum tahap pemotongan.
  2. Mengimplementasikan aturan PRD Bagian 5 di `src/lib/confess.ts`: jika input mentah melebihi 10.000 karakter, input tidak ditolak, melainkan dipotong menjadi 10.000 karakter pertama dan flag `truncated: true` disematkan pada respons (jika <= 10.000 karakter, `truncated: false`).
- **Rasional:** Menjaga keandalan pemrosesan diff besar tanpa membebani konteks LLM dan sesuai janji antarmuka pengguna pada PRD Bagian 5.
- **Status:** Disetujui (Zidane).

---

## DEC-015 | 2026-10-22 | Penambahan Dua Format Contoh Laporan Netral ke Prompt Sistem
- **Keputusan:**
  1. Menambahkan dua contoh format laporan insiden dan deskripsi PR netral (tanpa nama berkas atau jalur direktori) ke dalam `SYSTEM_PROMPT` di `src/lib/ai/index.ts`.
  2. Contoh menggunakan istilah arsitektural umum (layanan autentikasi, token sesi, kueri basis data) dan bukan nama berkas nyata agar model tidak meniru atau menghalusinasikan nama file fiktif.
- **Rasional:** Mengarahkan gaya bahasa AI agar konsisten dengan nada *deadpan*, ringkas, dan faktual tanpa melanggar guardrail nama file. Hasil live-check merupakan satu run per putaran, keluaran tidak deterministik, latensi dipengaruhi beban server, fakta: 3 dari 6 panggilan berakhir 503, dan tidak ada kesimpulan kualitas.
- **Status:** Disetujui (Zidane).

---

## DEC-016 | 2026-10-22 | Pelonggaran Batas Panjang Baris Sampel Diff Menjadi Maksimal 70 Baris
- **Keputusan:**
  1. Melonggarkan batas panjang baris sampel diff di `src/samples/` dari sebelumnya 20–40 baris menjadi maksimal 70 baris (perubahan detail scope).
  2. Menulis ulang `rebase-conflict.ts` (68 baris) dan `works-on-machine.ts` (67 baris) untuk memuat 6 commit realistis dengan diff ringkas, pesan commit malas/berulang, satu pesan shouting kapital, dan sisa debug log/comment.
  3. Menandai ketiga sampel dengan catatan: *"Ditulis agar mewakili sesi panik; skor dihitung, bukan disetel."* Tanpa mengubah bobot atau kode pada kalkulator Panic Score.
- **Rasional:** Memberikan variasi multi-commit yang representatif terhadap sesi panik nyata (memungkinkan deteksi sinyal penelusuran berulang pada berkas yang sama dan shouting), tanpa melebihi batas panjang yang wajar untuk demo.
- **Status:** Disetujui (Zidane).

---

## DEC-017 | 2026-10-22 | Pemilihan AI_MODEL_NAME = gemini-3.5-flash untuk Fase 2
- **Keputusan:**
  1. Zidane (pemilik proyek) menetapkan konfigurasi model AI aktif: `AI_MODEL_NAME = gemini-3.5-flash`.
  2. Dasar pemilihan: Hasil live-check eksploratori (3 dari 6 panggilan berakhir 503, panggilan sukses menghasilkan latensi 8,5–11,9 detik dengan keluaran terstruktur valid) dan data probe ketersediaan model.
  3. Keterbatasan yang dicatat:
     - Probe dilakukan beruntun dengan jeda 1 detik sehingga respon 429 pada panggilan ke-7 dan seterusnya kemungkinan besar dipicu oleh batas laju (*rate limiting* / RPM) akun free tier (dugaan, belum terbukti secara definitif).
     - Model alternatif `gemini-3.5-flash-lite` berhasil 18 dari 18 panggilan probe, tetapi memiliki median latensi 9,8 detik dan belum memiliki bukti evaluasi kualitas tekstual keluarannya.
     - Kriteria reliabilitas 5 dari 5 sukses per preset pada uji coba Gate 2 tetap berlaku tanpa kompromi.
- **Rasional:** Memilih model dengan jalur inferensi yang telah terbukti menghasilkan struktur dan kualitas respon yang memadai di pengujian langsung, sambil mengantisipasi batas laju melalui jeda antar-panggilan yang lebih longgar.
- **Status:** Disetujui (Zidane).

---

## DEC-018 | 2026-10-22 | Penyesuaian Suara Incident Report di Prompt Sistem dan Penerusan Sinyal Fakta
- **Keputusan:**
  1. Merevisi instruksi bagian Incident Report pada `SYSTEM_PROMPT` di `src/lib/ai/index.ts` agar menghasilkan suara insiden yang *understated*, kering, dan pasif:
     - Kalimat pendek dan pernyataan sengaja diperkecil.
     - Menyebut fakta konkret dari input atau dari sinyal deterministik apa adanya (misal jumlah commit, berkas disentuh berulang, sisa debug).
     - Tanpa tanda seru, tanpa emoji, dan tanpa lelucon/humor eksplisit.
     - Lessons learned wajib satu kalimat kering.
     - Root cause tetap 'Under investigation' bila tidak tampak jelas dari input.
     - Tidak menyalahkan pembuat perubahan kecuali didukung bukti di input (seperti pesan commit berulang/malas).
  2. Meneruskan fakta sinyal (evidence) deterministik ke dalam `formatUserPrompt` agar dapat dikutip oleh model sebagai fakta teramati.
  3. Mengubah dua contoh format laporan insiden pada `SYSTEM_PROMPT` ke gaya suara baru tanpa mencantumkan nama berkas apa pun.
  4. Menambahkan opsi `--spacing-ms=<n>` (bawaan 8000ms) pada `scripts/live-check.mjs` dan `scripts/model-probe.mjs`.
  5. Hasil eksekusi `node --env-file=.env.local scripts/live-check.mjs --show-text --spacing-ms=8000`:
     - Sampel `late-night-hotfix` berhasil (HTTP 200, latensi 9363 ms, guardrail lolos). Teks laporan insiden mengutip jumlah commit ("across 2 consecutive commits"), tanpa lelucon, dan menggunakan kalimat pendek pasif.
     - Sampel `rebase-conflict` dan `works-on-machine` berakhir HTTP 502 akibat pembatasan kuota laju permintaan HTTP 429 beruntun (F-022).
     - Tidak ada klaim 'lebih baik' atau 'meningkat'; yang tercatat adalah fakta tekstual dan status jaringan yang teramati secara empiris.
- **Rasional:** Menyelaraskan kepribadian laporan insiden dengan spesifikasi deadpan tanpa kehilangan ketepatan teknis dan tanpa melanggar guardrail nama berkas.
- **Status:** Disetujui (Zidane).

---

## DEC-019 | 2026-10-22 | Logging Galat HTTP Provider yang Disanitasi (status, error.status, retryDelay)
- **Keputusan:**
  1. Memperbarui penanganan galat non-OK di `src/lib/ai/index.ts` agar mengekstrak metadata galat dari JSON penyedia (`error.status` dan `retryDelay` dari `error.details`) dan mencetak ke konsol HANYA format ringkas: `[AI_HTTP_ERROR] status: <HTTP_CODE>, error.status: <STATUS>, retryDelay: <DELAY>`.
  2. Memastikan seluruh pencatatan galat dan pesan galat sama sekali tidak memuat isi input pengguna maupun kunci API rahasia.
  3. Memperbarui `scripts/live-check.mjs` agar mencetak kode galat dan status HTTP secara aman.
  4. Menambahkan tes unit di `tests/ai-engine.test.ts` untuk memverifikasi secara deterministik bahwa konsol dan objek galat tidak membocorkan input atau kredensial saat terjadi error HTTP 429/500/503.
  5. Kebijakan retry bounded (maksimal 2 percobaan, threshold sisa waktu >= 10s, delay 1.5s) tetap dipertahankan tanpa perubahan.
- **Rasional:** Memastikan bukti telemetri kuota dan laju permintaan dari penyedia API terekam secara transparan untuk kebutuhan audit tanpa mengorbankan privasi data dan keamanan kredensial.
- **Status:** Disetujui (Zidane).

---

## DEC-020 | 2026-10-24 | Kuota Free Tier AI Studio, Pemilihan Model Pengembangan, & Adendum DEC-017
- **Keputusan:**
  1. Mencatat profil batas kuota Google AI Studio Free Tier (puncak 28 hari) yang teramati pada dashboard:
     - `gemini-3.6-flash`: 5 RPM, 250K TPM, 20 RPD.
     - `gemini-3.8-flash`: 5 RPM, 250K TPM, 20 RPD (hampir habis kuota harian: 18/20 terpakai saat probe 22 Okt).
     - `gemini-3.5-flash-lite`: 15 RPM, 250K TPM, 500 RPD.
     - `gemini-3.5-flash`: Baris kuota tidak terlihat di dashboard AI Studio; batas definitifnya BELUM diketahui.
  2. Dugaan (belum terbukti): Galat HTTP 429 pada `gemini-3.5-flash` sebelumnya dipicu oleh batas kuota harian atau rate limit tier gratis.
  3. **Adendum untuk DEC-017:** Kelayakan model tergantung pada batas kuota riil penyedia. Model `gemini-3.5-flash` tidak dipakai sementara untuk pengembangan utama.
  4. Zidane menetapkan `gemini-3.5-flash-lite` sebagai model aktif untuk pengembangan dan pembuktian 3x5 (kualitas nada tekstual diuji secara bertahap).
- **Rasional:** Menjaga kelangsungan eksekusi dan ketersediaan kuota selama proses perancangan UI dan verifikasi build tanpa terhenti oleh pembatasan 20 RPD.
- **Status:** Disetujui (Zidane).

---

## DEC-021 | 2026-10-24 | Format Kontrak Tugas Ringkas (T-005 s.d. T-008) & Mekanisme Verifikasi
- **Keputusan:**
  1. Kontrak tugas T-005 sampai T-008 disederhanakan menjadi format 6 baris (tujuan, kriteria selesai, perintah verifikasi, di luar scope, berkas, risiko). Ini adalah penyederhanaan yang disengaja karena keterbatasan waktu hackathon.
  2. Audit model independen digantikan oleh eksekusi skrip mekanis `scripts/verify.mjs` dan inspeksi manual langsung oleh pemilik (Zidane).
- **Rasional:** Mengurangi overhead dokumentasi formal dan mempercepat siklus iterasi menuju demo freeze tanpa mengurangi ketegasan verifikasi teknis.
- **Status:** Disetujui (Zidane).

---

## DEC-022 | 2026-10-24 | Pengetatan Nada Incident Report (Fakta Teramati Wajib & Non-Repetisi Cause)
- **Keputusan:**
  1. Memperbarui `SYSTEM_PROMPT` di `src/lib/ai/index.ts`:
     - Incident Report WAJIB mengutip minimal satu fakta teramati konkret dari blok *Deterministic Observed Facts* (seperti jumlah commit, berkas disentuh berulang, atau pesan commit berulang).
     - *Lessons learned* wajib satu kalimat kering dan TIDAK BOLEH mengulang kalimat pada *Cause*.
     - Tetap mempertahankan batasan: tanpa tanda seru, tanpa emoji, dan tanpa lelucon/humor eksplisit.
  2. Menghindari segala klaim subjektif seperti 'lebih baik' atau 'meningkat'; seluruh evaluasi dicatat berdasarkan fakta keluaran teks apa adanya.
- **Rasional:** Memastikan laporan insiden memiliki dasar faktual langsung dari sinyal git input sekaligus mencegah keluaran yang repetitif.
- **Status:** Disetujui (Zidane).


