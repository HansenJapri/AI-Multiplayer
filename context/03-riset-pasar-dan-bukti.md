---
title: Riset Pasar & Bukti
description: Seluruh angka riset pasar dengan tingkat kepercayaan sumber, daftar sumber terlarang, dan bukti reliabilitas teknis
sources: [AUDIT-KELAYAKAN, AUDIT-PASAR, AUDIT-PROBLEM, VALIDASI-STEP0, PRD-MASTER, REV-BAGIAN1]
last_revised: 2026-09-26
---

> **Posisi terhadap `17` (26 Sep 2026).** File ini adalah **perpustakaan bukti**. Bagian yang tetap berlaku: sumber/angka terlarang, rasio harga-terhadap-upah (dasar keputusan bahwa Indonesia bukan pasar pendapatan), data adopsi dan bukti akademik, celah bukti G1–G8 (terutama G1–G2 untuk asumsi A1). Bagian yang **historis**: ukuran pasar untuk produk orkestrasi lama (untuk AI Multiplayer lihat `15` §5.3), perbandingan harga Oasis vs tier PRD lama yang sudah dibuang (`06` §6), dan perhitungan HITL "tier Pro/Business" yang memakai harga PRD lama. Angka untuk ICP, kompetitor, dan pricing yang berlaku ada di `17`.

# Riset Pasar & Bukti

Sesuai preferensi kerja proyek ini: **semua angka di bawah membawa label tingkat kepercayaan sumber (Tier 1/2/3, [FAKTA]/[Asumsi]/[SPEKULASI])**. Jangan kutip angka apa pun dari file ini tanpa label tersebut.

Struktur file ini: **[ANALISA]** (sumber yang terbukti tidak boleh dipakai, celah bukti eksplisit G1–G8, dan daftar klaim yang tidak dapat diverifikasi), **[HASIL]** (data pasar, harga, survei, dan bukti akademik itu sendiri), **[SUMBER]** (daftar sumber yang disebut di seluruh file).

---

[ANALISA]

## ⛔ Daftar sumber/angka yang TERBUKTI TIDAK BOLEH DIPAKAI (temuan audit, bukan asumsi)

- **CRV (VC Tier-1)** — benchmark churn SMB SaaS (19 Jun 2026) yang rantai atribusinya kembali ke **DigitalApplied**, sumber yang sudah di-blacklist PRD sendiri (§3.4). *"Nama besar di sidebar tidak menjamin rantai atribusi bersih."*
- **"364+ startup AI gagal"** (ideaproof.io) dan listicle sejenis (preuve.ai, digitalsilk, Medium) — content-farm, tanpa denominator. **"Jangan pakai angka apa pun tentang ini."**
- **MIT NANDA "95% pilot AI gagal"** — convenience sample (52 wawancara + 153 respons survei di 4 konferensi), penulis sendiri bilang "directionally accurate... bukan pelaporan resmi perusahaan." **"Jangan pakai angka 95% itu sebagai fakta."**
- **Hukum Wright ~10× penurunan biaya token per 18–24 bulan** — premis PRD sendiri. **"⛔ Tidak ditemukan satu pun sumber kredibel yang menyatakan angka itu dalam bentuk tersebut."**
- **Klaim harga IDR "PPP-adjusted"** — terbukti salah secara aritmatika: kurs implisit (Rp 17.316–17.482/USD di ketiga tier) sama dengan kurs pasar JISDOR (~Rp 17.783–17.991, Agu 2026) — potongan ~2–3%, bukan penyesuaian PPP sungguhan (estimasi kasar auditor: PPP sungguhan akan menempatkan harga IDR di sekitar ⅓ dari harga terpasang).
- **"Nol dari 12 produk kirim verifikasi lintas-vendor"** — 🟡 klaim negatif yang tidak bisa direplikasi auditor sendiri, disebut *"paling rapuh."* Basi dalam hitungan minggu — simpan screenshot/tanggal/URL bila dipakai lagi.

## Celah bukti eksplisit "⛔ TIDAK TAHU" (`AUDIT-PASAR` §Pilar 3, G1–G8)

