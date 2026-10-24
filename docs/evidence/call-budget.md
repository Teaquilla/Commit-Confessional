# Call Budget & API Telemetry Log

Dokumen ini mencatat anggaran dan realisasi panggilan API Gemini per model per hari untuk menjamin kepatuhan batas kuota (RPM, TPM, RPD) dan alokasi hackathon.

---

## 1. Batas Kuota Penyedia & Pagar Operasional (2026-10-24)

- **Status Akun:** Free Tier Google AI Studio
- **Batas Resmi Penyedia (Dilihat di Dashboard Google AI Studio):**
  - `gemini-3.5-flash-lite`: **15 RPM, 250K TPM, 500 RPD**
  - `gemini-3.6-flash`: 5 RPM, 250K TPM, 20 RPD
  - `gemini-3.8-flash`: 5 RPM, 250K TPM, 20 RPD
  - `gemini-3.5-flash`: Baris kuota tidak tercantum eksplisit di dashboard (batas belum diketahui definitif)
- **Pagar Konservatif Zidane (Batas Operasional Lokal):**
  - Jatah maksimal **45 panggilan per hari** yang ditetapkan Zidane adalah pagar konservatif untuk menjaga keamanan kuota Free tier, jauh di bawah batas resmi penyedia (500 RPD).

---

## 2. Total Kumulatif per Model per Hari

### A. Kamis, 22 Oktober 2026
*Sumber: `docs/evidence/model-probe-2026-10-22.md`, F-017, F-018, F-020, F-022, `docs/log/2026-10-22-12.md`*

| Model | Uji Probe (1s) | Uji Live-Check | Total Panggilan | Status Hasil Teramati |
|---|---|---|---|---|
| `gemini-3.5-flash` | 18 | 19 | **37** | 5x 200, 5x 503, 14x 429 (fluktuasi/rate limit) |
| `gemini-3.8-flash` | 18 | 0 | **18** | 8x 200, 2x 503, 8x timeout >20s |
| `gemini-3.5-flash-lite` | 18 | 0 | **18** | 18x 200 (seluruhnya 200 OK) |
| `gemini-2.5-flash` | 18 | 0 | **18** | 18x 404 (model legacy tidak didukung) |
| **TOTAL (22 Okt)** | **72** | **19** | **91** | |

### B. Sabtu, 24 Oktober 2026
*Sumber: Log Panggilan Real-Time Bagian 3 di bawah*

| Model | Uji Live-Check | Preset 3x5 Runs | Total Panggilan | Status Hasil Teramati |
|---|---|---|---|---|
| `gemini-3.5-flash-lite` | 12 | 30 (15 lama + 15 baru) | **42** | 42x 200 (100% 200 OK, 0 retry, 0 rate limit) |
| `gemini-3.5-flash` | 6 | 0 | **6** | 1x 200, 5x 503 (UNAVAILABLE) |
| **TOTAL (24 Okt)** | **18** | **30** | **48** | |

### C. Total Kumulatif Keseluruhan (22 Okt & 24 Okt)

| Model | 22 Okt 2026 | 24 Okt 2026 | Total Kumulatif |
|---|---|---|---|
| `gemini-3.5-flash-lite` | 18 | 42 | **60** |
| `gemini-3.5-flash` | 37 | 6 | **43** |
| `gemini-3.8-flash` | 18 | 0 | **18** |
| `gemini-2.5-flash` | 18 | 0 | **18** |
| **TOTAL KESELURUHAN** | **91** | **48** | **139** |

---

## 3. Log Panggilan Real-Time (2026-10-24)

| Waktu | Model | Status HTTP | Apakah Retry Aplikasi |
|---|---|---|---|
| 2026-10-24T03:40:35.875Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T03:40:43.954Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T03:40:51.788Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T03:41:07.667Z | gemini-3.5-flash | 503 | false |
| 2026-10-24T03:41:30.664Z | gemini-3.5-flash | 503 | false |
| 2026-10-24T03:41:54.708Z | gemini-3.5-flash | 503 | false |
| 2026-10-24T06:35:20.451Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T06:35:27.861Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T06:35:35.398Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T06:36:35.558Z | gemini-3.5-flash | 503 | false |
| 2026-10-24T06:36:51.904Z | gemini-3.5-flash | 503 | false |
| 2026-10-24T06:37:15.826Z | gemini-3.5-flash | 200 | false |
| 2026-10-24T11:39:28.758Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:39:40.165Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:39:52.058Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:40:54.242Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:41:01.866Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:41:09.675Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:41:16.961Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:41:24.570Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:41:32.233Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:41:39.676Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:41:47.392Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:41:55.217Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:42:02.858Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:42:10.551Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:42:17.880Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:42:25.642Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:42:33.003Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:42:40.303Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:58:37.454Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:58:46.689Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:58:54.240Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:59:20.617Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:59:27.946Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:59:35.522Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:59:44.624Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T11:59:54.964Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:00:03.427Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:00:11.888Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:00:20.444Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:00:27.773Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:00:34.878Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:00:42.371Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:00:50.159Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:00:58.021Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:01:05.686Z | gemini-3.5-flash-lite | 200 | false |
| 2026-10-24T12:01:12.967Z | gemini-3.5-flash-lite | 200 | false |
