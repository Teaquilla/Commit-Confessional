# Rencana Eksekusi BWAI Basics: Antigravity (Build) + Auditor Independen (Audit)

**Hackathon:** Build With AI: Basics (Devpost, learn-ai-basics.devpost.com) **Pemilik:** Zidane Zulfanali Hafid **Deadline resmi:** 26 Okt 2026, 17.00 EDT (= 27 Okt 2026, 04.00 WIB) **Target submit internal:** Senin 26 Okt 2026, malam WIB (buffer ±6 jam) **Status dokumen:** v3, diperbarui 21 Okt 2026 (ditambah aturan lintas gate dan Demo Freeze, bukti AI, referensi, auditor GPT-OSS, dan hosting mandiri)

> **Asumsi kerja:** tema yang dieksekusi adalah **Commit Confessional & PR Therapist** dalam kemasan SaaS (GitHub-style PR description generator dengan panel Confession vs PR formal, plus Panic Score). Jika tema diganti (mis. Excuse Mirror), hanya Bagian 3 dan isi `devpost/*.md` yang berubah; seluruh proses, log, dan protokol audit tetap berlaku.

---

## 1. Tujuan dan batasan

**Tujuan:** menghasilkan satu Proof of Concept yang menjalankan **satu core loop end-to-end**, dikemas seperti produk SaaS (landing page, app, section pricing), lengkap dengan dokumen perencanaan wajib dan video demo 1-3 menit.

**Batasan dari aturan hackathon:**

- PoC kecil, target 2-4 jam kerja aktif untuk bagian inti.
- Repositori GitHub publik wajib memuat `devpost/scope.md`, `devpost/prd.md`, `devpost/spec.md` hasil proses *flipped interaction*.
- Juri menilai lewat **video demo**, tidak meng-clone atau menjalankan repo.
- Kriteria: **Design**, **Innovation (Unique Kernel)**, **Presentation**.
- Hindari tampilan generik/default LLM dan aplikasi AI generik.

**Batasan tambahan dari kita (scope lock):**

- "SaaS" berarti **kemasan dan positioning**, bukan infrastruktur. Auth, database multi-tenant, pembayaran, dan instalasi GitHub App sungguhan masuk daftar **Explicitly Cut**.
- Satu core loop, maksimal 2 layar app + 1 landing page.
- Tidak ada secret (API key) di repo.

---

## 2. Pembagian peran dan prinsip kerja

| Pihak | Peran | Boleh | Tidak boleh |
| --- | --- | --- | --- |
| **Zidane** | Pengambil keputusan | Menyetujui scope, memilih tema, memutuskan temuan audit | Melewati gate tanpa audit |
| **Antigravity (builder)** | Merencanakan dan membangun | Menulis kode, dokumen `devpost/*`, menjalankan perintah, mencatat log | Mengaudit pekerjaannya sendiri, mengubah scope tanpa persetujuan |
| **Auditor independen (GPT-OSS 120B Medium; Codex bila tersedia)** | Auditor independen | Membaca repo, menjalankan build/test/lint, menulis laporan di `docs/audit/` | Mengubah kode produk atau dokumen planning (hanya melaporkan) |

**Catatan peran auditor:** di seluruh dokumen ini 'Codex' berarti auditor independen. Saat ini auditornya GPT-OSS 120B (Medium) di percakapan baru yang terpisah dari builder (lihat Bagian 9.7). Jika Codex atau model lain yang lebih kuat tersedia, ia mengambil peran yang sama tanpa mengubah protokol.

**Prinsip:**

1. **Pemisahan builder dan auditor.** Auditor tidak ikut membangun supaya temuannya independen.
2. **Semua klaim harus berbukti.** Setiap 'selesai' di log harus menunjuk file, commit, perintah, atau screenshot.
3. **Audit di gate, bukan di akhir saja.** Ada 4 gate; masalah ditangkap lebih awal.
4. **Repo adalah satu-satunya sumber kebenaran.** Codex hanya mengandalkan isi repo, bukan ingatan percakapan.
5. **Kegagalan selalu dicatat, tidak pernah disembunyikan.** Setiap error dan kegagalan dicatat saat terjadi (Bagian 7A), termasuk klaim yang kemudian terbukti menyesatkan. Kegagalan yang tidak tercatat dihitung sebagai temuan P1.

---

## 3. Ringkasan produk (konteks untuk kedua agen)

**Nama kerja:** Commit Confessional **Unique Kernel:** developer menempelkan diff/commit panik; AI membuat **Confession** yang jujur dan lucu tentang apa yang sebenarnya terjadi, lalu **PR description formal** siap kirim ke tim. Setiap commit mendapat **Panic Score**. **Persona:** developer yang lelah setelah debugging larut malam. **Core loop:** paste diff/log commit -> AI menganalisis -> dua panel (Confession kiri, PR formal kanan) + Panic Score -> tombol salin. **Aha-moment video (30 detik pertama):** perbandingan instan panel komedi vs panel profesional. **Kemasan SaaS:** landing page, halaman app, section pricing 3 tier (Free / Pro / Team per seat). Pricing hanya presentasi, tidak ada billing.

**Explicitly Cut:** login, multi-user, pembayaran, webhook GitHub, riwayat tersimpan di database.

---

## 4. Struktur repositori

```
repo-root/
├── AGENTS.md                # aturan kerja semua agen (perintahkan eksplisit di awal sesi; pemuatan otomatis tidak terjamin)
├── README.md                # ringkasan, cara menjalankan, tautan video, Known limitations, Credits
├── .env.example             # nama variabel saja, tanpa nilai
├── devpost/
│   ├── scope.md             # wajib
│   ├── prd.md               # wajib
│   └── spec.md              # wajib
├── docs/
│   ├── plan/
│   │   └── execution-plan.md      # salinan dokumen ini
│   ├── STATE.md                   # status singkat + serah-terima sesi (diperbarui saat 'checkpoint')
│   ├── DEMO_READINESS.md          # daftar periksa video, Demo Freeze, submit
│   ├── references.md              # referensi dan kredit (model AI, font, pustaka, skill pack, inspirasi)
│   ├── decisions.md               # keputusan dan perubahan scope
│   ├── tasks/
│   │   └── TASK_TEMPLATE.md       # kontrak satu tugas untuk Fase 2
│   ├── log/
│   │   └── YYYY-MM-DD-NN.md       # log sesi Antigravity
│   ├── failures/
│   │   ├── failure-log.md         # kronologi kegagalan (append-only)
│   │   ├── claims-register.md     # register klaim berisiko menyesatkan
│   │   └── raw/                   # output error mentah (secret disamarkan)
│   ├── evidence/
│   │   ├── preset-runs.md         # 3 preset x 5 percobaan (hasil nyata)
│   │   └── eval-report.md         # opsional: himpunan held-out dan baseline
│   ├── reports/
│   │   └── failure-report-gate-N.md
│   └── audit/
│       └── gate-N-YYYY-MM-DD.md   # laporan auditor
├── scripts/                 # check-env, smoke-test (tidak pernah mencetak key)
├── tests/                   # tes unit (node:test)
└── src/ ...                 # kode produk
```

