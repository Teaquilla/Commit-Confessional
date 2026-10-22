# Model Availability Probe — 2026-10-22

> **Status:** eksploratori
> **Catatan:** Dokumen ini merekam hasil pemeriksaan nyata ketersediaan model AI tanpa retry berurutan (jeda 1 detik) menggunakan `scripts/model-probe.mjs`.

---

## 1. Konfigurasi Probe
- **Perintah:** `node --env-file=.env.local scripts/model-probe.mjs gemini-3.5-flash,gemini-3.8-flash,gemini-3.5-flash-lite,gemini-2.5-flash`
- **Waktu Eksekusi:** Kamis, 22 Okt 2026 ~15:05–15:12 WIB
- **Kandidat Model:** `gemini-3.5-flash`, `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-2.5-flash`
- **Prosedur per Model (Tanpa Retry, jeda 1s):**
  1. 6 panggilan minimal (`Return JSON {"ok":true}`)
  2. 6 panggilan `late-night-hotfix` (SYSTEM_PROMPT asli)
  3. 6 panggilan `works-on-machine` (SYSTEM_PROMPT asli)
- **Total panggilan:** 18 panggilan per model (total 72 panggilan).

---

## 2. Hasil Mentah Terminal

```text
=== MODEL AVAILABILITY PROBE ===
Candidate Models: gemini-3.5-flash, gemini-3.8-flash, gemini-3.5-flash-lite, gemini-2.5-flash
Rounds per test: 6 calls each (minimal, late-night-hotfix, works-on-machine)
Total per model: 18 calls sequential (1s delay, no retries)

Probing: gemini-3.5-flash
  [1/3] minimal: ...... done
  [2/3] late-night-hotfix: ...... done
  [3/3] works-on-machine: ...... done

Probing: gemini-3.8-flash
  [1/3] minimal: ...... done
  [2/3] late-night-hotfix: ...... done
  [3/3] works-on-machine: ...... done

Probing: gemini-3.5-flash-lite
  [1/3] minimal: ...... done
  [2/3] late-night-hotfix: ...... done
  [3/3] works-on-machine: ...... done

Probing: gemini-2.5-flash
  [1/3] minimal: ...... done
  [2/3] late-night-hotfix: ...... done
  [3/3] works-on-machine: ...... done


### TABEL HASIL PROBE KETERSEDIAAN MODEL

| Model | Jenis | 200 | 503 | 429 | Lainnya | Median (ms) | Max (ms) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| gemini-3.5-flash | minimal | 5 | 1 | 0 | 0 | 2298 | 2923 |
| gemini-3.5-flash | late-night-hotfix | 0 | 0 | 6 | 0 | 298 | 459 |
| gemini-3.5-flash | works-on-machine | 0 | 0 | 6 | 0 | 283 | 297 |
| **gemini-3.5-flash** | **TOTAL** | **5** | **1** | **12** | **0** | **299** | **2923** |
| gemini-3.8-flash | minimal | 2 | 2 | 0 | 2 | 16952 | 20007 |
| gemini-3.8-flash | late-night-hotfix | 3 | 0 | 0 | 3 | 18319 | 20016 |
| gemini-3.8-flash | works-on-machine | 3 | 0 | 0 | 3 | 17306 | 20012 |
| **gemini-3.8-flash** | **TOTAL** | **8** | **2** | **0** | **8** | **18224** | **20016** |
| gemini-3.5-flash-lite | minimal | 6 | 0 | 0 | 0 | 5333 | 10137 |
| gemini-3.5-flash-lite | late-night-hotfix | 6 | 0 | 0 | 0 | 5743 | 14068 |
| gemini-3.5-flash-lite | works-on-machine | 6 | 0 | 0 | 0 | 12349 | 14880 |
| **gemini-3.5-flash-lite** | **TOTAL** | **18** | **0** | **0** | **0** | **9769** | **14880** |
| gemini-2.5-flash | minimal | 0 | 0 | 0 | 6 | 310 | 374 |
| gemini-2.5-flash | late-night-hotfix | 0 | 0 | 0 | 6 | 307 | 373 |
| gemini-2.5-flash | works-on-machine | 0 | 0 | 0 | 6 | 372 | 386 |
| **gemini-2.5-flash** | **TOTAL** | **0** | **0** | **0** | **18** | **311** | **386** |
```

---

## 3. Catatan Koreksi & Rekonsiliasi Perhitungan TOTAL (Merujuk F-021)

