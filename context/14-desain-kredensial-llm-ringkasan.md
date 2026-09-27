---
title: Desain Kredensial LLM & Rem Biaya — Ringkasan
description: Hasil akhir desain kredensial LLM dan rem biaya. Versi panjang (`13`) sudah dihapus 26 Sep 2026; file ini satu-satunya rujukan
date: 2026-09-25
status: 🟡 PROPOSAL pasca-validasi — tidak masuk MVP `17` §7
last_revised: 2026-09-26
---

# Desain Kredensial LLM & Rem Biaya

**Posisi terhadap `17`.** MVP dua minggu tidak menyimpan key sama sekali: agent berjalan di mesin pengguna memakai langganan/key miliknya sendiri. Desain di bawah baru dibutuhkan saat produk menjalankan atau mendanai panggilan model untuk tim, yaitu peluang #3 di `17` §6 (pendanaan run bersama dengan rem keras memakai key organisasi). Produk tidak menjalankan Critic atau Planner bawaan, jadi semua panggilan model adalah panggilan agent milik pengguna.

Struktur file ini: **[ANALISA]** (alasan pemisahan tiga objek dan bagaimana tiga permintaan awal founder dipenuhi), **[HASIL]** (objek, aturan, lima level rem, dan lima keputusan final), **[SUMBER]** (dasar dokumentasi teknis yang dipakai).

---

[ANALISA]

## Ide inti

Tiga hal dipisah, yang selama ini jadi satu:

- **Siapa pemilik key** — orang atau Workspace yang ditagih provider.
- **Siapa boleh pakai key itu, sampai berapa** — izin belanja yang diberikan pemiliknya.
- **Key mana yang dipakai saat ini** — dipilih otomatis oleh sistem saat run dimulai.

Alasan pemisahan ini: menyatukan ketiganya (seperti model lama) berarti satu key yang bocor atau disalahgunakan langsung membuka seluruh belanja tanpa batas terpisah per project atau per anggota. Dengan tiga objek terpisah, batas belanja bisa diberikan tanpa pernah membuka key aslinya.

Semua panggilan model lewat satu gateway server. Gateway memesan (reserve) biaya terburuk **sebelum** memanggil provider, lalu menyesuaikan setelah respons datang. Ini yang membuat rem benar-benar keras — bukan sekadar "cek saldo dulu", yang bisa ditembus kalau beberapa panggilan jalan bersamaan.

## Bagaimana tiga permintaan awal terpenuhi

**1. Key diatur per project, orang berhak akses bisa atur key dan rem-nya.**
Owner project (atau siapa pun yang dikasih izin `project.funding.manage`) mengatur binding: batas bulanan, model yang boleh dipakai, kelas data maksimum. Kalau project didanai key orang lain, permintaan harus disetujui pemilik key-nya dulu.

**2. Setiap akun bisa pasang key sendiri untuk kerja mandiri.**
Setiap user punya **Personal Space** — ruang kerja yang hanya dia lihat. Saat menempel key di Settings, sistem otomatis membuat izin belanja ke Personal Space-nya sendiri. Tidak perlu project, tidak perlu approval siapa pun.

**3. Project bisa disambungkan ke key owner atau key orang lain yang berhak.**
- Kalau owner project punya key sendiri: satu langkah, konfirmasi, langsung aktif.
- Kalau mau pakai key orang lain (misalnya Owner Workspace): kirim permintaan, pemilik key yang menyetujui dan menentukan batasnya sendiri. Tidak pernah otomatis.

---

[HASIL]

## Tiga objek

| Objek | Isinya |
|---|---|
| **Credential** | Key itu sendiri. Dimiliki satu user atau satu Workspace. Tidak pernah bisa dibaca ulang oleh siapa pun. |
| **FundingBinding** | Izin dari pemilik key: "project X boleh belanja dari key saya, sampai $Y/bulan, untuk model tertentu, untuk data sekelas tertentu." |
| **Penghitung budget** | Rem di lima level (key, izin, project, anggota, run), semua dicek bersamaan sebelum panggilan dikirim. |

