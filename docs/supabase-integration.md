# Supabase integration

The app now includes an optional Supabase client foundation. No Supabase project, schema, table, or data was changed.

## Environment variables

Configure these in the local environment or Vercel project settings when the database is ready:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use the project's **publishable/anon** key only. Never expose a service-role key in browser code.

## Usage

```ts
import { getSupabaseClient } from '@/lib/supabase';

const client = getSupabaseClient();
const { data, error } = await client.from('your_table').select('*');
```

Until both variables are present, `supabase` is `null` and the existing local-first experience continues to work. Table names and queries should be added only after the target Supabase project is restored/selected and its schema is confirmed.

## Statistik terpusat

API `/api/stats` membaca dan menulis tabel `song_stats` di Supabase bila dua environment variable di atas tersedia. Jalankan [supabase-stats.sql](./supabase-stats.sql) sekali di SQL Editor untuk membuat tabel dan RLS. Jika Supabase belum dikonfigurasi atau sedang gagal, aplikasi memakai fallback lokal agar pengalaman development tetap berjalan.

Route statistik dibatasi rate limit per alamat IP (`GET/POST`: 60 permintaan/menit, SSE: 10 koneksi/menit) dan hanya menerima `songId` dari katalog yang dikenal.
