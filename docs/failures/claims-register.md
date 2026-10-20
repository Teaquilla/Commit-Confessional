# Claims Register

Register ini mencatat setiap klaim yang menyatakan sesuatu **berfungsi, lulus, aman, atau sudah diuji**, serta setiap janji di landing page atau pricing, sebelum dipakai di README, landing page, atau video demo.

Status yang digunakan:
- `terverifikasi`: Didukung bukti konkrit (file, commit, screenshot, atau log perintah).
- `tidak terbukti`: Belum ada bukti valid pendukung.
- `menyesatkan`: Klaim terbukti salah atau berlebihan.
- `dikoreksi`: Klaim telah diperbaiki di semua lokasi.

---

| ID | Klaim | Lokasi (file / slide / menit video) | Bukti | Status | Catatan |
|---|---|---|---|---|---|
| C-001 | Struktur kerangka repo, AGENTS.md, dan konfigurasi lingkungan awal Fase 0 telah disiapkan | README.md, docs/plan/execution-plan.md | Inisialisasi struktur repo & commit Git Fase 0 | terverifikasi | Inisialisasi awal repositori |
| C-002 | Body text contrast ratio memenuhi standar WCAG AA (> 4.5:1) | devpost/spec.md > 5. Look and Feel Implementation | Pemeriksaan contrast checker sebelum Gate 3 | tidak terbukti | Wajib diverifikasi sebelum Gate 3 |
| C-003 | Hard spending quota dikonfigurasi pada provider AI sebelum deployment | devpost/spec.md > 4. Where It Runs | Screenshot / bukti konfigurasi kuota provider | tidak terbukti | Wajib diverifikasi sebelum deployment produksi |
| C-004 | Kredensial lingkungan lokal aman (.env* terabaikan git, tidak terlacak) dan transmisi API terverifikasi | docs/decisions.md > DEC-004, scripts/ | git ls-files kosong, check-ignore aktif, smoke test HTTP 200 (1152 chars) | terverifikasi | Kredensial baru terpasang di .env.local |
| C-005 | Model gemini-3.8-flash dapat menghasilkan teks respons yang valid (generateContent) | devpost/spec.md > 3. Stack, docs/decisions.md > DEC-004 | Menunggu pengujian respons HTTP 200 (saat ini HTTP 503 / timeout) | tidak terbukti | Belum dibuktikan menghasilkan teks sampai ada HTTP 200 |



