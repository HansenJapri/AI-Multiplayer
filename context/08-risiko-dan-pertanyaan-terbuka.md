---
title: Risiko & Pertanyaan Terbuka — AI Multiplayer
description: Register risiko aktif (selaras `15`/`17`), red flag investor, risiko struktural dan legal, peta objeksi dari thread kompetitor, risiko yang sudah gugur, dan pertanyaan terbuka
last_revised: 2026-09-26
---

# Risiko & Pertanyaan Terbuka

Acuan: `15` §3 (hard analysis G1–G9), `17` §6 dan §8. P dan I adalah penilaian 🟡, bukan data.

Seluruh isi file ini adalah evaluasi kritis (risiko, celah, objeksi, pertanyaan terbuka) — tidak ada file lain yang isinya lebih tepat diklasifikasikan sebagai HASIL. Bagian HASIL di bawah hanya menunjuk ke mana keputusan mitigasi yang sudah final berada.

---

[ANALISA]

## Register risiko aktif

| ID | Risiko | P | I | Mitigasi / tes |
|---|---|---|---|---|
| R1 | A1 gagal: sesi agent jarang disentuh lebih dari satu orang | ⛔ | Fatal | Wawancara `07` §4–§5; metrik MVP `07` §6 |
| R2 | Delta, AQ, Slack Code, atau fitur bawaan Anthropic/OpenAI menambahkan batas klien dan kontinuitas lintas harness dalam 6–12 bulan | Tinggi | Fatal | Kecepatan ke design partner; riwayat sesi per klien sebagai aset (`17` §6) |
| R3 | Ketergantungan pada hook Claude Code: Anthropic bisa mengubah API hook atau mengirim fitur multiplayer sendiri | Sedang | Tinggi | Adapter per harness; harness kedua setelah validasi |
| R4 | Stigma: orang tidak mau kerja AI-nya dilihat rekan (48% tidak nyaman mengaku memakai AI kepada atasan) | Sedang–tinggi | Tinggi | Sesi privat default; berbagi per run atas pilihan pemilik |
| R5 | Klien agency tidak mau menjadi tamu (A2) | ⛔ | Tinggi | Wawancara 5 klien; metrik tamu aktif |
| R6 | Harga 30 USD per pengemudi tidak diterima di atas Cursor/Claude yang sudah dibayar | ⛔ | Tinggi | Deposit di halaman harga MVP |
| R7 | Kebocoran data lewat tampilan sesi (tamu atau penonton tanpa grant melihat data rahasia) | Sedang | Tinggi | Batas klien BR-CL-01 (`05` §3); tamu hanya satu run |
| R8 | Injeksi prompt lewat pesan rekan yang diteruskan ke agent | Sedang | Tinggi | Pesan diberi pembatas sebagai input tidak tepercaya; tanpa klaim kebal |
| R9 | Pengumpulan kuota langganan pribadi melanggar ketentuan provider | Tinggi jika dibangun | Sedang | Tidak masuk MVP; pasca-validasi hanya pakai key organisasi (`14`) |
| R10 | Beachhead Indonesia tidak menanggung harga (gap HITL 46×) | Tinggi | Tinggi bila dijadikan pasar pendapatan | Global-first (`17` §7.1) |

## Red flag investor (diperbarui)

- Solo founder, nol ARR, di kategori yang ramai (Delta, AQ, PromptQL, Dust, qm, Slack Code).
- Incumbent membundel fitur kolaborasi gratis (Slack Code di semua paket Slack).
- Belum ada data adopsi berulang untuk fitur multiplayer mana pun (`15` G8) ⛔.
- Red flag lama yang **sudah gugur:** harga identik Oasis, margin negatif dari token Critic, klaim PPP, dan nol budget token di PRD. Semuanya melekat pada model bisnis lama.

## Argumen lawan terkuat