Catatan: `docs/` dan `AGENTS.md` boleh ikut publik; ini justru memperlihatkan proses yang disiplin.

---

## 5. Draft `AGENTS.md`

Salin isi ini ke `AGENTS.md` di root repo.

```markdown
# AGENTS.md

Awal setiap sesi: baca AGENTS.md, docs/STATE.md, dan tugas aktif di docs/tasks/.

## Konteks
Proyek hackathon BWAI Basics. Deadline 27 Okt 2026 04.00 WIB. PoC kecil, satu core loop.
Sumber kebenaran scope: devpost/scope.md. Jangan menambah fitur di luar scope tanpa entri di docs/decisions.md yang disetujui pemilik.

## Aturan umum (semua agen)
1. Baca devpost/scope.md, prd.md, spec.md sebelum bekerja.
2. Jangan commit secret. Jangan pernah membuka atau mencetak berkas .env*; jangan menaruh secret di argumen perintah; baca dari environment variable.
3. Jangan menambah auth, pembayaran, atau database multi-tenant.
4. Commit kecil dengan pesan jelas (format: tipe: ringkasan).
5. Setiap klaim 'selesai' harus punya bukti (file, commit, perintah, atau screenshot).
6. Pasang dependensi hanya dengan npm ci dari lockfile. Dependensi baru perlu alasan di docs/decisions.md.

## Pencatatan kegagalan (wajib, semua agen)
1. Setiap error, perintah gagal (exit code non-nol), panggilan API gagal, output AI rusak, retry, rollback, atau revert dicatat di docs/failures/failure-log.md pada saat terjadi, SEBELUM mencoba memperbaikinya.
2. Simpan output mentah (stack trace, stderr, respons API) di docs/failures/raw/. Samarkan secret.
3. Log bersifat append-only. Jangan menghapus atau menulis ulang entri lama; koreksi lewat entri baru yang merujuk ID lama.
4. Jangan menulis 'berhasil', 'selesai', 'lulus', 'sudah diuji', atau 'aman' tanpa bukti. Klaim seperti itu yang akan dipakai di README, landing page, video, atau laporan wajib didaftarkan di docs/failures/claims-register.md beserta buktinya.
5. Jika klaim sebelumnya terbukti salah atau menyesatkan, catat sebagai kegagalan kategori 'klaim', lalu koreksi di semua tempat klaim itu muncul.
6. Sebelum setiap gate, Builder menyusun docs/reports/failure-report-gate-N.md.
7. Kegagalan yang disembunyikan atau tidak dicatat dianggap pelanggaran proses.

## Build workflow (Builder)
1. Baca dan periksa kode serta status git sebelum mengubah apa pun.
2. Tulis rencana singkat: berkas yang berubah, pendekatan, tes, risiko.
3. Tantang rencana itu: adakah yang lebih sederhana? Apa yang terjadi pada input rusak dan kegagalan model? Apakah ini membuat demo lebih rapuh?
4. Implementasi seminimal mungkin, tanpa refactor di luar tugas.
5. Jalankan verifikasi. Jangan menyatakan berhasil jika tidak dijalankan; jika tidak bisa dijalankan, tulis penyebab persisnya.
6. Tinjau diff sendiri seperti PR orang lain.
7. Laporkan: berkas yang berubah, hasil verifikasi, risiko tersisa, hal yang sengaja dilewatkan.
Berhenti dan tanya jika: persyaratan bertentangan, cakupan melebar di luar tugas, butuh dependensi baru, perilaku privasi/keamanan tidak jelas, atau tugas tampak melanggar aturan hackathon.

## Recovery (saat ada yang rusak)
Jangan menambal acak. Urutan: kembali ke tag known-good terakhir (di salinan atau branch), reproduksi, isolasi, ukur, putuskan perbaikan atau rollback atau potong scope (jangan biarkan biaya yang sudah terpakai menentukan), verifikasi, catat di failure-log.md.

## Serah-terima sesi
Perintah 'checkpoint' dari pemilik berarti: perbarui docs/STATE.md.

## Builder (Antigravity)
- Tulis log sesi di docs/log/ memakai template log dan rujuk ID kegagalan (F-NNN) yang terjadi di sesi itu.
- Jalankan build/lint/test sebelum menyatakan tugas selesai dan catat hasilnya, termasuk yang gagal.
- Jangan menulis atau mengedit file di docs/audit/.
- Jika ada ketidakjelasan scope, catat di docs/decisions.md sebagai 'Pertanyaan' dan berhenti, jangan menebak.

## Auditor independen
- Hanya boleh menulis ke docs/audit/. Tidak mengubah src/, devpost/, atau berkas lain.
- Gunakan checklist di docs/plan/execution-plan.md Bagian 9.
- Verifikasi docs/failures/failure-log.md, claims-register.md, dan failure-report gate terkait. Kegagalan tak tercatat atau klaim menyesatkan wajib dilaporkan.
- Setiap temuan wajib: ID, severity (P0/P1/P2), lokasi file:baris, kutipan persis, dampak, rekomendasi.
- Jangan menyatakan menjalankan perintah yang tidak dijalankan; tulis TIDAK TERVERIFIKASI jika tidak bisa.
- Jangan memperbaiki temuan sendiri. Laporkan saja.

## Definisi selesai (per tugas)
Kode berjalan lokal, lint bersih, tes lolos, log sesi ditulis, semua kegagalan tercatat, tidak ada secret, sesuai scope.
```

---

## 6. Fase eksekusi dan gate

Semua tanggal dan waktu dalam WIB. Di setiap fase, semua kegagalan dicatat sesuai Bagian 7A, dan tidak ada gate yang dinyatakan lulus tanpa laporan kegagalan terbaru.

### Fase 0: Setup (Selasa 20 Okt)

**Tugas (Antigravity):**

- Buat repo di GitHub (mulai privat; jadikan publik saat submit), tambahkan `AGENTS.md`, struktur folder (Bagian 4), `.gitignore`, `.env.example`.
- Jalankan `npx skills add challengepost/learn-ai-basics --all -y`.
- Simpan dokumen ini ke `docs/plan/execution-plan.md`.

**Output:** repo kerangka, commit pertama. **Gate 0 (audit ringan Codex):** struktur sesuai, tidak ada secret, `.gitignore` benar, AGENTS.md ada.

### Fase 1: Planning dengan flipped interaction (Selasa-Rabu 20-21 Okt)

**Tugas (Antigravity + Zidane):**

- Jalankan skill `1-start` lalu `2-scope`; lanjutkan skill berikutnya sesuai urutan folder `skills/` di repo (cek daftar sebelum menjalankan).
- Hasilkan `devpost/scope.md`, `devpost/prd.md`, `devpost/spec.md`.
- Pastikan scope.md memuat: Unique Kernel, persona, core loop, aha-moment video, daftar **Explicitly Cut**.
- Spec memuat: stack, struktur komponen, kontrak input/output AI (skema JSON), prompt sistem, penanganan error.

