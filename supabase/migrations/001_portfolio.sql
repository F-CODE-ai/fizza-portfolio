-- Supabase Postgres + pgvector migration for Fizza Aman's 3D Portfolio (P4 Contact + P5 RAG)
-- Run in Supabase Dashboard > SQL Editor.
-- Security rule: RLS is ENABLED and FORCED on every table with ZERO policies.
-- The anon key is completely denied; only serverless /api/* using SUPABASE_SERVICE_ROLE_KEY can read/write.

create extension if not exists vector;

-- 1. Contact messages table (Module 5)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 120),
  subject text not null check (char_length(subject) between 2 and 120),
  message text not null check (char_length(message) between 10 and 2000),
  ip_hash text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
alter table public.contact_messages force row level security;
revoke all on public.contact_messages from anon, authenticated;

-- 2. Rate-limit log table (shared by contact and chat endpoints)
create table if not exists public.rate_limits (
  id bigserial primary key,
  bucket text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_rate_limits_lookup on public.rate_limits (bucket, ip_hash, created_at desc);

alter table public.rate_limits enable row level security;
alter table public.rate_limits force row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Atomic rate-limit check with advisory lock
create or replace function public.check_rate_limit(
  p_bucket text,
  p_ip_hash text,
  p_window_seconds int,
  p_max_hits int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  perform pg_advisory_xact_lock(hashtext(p_bucket || ':' || p_ip_hash));
  select count(*) into v_count
    from public.rate_limits
   where bucket = p_bucket
     and ip_hash = p_ip_hash
     and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max_hits then
    return false;
  end if;

  insert into public.rate_limits (bucket, ip_hash) values (p_bucket, p_ip_hash);
  return true;
end;
$$;
revoke all on function public.check_rate_limit(text, text, int, int) from public, anon, authenticated;

-- 3. RAG document chunks table (Module 4)
create table if not exists public.kb_chunks (
  id text primary key,
  section text not null,
  title text not null,
  content text not null,
  embedding vector(768),
  tsv tsvector generated always as (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) stored
);
create index if not exists idx_kb_chunks_tsv on public.kb_chunks using gin (tsv);

alter table public.kb_chunks enable row level security;
alter table public.kb_chunks force row level security;
revoke all on public.kb_chunks from anon, authenticated;

-- Hybrid retrieval (pgvector cosine + full-text rank)
create or replace function public.match_kb_chunks(
  query_embedding vector(768),
  query_text text,
  match_count int default 4
) returns table (
  id text,
  section text,
  title text,
  content text,
  score float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.section,
    c.title,
    c.content,
    (coalesce(1 - (c.embedding <=> query_embedding), 0) * 0.7 +
     coalesce(ts_rank(c.tsv, plainto_tsquery('english', query_text)), 0) * 0.3) as score
  from public.kb_chunks c
  order by score desc
  limit match_count;
$$;
revoke all on function public.match_kb_chunks(vector(768), text, int) from public, anon, authenticated;
