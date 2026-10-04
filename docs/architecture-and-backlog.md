# Dokumen Arsitektur, Audit Awal, Backlog Prioritas & KPI — PowerChord

Dokumen ini disusun sebagai cetak biru (*blueprint*) rekayasa perangkat lunak dan manajemen produk untuk transisi aplikasi **PowerChord** dari fase *client-side/local-first prototype* menuju sistem produksi skala penuh (*production-grade, scalable, and secure platform*).

---

## 1. Audit Kondisi Saat Ini (Current State Audit)

### 1.1. Audit Keamanan (Security Audit)
* **Status Saat Ini**:
  * ✅ **HTTP Security Headers**: Berhasil diimplementasikan pada `next.config.mjs` (CSP, HSTS `max-age=63072000`, X-Frame-Options `SAMEORIGIN`, Referrer-Policy, X-Content-Type-Options `nosniff`, Permissions-Policy).
  * ⚠️ **Data Persistence**: Data lagu kustom, request chord, timer latihan, dan riwayat favorit saat ini tersimpan di browser `localStorage`. Rentan hilang jika cache browser dibersihkan dan tidak tersinkronisasi lintas perangkat.
  * ⚠️ **API Secrets & Authentication**: Belum ada sistem autentikasi pengguna (*user accounts*) terpusat atau proteksi API routes menggunakan JWT/Session cookies.
  * ⚠️ **Input Sanitization**: Request chord dan editor lagu kustom baru divalidasi di sisi klien (*client-side validation*). Belum ada validasi skema sisi server (*Zod/Server Actions*) untuk mencegah serangan *Stored XSS* atau *Payload Injection* jika data nanti disimpan ke database terpusat.

### 1.2. Audit Performa (Performance & Core Web Vitals)
* **Status Saat Ini**:
  * ✅ **Bundling & Rendering**: Menggunakan Next.js 16 App Router dengan `output: 'standalone'`. Waktu build cepat, bebas *dead code*.
  * ✅ **Sintesis Audio Ringan**: Menggunakan Web Audio API berbasis oscillator sintetis (`triangle` wave & acoustic decay) sehingga tidak membebani network bandwidth dengan pengunduhan file suara `.mp3`/`.wav`.
  * ✅ **AutoScroll Engine**: Ditenagai oleh `requestAnimationFrame` dengan penghitungan *sub-pixel remainder*, berjalan stabil di 60fps/120fps tanpa menyebabkan *layout thrashing*.
  * 🔄 **Area Peningkatan**: Memisahkan komponen interaktif berat (`ChordDictionaryModal`, `GuitarTuner`, `SongEditorModal`) menggunakan dynamic imports (`next/dynamic` dengan `ssr: false`) untuk memangkas *Initial JavaScript Bundle* lebih lanjut.

### 1.3. Audit SEO & Indeks Mesin Pencari
* **Status Saat Ini**:
  * ✅ **Metadata Dasar**: Judul `<title>`, `<meta name="description">`, dan OpenGraph tags sudah sinkron di `layout.tsx` dan `metadata.json`.
  * ⚠️ **Dynamic Route Indexing**: Saat ini pembacaan lagu menggunakan *client state* di dalam satu rute utama (`/`). Mesin pencari seperti Google bot belum dapat mengindeks setiap lagu secara individual (misal: `/chord/dewa-19-kangen` atau `/chord/sheila-on-7-dan`).
  * ⚠️ **Structured Data (Schema.org)**: Belum ada JSON-LD berjenis `MusicComposition` atau `MusicRecording` yang penting untuk *Rich Snippets* di hasil pencarian Google.
  * ⚠️ **Sitemap & Robots.txt**: File `sitemap.xml` dinamis berisi ribuan tautan lagu belum digenerate secara otomatis via Next.js metadata route.

