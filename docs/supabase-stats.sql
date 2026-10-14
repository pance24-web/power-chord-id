-- Jalankan di Supabase SQL Editor.
create table if not exists public.song_stats (
  song_id text primary key,
  views bigint not null default 0 check (views >= 0),
  likes bigint not null default 0 check (likes >= 0),
  updated_at timestamptz not null default now()
);

alter table public.song_stats enable row level security;

drop policy if exists "public can read song stats" on public.song_stats;
create policy "public can read song stats"
  on public.song_stats for select to anon, authenticated using (true);

drop policy if exists "public can write song stats" on public.song_stats;
drop policy if exists "public can update song stats" on public.song_stats;

create or replace function public.increment_song_stat(
  p_song_id text,
  p_action text,
  p_delta integer
)
returns public.song_stats
language plpgsql
security definer
set search_path = public
as $$
declare result public.song_stats;
begin
  if p_action not in ('view', 'favorite') or p_delta not in (-1, 1) then
    raise exception 'invalid statistic increment';
  end if;
  insert into public.song_stats (song_id, views, likes)
    values (p_song_id, case when p_action = 'view' then greatest(0, p_delta) else 0 end,
            case when p_action = 'favorite' then greatest(0, p_delta) else 0 end)
  on conflict (song_id) do update set
    views = case when p_action = 'view' then greatest(0, song_stats.views + p_delta) else song_stats.views end,
    likes = case when p_action = 'favorite' then greatest(0, song_stats.likes + p_delta) else song_stats.likes end,
    updated_at = now()
  returning * into result;
  return result;
end;
$$;

grant execute on function public.increment_song_stat(text, text, integer) to anon, authenticated;

-- Opsional: isi baseline katalog sekali dengan ID dari src/data/songs.ts.
-- insert into public.song_stats (song_id) values ('sampai-jumpa-endank-soekamti') on conflict do nothing;
