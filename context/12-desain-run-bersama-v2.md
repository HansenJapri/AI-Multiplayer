---
title: Desain Run Bersama v2 — Hasil Red-Team
description: Spesifikasi lapisan kolaborasi manusia–agent ("Run bersama") setelah dua putaran uji celah adversarial. Status siap-validasi, BUKAN siap-bangun.
date: 2026-09-25
status: 🟡 PROPOSAL pasca-validasi — MVP ditetapkan di `17` §7; dokumen ini adalah backlog desain setelah gerbang `06` §8 lolos
last_revised: 2026-09-26
sources: [analisis sesi 24–25 Sep 2026, PRD-MASTER, AUDIT-KELAYAKAN, AUDIT-PROBLEM, riset eksternal §Sumber]
---

# Desain Run Bersama v2

**Status.** Dokumen ini adalah proposal desain hasil dua putaran red-team. Dokumen ini **bukan izin membangun**. AUDIT-PROBLEM sudah menolak rumusan asli "multi-player handoff" dengan skor 32/100, dan dokumen ini tidak membatalkan vonis itu. Fungsinya hanya menyiapkan bentuk produk yang bisa diuji jika eksperimen di bagian HASIL lolos.

**Penyelarasan dengan `17` (26 Sep 2026).** (1) Produk **tidak menilai atau mengoreksi** hasil kerja AI; semua komponen Critic dan "artefak terverifikasi" di versi awal dokumen ini sudah dihapus. (2) Receipt diganti **catatan sesi** (siapa melihat, mengarahkan, menyetujui, menyerahkan) tanpa klaim pemeriksaan. (3) Harga mengikuti `17` §5. (4) Cakupan MVP mengikuti `17` §7; backlog di bagian HASIL adalah pasca-MVP. (5) Kode aturan PRD (BR-xx) dirangkum di `05` §3 karena file spesifikasi PRD (`10`) sudah dihapus.

**Latar.** Titik awalnya adalah RFS Y Combinator Fall 2026 "Multiplayer AI" (Epstein). Syarat operasionalnya: siapa pun di tim bisa masuk ke sesi agent yang sedang berjalan untuk menonton, mengarahkan ulang, dan menyerahkannya ke orang lain (Y Combinator, 2026).

**Riwayat versi.**
- v1 (24 Sep, disampaikan di chat, tidak disimpan) mengganti unit kerja dari "pesan di Room" menjadi "Run".
- v1.1 (25 Sep) memisahkan jalur diskusi manusia dari jalur usulan ke agent. Ini perbaikan setelah founder menunjukkan bahwa pertanyaan orang IT tidak boleh ikut antre approval.
- v2 adalah dokumen ini.

**Konvensi label.** ✅ terverifikasi ke sumber · 🟡 kuat secara logika, belum ada data · 🔴 spekulasi · ⛔ tidak diketahui · **[ASUMSI]** angka desain yang harus dikalibrasi. Supaya tidak bentrok dengan legenda di `00-overview` (di sana "Tier 3" berarti ditolak), bukti dari korpus sendiri ditandai **[korpus internal]**, bukan Tier 3.

**Yang tidak berubah dari PRD.**
- Resolusi izin 7 langkah (§18).
- Batas Client/ClientViewer (§12.13).
- ArtifactVersion dan Handoff dengan re-otorisasi (BR-AR-03/04).
- Audit berantai-hash (BR-AC-01).
- Policy Engine deterministik (BR-PE).
- Pemisahan egress (§12.18).
- Aturan approver≠producer.
- Catatan sesi yang menyatakan proses (siapa melakukan apa), bukan kebenaran output.

**Pemetaan ke objek PRD.**

| Objek v2 | Hubungan ke PRD |
|---|---|
| Run | TaskRun yang diperluas: state baru `held`/`awaiting`, `funding_source`, `clearance` |
| Spec | Objek baru yang melekat ke Task |
| Clarification | Menggantikan UserInputRequest |
| Room | Tetap ada sebagai wadah navigasi dan diskusi umum, tapi **tidak pernah** menjadi konteks agent kecuali lewat usulan yang diterima |

Ringkasnya: lapisan interaksi dirancang ulang, model data diperluas, engine governance tetap.

Struktur file ini: **[ANALISA]** (hasil dua putaran red-team, prinsip desain, dan risiko residual), **[HASIL]** (spesifikasi objek/peran/jalur, contoh end-to-end, backlog, dan eksperimen validasi), **[SUMBER]** (daftar pustaka).

---

[ANALISA]

## Ringkasan perubahan v1.1 → v2

| Area | v1.1 | v2 |
|---|---|---|
| Otoritas | Owner satu-satunya penyetuju | Owner + Approver terdelegasi (bisa dibatasi per field); **Hold** bisa dipicu Steerer tanpa persetujuan |
| Jalur | 2 jalur (diskusi, usulan) | 3 jalur (Diskusi, Usulan, Klarifikasi agent) + sinyal Hold + tombol "jadikan usulan" + penanda drift deterministik |
| Klasifikasi | Pengguna menilai sendiri pesannya masuk jalur mana | Sistem mengklasifikasi berdasarkan **efek** pesan; kelas risiko R0/R1/R2 ditentukan Policy Engine |
| Visibilitas live | Semua peserta melihat semua langkah | Visibilitas mengikuti **clearance** run (high-water mark); langkah dari sumber yang tidak di-grant disamarkan |
| Biaya | Kredit bersama level Run, BYOK dibuang | Funding source per Run (BYOK Owner **atau** pool); menerima usulan = persetujuan membelanjakan; pratinjau biaya; resume dari checkpoint via read-set; tanpa Critic (produk tidak menilai output) |
| Draf privat | Satu konsep yang ambigu | Dipisah: **Catatan privat** (tidak dieksekusi, tidak diaudit) vs **Uji privat** (dieksekusi, diaudit, kuota pribadi) |
| Harga | Kursi Steerer berbayar | Penonton, komentator, dan tamu klien gratis; yang dibayar adalah pengemudi (sekitar 30 USD/bulan) atau workspace Agency (sekitar 199 USD/bulan) — `17` §5 |
| Solo | Tidak dirancang | Mode solo eksplisit: nilai tetap ada saat pengguna hanya satu orang |
| Konflik | Last-write-wins diam-diam | Usulan membawa `base_spec_version`; usulan yang kalah balapan ditandai *stale*, dengan diff 3 arah |