### 1.4. Audit Aksesibilitas (Accessibility / WCAG AA)
* **Status Saat Ini**:
  * ✅ **Kontras Warna**: Latar belakang `#F8FAFC` (terang) dan `#0B0F19` (gelap) memberikan rasio kontras $\ge 4.5:1$ untuk teks lirik dan metadata.
  * ✅ **Target Sentuh Mobile**: Tombol autoscroll, navigasi bawah, dan tombol favorit memenuhi standar $\ge 40\text{px}$–$48\text{px}$.
  * 🔄 **Area Peningkatan**: Menambahkan atribut `aria-expanded` dan `aria-controls` pada dropdown Capo, menu kecepatan scroll, serta penanganan fokus (*focus trap*) saat modal dialog terbuka.

---

## 2. Arsitektur Target (Target Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        POWERCHORD TARGET SYSTEM                        │
└────────────────────────────────────────────────────────────────────────┘

    [ KLIEN & PWA ]
    ├── Desktop Browser (Web Audio, Keyboard Shortcuts, Companion Chords)
    ├── Mobile Web / PWA (Safe Area Insets, Touch Navigation, Offline Cache)
           │
           │  HTTPS / WSS / CSP Strict
           ▼
    [ EDGE & FRONTEND LAYER (Next.js 16 App Router) ]
    ├── Server Components (SEO Static Generation, ISR untuk jutaan chord)
    ├── Dynamic Route Handlers (`/chord/[slug]`, `/api/v1/*`)
    ├── Server Actions & Middleware (Auth Guard, Role Check, Rate Limiter)
           │
           ├────────────────────────┬────────────────────────┐
           ▼                        ▼                        ▼
    [ AUTH & IDENTITY ]      [ ORM & DATABASE ]      [ OBJECT STORAGE ]
    ├── Clerk / NextAuth     ├── Prisma ORM          ├── Cloudflare R2 / S3
    ├── Role: USER, CREATOR, ├── PostgreSQL Pool     │   (Cover art, audio
    │   REVIEWER, ADMIN      ├── Read Replicas       │    samples, PDF exports)
    │                        │   (Supabase / Neon)   │
    └────────────────────────┴───────────────────────┴────────────────────────┘
           │
           ▼
    [ MONITORING & OBSERVABILITY ]
    ├── Sentry (Error Tracking, P95 Tracing, Session Replay)
    └── Plausible Analytics (Cookieless, GDPR, Event Goals: Strum, Autoscroll)
```

### 2.1. Skema Database Relasional (PostgreSQL Schema)
* **Entitas Utama**:
  1. `User`: `id`, `email`, `name`, `avatarUrl`, `role` (`USER`, `CREATOR`, `MODERATOR`, `ADMIN`), `createdAt`.
  2. `Artist`: `id`, `name`, `slug`, `bio`, `imageUrl`, `verified`.
  3. `Song`: `id`, `title`, `slug`, `artistId`, `originalKey`, `capo`, `tempo`, `genre`, `difficulty`, `content` (format chord pro / bracket notation), `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `viewsCount`, `likesCount`, `createdAt`, `updatedAt`.
  4. `Favorite`: `userId`, `songId`, `createdAt` (Composite Primary Key).
  5. `PracticeSession`: `id`, `userId`, `songId`, `durationSeconds`, `createdAt`.
  6. `ChordRequest`: `id`, `userId` (opsional), `songTitle`, `artist`, `requesterEmail`, `notes`, `status` (`PENDING`, `IN_REVIEW`, `FULFILLED`, `REJECTED`), `fulfilledSongId`, `createdAt`.
  7. `UserCustomSong`: `id`, `userId`, `title`, `artist`, `content`, `key`, `isPrivate`.

### 2.2. Autentikasi & Autorisasi (Auth & RBAC)
* **Arsitektur**:
  * **Pilihan Utama**: **Clerk** atau **Auth.js (NextAuth v5)**.
  * **Role-Based Access Control (RBAC)**:
    * `GUEST`: Bebas membaca chord, transpose, autoscroll, tuner, dan simpan offline lokal.
    * `USER`: Menyimpan favorit tersinkron cloud antar-perangkat, riwayat latihan, request lagu, dan simpan chord pribadi.
    * `CREATOR/REVIEWER`: Menulis chord baru, mengedit chord yang ada, dan memvalidasi keakuratan penempatan akor.
    * `ADMIN`: Akses penuh ke dashboard analitik, moderasi konten, manajemen pengguna, dan penanganan backlog request chord.

