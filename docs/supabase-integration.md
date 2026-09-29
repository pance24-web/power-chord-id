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
