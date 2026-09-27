---
title: ICP, Masalah, Kompetitor, Social Listening, Pricing, Positioning, dan MVP — AI Multiplayer (lintas fungsi)
date: 2026-09-25
status: SSOT. Memperluas fokus coding ke seluruh fungsi yang disebut di IDE (engineering, sales, support, legal, analis, marketing). Menggabungkan `16` (digabung 26 Sep 2026 sebagai §0.1 dan §7.1; `16` tidak lagi berdiri sendiri).
last_revised: 2026-09-26
---

# AI Multiplayer — ICP, Masalah, Kompetitor, Pricing, Positioning, MVP

**Ide yang dianalisa:** agent AI yang secara default multiplayer. Siapa pun di tim bisa masuk ke sesi agent yang sedang berjalan untuk mengamati, mengarahkan, dan menyerahkannya (Y Combinator, 2026) ✅.

**Batas produk (dari founder):** aplikasi tidak menilai atau mengoreksi hasil kerja AI. "Mengarahkan" adalah tindakan manusia. Produk hanya menyediakan tempat dan instrumennya.

**Label:** ✅ terverifikasi ke sumber primer pada 25 Sep 2026 (sebagian besar lewat Claude Browser) · 🟡 kuat secara logika/preseden, belum ada data · 🔴 spekulasi · ⛔ tidak diketahui · [ASUMSI] angka desain yang harus dikalibrasi. Semua skor 1–5 adalah penilaian saya 🟡; totalnya dihitung dengan skrip. Nilai uang dalam USD.

**Tafsir cakupan:** karena IDE menyebut banyak fungsi, setiap fungsi diuji sebagai kandidat ICP. Pasar yang dituju global, sesuai keputusan founder (lihat §7.1).

Struktur file ini: **[ANALISA]** (temuan yang mengoreksi analisa sebelumnya, termasuk audit taksonomi & CRDT yang digabung dari `16` di §0.1, audit diri kritis, asumsi paling berisiko, dan validasi akhir masalah lewat sumber publik di §8.1), **[HASIL]** (ICP terpilih, sepuluh masalah utama, lanskap persaingan, social listening, model harga, positioning, rencana MVP dua minggu, dan fakta/rekomendasi Singapura yang digabung dari `16` di §7.1), **[SUMBER]** (daftar pustaka APA 7).

---

[ANALISA]

## 0. Temuan yang mengubah kesimpulan dibanding `16`

1. **Setiap fungsi yang disebut IDE sudah punya pemain vertikal dengan fitur kolaborasi AI:**
   - Legal: Harvey Shared Spaces.
   - Data/analis: Hex.
   - Support: Intercom Fin.
   - Sales: Salesforce Agentforce di Slack.
   - Coding: Zed Delta, AQ, Slack Code.
   - Horizontal: PromptQL, Dust, qm dari YC.
2. **Kolaborasi AI lintas organisasi sudah terbukti di legal.** Harvey (4 Desember 2025) memungkinkan firma hukum dan klien, termasuk klien yang bukan pelanggan Harvey, bekerja di Space bersama. Izinnya per objek (view, comment, run, edit), bisa mensyaratkan persetujuan admin, dan tercatat di audit trail (Harvey, 2025) ✅. Ini preseden positif bahwa model "firma ↔ klien" dibayar, sekaligus berarti klaim celah lintas-organisasi di `15`/`16` tidak berlaku untuk legal.
3. **Kategori "AI-native Slack" baru saja ramai.** PromptQL memosisikan diri sebagai "Multiplayer AI that replaces Slack" dan menempati peringkat #2 harian di Product Hunt (411 poin) sekitar Juli 2026 (Product Hunt, 2026b) ✅. Pembuatnya menyebut Jack Dorsey mengumumkan produk serupa, "Buzz", sehari sebelumnya 🟡 (klaim pihak ketiga, belum saya verifikasi).

**Konsekuensi:** peluang untuk founder solo bukan "multiplayer untuk fungsi X", tetapi **lapisan kontinuitas dan kendali yang netral terhadap tool agent**, di segmen yang belum dikuasai pemain vertikal.

## 0.1 Audit rinci taksonomi multiplayer & klaim CRDT (digabung dari `16`, 26 Sep 2026)

*Bagian ini dan §7.1 adalah isi `16-strategi-global-icp-kompetitor-pricing-mvp.md`, yang sebelumnya berdiri sebagai file addendum terpisah. Digabung ke sini karena isinya sudah murni lampiran (reasoning trail) untuk kesimpulan yang levelnya sudah final di atas — bukan dokumen sejajar. `16` tidak lagi ada sebagai file berdiri sendiri di korpus.*

### Di mana analisa saya sebelumnya salah

Di analisa pasar independen sebelumnya (`15` §3.1 G1), taksonomi ditulis terlalu luas: chat grup, streaming eksekusi, kanvas bersama, dan konteks bersama disamakan sebagai satu hal. Taksonomi founder benar dalam arah besarnya: sebagian besar yang dikirim incumbent adalah **multi-user single-player**, bukan state eksekusi bersama.

### Audit per kategori (diverifikasi lewat Claude Browser)

| Kategori founder | Verdict | Bukti |
|---|---|---|
| 1. Group prompting (ChatGPT group chats, Copilot Groups, Claude Tag) | **Benar** | ChatGPT group chats adalah percakapan sampai 20 orang tanpa memori pribadi (OpenAI, 2025a) ✅. Tidak ada objek kerja yang bisa dimanipulasi bersama. |
| 2. Streaming eksekusi ke chat (Slack Code) | **Sebagian keliru** | Slack Code bukan sekadar feed pesan. Halamannya menyebut tab terpisah untuk percakapan, rencana, code diff, dan live preview; "siapa pun di channel" bisa pause, redirect, atau stop agent; ada sign-off sebelum produksi (Salesforce, 2026) ✅. Salesforce sendiri mengakui bahwa memaksa kerja agent multi-turn ke thread standar "menciptakan noise" (Salesforce, 2026) ✅. Yang **tidak** terlihat di halaman publik: rewind ke checkpoint, fork, atau menyunting state agent ⛔. Jadi kritik founder tepat untuk rewind/fork, tetapi keliru untuk pause dan untuk klaim "hanya log pesan". |
| 3. Kanvas bersama (Claude Artifacts multiplayer) | **Benar** | Artifacts multiplayer terbatas pada artifact satu file di Team/Enterprise (AlphaSignal, 2026) ✅. Microsoft sendiri menilai kolaborasi Copilot Pages "Moderate", Notebooks "Low", dan integrasi AI di Loop hanya "Medium" (Microsoft Support, 2026) ✅. Artinya incumbent mengakui kanvas real-time dan AI belum menyatu. |
| 4. Konteks bersama (Dust) | **Benar** | Dust menghubungkan agent ke 70+ sumber data; ini konteks bersama, bukan instans eksekusi bersama (Dust, 2026) ✅. |
| **Kategori yang terlewat: 5. Workspace eksekusi bersama** | **Ini ancaman terbesar dan tidak ada di taksonomi founder** | **Zed Delta** (private beta 12 Agustus 2026, public beta 16 September 2026): DeltaDB mereplikasi percakapan dan worktree secara real-time untuk semua peserta thread. Rekan bisa berkomentar pada baris diff, langkah rencana, atau blok thinking, lalu melanjutkan kerja dengan agent yang sama saat pemiliknya log off. Delta juga menyinkronkan sesi Claude Code dari terminal (Sobo, 2026a, 2026b) ✅. **AQ.dev**: workspace live bersama untuk semua agent CLI, guest link, 50 USD per pengguna per bulan (harga early access, daftar 200 USD) (AQ, 2026) ✅. **Replit**: proyek bersama dengan papan tugas bersama, tetapi setiap orang menjalankan thread Agent sendiri di salinan terisolasi (Replit, 2026) ✅. **qm** dari YC Software: harness agent multiplayer open-source (MIT) dengan 13,7 ribu bintang GitHub; di Hacker News mendapat 682 poin dan 163 komentar (YC Software, 2026; Hacker News, 2026a) ✅. |

### Audit atas dua "sebab utama" founder

