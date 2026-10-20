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
