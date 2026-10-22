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