## Hasil red-team putaran 1

### Metode

Tujuh persona yang relevan untuk desain dipakai: Competitor CEO, Cynical Journalist, Angry Customer, Aggressive Regulator, Skeptical Investor, Disruptive Tech Trend, dan Internal Saboteur. Tiga persona sengaja dilewati (Cofounder Conflict, Burnout, Black Swan) karena menyerang perusahaan, bukan desain produk.

Nilai P (probabilitas) × I (dampak) di bawah adalah **penilaian saya 🟡, bukan data**.

### Inventaris temuan

| ID | Temuan | Persona | P | I | Tingkat | Perbaikan |
|---|---|---|---|---|---|---|
| F1 | Owner jadi satu-satunya gerbang. Run macet saat Owner absen, dan ini bertentangan dengan syarat YC "siapa pun bisa redirect" | Customer, Competitor | Tinggi | Tinggi | 🔴 | §Hasil 4.2, 4.5 |
| F2 | Kebocoran data lewat tampilan live (*confused deputy*): Watcher tanpa grant melihat output langkah yang membaca sumber Rahasia | Regulator, Journalist, Saboteur | Sedang–Tinggi | Tinggi | 🔴 | §Hasil 4.7 |
| F3 | Biaya naik superlinear: setiap usulan yang diterima memicu run ulang penuh (versi awal: + Critic ulang; Critic kini dihapus), sementara pendapatan kursi naik linear. Memperparah vonis AUDIT-KELAYAKAN (unit economics 0/2) | Investor, Customer | Tinggi | Tinggi | 🔴 | §Hasil 4.8 |
| F4 | Keputusan hilang di jalur Diskusi (*Spec drift*): informasi penting diketahui manusia tapi tidak pernah sampai ke agent. Ini mengulang akar masalah dari analisis 5 Whys | Customer | Tinggi | Tinggi | 🔴 | §Hasil 4.3 |
| F5 | Moat verifikasi lintas-vendor (PRD §3.5) runtuh terhadap platform agregator multi-vendor | Competitor | Tinggi | Tinggi | 🔴 (strategi; tidak bisa diselesaikan desain) | §Analisa: Implikasi di luar desain |
| F6 | *Cold start*: desain tidak bernilai sampai orang kedua bergabung, sementara ICP terbaru adalah solopreneur | Investor | Tinggi | Tinggi | 🔴 | §Hasil 4.9 |
| F7 | Injeksi prompt lewat isi usulan + Owner menyetujui asal-asalan (*rubber-stamp*) | Saboteur | Sedang | Tinggi | 🟠 | §Hasil 4.4, 4.7 |
| F8 | Pertanyaan dari agent ke manusia tidak punya jalur dan pemilik otoritas | Customer | Tinggi | Sedang | 🟠 | §Hasil 4.3 |
| F9 | Dua usulan bersamaan pada field yang sama saling menimpa diam-diam | Customer | Sedang | Sedang | 🟡 | §Hasil 4.6 |
| F10 | Menulis Spec terstruktur menambah friksi dibanding chat, sehingga aktivasi turun | Customer, Investor | Tinggi | Sedang | 🟠 | §Hasil 4.10 |
| F11 | Terlalu banyak peran dan jalur untuk tim kecil | Customer | Tinggi | Sedang | 🟠 | §Hasil 4.10 dan 8 |
| F12 | "Draf privat" ambigu soal audit: risiko kepercayaan karyawan dan transparansi pemrosesan data (UU PDP) | Regulator, Journalist | Sedang | Sedang | 🟠 | §Hasil 4.7 |
| F13 | Kursi Steerer berbayar mematikan loop undangan (viral) | Investor | Tinggi | Sedang | 🟠 | §Hasil 4.8 |
| F14 | v1 membuang BYOK tanpa rekonsiliasi dengan keputusan PRD 16 Agustus | Investor | Pasti | Sedang | 🟠 | §Hasil 4.8 |
| F15 | Tautan Run bocor (model "siapa pun yang punya link") | Saboteur, Journalist | Sedang | Tinggi | 🟠 | §Hasil 4.7 |
| F16 | Usulan hilang diam-diam (tanpa kedaluwarsa atau notifikasi) | Customer | Tinggi | Sedang | 🟠 | §Hasil 4.5 |
| F17 | Akuntabilitas kabur: Owner menyetujui angka yang tidak bisa ia periksa sendiri | Journalist, Regulator | Sedang | Sedang | 🟡 | §Hasil 4.4 |
| F18 | Komentar internal ikut terlihat oleh klien | Journalist | Sedang | Tinggi | 🟠 | §Hasil 4.2 |
| F19 | Jalur Diskusi bersaing dengan Slack/Teams, padahal integrasi tulis ke Slack ada di luar cakupan V1 | Tech Trend | Tinggi | Sedang | 🟠 | residual (§Analisa: red-team putaran 2) |
| F20 | Spec berubah saat sebuah langkah sedang berjalan (*race condition*) | Customer | Sedang | Rendah | 🟡 | §Hasil 4.6 |
| F21 | Fork dipakai orang dalam yang akan keluar untuk menyalin data | Saboteur | Rendah | Tinggi | 🟡 | §Hasil 4.7 |
| F22 | Tampilan "run bersama" sudah dikomoditisasi di domain coding | Tech Trend, Competitor | Tinggi | Sedang | 🟠 | §Analisa: Implikasi di luar desain |

### Rincian temuan fatal