- **G1**: berapa banyak tim Indonesia jalankan lebih dari satu AI agent berurutan pada pekerjaan nyata — nol sumber.
- **G2**: berapa banyak tim Indonesia berbagi satu agent antar anggota tim — nol sumber.
- **G3**: berapa lama tim Indonesia cek output AI sebelum kirim ke klien — nol sumber (angka global self-report ada tapi METR tunjukkan estimasi self-report meleset ~39pp).
- **G4**: kemauan-bayar tim kecil Indonesia untuk tooling verifikasi/governance AI — nol sumber, di Indonesia MAUPUN global.
- **G5**: insiden nyata terdokumentasi kebocoran konteks lintas-klien/lintas-proyek di Indonesia — nol insiden terdokumentasi di mana pun, Indonesia atau global.
- **G6**: ukuran sampel Indonesia sebenarnya di Microsoft WTI — tidak pernah diungkap sumbernya.
- **G7**: pemisahan data agency/studio/konsultan dari korporat dalam data adopsi-AI Indonesia — tidak ada.
- **G8**: apakah agency Indonesia yang melayani klien asing berperilaku beda dari yang melayani klien lokal — belum diuji, hipotesis segmentasi auditor sendiri.

## Daftar lengkap "tidak dapat diverifikasi / jangan dipakai sebagai fakta" (`AUDIT-KELAYAKAN` §7.6, 11 item + 6 item "perlu verifikasi ulang")

Tingkat kegagalan startup AI vs non-AI (tidak ada studi kredibel sama sekali); LTV:CAC median industri (tak pernah dipublikasi dengan angka, hanya chart); median burn-multiple; churn logo kotor SaaS SMB (lacak ke sumber blacklist); panjang siklus jual AI enterprise (blog-SEO saja, tanpa ukuran sampel); % RFP AI yang mensyaratkan sertifikasi ISO 42001 (tidak ada survei metodologis); berapa banyak SME Indonesia bayar SaaS sama sekali (nol data, resmi atau survei); WTP/ARPU SaaS B2B Indonesia (hanya harga daftar, tanpa data harga-terealisasi/diskon/churn/elastisitas); apakah keunggulan data-proprietary fine-tuning bertahan lintas generasi model (disebut "celah bukti terbesar dalam seluruh pertanyaan moat"); faktor konversi PPP World Bank untuk Indonesia (halaman web maupun API gagal diambil); alasan OpenAI menghentikan platform fine-tuning-nya (interpretasi apa pun yang ditawarkan secara eksplisit berlabel spekulasi).

---

[HASIL]

## Ukuran & pertumbuhan pasar (dipangkas 26 Sep 2026)

Tabel data historis untuk produk orkestrasi lama ("AI Employee": East Ventures Indonesia SaaS market, Mordor Intelligence Multi-Agent Systems, Carta Q1 2026, e-Conomy SEA 2025) dihapus dari file ini karena file ini sendiri sudah menandainya historis, dan angka pasar yang berlaku untuk AI Multiplayer sudah ada di `15` §5.3 (TAM/SAM/SOM 2026–2031). Data Databricks dan Datadog tetap dipertahankan di bagian "Data agent enterprise global" di bawah karena masih dirujuk aktif untuk klaim reliabilitas.

## Rasio harga-terhadap-upah (angka paling berbobot dalam keputusan beachhead)

- Upah rata-rata pekerja formal Indonesia: **Rp 3,33 jt/bln** (BPS Sakernas Agu 2025) atau **Rp 3,29 jt/bln** (BPS Sakernas Feb 2026, rilis lebih baru) — **Tier 1, statistik resmi pemerintah**.
- Sektor informasi & komunikasi (tertinggi): **Rp 5,28 jt/bln** (rilis Agu 2025) / Rp 4,75 jt (sumber sekunder, perlu verifikasi ulang).
- `AUDIT-PASAR`: biaya tool sebagai % upah bulanan pekerja info-komunikasi — **Starter 6,2%, Pro 19,5%, Business 65,9%**. Pembanding: full-stack dev Singapura US$82k/thn → tier Pro = **0,86%** upah bulanan. **Rasio: 19,5% ÷ 0,86% ≈ 22,7× lebih mahal di Indonesia relatif terhadap biaya tenaga kerja lokal.**
- `AUDIT-KELAYAKAN` menghitung ulang dengan rilis upah Feb 2026 (Rp 3,29jt): **Starter 10,0%, Pro 31,3%, Business 105,7%** dari upah rata-rata Indonesia; vs AS (🔴 asumsi $5.200/bln, TIDAK terverifikasi): **0,37% / 1,13% / 3,83%** → **rasio ~27,4–27,6×**.
- **HITL "jam review yang harus dihemat untuk balik modal"**: tier Pro Indonesia perlu **54,1 jam/bln** dihemat (2,46 jam/hari kerja) vs tier Pro AS **1,18 jam/bln** (asumsi $50/jam) → **gap 46×** — disebut *"angka tunggal paling menentukan untuk keputusan beachhead."* Tier Business perlu **182,9 jam/bln** — lebih dari satu FTE penuh (173 jam).
- Gaji AI/ML Engineer (Second Talent Asia Tech Salary Index, Q1 2026, Tier 2): Singapura $115k/thn, Vietnam $62k, **Indonesia $56k**, Filipina $52k. Full-stack: Singapura $82k, Vietnam $42k, **Indonesia $39k**, Filipina $37k.
- ⚠️ Kontradiksi 10× antara upah domestik BPS (~US$330/bln, info-komunikasi) dan tarif Second Talent untuk pekerja remote-luar-negeri (~US$3.250/bln) — dijelaskan sebagai dua pasar tenaga kerja berbeda (agency yang melayani klien domestik vs klien asing) — langsung mengarah ke segmentasi beachhead yang diusulkan audit.