**Klaim CRDT: salah secara faktual, dan arah teknisnya perlu dikoreksi.**
- Figma menulis bahwa sistemnya **tidak** memakai CRDT sejati. Server Figma adalah otoritas pusat; struktur datanya hanya "terinspirasi" beberapa CRDT (Wallace, 2019) ✅. Sumber ini berumur lebih dari 5 tahun, tetapi dipakai karena merupakan sumber primer satu-satunya untuk klaim ini.
- CRDT menyelesaikan edit bersamaan pada **data**. Run agent bukan data. Run agent adalah **proses** dengan panggilan LLM yang tidak deterministik dan efek samping ke dunia luar. Dokumentasi LangGraph menyatakan replay dan fork mengeksekusi ulang panggilan LLM dan API, yang bisa menghasilkan hasil berbeda (LangChain, 2026) ✅. Checkpoint Claude Code tidak melacak perubahan file lewat perintah Bash (Anthropic, 2026a) ✅. Artinya rewind memutar balik state agent, bukan dunia: email yang sudah terkirim atau migrasi database yang sudah jalan tidak ikut kembali.
- Arsitektur yang lebih tepat 🟡: log event yang otoritatif di server (seperti Figma), checkpoint per langkah, fork sebagai cabang (bukan menimpa riwayat), satu "pengemudi" pada satu waktu (control lease), dan **ledger efek samping** yang menandai langkah mana yang tidak bisa dibatalkan. CRDT cukup untuk objek yang memang diedit bersama, seperti Spec dan catatan.

**Klaim kontrol halus (pause, rewind, sunting, fork): benar sebagai kebutuhan, tetapi primitifnya sudah ada untuk satu pengguna.** Claude Code sudah punya `/rewind` (pulihkan kode dan/atau percakapan), `/branch`, dan `--fork-session` (Anthropic, 2026a) ✅. LangGraph punya replay, fork, dan `update_state` (LangChain, 2026) ✅. Yang belum ada adalah **lapisan multi-pengguna berizin di atas primitif itu**. Ini celah yang lebih sempit dan lebih jujur daripada "multiplayer AI belum ada".