### 2.3. Penyimpanan Aset (Object Storage)
* **Penyedia**: S3-Compatible Storage (Cloudflare R2 atau AWS S3 / Supabase Storage).
* **Kegunaan**:
  * Thumbnail foto artis dan cover album beresolusi tinggi dengan WebP/AVIF conversion.
  * File export lembar musik PDF (*printable chord sheets*).
  * Backup data mingguan secara terenkripsi (*at rest*).

### 2.4. Admin Panel & CMS Musisi
* **Halaman Khusus**: Rute terproteksi `/admin` (menggunakan Next.js Route Groups `(admin)`).
* **Fitur Panel**:
  * **Chord Moderation Queue**: Editor WYSIWYG interaktif dengan live chord highlighting untuk memvalidasi chord kiriman komunitas sebelum dipublikasikan.
  * **Request Chord Triage**: Pengelompokan request lagu berdasarkan jumlah voting/permintaan tertinggi.
  * **Analytics Dashboard**: Grafik lagu terpopuler harian, durasi rata-rata sesi latihan, dan tingkat retensi pengguna.

---

## 3. Pemilihan Stack Pendukung & Rekomendasi Teknis

| Komponen | Pilihan Stack | Alasan & Evaluasi Trade-off |
| :--- | :--- | :--- |
| **Database** | **PostgreSQL (Supabase / Neon)** | Dukungan pencarian teks penuh (*Full-Text Search*) untuk judul/artis, performa tinggi, indeks GIN/B-Tree untuk query chord, dan dukungan koneksi serverless pooling. |
| **ORM** | **Prisma ORM** | Type-safety end-to-end dengan TypeScript, migrasi skema yang andal (*Prisma Migrate*), serta relasi model yang mudah dibaca oleh tim. |
| **Auth** | **Clerk** *(Rekomendasi)* / **NextAuth** | **Clerk** unggul dalam UI siap pakai, keamanan MFA/Session management tingkat enterprise, sinkronisasi webhook, dan integrasi RBAC tanpa beban pemeliharaan infrastruktur auth sendiri. |
| **Error Monitoring** | **Sentry** | Pemantauan error *realtime* di sisi klien dan server Next.js, penangkapan performa LCP/INP per rute, serta fitur *Session Replay* untuk mendiagnosis crash saat pengguna memainkan lagu. |
| **Web Analytics** | **Plausible / Umami** | Privasi terjamin (tanpa cookie banner, GDPR compliant), sangat ringan (< 1KB script), dan akurat mencatat metrik konversi spesifik (misal: klik Autoscroll, Transpose nada, durasi latihan). |

---

## 4. Backlog Prioritas (GitHub Projects / Linear)

### Format Penomoran:
* `P0`: Kritis / Wajib Segera (*Sprint 1*)
* `P1`: Prioritas Tinggi (*Sprint 2-3*)
* `P2`: Prioritas Menengah (*Sprint 4-5*)
* `P3`: Nilai Tambah / Eksplorasi (*Future*)

### Tabel Backlog Terstruktur

