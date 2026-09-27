---
title: Analisa & Hasil — AI Multiplayer
date: 2026-09-25
status: Analisa independen atas 16 file context/ terhadap konsep "AI Multiplayer" (YC RFS Fall 2026)
scope: Global dengan lensa Indonesia/SEA
last_revised: 2026-09-26
---

> **Posisi terhadap `17` (26 Sep 2026).** Dokumen ini adalah analisa pasar (hard analysis, TAM/SAM/SOM, why now) dan sumber Buying Motivation, Worth Problem, serta HMW. Untuk ICP, 10 masalah, kompetitor, pricing, positioning, dan MVP, acuannya `17`. Tiga koreksi sudah diterapkan: (1) G1 terlalu luas — lihat `17` §0.1 (sebelumnya `16` §1, digabung 26 Sep 2026) dan `17` §0; (2) K5 lintas-organisasi sudah dikerjakan Harvey di legal; (3) produk tidak menilai atau mengoreksi output AI, sehingga Critic dan Receipt dihapus dari tesis.

# Analisa & Hasil — AI Multiplayer

Konvensi label (dipakai di seluruh dokumen): ✅ terverifikasi ke sumber primer · 🟡 kuat secara logika/preseden, belum ada data spesifik · 🔴 spekulasi · ⛔ tidak diketahui · [ASUMSI] angka model yang harus dikalibrasi · [korpus] klaim yang berasal dari file context/ milik proyek, belum diverifikasi ulang di sesi ini. Semua nilai uang dalam USD kecuali disebut lain. Jumlah sitasi diambil dari OpenAlex pada 25 September 2026.