## Aturan yang tidak bisa dilanggar

- Tidak ada satu pun tempat — API, log, prompt, layar — yang menampilkan key aslinya. Hanya gateway yang membukanya, di memori, per panggilan.
- Tidak ada yang bisa membuat key orang lain belanja lebih dari batas yang ditentukan pemiliknya sendiri.
- Key menentukan ke akun provider siapa data itu terkirim. Karena itu setiap izin belanja punya batas kelas data (Publik/Internal/Rahasia), dan data yang terlalu sensitif untuk kelas itu tidak akan pernah lewat key itu.
- Kalau sistem pencatat budget tidak bisa diakses, panggilan **ditolak**, bukan dibiarkan lewat.
- Platform tidak menjalankan pemeriksa kualitas (Critic) atau Planner bawaan; tidak ada biaya model yang ditanggung platform. Tidak ada markup token atas key pelanggan (`17` §5).

## Lima level rem

| Level | Siapa yang atur | Fungsi |
|---|---|---|
| Batas di akun provider | Pemilik key, langsung di OpenAI/Anthropic | Pengaman terakhir |
| Credential | Pemilik key | Total belanja key ini di semua tempat |
| Binding (izin) | Pemilik key | Batas untuk satu project tertentu |
| Project | Pengelola project | Total belanja project dari semua key yang dipakai |
| Run | Pembuat run | Batas satu pekerjaan |

Saat mencapai 50% dan 80%, pihak terkait dapat notifikasi. Saat 100%, panggilan baru berhenti dan pekerjaan yang sedang jalan di-jeda (bukan dipotong paksa di tengah).

## Yang terjadi di situasi umum

- **Owner keluar dari Workspace** → semua izin belanja dari key-nya langsung nonaktif, project yang bergantung padanya berhenti dengan pemberitahuan jelas, bukan gagal diam-diam.
- **Pemilik key mencabut izin di tengah pekerjaan klien** → boleh, itu uangnya. Pekerjaan yang sedang berjalan selesai dulu, lalu berhenti.
- **Dua pekerjaan berebut sisa budget terakhir** → satu jalan, satu ditunda. Tidak ada yang menembus batas berdua-dua.
- **Project hanya bergantung pada key satu orang** → sistem kasih peringatan dari awal soal risiko ini.

## Lima keputusan (diselaraskan ke `17`, 26 Sep 2026)

1. **Arti "project"** — **diputuskan:** project di bawah satu Workspace tim. Varian solopreneur (satu akun = satu workspace) dibatalkan karena solopreneur bukan ICP (`17` §1).
2. **Perlu key milik Workspace?** — **diputuskan: ya** saat desain ini dibangun (pasca-MVP), karena ICP 1 adalah agency yang memakai key organisasi. Pooling langganan pribadi tidak dibangun (risiko ketentuan provider).
3. **Boleh anggota biasa menawarkan key pribadinya untuk mendanai project?** — rekomendasi: default dimatikan dulu, karena membawa data project ke akun provider orang itu.
4. **Batas biaya pakai USD atau Rupiah?** — rekomendasi: USD, karena itu mata uang tagihan provider.
5. ~~Critic di Personal Space~~ — **gugur**: Critic dihapus. Personal Space tetap ada sebagai mode solo gratis (pintu masuk, bukan ICP).

---

[SUMBER]

*Versi lengkap (`13`) sudah dihapus. Sumber utama yang dipakai versi itu: dokumentasi resmi OpenAI (spend limits, API key safety, Services Agreement 2026), Anthropic (rate limits, Commercial Terms 2025), LiteLLM (budgets), OpenRouter (BYOK), dan OWASP Secrets Management Cheat Sheet, semuanya diakses 25 September 2026.*
