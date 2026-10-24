# Call Budget & API Telemetry Log

Dokumen ini mencatat anggaran dan realisasi panggilan API Gemini per model per hari untuk menjamin kepatuhan batas kuota (RPM, TPM, RPD) dan alokasi hackathon.

---

## 1. Rekapitulasi Historis (2026-10-22)
- **Total Panggilan Terverifikasi:** 91 panggilan
  - 72 panggilan: Model probe eksploratori (`docs/evidence/model-probe-2026-10-22.md`)
  - 19 panggilan: Uji konektivitas awal, live-check, dan verifikasi deadpan voice

---

## 2. Kuota & Alokasi Aktif (2026-10-24)
- **Status Akun:** Free Tier Google AI Studio
- **Batas Terlihat Dashboard:**
  - `gemini-3.6-flash`: 5 RPM, 250K TPM, 20 RPD
  - `gemini-3.8-flash`: 5 RPM, 250K TPM, 20 RPD (hampir habis kuota harian: 18/20 dari probe)
  - `gemini-3.5-flash-lite`: 15 RPM, 250K TPM, 500 RPD
  - `gemini-3.5-flash`: Belum terlihat di dashboard (batas belum diketahui definitif, 429 pada uji coba sebelumnya)
- **Izin Pemilik (Zidane):**
  - `gemini-3.5-flash-lite`: Maksimal 40 panggilan hari ini termasuk retry aplikasi, jeda minimal 6000 ms.
  - `gemini-3.5-flash`: Maksimal 3 panggilan hari ini (1 per sampel, tanpa retry, jeda minimal 15000 ms, berhenti di 429 pertama).

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
