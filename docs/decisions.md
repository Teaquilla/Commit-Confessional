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







