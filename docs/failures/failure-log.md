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

---

## F-004 | 2026-10-20 16:30 WIB | Fase 1
- **Kategori:** runtime
- **Severity:** P2
- **Gejala:** TypeError `ERR_HTTP_INVALID_HEADER_VALUE`: Invalid value "undefined" for header "x-goog-api-key" saat eksekusi node inline tanpa argumen `--env-file=.env.local`.
- **Perintah / konteks:** `node -e "..."`
- **Log mentah:** `docs/failures/raw/2026-10-20-F-004.txt`
- **Dugaan penyebab:** Bendera `--env-file=.env.local` terlewat pada pemanggilan `node -e`.
- **Tindakan:** Menggunakan `node --env-file=.env.local` pada setiap pemanggilan skrip pengujian.
- **Status:** diperbaiki
- **Bukti perbaikan:** Eksekusi dengan `--env-file=.env.local` berhasil membaca environment variable tanpa error undefined header.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-005 | 2026-10-20 16:32 WIB | Fase 1
- **Kategori:** keamanan
- **Severity:** P1
- **Gejala:** Potensi keterpaparan token API key lama pada prompt percakapan dan kebutuhan rotasi ke environment lokal yang aman.
- **Perintah / konteks:** Audit keamanan repositori dan verifikasi eliminasi token lama.
- **Log mentah:** `docs/failures/raw/2026-10-20-F-005.txt`
- **Dugaan penyebab:** Kunci API sempat terpapar di luar berkas environment lokal.
- **Tindakan:** Pengguna mencabut API key lama di konsol provider dan memasang key baru secara mandiri di `.env.local`. Builder memverifikasi bahwa key lama tidak tersisa di repositori (`git grep -n "[key-prefix]"`, `git log --all -S "[key-prefix]" --oneline`, dan pencarian teks di `docs/`).
- **Status:** key dicabut, key baru dipasang
- **Bukti perbaikan:**
  - `git grep -n "[key-prefix]"`: 0 kecocokan pada seluruh berkas yang terlacak git.
  - `git log --all -S "[key-prefix]" --oneline`: 0 kecocokan di seluruh riwayat commit git.
  - Pencarian di `docs/`: 0 kecocokan nilai kunci asli. Catatan riwayat perintah audit di `docs/failures/raw/2026-10-20-F-005.txt` telah disamarkan menggunakan `[key-prefix]`.
  - `.gitignore` mengabaikan `.env*` dengan pengecualian `.env.example`.
  - `.env.local` tidak terlacak git (`git ls-files .env.local` kosong).

- **Dampak ke klaim:** Kredensial lama telah dicabut dan tidak ada kebocoran di riwayat git maupun dokumentasi publik.

---

## F-006 | 2026-10-20 16:40 WIB | Fase 1
- **Kategori:** panggilan API
- **Severity:** P2
- **Gejala:** HTTP status 503 (`This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.`) dan timeout request setelah 30000ms pada model `gemini-3.8-flash`.
- **Perintah / konteks:** `node --env-file=.env.local scripts/smoke-test.mjs`
- **Log mentah:** `docs/failures/raw/2026-10-20-F-006.txt`
- **Dugaan penyebab:** Beban trafik tinggi (*high demand surge*) pada server Google Gemini untuk model `gemini-3.8-flash`.
- **Tindakan:** Menguji konektivitas & kredensial via `gemini-3.5-flash` untuk memastikan API key baru dan konfigurasi header `x-goog-api-key` berfungsi. Menetapkan kebijakan tanpa fallback otomatis: hanya 1 kali retry untuk HTTP 503/429 (setelah 1-2 detik, jika sisa waktu batas 28 detik masih >= 10 detik).
- **Status:** dalam penyelidikan (kemampuan generateContent pada gemini-3.8-flash belum terbukti)
- **Bukti perbaikan:**
  - `scripts/smoke-test.mjs` dengan `gemini-3.5-flash` menghasilkan HTTP status 200 dan teks respons sepanjang 1152 karakter, membuktikan API key baru valid dan konfigurasi header berfungsi.
  - Belum ada bukti respons HTTP 200 dari `gemini-3.8-flash`.
