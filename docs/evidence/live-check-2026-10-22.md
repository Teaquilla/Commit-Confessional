# Live Check Transmisi Model AI — 2026-10-22

> **Status:** eksploratori, bukan bukti 3x5
> **Catatan:** Dokumen ini merekam hasil pemeriksaan nyata awal tahap pengembangan (T-004) menggunakan `scripts/live-check.mjs`. Bukan merupakan preset runs resmi 3x5 (syarat Gate 2 / T-007b).

---

## 1. Konfigurasi Eksekusi
- **Perintah:** `node --env-file=.env.local scripts/live-check.mjs`
- **Waktu Eksekusi:** Kamis, 22 Okt 2026 14:44 WIB
- **Target Model:** `gemini-3.5-flash`
- **Tujuan:** Memvalidasi integrasi fungsional `handleConfess` memanggil API Gemini secara langsung untuk 3 sampel diff (`late-night-hotfix`, `rebase-conflict`, `works-on-machine`).

---

## 2. Keluaran Terminal Langsung (Putaran 1 - Sebelum Penambahan Contoh Prompt)

```text
=== LIVE CHECK (EKSPLORATORI, BUKAN BUKTI 3X5) ===
Target Model: gemini-3.5-flash

--- Sample: late-night-hotfix ---
[AI_RETRY] 503
[API_ERROR] AI_GENERATION_FAILED attempts=2
Status: 502
Latency: 18060 ms
Schema Valid: false
Error Code: AI_GENERATION_FAILED

--- Sample: rebase-conflict ---
Status: 200
Latency: 9132 ms
Schema Valid: true
Guardrail Passed: true
Final Score: 20 (Base: 14, Adj: 6)
Severity: MINOR
String Lengths vs Limits:
  aiAdjustmentReason: 94 / 240
  whatHappened:       118 / 300
  cause:              104 / 300
  fix:                110 / 300
  lessonsLearned:     85 / 300
  prSummary:          105 / 400
  whatChanged:        [75, 83] / max 200 each (count: 2/4)
  howToCheck:         [86] / max 200 each (count: 1/2)

--- Sample: works-on-machine ---
Status: 200
Latency: 11881 ms
Schema Valid: true
Guardrail Passed: true
Final Score: 19 (Base: 14, Adj: 5)
Severity: MINOR
String Lengths vs Limits:
  aiAdjustmentReason: 122 / 240
  whatHappened:       101 / 300
  cause:              116 / 300
  fix:                128 / 300
  lessonsLearned:     109 / 300
  prSummary:          127 / 400
  whatChanged:        [110, 72, 98] / max 200 each (count: 3/4)
  howToCheck:         [96, 68] / max 200 each (count: 2/2)
```

---

## 3. Observasi Putaran 1
1. **Penanganan HTTP 503:** Teramati pada sampel `late-night-hotfix`, mekanisme retry berjalan otomatis (`[AI_RETRY] 503`), dan ketika percobaan kedua juga gagal, request berhenti bersih dengan status 502 tanpa kebocoran kunci rahasia atau isi input (tercatat di failure log F-017).
2. **Kesesuaian Guardrail & Skema:** Dua sampel yang berhasil (`rebase-conflict` dan `works-on-machine`) berhasil melewati validasi skema Zod dan seluruh teks keluaran AI lolos guardrail nama file (`Guardrail Passed: true`).
3. **Proporsi Panjang Karakter:** Seluruh teks yang dihasilkan berada di bawah batas maksimum skema yang dilonggarkan (semua < 130 karakter, jauh di bawah batas 240-400 karakter).

---

## 4. Keluaran Terminal Langsung (Putaran 2 - Setelah Penambahan Contoh Prompt Netral)

```text
=== LIVE CHECK (EKSPLORATORI, BUKAN BUKTI 3X5) ===
Target Model: gemini-3.5-flash

--- Sample: late-night-hotfix ---
[AI_RETRY] 503
[API_ERROR] AI_GENERATION_FAILED attempts=2
Status: 502
Latency: 15120 ms
Schema Valid: false
Error Code: AI_GENERATION_FAILED

--- Sample: rebase-conflict ---
[AI_RETRY] 503
[API_ERROR] AI_GENERATION_FAILED attempts=2
Status: 502
Latency: 20096 ms
Schema Valid: false
Error Code: AI_GENERATION_FAILED

--- Sample: works-on-machine ---
Status: 200
Latency: 8538 ms
Schema Valid: true
Guardrail Passed: true
Final Score: 20 (Base: 14, Adj: 6)
Severity: MINOR
String Lengths vs Limits:
  aiAdjustmentReason: 110 / 240
  whatHappened:       84 / 300
  cause:              96 / 300
  fix:                107 / 300
  lessonsLearned:     98 / 300
  prSummary:          129 / 400
  whatChanged:        [91, 47, 60] / max 200 each (count: 3/4)
  howToCheck:         [72, 67] / max 200 each (count: 2/2)
```

---

## 5. Perbandingan Sebelum dan Sesudah (Putaran 1 vs Putaran 2)

| Metrik / Indikator | Putaran 1 (Tanpa Contoh Format) | Putaran 2 (Dengan 2 Contoh Format Deadpan) | Evaluasi Dampak |
| :--- | :--- | :--- | :--- |
| **Panjang `whatHappened` (`works-on-machine`)** | 101 karakter | 84 karakter | Jumlah karakter: 101 vs 84 |
| **Panjang `cause` (`works-on-machine`)** | 116 karakter | 96 karakter | Jumlah karakter: 116 vs 96 |
| **Panjang `fix` (`works-on-machine`)** | 128 karakter | 107 karakter | Jumlah karakter: 128 vs 107 |
| **Panjang `lessonsLearned` (`works-on-machine`)** | 109 karakter | 98 karakter | Jumlah karakter: 109 vs 98 |
| **Kepatuhan Guardrail Nama File** | Lolos (`Guardrail Passed: true`) | Lolos (`Guardrail Passed: true`) | Tetap aman; contoh tanpa nama berkas tidak memicu halusinasi |
| **Latensi Eksekusi Sukses (`works-on-machine`)** | 11.881 ms | 8.538 ms | Latensi dipengaruhi beban server |
| **Stabilitas Server Provider (HTTP 503)** | 1 gagal, 2 sukses | 2 gagal, 1 sukses | Fakta: 3 dari 6 panggilan berakhir 503 |

> **Catatan Evaluasi:** Pengujian hanya berupa satu run per putaran, keluaran tidak deterministik, latensi dipengaruhi beban server, dan tidak ada kesimpulan kualitas. Fakta: 3 dari 6 panggilan berakhir 503.