**F1 — Owner sebagai titik gagal tunggal.**
- Skenario kegagalan: Rani menemukan angka revenue salah pukul 09.20. Owner sedang rapat sampai 11.00. Agent terus menulis narasi dan PDF dari angka yang salah. Token terbakar, dan artefak yang salah siap dikirim.
- Akar masalah: v1.1 menyamakan "boleh menghentikan" dengan "boleh mengubah arah". Menghentikan itu murah dan bisa dibalik. Mengubah arah itu berisiko dan membelanjakan uang. Keduanya butuh otoritas yang berbeda.

**F2 — Kebocoran lewat tampilan live.**
- Masalahnya: PRD menjamin peserta Room tidak bisa mengakses knowledge tanpa grant (kriteria Tahap 4). Tapi run yang ditonton live menayangkan **turunan** dari knowledge itu, misalnya ringkasan tabel gaji klien. Watcher tanpa grant membaca turunannya, sehingga isolasi di lapisan knowledge ditembus lewat lapisan tampilan.
- Headline yang bisa ditulis jurnalis: "Kontraktor Lepas Bisa Menonton Data Klien Secara Live Lewat Fitur 'Sesi Bersama' AI".

**F3 — Biaya superlinear.**
- Rumus sederhana: biaya total run = C × (1 + Σfᵢ), dengan C = biaya satu run bersih dan fᵢ = porsi run yang dieksekusi ulang oleh usulan ke-i.
- Ilustrasi (bukan data): 5 usulan diterima dengan restart penuh (f = 1) menghasilkan 6C. Kalau resume dari checkpoint dengan rata-rata f = 0,3, hasilnya 2,5C.
- Versi awal menambahkan Critic default-on di setiap run ulang, penyebab margin kotor negatif di AUDIT-KELAYAKAN. Critic sudah dihapus; di MVP `17`, token dibayar langsung oleh pengguna lewat langganannya sendiri.

**F4 — Keputusan hilang di Diskusi.**
- Skenario: orang IT menulis di Diskusi "Sales Dashboard lama sudah deprecated, datanya di Sales DB v2". Tidak ada yang mengubahnya menjadi usulan. Agent tetap membaca sumber lama.
- Pemisahan jalur di v1.1 membuat konteks agent bersih, tapi sekaligus **memutus** informasi penting dari agent. Ini persis akar masalah "tidak ada objek kerja bersama" yang ingin diselesaikan desain ini.

**F5 — Moat lintas-vendor.**
- PRD §3.5 mengklaim tidak ada incumbent yang akan mengirim pemeriksaan output oleh model dari vendor berbeda karena konflik kepentingan.
- Klaim ini hanya berlaku untuk **lab model**, tidak untuk **platform agregator**:
  - Microsoft 365 Copilot menawarkan model Anthropic (Claude Sonnet 4, Opus 4.1) berdampingan dengan OpenAI sejak 24 September 2025 ✅ (Microsoft, 2025).
  - GitHub Agent HQ menyatukan agent dari Anthropic, OpenAI, Google, Cognition, dan xAI, lengkap dengan mission control dan code review oleh agent (GitHub, 2025) ✅.
- Agregator tidak punya konflik kepentingan untuk menjalankan model A memeriksa model B. Mereka **bisa** mengirimkannya dalam satu kuartal 🟡. Belum ada bukti bahwa mereka sudah melakukannya ⛔.

**F6 — Cold start.** Desain v1/v1.1 baru bernilai ketika ada orang kedua. Pengguna pertama di workspace mana pun, termasuk semua solopreneur, akan melihat produk dengan nilai nol di sisi kolaborasi.

### Skenario pengguna yang marah (dipakai untuk menguji perbaikan)

1. "Usulan saya hilang begitu saja. Laporan terkirim dengan angka lama, dan saya tidak pernah diberi tahu." (F16)
2. "Saya dapat 40 notifikasi approval sehari. Akhirnya saya klik setuju saja semuanya." (F1, F7, dan aritmetika PRD sendiri: 23–68 approval/hari di tier Pro [korpus internal])
3. "Saya kerja sendirian. Kenapa harus mengatur peran dan jalur?" (F6, F11)

## Prinsip desain v2

**P1 — Solo dulu, multiplayer sebagai tambahan.** Run harus bernilai untuk satu orang (Spec, resume hemat biaya, tautan tamu klien). Setiap orang tambahan memperbesar nilai, bukan menjadi syarat nilai.

**P2 — Otoritas asimetris.** Menghentikan itu murah dan terbuka untuk semua Steerer. Mengubah arah dikendalikan. Membelanjakan uang harus disetujui. Preseden yang dipakai adalah "andon cord" di manufaktur: siapa pun boleh menghentikan lini, hanya yang berwenang yang mengubah proses 🟡 (preseden, bukan data).

**P3 — Klasifikasi berdasarkan efek, bukan pilihan pengguna.** Sistem menentukan apakah sebuah pesan menyentuh Spec atau memicu komputasi. Pengguna tidak diminta memilih jalur.

**P4 — Mengisi yang kosong itu longgar; menimpa yang terkunci itu dijaga.**

**P5 — Agent hanya membaca empat hal:** Spec, artefak yang sudah disetujui, knowledge yang di-grant, dan jawaban klarifikasi. Diskusi mentah tidak pernah masuk konteks agent. Dasarnya: performa model turun rata-rata 39% di percakapan multi-turn dibanding single-turn (Laban et al., 2025) ✅.

**P6 — Visibilitas mengikuti clearance.** Menonton sebuah run membutuhkan grant yang mencakup semua sumber yang dibaca run itu.

**P7 — Biaya mengikuti persetujuan.** Siapa yang menerima perubahan, dialah yang menyetujui belanjanya. Pratinjau biaya wajib ditampilkan, dan batas biaya ditegakkan secara deterministik.

**P8 — Tidak ada penilaian output oleh platform.** Produk tidak menjalankan Critic atau pemeriksa kualitas berbasis LLM. Pemeriksaan deterministik (bukti usulan ada dan bisa diakses, batas biaya, izin) tetap ada karena itu memeriksa aturan, bukan kualitas kerja AI.

## Red-team putaran 2 — risiko residual setelah perbaikan

