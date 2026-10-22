# Catatan Pengujian Preset (Preset Runs Evidence)

Dokumen ini mencatat bukti empiris pengujian keandalan model AI pada 3 sample diff bawaan (*late-night-hotfix*, *rebase-conflict*, *works-on-machine*).
Sesuai kriteria pemilihan model pada `devpost/spec.md` dan `docs/decisions.md` (DEC-004), model yang digunakan pada video demo dan materi README wajib lolos **5 kali berturut-turut** untuk masing-masing preset.

**Aturan Pengisian:** Tabel ini **hanya diisi dengan hasil pengujian nyata**, tanpa angka estimasi atau rekayasa data.

---

## Log Pengujian 3 Preset x 5 Percobaan

| Preset | Percobaan | JSON Valid | Lolos Guardrail | Latensi (ms) | Model | Tanggal |
|---|---|---|---|---|---|---|
| late-night-hotfix | 1 | | | | | |
| late-night-hotfix | 2 | | | | | |
| late-night-hotfix | 3 | | | | | |
| late-night-hotfix | 4 | | | | | |
| late-night-hotfix | 5 | | | | | |
| rebase-conflict | 1 | | | | | |
| rebase-conflict | 2 | | | | | |
| rebase-conflict | 3 | | | | | |
| rebase-conflict | 4 | | | | | |
| rebase-conflict | 5 | | | | | |
| works-on-machine | 1 | | | | | |
| works-on-machine | 2 | | | | | |
| works-on-machine | 3 | | | | | |
| works-on-machine | 4 | | | | | |
| works-on-machine | 5 | | | | | |

---

## Ringkasan & Keputusan Pemilihan Model
- **Model Terpilih:** [Diisi setelah pengujian 15 run tuntas]
- **Tingkat Kelolosan JSON:** [Persentase kelolosan]
- **Tingkat Kelolosan Guardrail:** [Persentase kelolosan]
- **Catatan & Temuan:**