**Output:** tiga dokumen wajib + `docs/decisions.md` berisi keputusan tema dan stack. **Gate 1 (audit Codex, wajib):** konsistensi scope-prd-spec, kelengkapan Explicitly Cut, kejelasan kontrak AI, kepatuhan terhadap aturan hackathon. **Tidak boleh mulai membangun sebelum Gate 1 tanpa temuan P0.**

### Fase 2: Build core loop (Kamis-Jumat 22-23 Okt)

**Tugas (Antigravity), urutan:**

1. Scaffold app (Next.js + Tailwind; panggilan Gemini API di route server dengan model dari AI\_MODEL\_NAME; deploy ke server milik teman tim, Vercel gratis sebagai cadangan).
2. Endpoint analisis: input diff/log -> output JSON `{ confession, pr_description, panic_score, panic_reasons[] }` sesuai spec.
3. UI app: input, dua panel, Panic Score, tombol salin, state loading dan error.
4. Contoh input bawaan (3 sampel diff berantakan) agar demo tidak bergantung ketikan live.
5. Deploy dan catat URL di README.

**Output:** aplikasi berjalan di URL publik, log sesi lengkap, commit kecil berurutan. **Gate 2 (audit Codex, wajib):** build/lint lolos, core loop sesuai spec, tidak ada secret, error handling dasar, tidak ada fitur di luar scope, API key hanya di server.

### Fase 3: Polish dan kemasan SaaS (Sabtu 24 Okt)

**Tugas (Antigravity):**

- Landing page (hero + aha-moment, cara kerja 3 langkah, section pricing 3 tier, CTA ke app).
- Polish visual: tipografi, palet, spacing, animasi ringan pada Panic Score. Hindari tampilan default.
- Responsif dan state kosong yang rapi.

**Output:** produk yang koheren secara visual. **Gate 3 (audit Codex, wajib):** sesuai rubrik juri (Bagian 9.4), aksesibilitas dasar, konsistensi pricing dengan scope (tidak ada klaim fitur yang tidak ada).

### Fase 4: Video dan submit (Minggu-Senin 25-26 Okt)

**Tugas (Zidane, dibantu Antigravity untuk naskah):**

- Naskah video 1-3 menit (Bagian 8), rekam, edit, unggah.
- Lengkapi README (deskripsi, cara menjalankan, tautan video, tautan app).
- Isi form Devpost, lampirkan repo publik.

**Gate 4 (audit akhir Codex, wajib, Senin 26 Okt sore):** checklist submit (Bagian 9.5). Tidak ada temuan P0 yang terbuka.

**Submit:** Senin 26 Okt malam WIB. Sisa waktu sampai 04.00 WIB 27 Okt hanya buffer darurat.

---

## 6A. Aturan tambahan lintas gate (v3)

Ide-ide ini terinspirasi struktur kerja repo teman tim (Teaquilla/Hakaton) dan ditulis ulang dengan kata-kata sendiri, bukan disalin.

**Demo Freeze (akhir Gate 3, Sabtu malam).** Kode, sample diff, nama model, dan teks landing dibekukan; hasil uji preset dikunci. Setelahnya hanya perbaikan kritis (P0/P1 yang mengancam demo), dan setiap perubahan dicatat di `failure-log.md` dan `decisions.md`. Tidak ada perubahan produk, gaya, atau fitur.

**Pemeriksaan manual oleh Zidane (Gate 2 dan 3).** Jalankan alur dari awal sampai Copy dari kondisi bersih, di komputer atau peramban lain atau ponsel, dengan 3 preset dan 1 input sendiri, lalu catat hasilnya di log sesi. Audit oleh model tidak menggantikan pemeriksaan ini.

**Titik kembali (known-good).** Setelah tiap gate lolos: `git tag known-good-gateN`.

**Urutan pemulihan saat ada yang rusak.** Jangan menambal acak. (1) Kembali ke tag known-good terakhir di salinan atau branch, (2) reproduksi, (3) isolasi, (4) ukur, (5) putuskan perbaikan, rollback, atau pemotongan scope (jangan biarkan biaya yang sudah terpakai menentukan), (6) verifikasi, (7) catat di `failure-log.md`.

**Penyedia AI bermasalah (503 atau 429 berulang).** Keputusan mengganti model ada pada Zidane. Langkahnya: ubah `AI_MODEL_NAME`, uji ulang 3 preset x 5, catat di DEC-004 dan `claims-register.md`. Tidak ada pergantian model otomatis.

**Serah-terima sesi.** `docs/STATE.md` diperbarui di akhir sesi atau saat perintah 'checkpoint'. Isinya: fase, verdict gate terakhir, tujuan berikutnya, hambatan, P0/P1 terbuka, hash commit, lokasi penting (URL repo, URL deploy, model), angka bukti uji, 'hal yang BELUM boleh dikerjakan', dan pesan serah-terima untuk sesi baru. Awal setiap sesi: perintahkan agen membaca `AGENTS.md`, `docs/STATE.md`, dan tugas aktif, karena pemuatan otomatis `AGENTS.md` tidak terjamin.

---

## 7. Template log sesi (Antigravity)

Simpan sebagai `docs/log/YYYY-MM-DD-NN.md`.

```markdown
# Log Sesi YYYY-MM-DD-NN

- **Fase / Gate:**
- **Tujuan sesi:**
- **Prompt utama yang diberikan:** (tempel ringkas)
- **File dibuat/diubah:** (daftar path)
- **Perintah yang dijalankan + hasil:** (build, lint, test; tempel ringkasan output, termasuk yang gagal)
- **Commit:** (hash + pesan)
- **Keputusan yang diambil:** (dan alasannya)
- **Kegagalan / error terjadi?** ya/tidak (jika ya: tulis ID F-NNN dari docs/failures/failure-log.md)
- **Klaim baru yang dibuat:** (ID C-NNN dari claims-register.md, bila ada)
- **Masalah / hambatan:**
- **Bukti selesai:** (screenshot, URL, output)
- **Menyimpang dari scope?** ya/tidak (jika ya, rujuk entri di decisions.md)
- **Langkah berikutnya:**
```

---

## 7A. Pencatatan kegagalan dan klaim menyesatkan

Setiap kegagalan dicatat saat terjadi oleh agen yang mengalaminya, lalu diringkas menjadi laporan per gate yang diverifikasi Codex. Kegagalan yang tidak tercatat dihitung sebagai temuan P1; klaim menyesatkan yang masuk ke materi submit dihitung P0.

### 7A.1 Yang wajib dicatat

- Error build, lint, test, runtime, dan deploy; setiap perintah dengan exit code non-nol.
- Panggilan API yang gagal: timeout, rate limit, respons tidak sesuai skema, output AI rusak atau mengarang.
- Percobaan ulang, rollback, atau revert, beserta alasannya.
- **Klaim menyesatkan:** pernyataan 'selesai', 'berhasil', 'lulus', 'sudah diuji', atau 'aman' yang tidak didukung bukti atau kemudian terbukti salah. Berlaku untuk log sesi, README, landing page, video, dan jawaban agen sendiri.
- Keluaran AI produk yang menyesatkan, misalnya PR description yang menyebut perubahan yang tidak ada di diff, atau Panic Score yang tidak cocok dengan alasannya.
- Pelanggaran scope atau aturan (secret hampir ter-commit, fitur di luar scope).
- Temuan audit yang ditolak atau ditunda, beserta alasannya.