## Harga kompetitor (temuan paling mendesak `AUDIT-KELAYAKAN`, historis)

Sudah tidak masuk konteks aktif — file `04-analisis-kompetitor.md` (Oasis) sudah dihapus 26 September 2026. Lanskap kompetitor yang berlaku ada di `17` §3.

## Data survei penggunaan AI Indonesia/SEA

Sumber: Microsoft Work Trend Index 2026 / Edelman DxI, 18 Feb–20 Apr 2026, sampel inti 20.000 responden/10 pasar — **Indonesia BUKAN pasar inti**, masuk lewat "11 pasar tambahan" yang ukuran sampelnya tak diungkap — **Tier 2 dengan 4 kelemahan metodologis**: sampel non-inti, common-method variance, definisi "Frontier Professional" sirkular, bias vendor (Microsoft jual Copilot/agent).

- "Frontier Professional" Indonesia: **33%** vs rata-rata global **16%** (2×).
- 93% pengguna AI Indonesia perlakukan output AI sebagai titik awal, bukan jawaban final (global 86%).
- 60% menilai quality-control output AI sebagai skill yang makin penting (global 50%); 62% menilai critical thinking makin penting (global 46%); 85% takut tertinggal tanpa adopsi AI cepat (global 65%); 42% lapor kepemimpinan punya arah AI yang jelas; 41% merasa dihargai saat bereksperimen meski hasil tak pasti vs 13% global.
- Perbandingan lintas-SEA (instrumen sama, 6 negara): Vietnam 39% "Frontier Professional" (tertinggi ASEAN), Indonesia 33%, Thailand 32%, Filipina 25%, Malaysia 24%; Singapura ranking #2 global untuk difusi AI (% tak diungkap).
- Ipsos AI Monitor 2025 (via Stanford HAI AI Index 2026): Indonesia >80% optimis AI akan mengubah hidup dalam 3–5 tahun; 76% percaya pemerintah mengatur AI dengan baik (rata-rata global 54%).

## Data agent enterprise global (lintas-dokumen)