| ID | Risiko residual | Tingkat | Penanganan |
|---|---|---|---|
| RR1 | Kompleksitas **naik** (5 peran + klien, 3 jalur, 3 kelas risiko). Ini bertentangan dengan tujuan "siapa pun bisa masuk". | 🟠 | Default + progressive disclosure (§Hasil 4.10); uji: waktu ke run pertama dan % pengguna yang menyentuh pengaturan peran |
| RR2 | Recall penanda drift deterministik tidak diketahui. F4 bisa tetap terjadi. | 🟠 ⛔ | Uji replay offline (A6); tombol manual tetap ada |
| RR3 | ContractedAgent eksternal tidak punya read-set → restart penuh → biaya tinggi justru untuk segmen PRD §12.11 | 🟠 | Pratinjau jujur; negosiasi kontrak checkpoint via MCP di V2 |
| RR4 | Penyamaran per langkah bisa membuat tampilan live nyaris kosong bagi peserta tanpa grant, sehingga nilai "menonton" turun | 🟡 | Ukur % tampilan tersamar; kalau tinggi, alur grant (AccessRequest) harus satu klik |
| RR5 | Timer eskalasi menekan penyetuju untuk cepat setuju → rubber-stamp | 🟠 | Pantau dwell time (BR-HL-04); eskalasi hanya memberi tahu, tidak pernah menyetujui |
| RR6 | R0 bisa disalahgunakan dengan memecah perubahan | 🟡 | R0 hanya untuk field yang kosong sejak awal run + batas per jam + batas biaya kumulatif |
| RR7 | Hold dipakai sebagai sabotase ringan (memblokir run) | 🟡 | Alasan wajib, log, metrik Hold per orang, Owner bisa mencabut hak |
| RR8 | Jalur D kalah dari Slack/Teams (F19). Keputusan tetap terjadi di luar produk, di tempat yang tidak bisa dilihat penanda drift. | 🟠 | Komentar yang ditambatkan ke langkah/artefak adalah pembeda; integrasi baca Slack masuk backlog V2. Diterima sebagai risiko adopsi |
| RR9 | Semua ambang [ASUMSI] belum dikalibrasi | 🟠 | §Hasil: Asumsi yang harus divalidasi |
| RR10 | Moat belum terselesaikan (F5). Desain yang rapi tidak menggantikan moat. | 🔴 | §Implikasi di luar desain → `17` §6 |

## Implikasi di luar desain (harus ditindaklanjuti di `05` dan `08`)

**F5 — revisi klaim moat PRD §3.5.**
- Dari: "incumbent tidak akan mengirim verifikasi lintas-vendor".
- Menjadi: "lab model tidak akan; agregator multi-vendor (Microsoft 365 Copilot, GitHub Agent HQ) bisa".
- Kandidat moat pengganti yang perlu diuji:
  - ~~(i) independensi verifikasi dari vendor stack pembeli~~ — gugur: produk tidak menilai output;
  - (ii) akumulasi riwayat sesi dan keputusan per klien yang menciptakan switching cost — 🟡 (dipakai di `17` §6);
  - (iii) ~~fokus non-coding~~ — diganti: ICP 1 di `17` adalah software agency lintas-klien, pembedanya batas klien dan kontinuitas lintas harness, bukan non-coding.
- Positioning dan peluang final: `17` §6.

**Keputusan ICP.** Sudah diputuskan di `17` §1: software agency lintas-klien, lalu tim produk AI-native multi-harness, lalu konsultan non-legal. Eksperimen di bagian HASIL dijalankan pada tim ≥3 orang. Hasil dari solopreneur tidak menguji tesis multiplayer.

---

[HASIL]

## Spesifikasi desain v2

### Objek dan state

**Run**
- Field: `id`, `task_id`, `owner`, `approvers[]` (masing-masing dengan `field_scope` opsional), `funding_source` (BYOK Owner | pool workspace), `budget_cap`, `clearance` (klasifikasi tertinggi dari sumber yang sudah dibaca), `spec_version`.
- State: `draft` → `running` ⇄ `held` / `awaiting_clarification` → `awaiting_approval` → `done` / `cancelled`.

**Spec**
- Setiap field punya `{value, status: empty|proposed|locked, author, evidence_ref, version}`.
- Field bawaan:
  - `goal` — satu-satunya field wajib.
  - `data_sources[]` — field berisiko.
  - `period`, `definition_of_done`, `output_format`.
  - `audience` — internal/klien; field berisiko.
  - `decisions[]` — keputusan yang sudah dikunci.
  - `notes` — maksimal 1.000 karakter [ASUMSI]; di dalam konteks agent dibungkus sebagai input pengguna yang tidak tepercaya.

**Checkpoint.** Dibuat setelah setiap langkah. Menyimpan hash output tool dan **read-set**, yaitu field Spec yang dimuat ke konteks langkah itu. Read-set tersedia karena konteks per langkah dirakit oleh sistem dari field-field Spec.

**Suggestion (usulan).**
- Isi: diff bertipe pada satu atau lebih field Spec, `base_spec_version`, alasan, `evidence_ref`, `urgency` (segera | checkpoint berikut | digest), `risk_class` (dihitung sistem), `cost_preview`.
- Status: submitted → checked → accepted / rejected / stale / expired.

**Comment (Diskusi).** Ditambatkan ke langkah run, artefak, atau Room. `audience` = internal (default) | klien. Tidak pernah masuk konteks agent.

**Clarification.** Pertanyaan dari agent tentang satu field Spec, dirutekan ke responden yang ditunjuk untuk field itu.

**Hold.** Permintaan jeda. Wajib menyertakan alasan dan berlaku di checkpoint berikutnya.

**Fork.** Run baru dari sebuah checkpoint. Mewarisi clearance dan batas Client, dan membutuhkan grant yang setara.

### Peran dan matriks otoritas