### 7A.2 Berkas pencatatan

| Berkas | Isi | Ditulis oleh |
| --- | --- | --- |
| `docs/failures/failure-log.md` | Satu entri per kejadian, kronologis, append-only | Antigravity (Zidane boleh menambah) |
| `docs/failures/raw/YYYY-MM-DD-F-NNN.txt` | Output error mentah (stack trace, stderr, respons API), secret disamarkan | Antigravity |
| `docs/failures/claims-register.md` | Register klaim berisiko menyesatkan: klaim, lokasi, bukti, status | Antigravity; status diverifikasi Codex |
| `docs/reports/failure-report-gate-N.md` | Ringkasan kegagalan per gate | Antigravity menyusun, Codex memverifikasi |

**Aturan:** append-only. Jangan menghapus atau menulis ulang entri lama, bahkan setelah kegagalan diperbaiki; koreksi lewat entri baru yang merujuk ID lama. Entri ditulis **sebelum** mencoba perbaikan supaya kegagalan awal tidak hilang.

### 7A.3 Template entri `failure-log.md`

```markdown
## F-NNN | YYYY-MM-DD HH:MM WIB | Fase/Gate
- **Kategori:** build | lint | test | runtime | deploy | api | output-ai | klaim | scope | keamanan | proses
- **Severity:** P0 | P1 | P2
- **Gejala:** (apa yang terlihat; kutip pesan error utama)
- **Perintah / konteks:** (perintah, file, prompt, atau langkah pemicu)
- **Log mentah:** docs/failures/raw/<berkas>
- **Dugaan penyebab:** (tulis 'dugaan' bila belum terbukti)
- **Tindakan:** (fix, workaround, rollback, ditunda)
- **Status:** terbuka | diperbaiki | ditunda | tidak akan diperbaiki
- **Bukti perbaikan:** (commit, perintah ulang + hasilnya)
- **Dampak ke klaim:** (klaim di log/README/landing/video yang terpengaruh; ID C-NNN bila ada)
```

### 7A.4 Register klaim `claims-register.md`

Setiap klaim yang menyatakan sesuatu **berfungsi, lulus, aman, atau sudah diuji**, dan setiap janji di landing page atau pricing, wajib masuk register berikut bukti **sebelum** dipakai di README, landing page, atau video.

```markdown
| ID | Klaim | Lokasi (file / slide / menit video) | Bukti | Status | Catatan |
|---|---|---|---|---|---|
| C-001 | Core loop berjalan end-to-end | README, video 0:30 | commit abc123 + screenshot | terverifikasi | |
```

Status yang dipakai: `terverifikasi`, `tidak terbukti`, `menyesatkan`, `dikoreksi`. Klaim berstatus `tidak terbukti` atau `menyesatkan` tidak boleh muncul di materi submit.

### 7A.5 Laporan kegagalan per gate

Sebelum Codex mengaudit sebuah gate, Antigravity menyusun `docs/reports/failure-report-gate-N.md`:

```markdown
# Laporan Kegagalan Gate N: YYYY-MM-DD

- **Periode:** (dari gate sebelumnya sampai sekarang)
- **Entri baru:** P0 = x, P1 = y, P2 = z
- **Status:** terbuka = a, diperbaiki = b, ditunda = c

## Kegagalan penting
(ID, ringkasan satu baris, dampak, status)

## Klaim yang menyesatkan atau dikoreksi
(ID klaim, di mana muncul, koreksi yang dilakukan)

## Pola berulang
(kegagalan sejenis lebih dari sekali dan akar masalahnya)

## Kegagalan terbuka yang diketahui
(masuk ke bagian 'Known limitations' di README)
```

Codex memverifikasi: (1) setiap kegagalan yang terlihat di output build, riwayat commit bertipe fix/revert/retry, dan log sesi punya entri di `failure-log.md`; (2) bukti perbaikan benar, dijalankan ulang bila memungkinkan; (3) klaim di README, landing page, dan naskah video selaras dengan register; (4) laporan gate akurat dan lengkap.

Laporan gate terakhir menjadi dasar bagian **Known limitations** di README, ditulis jujur.

---

## 7B. Bukti AI (evaluasi ringan)

Prinsip (ide dari repo teman tim, bukan salinan): kualitas AI tidak boleh diklaim tanpa bukti, dan bukti kecil pun harus jujur. Pertanyaan yang dijawab: bagaimana kita tahu bagian AI membantu, dan di mana ia gagal?

### 7B.1 Dua jenis bukti

- **Keandalan:** 3 sample diff x 5 percobaan berturut-turut (kriteria pemilihan model di DEC-004), dicatat di `docs/evidence/preset-runs.md`: JSON valid, lolos guardrail, latensi, model, tanggal. Hanya hasil nyata, tanpa angka perkiraan.
- **Kualitas pagar (opsional, bila waktu cukup):** himpunan kecil yang tidak dipakai menyetel bobot Panic Score.

### 7B.2 Himpunan evaluasi

- 3 preset ditandai 'tuned' karena dipakai menyetel bobot, jadi tidak dihitung sebagai bukti kualitas.
- 5-8 kasus held-out: kasus normal, hanya-diff tanpa log commit, perubahan bergaya vibe coding dengan pesan rapi, input non-Inggris, input melebihi 10.000 karakter, dan input tidak masuk akal.
- Himpunan diberi versi dan asal-usul (ditulis sendiri), dan tidak diubah setelah melihat hasil tanpa catatan.

### 7B.3 Baseline dan metrik (stretch, hanya jika core loop selesai Jumat siang)

- Pembanding paling sederhana yang masuk akal: model yang sama dengan prompt polos (tanpa struktur dan guardrail) versus versi kita.
- Metrik: nama file karangan (nama file yang tidak ada di input) per keluaran, validitas skema JSON, dan latensi.
- Tujuan: mendukung klaim 'membatasi nama file karangan' dengan data, bukan menyatakan 'lebih akurat'. Jika tidak sempat dikerjakan, klaim itu tetap berstatus 'tidak terbukti' di `claims-register.md`.

### 7B.4 Taksonomi error

Subkategori untuk kategori `output-ai` di `failure-log.md`: `model_refusal`, `malformed_output`, `unsupported_claim` (nama file di luar input), `timeout`, `rate_limited`, `validation_failure`, `unknown`.

### 7B.5 Pelaporan dan integritas

- Laporkan: ukuran himpunan, hasil tiap metrik, mode gagal utama, dan keterbatasan. Jangan hanya angka agregat.
- Dilarang: menghapus kasus gagal secara diam-diam, mengganti metrik setelah melihat hasil tanpa dicatat, menyebut contoh pilihan sendiri sebagai benchmark, dan mengklaim kepastian statistik dari data kecil.
- Panic Score adalah heuristik tanpa ground truth. Yang diuji hanya konsistensinya (tes deterministik), bukan 'akurasinya'.

