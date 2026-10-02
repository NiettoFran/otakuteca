-- SOLO PARA LA BASE LOCAL: lo aplican `supabase start` y `supabase db reset`.
-- NUNCA se ejecuta en producción: allí el catálogo real se carga a mano desde /dashboard.

insert into public.genres (name) values
  ('Acción'), ('Aventura'), ('Fantasía'), ('Comedia'), ('Thriller'), ('Shōnen'), ('Fantasía oscura');

insert into public.works
  (title, type, status, cover_url, short_review, long_review, parts, total_units, progress, rating, is_favorite)
values
  ('Frieren', 'anime', 'in_progress', 'https://picsum.photos/seed/frieren/450/600',
   'Melancólico y tranquilo, pero nunca aburrido.',
   E'Habla del paso del tiempo y de lo que valen los vínculos.\nLa banda sonora es preciosa.',
   1, 28, 12, 4.5, true),
  ('Fullmetal Alchemist: Brotherhood', 'anime', 'completed', 'https://picsum.photos/seed/fmab/450/600',
   'Una historia redonda de principio a fin.', null, 1, 64, 64, 5, true),
  ('Shingeki no Kyojin', 'anime', 'completed', 'https://picsum.photos/seed/snk/450/600',
   'Puro impacto y giros que lo dan vuelta todo.', null, 4, 87, 87, 4, true),
  ('Spy x Family', 'anime', 'pending', 'https://picsum.photos/seed/spyxfamily/450/600',
   null, null, null, null, 0, null, false),
  ('Mirai Nikki', 'anime', 'dropped', 'https://picsum.photos/seed/mirainikki/450/600',
   'La idea es buenísima, pero la ejecución se pierde.', null, 1, 26, 10, 2, false),
  ('Naruto', 'anime', 'completed', 'https://picsum.photos/seed/naruto-anime/450/600',
   null, null, null, 220, 220, 3.5, false),
  ('Berserk', 'manga', 'in_progress', 'https://picsum.photos/seed/berserk/450/600',
   'Oscuro, crudo y imposible de soltar.', null, null, null, 120, 5, true),
  ('Naruto', 'manga', 'completed', 'https://picsum.photos/seed/naruto-manga/450/600',
   null, null, 72, 700, 700, 4, false),
  ('Chainsaw Man', 'manga', 'pending', 'https://picsum.photos/seed/chainsawman/450/600',
   null, null, null, null, 0, null, false),
  ('Un isekai con un título de más de 150 caracteres para probar que la tarjeta no se rompa ni deforme la grilla en ninguna pantalla, ni chica ni grande, nunca jamás',
   'anime', 'pending', 'https://picsum.photos/seed/isekai/450/600',
   'Una reseña breve bastante larga para comprobar que la tarjeta la recorta a tres líneas sin romper la grilla en ninguna pantalla. Sigue y sigue y sigue y sigue y sigue y sigue.',
   null, null, null, 0, null, false);

insert into public.work_genres (work_id, genre_id)
select w.id, g.id
from (values
  ('Frieren', 'anime', 'Fantasía'), ('Frieren', 'anime', 'Aventura'),
  ('Fullmetal Alchemist: Brotherhood', 'anime', 'Acción'),
  ('Fullmetal Alchemist: Brotherhood', 'anime', 'Fantasía'),
  ('Shingeki no Kyojin', 'anime', 'Acción'),
  ('Spy x Family', 'anime', 'Comedia'),
  ('Mirai Nikki', 'anime', 'Thriller'),
  ('Naruto', 'anime', 'Shōnen'),
  ('Berserk', 'manga', 'Fantasía oscura'),
  ('Naruto', 'manga', 'Shōnen'),
  ('Chainsaw Man', 'manga', 'Acción')
) as v (title, type, genre)
join public.works w on w.title = v.title and w.type = v.type::public.work_type
join public.genres g on g.name = v.genre;

-- Ranking: 1 Shingeki no Kyojin, 2 Fullmetal Alchemist: Brotherhood
update public.works set ranking_position = 1 where title = 'Shingeki no Kyojin' and type = 'anime';
update public.works set ranking_position = 2
  where title = 'Fullmetal Alchemist: Brotherhood' and type = 'anime';
