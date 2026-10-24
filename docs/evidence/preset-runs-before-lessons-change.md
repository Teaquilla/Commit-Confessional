# Catatan Pengujian Preset Sebelum Perubahan Lessons Learned (Evidence Baseline)

Dokumen ini mencatat bukti empiris pengujian keandalan model AI pada 3 sample diff bawaan (*late-night-hotfix*, *rebase-conflict*, *works-on-machine*) sebelum perubahan penyusunan baris *lessons learned* dialihkan sepenuhnya ke kode deterministik.

---

## Log Pengujian 3 Preset x 5 Percobaan

| Preset | Percobaan | JSON Valid | Lolos Guardrail | Latensi (ms) | Model | Tanggal |
|---|---|---|---|---|---|---|
| late-night-hotfix | 1 | Ya | Ya | 1948 | gemini-3.5-flash-lite | 2026-10-24 |
| late-night-hotfix | 2 | Ya | Ya | 1615 | gemini-3.5-flash-lite | 2026-10-24 |
| late-night-hotfix | 3 | Ya | Ya | 1807 | gemini-3.5-flash-lite | 2026-10-24 |
| late-night-hotfix | 4 | Ya | Ya | 1283 | gemini-3.5-flash-lite | 2026-10-24 |
| late-night-hotfix | 5 | Ya | Ya | 1606 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 1 | Ya | Ya | 1663 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 2 | Ya | Ya | 1434 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 3 | Ya | Ya | 1712 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 4 | Ya | Ya | 1815 | gemini-3.5-flash-lite | 2026-10-24 |
| rebase-conflict | 5 | Ya | Ya | 1637 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 1 | Ya | Ya | 1687 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 2 | Ya | Ya | 1328 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 3 | Ya | Ya | 1744 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 4 | Ya | Ya | 1361 | gemini-3.5-flash-lite | 2026-10-24 |
| works-on-machine | 5 | Ya | Ya | 1299 | gemini-3.5-flash-lite | 2026-10-24 |

---

## Ringkasan & Keputusan Pemilihan Model
- **Model Terpilih:** gemini-3.5-flash-lite
- **Total Percobaan Dieksekusi:** 15 dari 15
- **Tingkat Kelolosan JSON:** 15 / 15 percobaan lolos
- **Tingkat Kelolosan Guardrail:** 15 / 15 percobaan lolos
- **Total Panggilan Penyedia (Run Ini):** 15
- **Total Retry Aplikasi (Run Ini):** 0
- **Catatan & Temuan:**
  - **late-night-hotfix**: 5/5 lolos, median latensi: 1615 ms, latensi terburuk: 1948 ms.
  - **rebase-conflict**: 5/5 lolos, median latensi: 1663 ms, latensi terburuk: 1815 ms.
  - **works-on-machine**: 5/5 lolos, median latensi: 1361 ms, latensi terburuk: 1744 ms.