**Kelemahan terbesar argumen founder:** dari semua permintaan fitur publik yang ditemukan (§4), pengguna meminta melihat, menyarankan, menulis, melanjutkan sesi rekan, dan mengumpulkan kuota bersama. **Tidak satu pun meminta rewind atau fork bersama secara eksplisit** ⛔. Primitif yang menjadi inti tesis founder justru punya bukti permintaan paling lemah (§2, masalah #10 di peringkat terakhir).

### Global-first lewat Singapura — verdict

**Arahnya benar, tapi alasannya lemah dan urutannya terbalik.**

- **Benar:** Indonesia tidak layak jadi pasar pendapatan untuk kategori ini. Break-even tier Pro di Indonesia butuh 54,1 jam dihemat per bulan vs 1,18 jam di AS [korpus `03` §3], dan nilai masalah per karyawan di Indonesia diperkirakan hanya sekitar 10,6 USD per bulan [`15` §5.4, 🔴].
- **Alasan lemah:** "ini tren makro" tidak membuktikan bahwa founder bisa menjangkau pelanggan global (non sequitur). Tren makro menjelaskan ukuran permintaan, bukan akses distribusi. Pertanyaan yang menentukan: segmen global mana yang bisa dijangkau tanpa tim sales, dan kenapa mereka memilih produk ini daripada Zed Delta atau AQ.
- **Urutan terbalik:** menunggu dana investor sebelum masuk pasar global membuat kasusnya melingkar. Investor global butuh bukti traksi, dan traksi global bisa dicari sekarang dengan biaya hampir nol karena calon pengguna ada di GitHub dan Hacker News (lihat §4). Entitas hukum hanya dibutuhkan saat ada pihak yang mau mentransfer uang.

## 8. Laporan audit diri

**Confidence klaim besar:**
- ✅ Keberadaan dan fitur kompetitor; harga yang dikutip; keluhan di G2, Product Hunt, GitHub, dan HN.
- 🟡 Skor ICP dan masalah (penilaian saya); keunggulan jaringan SEA untuk founder.
- 🔴 Estimasi dua minggu; harga 30 dan 199 USD.
- ⛔ Porsi agency yang memakai agent coding; permintaan fork/rewind bersama; WTP tamu klien.

**Lima asumsi paling berisiko:**
1. Lebih dari satu orang benar-benar menyentuh satu sesi agent dengan frekuensi berarti ⛔.
2. Klien agency mau masuk sebagai tamu ⛔.
3. Delta/AQ tidak menambahkan batas klien dalam 6–12 bulan 🔴.
4. Pesan rekan lewat `additionalContext` cukup responsif untuk dianggap "mengarahkan" 🟡.
5. Agency bersedia membayar di luar Cursor/Claude yang sudah dibayar ⛔.

**Yang tidak bisa dijawab di sini:** diskusi Reddit, Quora, dan YouTube (terblokir atau tidak termuat); harga Harvey dan Delta; data adopsi fitur multiplayer incumbent.

**Langkah validasi (diperbarui 26 Sep 2026 — keputusan founder: tanpa wawancara):**
1. ~~Wawancarai 10 agency~~ — tidak dijalankan atas keputusan founder. Digantikan validasi desk §8.1.
2. ~~Tanya 5 klien agency~~ — tidak dijalankan atas keputusan founder. Asumsi A2 (klien mau jadi tamu) tetap ⛔ sampai terukur di MVP.
3. Jalankan MVP dengan 3–5 design partner.
4. Minta deposit.

## 8.1 Validasi akhir masalah lewat sumber publik (26 Sep 2026, Claude Browser)

Tujuan: memastikan masalah benar-benar terjadi, mengukur urgensinya, dan mengecek apakah MVP §7 menyelesaikannya dengan cara yang belum tersedia. Semua angka diambil langsung dari GitHub API, dokumentasi resmi, dan HN Algolia API pada 26 September 2026.

### Bukti primer, diperbarui

| Sumber | Status 26 Sep 2026 | 👍 | Komentar | Catatan |
|---|---|---|---|---|
| `claude-code` #60082 — kolaborasi real-time multi-user pada satu sesi | Open | 19 | 11 | Bukti terkuat. Use case yang disebut: pair programming, mentoring, live review, handoff asinkron (GitHub, 2026c) ✅ |
| `claude-code` #11455 — session handoff / continuity | Open | 25 | 36 | Sebagian besar soal kontinuitas **satu pengguna** antar hari, bukan antar orang (GitHub, 2025) ✅ |
| `claude-code` #40981 — share sesi ke anggota tim | Ditutup otomatis sebagai duplikat (3 Apr 2026) | 2 | 3 | Dirujuk ke #10368, yang ditutup "not planned" (GitHub, 2026d) ✅ |
| `claude-code` #92517 — pool kuota + share konteks sesi | Open | 1 | 5 | (GitHub, 2026b) ✅ |
| `openai/codex` #46016 — sesi Codex kolaboratif real-time | Open | 0 | 0 | (GitHub, 2026a) ✅ |
| **Pembanding:** `claude-code` #16157 — batas pemakaian habis cepat | Open | 695 | 1.497 | (GitHub, 2026e) ✅ |
| **Pembanding:** `claude-code` #38335 — kuota Max habis tidak wajar | Open | 476 | 873 | (GitHub, 2026f) ✅ |
| **Pembanding:** `claude-code` #18435 — ganti akun kerja/pribadi | Open | 833 | 196 | Motifnya pemisahan akun, **bukan** pooling (GitHub, 2026g) ✅ |

Data survei: dari 49.009 responden Stack Overflow Developer Survey 2025, hanya 17% pengguna agent setuju agent memperbaiki kolaborasi tim — dampak dengan nilai terendah "dengan selisih lebar", sementara sekitar 70% setuju agent menghemat waktu tugas pribadi (Stack Overflow, 2025) ✅. Ini mengonfirmasi agent masih dipakai single-player, tetapi tidak membuktikan bahwa kolaborasi adalah prioritas yang ingin dibayar.

### Apa yang sudah dikirim incumbent (dicek ke dokumentasi resmi)

- **Anthropic, share sesi cloud:** visibilitas "Team" membuat sesi terlihat oleh anggota organisasi, tetapi penerima hanya melihat state terakhir dan tampilannya tidak update real-time (Anthropic, 2026d) ✅. Belum ada steer multi-user.
- **Anthropic, Remote Control dan Projects:** Remote Control untuk melanjutkan sesi sendiri dari perangkat lain (Anthropic, 2026g) ✅; Projects milik satu pengguna dan tidak bisa dibagikan (Anthropic, 2026e) ✅.
- **Anthropic, cross-session messaging:** permintaan #24798 (komunikasi antar sesi) ditutup "completed" 17 Agustus 2026 (GitHub, 2026h) ✅, tetapi hanya untuk sesi milik akun yang sama.
- **Anthropic, Claude Tag (public beta):** siapa pun di channel Slack bisa memberi tugas ke Claude, prosesnya terlihat oleh channel, dan pemakaian ditagih ke **saldo organisasi dengan spend limit**, bukan per kursi (Anthropic, 2026f) ✅. Ini menutup sebagian besar masalah #1 (kuota bersama) dan sebagian #3 (proses terlihat) untuk tim Team/Enterprise yang bekerja di Slack.
- **OpenAI, ChatGPT Work/Codex:** pemakaian menarik dari **pool kredit workspace bersama** (OpenAI, 2026b) ✅.
- **Zed Delta:** saldo percobaan dibagi antara Zed dan Delta; paket Business 30 USD per kursi per bulan dengan BYOK (Zed Industries, 2026) ✅. Delta praktis dibundel ke Zed.

### Pemain kecil yang sudah menjual solusi yang sama (temuan baru)

- **MobSession:** tim men-steer satu sesi Claude Code secara live lewat link; agent jalan di mesin host dengan langganan host; prompt dari tamu antre untuk persetujuan host; atribusi, presence, biaya per giliran, sesi khusus anggota organisasi. Harga: **Free** (teammate tak terbatas), **Team 250 USD per bulan flat** tanpa per-seat, Enterprise custom (MobSession, 2026) ✅.
- **Claudebin:** share dan **resume** sesi Claude Code lewat satu link, open source; 30 poin HN (Hacker News, 2026d) ✅.
- **Skillsync (YC W26):** memindahkan sesi (pesan, reasoning, tool call) antar coding agent; 68 poin HN (Hacker News, 2026c) ✅. Ini peluang #2 di §6 (kontinuitas lintas harness).
- **Type.com:** sesi bersama di cloud di mana tim bisa co-prompt, memakai langganan Claude/Codex yang sudah ada (Hacker News, 2026e) ✅.
- Lainnya yang disebut di thread #60082 atau Show HN: repowire, shell.online, CoAligne, claude-session-sync, ccgs, Qwack, Egregore, Murmell, Kungfu, SOS. Hampir semua 1–8 poin HN.

### Verdict per masalah

| # (§2) | Masalah | Terjadi? | Urgensi | Sudah diselesaikan pihak lain? | Verdict |
|---|---|---|---|---|---|
| 1 | Kuota per akun tidak bisa dikumpulkan | ✅ Ya; rasa sakit kuota **sangat tinggi** (695 dan 476 👍) | Tinggi untuk kuota individu; **rendah** untuk pooling antar-orang (1 👍 di #92517) | Level organisasi: Claude Tag (saldo org), ChatGPT Work (kredit bersama). Pooling langganan pribadi berisiko ketentuan provider | Nyata, tetapi **bukan masalah yang diselesaikan MVP** (pooling dikeluarkan dari §7) |
| 2 | Tidak bisa melanjutkan/ambil alih sesi rekan | ✅ Ya | **Rendah–sedang** (19–25 👍, sekitar 28–37× lebih kecil dari isu kuota #16157) | Anthropic belum (share = snapshot). Pihak kecil: MobSession, Claudebin, Skillsync, dll. | Nyata; **bukan celah kosong** |
| 3 | Penalaran hilang, yang sampai hanya kesimpulan | ✅ Ya (17% vs ~70% di survei SO) | **Rendah–sedang**; ada workaround murah (file bersama, jurnal markdown — disebut di #60082 dan thread Skillsync) | Claudebin, Skillsync, Claude Tag (proses terlihat di channel) | Nyata; urgensi tidak terbukti tinggi |
| 4 | Izin dan kebocoran saat berbagi sesi | ✅ Ya, sebagai **syarat** (scope view/suggest/write; approval sebelum prompt tamu masuk) | Sedang — syarat pembelian, bukan pemicu | MobSession: approval gate + sesi khusus anggota org | Nyata; sudah jadi fitur standar pesaing |
| — | Klien agency mau jadi tamu sesi (A2, pembeda ICP 1) | ⛔ **Tidak ditemukan satu pun bukti publik** (GitHub, HN) | ⛔ | Belum ada pesaing yang fokus di batas klien | Satu-satunya celah kosong, tetapi juga satu-satunya yang **nol bukti** |

**Satu keberatan pembeli baru (✅, #60082):** pengguna komersial menyatakan kebutuhan ini "harus dilayani Claude, bukan perusahaan lain", karena vendor ketiga berarti kontrak dan proses pemrosesan data baru (GitHub, 2026c). Ini risiko adopsi untuk semua pihak ketiga, termasuk produk ini.

### 5 Whys — kenapa urgensinya tidak tinggi walau masalahnya nyata

1. Kenapa sinyal permintaan kecil (19–25 👍) padahal banyak yang mengeluh? Karena sebagian besar pengguna masih memakai agent sendirian; hanya 17% merasakan dampak kolaborasi (Stack Overflow, 2025).
2. Kenapa masih sendirian? Karena satuan kerja agent masih tugas pribadi (hemat waktu tugas sendiri ~70%), bukan pekerjaan bersama.
3. Kenapa kebutuhan yang muncul tidak memaksa beli? Karena ada workaround murah yang "cukup": file bersama, jurnal markdown, screen share, tmux, dan sekarang share link bawaan Anthropic.
4. Kenapa workaround cukup? Karena kerugiannya (konteks direkonstruksi ulang) terasa sebagai gesekan, bukan kegagalan yang mahal — tidak ada bukti publik kerugian uang atau klien akibat masalah ini ⛔.
5. **Akar:** kerja bersama pada satu sesi agent belum menjadi alur kerja standar tim; masalah muncul di tepi (pairing, mentoring, handoff), bukan di jalur utama pekerjaan. Rasa sakit yang benar-benar tinggi ada di **kuota dan biaya**, bukan di berbagi sesi.

### Implikasi ke MVP §7 (fakta, bukan rekomendasi baru)

- Fitur #1 **Amati** dan #2 **Arahkan** sudah dijual MobSession, gratis untuk teammate tak terbatas.
- Fitur #3 **Serahkan** (resume dari link) sudah ada di Claudebin (open source) dan, lintas harness, di Skillsync.
- Fitur #4 **Tamu klien** belum dikerjakan pesaing yang ditemukan, tetapi juga nol bukti permintaan publik.
- Harga §5: Team sekitar 30 USD per pengemudi lebih mahal dari MobSession (250 USD flat) untuk tim di atas 8 pengemudi; paket Free §5 (1 pengemudi) lebih lemah dari Free MobSession (teammate tak terbatas).
- Kesimpulan desk validation: **masalah terbukti ada; urgensi tinggi tidak terbukti; MVP §7 dalam bentuk sekarang menyelesaikan masalah yang sudah punya solusi gratis.** Satu-satunya ruang pembeda yang tersisa adalah batas klien (ICP 1), dan ruang itu hanya bisa diuji lewat MVP + deposit (§7 metrik "≥1 klien tamu aktif per agency").

**Keterbatasan:** 👍 GitHub dan poin HN mengukur minoritas developer yang vokal; komentar peluncuran di HN banyak berbentuk pujian pendek sehingga lemah sebagai bukti; Reddit tidak diakses; tidak ada data adopsi atau pendapatan pesaing kecil (MobSession, Claudebin, Skillsync) ⛔.

---

[HASIL]

## 1. Tiga ICP, diurutkan dari peluang sukses tertinggi

Bobot penilaian: bukti rasa sakit 20%, anggaran/WTP 20%, intensitas kompetisi (5 = rendah) 20%, keterjangkauan oleh founder 15%, siklus jual pendek 10%, kecocokan dengan tesis multiplayer 15%.

| Peringkat | Segmen | Bukti | WTP | Kompetisi | Jangkauan | Siklus | Fit | Skor |
|---|---|---|---|---|---|---|---|---|
| **1** | Software agency / product studio yang melayani klien luar negeri | 4 | 4 | 2 | 5 | 4 | 5 | **3,90 (78%)** |
| **2** | Tim produk AI-native (engineer + PM + desainer) yang memakai beberapa agent coding | 5 | 4 | 1 | 4 | 4 | 4 | **3,60 (72%)** |
| **3** | Konsultan dan agency non-legal, non-coding (riset, strategi, marketing) | 2 | 3 | 3 | 4 | 4 | 5 | **3,35 (67%)** |
| Dikeluarkan | Legal | 4 | 5 | 1 | 1 | 1 | 5 | 3,00 (60%) |
| Dikeluarkan | Data/analis | 3 | 4 | 1 | 3 | 3 | 4 | 2,95 (59%) |
| Dikeluarkan | Support | 4 | 4 | 1 | 2 | 2 | 3 | 2,75 (55%) |
| Dikeluarkan | Sales | 3 | 4 | 1 | 2 | 2 | 4 | 2,70 (54%) |

**Alasan pengecualian:**
- **Legal:** sudah dikuasai Harvey, dengan siklus jual enterprise yang tidak realistis untuk founder solo.
- **Data/analis:** Hex sudah menyediakan multiplayer plus agent, 36–75 USD per editor (Hex, 2026) ✅.
- **Support:** Fin dan Agentforce sudah menguasai alur agent-ke-manusia (Intercom, 2026; G2, 2026b) ✅.
- **Sales:** terkunci ke ekosistem CRM. Reviewer G2 mengeluhkan Agentforce lemah di luar Salesforce (G2, 2026a) ✅.

### ICP 1 — Software agency / product studio lintas-klien

- **Demografi:** 10–100 orang; berbasis di SEA, Eropa Timur, atau Amerika Latin; klien di AS, Inggris, Australia, dan Singapura. Clutch mendaftar 55.133 perusahaan pengembangan software (Clutch, 2026) ✅; porsi yang sudah memakai agent coding ⛔.
- **Jabatan:** Founder/CEO, CTO, Head of Delivery, Engineering Manager (pembeli); Tech Lead dan Account Manager (pengguna utama); PM klien (tamu).
- **Tujuan:** mengirim fitur lebih cepat per engineer; menunjukkan ke klien bagaimana kerja berbantuan agent dilakukan; memindahkan pekerjaan antar engineer tanpa kehilangan konteks.
- **Frustrasi:** sesi agent terkunci di laptop satu orang; handoff lewat ringkasan manual; klien tidak bisa melihat proses tanpa diberi akses ke repositori atau terminal.
- **Pemicu beli:** engineer kunci cuti atau resign di tengah sprint; klien meminta transparansi pemakaian AI; kuota satu akun habis menjelang tenggat.
- **Keberatan:** kekhawatiran kerahasiaan antar klien; "kami sudah bayar Cursor/Claude"; "AQ dan Delta sudah ada".
- **Anggaran:** belanja alat AI per developer yang terlihat di pasar sekitar 60–165 USD per bulan (Cursor Teams 40 USD ditambah Claude Team 20 sampai 125 USD) (Anysphere, 2026; Anthropic, 2026b) ✅. Median belanja SaaS per karyawan 9.455 USD per tahun (Zylo, 2026) ✅. Ruang tambahan diperkirakan 20–50 USD per pengemudi per bulan [ASUMSI], dengan jangkar AQ 50 USD (AQ, 2026) ✅.
- **Tempat online:** GitHub issues repositori agent, Hacker News, Product Hunt, dan G2/Clutch ✅ (kanal ini teramati aktif untuk topik ini); LinkedIn dan X 🟡.
- **Mengapa peringkat 1:** kecocokan tertinggi dengan tesis (≥3 orang dan melintasi batas organisasi). Harvey membuktikan model firma ↔ klien bisa dijual di legal ✅. Founder berbasis Indonesia punya akses ke jaringan delivery SEA 🟡.

### ICP 2 — Tim produk AI-native (10–200 orang)

- **Demografi:** startup Seri A–C, remote-first.
- **Jabatan:** VP Engineering, Staff/Principal Engineer, Head of Product; pembeli CTO.
- **Tujuan:** throughput tim dengan Claude Code, Codex, dan Cursor sekaligus; kontinuitas saat orang berganti tugas.
- **Frustrasi:** permintaan publik untuk berbagi sesi, melanjutkan sesi rekan, share link baca-tulis, dan kuota bersama (§4).
- **Pemicu beli:** insiden produksi yang butuh beberapa orang pada satu sesi; kuota habis di tengah tugas.
- **Keberatan:** "Anthropic/OpenAI akan menambahkan fitur ini sendiri"; keamanan repositori.
- **Anggaran:** tertinggi di antara ketiga ICP ✅.
- **Tempat online:** GitHub `anthropics/claude-code` dan `openai/codex`, Hacker News ✅.
- **Mengapa peringkat 2:** bukti rasa sakit terkuat, tetapi kompetisi terpadat (Delta, AQ, Slack Code gratis, Replit, Cursor, qm open-source).

### ICP 3 — Konsultan dan agency non-legal, non-coding

- **Demografi:** 10–150 orang yang melayani banyak klien paralel.
- **Jabatan:** Managing Partner, COO, Head of Strategy/Research, Account Director.
- **Tujuan:** run agent riset dan analisis berjam-jam yang bisa dilanjutkan rekan dan diperlihatkan ke klien.
- **Frustrasi:** alat yang ada hanya chat grup atau kanvas satu file; penalaran hilang, yang sampai ke tim hanya kesimpulan (§4).
- **Pemicu beli:** pitch atau proyek riset bertenggat dengan beberapa kontributor; klien meminta jejak proses.
- **Keberatan:** "Notion/Dust sudah cukup"; margin tipis; literasi teknis untuk memasang agent.
- **Anggaran:** lebih rendah; jangkar Notion Business 20 USD dan Dust Pro 24–30 EUR per seat (Notion, 2026; Dust, 2026) ✅.
- **Tempat online:** LinkedIn dan komunitas agency 🟡.
- **Mengapa peringkat 3:** belum ada "Harvey untuk konsultan non-legal" yang teramati ⛔, tetapi bukti rasa sakitnya paling lemah.

## 2. Sepuluh masalah utama, diurutkan

Bobot: urgensi 30%, frekuensi 25%, dampak emosional 15%, kesediaan membayar 30%. Kolom "bahasa pelanggan" adalah **parafrase** dari sumber di §4, bukan kutipan.

| # | Masalah | U | F | E | W | Skor | Mengapa penting (bukti) | Bahasa pelanggan (parafrase) |
|---|---|---|---|---|---|---|---|---|
| 1 | Kuota/biaya per akun tidak bisa dikumpulkan | 4 | 4 | 4 | 4 | 4,00 | Tim tiga orang dengan tiga langganan bekerja setara satu orang karena konteks tidak berpindah antar akun (GitHub, 2026b) ✅. Pooling langganan pribadi berisiko melanggar ketentuan provider; yang aman adalah key API milik organisasi. | "Kuota saya habis, kuota rekan menganggur, dan dia tidak bisa melanjutkan sesi saya." |
| 2 | Tidak bisa melanjutkan atau mengambil alih sesi rekan | 4 | 4 | 3 | 4 | 3,85 | Diminta berulang di Claude Code dan Codex; satu issue ditandai pelapornya "blocking work" (GitHub, 2026a, 2026c, 2026d) ✅. | "Dia sudah log off; sesinya ada di laptopnya; saya mulai dari nol." |
| 3 | Penalaran hilang; yang sampai ke tim hanya kesimpulan | 4 | 5 | 3 | 3 | 3,80 | Komentator di forum PromptQL: pemikiran nyata tiap orang ada di chat AI pribadinya, yang masuk Slack hanya kesimpulan yang sudah dirapikan (Product Hunt, 2026a) ✅. Workaround resmi di GitHub adalah ringkasan handoff manual yang kehilangan informasi (GitHub, 2026d) ✅. | "Saya bisa kasih jawabannya, tapi tidak bisa kasih jalan pikirannya." |
| 4 | Izin dan kebocoran data saat berbagi sesi | 4 | 3 | 4 | 4 | 3,75 | Kekhawatiran bahwa agent bisa melakukan apa saja yang bisa dilakukan karyawan (Hacker News, 2026a) ✅; Harvey menjual izin per objek sebagai fitur utama (Harvey, 2025) ✅. | "Kalau klien A ikut menonton, apa dia bisa lihat data klien B?" |
| 5 | Keputusan agent sulit diaudit dan di-debug di tempat tim berdiskusi | 3 | 4 | 3 | 4 | 3,55 | Chat bagus untuk manusia tapi buruk sebagai jejak audit apa yang dilakukan agent (Product Hunt, 2026a) ✅; reviewer G2 menyebut sulit melacak kenapa agent memilih jalur tindakan tertentu (G2, 2026a) ✅. | "Agent-nya mengambil keputusan, tapi alasannya terkubur di terminal yang tidak dibaca siapa pun." |
| 6 | Biaya tidak terprediksi | 4 | 3 | 4 | 3 | 3,45 | Reviewer Agentforce mengeluhkan penagihan berbasis konsumsi yang sulit diprediksi (G2, 2026a) ✅; kekhawatiran token terbakar (Hacker News, 2026a) ✅; biaya yang terus naik adalah alasan utama proyek agentic dibatalkan (Gartner, 2025) ✅. | "Tagihannya tidak bisa saya tebak bulan ini." |
| 7 | Konflik tulis antar sesi atau agent paralel | 4 | 3 | 4 | 3 | 3,45 | Kehilangan data diam-diam saat berbagi file antar sesi (GitHub, 2026c) ✅. | "Dua agent menulis file yang sama; tidak ada yang tahu mana yang menang." |
| 8 | Handoff agent → manusia membawa riwayat panjang yang tidak tersaring | 3 | 4 | 3 | 3 | 3,25 | Agen support harus membaca banyak riwayat chat sebelum paham masalah setelah Fin menyerahkan (G2, 2026b) ✅. | "Saat diserahkan ke saya, saya harus membaca seluruh obrolan dulu." |
| 9 | Manusia menjadi lapisan copy-paste antar agent | 3 | 5 | 3 | 2 | 3,20 | Keluhan utama di diskusi Radio (Hacker News, 2026b) ✅; pembuat PromptQL menyebut waktu paling banyak hilang untuk menyalin konteks (Product Hunt, 2026a) ✅. | "Kerja saya cuma memindahkan pesan dari satu agent ke agent lain." |
| 10 | Tidak ada fork/rewind bersama dari titik tertentu | 3 | 2 | 2 | 3 | 2,60 | Primitifnya ada untuk satu pengguna (Anthropic, 2026a; LangChain, 2026) ✅, tetapi tidak ditemukan permintaan eksplisit untuk versi bersama ⛔. | (hipotesis, belum terdengar dari pengguna) |

**Pola:** empat masalah teratas soal **kontinuitas dan kepemilikan konteks**, bukan soal presisi kontrol. Masalah #3 dan #5 adalah bukti baru untuk arah "sesi yang bisa dibaca dan diaudit bersama".

## 3. Lanskap persaingan

| Level / vertikal | Pemain | Harga | Positioning | Kelebihan | Kekurangan / keluhan | Peluang yang dilewatkan |
|---|---|---|---|---|---|---|
| Workspace eksekusi bersama (coding) | **Zed Delta** | ⛔ belum dipublikasi | Pengganti pull request; percakapan dan worktree direplikasi real-time | Rekan bisa melanjutkan kerja dengan agent yang sama; web tanpa instal; sinkron dari Claude Code; public beta 16 Sep 2026 (Sobo, 2026a, 2026b) ✅ | Berpusat pada developer dan review kode | Run non-coding; tamu klien non-teknis; pendanaan bersama ⛔ |
| | **AQ.dev** | Gratis solo; Team 50 USD per pengguna (early access, daftar 200 USD) | Harness coding multiplayer di cloud milik pelanggan | Semua agent CLI, guest link, tanpa markup untuk langganan pelanggan (AQ, 2026) ✅ | Harga daftar tinggi; berbasis mesin dev | Non-coding |
| | **Replit** | Bervariasi | Proyek bersama + papan tugas | Paralel, ramah non-engineer (Replit, 2026) ✅ | Tiap orang menjalankan thread agent sendiri; bukan satu sesi bersama | Handoff satu run |
| | **Slack Code** | Gratis di semua paket Slack; akses agent partner dibayar terpisah | Coding agentic multiplayer di Slack | Tab plan/diff/preview; siapa pun bisa pause/redirect/stop; sign-off (Salesforce, 2026) ✅ | Terikat Slack; rewind/fork tidak terlihat ⛔ | Di luar Slack; lintas-harness |
| Horizontal | **PromptQL** | Gratis (Product Hunt) | "Multiplayer AI that replaces Slack" | Thread bersama, tag rekan, wiki otomatis, izin multi-pengguna (Product Hunt, 2026b) ✅ | Pertanyaan komunitas: mengganti Slack atau hanya menambah tool? (Product Hunt, 2026a) ✅ | Kerja agent jangka panjang di luar chat |
| | **qm** (YC Software) | Gratis, MIT | Harness agent multiplayer untuk kerja | 13,7 ribu bintang GitHub (YC Software, 2026) ✅ | Dinilai berlebihan rekayasa; harus self-host (Hacker News, 2026a) ✅ | Versi terkelola |
| | **Dust** | Pro 24/30 EUR; Max 120/150 EUR | "Multiplayer AI for human-agent collaboration" | 20+ model, konektor (Dust, 2026) ✅ | Konteks bersama, bukan eksekusi bersama | — |
| | Claude, ChatGPT, Microsoft Copilot | Claude Team 20/25 USD; ChatGPT Business 20/25 USD | Chat grup, proyek bersama, kanvas | Distribusi raksasa (Anthropic, 2026b; OpenAI, 2026a) ✅ | Microsoft sendiri menilai kolaborasi Copilot Pages "Moderate" (Microsoft Support, 2026) ✅ | State eksekusi bersama |
| Legal | **Harvey** | ⛔ tidak dipublikasi | Shared Spaces firma ↔ klien | Tamu non-pelanggan; izin view/comment/run/edit; audit trail (Harvey, 2025) ✅ | Hanya legal/professional services besar | Model yang sama untuk vertikal lain |
| Data | **Hex** | Professional 36 USD, Team 75 USD per editor; pengguna tak terbatas | Notebook + agent untuk tim data | Kolaborasi dan agent dalam satu produk (Hex, 2026) ✅ | Khusus data | — |
| Support | **Intercom Fin** | 0,99 USD per outcome + seat helpdesk | Agent support dengan handoff ke manusia | Harga berbasis hasil (Intercom, 2026) ✅; G2 4,5/5 dari 3.916 ulasan (G2, 2026c) ✅ | Riwayat panjang saat diserahkan; lite seat hanya read-only (G2, 2026b) ✅ | Ringkasan handoff yang bisa dipakai tim |
| Sales/CRM | **Salesforce Agentforce** | Berbasis konsumsi | Agent di CRM dan Slack | Data CRM; G2 4,3/5 dari 1.697 ulasan (G2, 2026c) ✅ | Setup berat; bergantung kualitas data; biaya sulit diprediksi; sulit di-debug; lemah di luar Salesforce (G2, 2026a) ✅ | Netral terhadap ekosistem |
| Sesi bersama khusus Claude Code (ditambahkan 26 Sep, §8.1) | **MobSession** | Free (teammate tak terbatas); Team 250 USD/bulan flat; Enterprise custom | "Drive Claude Code together" | Steer live lewat link, approval prompt tamu oleh host, atribusi, biaya per giliran, sesi khusus anggota org; jalan di mesin host dengan langganan host (MobSession, 2026) ✅ | ⛔ data adopsi tidak ada | Batas klien/tamu eksternal tidak jadi fokus |
| | **Claudebin** | Gratis, open source | Share + resume sesi lewat link | Link sesi berisi pesan, file, bash, MCP call; bisa di-resume lokal (Hacker News, 2026d) ✅ | Satu arah, bukan live | — |
| | **Skillsync** (YC W26) | ⛔ | Sesi portabel lintas coding agent | Pindahkan pesan, reasoning, tool call antar agent (Hacker News, 2026c) ✅ | Fokus satu pengguna | Menempati peluang #2 §6 |
| | **Type.com** | ⛔ | Sesi cloud bersama, co-prompt, untuk non-teknis | Pakai langganan Claude/Codex yang ada (Hacker News, 2026e) ✅ | Onboarding membingungkan (komentar HN) | — |
| Fitur bawaan incumbent (dicek 26 Sep) | **Anthropic**: share sesi cloud (Team visibility), Remote Control, cross-session messaging, **Claude Tag** | Termasuk paket; Claude Tag ditagih ke saldo org | — | Share ke anggota org; Claude Tag: siapa pun di channel beri tugas, proses terlihat, saldo org + spend limit (Anthropic, 2026d, 2026f) ✅ | Share = snapshot, tidak real-time, tanpa steer; Remote Control/Projects satu pengguna (Anthropic, 2026e, 2026g) ✅ | Steer multi-user di luar Slack; lintas akun |
| Tidak langsung | Ringkasan handoff manual, screen share/tmux, claude-session-sync, agent-sessions, LangGraph time-travel, repowire, shell.online, CoAligne, ccgs | Gratis/OSS | — | Gratis, sudah dipakai | Manual, kehilangan informasi, satu pengguna | Menjadikannya multi-pengguna dan berizin |

**Kesimpulan kompetisi.** Distribusi dikuasai incumbent (Slack, Microsoft, Anthropic, OpenAI), dan vertikal bernilai tinggi sudah punya pemain khusus. Celah yang masih terbuka menurut sumber publik ada tiga, dan ketiganya ⛔ belum terbukti diminta pasar:
1. Kontinuitas sesi **lintas harness** (Claude Code ↔ Codex ↔ Cursor) dengan atribusi siapa yang mengemudi.
2. **Pendanaan run bersama** dengan batas keras memakai key organisasi.
3. **Model Harvey (firma ↔ klien) untuk vertikal non-legal**, dimulai dari software agency.

**Status celah per 26 Sep 2026 (§8.1):** celah #1 sebagian sudah ditempati Skillsync (YC W26); celah #2 sudah ditutup di level organisasi oleh Claude Tag (saldo org + spend limit) dan ChatGPT Work (kredit workspace bersama); celah #3 masih kosong, tetapi tanpa bukti permintaan publik ⛔. Steer live satu sesi Claude Code (Amati + Arahkan) sudah dijual MobSession dengan paket gratis.

## 4. Ringkasan diskusi publik (social listening)

**Cakupan per platform (diuji lewat Claude Browser):**

| Platform | Status | Catatan |
|---|---|---|
| Reddit | ⛔ Diblokir | Pembatasan keamanan browser pane; filter domain di pencarian web juga ditolak proxy |
| Quora | ⛔ Tidak bisa dibaca | Halaman mensyaratkan login; saya tidak membuat akun atau masuk atas nama Anda |
| Komentar YouTube | ⛔ Tidak termuat | Video ditemukan (misalnya tutorial ChatGPT group chat), tetapi komentar tidak ter-render di browser pane |
| Product Hunt | ✅ | Halaman dan forum PromptQL; hasil pencarian "multiplayer agents" |
| Situs ulasan (G2) | ✅ | Ulasan Salesforce Agentforce dan Intercom Fin |
| Pengganti | ✅ | GitHub issues (Claude Code, Codex), Hacker News, OpenAI Developer Community |

**Keluhan yang sering muncul.**
- Konteks sesi terkunci per akun; share link hanya read-only (GitHub, 2026c) ✅.
- Pembeli ChatGPT Team kecewa karena mengharapkan kolaborasi dan merasa pemasarannya menyesatkan (OpenAI Developer Community, 2025) ✅. Shared projects kemudian dirilis 25 September 2025 (OpenAI, 2025b).
- Agentforce: setup berat, butuh admin ahli, output bergantung pada kualitas data, biaya konsumsi sulit diprediksi, sulit menelusuri alasan agent (G2, 2026a) ✅.
- Fin: riwayat panjang saat diserahkan ke manusia; kursi "lite" hanya bisa membaca sehingga dianggap tidak berguna; fitur terkunci di paket lebih mahal (G2, 2026b) ✅.
- Skeptisisme pada produk baru: berlebihan rekayasa, tidak jelas masalahnya, takut token terbakar (Hacker News, 2026a) ✅; ragu apakah "Slack versi AI" benar-benar mengganti Slack atau hanya menambah satu tool lagi (Product Hunt, 2026a) ✅.

**Kebutuhan yang belum terpenuhi.**
- Menyerahkan **jalan pikiran**, bukan hanya jawaban (Product Hunt, 2026a) ✅.
- Keputusan agent yang bisa ditinjau di tempat yang sama dengan diskusi tim (Product Hunt, 2026a) ✅.
- Izin per sesi (lihat, sarankan, tulis) dan peran viewer, contributor, approver, operator (GitHub, 2026a, 2026c) ✅.
- Live handoff saat kuota habis, dengan atribusi akun yang mengemudi (GitHub, 2026b) ✅.

**Permintaan fitur.** Share link baca-tulis dengan masa berlaku (model Figma/Notion); presence; komentar tertambat; transfer kepemilikan sesi; kanal pesan antar sesi dengan gerbang persetujuan; memori tingkat proyek (GitHub, 2026a, 2026b, 2026c) ✅; video demo dan tabel perbandingan (Hacker News, 2026a) ✅.

**Bahasa emosional (parafrase).** Kecewa dan merasa dikelabui pemasaran; memberi label "critical/blocking" pada permintaan fitur; jenuh menjadi perantara copy-paste; sinis terhadap "satu tool lagi"; frustrasi saat pelanggan kembali marah karena jawaban agent salah; cemas terhadap tagihan yang tidak bisa diprediksi.

**Keterbatasan:** sampel condong ke developer dan pembeli enterprise, dan tidak ada data dari Reddit, Quora, atau YouTube. Untuk ICP 3, bukti ini lemah.

## 5. Model penetapan harga

**Pola yang teramati di pasar ✅:**
- **Bayar per pengemudi/editor, penonton gratis.** Figma: dua pertiga pengguna bukan desainer (Jaipuria, 2025). Hex: pengguna tak terbatas, bayar per editor (Hex, 2026). AQ: kursi baru ditagih saat orangnya bergabung (AQ, 2026).
- **Konsumsi murni memicu keluhan prediktabilitas** (G2, 2026a).
- **Harga berbasis hasil berhasil saat hasilnya mudah dihitung,** seperti tiket support yang selesai (Intercom, 2026).

| Model | Cocok? | Alasan pelanggan membayar | Alasan pelanggan tidak membayar |
|---|---|---|---|
| Subscription per seat untuk semua orang | Tidak | Mudah dianggarkan | Menghukum penonton dan tamu klien; mematikan loop undangan; keluhan "lite seat read-only tidak berguna" (G2, 2026b) |
| Sekali bayar | Tidak | Tanpa biaya berulang | Ada biaya hosting, sinkronisasi, dan retensi sesi yang berjalan; tidak menutup COGS. Pengecualian yang mungkin: lisensi self-host tahunan untuk agency dengan data sensitif 🔴 |
| Freemium | Ya, sebagai pintu masuk | Pengguna solo membangun kebiasaan sebelum mengundang orang kedua | Solo sudah punya `/rewind` dan resume gratis di Claude Code (Anthropic, 2026a) |
| Usage-based | Ya, sebagai komponen tambahan saja | Biaya mengikuti nilai (run bersama, retensi) | Kecemasan tagihan (G2, 2026a) |
| Outcome-based | Belum | Paling selaras dengan nilai | "Hasil" pada run multiplayer sulit didefinisikan dan diaudit ⛔ |

**Rekomendasi (hipotesis) [ASUMSI]:**
- **Free:** 1 pengemudi, penonton dan komentator tak terbatas, retensi 7 hari.
- **Team, sekitar 30 USD per pengemudi per bulan:** pengemudi = orang yang boleh mengarahkan, menjeda, atau mengambil alih. Penonton, komentator, dan tamu klien gratis. Retensi 90 hari.
- **Agency, sekitar 199 USD per workspace per bulan:** portal tamu klien, izin per objek, laporan aktivitas per klien. Jangkarnya gerbang ≥199 USD di korpus [korpus `06` §8] dan preseden Harvey.
- **Token:** memakai langganan/key milik pelanggan, tanpa markup (sama seperti AQ).
- **Validasi:** deposit yang bisa dikembalikan. Belanja SaaS lewat reimbursement tumbuh 267% YoY (Zylo, 2026) ✅, jadi pembelian dengan kartu tanpa procurement adalah jalur yang realistis.

## 6. Peluang yang belum terlayani dan positioning

**Peluang (dari yang paling bisa dipertahankan):**
1. **Harvey-style shared spaces untuk software agency.** Sesi agent yang bisa dilihat, dikomentari, dan diserahkan antara agency dan klien, dengan izin per objek dan tanpa kebocoran antar klien. Preseden di legal ✅; di coding, AQ baru punya guest link untuk review, bukan batas antar klien ⛔.
2. **Kontinuitas lintas harness.** Lanjutkan run rekan di tool agent apa pun, dengan penalaran yang ikut terbawa, bukan hanya diff (masalah #2 dan #3).
3. **Pendanaan run bersama dengan rem keras** memakai key organisasi (desain `14`).

**Positioning:** lapisan kontinuitas dan kendali untuk sesi agent yang dibagikan dalam tim dan dengan klien, netral terhadap tool agent.
- **Kalimat pembeda:** *"Every agent session your team runs — watchable, steerable, and handed off with its reasoning, even to your clients."*
- **Terhadap Slack Code/PromptQL:** mereka tempat mengobrol; produk ini tempat sesi agent hidup dan berpindah tangan.
- **Terhadap Delta/AQ:** mereka membangun lingkungan dev; produk ini tidak menggantikan IDE atau mesin, dan menambahkan batas klien.
- **Terhadap Harvey:** model yang sama untuk agency software, dengan harga yang terjangkau tim kecil.

**Risiko:** Delta atau AQ bisa menambahkan batas klien dalam satu kuartal 🟡. Pertahanannya bukan fitur, melainkan **data kepercayaan klien yang terkumpul** (riwayat sesi per klien) dan distribusi lewat jaringan agency 🔴.

## 7. MVP terkecil dalam dua minggu

**Hipotesis yang diuji:** tim agency ≥3 orang yang memakai Claude Code setiap hari akan (a) menonton, mengarahkan, dan mengambil alih sesi rekan, (b) mengundang klien sebagai tamu, dan (c) membayar.

**Mengapa Claude Code dulu:** hook `http` pada `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, dan `Stop`. `PreToolUse` bisa menolak tool call dengan alasan, dan hook bisa menambahkan `additionalContext` ke Claude (Anthropic, 2026c) ✅. Checkpoint, `/rewind`, dan `--fork-session` sudah ada (Anthropic, 2026a) ✅. Produk tidak perlu menjalankan agent atau menyimpan key.

**Lima fitur (sesuai tiga kata kerja IDE):**
1. **Amati:** installer CLI memasang hook dan mengirim event ke timeline web bersama (langkah, tool call, diff, biaya per langkah), dengan presence dan komentar tertambat.
2. **Arahkan:** pesan dari rekan diantrekan di server dan disampaikan ke agent pada tool call berikutnya lewat `additionalContext`. Hold menolak tool call berikutnya lewat `PreToolUse` dengan pesan "dijeda oleh [nama]". Produk hanya meneruskan pesan manusia; produk tidak menilai isinya.
3. **Serahkan:** snapshot git per checkpoint dan transkrip disimpan di server. Rekan menjalankan satu perintah untuk melanjutkan dari langkah terakhir (atau langkah N) di mesinnya sendiri. Run asli tidak pernah ditimpa.
4. **Tamu klien:** link undangan per run dengan peran lihat + komentar saja, tanpa akses ke run lain.
5. **Halaman harga + deposit.**

**Tidak masuk:** harness lain; pooling kuota; Slack/Teams; CRDT; fork dari langkah lama sebagai fitur utama (hanya efek samping fitur #3); run non-coding; izin berlapis selain pemilik/pengemudi/tamu.

**Stack:** Next.js di Vercel + Supabase (Postgres, Auth, Realtime), keduanya sudah terhubung di akun Anda. Estimasi dua minggu ini 🔴, dan hanya realistis jika fitur #3 dibatasi pada repo git bersih.

| Hari | Pekerjaan |
|---|---|
| 1–2 | Skema event, auth, endpoint hook, installer CLI |
| 3–4 | Timeline web + Realtime + komentar |
| 5–6 | Antrean pesan → `additionalContext`; Hold → `PreToolUse` |
| 7–9 | Snapshot git + perintah lanjutkan; uji transkrip subagent (jebakan yang dilaporkan di GitHub, 2026b) |
| 10 | Tamu klien + halaman harga + deposit |
| 11–12 | Onboarding 3–5 agency design partner |
| 13–14 | Perbaikan dari pemakaian nyata + wawancara perilaku |

**Metrik keputusan setelah dua minggu pemakaian [ASUMSI]:**
- ≥60% tim punya ≥2 manusia pada run yang sama setiap minggu.
- ≥30% run yang diserahkan dilanjutkan oleh orang lain.
- ≥1 klien tamu aktif per agency.
- ≥3 deposit atau LOI.
- **Kill atau pivot** jika <10% run disentuh orang selain pemiliknya.

## 7.1 Fakta hukum & rekomendasi urutan Singapura (digabung dari `16`)

**Fakta yang relevan.**
- YC kembali berinvestasi di perusahaan berbadan hukum AS, Kanada, Cayman, dan **Singapura** (Y Combinator, 2026b) ✅. Singapura tidak menutup pintu YC.
- Struktur umum: Singapore Pte Ltd sebagai induk, PT Indonesia sebagai anak operasional. ACRA mensyaratkan minimal satu direktur yang berdomisili di Singapura (nominee director untuk WNI). Pajak korporasi 17%. Pendirian standar 1–3 hari kerja. Pajak dividen dari Singapura ke pemegang saham Indonesia dibatasi 10% atau 15% sesuai P3B (Karman, 2026) 🟡. Sumbernya penyedia jasa korporat, bukan regulator, jadi verifikasi ke konsultan pajak. Ini bukan nasihat hukum atau pajak.

**Rekomendasi urutan.**
1. **Sekarang, tanpa entitas baru:** validasi dengan 5 tim global lewat GitHub/HN dan jaringan agency SEA yang melayani klien asing (§7, `07`). Deposit bisa diterima lewat perusahaan yang sudah ada atau ditunda sampai LOI.
2. **Saat ada ≥3 deposit/LOI atau term sheet:** dirikan Singapore Pte Ltd, atau Delaware bila investor utama di AS. Biaya pendirian kecil dan cepat, jadi tidak perlu dibangun lebih awal.
3. **Zona waktu:** Jakarta (UTC+7) hanya 1 jam dari Singapura, 3–4 jam dari Australia timur, 6–7 jam dari Inggris, dan 14–15 jam dari AS Barat. Untuk produk kolaborasi live dengan dukungan pelanggan oleh founder solo, beachhead SEA, Australia, dan Inggris lebih mudah dilayani daripada AS Barat 🟡.

---

[SUMBER]

## 9. Daftar pustaka (APA 7, terbaru → terlama)

- Anthropic. (2026d). *Use Claude Code in the cloud* (bagian "Share sessions"). Claude Code Docs. Diakses 26 September 2026, dari https://code.claude.com/docs/en/claude-code-on-the-web
- Anthropic. (2026e). *Let Claude coordinate ongoing work with Projects*. Claude Code Docs. Diakses 26 September 2026, dari https://code.claude.com/docs/en/claude-projects
- Anthropic. (2026f). *Work with Claude Tag* [Public beta]. Claude.ai Documentation. Diakses 26 September 2026, dari https://claude.com/docs/claude-tag/overview
- Anthropic. (2026g). *Continue local sessions from any device with Remote Control*. Claude Code Docs. Diakses 26 September 2026, dari https://code.claude.com/docs/en/remote-control
- GitHub. (2026e, 3 Januari). *[BUG] Instantly hitting usage limits with Max subscription* (Issue #16157). anthropics/claude-code. Diakses 26 September 2026 (695 👍, 1.497 komentar), dari https://github.com/anthropics/claude-code/issues/16157
- GitHub. (2026f, 24 Maret). *[BUG] Claude Max plan session limits exhausted abnormally fast since March 23, 2026 (CLI usage)* (Issue #38335). anthropics/claude-code. Diakses 26 September 2026 (476 👍, 873 komentar), dari https://github.com/anthropics/claude-code/issues/38335
- GitHub. (2026g, 15 Januari). *[FEATURE] Add the ability to manage multiple Claude accounts within the Claude Desktop app* (Issue #18435). anthropics/claude-code. Diakses 26 September 2026 (833 👍, 196 komentar), dari https://github.com/anthropics/claude-code/issues/18435
- GitHub. (2026h). *Inter-session communication for multi-Claude workflows* (Issue #24798; ditutup "completed" 17 Agustus 2026). anthropics/claude-code. https://github.com/anthropics/claude-code/issues/24798
- Hacker News. (2026c, 17 September). *Launch HN: Skillsync (YC W26) – AI chat sessions made portable across agents*. https://news.ycombinator.com/item?id=49743049
- Hacker News. (2026e, 9 September). *Show HN: Type.com: Multiplayer Codex/Claude in the cloud for non-tech use cases*. https://news.ycombinator.com/item?id=49626148
- MobSession. (2026). *MobSession: Drive Claude Code together* dan *Pricing*. Diakses 26 September 2026, dari https://mobsession.ai/ dan https://mobsession.ai/pricing
- OpenAI. (2026b). *ChatGPT Work: Usage and cost*. OpenAI Learn. Diakses 26 September 2026, dari https://learn.chatgpt.com/docs/enterprise/chatgpt-work-usage-and-cost
- Zed Industries. (2026). *Pricing*. Diakses 26 September 2026, dari https://zed.dev/pricing
- Sobo, N. (2026a, 16 September). *Replace PRs with Delta – now in public beta*. Zed Industries. https://zed.dev/blog/delta-public-beta
- Anthropic. (2026a). *Checkpointing*. Claude Code Docs. Diakses 25 September 2026, dari https://code.claude.com/docs/en/checkpointing
- Anthropic. (2026b). *Pricing*. Diakses 25 September 2026, dari https://www.claude.com/pricing
- Anthropic. (2026c). *Hooks reference*. Claude Code Docs. Diakses 25 September 2026, dari https://code.claude.com/docs/en/hooks
- Anysphere. (2026). *Cursor pricing*. Diakses 25 September 2026, dari https://cursor.com/pricing
- AQ. (2026). *Pricing*. Diakses 25 September 2026, dari https://aq.dev/pricing/
- Clutch. (2026). *Top software development companies — Sep 2026 rankings*. Diakses 25 September 2026, dari https://clutch.co/developers
- Dust. (2026). *Pricing*. Diakses 25 September 2026, dari https://dust.tt/home/pricing
- G2. (2026a). *Salesforce Agentforce reviews*. Diakses 25 September 2026, dari https://www.g2.com/products/salesforce-agentforce/reviews
- G2. (2026b). *Fin reviews*. Diakses 25 September 2026, dari https://www.g2.com/products/fin/reviews
- G2. (2026c). *G2 search: AI agents*. Diakses 25 September 2026, dari https://www.g2.com/search?query=dust%20ai%20agents
- Hex. (2026). *Pricing*. Diakses 25 September 2026, dari https://hex.tech/pricing/
- Intercom. (2026). *Pricing*. Diakses 25 September 2026, dari https://www.intercom.com/pricing
- LangChain. (2026). *Use time-travel*. Diakses 25 September 2026, dari https://docs.langchain.com/oss/python/langgraph/use-time-travel
- Notion. (2026). *Pricing*. Diakses 25 September 2026, dari https://www.notion.com/pricing
- OpenAI. (2026a). *What is ChatGPT Business?* Diakses 25 September 2026, dari https://help.openai.com/en/articles/8792828-what-is-chatgpt-team
- Product Hunt. (2026a). *Do we need an AI-native Slack?* [Forum PromptQL]. https://www.producthunt.com/p/promptql/do-we-need-an-ai-native-slack
- Product Hunt. (2026b). *PromptQL: Multiplayer AI that replaces Slack*. https://www.producthunt.com/products/promptql
- Replit. (2026). *Invite teammates*. Diakses 25 September 2026, dari https://docs.replit.com/build/invite-teammates
- Y Combinator. (2026). *Requests for startups: Multiplayer AI* (A. Epstein). Diakses 25 September 2026, dari https://www.ycombinator.com/rfs
- Y Combinator. (2026b, 5 Februari). *Adding Canada back to our list of accepted countries of incorporation*. https://www.ycombinator.com/blog/adding-canada-back
- Wallace, E. (2019, 16 Oktober). *How Figma's multiplayer technology works*. Figma. https://www.figma.com/blog/how-figmas-multiplayer-technology-works/ (di luar jendela 5 tahun; sumber primer satu-satunya untuk klaim CRDT)
- Karman. (2026, Mei). *Singapore incorporation for Indonesian founders*. https://karman.com.sg/blog/singapore-company-incorporation-indonesian-founders (penyedia jasa korporat, bukan regulator)
- AlphaSignal. (2026, 13 Juli). *Anthropic makes Claude Artifacts multiplayer so teams can build together*. https://alphasignal.ai/news/anthropic-makes-claude-artifacts-multiplayer-so-teams-can-build-together
- OpenAI. (2025a, 13 November). *Introducing group chats in ChatGPT*. https://openai.com/index/group-chats-in-chatgpt/
- GitHub. (2026a). *Feature request: Real-time collaborative Codex sessions* (Issue #46016). openai/codex. https://github.com/openai/codex/issues/46016
- Hacker News. (2026b, 14 September). *Radio – a chatroom for multiplayer agent work*. https://news.ycombinator.com/item?id=49702303
- Salesforce. (2026). *Introducing Slack Code: Agentic coding for teams*. Diakses 25 September 2026, dari https://www.salesforce.com/introducing-slack-code/
- Sobo, N. (2026b, 12 Agustus). *Introducing Delta*. Zed Industries. https://zed.dev/blog/introducing-delta
- Hacker News. (2026a, 31 Juli). *qm – Multiplayer agent harness for work*. https://news.ycombinator.com/item?id=49126604
- YC Software. (2026). *qm* [Repositori GitHub]. https://github.com/yc-software/qm
- GitHub. (2026b). *Feature request: Pool usage across accounts and share session context* (Issue #92517). anthropics/claude-code. https://github.com/anthropics/claude-code/issues/92517
- GitHub. (2026c). *Feature request: Real-time multi-user collaboration on a single Claude Code session* (Issue #60082). anthropics/claude-code. https://github.com/anthropics/claude-code/issues/60082
- GitHub. (2026d, 30 Maret). *[FEATURE] Share Claude Code chat sessions with team members* (Issue #40981). anthropics/claude-code. https://github.com/anthropics/claude-code/issues/40981
- Zylo. (2026, 29 Januari). *Zylo's 2026 SaaS Management Index*. https://zylo.com/news/2026-saas-management-index
- Microsoft Support. (2026, Januari). *Compare Microsoft Loop, Copilot Pages, and Copilot Notebooks*. https://support.microsoft.com/en-us/microsoft-365-copilot/compare-microsoft-loop-copilot-pages-and-copilot-notebooks
- Hacker News. (2026d, 19 Februari). *Show HN: Claudebin – Share and resume Claude Code sessions with a single link*. https://news.ycombinator.com/item?id=47073488
- GitHub. (2025, 12 November). *Feature Request: Session Handoff / Continuity Support* (Issue #11455). anthropics/claude-code. Diakses 26 September 2026 (25 👍, 36 komentar), dari https://github.com/anthropics/claude-code/issues/11455
- Stack Overflow. (2025). *2025 Developer Survey: AI* (n = 49.009, 177 negara, dikumpulkan 29 Mei–23 Juni 2025). https://survey.stackoverflow.co/2025/ai
- Harvey. (2025, 4 Desember). *Strengthen firm and client relationships with shared Spaces*. https://www.harvey.ai/blog/shared-spaces-and-collaboration-in-harvey
- OpenAI. (2025b, 25 September). *More ways to work with your team and tools in ChatGPT*. https://openai.com/index/more-ways-to-work-with-your-team/
- Jaipuria, T. (2025, Juli). *Figma S-1 breakdown*. https://www.tanayj.com/p/figma-s-1-breakdown
- Gartner. (2025, 25 Juni). *Gartner predicts over 40% of agentic AI projects will be canceled by end of 2027*. https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027
- OpenAI Developer Community. (2025, 7 Februari). *Team collaboration workspace in ChatGPT*. https://community.openai.com/t/team-collaboration-workspace-in-chatgpt/1114924
- Korpus internal: `06`, `14`, `15`.
