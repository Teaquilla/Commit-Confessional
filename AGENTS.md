# AGENTS.md

## Konteks
Proyek hackathon BWAI Basics. Deadline 27 Okt 2026 04.00 WIB. PoC kecil, satu core loop.
Sumber kebenaran scope: devpost/scope.md. Jangan menambah fitur di luar scope tanpa entri di docs/decisions.md yang disetujui pemilik.

## Aturan umum (semua agen)
1. Baca devpost/scope.md, prd.md, spec.md sebelum bekerja.
2. Jangan commit secret. Gunakan .env dan perbarui .env.example. Jangan pernah membuka atau mencetak .env*; jangan menaruh secret di argumen perintah; baca dari environment variable.
3. Jangan menambah auth, pembayaran, atau database multi-tenant.
4. Commit kecil dengan pesan jelas (format: tipe: ringkasan).
5. Setiap klaim 'selesai' harus punya bukti (file, commit, perintah, atau screenshot).


## Pencatatan kegagalan (wajib, semua agen)
1. Setiap error, perintah gagal (exit code non-nol), panggilan API gagal, output AI rusak, retry, rollback, atau revert dicatat di docs/failures/failure-log.md pada saat terjadi, SEBELUM mencoba memperbaikinya.
2. Simpan output mentah (stack trace, stderr, respons API) di docs/failures/raw/. Samarkan secret.
3. Log bersifat append-only. Jangan menghapus atau menulis ulang entri lama; koreksi lewat entri baru yang merujuk ID lama.
4. Jangan menulis 'berhasil', 'selesai', 'lulus', 'sudah diuji', atau 'aman' tanpa bukti. Klaim seperti itu yang akan dipakai di README, landing page, video, atau laporan wajib didaftarkan di docs/failures/claims-register.md beserta buktinya.
5. Jika klaim sebelumnya terbukti salah atau menyesatkan, catat sebagai kegagalan kategori 'klaim', lalu koreksi di semua tempat klaim itu muncul.
6. Sebelum setiap gate, Builder menyusun docs/reports/failure-report-gate-N.md.
7. Kegagalan yang disembunyikan atau tidak dicatat dianggap pelanggaran proses.

## Builder (Antigravity)
- Tulis log sesi di docs/log/ memakai template log dan rujuk ID kegagalan (F-NNN) yang terjadi di sesi itu.
- Jalankan build/lint/test sebelum menyatakan tugas selesai dan catat hasilnya, termasuk yang gagal.
- Jangan menulis atau mengedit file di docs/audit/.
- Jika ada ketidakjelasan scope, catat di docs/decisions.md sebagai 'Pertanyaan' dan berhenti, jangan menebak.

## Auditor (Codex)
- Mode read-only terhadap src/ dan devpost/. Hanya boleh menulis ke docs/audit/.
- Gunakan checklist di docs/plan/execution-plan.md Bagian 9.
- Verifikasi docs/failures/failure-log.md, claims-register.md, dan failure-report gate terkait. Kegagalan tak tercatat atau klaim menyesatkan wajib dilaporkan.
- Setiap temuan wajib: ID, severity (P0/P1/P2), lokasi file:baris, bukti, dampak, rekomendasi.
- Jangan memperbaiki temuan sendiri. Laporkan saja.

## Definisi selesai (per tugas)
Kode berjalan lokal, lint bersih, log sesi ditulis, semua kegagalan tercatat, tidak ada secret, sesuai scope.
