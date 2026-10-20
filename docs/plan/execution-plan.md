# Rencana Eksekusi BWAI Basics: Antigravity (Build) + Codex (Audit)

**Hackathon:** Build With AI: Basics (Devpost, learn-ai-basics.devpost.com) **Pemilik:** Zidane Zulfanali Hafid **Deadline resmi:** 26 Okt 2026, 17.00 EDT (= 27 Okt 2026, 04.00 WIB) **Target submit internal:** Senin 26 Okt 2026, malam WIB (buffer ±6 jam) **Status dokumen:** v2, diperbarui 20 Okt 2026 (ditambah pencatatan kegagalan dan laporan klaim menyesatkan)

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
| **Codex (auditor)** | Auditor independen | Membaca repo, menjalankan build/test/lint, menulis laporan di `docs/audit/` | Mengubah kode produk atau dokumen planning (hanya melaporkan) |

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
├── AGENTS.md                # aturan kerja untuk semua agen (dibaca Codex; juga dipasang sebagai rule workspace di Antigravity)
├── README.md                # ringkasan, cara menjalankan, tautan video, Known limitations
├── devpost/
│   ├── scope.md             # wajib
│   ├── prd.md               # wajib
│   └── spec.md              # wajib
├── docs/
│   ├── plan/
│   │   └── execution-plan.md      # salinan dokumen ini
│   ├── log/
│   │   └── YYYY-MM-DD-NN.md       # log sesi Antigravity
│   ├── failures/
│   │   ├── failure-log.md         # kronologi semua kegagalan (append-only)
│   │   ├── claims-register.md     # register klaim berisiko menyesatkan
│   │   └── raw/                   # output error mentah (secret disamarkan)
│   ├── reports/
│   │   └── failure-report-gate-N.md  # laporan kegagalan per gate
│   ├── audit/
│   │   └── gate-N-YYYY-MM-DD.md   # laporan audit Codex
│   └── decisions.md               # catatan keputusan dan perubahan scope
├── src/ ...                 # kode produk
└── .env.example             # tanpa nilai rahasia
```

Catatan: `docs/` dan `AGENTS.md` boleh ikut publik; ini justru memperlihatkan proses yang disiplin.

---

## 5. Draft `AGENTS.md`

Salin isi ini ke `AGENTS.md` di root repo.

```markdown
# AGENTS.md

## Konteks
Proyek hackathon BWAI Basics. Deadline 27 Okt 2026 04.00 WIB. PoC kecil, satu core loop.
Sumber kebenaran scope: devpost/scope.md. Jangan menambah fitur di luar scope tanpa entri di docs/decisions.md yang disetujui pemilik.

## Aturan umum (semua agen)
1. Baca devpost/scope.md, prd.md, spec.md sebelum bekerja.
2. Jangan commit secret. Gunakan .env dan perbarui .env.example.
3. Jangan menambah auth, pembayaran, atau database multi-tenant.
4. Commit kecil dengan pesan jelas (format: tipe: ringkasan).
5. Setiap klaim 'selesai' harus punya bukti (file, commit, perintah, atau screenshot).

## Pencatatan kegagalan (wajib, semua agen)
1. Setiap error, perintah gagal (exit code non-nol), panggilan API gagal, output AI rusak, retry, rollback, atau revert dicatat di docs/failures/failure-log.md pada saat terjadi, SEBELUM mencoba memperbaikinya.
2. Simpan output mentah (stack trace, stderr, respons API) di docs/failures/raw/. Samarkan secret.
3. Log bersifat append-only. Jangan menghapus atau menulis ulang entri lama; koreksi lewat entri baru yang merujuk ID lama.
4. Jangan menulis 'berhasil', 'selesai', 'lulus', 'sudah diuji', atau 'aman' tanpa bukti. Klaim seperti itu yang akan dipakai di README, landing page, video, atau laporan wajib didaftarkan di docs/failures/claims-register.md beserta buktinya.
5. Jika klaim sebelumnya terbukti salah atau menyesatkan, catat sebagai kegagalan kategori 'klaim', lalu koreksi di semua tempat klaim itu muncul.
6. Sebelum setiap gate, Builder menyusun docs/reports/failure-report-gate-N.md.
7. Kegagalan yang disembunyikan atau tidak dicatat dianggap pelanggaran proses.

