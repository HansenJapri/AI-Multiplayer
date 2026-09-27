---
title: Overview & Status Proyek — AI Multiplayer
last_synthesized: 2026-09-26
status: 🟡 Validasi (belum siap bangun penuh). Acuan utama = `17`.
---

# AI Multiplayer — Indeks dan Status

Proyek ini sebelumnya bernama "AI Employee" (orkestrasi multi-agent + lapisan verifikasi). Per 25–26 September 2026 arahnya diganti menjadi **AI Multiplayer**: sesi agent yang bisa diamati, diarahkan, dan diserahkan oleh siapa pun di tim, mengikuti RFS Y Combinator Fall 2026 (Epstein). Lihat `09` untuk riwayat keputusan.

Struktur file ini: **[ANALISA]** (alasan urutan otoritas dokumen), **[HASIL]** (peta file, posisi terkini, dan nasib syarat lama — jawaban langsung), **[SUMBER]** (rujukan internal; tidak ada sitasi eksternal di file ini).

---

[ANALISA]

## Aturan otoritas dokumen

Jika ada dua file yang bertentangan, yang berlaku adalah file dengan urutan lebih tinggi:

1. **`17-icp-masalah-kompetitor-pricing-mvp-multiplayer.md`** — single source of truth untuk ICP, masalah, kompetitor, pricing, positioning, dan MVP. Sejak 26 September 2026 file ini juga memuat §0.1 (audit taksonomi multiplayer dan klaim CRDT) dan §7.1 (fakta hukum dan rekomendasi urutan Singapura) — isi yang sebelumnya berdiri sendiri sebagai `16-strategi-global-icp-kompetitor-pricing-mvp.md`. **`16` sudah digabung ke `17` dan tidak lagi ada sebagai file terpisah.**
2. `15-analisa-dan-hasil-ai-multiplayer.md` — analisa pasar (TAM/SAM/SOM, why now, hard analysis) plus Buying Motivation, Worth Problem, dan HMW.
3. `12` dan `14` — spesifikasi desain **pasca-validasi** (tidak masuk MVP).
4. `01`, `03`, `05`–`09` — dokumen pendukung yang sudah diselaraskan ke `17`.
5. `02`, `04` — sudah dihapus founder 26 September 2026; isinya sudah diserap `17`.

Alasan urutan ini: `17` adalah hasil sintesis paling akhir dan paling teruji (26 Sep 2026) sehingga menang atas dokumen yang lebih tua bila bertentangan. Dokumen pasca-validasi (`12`, `14`) sengaja diberi otoritas lebih rendah dari dokumen validasi aktif (`01`, `03`, `05`–`09`) karena isinya baru relevan setelah gerbang di `06` §8 lolos — mengikuti isinya sebagai rencana masa depan tidak boleh mengalahkan keputusan validasi yang berlaku sekarang.

**Konsolidasi 26 September 2026 (setelah restrukturisasi ANALISA/HASIL/SUMBER):** `16` digabung ke `17` (lihat poin 1) karena isinya sudah murni lampiran, bukan dokumen sejajar. Tabel pasar historis di `03` (untuk produk orkestrasi lama, sudah digantikan `15` §5.3) dan peta objeksi thread peluncuran Oasis di `08` (sumbernya, `04`, sudah dihapus; sinyal lemah 0/20) dipangkas karena tidak lagi menjadi basis keputusan aktif.

---

[HASIL]

## Peta file

| File | Isi | Status |
|---|---|---|
| `01-problem-statement.md` | Rumusan masalah aktif, 5 Whys, asumsi load-bearing | Aktif |
| `03-riset-pasar-dan-bukti.md` | Perpustakaan bukti, sumber terlarang, celah bukti G1–G8 | Aktif (sebagian historis) |
| `05-arsitektur-produk-prd.md` | Prinsip arsitektur, invarian keamanan yang dipertahankan, arsitektur MVP | Aktif |
| `06-model-bisnis-dan-unit-ekonomi.md` | Model harga aktif, unit ekonomi, gerbang dan kill criteria | Aktif |
| `07-rencana-validasi-dan-riset-wawancara.md` | Rencana validasi, kit wawancara perilaku, metrik design partner | Aktif |
| `08-risiko-dan-pertanyaan-terbuka.md` | Register risiko, peta objeksi, pertanyaan terbuka | Aktif |
| `09-riwayat-keputusan-dan-perubahan.md` | Log keputusan | Aktif |
| `12-desain-run-bersama-v2.md` | Desain Run/Spec/usulan/clearance | Pasca-validasi |
| `14-desain-kredensial-llm-ringkasan.md` | Desain key LLM dan rem biaya | Pasca-validasi |
| `15`, `17` | Analisa dan keputusan terbaru (`17` memuat §0.1/§7.1 dari `16`) | Aktif |