## 7C. Referensi dan kredit

- **Catat saat sebuah sumber menjadi bagian proyek, bukan saat submit.** Berkas: `docs/references.md`; ringkasannya masuk README bagian Credits.
- Format entri: judul, jenis (model, font, pustaka, skill pack, inspirasi, aset), dipakai untuk apa, sumber atau URL, lisensi atau ketentuan, dan catatan.
- Wajib dicatat: model AI (penyedia, ID model, peran, tanggal), font (IBM Plex; cek lisensi dan cara memuatnya), pustaka utama (Next.js, Tailwind, Zod, SDK Gemini) beserta lisensinya, skill pack Devpost (challengepost/learn-ai-basics) yang dipakai untuk perencanaan, inspirasi struktur kerja dari repo teman tim (tanpa menyalin isinya), dan sample diff (ditulis sendiri).
- Lisensi diisi dari sumber resminya, bukan dari ingatan.

---

## 8. Naskah video (kerangka)

| Waktu | Isi |
| --- | --- |
| 0:00-0:30 | Aha-moment langsung: tempel commit panik, tampilkan dua panel dan Panic Score |
| 0:30-1:15 | Core loop dengan 2 contoh berbeda, tunjukkan keunikan Confession |
| 1:15-1:50 | Kemasan SaaS singkat: landing, pricing tiga tier, siapa pembelinya |
| 1:50-2:30 | Mengapa unik (Unique Kernel) dan bagaimana prosesnya dibangun dengan skill pack Devpost |
| 2:30-3:00 | Penutup dan ajakan mencoba |

Tips: jangan membuka dengan penjelasan masalah panjang; tampilkan hasil lebih dulu.

---

## 9. Protokol audit Codex

### 9.1 Kapan dan input

Codex dijalankan pada **Gate 0-4**. Input: seluruh repo pada commit terbaru, dengan fokus pada `devpost/`, `docs/log/`, `docs/decisions.md`, dan `src/`.

### 9.2 Prompt standar untuk Codex

```text
Kamu adalah auditor independen untuk proyek hackathon BWAI Basics.
Baca AGENTS.md, devpost/scope.md, prd.md, spec.md, docs/decisions.md, semua log di docs/log/, serta docs/failures/failure-log.md, docs/failures/claims-register.md, dan docs/reports/failure-report-gate-<N>.md.
Audit untuk GATE <N> sesuai checklist di docs/plan/execution-plan.md Bagian 9.
Jangan mengubah kode atau dokumen planning. Tulis laporan ke docs/audit/gate-<N>-<tanggal>.md.
Setiap temuan wajib memuat: ID, severity (P0/P1/P2), lokasi file:baris, bukti, dampak, rekomendasi.
Verifikasi klaim di log dengan menjalankan perintah build/lint/test bila memungkinkan.
Periksa juga: apakah ada kegagalan yang tidak tercatat (bandingkan dengan riwayat commit fix/revert dan output build), apakah bukti perbaikan benar, dan apakah klaim di README, landing page, dan naskah video selaras dengan claims-register.md. Laporkan klaim yang tidak terbukti atau menyesatkan.
Akhiri dengan verdict: LULUS / LULUS DENGAN CATATAN / TIDAK LULUS.
```

### 9.3 Format laporan audit

```markdown
# Audit Gate N: YYYY-MM-DD

- **Commit yang diaudit:**
- **Verdict:**

## Ringkasan
(3-5 kalimat)

## Temuan
| ID | Severity | Lokasi | Temuan | Bukti | Dampak | Rekomendasi |
|---|---|---|---|---|---|---|

## Verifikasi klaim log
(klaim di log yang dicek dan hasilnya: terverifikasi / tidak terbukti)

## Verifikasi register kegagalan dan klaim
| Item | Hasil | Catatan |
|---|---|---|
| Semua kegagalan tercatat di failure-log.md | ya / tidak | (daftar yang tidak tercatat) |
| Bukti perbaikan benar | ya / tidak | |
| claims-register.md selaras dengan README, landing, video | ya / tidak | (klaim yang menyimpang) |
| failure-report-gate-N.md akurat | ya / tidak | |

## Hal yang sudah baik
```

**Severity:**

- **P0:** memblokir submit atau gate (secret bocor, app tidak jalan, dokumen wajib hilang, melanggar aturan hackathon).
- **P1:** merusak kualitas inti (core loop rapuh, scope creep, klaim tidak sesuai kenyataan).
- **P2:** perbaikan kualitas (polish, kejelasan, konsistensi).

### 9.4 Checklist audit per area

**A. Kepatuhan aturan hackathon**

- Ada `devpost/scope.md`, `prd.md`, `spec.md` dan isinya berasal dari proses perencanaan, bukan formalitas.
- Repo publik; video 1-3 menit ada; core loop terlihat bekerja di video.
- Bukan aplikasi AI generik; Unique Kernel terdefinisi dan terlihat di produk.

**B. Konsistensi dokumen**

- Scope, PRD, spec tidak saling bertentangan.
- Daftar Explicitly Cut dihormati di kode (tidak ada auth, pembayaran, database multi-tenant).
- Setiap fitur di app dapat ditelusuri ke PRD.

**C. Kualitas kode dan keamanan**

- Build dan lint lolos dari kondisi bersih (`clone -> install -> build`).
- Tidak ada secret di repo maupun riwayat commit; `.env.example` tanpa nilai.
- API key hanya dipakai di sisi server; input pengguna tidak dieksekusi; ada batas ukuran input.
- Error dan state loading ditangani; output AI divalidasi terhadap skema sebelum ditampilkan.

**D. Rubrik juri (Gate 3 dan 4)**

- **Design:** koheren, bukan tampilan default; hierarki visual jelas.
- **Innovation:** kernel terlihat dalam 30 detik pertama.
- **Presentation:** video ringkas, core loop jelas, tidak ada klaim fitur yang tidak ada.

**E. Integritas proses**

- Setiap klaim "selesai" di log punya bukti dan dapat diverifikasi.
- Perubahan scope tercatat di `docs/decisions.md`.
- Riwayat commit kecil dan bermakna.

**F. Kegagalan dan klaim**

- Setiap error atau kegagalan di output build, riwayat commit (fix/revert/retry), dan log sesi punya entri di `failure-log.md`; yang tidak tercatat = P1.
- Bukti perbaikan benar; Codex menjalankan ulang perintah bila memungkinkan.
- `claims-register.md` lengkap; tidak ada klaim 'berfungsi', 'aman', atau 'sudah diuji' di README, landing page, atau naskah video yang tidak terverifikasi.
- Klaim menyesatkan sudah dikoreksi di semua lokasi; klaim menyesatkan di materi submit = P0.
- Laporan kegagalan gate tersedia dan akurat; kegagalan terbuka tercantum di 'Known limitations' README.
- Keluaran AI produk (Confession, PR description, Panic Score) diuji terhadap diff: PR description tidak boleh menyebut perubahan yang tidak ada di diff.

