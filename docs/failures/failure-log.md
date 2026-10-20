# Failure Log (Append-Only)

Dokumen ini mencatat setiap kegagalan, error perintah, kegagalan panggilan API, output AI rusak, retry, rollback, atau revert yang dialami selama proyek hackathon BWAI Basics.

**Aturan Kerja:**
1. Log bersifat *append-only*. Jangan menghapus atau menulis ulang entri lama.
2. Setiap entri dicatat pada saat kejadian, **SEBELUM** mencoba memperbaikinya.
3. Simpan output mentah di `docs/failures/raw/` dengan secret disamarkan.

---

## F-001 | 2026-10-20 10:58 WIB | Fase 0
- **Kategori:** proses
- **Severity:** P2
- **Gejala:** ParserError pada PowerShell saat mengeksekusi loop pembuatan direktori (`MissingVariableNameAfterForeach`).
- **Perintah / konteks:** `powershell -Command "$dirs = ...; foreach ($d in $dirs) ..."`
- **Log mentah:** `docs/failures/raw/2026-10-20-F-001.txt`
- **Dugaan penyebab:** Sintaks inline PowerShell string dengan tanda kutip ganda memicu masalah parsing variabel shell.
- **Tindakan:** Menggunakan perintah pembuatan direktori eksplisit tanpa loop bertingkat.
- **Status:** diperbaiki
- **Bukti perbaikan:** Eksekusi skrip inisialisasi direktori via Python berjalan sukses dengan exit code 0 (`All directories and .gitkeep files created successfully`).
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-002 | 2026-10-20 11:00 WIB | Fase 0
- **Kategori:** proses
- **Severity:** P2
- **Gejala:** Peringatan `Failed to install 7` (gagal membuat symlink untuk 7 harness pihak ketiga non-aktif: Zencoder, Zenflow, Neovate, Pochi, PromptScript, AdaL, Universal) saat menjalankan `npx skills add challengepost/learn-ai-basics --all -y`.
- **Perintah / konteks:** `npx skills add challengepost/learn-ai-basics --all -y`
- **Log mentah:** `docs/failures/raw/2026-10-20-F-002.txt`
- **Dugaan penyebab:** Tool installer mencoba membuat symlink ke berbagai tools AI editor yang tidak terpasang di sistem operasi Windows lokal atau file terkunci sesaat saat multi-link write.
- **Tindakan:** Memverifikasi integritas folder `.agents/skills/` utama (`1-start`, `2-scope`, `3-prd`, `4-spec`, `5-build`, `6-ship`). Seluruh 6 skill terpasang lengkap dan valid untuk Antigravity, Claude Code, dan Codex.
- **Status:** diperbaiki
- **Bukti perbaikan:** Verifikasi `list_dir` pada `.agents/skills/` dan `.agents/skills/3-prd/` mengonfirmasi `SKILL.md` (11.242 bytes), folder `references`, dan `templates` hadir secara utuh.
- **Dampak ke klaim:** Tidak ada dampak negatif ke fungsionalitas skill di Antigravity maupun Codex.

---

## F-003 | 2026-10-20 11:00 WIB | Fase 0
- **Kategori:** proses
- **Severity:** P2
- **Gejala:** Perintah `git status` gagal dengan pesan `fatal: not a git repository`.
- **Perintah / konteks:** `git status`
- **Log mentah:** `docs/failures/raw/2026-10-20-F-003.txt`
- **Dugaan penyebab:** Repositori git lokal belum diinisialisasi (`git init`).
- **Tindakan:** Menjalankan `git init` dan mengonfigurasi branch utama `main`.
- **Status:** diperbaiki
- **Bukti perbaikan:** Eksekusi `git init -b main` sukses dengan output `Initialized empty Git repository in D:/yayaya/.git/`.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

