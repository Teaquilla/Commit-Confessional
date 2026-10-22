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