**G. Bukti AI dan referensi**

- Bukti uji preset (3 x 5) ada di `docs/evidence/preset-runs.md` dengan hasil nyata, model, dan tanggal; tidak ada angka perkiraan.
- Jika himpunan held-out dibuat: tidak dipakai menyetel bobot, kasus gagal tidak dihapus diam-diam, dan metrik tidak diganti setelah melihat hasil tanpa catatan.
- Klaim tentang kualitas AI mencerminkan ukuran data; tidak ada klaim kepastian statistik dari data kecil.
- `docs/references.md` memuat model AI (penyedia, ID, peran), font, pustaka utama, skill pack, dan inspirasi; lisensi dicek dari sumber, bukan dari ingatan.

### 9.5 Checklist submit (Gate 4)

- [ ] Tiga dokumen di `devpost/` lengkap dan konsisten
- [ ] README berisi deskripsi, cara menjalankan, tautan app dan video, 'Known limitations' yang jujur, dan bagian Credits
- [ ] `docs/references.md` lengkap (model AI, font, pustaka utama, skill pack, inspirasi); lisensi dicek dari sumbernya
- [ ] App publik dapat diakses dan core loop berjalan dari kondisi bersih
- [ ] `docs/evidence/preset-runs.md` berisi hasil nyata 3 preset x 5 percobaan dengan model dan tanggal
- [ ] Video 1-3 menit terunggah dan dapat diputar tanpa login, diuji dari akun lain sesuai aturan Devpost
- [ ] Semua tautan (repo, video, app) diuji dari akun lain
- [ ] Daftar anggota tim di form Devpost benar
- [ ] Cek akhir terhadap aturan Devpost dilakukan dan dicatat
- [ ] Tidak ada secret di repo dan riwayat
- [ ] `failure-log.md`, `claims-register.md`, dan laporan kegagalan Gate 0-4 lengkap; tidak ada kegagalan P0 terbuka
- [ ] Tidak ada klaim berstatus 'tidak terbukti' atau 'menyesatkan' di README, landing page, atau video
- [ ] Demo Freeze dihormati: perubahan setelah freeze hanya perbaikan kritis dan tercatat; tag `known-good-gate3` ada
- [ ] Laporan audit Gate 0-4 ada di `docs/audit/`, tanpa P0 terbuka
- [ ] Repo dijadikan publik dan form Devpost terisi
- [ ] Submit dilakukan sebelum Senin 26 Okt malam WIB

### 9.6 Siklus penanganan temuan

1. Codex menulis laporan.
2. Zidane memutuskan: perbaiki, tunda, atau tolak (dengan alasan) dan mencatatnya di `docs/decisions.md`.
3. Antigravity memperbaiki dan menulis log sesi yang merujuk ID temuan.
4. Codex melakukan **re-audit terbatas** hanya pada temuan P0 dan P1.
5. Gate dinyatakan lulus bila tidak ada P0 terbuka.

### 9.7 Menjalankan auditor GPT-OSS 120B (Medium)

Model ini lebih lemah dan lebih mudah melewatkan langkah atau mengarang temuan, jadi proses di sekelilingnya yang menjaga kualitas. Pelajaran dari percobaan audit Gate 1 pertama: laporan tanpa verdict, tanpa hasil per pemeriksaan, dan tanpa daftar perintah tidak dihitung sebagai gate.

- Gunakan **percakapan baru dan kosong**, bukan lanjutan sesi builder. Penulisan berkas perlu persetujuan, dan hanya laporan audit yang boleh ditulis.
- Minta **satu bagian pemeriksaan per pesan** (B, lalu C, lalu D, lalu E), bukan semuanya sekaligus.
- **Pemindaian rahasia dijalankan Zidane sendiri**, hasilnya ditempel ke laporan:

```powershell
git ls-files | Select-String "\.env"            # hanya .env.example yang boleh muncul
git grep -n -I -E "AIza|AQ\.|sk-|BEGIN PRIVATE KEY"   # tidak boleh ada hasil berisi key
git log --all -S"AIza" --oneline                # harus kosong
```

- Setelah audit, `git status --short` harus hanya menunjukkan satu berkas baru di `docs/audit/`. Jika ada berkas lain berubah: pelanggaran proses, pulihkan dengan `git restore` dan catat di `failure-log.md`.
- Periksa **3 temuan acak** terhadap berkas aslinya. Jika ada kutipan yang tidak ada di berkas, laporan tidak dipercaya dan diulang.
- Auditor tidak boleh membuka berkas `.env*` dan tidak boleh mencetak nilai secret.

### 9.8 Prompt auditor per bagian (Gate 1)

Dipakai di percakapan baru dan kosong dengan GPT-OSS 120B (Medium). Kirim **satu pesan per langkah** dan tunggu jawabannya sebelum pesan berikutnya. Prompt ini menggantikan prompt Gate 1 tunggal yang panjang, karena model yang lebih lemah lebih andal pada tugas pendek.

**Pesan 1: peran dan aturan**

```text
PERAN
Kamu auditor independen untuk proyek hackathon 'Commit Confessional'. Kamu TIDAK ikut membangunnya dan tidak punya konteks sebelumnya. Tugasmu mencari masalah, bukan memuji. Tulis laporan dalam bahasa Indonesia; kutipan dari berkas tetap dalam bahasa aslinya.

ATURAN MUTLAK
1. Kamu hanya boleh membuat SATU berkas: docs/audit/gate-1-<tanggal>.md. Jangan membuat, mengubah, atau menghapus berkas lain. Jangan menjalankan git add, commit, reset, checkout, atau perintah lain yang mengubah berkas.
2. Jangan pernah membuka, membaca, atau mencetak berkas yang namanya diawali '.env'. Jangan mencetak nilai secret. Jika menemukan sesuatu yang tampak seperti secret, laporkan hanya path dan nomor baris.
3. Setiap temuan wajib memuat kutipan persis dari berkas, path, dan nomor baris. Tanpa kutipan, jangan laporkan.
4. Jangan menyatakan menjalankan perintah atau memeriksa sesuatu kecuali benar-benar kamu lakukan dan bisa menempelkan keluarannya. Jika tidak bisa diverifikasi, tulis TIDAK TERVERIFIKASI beserta alasannya.
5. Jangan mengarang masalah. 'Tidak ada temuan' adalah hasil yang sah.
6. Kerjakan HANYA bagian yang diminta di setiap pesan, lalu berhenti dan tunggu pesan berikutnya.

SEVERITY
P0: memblokir gate (secret terbuka, dokumen wajib hilang atau belum approved, aturan hackathon dilanggar, klaim palsu di dokumen submit).
P1: merusak kualitas (dokumen saling bertentangan, klaim tidak terbukti ditulis sebagai fakta, kegagalan tidak tercatat).
P2: kejelasan atau konsistensi kecil.

Balas hanya dengan: 'Siap. Menunggu bagian pertama.'
```

