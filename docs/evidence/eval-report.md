# Laporan Evaluasi Kualitas AI (Opsional — Sesuai Bagian 7B)

Dokumen ini menyediakan kerangka kerja evaluasi ringan untuk memvalidasi efektivitas output guardrails dan prompt terstruktur Commit Confessional terhadap himpunan data uji *held-out* (terpisah dari 3 preset yang digunakan untuk penyetelan awal).

---

## 1. Himpunan Kasus Uji Held-Out
Himpunan kasus uji independen (5–8 kasus uji spesifik):
1. **Kasus Normal:** Git diff standar dengan commit messages deskriptif.
2. **Hanya-Diff:** Unified diff murni tanpa log commit.
3. **Vibe Coding:** Perubahan masif dengan commit message rapi/generik buatan AI.
4. **Input Non-Inggris:** Log commit dan komentar kode dalam bahasa selain Inggris.
5. **Batas Ukuran (>10.000 Karakter):** Diff besar untuk menguji mekanisme pemotongan (*truncation*).
6. **Input Tak Masuk Akal (Nonsensical):** Teks acak atau kode tanpa penanda diff untuk menguji penolakan ramah.

| ID Kasus | Deskripsi Skenario | Panjang Input (karakter) | Karakteristik Kunci |
|---|---|---|---|
| TC-01 | | | |
| TC-02 | | | |
| TC-03 | | | |
| TC-04 | | | |
| TC-05 | | | |
| TC-06 | | | |

---

## 2. Pembanding (Baseline vs Implementasi Kita)
- **Baseline:** Model yang sama menggunakan prompt polos tanpa pembatasan skema terstruktur Zod dan tanpa validasi output guardrails.
- **Implementasi Kita:** Model yang sama dengan delimitasi input ketat, skema JSON terstruktur, dan validator output guardrails (pemeriksaan nama berkas terhadap input).

---

## 3. Metrik Pengukuran
1. **Nama File Karangan (Invented Files):** Rata-rata kemunculan nama berkas di teks AI yang tidak ada dalam input.
2. **Validitas Skema JSON:** Persentase respons yang lolos parsing skema tanpa error struktur.
3. **Latensi Eksekusi:** Waktu respons dari pengiriman request hingga penerimaan hasil lengkap.

| Metrik | Baseline (Prompt Polos) | Implementasi Kita (Guardrails + Schema) | Catatan Observasi |
|---|---|---|---|
| Rata-rata Nama File Karangan | | | |
| Validitas Skema JSON (%) | | | |
| Rata-rata Latensi (ms) | | | |

---

## 4. Taksonomi Mode Kegagalan (Failure Modes)
Kategori kegagalan yang diamati selama pengujian:
- `model_refusal`: Model menolak memproses input karena kebijakan keamanan.
- `malformed_output`: Format JSON rusak atau terpotong sebelum selesai.
- `unsupported_claim`: Model menyebutkan berkas atau fakta yang tidak ada pada input diff.
- `timeout`: Panggilan AI melampaui batas waktu 28 detik.
- `rate_limited`: Respons HTTP 429 atau 503 dari penyedia API.
- `validation_failure`: Data tidak memenuhi batasan skema Zod (mis. string terlalu panjang).
- `unknown`: Kesalahan jaringan atau respons yang tidak teridentifikasi.

---

## 5. Keterbatasan & Integritas Pelaporan
- **Heuristik:** Panic Score adalah heuristik rekayasa, bukan alat ukur psikologis atau saintifik mutlak; evaluasi ini menguji konsistensi fungsional, bukan "kebenaran absolut".
- **Ukuran Data:** Hasil pada himpunan uji kecil tidak boleh diklaim sebagai kepastian statistik mutlak.
- **Integritas Pengujian:** Tidak ada kasus gagal yang dihapus secara diam-diam. Seluruh anomali dicatat secara terbuka.
