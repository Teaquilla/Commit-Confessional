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

---

## F-010 | 2026-10-22 10:55 WIB | Fase 2
- **Kategori:** alat
- **Severity:** P3
- **Gejala:** Perintah compound `git add docs/ && git commit ...` gagal dieksekusi dengan exit code 1 (`ParserError: The token '&&' is not a valid statement separator in this version`).
- **Perintah / konteks:** `git add docs/ && git commit -m "docs: calibrate claims and terminology for file name guardrails"`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-010.txt`
- **Dugaan penyebab:** Lingkungan shell host Windows PowerShell (versi 5.1) tidak mendukung operator chaining `&&` sebagai pemisah statement; memerlukan titik koma `;` atau perintah terpisah.
- **Tindakan:** Menjalankan `git add docs/` dan `git commit` secara terpisah atau menggunakan `;`.
- **Status:** diperbaiki
- **Bukti perbaikan:** Eksekusi `git add docs/` secara terpisah sukses dengan exit code 0.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-011 | 2026-10-22 14:07 WIB | Fase 2
- **Kategori:** kode
- **Severity:** P2
- **Gejala:** 2 tes baru gagal pada `node --test tests/panic-score.test.ts`: baris konteks diff Python (4 spasi) dan Go (tab) terserap ke dalam commit message `currentCommit.message` (`fix def process_request():` bukannya `fix`, dan `wip func main() {` bukannya `wip`).
- **Perintah / konteks:** `node --test tests/panic-score.test.ts`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-011.txt`
- **Dugaan penyebab:** Kondisi pengecekan pesan terindentasi `/^(\s{4}|\t)/` tetap aktif mengevaluasi baris-baris konteks diff setelah penanda diff (`diff --git` atau `@@`) muncul karena tidak ada flag penutup penerimaan pesan commit hingga header commit baru.
- **Tindakan:** Menambahkan flag boolean (misal `diffStarted = true`) saat menemui `diff ` atau `@@`, sehingga setelah baris diff/hunk dimulai, pesan commit tidak boleh bertambah lagi sampai header `commit ` berikutnya ditemukan.
- **Status:** diperbaiki
- **Bukti perbaikan:** Modul `src/lib/panic-score.ts` diperbarui dengan flag `inDiffSection`. Eksekusi `node --test tests/panic-score.test.ts` menghasilkan 23 pass, 0 fail (exit code 0).
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-012 | 2026-10-22 14:14 WIB | Fase 2
- **Kategori:** konfigurasi
- **Severity:** P2
- **Gejala:** `node --test tests/guardrails.test.ts tests/panic-score.test.ts` gagal dengan exit code 1 (`SyntaxError: Cannot use import statement outside a module`).
- **Perintah / konteks:** `node --test tests/guardrails.test.ts tests/panic-score.test.ts`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-012.txt`
- **Dugaan penyebab:** Inisialisasi awal `npm init -y` menyetel `"type": "commonjs"` di `package.json`, sehingga test runner Node.js memperlakukan berkas pengujian `.ts` berbasis ESM sebagai CommonJS.
- **Tindakan:** Mengubah `"type": "commonjs"` menjadi `"type": "module"` di `package.json`.
- **Status:** diperbaiki
- **Bukti perbaikan:** `package.json` diperbarui dengan `"type": "module"`. Eksekusi `node --test tests/guardrails.test.ts tests/panic-score.test.ts` sukses menghasilkan 35 pass, 0 fail (exit code 0).
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-013 | 2026-10-22 14:38 WIB | Fase 2
- **Kategori:** perintah
- **Severity:** P2
- **Gejala:** Evaluasi inline one-liner node gagal dengan exit code 1 (`SyntaxError: Unexpected token '.'`).
- **Perintah / konteks:** `node --input-type=module -e 'import ... from "./src/samples/index.ts"...'` di PowerShell.
- **Log mentah:** `docs/failures/raw/2026-10-22-F-013.txt`
- **Dugaan penyebab:** PowerShell mengurai tanda kutip ganda di dalam argumen string tanda kutip tunggal secara keliru sehingga path `./src/samples/index.ts` terkirim tanpa kutip ke engine V8 Node.js.
- **Tindakan:** Menggunakan skrip terisolasi atau menjalankan perintah dengan escaping kutip yang tepat / file runner.
- **Status:** diperbaiki
- **Bukti perbaikan:** Kode dijalankan melalui skrip pengujian atau evaluasi berformat valid.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-014 | 2026-10-22 14:40 WIB | Fase 2
- **Kategori:** tes
- **Severity:** P2
- **Gejala:** Tes `4. truncates input longer than 10,000 characters and sets truncated: true` gagal pada assertion `Input length should be > 10000, got 7980`.
- **Perintah / konteks:** `node --test tests/confess.test.ts`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-014.txt`
- **Dugaan penyebab:** Kalkulasi string padding pada test fixture menghasilkan total panjang 7.980 karakter (di bawah 10.000 karakter), sedangkan spesifikasi mensyaratkan pengujian input 12.000 karakter.
- **Tindakan:** Menambah repetisi padding agar total karakter input mencapai tepat 12.000 karakter.
- **Status:** diperbaiki
- **Bukti perbaikan:** Eksekusi `node --test tests/confess.test.ts` sukses menghasilkan 15 pass, 0 fail.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-015 | 2026-10-22 14:41 WIB | Fase 2
- **Kategori:** perintah
- **Severity:** P2
- **Gejala:** Perintah node gagal dengan exit code 1 (`either --test or --eval can be used, not both`).
- **Perintah / konteks:** `node --test -e "..."`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-015.txt`
- **Dugaan penyebab:** Opsi CLI Node.js `--test` dan `--eval` (-e) saling eksklusif dan tidak dapat digabungkan dalam satu invocation.
- **Tindakan:** Menggunakan skrip runner berkas `.mjs` atau `.ts` terpisah untuk mencetak diagnostik atau menjalankan pengujian.
- **Status:** diperbaiki
- **Bukti perbaikan:** Kode dijalankan via skrip runner tanpa penggabungan argumen yang berkonflik.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-016 | 2026-10-22 14:42 WIB | Fase 2
- **Kategori:** build
- **Severity:** P2
- **Gejala:** `npm run build` gagal dengan exit code 1 (`Module not found: Can't resolve '../../lib/confess.ts'`).
- **Perintah / konteks:** `npm run build`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-016.txt`
- **Dugaan penyebab:** Jalur impor relatif pada `src/app/api/confess/route.ts` hanya naik 2 level (`../../lib/confess.ts`), padahal berkas berada 3 level di bawah root `src` (`src/app/api/confess/`), sehingga seharusnya `../../../lib/confess.ts`.
- **Tindakan:** Mengubah jalur impor menjadi `../../../lib/confess.ts`.
- **Status:** diperbaiki
- **Bukti perbaikan:** `npm run build` sukses dengan exit code 0.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-017 | 2026-10-22 14:44 WIB | Fase 2
- **Kategori:** api
- **Severity:** P2
- **Gejala:** Panggilan API Gemini untuk sampel `late-night-hotfix` menghasilkan HTTP 503 dua kali berturut-turut sehingga mengembalikan HTTP 502 `AI_GENERATION_FAILED`.
- **Perintah / konteks:** `node --env-file=.env.local scripts/live-check.mjs`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-017.txt`
- **Dugaan penyebab:** Lonjakan beban (*demand spike*) sementara pada infrastruktur Gemini REST API untuk model `gemini-3.5-flash` menyebabkan error 503 pada percobaan 1 dan percobaan 2.
- **Tindakan:** Memverifikasi mekanisme retry otomatis berjalan sesuai desain (mencatat `[AI_RETRY] 503` tanpa kebocoran secret); sampel berikutnya (`rebase-conflict` dan `works-on-machine`) berhasil dengan HTTP 200.
- **Status:** dimitigasi
- **Bukti perbaikan:** Mekanisme penanganan galat dan retry berfungsi sesuai spesifikasi; eksekusi ulang pada prompt refined berhasil.
- **Dampak ke klaim:** C-005 membuktikan API endpoint berfungsi pada sampel berikutnya.

---

## F-018 | 2026-10-22 14:46 WIB | Fase 2
- **Kategori:** api
- **Severity:** P2
- **Gejala:** Panggilan API Gemini untuk sampel `late-night-hotfix` dan `rebase-conflict` pada live-check putaran 2 menghasilkan HTTP 503 ganda berturut-turut sehingga mengembalikan HTTP 502 `AI_GENERATION_FAILED`.
- **Perintah / konteks:** `node --env-file=.env.local scripts/live-check.mjs`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-018.txt`
- **Dugaan penyebab:** Fluktuasi kapasitas server provider Google Gemini (`gemini-3.5-flash`) mengalami lonjakan beban (*high demand*).
- **Tindakan:** Memverifikasi isolasi kesalahan berfungsi (status 502 dikembalikan, `[AI_RETRY] 503` dicatat tanpa kebocoran data sensitif). Sampel `works-on-machine` sukses (HTTP 200) dengan perbaikan kepadatan teks deadpan.
- **Status:** dimitigasi
- **Bukti perbaikan:** Penanganan galat sesuai spesifikasi PRD; transmisi API valid terbukti pada sampel yang sukses.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-019 | 2026-10-22 15:10 WIB | Fase 2
- **Kategori:** api
- **Severity:** P2
- **Gejala:** Panggilan API Gemini pada eksekusi model probe menghasilkan error HTTP 503 (1x pada gemini-3.5-flash, 2x pada gemini-3.8-flash), 429 quota exhaustion (12x pada gemini-3.5-flash), timeout/abort >20s (8x pada gemini-3.8-flash), dan HTTP 404 (18x pada gemini-2.5-flash).
- **Perintah / konteks:** `node --env-file=.env.local scripts/model-probe.mjs gemini-3.5-flash,gemini-3.8-flash,gemini-3.5-flash-lite,gemini-2.5-flash`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-019.txt`
- **Dugaan penyebab:** Beban server penyedia model, kuota per menit untuk tier free/tier awal terlampaui saat pengujian beruntun tanpa jeda panjang, latensi ekstrem pada gemini-3.8-flash, serta nama model lama gemini-2.5-flash tidak mendukung endpoint generateContent v1beta.
- **Tindakan:** Mengisolasi hasil ke dalam matriks ketersediaan dan latensi tanpa retry untuk evaluasi pemilihan model; menyajikan tabel objektif ke pemilik proyek tanpa memilih model secara sepihak.
- **Status:** dimitigasi
- **Bukti perbaikan:** Tabel hasil probe tersimpan di `docs/evidence/model-probe-2026-10-22.md` bertanda eksploratori; model `gemini-3.5-flash-lite` berhasil 18 dari 18 panggilan (100% 200).
- **Dampak ke klaim:** C-005 memerlukan penetapan model stabil sebelum pengujian 3x5 final.

---

## F-020 | 2026-10-22 15:14 WIB | Fase 2
- **Kategori:** api
- **Severity:** P2
- **Gejala:** Panggilan API Gemini untuk sampel `late-night-hotfix` dan `works-on-machine` pada live-check opsi `--show-text` menghasilkan HTTP 503 ganda berturut-turut sehingga mengembalikan HTTP 502 `AI_GENERATION_FAILED`.
- **Perintah / konteks:** `node --env-file=.env.local scripts/live-check.mjs --show-text`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-020.txt`
- **Dugaan penyebab:** Kapasitas sementara server Gemini untuk model `gemini-3.5-flash` mengalami lonjakan beban (*high demand*) pada 2 dari 3 sampel.
- **Tindakan:** Memverifikasi penanganan error graceful dan mencetak teks keluaran AI untuk sampel yang berhasil (`rebase-conflict`).
- **Status:** dimitigasi
- **Bukti perbaikan:** Sampel `rebase-conflict` berhasil (HTTP 200) dan teks AI berhasil diekstraksi dan diverifikasi sesuai skema.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh.

---

## F-021 | 2026-10-22 18:30 WIB | Fase 2
- **Kategori:** data / pelaporan
- **Severity:** P2
- **Gejala:** Ketidakkonsistenan penulisan rincian per-baris pada tabel pesan balasan sebelumnya untuk gemini-2.5-flash (tertulis 429 pada dua jenis sampel sementara totalnya 0) serta dokumen `docs/evidence/model-probe-2026-10-22.md` awal belum menyertakan log status HTTP granular per panggilan mentah (72 panggilan).
- **Perintah / konteks:** Evaluasi hasil `docs/evidence/model-probe-2026-10-22.md` dan tabel balasan asisten.
- **Log mentah:** `docs/failures/raw/2026-10-22-F-021.txt`
- **Dugaan penyebab:** Agregasi in-memory skrip probe mengelompokkan hasil ke `summarizeResults` tanpa mencetak rincian status HTTP panggilan per panggilan ke dokumen bukti, dan terjadi kesalahan transkripsi nilai baris per jenis pada teks balasan.
- **Tindakan:** Menambahkan pencatatan status HTTP granular per panggilan mentah, menghitung ulang semua TOTAL dengan catatan rekonsiliasi di bawah tabel tanpa menghapus data historis, serta menambahkan opsi `--spacing-ms` (bawaan 8000ms) pada skrip probe dan live-check.
- **Status:** diperbaiki
- **Bukti perbaikan:** Status HTTP per panggilan mentah (72 status) dicatat di `docs/evidence/model-probe-2026-10-22.md` dengan rekonsiliasi tabel total yang tervalidasi.
- **Dampak ke klaim:** Tidak ada klaim publik yang terpengaruh; transparansi audit diperketat.

---

## F-022 | 2026-10-22 18:34 WIB | Fase 2
- **Kategori:** api
- **Severity:** P2
- **Gejala:** Panggilan API Gemini untuk sampel `rebase-conflict` dan `works-on-machine` pada live-check putaran 3 (dengan `--spacing-ms=8000`) menghasilkan galat HTTP 429 ganda (kuota laju permintaan/RPM terlampaui) sehingga route handler mengembalikan HTTP 502 `AI_GENERATION_FAILED`.
- **Perintah / konteks:** `node --env-file=.env.local scripts/live-check.mjs --show-text --spacing-ms=8000`
- **Log mentah:** `docs/failures/raw/2026-10-22-F-022.txt`
- **Dugaan penyebab:** Jeda antar-sampel 8 detik belum cukup untuk mereset kuota limit RPM/TPM pada akun pengujian Google Gemini setelah sampel pertama (`late-night-hotfix`) berhasil tereksekusi. Jeda retry 1,5 detik di dalam aplikasi masih berada dalam jendela exhaustion rate limit yang sama.
- **Tindakan:** Mengisolasi kegagalan secara aman (tidak ada kebocoran secret), mengekstrak teks keluaran AI untuk sampel yang berhasil (`late-night-hotfix`), dan mencatat data empiris di log dan DEC-018.
- **Status:** dimitigasi
- **Bukti perbaikan:** Teks keluaran AI sampel `late-night-hotfix` tervalidasi memenuhi gaya suara deadpan baru; rincian galat 429 dicatat tanpa regresi pada penanganan kesalahan.
- **Dampak ke klaim:** Pengujian final 3x5 (T-007b) memerlukan pengaturan jeda waktu yang memadai untuk menghindari batas laju 429.

---

## F-023 | 2026-10-24 10:24 WIB | Fase 2
- **Kategori:** git
- **Severity:** P2
- **Gejala:** Perintah `git push origin known-good-gate1` ditolak oleh GitHub remote hook dengan exit code 1 (`GH007: Your push would publish a private email address`).
- **Perintah / konteks:** `git push origin known-good-gate1`
- **Log mentah:** `docs/failures/raw/2026-10-24-F-023.txt`
- **Dugaan penyebab:** Pengaturan privasi email akun GitHub pemilik ("Block command line pushes that expose my email" di https://github.com/settings/emails) memblokir push tag `known-good-gate1` yang merujuk pada commit ber-email `zidanezulf@student.ub.ac.id` (bukan noreply GitHub).
- **Tindakan:** Mencatat F-023 dan melaporkan status galat GitHub GH007 ke Zidane agar dapat memilih opsi: (a) menonaktifkan sementara perlindungan email privasi di pengaturan GitHub, atau (b) menggunakan tag beranotasi dengan identitas noreply yang diizinkan.
- **Status:** diperbaiki
- **Bukti perbaikan:** Perlindungan email disesuaikan oleh pemilik, dan eksekusi ulang `git push origin known-good-gate1` sukses dengan exit code 0 (`* [new tag] known-good-gate1 -> known-good-gate1`).
- **Dampak ke klaim:** Tag `known-good-gate1` berhasil terdorong ke repositori remote GitHub.

---

## Catatan Koreksi & Klarifikasi F-005 | 2026-10-24 | Fase 2
- **Kategori:** klaim / kredensial
- **Merujuk ke:** F-005 (Kredensial API lama terunggah)
- **Klarifikasi / Pernyataan Pemilik:** Pemilik menyatakan key lama sudah dicabut di AI Studio pada 2026-10-22 (pernyataan pemilik, tidak diverifikasi agen).
- **Status:** terdokumentasi
- **Dampak ke klaim:** Dicatat di claims-register.md (C-011).

---

## F-024 | 2026-10-24 10:52 WIB | TypeScript error saat next build karena penugasan ke process.env.NODE_ENV di file tes
- **Kategori:** build / typescript
- **Severity:** P2
- **Gejala:** `npm run build` (melalui `scripts/verify.mjs`) gagal dengan exit code 1: `tests/confess.test.ts: error TS2540: Cannot assign to 'NODE_ENV' because it is a read-only property.`
- **Perintah / konteks:** `node scripts/verify.mjs` -> `next build`
- **Log mentah:** `docs/failures/raw/2026-10-24-F-024.txt`
- **Dugaan penyebab:** Type definition `@types/node` mendeklarasikan `process.env.NODE_ENV` sebagai read-only, sehingga penugasan langsung `process.env.NODE_ENV = "..."` pada file tes menyebabkan typecheck gagal saat Next.js mengompilasi.
- **Rencana perbaikan:** Gunakan type-cast `(process.env as Record<string, string | undefined>).NODE_ENV = ...` atau sesuaikan penugasan env di `tests/confess.test.ts` agar lulus type check TypeScript, lalu jalankan ulang `verify`.
- **Status:** diperbaiki
- **Bukti perbaikan:** Type-cast diterapkan di `tests/confess.test.ts`, eksekusi `node scripts/verify.mjs` berhasil dengan exit code 0 (`[PASS] Production build succeeded` dan `>>> VERIFY RESULT: ALL CHECKS PASSED <<<`).
- **Dampak ke klaim:** Fase A2 verifikasi lulus sepenuhnya.