**Pesan 2: bagian A dan B (aturan dan konsistensi)**

```text
Baca: AGENTS.md, devpost/scope.md, devpost/prd.md, devpost/spec.md, docs/decisions.md.
Kerjakan HANYA bagian A dan B, lalu berhenti.
A1. Ketiga dokumen devpost ada dan front matter-nya 'status: approved'.
A2. Ketiga dokumen berbahasa Inggris (laporkan teks non-Inggris yang bukan kutipan).
B. Bandingkan antar scope.md, prd.md, spec.md dan laporkan SETIAP ketidakcocokan dengan kutipan dari kedua berkas: B1 pita severity dan rentang angkanya; B2 lima sinyal Panic Score dan poin maksimumnya; B3 batas input 10.000 karakter dan teks peringatan pemotongan; B4 label tombol; B5 daftar Explicitly Cut vs Non-Goals vs spec; B6 batas waktu (28 detik total, retry hanya jika sisa 10 detik, proxy 35 detik, dan penyebutan '30s' di tempat lain); B7 nama tiga preset; B8 nama model dan fakta tentangnya.
Untuk tiap item tulis: LULUS / ADA TEMUAN / TIDAK TERVERIFIKASI + satu baris alasan.
```

**Pesan 3: bagian C (klaim berisiko)**

```text
Baca: devpost/scope.md, prd.md, spec.md, docs/decisions.md, docs/failures/claims-register.md.
Kerjakan HANYA bagian C, lalu berhenti.
C1. Cari kata-kata ini di ketiga dokumen devpost dan docs/decisions.md, laporkan setiap pemakaian dengan kutipan: eliminate, never, always, guarantee, 100%, perfect, zero, verified, validated, proven, accurate, hallucination, secure, safe. Untuk tiap pemakaian, nyatakan apakah kalimat itu didukung bukti di repo.
C2. Untuk setiap baris di claims-register.md: cocokkan status (terverifikasi / tidak terbukti / ...) dengan cara klaim itu ditulis di dokumen. Laporkan klaim yang ditulis sebagai fakta padahal statusnya 'tidak terbukti'.
```

**Pesan 4: bagian D (rahasia), dijalankan Zidane sendiri**

Zidane menjalankan tiga perintah di Bagian 9.7 dan menempelkan keluarannya:

```text
Berikut hasil pemindaian rahasia yang kujalankan sendiri. Masukkan apa adanya ke bagian D laporan, tanpa menafsirkan ulang dan tanpa mencetak nilai apa pun. Periksa juga: .gitignore mengabaikan '.env*' kecuali '.env.example', dan .env.example hanya berisi nama variabel tanpa nilai (JANGAN membuka .env.local).

[tempel keluaran tiga perintah]
```

**Pesan 5: bagian E dan F (proses dan tes)**

```text
Baca: AGENTS.md, docs/failures/failure-log.md, docs/failures/raw/, docs/log/, docs/decisions.md, dan tests/ (jika ada). Gunakan 'git log --oneline' untuk riwayat commit.
Kerjakan HANYA bagian E dan F, lalu berhenti.
E1. Setiap kegagalan (F-xxx) punya kategori, severity, status, dan bukti perbaikan atau alasan masih terbuka.
E2. Setiap keputusan (DEC-xxx) punya tanggal dan alasan.
E3. Untuk tiap log sesi: apakah mencatat perintah yang dijalankan dan kegagalan? Bandingkan dengan 'git log': adakah commit yang pesannya menyebut fix, revert, atau error tetapi tidak punya entri di failure-log.md? Daftarkan.
E4. AGENTS.md memuat aturan pencatatan kegagalan, larangan membuka .env*, dan scope lock (tanpa auth, pembayaran, database).
F1. Jika ada tests/, jalankan 'node --test tests/' dan tempel keluarannya. Jika gagal dijalankan, laporkan galatnya persis dan JANGAN memperbaikinya. Jika tidak bisa dijalankan, tulis TIDAK TERVERIFIKASI.
```

**Pesan 6: susun laporan**

```text
Susun laporan lengkap dari semua jawaban sebelumnya ke docs/audit/gate-1-<tanggal>.md dengan format:
# Audit Gate 1: <tanggal>
- Commit yang diaudit: (keluaran git rev-parse --short HEAD)
- Verdict: LULUS / LULUS DENGAN CATATAN / TIDAK LULUS (TIDAK LULUS jika ada P0 terbuka)
## Ringkasan (3-5 kalimat)
## Hasil per pemeriksaan (A1, A2, B1-B8, C1, C2, D, E1-E4, F1 masing-masing LULUS / ADA TEMUAN / TIDAK TERVERIFIKASI + satu baris alasan)
## Temuan
| ID | Severity | Lokasi (file:baris) | Kutipan persis | Dampak | Rekomendasi |
## Perintah yang dijalankan (dengan keluarannya; tanpa secret)
## Hal yang tidak bisa diverifikasi
## Hal yang sudah baik
Setelah selesai, jalankan 'git status --short' dan tempel keluarannya di akhir balasanmu. Jangan memperbaiki apa pun.
```

Untuk Gate 2 sampai 4, ganti bagian A dan B dengan area C dan D dari Bagian 9.4 (kode, keamanan, rubrik juri) memakai pola yang sama: satu bagian per pesan, kutipan wajib, dan pemindaian rahasia dijalankan sendiri.

---

## 10. Prompt awal untuk Antigravity

Tambahkan blok ini di akhir **setiap** misi di bawah:

```text
Catat setiap error, perintah gagal, retry, rollback, output AI rusak, dan klaim yang tidak bisa kamu buktikan di docs/failures/failure-log.md sesuai Bagian 7A, saat kejadian dan sebelum memperbaikinya. Simpan output mentah di docs/failures/raw/ dengan secret disamarkan. Jangan menyatakan 'selesai', 'berhasil', atau 'lulus' tanpa bukti; daftarkan klaim penting di docs/failures/claims-register.md. Sebelum gate, susun docs/reports/failure-report-gate-N.md.
```

### 10.1 Misi Fase 0

```text
Buat repo kerangka untuk proyek hackathon BWAI Basics sesuai struktur di docs/plan/execution-plan.md Bagian 4.
Tambahkan AGENTS.md dari Bagian 5, .gitignore, .env.example tanpa nilai, dan README awal.
Jangan menulis kode produk dulu. Tulis log sesi sesuai template Bagian 7 dan commit.
```

### 10.2 Misi Fase 1

```text
Jalankan skill 1-start lalu 2-scope dari learn-ai-basics untuk tema Commit Confessional & PR Therapist (kemasan SaaS).
Gunakan pola flipped interaction: ajukan pertanyaan kepadaku, jangan mengisi asumsi sendiri.
Hasilkan devpost/scope.md, prd.md, spec.md. Pastikan ada daftar Explicitly Cut yang mencakup auth, pembayaran, multi-tenant, dan integrasi GitHub App.
Catat keputusan di docs/decisions.md dan tulis log sesi.
```