- **Databricks** (telemetri 20.000+ org, >60% Fortune 500): orkestrasi Supervisor Agent = 37% penggunaan Agent Bricks; org dengan kerangka governance kirim **12×** lebih banyak proyek AI ke produksi; org dengan tool eval terstruktur kirim **~6×** lebih banyak; hanya **19%** deploy agent "at scale," 81% masih eksperimen/piloting; 77% pelanggan pakai ≥2 keluarga LLM, 59% pakai ≥3.
- **Anthropic 2026 State of AI Agents** (500+ pemimpin teknis, AS, akhir 2025): 57% deploy agent untuk workflow multi-tahap; hanya **16%** lintas-tim; 81% rencana use case lebih kompleks di 2026. ⚠️ **Jangan campur dengan angka VentureBeat 57% di bawah** — keduanya kebetulan sama angkanya tapi mengukur hal berbeda.
- **Futurum Group 1H 2026** (via Belitsoft): rata-rata **12 agent/perusahaan** (proyeksi 20 pada 2027), tapi **50% agent yang di-deploy bekerja sepenuhnya sendirian**; 71% klaim deploy tapi hanya **11%** use case agentic yang direncanakan mencapai produksi.
- **VentureBeat Research** (n=157 dari total pool 573, org ≥100 karyawan, self-selected — caveat sendiri: "sebaiknya dibaca secara direksional"): ~50% deploy agent yang lolos eval internal tapi gagal di depan pelanggan; 66% izinkan deploy produksi tanpa review manusia atau sedang menuju itu dalam 12 bulan; hanya 5%→13% (Jun→Agu 2026) percaya penuh pada eval otomatis; 23% jalankan quality check real-time; 51% hanya monitor kesehatan sistem; 26% pakai inline quality assertion (gelombang Agu); **57% lacak jawaban percaya-diri-salah ke konteks bisnis yang hilang/tak konsisten** (disebut berulang "angka terkuat dalam seluruh korpus" untuk cabang masalah Data & Context); 69% izinkan agent berbagi kredensial, dengan tingkat insiden keamanan **63,5%** vs **40,9%** untuk org dengan identitas per-agent yang scoped (delta 22,6pp — salah satu dari sedikit delta kausal terukur di seluruh korpus).
- **🎯 Temuan Red-Team #1**: gelombang lanjutan VentureBeat Agu 2026 menemukan perusahaan yang **sudah pernah terbakar** oleh kegagalan AI justru bergerak **lebih cepat menuju menghapus manusia dari loop** (85% kejar deploy-tanpa-approval) dibanding perusahaan yang belum terbakar (61%); perusahaan yang terbakar juga **kurang** percaya pada pemeriksaan otomatis (4% vs 24%). Ini **bertentangan langsung** dengan asumsi implisit PRD bahwa rasa sakit → lebih banyak pembelian verifikasi.
- **Cloud Security Alliance** (n=228, survei Jan 2026, dirilis 24 Mar 2026 di RSAC, disponsori vendor — bias ditandai): 68% tak bisa bedakan aktivitas manusia vs AI-agent; 79% bilang agent bikin jalur akses sulit dipantau; 74% bilang agent dapat akses lebih dari perlu; 52% bilang agent mewarisi izin yang dimaksudkan untuk manusia; hanya 22% terapkan kerangka akses "sangat konsisten."
- Survei keluarga CSA lainnya (semua disponsori vendor, ditandai): 84% ragu akan lolos audit kepatuhan perilaku agent (n=285); hanya 28% bisa lacak aksi agent ke manusia/sistem; hanya 21% punya inventaris agent real-time; 53% alami agent yang overreach izin (n=445); 82% punya agent tak dikenal di infrastruktur sementara 68% *merasa* punya visibilitas kuat (n=418); 65% alami insiden terkait agent dalam 12 bulan (61% eksposur data, 43% gangguan operasional, 35% kerugian finansial).
- **Deloitte** (n=3.235, 24 negara): hanya 21% punya governance agentic matang/jejak audit penuh.
- **IBM IBV + Oxford Economics** (n=2.000 eksekutif C-level, 33 negara): keamanan/kepatuhan = hambatan utama scaling agent (59%); adopsi governance tertinggal 77% di belakang kapabilitas; rata-rata 54 insiden AI-agent/org/tahun, 17% severity tinggi.

## Bukti akademik/teknis reliabilitas (semua ✅ Tier 1, peer-reviewed/arXiv)

