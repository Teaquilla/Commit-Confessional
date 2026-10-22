# Referensi, Kredit, dan Atribusi (References & Credits)

Dokumen ini mencatat setiap sumber pihak ketiga, model AI, pustaka, tipografi, dan inspirasi yang menjadi bagian dari proyek Commit Confessional.
Setiap lisensi diverifikasi langsung dari sumber resminya, bukan berdasarkan ingatan.

---

## Format Entri Standar
Setiap entri kredit wajib memuat atribut berikut:
- **Judul:** Nama alat, model, pustaka, atau karya
- **Jenis:** `Model AI` | `Pustaka` | `Font` | `Skill Pack` | `Inspirasi` | `Aset`
- **Tujuan Penggunaan:** Bagian aplikasi yang memanfaatkan komponen ini
- **Sumber / URL:** URL resmi atau repositori asal
- **Lisensi / Ketentuan:** Jenis lisensi resmi dari sumber terverifikasi
- **Catatan Tambahan:** Informasi relevan, tanggal verifikasi, atau keputusan terkait

---

## 1. Model AI

### Google Gemini API
- **Jenis:** Model AI
- **Tujuan Penggunaan:** Mesin generasi teks untuk menghasilkan Incident Report (deadpan), PR Description (profesional), dan penyesuaian Panic Score (+/- 15 poin).
- **Sumber / URL:** https://ai.google.dev/gemini-api/docs/models/gemini
- **Lisensi / Ketentuan:** Google Generative AI Developer Terms of Service
- **Catatan Tambahan:** Model yang didaftarkan pada spesifikasi adalah `gemini-3.8-flash` (terdaftar di katalog API 2026-10-20), dengan `gemini-3.5-flash` sebagai model pembanding yang telah teruji menghasilkan respons HTTP 200 (tercatat di DEC-004).

---

## 2. Alat Perencanaan & Panduan

### Devpost Learn AI Basics Skill Pack
- **Jenis:** Skill Pack
- **Tujuan Penggunaan:** Panduan proses perencanaan dan wawancara *flipped interaction* untuk menghasilkan berkas `devpost/scope.md`, `devpost/prd.md`, dan `devpost/spec.md`.
- **Sumber / URL:** https://github.com/challengepost/learn-ai-basics
- **Lisensi / Ketentuan:** MIT License (tertera pada repositori resmi)
- **Catatan Tambahan:** Dipasang pada Fase 0 menggunakan perintah `npx skills add challengepost/learn-ai-basics --all -y`.

---

## 3. Inspirasi Alur Kerja & Tata Kelola

### Pola Tata Kerja Rekayasa Repo Teman Tim
- **Jenis:** Inspirasi
- **Tujuan Penggunaan:** Inspirasi pola penataan tata kerja terstruktur, lembar kesiapan demo (`DEMO_READINESS.md`), status sesi (`STATE.md`), kontrak tugas (`TASK_TEMPLATE.md`), dan pengujian keandalan preset.
- **Sumber / URL:** Repositori internal rekan tim (`Teaquilla/Hakaton`)
- **Lisensi / Ketentuan:** Kolaborasi internal tim hackathon
- **Catatan Tambahan:** Seluruh berkas dan teks disusun ulang secara mandiri dengan kata-kata sendiri tanpa menyalin kode atau isi mentah dari repositori sumber (tercatat di `docs/decisions.md` di bawah DEC-007).

---

## 4. Tipografi & Font (Akan Diisi Setelah Verifikasi Sumber)

### IBM Plex Sans & IBM Plex Mono
- **Jenis:** Font
- **Tujuan Penggunaan:** Tipografi primer antarmuka UI dan laporan teknis monospaced.
- **Sumber / URL:** https://github.com/IBM/plex
- **Lisensi / Ketentuan:** [Akan diverifikasi langsung dari sumber resmi sebelum Gate 3]
- **Catatan Tambahan:** Dimuat secara mandiri via `next/font/google` pada build time.

---

## 5. Pustaka & Dependensi Utama (Akan Diisi Setelah Pemasangan)

### Next.js, Tailwind CSS, Zod
- **Jenis:** Pustaka
- **Tujuan Penggunaan:** Kerangka kerja aplikasi web, styling antarmuka, dan validasi skema runtime.
- **Sumber / URL:** npm registry / repositori resmi
- **Lisensi / Ketentuan:** [Akan diverifikasi langsung dari berkas package/license setelah npm ci dijalankan di Fase 2]
- **Catatan Tambahan:** Dependensi akan dikunci melalui `package-lock.json`.
