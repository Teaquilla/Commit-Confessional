# Bukti Pengujian Deployment (Deploy Smoke Evidence)

Dokumen ini mencatat bukti hasil eksekusi pengujian asap jarak jauh (`scripts/remote-smoke.mjs`) pada URL target deployment publik.

---

## 1. Konfigurasi Target Deployment
- **Target URL (BASE_URL):** `https://commit-confessional.vercel.app`
- **Tanggal Pengujian:** 2026-10-24 13:28 WIB
- **Pelaksana:** Antigravity (Builder) & Zidane (Pemilik)
- **Status Bukti C-003 (Spending Quota):** Terverifikasi sebagai pernyataan pemilik (Free tier, billing belum aktif, tanpa kartu kredit terhubung; risiko hanya HTTP 429).

---

## 2. Hasil Eksekusi Remote Smoke Test

| Endpoint | HTTP Status | Latensi (ms) | Validasi Respons | Status |
|---|---|---|---|---|
| `GET /api/health` | 200 | 624 | JSON `{"ok":true}` | LULUS |
| `GET /app` | 200 | 45 | HTML valid memuat wordmark "Commit Confessional" | LULUS |
| `POST /api/confess` | SKIPPED | 0 | - | Ditahan (menunggu IZIN LIVE & pengukuran latensi publik) |

---

## 3. Log Mentah Eksekusi
```text
=== REMOTE SMOKE TEST ===
Target: https://commit-confessional.vercel.app
Live POST Confess Allowed: NO (GET only)

--- [1/3] GET /api/health ---
Status: 200
Latency: 624 ms
JSON Valid (ok: true): true

--- [2/3] GET /app ---
Status: 200
Latency: 45 ms
HTML Valid (contains wordmark): true

--- [3/3] POST /api/confess ---
[INFO] POST /api/confess skipped (requires IZIN LIVE / --with-live-confess).

=== SMOKE TEST SUMMARY ===
┌─────────┬─────────────────────┬───────────┬───────────┬───────┐
│ (index) │ endpoint            │ status    │ latencyMs │ valid │
├─────────┼─────────────────────┼───────────┼───────────┼───────┤
│ 0       │ 'GET /api/health'   │ 200       │ 624       │ true  │
│ 1       │ 'GET /app'          │ 200       │ 45        │ true  │
│ 2       │ 'POST /api/confess' │ 'SKIPPED' │ 0         │ true  │
└─────────┴─────────────────────┴───────────┴───────────┴───────┘
```

---

## 4. Pengujian Alur POST /api/confess Publik oleh Pemilik

Pemilik menyatakan telah menguji alur POST /api/confess dari URL publik pada 24 Okt 2026 dan melaporkan waktu respons di atas 7 detik; perangkat, jaringan, dan kasus uji tidak dicatat; bukan pengukuran otomatis.