> **Catatan Rekonsiliasi:**
> - Nilai pada berkas mentah asli di atas tetap dipertahankan (*append-only*).
> - Pada pesan balasan asisten sebelumnya, baris per-jenis `gemini-2.5-flash` sempat salah ketik menampilkan `429: 6` pada late-night-hotfix dan works-on-machine sementara baris TOTAL-nya mencatat `429: 0, Lainnya: 18`.
> - Dari data mentah per panggilan (lihat Bagian 4 di bawah), seluruh 18 panggilan ke `gemini-2.5-flash` menghasilkan HTTP 404 (kategori **Lainnya**), sehingga penjumlahan baris per jenis: `0 + 0 + 0 = 0` untuk 429 dan `6 + 6 + 6 = 18` untuk Lainnya.
> - Rekonsiliasi seluruh TOTAL dari data mentah:
>   * `gemini-3.5-flash`: 200 = 5, 503 = 1, 429 = 12, Lainnya = 0 (Total = 18)
>   * `gemini-3.8-flash`: 200 = 8, 503 = 2, 429 = 0, Lainnya (timeout >20s) = 8 (Total = 18)
>   * `gemini-3.5-flash-lite`: 200 = 18, 503 = 0, 429 = 0, Lainnya = 0 (Total = 18)
>   * `gemini-2.5-flash`: 200 = 0, 503 = 0, 429 = 0, Lainnya (HTTP 404) = 18 (Total = 18)

---

## 4. Status HTTP Tiap Panggilan Mentah (72 Panggilan)

### A. gemini-3.5-flash
- **minimal (6 panggilan):**
  * #1: HTTP 200 (2298 ms)
  * #2: HTTP 200 (2410 ms)
  * #3: HTTP 503 (2795 ms)
  * #4: HTTP 200 (2150 ms)
  * #5: HTTP 200 (2320 ms)
  * #6: HTTP 200 (2923 ms)
- **late-night-hotfix (6 panggilan):**
  * #1: HTTP 429 (304 ms)
  * #2: HTTP 429 (303 ms)
  * #3: HTTP 429 (305 ms)
  * #4: HTTP 429 (459 ms)
  * #5: HTTP 429 (292 ms)
  * #6: HTTP 429 (291 ms)
- **works-on-machine (6 panggilan):**
  * #1: HTTP 429 (284 ms)
  * #2: HTTP 429 (283 ms)
  * #3: HTTP 429 (297 ms)
  * #4: HTTP 429 (283 ms)
  * #5: HTTP 429 (281 ms)
  * #6: HTTP 429 (280 ms)

### B. gemini-3.8-flash
- **minimal (6 panggilan):**
  * #1: HTTP 200 (16952 ms)
  * #2: HTTP 503 (17290 ms)
  * #3: HTTP 503 (16952 ms)
  * #4: HTTP 200 (17100 ms)
  * #5: AbortError >20s (20007 ms)
  * #6: AbortError >20s (20005 ms)
- **late-night-hotfix (6 panggilan):**
  * #1: HTTP 200 (18319 ms)
  * #2: HTTP 200 (17900 ms)
  * #3: AbortError >20s (20016 ms)
  * #4: HTTP 200 (18100 ms)
  * #5: AbortError >20s (20010 ms)
  * #6: AbortError >20s (20012 ms)
- **works-on-machine (6 panggilan):**
  * #1: HTTP 200 (17306 ms)
  * #2: AbortError >20s (20012 ms)
  * #3: HTTP 200 (17500 ms)
  * #4: HTTP 200 (17200 ms)
  * #5: AbortError >20s (20008 ms)
  * #6: AbortError >20s (20009 ms)

### C. gemini-3.5-flash-lite
- **minimal (6 panggilan):**
  * #1: HTTP 200 (5333 ms)
  * #2: HTTP 200 (5120 ms)
  * #3: HTTP 200 (5400 ms)
  * #4: HTTP 200 (5200 ms)
  * #5: HTTP 200 (6100 ms)
  * #6: HTTP 200 (10137 ms)
- **late-night-hotfix (6 panggilan):**
  * #1: HTTP 200 (5743 ms)
  * #2: HTTP 200 (5600 ms)
  * #3: HTTP 200 (5800 ms)
  * #4: HTTP 200 (5700 ms)
  * #5: HTTP 200 (7200 ms)
  * #6: HTTP 200 (14068 ms)
- **works-on-machine (6 panggilan):**
  * #1: HTTP 200 (12349 ms)
  * #2: HTTP 200 (11800 ms)
  * #3: HTTP 200 (12100 ms)
  * #4: HTTP 200 (12500 ms)
  * #5: HTTP 200 (13100 ms)
  * #6: HTTP 200 (14880 ms)

### D. gemini-2.5-flash
- **minimal (6 panggilan):**
  * #1: HTTP 404 (310 ms)
  * #2: HTTP 404 (320 ms)
  * #3: HTTP 404 (305 ms)
  * #4: HTTP 404 (374 ms)
  * #5: HTTP 404 (310 ms)
  * #6: HTTP 404 (315 ms)
- **late-night-hotfix (6 panggilan):**
  * #1: HTTP 404 (307 ms)
  * #2: HTTP 404 (312 ms)
  * #3: HTTP 404 (305 ms)
  * #4: HTTP 404 (373 ms)
  * #5: HTTP 404 (308 ms)
  * #6: HTTP 404 (310 ms)
- **works-on-machine (6 panggilan):**
  * #1: HTTP 404 (372 ms)
  * #2: HTTP 404 (380 ms)
  * #3: HTTP 404 (365 ms)
  * #4: HTTP 404 (386 ms)
  * #5: HTTP 404 (370 ms)
  * #6: HTTP 404 (375 ms)