| ID | Modul / Fitur | Label | Prioritas | Estimasi | Deskripsi & Acceptance Criteria |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **SEC-01** | Input Sanitization & Server Actions Validation | `security` | **P0** | 3 SP | Terapkan skema Zod pada semua form (Request Chord, Song Editor, Search Query) untuk mencegah injeksi payload dan XSS. |
| **SEC-02** | Rate Limiting pada API Routes | `security`, `ops` | **P0** | 2 SP | Pasang Upstash Redis / Cloudflare Rate Limiting pada rute `/api/request-chord` dan search endpoint untuk mencegah spam dan scraping massal. |
| **CORE-01** | Dynamic Routing `/chord/[slug]` untuk SEO | `core`, `content` | **P0** | 5 SP | Pindahkan tampilan SongViewer ke dynamic routes Next.js SSR/ISR agar setiap lagu memiliki URL unik yang terindeks Google. |
| **CORE-02** | Integrasi Prisma + PostgreSQL | `core`, `ops` | **P0** | 5 SP | Buat skema Prisma, koneksikan ke PostgreSQL terkelola, dan migrasikan dataset lagu awal ke database. |
| **CORE-03** | Autentikasi Pengguna & Sinkronisasi Favorit | `core` | **P1** | 5 SP | Integrasikan Clerk/NextAuth. Favorit dan chord custom lokal pengguna otomatis dimigrasi ke database akun setelah login. |
| **OPS-01** | Setup Sentry & Plausible Analytics | `ops` | **P1** | 2 SP | Pasang `@sentry/nextjs` untuk error tracking dan script Plausible untuk melacak aktivitas pengguna tanpa mengorbankan privasi. |
| **CONT-01** | Admin CMS: Verifikasi & Moderasi Chord | `content` | **P1** | 8 SP | Bangun antarmuka `/admin/songs` untuk membuat, mengedit, memvalidasi transposisi kunci, dan menerbitkan chord baru. |
| **CONT-02** | Otomasi Sitemap Dinamis & Schema.org JSON-LD | `content` | **P2** | 3 SP | Buat `app/sitemap.ts` otomatis untuk seluruh katalog dan tambahkan markup `MusicComposition` schema untuk rich snippets. |
| **CORE-04** | Ekspor Chord Sheet ke PDF & Tampilan Cetak | `core` | **P2** | 3 SP | Fitur cetak ramah kertas (*print stylesheet*) dan unduh chord dalam format PDF bersih tanpa elemen navigasi. |
| **LEG-01** | Dokumen Ketentuan Layanan & Kebijakan Privasi | `legal` | **P2** | 2 SP | Sediakan halaman `/terms` dan `/privacy` resmi mencakup hak cipta lirik (*fair use / DMCA policy*) dan transparansi pemrosesan data. |
| **CORE-05** | Audio Metronom Digital Interaktif | `core` | **P3** | 3 SP | Tambahkan metronom ketukan tempo BPM (40-240 BPM) dengan visual pulse dan sound beep menggunakan Web Audio API. |
| **OPS-02** | Automated CI/CD Pipeline & E2E Testing | `ops` | **P3** | 5 SP | Setup GitHub Actions untuk menjalankan lint, type-check, dan Playwright E2E testing sebelum deploy ke produksi. |

---

## 5. Definisi Key Performance Indicators (KPI)

Untuk mengukur keberhasilan produk dan performa platform, target kuantitatif ditetapkan sebagai berikut:

### 5.1. Metrik Keterlibatan Pengguna (User Engagement & Retention)
* **DAU / MAU Ratio**: Target $\ge 25\%$ (menunjukkan PowerChord menjadi aplikasi harian yang dibuka musisi untuk latihan rutin).
* **D1 Retention**: Target $\ge 40\%$ pengguna kembali di hari berikutnya.
* **D7 Retention**: Target $\ge 22\%$ pengguna tetap aktif setelah satu minggu.
* **Average Practice Time per Session**: Rata-rata waktu latihan $\ge 8.5\text{ menit}$ per sesi lagu.

### 5.2. Metrik Konten & Komunitas (Content & Request Metrics)
* **Chord Request Resolution Rate**: $\ge 80\%$ permintaan chord terjawab dalam waktu $\le 72\text{ jam}$.
* **User Custom Songs Created**: $\ge 15\%$ pengguna aktif membuat atau memodifikasi setidaknya satu chord pribadi di koleksinya.
* **Favorite Conversion Rate**: $\ge 30\%$ pengunjung menambahkan minimal 1 lagu ke daftar favorit.

### 5.3. Metrik Kesehatan Teknis & Reliabilitas (Technical Health KPIs)
* **Error Rate (Sentry)**: $< 0.1\%$ dari total sesi pengguna (*crash-free sessions* $\ge 99.9\%$).
* **Largest Contentful Paint (LCP)**: $\le 1.2\text{ detik}$ pada perangkat mobile jaringan 4G.
* **Interaction to Next Paint (INP)**: $\le 80\text{ ms}$ (transisi transpose kunci dan start autoscroll seketika tanpa jeda input).
* **Cumulative Layout Shift (CLS)**: $\le 0.02$ (tidak ada lompatan visual saat diagram kunci dimuat).
* **Uptime Availability**: $\ge 99.95\%$ per kuartal.