File yang sudah dihapus oleh founder pada 26 September 2026: `02-target-icp-dan-segmentasi.md`, `04-analisis-kompetitor.md`, `10-spesifikasi-teknis-detail-prd.md`, `11-skrip-wawancara-verbatim.md`, `13-desain-kredensial-llm-dan-rem-biaya.md`, `source-index.md`.

File yang digabung ke `17` pada 26 September 2026 (konsolidasi konteks): `16-strategi-global-icp-kompetitor-pricing-mvp.md` → isinya sekarang di `17` §0.1 dan §7.1.

## Ringkasan posisi saat ini (dari `17`)

- **Batas produk:** aplikasi tidak menilai atau mengoreksi hasil kerja AI. Mengarahkan agent adalah tindakan manusia; produk menyediakan tempat dan instrumennya.
- **Pasar:** global. Indonesia bukan pasar pendapatan utama; entitas Singapura didirikan setelah ada deposit/LOI (`17` §7.1).
- **ICP:** (1) software agency / product studio yang melayani klien luar negeri; (2) tim produk AI-native yang memakai beberapa agent coding; (3) konsultan/agency non-legal non-coding. Legal, data, support, dan sales dikeluarkan. Solopreneur bukan ICP.
- **Masalah teratas:** kontinuitas dan kepemilikan konteks (kuota per akun, melanjutkan sesi rekan, penalaran yang hilang, izin saat berbagi).
- **Positioning:** lapisan kontinuitas dan kendali untuk sesi agent yang dibagikan dalam tim dan dengan klien, netral terhadap tool agent.
- **Pricing (hipotesis):** sekitar 30 USD per pengemudi per bulan; penonton, komentator, dan tamu klien gratis; paket Agency sekitar 199 USD per workspace; token pakai langganan/key pelanggan tanpa markup.
- **MVP dua minggu:** hook Claude Code → timeline bersama (amati), pesan rekan dan Hold (arahkan), lanjutkan dari checkpoint (serahkan), tamu klien, halaman harga + deposit.
- **Validasi (26 Sep 2026):** founder memutuskan tanpa wawancara. Validasi desk `17` §8.1: masalah terbukti ada; urgensi tinggi tidak terbukti; Amati/Arahkan/Serahkan sudah tersedia gratis dari pihak lain (MobSession, Claudebin, Skillsync); satu-satunya ruang pembeda tersisa adalah tamu klien (batas klien, ICP 1), dengan nol bukti permintaan publik.

## Nasib lima syarat mengikat dari audit kelayakan lama

| Syarat lama (`AUDIT-KELAYAKAN`) | Status per `17` |
|---|---|
| 1. Metering per "artifact terverifikasi" | Diganti: harga per pengemudi + paket Agency (`06` §1) |
| 2. Critic opt-in per kelas artifact | Dihapus: produk tidak menjalankan Critic |
| 3. Produk konsistensi pass^k sebagai flagship | Dihapus: produk tidak menilai output |
| 4. Segmen dikunci ke ekspor jasa / Singapura-IMDA / sektor Indonesia teregulasi | Diganti: ICP global `17` §1 (sejalan dengan opsi "ekspor jasa") |
| 5. Hapus klaim harga "PPP-adjusted" | Selesai: harga PPP Indonesia tidak dipakai lagi |

## Legenda label

✅ terverifikasi ke sumber primer · 🟡 kuat secara logika/preseden, belum ada data · 🔴 spekulasi · ⛔ tidak diketahui · [ASUMSI] angka desain yang harus dikalibrasi · [korpus] bukti dari dokumen proyek sendiri.

---

[SUMBER]

Dokumen ini adalah indeks internal — tidak memuat klaim yang membutuhkan sitasi eksternal. Rujukan silang: `17` (termasuk §0.1/§7.1, sebelumnya `16`), `15`, `12`, `14`, `01`, `03`, `05`–`09` (semuanya di folder `context/` yang sama).
