---
title: Rencana Validasi & Riset Wawancara — AI Multiplayer
description: Tujuan validasi, target responden (ICP `17`), aturan etika, kit wawancara perilaku, uji MVP dengan design partner, dan ambang keputusan
last_revised: 2026-09-26
---

# Rencana Validasi & Riset Wawancara

Acuan: `17` §1 (ICP), §2 (masalah), §7 (MVP), §8 (asumsi berisiko). Status per 26 September 2026: **founder memutuskan tidak menjalankan wawancara** (dicatat di `09`). Kit dan ambang wawancara di bawah disimpan sebagai arsip; validasi masalah memakai `17` §8.1, dan gerbang yang berlaku adalah uji MVP dengan design partner di bagian akhir file ini.

Struktur file ini: **[ANALISA]** (kelemahan rencana lama yang mendasari revisi ini), **[HASIL]** (rencana validasi yang berlaku: target, aturan, kit wawancara, ambang keputusan, dan metrik MVP), **[SUMBER]** (rujukan).

---

[ANALISA]

## Yang dihapus dari rencana lama

- Uji Critic catch-rate offline (50 artifact yang diketahui salah) — Critic dihapus.
- Target 7 agency kreatif Jakarta yang melayani klien lokal — tidak sesuai ICP global.
- Wawancara berbasis hipotesis "handoff dan kebocoran lintas-klien" untuk agency 20–150 orang Indonesia.
- Kontak komentator LinkedIn Oasis sebagai target utama — diganti kanal di bagian HASIL; boleh tetap dipakai sebagai daftar sekunder.

---

[HASIL]

## Yang harus dibuktikan

1. **A1:** ≥2 orang benar-benar menyentuh satu sesi agent dengan frekuensi berarti.
2. **Masalah kontinuitas** (masalah #1–#4 di `17` §2) muncul tanpa dipancing.
3. **Klien agency** mau masuk sebagai tamu sesi.
4. **Kesediaan membayar** di luar Cursor/Claude yang sudah dibayar, dibuktikan dengan deposit atau LOI, bukan pernyataan.

## Target responden

- **Utama (ICP 1):** software agency / product studio 10–100 orang yang melayani klien luar negeri, memakai Claude Code (atau agent coding lain) setiap hari, dengan ≥3 orang di proyek yang sama.
- **Sekunder (ICP 2):** tim produk AI-native 10–200 orang yang memakai ≥2 agent coding.
- **Klien agency:** 5 orang PM/Head of Product di sisi klien, untuk menguji A2.

**Kanal:** komentator issue GitHub terkait berbagi sesi (`anthropics/claude-code` #40981, #60082, #92517; `openai/codex` #46016), pembuat dan komentator thread Hacker News tentang agent multiplayer, direktori Clutch, LinkedIn, dan jaringan agency SEA yang melayani klien asing.

**Kriteria inklusi:** tim ≥3 orang; sesi agent rata-rata ≥30 menit [ASUMSI]; responden memengaruhi keputusan tooling.

**Kriteria eksklusi:** solopreneur; tim yang belum memakai agent coding secara rutin; legal, support, sales, dan analis data (dikeluarkan di `17` §1).

## Aturan wawancara (dipertahankan dari kit lama)

- Minta izin merekam. Pewawancara bicara ≤20% durasi sesi.
- Jangan menjelaskan ide produk. Jangan menanyakan opini tentang konsep. Jangan menawarkan trial selama wawancara.
- Tanyakan kejadian terakhir yang spesifik, bukan kebiasaan umum. Tanyakan angka, bukan perasaan.
- Setiap kali muncul kata "kalau", "nanti", "kayaknya", atau "seharusnya", alihkan kembali ke kejadian masa lalu.
- Tidak ada pertanyaan hipotetis seperti "jika ada solusi…" (cacat ini ada di kit lama `11`, yang sudah dihapus).
- Catatan lengkap ditulis dalam 15 menit setelah sesi.

## Kit wawancara perilaku (25–30 menit)

**Skrining (3 menit)**
1. Berapa orang di tim yang memakai agent coding minggu ini, dan agent apa saja?
2. Berapa lama rata-rata satu sesi agent berjalan?
3. Berapa klien aktif yang ditangani paralel? (khusus agency)

**Kontinuitas (masalah #2–#3)**
4. Ceritakan kejadian terakhir ketika sesi agent milik satu orang harus dilanjutkan orang lain. Apa yang dipindahkan, lewat apa, dan berapa lama?
5. Apa yang hilang dalam perpindahan itu? Bagaimana Anda tahu?
6. Kapan terakhir Anda melihat agent rekan bekerja ke arah yang salah? Apa yang Anda lakukan, dan berapa lama sampai arahannya sampai ke agent?

**Kuota dan biaya (masalah #1 dan #6)**
7. Kapan terakhir pekerjaan berhenti karena kuota atau limit satu akun habis? Apa yang dilakukan setelahnya?

**Izin dan klien (masalah #4, A2)**
8. Kapan terakhir klien bertanya bagaimana sebuah pekerjaan berbantuan AI dibuat? Apa yang Anda tunjukkan?
9. Bagaimana tim mencegah materi satu klien terlihat di pekerjaan klien lain saat memakai agent?

**Pembelian (kesediaan membayar)**
10. Alat berbayar terakhir apa yang dibeli tim untuk kerja dengan AI? Siapa yang menyetujui, dari anggaran mana, dan berapa lama dari diskusi sampai bayar?

**Penutup:** minta 1–2 referral, dan izin untuk kembali dengan temuan lintas-tim.

**Kolom rekap per responden:** tanggal/organisasi, lolos skrining, masalah kontinuitas disebut tanpa dipancing (y/n), jumlah orang per sesi, kejadian handoff terakhir (tanggal + deskripsi), waktu rekonstruksi konteks, kejadian kuota habis, pertanyaan klien soal proses AI, alat AI berbayar + biaya bulanan, referral.

## Ambang keputusan setelah 12 wawancara

Memakai ambang terkoreksi REV5. Ambang lama 7 dari 12 punya error Tipe-I sekitar 39%.

- **≥10 dari 12** menyebut masalah kontinuitas tanpa dipancing → lanjut ke MVP design partner.
- **4–9 dari 12** → persempit segmen (misalnya hanya agency dengan klien AS) lalu ulangi.
- **≤3 dari 12** → hipotesis terfalsifikasi; hentikan.
- **<5 dari 20 organisasi lolos skrining** → populasi ICP 1 belum cukup matang; pindah ke ICP 2.

Beachhead hanya boleh ditetapkan lewat wawancara dan uji pra-jual, bukan lewat analisis dokumen (aturan SC-05 dari PRD lama).

## Uji MVP dengan design partner (dari `17` §7)

**Peserta:** 3–5 agency yang lolos wawancara. **Durasi:** 2 minggu pemakaian nyata.

| Metrik | Ambang lolos |
|---|---|
| Tim dengan ≥2 orang pada run yang sama setiap minggu | ≥60% |
| Run yang diserahkan lalu dilanjutkan orang lain | ≥30% |
| Tamu klien aktif | ≥1 per agency |
| Deposit atau LOI | ≥3 |
| **Kill / pivot** | <10% run disentuh orang selain pemiliknya |

---

[SUMBER]

Tidak ada sitasi akademik di file ini. Kanal riset (issue GitHub `anthropics/claude-code` #40981, #60082, #92517; `openai/codex` #46016; Hacker News; Clutch; LinkedIn) disebutkan sebagai target/kanal wawancara, bukan sumber data yang dikutip. Rujukan internal: `17` §1, §2, §7, §8.