| Aksi | Watcher | Commenter | Steerer | Approver | Owner | Klien |
|---|---|---|---|---|---|---|
| Tonton live (disamarkan sesuai clearance) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ — hanya artefak final + catatan sesi, kecuali Owner mengizinkan eksplisit (tamu klien di MVP `17` §7 hanya lihat + komentar) |
| Komentar internal | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Komentar di thread klien | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Hold | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| Ajukan usulan | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| Jawab klarifikasi (field kosong) | ✗ | ✗ | ✓ bila ditunjuk | ✓ | ✓ | ✗ |
| Terima R1 | ✗ | ✗ | ✗ | ✓ dalam `field_scope` | ✓ | ✗ |
| Terima R2 | ✗ | ✗ | ✗ | ✓ hanya bila scope R2 diberikan eksplisit | ✓ | ✗ |
| Lepas Hold | ✗ | ✗ | Hanya Hold miliknya | ✓ | ✓ | ✗ |
| Fork | ✗ | ✗ | ✓ grant setara | ✓ | ✓ | ✗ |
| Setujui artefak final / handoff | ✗ | ✗ | ✗ | ✓ (approver≠producer) | ✓ | ✗ |
| Undang peserta | ✗ | ✗ | ✓ sampai peran Steerer | ✓ | ✓ | ✗ |
| Ubah izin, egress, funding, batas biaya | ✗ | ✗ | ✗ | ✗ | ✓ lewat Settings, **tidak pernah lewat usulan** | ✗ |

Aturan tambahan:
- Pengusul tidak boleh menyetujui usulannya sendiri (approver≠producer). Pengecualian hanya di mode solo.
- Undangan default memberi peran Steerer. Tujuannya menjaga loop undangan (F13).

### Tiga jalur + Hold

**Jalur D — Diskusi manusia↔manusia.**
- Real-time, tanpa approval, tidak masuk konteks agent.
- Contoh: orang IT bertanya soal akses folder dan langsung dijawab dalam hitungan menit.

**Jalur U — Usulan.**
- Semua yang mengubah Spec atau memicu komputasi ulang.
- Diatur oleh kelas risiko di bawah.

**Jalur K — Klarifikasi agent (perbaikan F8).**
- Agent bertanya tentang field yang kosong, lalu responden yang ditunjuk menjawab.
- Jawaban yang **mengisi field kosong** masuk kelas R0.
- Jawaban yang bertentangan dengan field `locked` otomatis dinaikkan menjadi usulan R2.

**Hold (perbaikan F1).**
- Steerer mana pun bisa menjeda run di checkpoint berikutnya, tanpa persetujuan siapa pun.
- Alasan wajib dan tercatat. Hold bertahan sampai dilepas oleh pemicunya, Approver, atau Owner.
- Owner bisa mencabut hak Hold dari orang yang menyalahgunakannya.

**Jembatan Diskusi → Usulan (perbaikan F4).**
- Setiap komentar punya tombol **"Jadikan usulan"**. Usulan yang dihasilkan menautkan komentar asal sebagai `evidence_ref`.
- **Penanda drift deterministik** menampilkan tombol itu secara proaktif ke penulis dan pembalas komentar bila salah satu aturan ini terpenuhi:
  - (a) komentar menyebut nama sumber yang ada di katalog knowledge tapi tidak ada di `data_sources`;
  - (b) komentar memuat angka yang berbeda dari nilai field numerik yang dirujuk dengan kata kunci yang sama;
  - (c) komentar adalah balasan pada sebuah langkah run dan mengandung kata kunci keputusan ("ganti", "jangan", "harusnya", "pakai").
- Detektor berbasis LLM hanya opsional, *read-only*, tanpa tool, dan keluarannya hanya berupa penanda.
- Recall aturan deterministik ini ⛔ belum diketahui (lihat asumsi A6 di bawah).

### Kelas risiko usulan (ditentukan Policy Engine, deterministik)

| Kelas | Kondisi | Siapa menerima |
|---|---|---|
| **R0** | Mengisi field yang berstatus `empty` sejak run dimulai; bukan field berisiko; pratinjau biaya ≤5% budget run [ASUMSI]; maksimal 5 R0 per jam per run [ASUMSI] (mencegah perubahan besar dipecah jadi banyak R0) | Otomatis diterima; Owner diberi tahu lewat digest |
| **R1** | Mengubah field yang belum `locked`; tidak menyentuh `data_sources` atau `audience`; biaya ≤20% budget [ASUMSI] | Approver (dalam scope) atau Owner |
| **R2** | Mengubah field `locked`, menambah/mengganti `data_sources`, mengubah `audience`, biaya >20%, atau diajukan akun eksternal/kontraktor | Owner, atau Approver yang diberi scope R2 eksplisit |
| **Dilarang** | Izin, grant, tujuan egress, funding source, batas biaya, override clearance | Tidak bisa diusulkan; hanya lewat Settings Owner |

**Pertahanan injeksi (F7).**
- Usulan berbentuk diff bertipe dengan batas skema per field, bukan teks bebas. Satu-satunya field teks bebas, `notes`, dibatasi panjangnya dan diberi pembatas sebagai input tidak tepercaya saat konteks dirakit.
- Policy Engine menolak usulan yang memuat URL atau tujuan yang tidak ada di whitelist.
- Agent yang membaca isi usulan tidak punya kapabilitas egress (PRD §12.18).
- Pertahanan ini berlapis, **bukan kekebalan**. Injeksi prompt tidak langsung tetap merupakan risiko terbuka (Greshake et al., 2023) ✅.
- Approval diberi pemeriksaan *dwell time*: waktu tinjau median di bawah 5 detik ditandai sebagai rubber-stamping (BR-HL-04).

**Akuntabilitas bukti (F17).**
- Sebelum usulan sampai ke penyetuju, sistem menjalankan pemeriksaan **deterministik gratis**: `evidence_ref` harus ada dan bisa diakses pengusul. Bila sumbernya terstruktur (tabel/CSV), angka yang diusulkan dicocokkan persis.
- Bila tidak bisa dicocokkan, usulan diberi lencana "bukti belum terverifikasi".
- Catatan sesi mencatat asal nilai, misalnya: "nilai dari Rani, sumber Sales DB v2, disetujui Owner".
- Tidak ada penilaian berbasis LLM di tahap usulan (P8).

