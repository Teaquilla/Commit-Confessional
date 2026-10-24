# Catatan Pengujian Preset (Preset Runs Evidence)

Dokumen ini mencatat bukti empiris pengujian keandalan model AI pada 3 sample diff bawaan (*late-night-hotfix*, *rebase-conflict*, *works-on-machine*).
Sesuai kriteria pemilihan model pada `devpost/spec.md` dan `docs/decisions.md` (DEC-004), model yang digunakan pada video demo dan materi README wajib lolos **5 kali berturut-turut** untuk masing-masing preset.

**Aturan Pengisian:** Tabel ini **hanya diisi dengan hasil pengujian nyata**, tanpa angka estimasi atau rekayasa data.

---

## Log Pengujian 3 Preset x 5 Percobaan

| Preset | Percobaan | JSON Valid | Lolos Guardrail | Latensi (ms) | Model | Tanggal |
|---|---|---|---|---|---|---|
| late-night-hotfix | 1 | Ya | Ya | 1285 | gemini-3.5-flash-lite | 2026-10-24 |
| late-night-hotfix | 2 | Ya | Ya | 1321 | gemini-3.5-flash-lite | 2026-10-24 |
| late-night-hotfix | 3 | Ya | Ya | 1570 | gemini-3.5-flash-lite | 2026-10-24 |
| late-night-hotfix | 4 | Ya | Ya | 3102 | gemini-3.5-flash-lite | 2026-10-24 |
| late-night-hotfix | 5 | Ya | Ya | 4336 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 1 | Ya | Ya | 2462 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 2 | Ya | Ya | 2460 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 3 | Ya | Ya | 2550 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 4 | Ya | Ya | 1325 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 5 | Ya | Ya | 1096 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 1 | Ya | Ya | 1491 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 2 | Ya | Ya | 1781 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 3 | Ya | Ya | 1844 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 4 | Ya | Ya | 1662 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 5 | Ya | Ya | 1279 | gemini-3.5-flash-lite | 2026-10-24 |

---

## Ringkasan & Keputusan Pemilihan Model
- **Model Terpilih:** gemini-3.5-flash-lite
- **Total Percobaan Dieksekusi:** 15 dari 15
- **Tingkat Kelolosan JSON:** 15 / 15 percobaan lolos
- **Tingkat Kelolosan Guardrail:** 15 / 15 percobaan lolos
- **Total Panggilan Penyedia (Run Ini):** 15
- **Total Retry Aplikasi (Run Ini):** 0
- **Catatan & Temuan:**
  - **late-night-hotfix**: 5/5 lolos, median latensi: 1570 ms, latensi terburuk: 4336 ms.
  - **rebase-conflict**: 5/5 lolos, median latensi: 2460 ms, latensi terburuk: 2550 ms.
  - **works-on-machine**: 5/5 lolos, median latensi: 1662 ms, latensi terburuk: 1844 ms.
