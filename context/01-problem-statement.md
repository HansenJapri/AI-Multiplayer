---
title: Problem Statement — AI Multiplayer
description: Rumusan masalah aktif (selaras `17`), akar masalah, asumsi load-bearing, dan ringkasan rumusan lama yang ditolak
last_revised: 2026-09-26
---

# Problem Statement

Acuan: `17` (ICP dan 10 masalah) dan `15` §2.3 (5 Whys). Jika bertentangan, `17` yang berlaku.

Struktur file ini: **[ANALISA]** (5 Whys, asumsi load-bearing yang berisiko, dan rumusan lama yang sudah ditolak beserta alasannya), **[HASIL]** (rumusan masalah aktif yang berlaku sekarang), **[SUMBER]** (rujukan).

---

[ANALISA]

## Akar masalah (5 Whys, ringkas dari `15` §2.3)

1. AI dipakai individual karena antarmukanya sesi chat yang terikat satu akun.
2. Terikat satu akun karena identitas, memori, dan lisensi dijual per kursi.
3. Model per kursi dulu cukup karena tugas AI dulu pendek (menit).
4. Sekarang tidak cukup karena tugas agent sudah berjam-jam (time horizon berlipat dua sekitar setiap 89 hari sejak 2024, METR 2026).
5. **Akar:** unit kerja bergeser dari "prompt → jawaban" milik individu menjadi "run berjam-jam" milik tim, tetapi kendali sesi (siapa boleh melihat, mengarahkan, membelanjakan, menyerahkan) tetap milik satu akun.

## Asumsi load-bearing

| ID | Asumsi | Status | Jika salah |
|---|---|---|---|
| A1 | Lebih dari satu orang benar-benar menyentuh satu sesi agent dengan frekuensi berarti | ⛔ belum ada data (celah G1–G2 di `03` §8) | Seluruh tesis runtuh |
| A2 | Klien agency mau masuk sebagai tamu sesi | ⛔ | Peluang #1 di `17` §6 gugur |
| A3 | Pihak yang merasakan masalah (pengemudi sesi) sama dengan atau bisa meyakinkan pemegang anggaran | ⛔ | Siklus jual memanjang |
| A4 | Alat yang ada (Delta, AQ, Slack Code, fitur bawaan Claude/ChatGPT) tidak cukup untuk ICP 1 | 🟡 | Produk hanya fitur |
| A5 | Orang mau kerja AI-nya dilihat rekan (stigma: 48% tidak nyaman mengaku memakai AI kepada atasan, `15` G3) | 🟡 berisiko | Adopsi berhenti di pemilik sesi |

**Kondisi saat masalah tidak terjadi:** satu orang mengerjakan dari awal sampai akhir; tugas agent pendek (menit); tim kecil satu lokasi yang menyelesaikan konteks lewat percakapan singkat. Karena itu validasi wajib pada tim ≥3 orang dengan sesi agent ≥30 menit [ASUMSI].

## Rumusan lama yang sudah ditolak (ringkasan historis)

- **"Multi-player handoff" untuk agency Indonesia 20–150 orang** (hipotesis proposal Bab 1): skor 32/100 dari `AUDIT-PROBLEM`, ditolak karena bertumpu pada A1 tanpa bukti dan karena agency tidak punya basis bukti sekunder. Penolakan itu menyangkut serah-terima asinkron pada tim kecil Indonesia. Rumusan aktif di bagian HASIL tetap bergantung pada A1 yang sama, sehingga A1 harus diuji lebih dulu (`07`).
- **Verifikasi output AI (P-1 Human Oversight, P-4 Fragmentasi Bukti, Critic lintas-vendor):** dibuang 26 September 2026 karena produk tidak menilai atau mengoreksi hasil kerja AI. Moat lintas-vendor juga sudah runtuh di level agregator (`15` §2.2).
- **Solopreneur sebagai ICP:** dibatalkan; multiplayer butuh ≥2 manusia (`09`).

Detail rumusan lama (8 revisi proposal, klaim C1–C6, skor PS-A/PS-B) tidak lagi dipakai dan tidak disimpan di folder ini.

---

[HASIL]

## Rumusan masalah aktif

Tim yang menjalankan agent AI pada pekerjaan berdurasi jam sampai hari tidak punya satu sesi kerja bersama yang hidup. Konteks, penalaran, dan kuota terkunci di akun satu orang. Akibatnya:

- rekan tidak bisa melanjutkan atau mengambil alih sesi saat pemiliknya tidak ada;
- yang sampai ke tim hanya kesimpulan, bukan jalan pikiran;
- arahan dari orang selain pemilik sesi terlambat sampai ke agent;
- klien tidak bisa melihat proses tanpa diberi akses ke alat internal.

**Batas produk:** produk tidak menilai atau mengoreksi hasil kerja AI. Yang dijual adalah tempat dan instrumen agar manusia bisa mengamati, mengarahkan, dan menyerahkan sesi.

**Proksi terukur:** porsi sesi yang disentuh ≥2 orang; porsi sesi yang dilanjutkan orang lain; waktu dari arahan rekan sampai diterima agent; jam rekonstruksi konteks per handoff.

Sepuluh masalah turunan, skor, dan buktinya ada di `17` §2. Empat teratas: kuota per akun tidak bisa dikumpulkan, tidak bisa melanjutkan sesi rekan, penalaran hilang, dan izin/kebocoran saat berbagi.

---

[SUMBER]

Tidak ada sitasi APA eksternal di file ini. Rujukan internal: `17` (ICP dan 10 masalah), `15` §2.3 (5 Whys), `03` §8 (celah bukti G1–G2), `09` (riwayat keputusan ICP dan solopreneur).
