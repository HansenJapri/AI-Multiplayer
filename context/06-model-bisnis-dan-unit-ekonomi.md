---
title: Model Bisnis & Unit Ekonomi — AI Multiplayer
description: Model harga aktif (selaras `17` §5), unit ekonomi, kendala modal, model lama yang dibuang, skor kelayakan historis, dan gerbang/kill criteria
last_revised: 2026-09-26
---

# Model Bisnis & Unit Ekonomi

Acuan: `17` §5. Semua angka harga adalah hipotesis [ASUMSI] sampai ada deposit.

Struktur file ini: **[ANALISA]** (alasan pemilihan model harga, evaluasi unit ekonomi, dan skor kelayakan historis yang membuat model lama dirombak), **[HASIL]** (harga aktif, kendala modal, ukuran pasar, dan gerbang/kill criteria), **[SUMBER]** (rujukan).

---

[ANALISA]

## Mengapa model ini (bukti di `17` §5)

- **Bayar per editor/pengemudi, penonton gratis** sudah terbukti di Figma, Hex, dan AQ.
- **Konsumsi murni memicu keluhan prediktabilitas** (ulasan G2 Agentforce).
- **Harga per outcome** belum cocok karena "hasil" sesi multiplayer sulit didefinisikan.
- **Sekali bayar tidak cocok** karena ada biaya hosting, sinkronisasi, dan retensi yang berjalan. Pengecualian yang mungkin: lisensi self-host tahunan untuk agency dengan data sensitif 🔴.

## Unit ekonomi

- **COGS utama:** hosting server event, database realtime, penyimpanan transkrip dan snapshot git. Tidak ada biaya token di sisi platform, karena agent berjalan di mesin pengguna memakai langganannya sendiri.
- **Dampak ke vonis lama:** penyebab utama margin kotor negatif dalam `AUDIT-KELAYAKAN` adalah biaya token Critic bawaan platform. Karena Critic dihapus, penyebab itu hilang 🟡. Unit ekonomi baru belum terukur ⛔; biaya penyimpanan per sesi harus diukur di MVP.
- **Risiko yang tersisa:** harga 30 USD bersaing dengan fitur yang dibundel gratis (Slack Code) dan dengan AQ (50 USD per pengguna, early access).

## Model lama yang dibuang (historis)

- Metering per "Agent Run" dengan tier Free/19/59/199 USD, overage, dan program referral.
- Harga tampilan "PPP-adjusted" Indonesia (Rp329.000/1.029.000/3.479.000). Terbukti salah secara aritmatika: kurs implisitnya sama dengan kurs pasar.
- Critic dan Planner memakai kuota token bawaan platform.
- Managed Model add-on dengan markup token.

## Skor kelayakan historis (`AUDIT-KELAYAKAN`, 22 Agustus 2026)

- **Skor 5/10 vs ambang ≥7 → ROMBAK.** Kriteria yang gagal telak: Unit Economics (0/2), karena margin negatif dari token Critic.
- **Estimasi probabilitas auditor** (🔴, kalibrasi auditor, bukan model): ARR ≥10 juta USD dalam 5 tahun sekitar 3%; kegagalan total tanpa revenue dalam 18 bulan pada struktur harga lama sekitar 55%. Estimasi ini dibuat untuk produk lama dan belum dihitung ulang.
- **Nasib lima syarat perbaikan:** lihat tabel di `00`.

---

[HASIL]

## Model harga aktif (hipotesis)

| Paket | Harga | Isi |
|---|---|---|
| Free | 0 | 1 pengemudi; penonton dan komentator tak terbatas; retensi 7 hari |
| Team | sekitar 30 USD per pengemudi per bulan | Pengemudi = orang yang boleh mengarahkan, menjeda, atau mengambil alih. Penonton, komentator, dan tamu klien gratis. Retensi 90 hari |
| Agency | sekitar 199 USD per workspace per bulan | Portal tamu klien, izin per objek, laporan aktivitas per klien |
| Add-on usage | per pemakaian | Retensi lebih panjang, run bersama di atas kuota. Hanya komponen tambahan, bukan model utama |

- **Token:** pelanggan memakai langganan/key sendiri, tanpa markup. Ini menghindari risiko ketentuan provider soal menjual kembali layanan (`14`).
- **Validasi:** deposit yang bisa dikembalikan di halaman harga MVP.

## Kendala modal founder

Founder adalah operator solo bootstrap. Biaya infrastruktur minimum diperkirakan 150–500 USD per bulan bahkan tanpa pengguna berbayar [korpus lama, belum dihitung ulang untuk stack MVP]. Syarat sebelum go-live publik: ≥6 bulan dana infrastruktur tersedia, atau go-live ditunda sampai ada komitmen pembayaran.

## Ukuran pasar

TAM/SAM/SOM dan CAGR ada di `15` §5.3: TAM 7,2 miliar USD (2026) → 18,9 miliar USD (2031), CAGR 21,3%; SOM skenario dasar 2,7 juta USD ARR di tahun ke-5. Semuanya berbasis asumsi yang dinyatakan di sana.

## Gerbang dan kill criteria

| Tahap | Gerbang lolos | Kill / pivot |
|---|---|---|
| ~~Wawancara (sebelum MVP)~~ — tidak dipakai; founder memutuskan tanpa wawancara 26 Sep 2026 (`09`, `17` §8.1) | ~~≥10 dari 12 responden~~ | ~~≤3 dari 12~~ |
| MVP 2 minggu, 3–5 design partner (`17` §7) | ≥60% tim punya ≥2 orang di run yang sama setiap minggu; ≥30% run yang diserahkan dilanjutkan orang lain; ≥1 tamu klien aktif per agency; **≥3 deposit atau LOI** | <10% run disentuh orang selain pemiliknya |
| Sebelum membangun penuh (`12`, `14`) | ≥10 pelanggan berbayar di ≥199 USD per bulan, atau ≥3 kontrak pilot ≥2.000 USD | Cut-loss 6 bulan sejak discovery bila gerbang ini tidak tercapai |

**Batas lain yang tetap berlaku:**
- Burn fase validasi ≤6× biaya infrastruktur bulanan.
- Bukti rasa sakit harus berupa artefak nyata (log, tiket, thread), bukan estimasi waktu self-report.
- Risiko konsentrasi pelanggan wajib diungkap bila satu akun >10% revenue.

---

[SUMBER]

Tidak ada sitasi APA eksternal baru di file ini. Rujukan internal: `17` §5, `15` §5.3, `14`, `00`, `AUDIT-KELAYAKAN` (internal, 22 Agustus 2026).