- **Dampak ke klaim:** Klaim kemampuan teks `gemini-3.8-flash` dicatat sebagai `tidak terbukti` di `claims-register.md` (C-005) hingga diperoleh respons HTTP 200.

---

## F-007 | 2026-10-22 09:36 WIB | Fase 1
- **Kategori:** proses
- **Severity:** P2
- **Gejala:** CommandNotFoundException pada shell Windows PowerShell (`The term 'grep' is not recognized as the name of a cmdlet, function, script file, or operable program`).
- **Perintah / konteks:** `grep -n "v3" docs/plan/execution-plan.md`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-007.txt`
- **Dugaan penyebab:** Utilitas Unix `grep` tidak terdaftar secara mandiri di PATH PowerShell sistem Windows lokal.
- **Tindakan:** Menggunakan utilitas yang tersedia di lingkungan Windows, yaitu `Select-String` (PowerShell) atau `git grep`.
- **Status:** diperbaiki
- **Bukti perbaikan:** Eksekusi `git grep -n "v3" docs/plan/execution-plan.md` atau `Select-String -Pattern "v3" -Path docs/plan/execution-plan.md` berjalan sukses dengan exit code 0.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-008 | 2026-10-22 10:09 WIB | Fase 2
- **Kategori:** kode
- **Severity:** P2
- **Gejala:** 3 tes gagal pada eksekusi `node --test tests/panic-score.test.ts`: (1) baris deleted diff terserap ke dalam commit message pada parsing git show, (2) word-boundary `\b` pada regex debug gagal mendeteksi `print('...'`, dan (3) kalibrasi fixture test clamping multi-signal belum mencapai ambang skor CRITICAL (75+).
- **Perintah / konteks:** `node --test tests/panic-score.test.ts`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-008.txt`
- **Dugaan penyebab:** Status `inIndentedMessage` pada parser tidak menghentikan pembacaan saat menemukan baris penambahan/penghapusan diff; regex debug memuat `\b` di belakang karakter non-kata `(` sehingga tidak cocok dengan kutip; fixture test clamping belum mencakup baris diff >100 untuk memaksimalkan sinyal 5.
- **Tindakan:** Menghentikan `inIndentedMessage` saat baris penanda diff (`diff `, `---`, `+++`, `@@`, `+`, `-`) terdeteksi; memperbaiki regex debug keywords; melengkapi fixture test clamping.
- **Status:** diperbaiki
- **Bukti perbaikan:** Eksekusi `node --test tests/panic-score.test.ts` menghasilkan 17 pass, 0 fail (exit code 0):
  ```text
  ▶ validateGitInput (1.3922ms)
  ▶ parseInput (1.569ms)
  ▶ calculatePanicScore (3.0342ms)
  ℹ tests 17
  ℹ suites 3
  ℹ pass 17
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 99.237
  ```
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-009 | 2026-10-22 10:17 WIB | Fase 2
- **Kategori:** tes
- **Severity:** P2
- **Gejala:** Tes `verifies exact score boundaries of 0 and 100` gagal pada assertion `rushedCommits.points`: actual 20 !== expected 30.
- **Perintah / konteks:** `node --test tests/panic-score.test.ts`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-009.txt`
- **Dugaan penyebab:** Pesan commit kedua pada fixture tes seratus poin menggunakan frasa `"FIX NOW!!!"` yang memuat dua kata (bukan single-word dan bukan kata dalam daftar tetap), sehingga hanya 2 dari 3 commit yang terdeteksi low-effort (`Math.round((2/3)*30) = 20` poin, bukan 30 poin).
- **Tindakan:** Mengganti pesan commit kedua menjadi single-word shouting `"ASDFGHHH!!!"` agar memenuhi kriteria low-effort sekaligus kriteria shouting.
- **Status:** diperbaiki
- **Bukti perbaikan:** Eksekusi `node --test tests/panic-score.test.ts` menghasilkan 21 pass, 0 fail (exit code 0):
  ```text
  ▶ validateGitInput (1.4972ms)
  ▶ parseInput (1.4972ms)
  ▶ calculatePanicScore (4.0371ms)
  ℹ tests 21
  ℹ suites 3
  ℹ pass 21
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 105.7945
  ```
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.