### SLA, eskalasi, kedaluwarsa (perbaikan F1, F16)

**Urgensi "segera":**
1. Sistem otomatis memasang Hold di checkpoint berikutnya.
2. Notifikasi push dikirim ke semua penyetuju yang berwenang untuk kelas usulan itu.
3. Setelah T_esk = 30 menit [ASUMSI] tanpa keputusan, eskalasi ke penyetuju berikutnya.
4. Bila semua habis, run **tetap di-Hold**. R2 tidak pernah diterima otomatis.

**Kedaluwarsa.** Setelah 24 jam [ASUMSI], usulan kedaluwarsa. Pengusul diberi tahu secara eksplisit dan statusnya tercatat. Tidak ada usulan yang hilang diam-diam.

**Model waktu tunggu 🟡.** Jika k penyetuju masing-masing memeriksa antrean secara acak dengan interval T, waktu tunggu yang diharapkan ≈ T/(k+1).
- Contoh: T = 60 menit dengan satu penyetuju → ~30 menit; dengan dua penyetuju → ~20 menit.
- Model ini mengasumsikan pemeriksaan independen dan seragam, dan belum diukur.
- Konsekuensi desainnya: delegasi Approver adalah pengungkit latensi utama, bukan antarmuka.

**Anggaran interupsi.** Notifikasi per orang dibatasi, misalnya maksimal 6 per jam [ASUMSI]. Notifikasi selebihnya masuk digest, **kecuali** Hold dan usulan "segera" dalam scope orang tersebut. Dasarnya: pekerja sudah diinterupsi tiap 2 menit, 275 kali per hari (Microsoft WorkLab, 2025) ✅.

### Konkurensi (F9, F20)

- Usulan diterapkan terhadap `base_spec_version`. Bila field yang sama sudah berubah sejak itu, usulan berstatus *stale*: penyetuju melihat diff 3 arah dan pengusul diminta *rebase*.
- Dua usulan pada field yang sama ditampilkan berdampingan. Menerima satu otomatis menandai yang lain *stale*.
- Perubahan Spec berlaku di **batas checkpoint**. Langkah yang sedang berjalan diselesaikan dulu, kecuali ada Hold "segera", di mana langkah dibatalkan bila tool mengizinkan.

### Keamanan dan privasi

**Clearance (F2).**
- `clearance` run = klasifikasi tertinggi dari semua sumber yang sudah dibaca (model *high-water mark*).
- Tampilan penuh hanya untuk peserta yang grant-nya mencakup seluruh sumber itu. Peserta lain mendapat **tampilan tersamar**: nama dan status langkah tetap terlihat, tapi seluruh output langkah yang membaca sumber di luar grant mereka disembunyikan.
- Penyamaran dilakukan per langkah, bukan per kalimat. Output LLM tidak bisa diatribusi ke sumber secara presisi, jadi aturannya sengaja konservatif.
- Pratinjau usulan R2 yang menambah sumber menampilkan dampaknya, misalnya "3 peserta akan kehilangan tampilan penuh".

**Klien (F18).**
- Klien hanya melihat artefak final, catatan sesi, dan thread berlabel audiens klien.
- Komentar selalu default internal. Label audiens klien harus dipilih secara eksplisit.

**Tautan (F15).**
- URL Run hanyalah penunjuk. Membukanya tetap membutuhkan autentikasi + grant.
- Satu-satunya tautan yang bisa diakses pihak luar adalah tautan tamu klien per run, yang dibuat opt-in oleh pemilik.

**Privat (F12).**
- **Catatan privat**: tidak dieksekusi, tidak menyentuh data, tidak diaudit, tidak terlihat admin.
- **Uji privat**: dieksekusi terhadap data, dicatat audit penuh, terlihat Owner/admin sesuai kebijakan workspace, tidak terlihat rekan, dan dibiayai kuota sandbox pribadi.
- Label ini ditampilkan **sebelum** eksekusi.
- UU PDP No. 27/2022 berlaku penuh sejak 17 Oktober 2024 ✅ (Antara, 2024). Transparansi pencatatan harus masuk pemberitahuan privasi workspace. *Bukan nasihat hukum; butuh review konsultan.*

**Orang dalam (F21).**
- Fork tunduk pada grant dan batas Client yang sama, dan setiap fork diaudit.
- Tangkapan layar tidak bisa dicegah (**diterima sebagai risiko**).
- Log "siapa melihat langkah apa" hanya diaktifkan untuk run berklasifikasi Rahasia/Sangat Sensitif, agar tidak menjadi pemantauan karyawan yang berlebihan.

### Biaya dan billing (F3, F13, F14)

**Funding source per Run** ditetapkan saat run dibuat:
- BYOK Owner (default untuk agent buatan pengguna; tetap selaras dengan keputusan PRD 16 Agustus), atau
- pool workspace.

Menerima usulan = menyetujui belanja dari sumber itu. Steerer tidak pernah bisa membelanjakan tanpa penerimaan. Pengecualiannya R0, yang dibatasi ambang biaya dan batas run.

**Resume via read-set.**
- Saat field X berubah, sistem mencari langkah paling awal s yang read-set-nya memuat X, lalu melanjutkan dari checkpoint sebelum s. Langkah-langkah sebelumnya dipakai ulang.
- Pratinjau biaya menampilkan porsi yang akan diulang, misalnya "ulang langkah 3–4 ≈ 30% biaya run".
- **Batasan:** ContractedAgent eksternal (n8n, LangGraph, dll.) menyimpan memorinya sendiri, jadi tidak punya read-set. Untuk run seperti ini, restart penuh adalah default, dan pratinjau harus menyatakannya.

**Tidak ada Critic.** Platform tidak menjalankan model untuk menilai output (keputusan 25 Sep 2026).

**Batas biaya per run** ditegakkan Policy Engine secara deterministik (sudah ada di PRD: batas biaya per workflow).

