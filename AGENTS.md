# AGENTS.md

Awal setiap sesi: baca AGENTS.md, docs/STATE.md, dan tugas aktif di docs/tasks/.

## Konteks
Proyek hackathon BWAI Basics. Deadline 27 Okt 2026 04.00 WIB. PoC kecil, satu core loop.
Sumber kebenaran scope: devpost/scope.md. Jangan menambah fitur di luar scope tanpa entri di docs/decisions.md yang disetujui pemilik.

## Aturan umum (semua agen)
1. Baca devpost/scope.md, prd.md, spec.md sebelum bekerja.
2. Jangan commit secret. Jangan pernah membuka atau mencetak berkas .env*; jangan menaruh secret di argumen perintah; baca dari environment variable.
3. Jangan menambah auth, pembayaran, atau database multi-tenant.
4. Commit kecil dengan pesan jelas (format: tipe: ringkasan).
5. Setiap klaim 'selesai' harus punya bukti (file, commit, perintah, atau screenshot).
6. Pasang dependensi hanya dengan npm ci dari lockfile. Dependensi baru perlu alasan di docs/decisions.md.
7. Log sesi (`docs/log/`) dan keputusan (`docs/decisions.md`) hanya dikoreksi lewat entri baru, bukan menulis ulang entri lama.

## Pencatatan kegagalan (wajib, semua agen)
1. Setiap error, perintah gagal (exit code non-nol), panggilan API gagal, output AI rusak, retry, rollback, atau revert dicatat di docs/failures/failure-log.md pada saat terjadi, SEBELUM mencoba memperbaikinya.
2. Simpan output mentah (stack trace, stderr, respons API) di docs/failures/raw/. Samarkan secret.
3. Log bersifat append-only. Jangan menghapus atau menulis ulang entri lama; koreksi lewat entri baru yang merujuk ID lama.
4. Jangan menulis 'berhasil', 'selesai', 'lulus', 'sudah diuji', atau 'aman' tanpa bukti. Klaim seperti itu yang akan dipakai di README, landing page, video, atau laporan wajib didaftarkan di docs/failures/claims-register.md beserta buktinya.
5. Jika klaim sebelumnya terbukti salah atau menyesatkan, catat sebagai kegagalan kategori 'klaim', lalu koreksi di semua tempat klaim itu muncul.
6. Sebelum setiap gate, Builder menyusun docs/reports/failure-report-gate-N.md.
7. Kegagalan yang disembunyikan atau tidak dicatat dianggap pelanggaran proses.

## Build workflow (Builder)
1. Baca dan periksa kode serta status git sebelum mengubah apa pun.
2. Tulis rencana singkat: berkas yang berubah, pendekatan, tes, risiko.
3. Tantang rencana itu: adakah yang lebih sederhana? Apa yang terjadi pada input rusak dan kegagalan model? Apakah ini membuat demo lebih rapuh?
4. Implementasi seminimal mungkin, tanpa refactor di luar tugas.
5. Jalankan verifikasi. Jangan menyatakan berhasil jika tidak dijalankan; jika tidak bisa dijalankan, tulis penyebab persisnya.
6. Tinjau diff sendiri seperti PR orang lain.
7. Laporkan: berkas yang berubah, hasil verifikasi, risiko tersisa, hal yang sengaja dilewatkan.
Berhenti dan tanya jika: persyaratan bertentangan, cakupan melebar di luar tugas, butuh dependensi baru, perilaku privasi/keamanan tidak jelas, atau tugas tampak melanggar aturan hackathon.

## Recovery (saat ada yang rusak)
Jangan menambal acak. Urutan: kembali ke tag known-good terakhir (di salinan atau branch), reproduksi, isolasi, ukur, putuskan perbaikan atau rollback atau potong scope (jangan biarkan biaya yang sudah terpakai menentukan), verifikasi, catat di failure-log.md.

## Serah-terima sesi
Perintah 'checkpoint' dari pemilik berarti: perbarui docs/STATE.md.

## Builder (Antigravity)
- Tulis log sesi di docs/log/ memakai template log dan rujuk ID kegagalan (F-NNN) yang terjadi di sesi itu.
- Jalankan build/lint/test sebelum menyatakan tugas selesai dan catat hasilnya, termasuk yang gagal.
- Jangan menulis atau mengedit file di docs/audit/.
- Jika ada ketidakjelasan scope, catat di docs/decisions.md sebagai 'Pertanyaan' dan berhenti, jangan menebak.

## Auditor independen
- Hanya boleh menulis ke docs/audit/. Tidak mengubah src/, devpost/, atau berkas lain.
- Gunakan checklist di docs/plan/execution-plan.md Bagian 9.
- Verifikasi docs/failures/failure-log.md, claims-register.md, dan failure-report gate terkait. Kegagalan tak tercatat atau klaim menyesatkan wajib dilaporkan.
- Setiap temuan wajib: ID, severity (P0/P1/P2), lokasi file:baris, kutipan persis, dampak, rekomendasi.
- Jangan menyatakan menjalankan perintah yang tidak dijalankan; tulis TIDAK TERVERIFIKASI jika tidak bisa.
- Jangan memperbaiki temuan sendiri. Laporkan saja.

## Definisi selesai (per tugas)
Kode berjalan lokal, lint bersih, tes lolos, log sesi ditulis, semua kegagalan tercatat, tidak ada secret, sesuai scope.