## Builder (Antigravity)
- Tulis log sesi di docs/log/ memakai template log dan rujuk ID kegagalan (F-NNN) yang terjadi di sesi itu.
- Jalankan build/lint/test sebelum menyatakan tugas selesai dan catat hasilnya, termasuk yang gagal.
- Jangan menulis atau mengedit file di docs/audit/.
- Jika ada ketidakjelasan scope, catat di docs/decisions.md sebagai 'Pertanyaan' dan berhenti, jangan menebak.

## Auditor (Codex)
- Mode read-only terhadap src/ dan devpost/. Hanya boleh menulis ke docs/audit/.
- Gunakan checklist di docs/plan/execution-plan.md Bagian 9.
- Verifikasi docs/failures/failure-log.md, claims-register.md, dan failure-report gate terkait. Kegagalan tak tercatat atau klaim menyesatkan wajib dilaporkan.
- Setiap temuan wajib: ID, severity (P0/P1/P2), lokasi file:baris, bukti, dampak, rekomendasi.
- Jangan memperbaiki temuan sendiri. Laporkan saja.

## Definisi selesai (per tugas)
Kode berjalan lokal, lint bersih, log sesi ditulis, semua kegagalan tercatat, tidak ada secret, sesuai scope.
```

---

## 6. Fase eksekusi dan gate

Semua tanggal dan waktu dalam WIB. Di setiap fase, semua kegagalan dicatat sesuai Bagian 7A, dan tidak ada gate yang dinyatakan lulus tanpa laporan kegagalan terbaru.

### Fase 0: Setup (Selasa 20 Okt)

**Tugas (Antigravity):**

- Buat repo publik, tambahkan `AGENTS.md`, struktur folder (Bagian 4), `.gitignore`, `.env.example`.
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

1. Scaffold app (stack usulan: Next.js + Tailwind, panggilan Claude API di route server, deploy Vercel).
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

### 9.5 Checklist submit (Gate 4)

- [ ] Tiga dokumen di `devpost/` lengkap dan konsisten
- [ ] README berisi deskripsi, cara menjalankan, tautan app dan video, serta 'Known limitations' yang jujur
- [ ] App publik dapat diakses dan core loop berjalan dari kondisi bersih
- [ ] Video 1-3 menit terunggah dan dapat diputar tanpa login
- [ ] Tidak ada secret di repo dan riwayat
- [ ] `failure-log.md`, `claims-register.md`, dan laporan kegagalan Gate 0-4 lengkap; tidak ada kegagalan P0 terbuka
- [ ] Tidak ada klaim berstatus 'tidak terbukti' atau 'menyesatkan' di README, landing page, atau video
- [ ] Laporan audit Gate 0-4 ada di `docs/audit/`, tanpa P0 terbuka
- [ ] Form Devpost terisi, repo publik terlampir
- [ ] Submit dilakukan sebelum Senin 26 Okt malam WIB

### 9.6 Siklus penanganan temuan

1. Codex menulis laporan.
2. Zidane memutuskan: perbaiki, tunda, atau tolak (dengan alasan) dan mencatatnya di `docs/decisions.md`.
3. Antigravity memperbaiki dan menulis log sesi yang merujuk ID temuan.
4. Codex melakukan **re-audit terbatas** hanya pada temuan P0 dan P1.
5. Gate dinyatakan lulus bila tidak ada P0 terbuka.

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

---

## 12. Ringkasan jadwal

| Tanggal | Fase | Gate |
| --- | --- | --- |
| Selasa 20 Okt | Fase 0 setup; mulai Fase 1 | Gate 0 |
| Rabu 21 Okt | Fase 1 selesai (scope, prd, spec) | Gate 1 |
| Kamis-Jumat 22-23 Okt | Fase 2 build core loop + deploy | Gate 2 (Jumat malam) |
| Sabtu 24 Okt | Fase 3 polish + landing + pricing | Gate 3 (Sabtu malam) |
| Minggu 25 Okt | Fase 4 video | (re-audit P0/P1 bila ada) |
| Senin 26 Okt | Audit akhir + submit | Gate 4 (sore), submit malam |