**Hipotesis harga (diuji di minggu 4):**
- Watcher, Commenter, dan Steerer gratis, karena tindakan yang memakan biaya (menerima usulan) ada di peran berbayar.
- Yang dibayar: pengemudi sekitar 30 USD per bulan, atau workspace Agency sekitar 199 USD per bulan (`17` §5).
- Approver termasuk dalam paket hingga N orang, supaya harga tidak menghukum delegasi (F1).
- Status seluruh hipotesis ini: 🔴 belum ada data WTP.

### Mode solo (F6)

Saat workspace hanya punya satu peserta:
- Jalur D disembunyikan.
- Usulan menjadi edit Spec langsung (diterima sendiri, tetap berversi).
- Hold menjadi tombol jeda.
- R2 boleh disetujui sendiri, dengan catatan sesi yang menyatakan "disetujui oleh pembuat sendiri".

Nilai untuk pengguna solo:
- Spec terstruktur (konteks agent lebih bersih, P5).
- Resume hemat biaya.
- Tautan tamu klien, sekaligus loop undangan. Mode solo hanya pintu masuk gratis; solopreneur bukan ICP (`17` §1).

**Konsekuensi strategis 🟡:** arsitektur ini tidak bergantung pada ICP karena dirancang solo-first. Tapi **positioning dan validasi tetap harus memilih**. Tesis YC hanya relevan untuk ICP tim.

### Default UX dan pengendalian kompleksitas (F10, F11)

- Spec dirancang dari prompt bahasa bebas oleh agent milik pengguna sendiri (memakai key/langganan pengguna, bukan Planner bawaan platform — lihat `14`). Owner cukup mengonfirmasi. Hanya `goal` yang wajib.
- Default peran: pembuat = Owner, undangan = Steerer. Approver opsional.
- *Progressive disclosure*: fork, uji privat, pengaturan clearance, dan scope Approver disembunyikan sampai dibutuhkan.
- Approval tampil di **antrean** yang dikelompokkan per urgensi, tidak di feed. Ini menyelesaikan kontradiksi BR-UX-03 vs kebutuhan triase di `08-risiko` §6.

### Instrumentasi (wajib sejak hari pertama)

Event yang dicatat:
- `run_created`
- `spec_field_changed{via: owner_edit | suggestion | clarification | auto_r0}`
- `suggestion_{submitted, accepted, rejected, stale, expired}{class, wait_ms, dwell_ms, cost_preview}`
- `hold_{raised, released}{reason}`
- `comment_posted{lane: D, audience}`
- `drift_nudge_{shown, converted}`
- `clarification_{asked, answered}{latency_ms}`
- `checkpoint_resume{from_step, fraction_reexecuted}`
- `participant_joined{role, view: full | masked}`
- `guest_invited`
- `invite_{sent, accepted}`

Metrik turunan:
- **Redirect lift** — selisih tingkat penerimaan output antara run yang diubah lewat usulan dan run tanpa usulan.
- **K** — undangan per creator × konversi undangan.
- **Friction Index** — (waktu koordinasi + menunggu + rework) / waktu total.
- **Pengali biaya** — 1 + Σf.
- **Proporsi Jalur D vs U.**

## Contoh end-to-end

**Pemeran:**
- Anda (Owner; agent "Pelapor" dibiayai BYOK Anda).
- Rani (Steerer + Approver dengan scope field `period`).
- Budi (IT, Commenter).
- PT X (Klien).

| Waktu | Kejadian | Mekanisme |
|---|---|---|
| 09.00 | Anda mengetik: "Buat laporan performa kampanye minggu ini untuk PT X dari Sales Dashboard." Agent Anda merancang draf Spec: goal, data_sources = [Sales Dashboard], period = kosong, output = PDF 2 halaman, audience = klien. Anda konfirmasi. Batas biaya ditetapkan. | Default UX |
| 09.01 | Agent bertanya: "Periode 16–22 Sep atau minggu ISO 38?" | Jalur K → dirutekan ke Rani |
| 09.03 | Rani menjawab "16–22 Sep". | R0: mengisi field kosong → diterima otomatis, masuk digest Anda |
| 09.05 | Run berjalan: L1 tarik data → L2 hitung metrik → L3 narasi → L4 susun PDF. | Checkpoint + read-set per langkah |
| 09.15 | Budi bertanya di Diskusi: "Run ini perlu akses DB penjualan? Saya siapkan grant-nya?" Rani menjawab 09.16. | Jalur D, real-time, tanpa approval |
| 09.20 | Budi berkomentar di langkah L1: "Sales Dashboard lama sudah deprecated sejak Senin, datanya di Sales DB v2." | Jalur D |
| 09.20 | Penanda drift aturan (a): "Sales DB v2" ada di katalog, tidak ada di `data_sources`. Tombol "Jadikan usulan?" muncul untuk Budi dan Rani. | Jembatan Diskusi → Usulan |
| 09.21 | Rani mengubahnya menjadi usulan U-1 (ganti sumber data; bukti = komentar Budi; urgensi = segera). Sistem mengklasifikasi **R2**. Pratinjau: ulang dari L1 ≈ 100% biaya yang sudah terpakai; clearance naik ke Rahasia; Budi punya grant; Klien tetap hanya melihat artefak final. | Kelas risiko, keamanan, biaya |
| 09.21 | Hold otomatis → agent berhenti setelah L2, **sebelum** L3–L4 membakar token untuk narasi dari data yang salah. | SLA |
| 09.21 | Rani tidak bisa menyetujui (dia pengusul, dan tidak punya scope R2 untuk `data_sources`). Notifikasi push ke Anda; Anda sedang rapat. | approver≠producer |
| 09.51 | Eskalasi T_esk: tidak ada penyetuju lain → run tetap Hold. Rani melihat status "menunggu Owner, eskalasi ke-1". | Tidak ada usulan yang hilang diam-diam |
| 10.40 | Anda membuka antrean dan melihat diff, bukti, dan pratinjau biaya. Anda terima. Spec v4. Resume dari checkpoint sebelum L1. | P7 |
| 10.55 | Kandidat artefak selesai. Anda meninjau sendiri angka terhadap Sales DB v2, merevisi satu angka, lalu menyetujui. Produk hanya mencatat siapa meninjau dan menyetujui. | P8 |
| 11.10 | Artefak final dan catatan sesi dibagikan ke PT X lewat tautan tamu. Klien berkomentar di thread klien: "Tambahkan perbandingan minggu lalu." Anda mengubahnya menjadi usulan untuk run minggu depan. | Loop tamu |

