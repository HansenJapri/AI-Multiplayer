---
title: Riwayat Keputusan & Perubahan
last_revised: 2026-09-26
description: Log kronologis — apa yang diputuskan, dibuang, dan mengapa, ditarik dari evolusi 8 revisi proposal dan revisi besar PRD
sources: [PROP-REV1..REV5, PRD-MASTER, AUDIT-KELAYAKAN, memori-founder]
---

# Riwayat Keputusan & Perubahan

Log ini merekonstruksi garis waktu keputusan berdasarkan tanggal internal dokumen dan urutan revisi. Tujuannya: agar keputusan yang sudah pernah diuji dan dibuang tidak diuji ulang tanpa sadar.

Struktur file ini: **[ANALISA]** (apa yang dibuang di tiap revisi dan mengapa — termasuk peringatan SUPERSEDED), **[HASIL]** (keputusan yang berlaku sekarang), **[SUMBER]** (dokumen sumber log ini).

---

[ANALISA]

## Apa yang dibuang di sepanjang lini revisi proposal Bab 1 (kronologis)

Dibuang mulai **REV1**:
- "Ekonomi digital Indonesia tumbuh 14% year-on-year" — denominator salah (14% adalah pertumbuhan e-commerce ke US$71M, bukan ekonomi digital total).
- "80% pengguna Indonesia interaksi AI tiap hari — tertinggi kedua di kawasan" — angka 80% terverifikasi, "tertinggi kedua" tak terverifikasi.
- "Tidak ada pemain global yang menjual ke segmen ini" — klaim tanpa dukungan, diganti Prasyarat P2 (pemetaan kompetitif wajib) — **masih terbuka sampai REV5**.
- Klaim salah bahwa kewajiban tata-kelola-AI California "sudah wajib bagi pimpinan firma hukum sejak Maret 2026" — dikoreksi jadi "faktor pemaksa yang diantisipasi" (sebenarnya baru aturan yang diusulkan, belum mengikat).
- "Panduan dari lebih dari 35 asosiasi advokat negara bagian" — tak terverifikasi.
- "17% organisasi pantau interaksi antar-agent" dan "38% pantau lalu lintas AI menyeluruh" (CSA) — keduanya tak eksis di sumber yang dikutip, diganti angka 24%/11% yang benar sumbernya.
- "92% CISO tak punya visibilitas penuh" — salah atribusi ke CSA (sebenarnya Cybersecurity Insiders' CISO AI Risk Report).
- "Jejak audit anti-manipulasi" (klaim tamper-proof) — diturunkan jadi "jejak audit yang dapat diekspor" sampai ada mekanisme tamper-evident nyata (hash chain/write-once storage) — disiplin ini bertahan sampai PRD §12.9b.
- T5's kriteria lolos "nol insiden kebocoran selama pilot" — dikenali tak bisa difalsifikasi pada pilot 3–5 partner, diganti syarat test-suite adversarial (jumlah diturunkan dari enumerasi vektor-ancaman, harus lolos 100%, direview pihak luar).

Dibuang mulai **REV3**:
- §1.0 "Kerangka Keputusan" (tabel perbandingan Kerangka-Keamanan-vs-Kerangka-Operasi berdampingan) — dijatuhkan sebagai elemen struktural terlihat dari Copy/REV4/PROP-FINAL/REV5, meski kesimpulannya tetap dipertahankan secara naratif.
- Studi biaya interupsi Mark et al. (2008) — diselidiki aktif sebagai kandidat bukti biaya-handoff, ditolak eksplisit (konstruk salah — mengukur refokus-interupsi-diri, bukan biaya transfer-kerja antar-orang), diparkir permanen di bibliografi "sudah dicek dan sengaja tidak dikutip."

Hanya di **REV5** (koreksi paling signifikan):
- Ambang T1 (7-dari-12) dan T6/retensi (>80% fraksi mentah) — terbukti secara statistik tak valid, diganti perhitungan berbasis Wilson-CI/hipotesis.
- Klaim skop A2A "sengaja tidak atur otorisasi" — dibalik jadi [Asumsi] tak terverifikasi.
- Statistik "peluang adopsi 52% lebih tinggi" SME — ditandai tak terkonfirmasi di abstrak paper sumber.
- Metrik margin kotor tunggal — diganti pelaporan ganda (lapisan-kontrol + campuran) setelah ditemukan bisa menyembunyikan kanibalisasi resale-token.
- Target burn-multiple <2,0 — ditemukan tak pernah bisa diuji tanpa input laju-burn eksplisit, diturunkan formula baru.

## Apa yang dibuang/dipivot di PRD Master (rewrite besar 18 Agustus 2026)

- **Tesis arsitektur inti bergeser**: dari "model kolaborasi rooms/agents/handoff" (yang deskripsikan masalah yang sudah diselesaikan pasar — chat/Projects sudah punya memori per-proyek sejak akhir 2025) menjadi "lapisan verifikasi Assertion→Critic→Receipt lintas-vendor" sebagai tesis inti dan satu-satunya bentuk pertahanan yang tak bisa ditiru incumbent dalam satu kuartal. Model rooms/agents/handoff diturunkan jadi fondasi, bukan alasan beli.
- **Visi/Misi lama dibuang dan ditulis ulang** — PRD §4 secara eksplisit mengakui Visi/Misi lama "tidak menyebut lapisan verifikasi §12.12 sama sekali" — versi lama dokumen ini sendiri menjual hal yang salah.
- **Framing ICP solopreneur/"tim kecil kerjakan yang dulu butuh tim besar" ditinggalkan** — diidentifikasi identik dengan positioning Artisan, yang founder Artisan sendiri retract 23 April 2026. Beachhead ranking bergeser ke agency/konsultan (5–30 orang) dan tim produk internal (10–60 orang). Namun residu framing solopreneur masih tersisa di §2 dan §6.1 PRD.
- **Klaim "Solopreneur dan tim kecil tidak memiliki kapasitas mengoperasikan platform enterprise"** — dibuang eksplisit sebagai kontradiksi internal dengan aturan nilai-struktural §6.0 sendiri.
- **§6.0 "aturan permanen" cakupan-vs-beachhead ditambahkan** — respons langsung terhadap kebingungan ICP yang berulang di dokumen-dokumen sebelumnya.

## Perkembangan pasca-korpus dokumen ini (September 2026, dari catatan kerja founder — di luar 16 file `.md` yang disintesis)

Dokumen-dokumen di atas semuanya bertanggal Juli–Agustus 2026. Setelahnya, eksplorasi arah berlanjut:

- Varian ICP kedua dieksplorasi: platform orkestrasi multi-agent yang sama, disasarkan ke pendiri one-person company/solopreneur alih-alih agency.
- Spesifikasi varian solopreneur diperinci: hierarki Workspace (unit bisnis) > Project Environment (tim agent paralel, konteks terisolasi ketat), agent berperan seperti karyawan (CEO/Finance/Marketing/Engineering) dengan knowledge base mandiri, pilihan LLM per agent + fine-tuning instruksi, integrasi tool lewat MCP, UI minimalis/modular untuk non-developer.
- Pertimbangan penyederhanaan arsitektur varian solopreneur jadi satu akun = satu workspace (hapus tier multi-workspace) — belum diputuskan.
- Arsitektur diperinci lebih lanjut: pemisahan tegas Room (chat sinkron + eksekusi artifact) vs Task Builder (kanvas DAG asinkron dengan Objective, Definition of Done, Step Type Human/Agent Action, Runs After, human-in-the-loop).
- Model monetisasi direvisi: dua sumbu (kapasitas agen tiered subscription + konsumsi token dual-track platform-credit/BYOK); model biaya AI direvisi jadi pass-through mendekati at-cost dengan fee platform tipis ($0,5–1 di atas paket $19,5–20).
- Target direvisi: ICP varian solopreneur TIDAK dibatasi ke pengguna non-teknis — mencakup pengguna teknis juga.
- Cakupan MVP ditetapkan ulang: Room + profil agen + task + estimasi & pembatas biaya ketat; kanvas DAG rumit dan Automated Skill Creation ditunda.
- Varian "OpenClaw" dieksplorasi: app cloud ber-UI visual, workflow dibuat lewat perintah bebas/@mention, monetisasi BYOK + opsi beli model lewat platform.
- **Per September 2026: ICP solopreneur/one-person company dipilih sebagai jangkar rancang-ulang** (bukan agency, bukan mid-market) — ini adalah keputusan yang terjadi **setelah** seluruh 16 file `.md` yang disintesis di folder `context/` ini ditulis.

> **Status 26 September 2026: SUPERSEDED.** Keputusan solopreneur sebagai jangkar ICP, varian "OpenClaw", orkestrasi tim agent ala karyawan, dan monetisasi dua sumbu di atas sudah digantikan oleh keputusan di bagian HASIL. Catatan di atas dipertahankan hanya sebagai riwayat.

⚠️ **Implikasi (historis)**: keputusan solopreneur-sebagai-jangkar di atas secara langsung bertentangan dengan kesimpulan §6.0 PRD Agustus 2026 (nilai produk rendah untuk kerja 1-orang-1-langkah) dan dengan alasan pembuangan framing solopreneur (identik Artisan, sudah di-retract). Jika arah solopreneur dilanjutkan, poin-poin berikut dari korpus Agustus 2026 **perlu ditinjau ulang secara eksplisit**, bukan diam-diam diabaikan: kandidat beachhead §6.0 PRD, tabel nilai-struktural (1-orang-1-langkah = nilai rendah), bukti debunking narasi "solopreneur ber-AI" di `AUDIT-KELAYAKAN`, dan seluruh 8 revisi proposal Bab 1 yang dibangun di atas ICP agency 20–150 orang. Ini bukan larangan pivot — hanya penanda bahwa pivot ini butuh audit ulang eksplisit, bukan warisan otomatis dari kesimpulan korpus lama.

---

[HASIL]

## Keputusan 25–26 September 2026 — pivot ke AI Multiplayer (berlaku; acuan `17`)

| Tanggal | Keputusan | Menggantikan | Dokumen |
|---|---|---|---|
| 25 Sep | Arah produk menjadi **AI Multiplayer** sesuai RFS YC Fall 2026: sesi agent yang bisa diamati, diarahkan, dan diserahkan siapa pun di tim | Orkestrasi "AI Employee" dan lapisan verifikasi | `15`, `12` |
| 25 Sep | **Produk tidak menilai atau mengoreksi hasil kerja AI.** Koreksi adalah tindakan manusia; produk menyediakan instrumen (amati, jeda, arahkan, serahkan) | Assertion → Critic → Receipt sebagai tesis inti; produk pass^k | `17` |
| 25 Sep | **Pasar global-first.** Indonesia bukan pasar pendapatan; entitas Singapura (atau Delaware) didirikan setelah ada ≥3 deposit/LOI atau term sheet | Urutan Indonesia → Singapura → AS di proposal Bab 1 | `17` §7.1 (sebelumnya `16` §2, digabung 26 Sep) |
| 25 Sep | **ICP:** (1) software agency lintas-klien yang melayani klien luar negeri; (2) tim produk AI-native multi-harness; (3) konsultan/agency non-legal non-coding. Legal, data, support, sales dikeluarkan. Solopreneur bukan ICP; mode solo hanya sebagai pintu masuk gratis | Solopreneur sebagai jangkar (September); agency Indonesia 20–150 orang (proposal Bab 1) | `17` §1 |
| 25 Sep | **Pricing hipotesis:** sekitar 30 USD per pengemudi; penonton/komentator/tamu klien gratis; paket Agency sekitar 199 USD; token pakai key/langganan pelanggan tanpa markup | Metering per Agent Run, tier 0/19/59/199, PPP, Critic berbasis kuota platform | `17` §5, `06` |
| 25 Sep | **MVP dua minggu:** hook Claude Code; amati, arahkan (pesan + Hold), serahkan (lanjutkan dari checkpoint), tamu klien, deposit | Cakupan V1 PRD lama; MVP `12` §8 (sekarang backlog pasca-validasi) | `17` §7, `05` §4 |
| 25 Sep | Koreksi: "multiplayer sudah dikirim incumbent" terlalu luas; sebagian besar peluncuran adalah multi-user single-player. Kategori kelima (workspace eksekusi bersama: Zed Delta, AQ, Replit, qm) diakui sebagai ancaman terbesar | `15` §3.1 G1 versi awal | `17` §0, §0.1 (sebelumnya `16` §1, digabung 26 Sep) |
| 26 Sep | Founder menghapus `10`, `11`, `13`, dan `source-index.md` | — | `00` |
| 26 Sep | Seluruh file pendukung diselaraskan ke `17`; `02` dan `04` dihapus | — | `00` |
| 26 Sep | Konsolidasi konteks: `16` digabung ke `17` (§0.1, §7.1); tabel pasar historis di `03` dan peta objeksi Oasis di `08` dipangkas (tidak lagi basis keputusan aktif) | `16` sebagai file berdiri sendiri | `00`, `17` |
| 26 Sep | **Founder memutuskan tidak menjalankan wawancara.** Validasi masalah memakai desk validation sumber publik (`17` §8.1); gerbang berikutnya adalah metrik MVP + deposit (`17` §7). Hasil §8.1: masalah terbukti ada, urgensi tinggi tidak terbukti, Amati/Arahkan/Serahkan sudah punya solusi gratis (MobSession, Claudebin, Skillsync) | Gerbang wawancara `06` §8 dan `07` | `17` §8.1 |

**Aturan yang dibawa dari PRD lama:** beachhead hanya boleh ditetapkan lewat wawancara dan uji pra-jual, bukan analisis dokumen (SC-05). Frasa "untuk semua orang" dilarang dipakai di materi pemasaran (SC-03).

---

[SUMBER]

Log ini disintesis dari dokumen internal yang tercatat di frontmatter: `PROP-REV1..REV5` (delapan revisi proposal Bab 1), `PRD-MASTER` (rewrite besar 18 Agustus 2026), `AUDIT-KELAYAKAN`, dan catatan kerja founder (`memori-founder`). Tidak ada sitasi eksternal.
