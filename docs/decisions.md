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
- **Keputusan:** Menggunakan provider Google Gemini dengan model `gemini-3.8-flash`. Model name dikonfigurasi melalui environment variable `AI_MODEL_NAME`.
- **Verifikasi API Catalog:** Terverifikasi via kueri endpoint resmi `https://generativelanguage.googleapis.com/v1beta/models` dengan header `x-goog-api-key` (tanpa key di URL) pada 2026-10-20. Model `models/gemini-3.8-flash` terdaftar aktif dalam katalog API.
- **Verifikasi Smoke Test:**
  - `gemini-3.8-flash`: Menghasilkan HTTP 503 (`This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.`) serta timeout 30000ms pada lonjakan beban server Google (dicatat di `F-006`).
  - `gemini-3.5-flash` (uji validasi konektivitas & kredensial):
    ```
    HTTP status: 200
    Model: gemini-3.5-flash
    Response text length: 1152 characters
    ```
  - **Kesimpulan:** Kredensial baru di `.env.local` dan komunikasi header `x-goog-api-key` terverifikasi 100% valid dan berfungsi. Konfigurasi `AI_MODEL_NAME` mempertahankan `gemini-3.8-flash` sebagai target utama dengan `gemini-3.5-flash` sebagai fallback terverifikasi.
- **Dokumentasi Resmi:** https://ai.google.dev/gemini-api/docs/models/gemini
- **Status:** Disetujui (Zidane).


---

## DEC-005 | 2026-10-20 | Arsitektur Hosting dan Deployment
- **Keputusan:** Deployment produksi utama menggunakan server self-hosted milik rekan tim yang dikelola dengan process manager (`next start` di bawah pm2 / systemd / Docker) dan reverse proxy (nginx / Caddy) dengan HTTPS dan read timeout >= 30 detik. Vercel Free Plan ditetapkan sebagai opsi deployment cadangan (*fallback*).
- **Rasional:** Memberikan kendali infrastruktur penuh, privasi server-side environment variables, dan keandalan timeout eksekusi.
- **Status:** Disetujui (Zidane).