Asumsi tafsir: "dokumen context yang dilampirkan" = 16 file di `D:\My Project\AI Multiplayer\context\`. Tidak ada file lain di folder itu.

Struktur file ini: **[ANALISA]** (audit file, audit keselarasan konsep, hard analysis dengan 5 Whys, data historis, proyeksi pasar, why now, dan audit diri), **[HASIL]** (Buying Motivation, Worth Problem, HMW), **[SUMBER]** (daftar pustaka).

---

[ANALISA]

## Audit File & Kebersihan Konteks

*Status 26 Sep 2026: keempat file bertanda HAPUS sudah dihapus founder; file pendukung sudah diselaraskan ke `17`; `02` dan `04` juga sudah dihapus.* Total isi `context/` saat audit ini = 283.217 byte (16 file). Menghapus empat file di baris bertanda HAPUS dari context window memangkas 123.226 byte (43,5%) tanpa kehilangan informasi yang dibutuhkan untuk arah AI Multiplayer. "Hapus" di sini berarti keluarkan dari context window (pindahkan ke folder arsip), bukan hapus permanen, karena dua di antaranya masih berguna saat fase bangun.

| File | Ukuran | Rekomendasi | Alasan |
|---|---|---|---|
| `10-spesifikasi-teknis-detail-prd.md` | 62.365 B | HAPUS dari context (arsipkan) | Salinan near-verbatim PRD §10–21 untuk produk "AI Employee" versi verifikasi. File terbesar (22% total). Status proyek "ROMBAK" dan `12` menyatakan belum siap-bangun, jadi spesifikasi level requirement belum dibutuhkan. Hanya empat bagian yang masih dirujuk `12` (§18 urutan izin, §12.13 batas Client, §12.14 Policy Engine, §12.18 egress); ringkasan keempatnya sudah ada di `05` §2.3 dan §6. |
| `13-desain-kredensial-llm-dan-rem-biaya.md` | 42.998 B | HAPUS dari context (arsipkan) | Isi keputusannya sudah dirangkum di `14` (5.250 B). Versi panjang hanya dibutuhkan saat implementasi gateway biaya. Redundan di tahap validasi. |
| `11-skrip-wawancara-verbatim.md` | 11.887 B | HAPUS dan ganti | Menguji hipotesis lama (handoff agency 20–150 orang, kebocoran lintas-klien), bukan perilaku sesi agent bersama. Ada dua cacat metodologis: (a) B3.1 "Jika ada solusi..." adalah pertanyaan hipotetis yang dilarang oleh aturan deflektor file `07` sendiri; (b) isi Blok 1–4 berbeda dari ringkasan Blok 1–4 di `07`, jadi ada dua versi kit yang tidak konsisten. Daftar 7 agency Jakarta masih bisa dipakai ulang sebagai daftar kontak. |
| `source-index.md` | 5.976 B | HAPUS dari context | Peta provenance ke 16 file lama yang sudah dihapus. Tidak menambah informasi analitis. Juga basi: menyebut "13 file baru" padahal ada 16. |
| `00-overview-dan-status-proyek.md` | 6.285 B | Pertahankan, perbarui (sudah diperbarui 26 Sep) | Tabel navigasi tidak mencantumkan `13` dan `14`; judul masih "AI Employee". |
| `01-problem-statement.md` | 12.281 B | Ringkas | §2 (evolusi 8 revisi proposal) adalah sejarah editorial, tidak dipakai lagi. §3–§5 (audit PS-C 32/100, asumsi A1–A5, R1–R7) tetap penting karena A1 adalah risiko inti AI Multiplayer juga. |
| `02-target-icp-dan-segmentasi.md` | 9.211 B | Sudah dihapus 26 Sep 2026 | Memuat konflik ICP agency vs solopreneur yang sudah diputuskan `17` §1. |
| `03-riset-pasar-dan-bukti.md` | 15.546 B | Pertahankan | Daftar sumber terlarang dan celah G1–G8 tetap berlaku. |
| `04-analisis-kompetitor.md` | 12.086 B | Sudah dihapus 26 Sep 2026 | Peta objeksi LinkedIn dipindah ke `08` §6; kompetitor multiplayer terkini ada di `17` §3. |
| `05-arsitektur-produk-prd.md` | 16.235 B | Pertahankan sebagian | Tesis verifikasi lintas-vendor harus diturunkan statusnya (lihat bagian Audit Keselarasan). Invarian keamanan masih jadi fondasi `12`. |
| `06-model-bisnis-dan-unit-ekonomi.md` | 12.010 B | Ringkas | Tabel harga per "Agent Run" dan program referral sudah digantikan hipotesis harga `17` §5. Pertahankan skor kelayakan 5/10 dan kill criteria. |
| `07-rencana-validasi-dan-riset-wawancara.md` | 13.720 B | Ringkas | Sebagian besar menguji hipotesis lama. Pertahankan ambang keputusan dan metrik design partner. |
| `08-risiko-dan-pertanyaan-terbuka.md` | 12.088 B | Ringkas | Kontradiksi #1–#10 adalah sejarah revisi proposal Bab 1. Yang masih relevan: red flag investor, kontradiksi UX, celah false-negative, lima asumsi berisiko. |
| `09-riwayat-keputusan-dan-perubahan.md` | 7.770 B | Pertahankan | Satu-satunya catatan keputusan ICP solopreneur September 2026. |
| `12-desain-run-bersama-v2.md` | 37.509 B | Pertahankan (inti) | Satu-satunya file yang dirancang langsung dari tesis YC Multiplayer AI. |
| `14-desain-kredensial-llm-ringkasan.md` | 5.250 B | Pertahankan | Pengganti ringkas `13`. |

## Audit Keselarasan Konsep

### Skor keselarasan per file

Kriteria "selaras" diturunkan dari RFS: nilai inti produk adalah sesi agent hidup yang bisa ditonton, diarahkan ulang, dan diserahkan oleh siapa pun di tim; bukan thread pribadi (Y Combinator, 2026) ✅.

| File | Keselarasan | Temuan |
|---|---|---|
| `12` | Selaras | Unit kerja "Run" bersama, peran Watcher/Steerer/Approver, Hold, usulan berkelas risiko. Sudah mengakui cold start dan konflik ICP. |
| `14` | Selaras (pendukung) | Pendanaan per project dan izin belanja lintas anggota adalah prasyarat biaya untuk sesi bersama. |
| `04` (dihapus) | Sebagian | Oasis menjual otonomi agent dengan manusia minimal, arah yang berlawanan dengan steering manusia. Peta objeksinya (izin, audit, siapa bertanggung jawab) tetap relevan, dipindah ke `08` §6. |
| `01`, `07`, `11` (dihapus) | Menyimpang | Rumusan masalah dan kit wawancara menguji serah-terima asinkron dan kebocoran lintas-klien, bukan kolaborasi pada sesi agent yang sedang berjalan. |
| `05`, `06`, `10` (dihapus) | Menyimpang | Tesis inti PRD adalah "Assertion → Critic → Receipt lintas-vendor"; model rooms/handoff secara eksplisit diturunkan menjadi "fondasi, bukan alasan beli" [korpus `05` §2]. Ini kebalikan tesis multiplayer. Metering per Agent Run dan Critic default-on bertentangan dengan ekonomi kursi kolaborator. |
| `02` (dihapus), `09` | Konflik terbuka (sudah diselesaikan) | ICP solopreneur dipilih September 2026 [korpus `09`]. Multiplayer butuh minimal dua manusia pada satu sesi; solopreneur secara definisi hanya satu. Diselesaikan 25 Sep 2026: solopreneur bukan ICP (`17` §1). |

### Enam deviasi material

1. **Salah letak nilai.** Korpus menempatkan nilai pada verifikasi output oleh model vendor lain. Moat itu sudah runtuh di level agregator: Microsoft 365 Copilot menawarkan model Anthropic dan OpenAI berdampingan sejak 24 September 2025 [korpus `12` §Analisa, dengan sumber Microsoft 2025]. Di tesis multiplayer, verifikasi cukup menjadi atribut sesi (siapa mengarahkan apa, dengan bukti apa), bukan produknya.
2. **ICP bertentangan.** Solopreneur tidak bisa menguji tesis multiplayer. `12` §Analisa sudah menyatakan hal ini; sudah diselesaikan di `17` §1.
3. **Hipotesis yang diuji salah.** AUDIT-PROBLEM menolak "multi-player handoff" (32/100) [korpus `01`]. Penolakan itu berlaku untuk serah-terima asinkron pada tim kecil Indonesia, bukan untuk sesi agent hidup. Namun asumsi load-bearing-nya sama: A1, yaitu apakah lebih dari satu manusia benar-benar menyentuh satu pekerjaan agent dengan frekuensi berarti. Bukti A1 untuk sesi agent bersama tetap ⛔ (celah G1 dan G2 di `03`).
4. **Unit ekonomi terbalik.** Metering per Agent Run menghukum steering, karena setiap koreksi memicu run ulang. `12` §Analisa sudah menghitungnya: biaya total = C × (1 + jumlah f), dengan 5 koreksi restart penuh = 6C vs resume checkpoint = 2,5C (ilustrasi, bukan data).
5. **Kompetitor usang.** Versi lama tidak memuat pemain yang sudah mengirim fitur multiplayer antara Oktober 2025 dan Agustus 2026 (lihat bagian Data Historis).
6. **Kit validasi tidak mengukur perilaku multiplayer.** Tidak ada pertanyaan tentang kejadian "saya melihat agent rekan salah arah tapi tidak bisa menghentikannya", yang justru merupakan momen nilai inti RFS.

### Revisi total: rumusan yang diselaraskan

**Akar masalah (5 Whys).**
1. Mengapa pekerjaan dengan AI masih individual? Karena antarmukanya sesi chat yang terikat satu akun; berbagi berarti mengirim tautan transkrip read-only (Y Combinator, 2026) ✅.
2. Mengapa terikat satu akun? Karena identitas, memori, dan lisensi dijual per kursi. Microsoft menjual Copilot per kursi dan baru 30 juta dari lebih dari 450 juta kursi komersial Microsoft 365 yang membayarnya, sekitar 6,7% (Microsoft, 2026b; Redmond, 2026) ✅. Bahkan ChatGPT group chats sengaja tidak memakai memori pribadi pengguna (OpenAI, 2025) ✅.
3. Mengapa model per-kursi dulu cukup? Karena tugas AI dulu pendek. Time horizon 50% model frontier masih di skala menit pada 2023–2024 (Kwa et al., 2025) ✅.
4. Mengapa sekarang tidak cukup? Karena time horizon berlipat dua sekitar setiap 89 hari sejak 2024, dan per Januari 2026 Claude Opus 4.5 terukur sekitar 320 menit (interval 170–729) (METR, 2026) ✅. Tugas selama itu melewati rentang perhatian satu orang dan menyentuh pengetahuan lebih dari satu orang.
5. **Akar:** unit kerja bergeser dari "prompt → jawaban" (milik individu) menjadi "run berjam-jam yang memakai data, anggaran, dan menghasilkan deliverable" (milik organisasi), tapi **bidang kendalinya** (siapa boleh menonton, menghentikan, mengarahkan, membelanjakan, menyerahkan) tetap milik satu akun. 🟡

Konsekuensinya penting: group chat dengan AI (ChatGPT, Copilot Groups) menyelesaikan percakapan bersama, bukan bidang kendali bersama atas run. Di celah itulah diferensiasi mungkin ada 🟡.

**Problem statement revisi.** Tim yang menjalankan agent AI pada pekerjaan berdurasi jam sampai hari tidak punya satu objek kerja bersama yang hidup. Akibatnya koreksi dari orang selain pemilik sesi datang terlambat atau tidak pernah sampai ke agent, token terbakar pada arah yang salah, output berkualitas rendah diteruskan ke rekan atau klien, dan tidak ada jejak siapa mengarahkan apa. Proksi terukur: waktu dari sinyal koreksi pertama sampai agent berubah arah, porsi langkah yang dieksekusi setelah sinyal koreksi, dan jam rework per deliverable.

**Tesis produk revisi.** Bidang kendali bersama untuk run agent: tonton (dengan clearance), Hold oleh siapa pun, arahkan ulang lewat usulan berkelas risiko, belanja hanya dengan persetujuan, serahkan dengan jejak. Produk **tidak menilai atau mengoreksi** output AI: Critic dihapus, dan Receipt diganti catatan sesi (siapa melihat, mengarahkan, menyetujui, menyerahkan). Arah ini sama dengan `12` v2 yang sudah diselaraskan.

**Aturan ICP revisi.** Validasi wajib pada tim ≥3 orang yang sudah menjalankan agent pada tugas ≥30 menit [ASUMSI]. Mode solo tetap ada di arsitektur (`12` §Hasil 4.9), tapi hasil dari solopreneur tidak boleh dihitung sebagai bukti tesis. **ICP aktif sudah ditetapkan di `17` §1** (software agency lintas-klien → tim produk AI-native multi-harness → konsultan non-legal).

**Yang dipertahankan dari korpus:** urutan izin 7 langkah, batas Client, Policy Engine deterministik, pemisahan egress, audit berantai-hash, approver≠producer, catatan sesi yang menyatakan proses (rangkuman di `05` §3). Semua ini justru menjadi syarat keamanan sesi bersama.

## Hard Analysis

### Penyebab utama potensi gagal total

Nilai P (probabilitas) dan I (dampak) adalah penilaian saya 🟡, bukan data.

**G1 — Komoditisasi oleh incumbent yang sudah multi-tenant (P tinggi, I fatal).**

> **Koreksi (`17` §0.1, sebelumnya `16` §1; dan `17` §0):** daftar di bawah mencampur level teknologi. ChatGPT group chats, Copilot Groups, dan Claude Tag adalah multi-user single-player; Slack Code adalah streaming eksekusi dengan pause/redirect; Claude Artifacts adalah kanvas satu file. Ancaman terbesar justru workspace eksekusi bersama (Zed Delta, AQ, Replit, qm) dan pemain vertikal (Harvey, Hex, Intercom Fin, Agentforce). Kesimpulan G1 (risiko fatal) tetap, tetapi mekanismenya berbeda.

Dalam 11 bulan terakhir, fitur inti RFS sudah dikirim oleh pihak yang punya distribusi:
- Salesforce Slack Code (25 Agustus 2026): tim menonton agent coding bekerja secara real-time di channel dan membentuknya bersama; gratis di semua paket Slack; mendukung Claude Code, Devin, GitHub Copilot, ChatGPT, dan agent Vercel (Salesforce, 2026) ✅.
- Anthropic Claude Tag di Slack (Agustus 2026): agent membaca seluruh percakapan channel dan memutuskan kapan ikut bicara (VentureBeat, 2026) ✅. Claude Artifacts multiplayer (13 Juli 2026) untuk paket Team dan Enterprise (AlphaSignal, 2026) ✅.
- Microsoft Teams collaborative agents (2 Juni 2026) di channel, shared channel, chat grup, dan meeting (Microsoft, 2026a) ✅. Copilot Groups (27 Oktober 2025) sampai 32 orang (Redmond Magazine, 2025) ✅.
- ChatGPT group chats (13–20 November 2025) sampai 20 orang (OpenAI, 2025) ✅.
- Dust memosisikan diri sebagai "Multiplayer AI for human-agent collaboration", mengklaim 3.000+ organisasi (Dust, 2026) 🟡 klaim vendor.

5 Whys kegagalan ini:
1. Mengapa produk bisa gagal? Pembeli sudah mendapat multiplayer yang "cukup baik" dari alat yang sudah dibayar.
2. Mengapa cukup baik? Incumbent mengirimnya gratis atau di dalam paket yang sama.
3. Mengapa incumbent bisa secepat itu? Karena mereka sudah cloud-native dan multi-tenant, dengan graf identitas dan izin. Kondisi yang membuat Figma menang (Adobe terjebak arsitektur file desktop) tidak terulang 🟡.
4. Mengapa pembeli tidak membeli startup? Procurement memilih bundel; vendor baru butuh SOC 2 Type II, estimasi 9–15 bulan dan sekitar 28.000 USD [korpus `08` §4].
5. **Akar:** tanpa sesuatu yang secara struktural tidak akan dikirim incumbent, startup hanya menjual fitur. Kandidat yang masih terbuka: sesi lintas-organisasi (agency ↔ klien) yang melintasi batas tenant, bidang kendali netral lintas-permukaan (Slack + Teams + agent eksternal), atau vertikal deliverable non-coding. Semuanya 🔴 belum teruji.

**G2 — Cold start dan kontradiksi ICP (P tinggi, I fatal).** Nilai multiplayer nol sampai orang kedua bergabung [korpus `12` F6]. ICP solopreneur (bila dipertahankan) memastikan kondisi ini permanen — sudah diselesaikan: solopreneur bukan ICP (`17` §1).

**G3 — Hambatan sosial: orang tidak ingin kerja AI-nya ditonton (P sedang–tinggi, I tinggi).** 48% pekerja desk merasa tidak nyaman mengaku kepada atasan bahwa mereka memakai AI; alasan utamanya merasa curang (47%), takut terlihat kurang kompeten (46%), dan takut terlihat malas (46%) (Slack, 2024) ✅. Penerima "workslop" menilai pengirim kurang kreatif dan kurang andal, dan hampir sepertiga enggan berkolaborasi lagi dengan pengirim (BetterUp Labs, 2025) ✅. Implikasinya berlawanan dengan asumsi RFS: membuat sesi AI terlihat bisa **menaikkan** biaya sosial, sehingga orang tetap bekerja privat lalu hanya membagikan hasil akhir 🟡. Kebiasaan "Bring Your Own AI" sudah dilakukan 78% pengguna AI (Microsoft & LinkedIn, 2024) ✅.

**G4 — Unit ekonomi (P tinggi, I tinggi).** Setiap peserta yang mengarahkan menambah komputasi. Gartner memprediksi lebih dari 40% proyek agentic AI dibatalkan pada akhir 2027 karena biaya yang naik, nilai bisnis yang tidak jelas, dan kontrol risiko yang tidak memadai (Gartner, 2025b) ✅. Korpus sendiri menilai Unit Economics 0/2 [korpus `06`].

**G5 — Degradasi kualitas dari banyak pengarah (P sedang, I tinggi).** Performa LLM turun rata-rata 39% di percakapan multi-turn dibanding single-turn, dengan ketidakandalan naik 112% (Laban et al., 2025) ✅; jumlah sitasi OpenAlex baru 10, jadi temuan ini belum teruji replikasi. Lebih banyak steerer berarti lebih banyak turn. Tanpa Spec terstruktur (`12` P5), multiplayer justru memperburuk output 🟡.

**G6 — State synchronization dan konkurensi (P sedang, I sedang).** Dua usulan pada field yang sama, perubahan Spec saat langkah berjalan, dan agent eksternal tanpa checkpoint memaksa restart penuh [korpus `12` F9, F20, RR3]. Ini bisa diselesaikan secara teknis, tapi menaikkan kompleksitas (5 peran, 3 jalur, 3 kelas risiko), bertentangan dengan janji "siapa pun bisa langsung bergabung" [korpus `12` RR1].

**G7 — Kebocoran data lewat tampilan live (P sedang, I tinggi).** Penonton tanpa grant bisa membaca turunan data rahasia (confused deputy) [korpus `12` F2]. UU PDP No. 27/2022 berlaku penuh sejak 17 Oktober 2024 [korpus `12` §Hasil]. Injeksi prompt tidak langsung tetap belum terselesaikan secara umum (Greshake et al., 2023; 542 sitasi) ✅.

**G8 — Perangkap gimik (P sedang, I sedang).** Tidak ada satu pun data adopsi publik untuk ChatGPT group chats, Copilot Groups, atau Slack Code ⛔. Fakta bahwa incumbent meluncurkan fitur tidak membuktikan tim memakainya berulang.

**G9 — Beachhead Indonesia tidak menanggung harga (P tinggi, I tinggi bila Indonesia dijadikan pasar pendapatan).** Tier Pro butuh 54,1 jam/bulan dihemat untuk balik modal di Indonesia vs 1,18 jam di AS, gap 46× [korpus `03`].

### Faktor kunci penentu kemenangan

**K1 — Bidang kendali, bukan percakapan.** Hold oleh siapa pun, perubahan arah yang dikendalikan, dan belanja yang disetujui (`12` P2, P7) langsung menjawab dua dari tiga alasan pembatalan proyek agentic menurut Gartner: biaya dan kontrol risiko (Gartner, 2025b) 🟡.

**K2 — Kolaborator gratis, bayar di pemilik atau hasil.** Figma membuktikan pola ini: dua pertiga dari 13 juta MAU bukan desainer, sekitar 70% pelanggan paket Organization/Enterprise mulai dari paket Professional, NDR 132% dengan GDR 96% pada S-1 (Jaipuria, 2025) ✅. NDR naik ke 136% per 30 Juni 2026 (Figma, 2026b) ✅.

**K3 — Masuk lewat permukaan yang sudah dipakai, bukan melawannya.** Teams SDK kini GA dan menerima agent pihak ketiga seperti Cursor, Linear, dan Atlassian Rovo (Microsoft, 2026a) ✅. Slack Code menerima agent partner (Salesforce, 2026) ✅. Produk yang menjadi lapisan kendali di atas permukaan itu tidak harus memenangkan perang chat 🟡.

**K4 — Spec terstruktur sebagai konteks agent.** Menahan degradasi multi-turn (Laban et al., 2025) dan membuat usulan bisa diverifikasi deterministik [korpus `12` §Hasil] 🟡. Eksperimen A2 di `12` wajib lolos (≥20 poin di atas transkrip).

**K5 — Lintas-organisasi.** Klien yang bisa berkomentar pada run agency tanpa melihat data internal (`12` §Hasil). **Koreksi:** Harvey Shared Spaces (Des 2025) sudah menjalankan model firma ↔ klien di legal ✅, jadi ini bukan celah universal. Ini preseden bahwa model tersebut dibayar; peluangnya adalah menerapkannya ke software agency (`17` §6).

**K6 — Tim + AI mengungguli individu + AI pada solusi terbaik.** Field experiment P&G (n=776): individu dengan AI menyamai tim tanpa AI, dan AI membuat solusi lebih seimbang lintas fungsi R&D dan komersial (Dell'Acqua et al., 2025) ✅; sekitar 80 sitasi gabungan lintas versi.

### Argumen lawan terkuat (steel-man)

Temuan yang sama (Dell'Acqua et al., 2025) bisa dibaca terbalik: bila satu orang dengan AI sudah setara satu tim tanpa AI, organisasi akan mengecilkan tim dan permintaan atas sesi multi-manusia turun. Tesis "multiplayer" bisa jadi tren transisional, dan pemenang sebenarnya adalah "satu orang mengelola banyak agent". Microsoft sendiri memproyeksikan pimpinan berharap 41% tim melatih agent dan 36% mengelolanya dalam lima tahun (Microsoft, 2025) ✅, yaitu relasi manusia→agent, bukan manusia↔manusia↔agent. Argumen ini belum terbantah oleh data apa pun di korpus ⛔.

### Verdict

**CONDITIONAL.** Masalahnya nyata dan mendesak di level industri, tetapi produk berdiri hanya jika tiga syarat terbukti: (1) A1, yaitu ≥2 manusia benar-benar mengarahkan satu run dengan frekuensi berarti; (2) ada wedge yang tidak dikirim incumbent (G1 akar #5); (3) ada deposit dari tim ≥3 orang. Tanpa ketiganya, ini fitur, bukan perusahaan.

## Data Historis & Temuan Riset Masalah

Catatan kejujuran: tidak ada satu pun metrik longitudinal yang langsung mengukur "frekuensi alur kerja AI terisolasi" ⛔. Bukti di bawah adalah proksi, diurutkan dari yang terbaru.

1. **Kursi AI masih individual dan tumbuh cepat.** Microsoft 365 Copilot mencapai lebih dari 30 juta kursi berbayar (29 Juli 2026), naik dari 15 juta pada Januari 2026, di atas basis lebih dari 450 juta kursi komersial Microsoft 365 (Microsoft, 2026b; Redmond, 2026) ✅. Pada harga daftar 30 USD per kursi per bulan (implisit dari 15 juta kursi = 5,4 miliar USD ARR), AI dibeli sebagai alat pribadi per orang.
2. **Incumbent mengakui masalahnya lewat peluncuran produk.** Slack Code (Agustus 2026), Claude Tag (Agustus 2026), Claude Artifacts multiplayer (Juli 2026), Teams collaborative agents (Juni 2026), Copilot Groups (Oktober 2025), ChatGPT group chats (November 2025) (lihat G1) ✅. Sinyal ini membuktikan persepsi kebutuhan, bukan adopsi.
3. **Figma: multiplayer + AI sedang dimonetisasi.** Pendapatan Q2 2026 370,1 juta USD (+48% YoY), NDR 136%, lebih dari 80% pelanggan ≥10.000 USD ARR memakai kredit AI mingguan, dan lebih dari 50% memakai Figma agent mingguan; panduan 2026 dinaikkan ke 1,463–1,467 miliar USD (Figma, 2026b) ✅.
4. **Tugas agent kini berjam-jam.** Doubling time time horizon 88,6 hari sejak 2024 (metodologi TH1.1); per Januari 2026 Claude Opus 4.5 sekitar 320 menit (METR, 2026) ✅. METR memperingatkan interval kepercayaan masih lebar.
5. **Biaya kolaborasi dari AI individual sudah terukur (self-report).** 40% dari 1.004 pekerja desk AS menerima "workslop" dalam sebulan terakhir, 15,4% dari pekerjaan yang diterima tergolong demikian, 1 jam 51 menit per kasus, setara 186 USD per karyawan per bulan (BetterUp Labs, 2025; Niederhoffer et al., 2025) ✅. Keterbatasan: survei vendor, estimasi diri, dan korpus sendiri mencatat estimasi self-report bisa meleset sekitar 39 poin persen [korpus `03`].
6. **Gartner: agent masuk aplikasi, tapi banyak yang gagal.** 40% aplikasi enterprise akan memiliki agent spesifik-tugas pada akhir 2026, dari kurang dari 5% di 2025; tahap 2027 memprediksi sepertiga implementasi menggabungkan kolaborasi multi-agent (Gartner, 2025a) ✅. Lebih dari 40% proyek agentic diprediksi dibatalkan pada akhir 2027 (Gartner, 2025b) ✅. Keduanya prediksi analis, bukan data terukur.
7. **Microsoft WTI 2025:** 82% pemimpin berharap memakai "digital labor" untuk memperluas tenaga kerja dalam 12–18 bulan; 67% pemimpin familiar dengan agent vs 40% karyawan (Microsoft, 2025) ✅. Gap pemahaman ini menandakan agent dikelola oleh segelintir orang, bukan tim.
8. **Google membundel AI dengan kenaikan kecil.** Business Standard naik dari 12 ke 14 USD per pengguna per bulan dengan Gemini di dalamnya; Workspace melayani lebih dari 10 juta bisnis (Google, 2025) ✅.
9. **Atlassian (n≈5.000, 5 negara):** pengguna yang memperlakukan AI sebagai kolaborator strategis menghemat 105 menit per hari vs 53 menit untuk pengguna sederhana (Sands, 2024) ✅; data vendor dan self-report.
10. **Slack Workforce Index (n=17.372, 15 negara, Agustus 2024):** 48% tidak nyaman mengaku memakai AI kepada atasan; hanya 7% menganggap diri ahli (Slack, 2024) ✅. Ini bukti bahwa penggunaan AI disembunyikan, bukan dibagikan.
11. **AI individual menyeragamkan output kolektif.** Akses ide GenAI menaikkan kreativitas individu tapi membuat cerita lebih mirip satu sama lain (Doshi & Hauser, 2024; 735 sitasi) ✅. Ini masalah level tim yang tidak terlihat dari level individu.
12. **Microsoft WTI 2024 (n=31.000, 31 negara):** 75% pekerja pengetahuan memakai AI dan 78% pengguna AI membawa alat sendiri ke kantor (Microsoft & LinkedIn, 2024) ✅.
13. **Preseden Figma vs Adobe.** Adobe membatalkan akuisisi Figma senilai 20 miliar USD pada 18 Desember 2023 karena hambatan regulator UE dan Inggris, dan membayar biaya terminasi 1 miliar USD (CNBC, 2023) ✅.
14. **Produktivitas individu dengan AI sudah terbukti di tingkat individu**, termasuk efek "jagged frontier" (Dell'Acqua et al., 2023; sekitar 936 sitasi gabungan) dan +14% produktivitas agen layanan pelanggan (Brynjolfsson et al., 2025; 886 sitasi) ✅. Keduanya mengukur individu, bukan tim. Celah bukti level tim itulah yang dimasuki tesis multiplayer.

## Proyeksi Pasar (5 Tahun) & Analisis Metrik Figma/Google Docs

### Apa yang sebenarnya diajarkan Figma dan Google Docs

| Dimensi | Figma | Google Docs / Workspace | Implikasi untuk AI Multiplayer |
|---|---|---|---|
| Hasil | Menang melawan Adobe; revenue 1,056 miliar USD (2025, +41%) (Figma, 2026a) ✅, sehingga revenue 2024 sekitar 749 juta USD (diturunkan dari angka pertumbuhan) | Tidak "menggantikan" Word dalam skala: Microsoft 365 masih lebih dari 450 juta kursi komersial (Redmond, 2026) ✅, sementara Workspace melaporkan lebih dari 10 juta bisnis (Google, 2025) ✅. Satuannya berbeda (kursi vs bisnis), jadi perbandingan hanya indikatif | Klaim konsep "Google Docs menggantikan Microsoft Word" adalah 🔴 overstatement. Preseden yang lebih mungkin berulang untuk AI adalah Google Docs: incumbent menyalin multiplayer dan mempertahankan basisnya |
| Mengapa incumbent kalah/bertahan | Adobe terikat file desktop 🟡 | Microsoft menambahkan co-authoring ke Office cloud 🟡 | Incumbent AI hari ini sudah cloud-native (lihat G1) |
| Motor adopsi | Bottom-up: sekitar 70% pelanggan Org/Enterprise mulai dari Professional; dua pertiga MAU bukan desainer (Jaipuria, 2025) ✅ | Distribusi lewat Gmail/akun Google 🟡 | Kolaborator harus gratis agar loop undangan hidup (`12` F13) |
| Retensi/ekspansi | NDR 132% → 136%; GDR 96% ✅ | ⛔ tidak dipublikasi | Target minimal pembanding: GDR ≥90% dan NDR ≥110% pada kohor tim [ASUMSI] |
| WTP untuk AI | Kredit AI dimonetisasi sejak Q2 2026 ✅ | AI dibundel dengan tambahan 2 USD per pengguna ✅ | Rentang WTP tambahan untuk AI di pasar: 2 USD (bundel) sampai 30 USD (Copilot mandiri) per kursi per bulan. Multiplayer sebagai lapisan terpisah kemungkinan dihargai di bawah titik tengah 🟡 |

### Pengukuran potensi adopsi, kebutuhan tim, dan WTP

- **Adopsi tim.** Penetrasi kursi AI berbayar di basis Microsoft 365 baru sekitar 6,7% (30 juta / 450 juta) ✅. Dua kali lipat dalam enam bulan (Januari → Juli 2026) ✅ tidak bisa diekstrapolasi linear; korpus mencatat bukti "saddle" pasca-takeoff pada penetrasi sekitar 30% [korpus `03`, sumber 2011 di luar jendela 5 tahun, dipakai hanya sebagai kerangka].
- **Kebutuhan riil enterprise.** Yang terdokumentasi adalah kontrol, bukan kebersamaan: izin per-agent, audit, dan akuntabilitas adalah objeksi paling sering di thread kompetitor, 11 dari sekitar 30 pertanyaan substantif [korpus `08` §6] dan alasan pembatalan proyek menurut Gartner (2025b).
- **WTP.** ⛔ Tidak ada data WTP untuk lapisan multiplayer di mana pun. Jangkar yang tersedia: 186 USD per karyawan per bulan biaya workslop (self-report) sebagai langit-langit teoritis; 2–30 USD per kursi per bulan sebagai harga AI yang sudah dibayar pasar.

### Estimasi TAM, SAM, SOM, dan CAGR

**Definisi.**
- TAM = seluruh kursi AI berbayar di organisasi × harga tambahan untuk lapisan kendali bersama.
- SAM = porsi TAM pada organisasi <1.000 karyawan [ASUMSI 40%], tim yang bekerja lintas-klien atau memakai ≥2 harness agent [ASUMSI 70%; filter ini menggantikan filter "non-coding" versi awal agar selaras dengan ICP `17` §1, yang justru dimulai dari software agency; nilainya tetap placeholder], geografi terjangkau (AS, Inggris, Australia, Singapura, Indonesia, SEA lain) [ASUMSI 45%], dan bersedia membeli di luar bundel incumbent [ASUMSI 25%]. Faktor gabungan = 3,15%.
- SOM = pendapatan yang realistis ditangkap satu founder bootstrap, dihitung bottom-up dari jumlah tim berbayar × ARPA.

**Input bottom-up TAM.** Kursi AI berbayar organisasi 2026 = 60 juta [ASUMSI: 30 juta Copilot ✅ × 2 untuk ekosistem non-Microsoft]. Naik ke 225 juta pada 2031, sekitar 31% dari 720 juta kursi organisasi [ASUMSI: 450 juta Microsoft × 1,6], mendekati zona saddle 30%. Harga tambahan turun dari 10 ke 7 USD per kursi per bulan karena tekanan bundling [ASUMSI].

| Tahun | Kursi AI berbayar (juta) [ASUMSI] | Harga lapisan (USD/kursi/bln) [ASUMSI] | TAM (miliar USD) | SAM (juta USD) |
|---|---|---|---|---|
| Tahun 0 — 2026 | 60 | 10,0 | 7,20 | 226,8 |
| Tahun 1 — 2027 | 90 | 9,4 | 10,15 | 319,8 |
| Tahun 2 — 2028 | 125 | 8,8 | 13,20 | 415,8 |
| Tahun 3 — 2029 | 160 | 8,2 | 15,74 | 495,9 |
| Tahun 4 — 2030 | 195 | 7,6 | 17,78 | 560,2 |
| Tahun 5 — 2031 | 225 | 7,0 | 18,90 | 595,3 |
| **CAGR 2026–2031** | | | **21,3%** | **21,3%** |

**Pembanding top-down.** Pasar AI agents global 7,6 miliar USD (2025) dan 10,9 miliar USD (2026), CAGR 49,6% sampai 2033 (Grand View Research, 2026) ✅ laporan komersial, metodologi tertutup. Ekstrapolasi CAGR itu memberi 81,7 miliar USD pada 2031. MarketsandMarkets memberi 7,84 miliar USD (2025) → 52,62 miliar USD (2030), CAGR 46,3%, dengan segmen multi-agent tumbuh 48,5% (MarketsandMarkets, 2025) ✅. Angka top-down ini adalah plafon; lapisan multiplayer hanya sebagian kecil darinya. TAM bottom-up 2026 (7,2 miliar USD) berada pada orde besaran yang sama dengan pasar agent (10,9 miliar USD), jadi triangulasi masuk akal, tapi keduanya bertumpu pada asumsi yang berbeda.

**CAGR minimal untuk perencanaan: 21,3%** (bottom-up, konservatif). Angka 46–50% hanya boleh dipakai sebagai skenario optimis.

**Sensitivitas.** Jika pasar menetapkan harga multiplayer setara bundel Google (2 USD), TAM 2026 turun menjadi 1,44 miliar USD dan SAM menjadi sekitar 45 juta USD. Variabel paling berpengaruh adalah harga, bukan jumlah kursi.

**SOM (tim berbayar × ARPA 3.000–3.600 USD/tahun [ASUMSI], mengacu gerbang T2 ≥199 USD/bulan di korpus `06` §8).**

| Skenario | Tahun 1 (2027) | Tahun 2 | Tahun 3 | Tahun 4 | Tahun 5 (2031) | Pangsa SAM Tahun 5 |
|---|---|---|---|---|---|---|
| Bear: 5 → 160 tim | 0,015 jt | 0,063 jt | 0,165 jt | 0,345 jt | 0,576 jt USD | 0,10% |
| Base: 15 → 750 tim | 0,045 jt | 0,189 jt | 0,594 jt | 1,380 jt | 2,700 jt USD | 0,45% |
| Bull: 30 → 1.600 tim | 0,090 jt | 0,409 jt | 1,320 jt | 3,105 jt | 5,760 jt USD | 0,97% |

Skenario kill (tidak ada deposit dari ≥3 tim pada minggu ke-4 validasi) = SOM nol. Estimasi korpus sendiri memberi peluang sekitar 3% untuk ARR ≥10 juta USD dalam 5 tahun [korpus `06` §7, 🔴 kalibrasi auditor]; skenario bull di atas tetap di bawah angka itu, jadi konsisten.

### Lensa Indonesia

Upah rata-rata sektor informasi-komunikasi Rp5,28 juta/bulan [korpus `03`, BPS] ≈ 297 USD pada kurs sekitar Rp17.800. Bila biaya workslop 186 USD diskalakan dengan rasio upah terhadap asumsi upah AS 5.200 USD/bulan (asumsi korpus yang belum terverifikasi), biaya setara di Indonesia hanya sekitar 10,6 USD per karyawan per bulan 🔴. Artinya harga 10 USD per kursi hampir menghabiskan seluruh nilai masalah. Indonesia layak sebagai pasar validasi dan sumber tim delivery untuk klien asing, bukan pasar pendapatan utama; ini konsisten dengan keputusan global-first di `17` §7.1 (sebelumnya `16` §2, digabung 26 Sep 2026).

## Bukti Urgensi Masalah (Why Now)

1. **Durasi tugas agent melewati rentang perhatian satu orang.** Doubling sekitar 89 hari sejak 2024 dan sekitar 5 jam pada model frontier (METR, 2026) ✅. Makin panjang run, makin mahal satu arah yang salah.
2. **Kursi AI berbayar dua kali lipat dalam enam bulan** (Microsoft, 2026b; Redmond, 2026) ✅, sehingga jumlah run paralel di satu organisasi naik lebih cepat dari kapasitas koordinasinya 🟡.
3. **Agent masuk ke 40% aplikasi enterprise tahun ini** (Gartner, 2025a) ✅.
4. **Pembatalan proyek karena biaya dan kontrol risiko** (Gartner, 2025b) ✅ menciptakan pembeli untuk rem, Hold, dan persetujuan belanja.
5. **Jendela sempit.** Enam peluncuran incumbent dalam 11 bulan (G1). Jendela untuk wedge non-coding atau lintas-organisasi diperkirakan 6–12 bulan sebelum distribusi incumbent menutupnya 🔴.
6. **YC membuka RFS "Multiplayer AI" untuk Fall 2026** (Y Combinator, 2026) ✅, diverifikasi lewat Claude Browser pada 25 September 2026. Ini sinyal modal, bukan bukti permintaan pelanggan.

Argumen "belum sekarang": tidak ada data adopsi berulang untuk fitur multiplayer yang sudah diluncurkan (G8) ⛔, dan tren pengelolaan agent oleh satu orang bisa lebih kuat.

## Ringkasan Audit Diri

**Top 5 asumsi paling berisiko.** (1) A1: lebih dari satu manusia mengarahkan satu run cukup sering ⛔. (2) Ada wedge yang tidak dikirim incumbent 🔴. (3) Harga lapisan 7–10 USD per kursi [ASUMSI] tanpa data WTP ⛔. (4) Faktor SAM 3,15% [ASUMSI]. (5) Orang mau kerja AI-nya ditonton, padahal bukti stigma menunjukkan sebaliknya (G3).

**Yang tidak bisa dijawab di sini.** Data adopsi fitur multiplayer incumbent; WTP lapisan kendali bersama; porsi pekerjaan agent yang disentuh ≥2 orang; data seat Google Workspace.

**Langkah validasi.** (a) Concierge 2 minggu pada 3–5 tim ≥3 orang: tandai manual setiap pesan sebagai Diskusi/Usulan/Klarifikasi (`12` A1). (b) Ukur porsi langkah yang dieksekusi setelah sinyal koreksi pertama (`12` A3). (c) Uji paksa-pilih: tim memilih Slack Code/Claude Tag gratis vs prototipe; catat alasan. (d) Deposit atau LOI dari ≥3 tim; nol berarti kill (`12` A5). (e) Kit wawancara perilaku yang menggantikan kit lama `11` ada di `07`.

---

[HASIL]

# Buying Motivation

- **Menghentikan pembakaran biaya pada arah yang salah.** Run agent kini berlangsung berjam-jam (METR, 2026). Pembeli (Head of Operations, owner agency, lead tim) membayar agar siapa pun yang melihat kesalahan bisa menjeda run seketika, tanpa menunggu pemilik sesi. Ini menjawab alasan pertama pembatalan proyek agentic: biaya yang naik (Gartner, 2025b).
- **Kontrol belanja dan risiko yang bisa dipertanggungjawabkan.** Setiap perubahan arah yang memicu komputasi harus disetujui oleh pemegang anggaran, dengan pratinjau biaya dan batas keras. Pembeli membeli kepastian bahwa tidak ada anggota tim atau agent yang bisa membelanjakan di luar izin, bukan sekadar ruang obrolan bersama.
- **Mencegah workslop sampai ke rekan dan klien.** 40% pekerja menerima output AI berkualitas rendah dalam sebulan, dengan 1 jam 51 menit rework per kasus (BetterUp Labs, 2025). Tim membayar agar rekan bisa melihat dan mengarahkan sesi sebelum deliverable dikirim. Koreksinya dilakukan manusia; produk tidak menilai output.
- **Kontinuitas saat orang tidak hadir.** Pekerjaan agent tidak boleh macet atau hilang saat pemiliknya rapat, cuti, atau resign; pembeli membutuhkan approver cadangan dan serah-terima dengan jejak.
- **Bukti akuntabilitas untuk klien.** Agency dan firma jasa membutuhkan catatan siapa mengarahkan apa, dari sumber mana, dan siapa menyetujui, dalam bentuk yang bisa ditunjukkan kepada klien tanpa membuka data internal.
- **Berbagi sesi tanpa membocorkan data.** Kolaborator hanya melihat langkah yang sumbernya sudah di-grant kepada mereka; ini syarat agar tim legal dan keamanan menyetujui pembelian.
- **Model beli yang mudah disetujui.** Penonton, komentator, dan tamu klien gratis; yang dibayar adalah pengemudi (sekitar 30 USD per bulan) atau workspace Agency (sekitar 199 USD per bulan) (`17` §5). Pola ini meniru jalur adopsi bottom-up Figma, di mana sekitar 70% pelanggan Organization/Enterprise mulai dari paket tim kecil (Jaipuria, 2025).

# Worth Problem

- **Biaya rework per karyawan.** Estimasi biaya workslop 186 USD per karyawan per bulan, setara lebih dari 9 juta USD per tahun untuk organisasi 10.000 orang (BetterUp Labs, 2025; self-report, survei vendor). Untuk tim 20 orang di AS, sekitar 3.720 USD per bulan. Untuk Indonesia, nilai setara diperkirakan hanya sekitar 10,6 USD per karyawan per bulan karena perbedaan upah (spekulasi, skala upah).
- **Biaya komputasi dari koreksi terlambat.** Dengan lima koreksi per run, restart penuh menghasilkan 6 kali biaya satu run bersih, sedangkan jeda lalu lanjut dari checkpoint menghasilkan sekitar 2,5 kali (ilustrasi, belum diukur). Selisihnya adalah nilai langsung dari Hold dan resume.
- **Risiko proyek batal.** Lebih dari 40% proyek agentic AI diprediksi dibatalkan pada akhir 2027 karena biaya, nilai yang tidak jelas, dan kontrol risiko yang lemah (Gartner, 2025b). Setiap proyek yang batal menghapus seluruh investasi pilot.
- **Nilai kolaborasi yang hilang.** Pengguna yang memperlakukan AI sebagai kolaborator menghemat 105 menit per hari vs 53 menit untuk pengguna sederhana (Sands, 2024; self-report, vendor). Penggunaan AI yang disembunyikan (48% tidak nyaman mengaku kepada atasan) menghalangi praktik terbaik menyebar di tim (Slack, 2024).
- **Kualitas output kolektif.** AI individual menaikkan kreativitas per orang tetapi menyeragamkan hasil kolektif (Doshi & Hauser, 2024); tim tanpa ruang kerja bersama kehilangan keragaman solusi.
- **Skala pasar.** TAM lapisan kendali bersama diperkirakan 7,2 miliar USD pada 2026 dan 18,9 miliar USD pada 2031 (CAGR 21,3%); SAM 227 juta USD pada 2026 dan 595 juta USD pada 2031; SOM skenario dasar 2,7 juta USD ARR pada tahun ke-5 (seluruhnya berbasis asumsi yang dinyatakan di bagian ANALISA).
- **Bukti bahwa multiplayer bisa dimonetisasi.** Figma mempertahankan NDR 136% dan melaporkan lebih dari 80% pelanggan ≥10.000 USD ARR memakai kredit AI setiap minggu (Figma, 2026b).

# How Might We (HMW)

1. Bagaimana kita dapat membuat siapa pun di tim menjeda run agent yang salah arah dalam hitungan detik, sementara perubahan arah dan belanja tetap memerlukan persetujuan pemegang anggaran?
2. Bagaimana kita dapat memberi nilai pada hari pertama kepada pemilik run yang bekerja sendirian, sehingga undangan kepada rekan pertama terjadi karena kebutuhan nyata, bukan karena diminta produk?
3. Bagaimana kita dapat membuat orang merasa aman menampilkan kerja AI-nya kepada rekan, tanpa stigma "curang" atau "malas", sehingga sesi bersama menjadi kebiasaan, bukan pengawasan?
4. Bagaimana kita dapat memastikan keputusan yang muncul di diskusi manusia benar-benar sampai ke agent sebagai perubahan Spec, tanpa menjejalkan seluruh percakapan ke konteks agent?
5. Bagaimana kita dapat membiarkan klien dan mitra di luar organisasi ikut mengarahkan run lewat komentar dan persetujuan, tanpa pernah melihat data internal atau biaya?
6. Bagaimana kita dapat menjadi lapisan kendali di atas Slack, Teams, dan agent pihak ketiga yang sudah dipakai tim, alih-alih bersaing dengan permukaan kolaborasi yang dibundel gratis?
7. Bagaimana kita dapat membuktikan dalam empat minggu, dengan deposit dari minimal tiga tim, bahwa lebih dari satu orang benar-benar mengarahkan satu run cukup sering untuk dibayar?

---

[SUMBER]

Daftar Pustaka (APA 7, terbaru → terlama):

- Y Combinator. (2026). *Requests for startups: Multiplayer AI* (A. Epstein). Diakses 25 September 2026, dari https://www.ycombinator.com/rfs
- Salesforce. (2026, 25 Agustus). *Salesforce launches Slack Code to make AI software development multiplayer* [Siaran pers]. https://www.salesforce.com/ap/news/press-releases/2026/08/25/salesforce-launches-slack-code-to-make-ai-software-development-multiplayer-2/
- VentureBeat. (2026, Agustus). *Anthropic's new Claude Tag update lets its Slack agent read the full conversation — and jump in unprompted*. https://venturebeat.com/orchestration/anthropics-new-claude-tag-update-lets-its-slack-agent-read-the-full-conversation-and-jump-in-unprompted (nama penulis tidak terbaca pada halaman yang diambil, sehingga ditulis atas nama media)
- Figma, Inc. (2026b, 5 Agustus). *Figma announces second quarter 2026 financial results* [Siaran pers]. Business Wire. https://www.businesswire.com/news/home/20260805158853/en/Figma-Announces-Second-Quarter-2026-Financial-Results
- Microsoft. (2026b, 29 Juli). *FY26 Q4 press release & webcast*. https://www.microsoft.com/en-us/investor/earnings/fy-2026-q4/press-release-webcast
- AlphaSignal. (2026, 13 Juli). *Anthropic makes Claude Artifacts multiplayer so teams can build together*. https://alphasignal.ai/news/anthropic-makes-claude-artifacts-multiplayer-so-teams-can-build-together
- Microsoft. (2026a, 2 Juni). *Build collaborative agents where work happens*. Microsoft 365 Developer Blog. https://devblogs.microsoft.com/microsoft365dev/build-collaborative-agents-where-work-happens/
- Grand View Research. (2026, Maret). *AI agents market size, share and trends report, 2026–2033*. https://www.grandviewresearch.com/industry-analysis/ai-agents-market-report
- Figma, Inc. (2026a, 18 Februari). *Figma announces fourth quarter and fiscal year 2025 financial results* [Exhibit 99.1]. U.S. Securities and Exchange Commission. https://www.sec.gov/Archives/edgar/data/1579878/000162828026009024/fy25pressrelease.htm
- Redmond, T. (2026, 30 Januari). *Microsoft FY26 Q2 results: 450 million Microsoft 365 seats*. Office 365 for IT Pros. https://office365itpros.com/2026/01/30/microsoft-fy26-q2-results/
- METR. (2026, 29 Januari). *Time horizon 1.1*. https://metr.org/blog/2026-1-29-time-horizon-1-1/
- Dust. (2026). *Multiplayer AI for human-agent collaboration*. Diakses 25 September 2026, dari https://dust.tt/
- Brynjolfsson, E., Li, D., & Raymond, L. (2025). Generative AI at work. *The Quarterly Journal of Economics, 140*(2), 889–942. https://doi.org/10.1093/qje/qjae044 (886 sitasi)
- OpenAI. (2025, 13 November; diperbarui 20 November). *Introducing group chats in ChatGPT*. https://openai.com/index/group-chats-in-chatgpt/
- Redmond Magazine. (2025, 27 Oktober). *Microsoft brings expanded memory, group collaboration and new visual assistant to Copilot*. https://redmondmag.com/articles/2025/10/27/microsoft-brings-expanded-memo-copilot.aspx
- BetterUp Labs. (2025, September). *What is AI workslop? Research on costs and solutions*. https://www.betterup.com/blog/hidden-costs-workslop
- Niederhoffer, K., Rosen Kellerman, G., Lee, A., Liebscher, A., Rapuano, K., & Hancock, J. T. (2025, 22 September). AI-generated "workslop" is destroying productivity. *Harvard Business Review*. https://hbr.org/2025/09/ai-generated-workslop-is-destroying-productivity
- Gartner. (2025a, 26 Agustus). *Gartner predicts 40% of enterprise apps will feature task-specific AI agents by 2026, up from less than 5% in 2025* [Siaran pers]. https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025
- Jaipuria, T. (2025, Juli). *Figma S-1 breakdown*. https://www.tanayj.com/p/figma-s-1-breakdown (sumber sekunder atas S-1 Figma bertanggal 15 Juli 2025)
- Gartner. (2025b, 25 Juni). *Gartner predicts over 40% of agentic AI projects will be canceled by end of 2027* [Siaran pers]. https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027
- Laban, P., Hayashi, H., Zhou, Y., & Neville, J. (2025). *LLMs get lost in multi-turn conversation* (arXiv:2505.06120). https://arxiv.org/abs/2505.06120 (10 sitasi; di bawah ambang 50)
- Dell'Acqua, F., Ayoubi, C., Lifshitz-Assaf, H., Sadun, R., Mollick, E. R., Mollick, L., Han, Y., Goldman, J., Nair, H., Taub, S., & Lakhani, K. R. (2025). *The cybernetic teammate: A field experiment on generative AI reshaping teamwork and expertise* (NBER Working Paper No. 33641). https://www.nber.org/papers/w33641 (sekitar 80 sitasi gabungan versi NBER, SSRN, dan Organization Science 2026)
- MarketsandMarkets. (2025, April). *AI agents market report 2025–2030*. https://www.marketsandmarkets.com/Market-Reports/ai-agents-market-15761548.html
- Microsoft. (2025, 23 April). *The 2025 annual Work Trend Index: The Frontier Firm is born*. https://blogs.microsoft.com/blog/2025/04/23/the-2025-annual-work-trend-index-the-frontier-firm-is-born/
- Kwa, T., West, B., Becker, J., Deng, A., Garcia, K., Hasin, M., et al. (2025). *Measuring AI ability to complete long software tasks* (arXiv:2503.14499). https://arxiv.org/abs/2503.14499 (14 sitasi di OpenAlex; di bawah ambang 50, dipakai karena sumber primer satu-satunya untuk metrik ini)
- Google. (2025, 15 Januari). *The future of AI-powered work for every business*. Google Workspace Blog. https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI
- Sands, M. (2024, 19 November). *AI collaboration report: "Using" AI is not enough*. Atlassian. https://www.atlassian.com/blog/productivity/ai-collaboration-report
- Slack. (2024). *The Fall 2024 Workforce Index shows executives and employees investing in AI, but uncertainty holding back adoption*. https://slack.com/blog/news/the-fall-2024-workforce-index-shows-executives-and-employees-investing-in-ai-but-uncertainty-holding-back-adoption
- Doshi, A. R., & Hauser, O. P. (2024). Generative AI enhances individual creativity but reduces the collective diversity of novel content. *Science Advances, 10*(28), eadn5290. https://doi.org/10.1126/sciadv.adn5290 (735 sitasi)
- Microsoft & LinkedIn. (2024, 8 Mei). *2024 Work Trend Index annual report*. https://news.microsoft.com/source/2024/05/08/microsoft-and-linkedin-release-the-2024-work-trend-index-on-the-state-of-ai-at-work/
- CNBC. (2023, 18 Desember). *Adobe and Figma call off 20 billion dollar acquisition after regulatory scrutiny*. https://www.cnbc.com/2023/12/18/adobe-and-figma-call-off-20-billion-merger.html
- Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T., & Fritz, M. (2023). Not what you've signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection. *Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security*, 79–90. https://doi.org/10.1145/3605764.3623985 (542 sitasi)
- Dell'Acqua, F., McFowland, E., Mollick, E. R., Lifshitz-Assaf, H., Kellogg, K., Rajendran, S., Krayer, L., Candelon, F., & Lakhani, K. R. (2023). *Navigating the jagged technological frontier: Field experimental evidence of the effects of AI on knowledge worker productivity and quality* (HBS Working Paper No. 24-013). https://doi.org/10.2139/ssrn.4573321 (783 sitasi; versi Organization Science 2026: 153 sitasi)
- Korpus internal: `01`, `03`, `05`, `06`, `08`, `09`, `12`, `14`, `17` di folder `context/`.
