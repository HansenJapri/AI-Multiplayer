---
title: Arsitektur Produk — AI Multiplayer
description: Prinsip arsitektur, apa yang dibuang dari PRD lama, invarian keamanan yang dipertahankan, arsitektur MVP (selaras `17` §7), dan arsitektur pasca-validasi
last_revised: 2026-09-26
---

# Arsitektur Produk

Acuan: `17` §6–§7. PRD Master lama (`PRD_AI_EMPLOYEE_MASTER.md`) dan salinan detailnya (`10`) sudah dihapus. Bagian yang masih berlaku dirangkum di bagian HASIL.

Struktur file ini: **[ANALISA]** (apa yang dibuang dari PRD lama dan alasannya), **[HASIL]** (prinsip, invarian keamanan yang dipertahankan, arsitektur MVP, arsitektur pasca-validasi, dan metrik), **[SUMBER]** (rujukan).

---

[ANALISA]

## Yang dibuang dari PRD lama

| Komponen lama | Alasan dibuang |
|---|---|
| Lapisan verifikasi Assertion → Critic → Receipt sebagai "tesis inti" | Bertentangan dengan batas produk (tidak menilai output). Moat lintas-vendor sudah runtuh di level agregator (`15` §2.2) |
| Planner/Critic dengan `IncludedQuota` | Tidak ada model yang dijalankan platform di MVP |
| Metering per Agent Run dan tier Free/19/59/199 | Diganti model harga `06` §1 |
| Agent Builder, hierarki Department/Room/Project sebagai inti UX | Bukan masalah yang divalidasi di `17` §2 |
| Local Runner, Schedule, TeamNote, katalog MCP | Di luar MVP; dievaluasi ulang setelah validasi |
| Receipt sebagai "bukti pemeriksaan" untuk klien | Diganti **catatan sesi** (siapa melihat, mengarahkan, menyerahkan) tanpa klaim pemeriksaan |

---

[HASIL]

## Prinsip

1. **Sesi bersama adalah produk.** Nilai inti: siapa pun di tim bisa mengamati, mengarahkan, dan menyerahkan sesi agent yang sedang berjalan.
2. **Produk tidak menilai output AI.** Tidak ada Critic, Assertion, atau skor kualitas. Arahan datang dari manusia; produk hanya menyampaikannya dan mencatatnya.
3. **Netral terhadap harness.** Mulai dari Claude Code, lalu Codex dan Cursor. Produk tidak menggantikan IDE, mesin dev, atau model.
4. **Tanpa kustodi key di MVP.** Agent berjalan di mesin pengguna dengan langganan/key miliknya sendiri.
5. **Pemeriksaan berjawaban pasti bersifat deterministik.** Izin, batas biaya, dan batas klien ditegakkan kode, bukan LLM.

## Invarian keamanan yang dipertahankan

Invarian ini tetap berlaku untuk MVP dan desain pasca-validasi (`12`, `14`). Kode aturan asli disebut agar rujukan di `12` tetap bisa dilacak.

1. **Isolasi tenant.** Dua workspace tidak bisa mengakses data satu sama lain.
2. **Urutan resolusi izin (§18 PRD lama):** (1) subjek di workspace yang sama? (2) subjek aktif dan punya keanggotaan di skop itu? (3) peran mengizinkan aksi? (4) grant eksplisit masih aktif? (5) klasifikasi data mengizinkan? (6) skop konektor mengizinkan? (7) izinkan + audit, atau tolak dan buat permintaan akses.
3. **Batas klien (BR-CL-01).** Data, sesi, dan komentar milik satu klien tidak pernah terlihat oleh klien lain atau masuk ke konteks sesi klien lain. Ini syarat utama ICP 1.
4. **Serah-terima tanpa pewarisan izin (BR-AR-03/04).** Orang yang melanjutkan sesi tidak otomatis mewarisi akses sumber data pemilik sebelumnya.
5. **Policy engine deterministik (BR-PE).** Batas biaya, izin, dan ruang lingkup tidak diputuskan LLM.
6. **Pemisahan egress (BR-EX, §12.18).** Komponen yang membaca konten tidak tepercaya tidak punya kapabilitas mengirim keluar; tujuan harus dari whitelist.
7. **Audit berantai-hash (BR-AC-01).** Keterverifikasian rantai hanya selama workspace aktif, dan batasan ini wajib diungkap ke pengguna.
8. **Approver ≠ pengusul** untuk perubahan berisiko (dipakai di `12` §4.2).
9. **Deteksi rubber-stamp (BR-HL-04):** median waktu tinjau di bawah 5 detik ditandai.
10. **Model ancaman injeksi prompt:** tidak ada klaim kebal; pertahanan berlapis.
11. **Klasifikasi data 4 tingkat:** Publik, Internal, Rahasia, Sangat Sensitif.

## Arsitektur MVP (dari `17` §7)

```
Claude Code (mesin pengguna)
  └─ hook http: SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop
        │  event: langkah, tool call, diff, token usage
        ▼
Server (Next.js di Vercel + Supabase Postgres/Auth/Realtime)
  ├─ Timeline sesi bersama (amati) + presence + komentar tertambat
  ├─ Antrean pesan rekan → dikirim ke agent lewat additionalContext pada tool call berikutnya (arahkan)
  ├─ Flag Hold → PreToolUse menolak tool call berikutnya dengan pesan "dijeda oleh [nama]" (arahkan)
  ├─ Snapshot git per checkpoint + transkrip → perintah "lanjutkan dari langkah N" di mesin lain (serahkan)
  ├─ Peran: pemilik, pengemudi, tamu klien (lihat + komentar saja, satu run)
  └─ Halaman harga + deposit
```

Dasar teknis: hook `http`, penolakan tool call lewat `PreToolUse`, `additionalContext`, serta checkpoint/`--fork-session` di Claude Code (Anthropic, 2026) ✅ (sumber lengkap di `17` §9).

**Tidak masuk MVP:** harness lain, pooling kuota, integrasi Slack/Teams, CRDT, fork dari langkah lama sebagai fitur utama, run non-coding, izin berlapis selain pemilik/pengemudi/tamu, penyimpanan key.

## Arsitektur pasca-validasi

Hanya dibangun jika gerbang di `06` §8 dan `07` §6 lolos:
- **Run, Spec, usulan berkelas risiko, clearance, Hold:** `12`.
- **Kredensial LLM, FundingBinding, rem biaya lima level:** `14`.
- **Harness kedua (Codex/Cursor) dan batas klien penuh:** peluang #1–#2 di `17` §6.

## Metrik produk

Metrik keputusan MVP ada di `17` §7 dan `07` §6. Event instrumentasi mengikuti `12` §4.11, dengan `receipt_shared` diganti `guest_invited`.

---

[SUMBER]

- Anthropic. (2026). *Hooks reference / Checkpointing*. Claude Code Docs. Sumber lengkap dan tanggal akses ada di `17` §9.
- Rujukan internal: `17` §6–§7, `15` §2.2, `06` §1, `12`, `14`.