**Pembanding v1.1:** komentar Budi tetap di Diskusi, tidak ada yang mengubahnya menjadi usulan, dan laporan dari data deprecated terkirim ke klien.

**Keterbatasan yang terlihat di contoh ini:** v2 tidak menghapus waktu tunggu 79 menit (09.21–10.40) untuk usulan R2. Yang dilakukan v2 hanya membuat tunggu itu **murah** (Hold) dan **terlihat** (status eskalasi). Satu-satunya pengungkit untuk memperpendeknya adalah menunjuk Approver kedua dengan scope R2 untuk `data_sources`, misalnya Account Manager.

## Backlog pasca-MVP (hanya jika gerbang `06` §8 lolos)

MVP dua minggu ditetapkan di `17` §7 (hook Claude Code: amati, arahkan lewat pesan + Hold, serahkan, tamu klien, deposit). Daftar di bawah adalah urutan pembangunan **setelah** MVP itu lolos.

**Tahap berikutnya:**
- Run + Spec (goal, data_sources, period, DoD, decisions).
- Jalur D (komentar tertambat, audiens internal/klien).
- Jalur U dengan R0 dan R2 saja (R1 digabung ke R2 dulu).
- Jalur K.
- Hold.
- Satu Approver cadangan (belum per field).
- Resume via read-set untuk agent internal.
- Pemeriksaan clearance saat bergabung + tampilan tersamar.
- Pratinjau biaya + batas biaya.
- Catatan sesi (pengganti Receipt).
- Semua event di atas.

**Ditunda:** fork, uji privat, detektor drift berbasis LLM, scope Approver per field, R1 terpisah, tampilan live untuk klien, integrasi Slack.

## Asumsi yang harus divalidasi → eksperimen

Minggu-minggu di tabel mengacu pada roadmap 4 minggu dari analisis YC. Metrik dan kill criteria MVP yang berlaku ada di `17` §7 dan `07` §6.

| ID | Asumsi | Eksperimen | Metrik → keputusan |
|---|---|---|---|
| A1 | Porsi pesan yang benar-benar mengubah kerja agent (U) cukup besar untuk membenarkan mesin usulan | Minggu 2 concierge: semua pesan diberi tag D/U/K secara manual | Bila U <10% pesan [ASUMSI] → sederhanakan menjadi komentar + edit Owner; bila D hampir nol → Jalur D tidak perlu |
| A2 | Spec terstruktur mengalahkan transkrip bersama | Minggu 2a: 10 tugas × 3 run × 2 kondisi, dinilai rubrik buta | B ≥ A + 20 poin, atau P5 gugur |
| A3 | Hold memangkas biaya salah-arah | Minggu 2 concierge: jumlah langkah yang dieksekusi setelah sinyal koreksi pertama | Porsi yang terselamatkan ≥30% [ASUMSI] |
| A4 | Waktu tunggu R2 bisa diterima | Minggu 2–3: median tunggu + wawancara "apakah tunggu ini masalah?" | Median ≤60 menit [ASUMSI] dan mayoritas menilai bisa diterima |
| A5 | Tim mau membayar dengan struktur biaya di atas | Minggu 4: deposit/LOI | ≥3 tim; 0 → kill |
| A6 | Penanda drift deterministik menangkap cukup banyak keputusan yang hilang | Replay offline log concierge: hitung keputusan di Jalur D yang seharusnya mengubah Spec, lalu porsi yang tertangkap aturan (a)–(c) | Recall ≥50% [ASUMSI]; di bawahnya, uji detektor LLM opsional |
| A7 | Mode solo bernilai tanpa kolaborator | Pengguna solo di pilot | ≥2 run/minggu selama 3 minggu [ASUMSI] |
| A8 | Klien agency mau masuk sebagai tamu sesi (menggantikan uji moat verifikasi yang gugur) | Wawancara 5 klien agency + metrik tamu aktif di MVP `17` §7 | ≥1 tamu klien aktif per agency; bila tidak, peluang #1 di `17` §6 gugur |

---

[SUMBER]

Sumber (APA 7, terbaru → terlama):

- Y Combinator. (2026). *Requests for Startups: Multiplayer AI* (A. Epstein). https://www.ycombinator.com/rfs
- GitHub. (2025, October 28). *Introducing Agent HQ: Any agent, any way you work*. https://github.blog/news-insights/company-news/welcome-home-agents/
- Microsoft. (2025, September 24). *Expanding model choice in Microsoft 365 Copilot*. https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/24/expanding-model-choice-in-microsoft-365-copilot/
- Microsoft WorkLab. (2025, June 17). *Breaking down the infinite workday*. https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday
- Laban, P., Hayashi, H., Zhou, Y., & Neville, J. (2025). *LLMs get lost in multi-turn conversation* (arXiv:2505.06120). https://arxiv.org/abs/2505.06120 — jumlah sitasi belum terverifikasi.
- Antara News. (2024, October 17). *Dirjen Aptika pastikan UU PDP sudah berlaku sepenuhnya*. https://www.antaranews.com/berita/4404977/dirjen-aptika-pastikan-uu-pdp-sudah-berlaku-sepenuhnya
- Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T., & Fritz, M. (2023). Not what you've signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection. *Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security*, 79–90. https://doi.org/10.1145/3605764.3623985 — 536 sitasi (OpenAlex, diakses 24 Sep 2026).
- Korpus internal: `05-arsitektur-produk-prd.md`, `06-model-bisnis-dan-unit-ekonomi.md`, `08-risiko-dan-pertanyaan-terbuka.md`, `00-overview-dan-status-proyek.md`.
