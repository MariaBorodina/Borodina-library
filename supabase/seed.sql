-- Seed realms from FictioneersUI/src/app/core/data/realm.seed.ts

INSERT INTO public.realms (slug, name, description, sort_order)
VALUES
  ('hard-sci-fi', 'Hard Sci-Fi', 'Stories grounded in rigorous science and plausible futures.', 1),
  ('space-opera', 'Space Opera', 'Epic adventures across galaxies and civilizations.', 2),
  ('epic-fantasy', 'Epic Fantasy', 'Sweeping quests through kingdoms of magic and myth.', 3),
  ('urban-fantasy', 'Urban Fantasy', 'The supernatural woven into modern city life.', 4),
  ('cyberpunk', 'Cyberpunk Wastelands', 'Neon-lit dystopias where technology and humanity collide.', 5),
  ('cosmic-horror', 'Cosmic Horror', 'Terrifying glimpses beyond human comprehension.', 6),
  ('solarpunk', 'Solarpunk', 'Hopeful futures built on ecology and community.', 7),
  ('dragon-realms', 'Dragon Realms', 'Ancient wyrms, lost hoards, and fire-bound legends.', 8),
  ('time-travel-archives', 'Time Travel Archives', 'Chronicles that bend the timeline and rewrite history.', 9)
ON CONFLICT (slug) DO NOTHING;