- **Laban et al.** (MS Research + Salesforce), *"LLMs Get Lost in Multi-Turn Conversation,"* arXiv:2505.06120 → ICLR 2026 Oral, 200.000+ simulasi percakapan, 15 model: performa single→multi-turn **−39%** keseluruhan; aptitude **−16%**; ketidakandalan **+112%**. Disebut *"angka tunggal terpenting di seluruh audit."*
- **Yao et al.** (Sierra AI), τ-bench, arXiv:2406.12045, ICLR 2025: GPT-4o pass^1 retail 61,2% → pass^8 <25% (jika i.i.d. seharusnya 1,97% — mengimplikasikan kegagalan berkorelasi, bukan acak).
- **Cemri et al.**, MAST, arXiv:2503.13657 → NeurIPS 2025 D&B Track, 150 trace, κ=0,88, 14 mode kegagalan/3 kategori: Masalah Desain Sistem 44,2%, Misalignment Antar-Agent 32,3%, Verifikasi Tugas 23,5%. ⚠️ Perbaikan prompt saja hanya +9,4% — dan **hanya `AUDIT-KELAYAKAN` yang menandai** distribusi persentase (44,2/32,3/23,5) berasal dari pembacaan PDF, bukan abstract, dan perlu diverifikasi ulang ke versi final NeurIPS. Yang aman dikutip verbatim: 14/3/150/κ=0,88.
- **Yang et al.** (bias self-preference), arXiv:2604.22891, 20 LLM: kapabilitas model tidak berkorelasi atau berkorelasi negatif dengan imunitas bias self-preference.
- **METR RCT**, arXiv:2507.09089 (10 Jul 2025): developer berpengalaman merasa 20% lebih cepat pakai AI tapi terukur **19% lebih lambat** (gap persepsi ~39pp); waktu-dobel kapabilitas "time horizon" AI = 89 hari sejak 2024; pada ambang reliabilitas 50%, model terbaik berhasil pada tugas ~5 jam separuh waktu.
- **Onweller et al.**, arXiv:2605.06635 (7 Mei 2026): validitas link sitasi agent riset AI >94%, relevansi topik >80%, tapi akurasi faktual hanya **39–77%**; akurasi turun ~42% seiring panggilan tool naik dari 2→150.
- **Datadog State of AI Engineering** (21 Apr 2026, telemetri produksi): error rate-limit = **~33% dari seluruh kegagalan LLM** (8,4 juta insiden hanya di Maret 2026); hanya 28% panggilan LLM pakai prompt caching; 59% permintaan "agentic" sebenarnya panggilan-layanan-tunggal (monolitik).
- **Humlum & Vestergaard** (NBER #33777, data register administratif Denmark, n=25.000 pekerja/7.000 tempat kerja/11 okupasi): "efek nol presisi pada pendapatan dan jam tercatat" (CI mengecualikan efek >2%) meski ~19% pekerja lapor-diri hemat >1jam/hari.
- **Chandrasekaran & Tellis**, Journal of Marketing 2011 (156 kombinasi produk-negara, 1950–2008): 148/156 (~95%) tunjukkan penurunan penjualan "saddle" pasca-takeoff, onset rata-rata pada penetrasi 30% (9 tahun pasca-takeoff, durasi rata-rata 8 tahun) — dipakai untuk berargumen adopsi AI enterprise Indonesia/SEA/AS (30–37% di sebagian segmen) sedang memasuki zona saddle empiris, bukan jendela pra-chasm.

---

[SUMBER]

File ini adalah perpustakaan bukti; sitasi lengkap (APA + tautan) untuk sumber yang tumpang tindih ada di `12` §10, `15` §8, dan `17` §9 (termasuk §0.1/§7.1, sebelumnya `16` §4). Sumber yang disebut khusus di file ini, dengan detail yang tersedia di korpus asli (tanpa menambah tautan yang tidak tercatat):

- Badan Pusat Statistik (BPS). *Sakernas Agustus 2025* dan *Sakernas Februari 2026* — statistik resmi pemerintah Indonesia.
- Databricks. *Telemetri produksi 20.000+ organisasi*.
- Datadog. *State of AI Engineering* (21 Apr 2026) dan telemetri adopsi framework agentic.
- Second Talent. *Asia Tech Salary Index*, Q1 2026.
- Microsoft Work Trend Index 2026 / Edelman DxI (18 Feb–20 Apr 2026).
- Ipsos AI Monitor 2025 (via Stanford HAI AI Index 2026).
- Anthropic. (2026). *State of AI Agents* (500+ pemimpin teknis, AS).
- Futurum Group (1H 2026, via Belitsoft).
- VentureBeat Research (gelombang Jun–Agu 2026).
- Cloud Security Alliance (survei Jan 2026, dirilis RSAC Mar 2026) dan survei keluarga CSA lainnya.
- Deloitte (n=3.235, 24 negara).
- IBM Institute for Business Value + Oxford Economics (n=2.000 eksekutif C-level, 33 negara).
- Laban, P., Hayashi, H., Zhou, Y., & Neville, J. (2025). *LLMs get lost in multi-turn conversation* (arXiv:2505.06120). https://arxiv.org/abs/2505.06120
- Yao, S., et al. τ-bench (arXiv:2406.12045). https://arxiv.org/abs/2406.12045
- Cemri, M., et al. MAST (arXiv:2503.13657). https://arxiv.org/abs/2503.13657
- Yang, et al. (arXiv:2604.22891). https://arxiv.org/abs/2604.22891
- METR. (2025, 10 Juli). *RCT* (arXiv:2507.09089). https://arxiv.org/abs/2507.09089
- Onweller, et al. (2026, 7 Mei). (arXiv:2605.06635). https://arxiv.org/abs/2605.06635
- Humlum, A., & Vestergaard, E. (NBER Working Paper No. 33777). https://www.nber.org/papers/w33777
- Chandrasekaran, D., & Tellis, G. J. (2011). *Journal of Marketing* — di luar jendela 5 tahun, dipakai hanya sebagai kerangka historis, bukan data terkini.
- Dokumen internal: `AUDIT-KELAYAKAN`, `AUDIT-PASAR`, `AUDIT-PROBLEM`, `VALIDASI-STEP0`, `PRD-MASTER`, `REV-BAGIAN1`.