### 10.3 Misi Fase 2

```text
Bangun core loop sesuai devpost/spec.md, berurutan: scaffold, endpoint analisis (JSON terstruktur), UI dua panel + Panic Score, sampel diff bawaan, deploy.
Patuhi AGENTS.md dan scope lock. Jalankan build dan lint setelah tiap langkah dan catat hasilnya di log.
Jika ada hal di luar spec, berhenti dan catat sebagai Pertanyaan di docs/decisions.md.
```

### 10.4 Misi Fase 3

```text
Buat landing page (hero dengan aha-moment, 3 langkah cara kerja, pricing 3 tier hanya sebagai presentasi, CTA).
Polish visual aplikasi agar tidak terlihat default: tentukan satu palet dan satu pasangan tipografi, terapkan konsisten.
Jangan mengklaim fitur yang tidak ada. Tulis log sesi.
```

### 10.5 Misi tambahan: berkas tata kerja (v3)

```text
Baca AGENTS.md dulu. Lakukan perubahan berikut, ditulis dengan kata-kata sendiri (jangan menyalin teks dari repo lain). Catat di docs/decisions.md bahwa ini terinspirasi struktur kerja repo teman tim (Teaquilla/Hakaton) tanpa menyalin isinya.

1. AGENTS.md: samakan dengan Bagian 5 versi terbaru (Build workflow, Recovery, perintah 'checkpoint', aturan npm ci, aturan .env, kalimat awal sesi).
2. docs/tasks/TASK_TEMPLATE.md: ID, tujuan (satu hasil yang bisa diamati), alasan (termasuk kriteria juri terkait), konteks, berkas yang dibaca dulu, persyaratan, di luar scope, batasan, invarian, kasus tepi (input rusak, timeout, kegagalan penyedia, hasil kosong), kriteria selesai yang bisa diamati dari luar, perintah verifikasi dan keluaran yang ditempel, anggaran perubahan (jika pekerjaan melebihinya secara material: berhenti dan tanya), ID kegagalan F-xxx dan klaim C-xxx terkait.
3. docs/DEMO_READINESS.md satu halaman: URL app bisa dibuka dari jaringan lain; 3 sample diff lolos 5 kali berturut-turut dengan model yang dicatat; tidak ada satu respons model yang bisa menghancurkan demo; rencana cadangan jika API gagal dan rekaman cadangan; tidak ada secret atau .env di layar atau riwayat terminal; notifikasi mati dan layar terbaca; 30 detik pertama menampilkan tempel lalu dua panel berdampingan; durasi 1-3 menit; tautan video diuji dari akun lain; setiap klaim di narasi cocok dengan claims-register.md. Tambahkan bagian Demo Freeze dan bagian Submission (semua tautan diuji dari akun lain, daftar anggota tim benar, cek akhir terhadap aturan Devpost).
4. docs/STATE.md satu halaman: fase, verdict gate terakhir, tujuan berikutnya, hambatan, P0/P1 terbuka, hash commit terakhir, lokasi penting (URL repo, URL deploy, model yang dipakai), angka bukti uji terbaru, 'hal yang BELUM boleh dikerjakan', dan pesan serah-terima untuk memulai sesi baru.
5. docs/evidence/preset-runs.md: tabel kosong dengan kolom preset, percobaan (1-5), JSON valid, lolos guardrail, latensi, model, tanggal. Diisi hanya dengan hasil nyata.
6. docs/evidence/eval-report.md: kerangka kosong (opsional) untuk himpunan held-out, baseline, metrik, mode gagal utama, dan keterbatasan, sesuai Bagian 7B.
7. docs/references.md: kerangka dengan format entri dan entri awal yang benar-benar sudah terjadi (model AI dari DEC-004, skill pack Devpost, inspirasi struktur kerja dari repo teman tim). Lisensi font dan pustaka diisi hanya setelah dicek dari sumbernya.
8. Setelah semuanya di-commit dan git status bersih: git tag known-good-gate1 (jangan push dulu). Tampilkan diff dan hasil perintahnya.
```

---

## 11. Risiko dan fallback

| Risiko | Dampak | Mitigasi / fallback |
| --- | --- | --- |
| Output AI tidak konsisten | Demo gagal | Skema JSON ketat + validasi + sampel bawaan yang sudah diuji |
| Scope creep (mis. tergoda menambah login/billing) | Waktu habis | Scope lock di AGENTS.md; audit Gate 2 memeriksa |
| Deploy bermasalah mendekati deadline | Tidak ada URL publik | Deploy sudah di Fase 2; fallback: demo lokal di video + README cara menjalankan |
| API key bocor | P0 | `.env`, pemindaian audit di tiap gate, rotasi key bila perlu |
| Visual terlihat generik | Skor Design turun | Waktu polish khusus hari Sabtu; satu palet, satu tipografi |
| Codex menemukan masalah besar di Gate 3-4 | Waktu mepet | Gate dijadwalkan dengan jeda; perbaiki hanya P0/P1; P2 masuk daftar "Later" |
| Terlambat submit karena zona waktu | Gugur | Target internal Senin malam WIB; ingat 17.00 EDT = 04.00 WIB 27 Okt |
| Klaim menyesatkan lolos ke README, landing page, atau video | Integritas turun, penilaian Presentation dan Design bisa dipertanyakan | Register klaim (Bagian 7A.4), audit area F di tiap gate, kegagalan terbuka dicantumkan di Known limitations |
| Model utama 503 atau rate limit berulang | Alur utama gagal saat demo | Zidane memutuskan mengganti AI\_MODEL\_NAME, uji ulang 3 preset x 5 dan catat di DEC-004; tidak ada pergantian otomatis; rekaman cadangan siap |
| Perubahan terlambat setelah Demo Freeze | Demo yang sudah teruji jadi rusak | Demo Freeze di akhir Gate 3, tag known-good-gate3, hanya perbaikan kritis yang tercatat |
| Auditor model tidak teliti atau mengarang temuan | Gate lolos palsu | Satu bagian per pesan, pemindaian rahasia dijalankan sendiri, cek 3 temuan acak, git status setelah audit (Bagian 9.7) |
| Server teman tidak siap saat Gate 2 | Tidak ada URL publik | Deployment checklist di spec; Vercel gratis sebagai cadangan; video direkam dari versi lokal bila perlu |

---

## 12. Ringkasan jadwal

| Tanggal | Fase | Gate |
| --- | --- | --- |
| Selasa 20 Okt | Fase 0 setup; mulai Fase 1 | Gate 0 |
| Rabu 21 Okt | Fase 1 selesai (scope, prd, spec) | Gate 1 |
| Kamis-Jumat 22-23 Okt | Fase 2 build core loop + deploy | Gate 2 (Jumat malam) |
| Sabtu 24 Okt | Fase 3 polish + landing + pricing | Gate 3 + Demo Freeze (Sabtu malam) |
| Minggu 25 Okt | Fase 4 video | (re-audit P0/P1 bila ada) |
| Senin 26 Okt | Audit akhir + submit | Gate 4 (sore), submit malam |