Jika satu orang dengan AI sudah setara satu tim tanpa AI (Dell'Acqua et al., 2025), organisasi mengecilkan tim dan permintaan sesi multi-manusia bisa turun. Arah pasar mungkin "satu orang mengelola banyak agent" (`15` §3.3). Belum ada data yang membantahnya ⛔.

## Risiko struktural

- **SOC 2 Type II** adalah syarat procurement yang tidak bisa dibeli: estimasi 9–15 bulan dan sekitar 28.000 USD sebelum masuk gerbang enterprise. Karena itu ICP 1–2 dipilih yang bisa membeli lewat kartu, bukan procurement.
- **Klasifikasi "aggregator":** produk yang netral terhadap model/harness masuk kategori yang dinilai rentan oleh sebagian investor. Pertahanannya harus berupa data dan jaringan, bukan netralitas itu sendiri.
- **Ketergantungan platform:** preseden Anthropic → Windsurf (pemberitahuan singkat sebelum akses API dipotong). Relevan untuk R3.

## Risiko legal (bukan nasihat hukum)

- UU PDP No. 27/2022 berlaku penuh sejak 17 Oktober 2024. Pencatatan aktivitas per anggota sesi harus diungkap di pemberitahuan privasi.
- Ketentuan provider soal berbagi key dan menjual kembali layanan (OpenAI Services Agreement, Anthropic Commercial Terms) → tidak ada markup token; review hukum wajib sebelum beta eksternal.
- Tanggung jawab atas kesalahan agent tetap pada pengguna. Produk tidak menilai output dan tidak boleh mengklaim sebaliknya.

## Peta objeksi dari thread peluncuran kompetitor (dipangkas 26 Sep 2026)

Sumbernya, analisis kompetitor Oasis (`04`), sudah dihapus founder 26 September 2026. Datanya sendiri sudah dilabeli sinyal lemah (skor 0/20 terhadap standar validasi) dan tidak dirujuk balik oleh file lain di korpus. Temanya (izin/akses, memori/konteks, auditability, skeptisisme moat) sudah tercakup dengan bukti yang lebih kuat di social listening `17` §4.

## Risiko lama yang gugur (tidak berlaku lagi)

- Celah false-negative Critic dan kontradiksi aturan Critic BR-CR-06: Critic dihapus.
- Kontradiksi UX PRD (dashboard vs work mode, approval dijejalkan ke feed chat): PRD lama tidak dipakai; UX MVP mengikuti `05` §4.
- Kontradiksi ambang dan revisi proposal Bab 1 (T1, T6, angka fabrikasi REV1): dokumen proposal sudah dihapus; ambang terkoreksi REV5 dipakai di `06` §8 dan `07` §5.

## Pertanyaan terbuka

1. Seberapa sering sesi agent disentuh ≥2 orang di ICP 1? (R1)
2. Apakah klien agency mau menjadi tamu? (R5)
3. Apakah pesan lewat `additionalContext` cukup responsif untuk dianggap "mengarahkan"? (`17` §8)
4. Berapa biaya penyimpanan per sesi (transkrip + snapshot)? (`06` §3)
5. Berapa harga Delta setelah beta? ⛔

---

[HASIL]

Tidak ada solusi akhir baru di file ini — seluruh isinya adalah evaluasi risiko dan pertanyaan terbuka (lihat ANALISA). Keputusan mitigasi yang sudah final terhadap risiko-risiko ini berada di:
- Batas klien dan invarian keamanan (R7, R8) → `05` §3.
- Model harga dan gerbang deposit (R6) → `06` §1, §8.
- Rencana wawancara untuk A1/A2 (R1, R5) → `07`.
- Keputusan global-first (R10) → `17` §7.1.
- Desain kredensial organisasi (R9) → `14`.

---

[SUMBER]

- Dell'Acqua, F., Ayoubi, C., Lifshitz-Assaf, H., Sadun, R., Mollick, E. R., Mollick, L., Han, Y., Goldman, J., Nair, H., Taub, S., & Lakhani, K. R. (2025). *The cybernetic teammate: A field experiment on generative AI reshaping teamwork and expertise* (NBER Working Paper No. 33641). https://www.nber.org/papers/w33641 (sitasi lengkap dan verifikasi ada di `15` §8).
- UU PDP No. 27/2022 (Indonesia), berlaku penuh sejak 17 Oktober 2024 — sitasi lengkap (Antara News, 2024) ada di `12` §10.
- Rujukan internal: `15` §3, `17` §4, §6, §7.1, dan §8, `05` §3, `06` §1 dan §8, `07`, `14`.
