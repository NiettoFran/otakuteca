-- Otakuteca v1: esquema inicial (ver specs/001-otakuteca-catalog/data-model.md)

-- Enums
create type public.work_type as enum ('anime', 'manga');
create type public.work_status as enum ('pending', 'in_progress', 'completed', 'dropped');

-- Tablas
create table public.works (
  id bigint generated always as identity primary key,
  title text not null,
  type public.work_type not null,
  status public.work_status not null,
  cover_url text not null,
  short_review text,
  long_review text,
  parts integer,
  total_units integer,
  progress integer not null default 0,
  rating numeric(2, 1),
  is_favorite boolean not null default false,
  ranking_position smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint works_title_length check (char_length(btrim(title)) between 1 and 200),
  constraint works_cover_url_format check (cover_url ~* '^https?://'),
  constraint works_parts_min check (parts is null or parts >= 1),
  constraint works_total_units_min check (total_units is null or total_units >= 1),
  constraint works_progress_min check (progress >= 0),
  constraint works_progress_max check (total_units is null or progress <= total_units),
  constraint works_rating_steps check (
    rating is null or (rating between 0.5 and 5 and rating * 2 = trunc(rating * 2))
  ),
  constraint works_ranking_range check (
    ranking_position is null or ranking_position between 1 and 10
  ),
  constraint works_ranking_anime_favorite check (
    ranking_position is null or (type = 'anime' and is_favorite)
  ),
  constraint works_ranking_position_key unique (ranking_position)
);

create unique index works_title_type_key on public.works (type, lower(btrim(title)));

create table public.genres (
  id bigint generated always as identity primary key,
  name text not null,
  constraint genres_name_length check (char_length(btrim(name)) between 1 and 40)
);

create unique index genres_name_key on public.genres (lower(btrim(name)));

create table public.work_genres (
  work_id bigint not null references public.works (id) on delete cascade,
  genre_id bigint not null references public.genres (id) on delete cascade,
  primary key (work_id, genre_id)
);

create index work_genres_genre_id_idx on public.work_genres (genre_id);

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- Normalización automática de obras
create function public.works_before_write() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.title := btrim(new.title);

  if new.status = 'completed' and new.total_units is not null then
    new.progress := new.total_units;
  end if;

  if new.is_favorite = false or new.type <> 'anime' then
    new.ranking_position := null;
  end if;

  if tg_op = 'INSERT' then
    new.updated_at := now();
  elsif (to_jsonb(new) - 'ranking_position' - 'updated_at')
      is distinct from (to_jsonb(old) - 'ranking_position' - 'updated_at') then
    new.updated_at := now();
  else
    new.updated_at := old.updated_at;
  end if;

  return new;
end;
$$;

create trigger works_before_write
  before insert or update on public.works
  for each row execute function public.works_before_write();

create function public.genres_before_write() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.name := btrim(new.name);
  return new;
end;
$$;

create trigger genres_before_write
  before insert or update on public.genres
  for each row execute function public.genres_before_write();

-- Seguridad (RLS)
create function public.is_admin() returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

grant execute on function public.is_admin() to anon, authenticated;

alter table public.works enable row level security;
alter table public.genres enable row level security;
alter table public.work_genres enable row level security;
alter table public.admins enable row level security;

create policy works_select on public.works for select to anon, authenticated using (true);
create policy works_insert on public.works for insert to authenticated
  with check (public.is_admin());
create policy works_update on public.works for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy works_delete on public.works for delete to authenticated
  using (public.is_admin());

create policy genres_select on public.genres for select to anon, authenticated using (true);
create policy genres_insert on public.genres for insert to authenticated
  with check (public.is_admin());
create policy genres_update on public.genres for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy genres_delete on public.genres for delete to authenticated
  using (public.is_admin());

create policy work_genres_select on public.work_genres for select to anon, authenticated
  using (true);
create policy work_genres_insert on public.work_genres for insert to authenticated
  with check (public.is_admin());
create policy work_genres_update on public.work_genres for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy work_genres_delete on public.work_genres for delete to authenticated
  using (public.is_admin());

-- RPC: guardar el Ranking de animes favoritos
create function public.set_anime_ranking(p_work_ids bigint[]) returns void
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if cardinality(p_work_ids) > 10
     or cardinality(p_work_ids) <> (select count(distinct x) from unnest(p_work_ids) as x) then
    raise exception 'Ranking inválido: más de 10 obras o ids repetidos' using errcode = '22023';
  end if;

  if (
    select count(*) from public.works
    where id = any (p_work_ids) and type = 'anime' and is_favorite
  ) <> cardinality(p_work_ids) then
    raise exception 'Ranking inválido: hay obras inexistentes o que no son animes favoritos'
      using errcode = '22023';
  end if;

  update public.works set ranking_position = null where ranking_position is not null;

  update public.works w
    set ranking_position = r.pos
    from unnest(p_work_ids) with ordinality as r (id, pos)
    where w.id = r.id;
end;
$$;

grant execute on function public.set_anime_ranking(bigint[]) to authenticated;
