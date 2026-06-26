-- Complete nutrition_data for the remaining catalogue items (g13–g65) — rough
-- per-100g estimates, same as the 0001 seed. Salvaged from a draft migration.
insert into nutrition_data (item_id, protein_g, carbs_g, fat_g, kcal_per_100g) values
  ('g13',1,6,0,31),('g14',1,3,0,17),('g15',1,6,0,25),('g17',1,4,0,15),
  ('g18',3,4,0,23),('g19',3,7,0,34),('g21',1,10,0,41),('g22',2,7,0,31),
  ('g23',6,33,1,149),('g24',1,9,0,40),('g27',1,9,0,29),('g29',1,14,0,57),
  ('g41',30,11,49,559),('g44',1,4,0,19),('g48',3,3,1,23),('g49',4,8,1,44),
  ('g50',2,19,1,83),('g51',1,12,0,47),('g52',1,11,0,42),('g53',2,75,0,282),
  ('g58',20,28,45,562),('g59',0,0,100,884),('g60',4,5,4,67),('g61',5,6,7,100),
  ('g62',1,5,1,38),('g63',20,58,14,228),('g64',0,28,0,53),('g65',0,13,0,288)
on conflict (item_id) do nothing;
