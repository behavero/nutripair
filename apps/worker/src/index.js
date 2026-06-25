// NutriPair v2 — FR/EN/RO + Martin & Giulia presets + bug fixes
// Single-file Cloudflare Worker. No bundler — deployed with `wrangler deploy --no-bundle`.
// Browser JS uses string concatenation (no nested template literals) to keep escaping simple.

const GROCERY_DATA = [
  { id:'s1', section:'Viandes & Poissons', section_en:'Meat & Fish', section_ro:'Carne & Pește', icon:'🥩', items:[
    {id:'g1',  name:'Oeufs (boîte de 20)',                name_en:'Eggs (box of 20)',          name_ro:'Ouă (cutie de 20)',                        qty:'1 boîte',          price:18, badge:'protéine'},
    {id:'g2',  name:'Cuisses de poulet',                  name_en:'Chicken thighs 1kg',        name_ro:'Pulpe de pui 1kg',                         qty:'1 kg',             price:22, badge:'viande'},
    {id:'g3',  name:'Filets de saumon (frais/surgelés)',  name_en:'Salmon fillets 4×150g',     name_ro:'File de somon 4×150g',                     qty:'4 × 150 g',        price:48, badge:'oméga-3'},
    {id:'g4',  name:'Maquereau (macrou afumat)',           name_en:'Smoked mackerel',           name_ro:'Macrou afumat',                            qty:'2 filets',         price:14, badge:'oméga-3'},
    {id:'g5',  name:"Sardines à l'huile d'olive",         name_en:'Sardines in olive oil',     name_ro:'Sardine în ulei de măsline',               qty:'4 boîtes × 120 g', price:24, badge:'oméga-3'},
    {id:'g6',  name:'Thon au naturel (conserves)',         name_en:'Tuna in water (cans)',      name_ro:'Ton în suc propriu (conserve)',            qty:'3 boîtes',         price:18, badge:'protéine'},
  ]},
  { id:'s2', section:'Produits Laitiers & Fermentés', section_en:'Dairy & Fermented', section_ro:'Lactate & Fermentate', icon:'🥛', items:[
    {id:'g7',  name:'Yaourt grec nature (sans sucre)',     name_en:'Plain Greek yogurt',        name_ro:'Iaurt grecesc natural',                    qty:'2 × 400 g',        price:16, badge:'probiotique'},
    {id:'g8',  name:'Kéfir',                               name_en:'Kefir',                     name_ro:'Chefir',                                   qty:'1 L',              price:12, badge:'probiotique'},
    {id:'g9',  name:'Brânza de vaci (fromage frais)',      name_en:'Fresh cheese (quark)',      name_ro:'Brânză de vaci',                           qty:'500 g',            price:14, badge:'protéine'},
    {id:'g10', name:'Sana',                                name_en:'Sana (fermented milk)',     name_ro:'Sana',                                     qty:'1 L',              price:9,  badge:'probiotique'},
    {id:'g11', name:'Feta ou brânza telemea',              name_en:'Feta or telemea cheese',    name_ro:'Feta sau brânză telemea',                  qty:'200 g',            price:16, badge:null},
    {id:'g12', name:'Beurre (unt)',                        name_en:'Butter',                    name_ro:'Unt',                                      qty:'125 g',            price:10, badge:null},
    {id:'g45', name:'Burrata',                             name_en:'Burrata',                   name_ro:'Burrata',                                  qty:'100 g',            price:25, badge:null},
    {id:'g46', name:'Halloumi',                            name_en:'Halloumi',                  name_ro:'Halloumi (brânză de grătar)',              qty:'90 g',             price:20, badge:'protéine'},
    {id:'g47', name:'Lait entier',                         name_en:'Whole milk',                name_ro:'Lapte integral',                           qty:'1 L',              price:8,  badge:null},
  ]},
  { id:'s3', section:'Légumes & Fruits', section_en:'Vegetables & Fruit', section_ro:'Legume & Fructe', icon:'🥦', items:[
    {id:'g13', name:'Poivrons (ardei gras, mix)',          name_en:'Bell peppers (mixed)',      name_ro:'Ardei gras (mix)',                         qty:'4–6 pièces',       price:12, badge:null},
    {id:'g14', name:'Courgettes (dovlecei)',               name_en:'Zucchini',                  name_ro:'Dovlecei',                                 qty:'3 pièces',         price:8,  badge:null},
    {id:'g15', name:'Aubergines (vinete)',                 name_en:'Eggplants',                 name_ro:'Vinete',                                   qty:'2 pièces',         price:7,  badge:null},
    {id:'g16', name:'Tomates cerises ou normales (rosii)', name_en:'Cherry tomatoes',           name_ro:'Roșii cherry',                             qty:'500 g',            price:8,  badge:null},
    {id:'g17', name:'Concombres (castraveti)',             name_en:'Cucumbers',                 name_ro:'Castraveți',                               qty:'2 pièces',         price:5,  badge:null},
    {id:'g18', name:'Epinards (spanac, frais ou surgelé)', name_en:'Spinach (fresh or frozen)', name_ro:'Spanac (proaspăt sau congelat)',           qty:'300 g',            price:9,  badge:null},
    {id:'g19', name:'Brocoli (frais ou surgelé)',          name_en:'Broccoli (fresh or frozen)',name_ro:'Broccoli (proaspăt sau congelat)',         qty:'400 g',            price:10, badge:null},
    {id:'g20', name:'Patates douces (cartofi dulci)',      name_en:'Sweet potatoes',            name_ro:'Cartofi dulci',                            qty:'4 moyennes',       price:14, badge:null},
    {id:'g21', name:'Carottes (morcovi)',                  name_en:'Carrots',                   name_ro:'Morcovi',                                  qty:'4–5 pièces',       price:5,  badge:null},
    {id:'g22', name:'Haricots verts (fasole verde)',       name_en:'Green beans',               name_ro:'Fasole verde',                             qty:'400 g',            price:9,  badge:null},
    {id:'g23', name:'Ail (usturoi)',                       name_en:'Garlic',                    name_ro:'Usturoi',                                  qty:'1 tête',           price:3,  badge:null},
    {id:'g24', name:'Oignons (ceapa)',                     name_en:'Onions',                    name_ro:'Ceapă',                                    qty:'4–5 pièces',       price:5,  badge:null},
    {id:'g25', name:'Bananes',                             name_en:'Bananas',                   name_ro:'Banane',                                   qty:'6–8 pièces',       price:9,  badge:null},
    {id:'g26', name:'Pommes (mere)',                       name_en:'Apples',                    name_ro:'Mere',                                     qty:'4–6 pièces',       price:10, badge:null},
    {id:'g27', name:'Citrons (lamâi)',                     name_en:'Lemons',                    name_ro:'Lămâi',                                    qty:'3–4 pièces',       price:7,  badge:null},
    {id:'g28', name:'Avocats',                             name_en:'Avocados',                  name_ro:'Avocado',                                  qty:'2–3 pièces',       price:18, badge:'bon gras'},
    {id:'g29', name:'Fruits rouges surgelés (fructe padure)', name_en:'Frozen mixed berries',   name_ro:'Fructe de pădure congelate',               qty:'400 g',            price:12, badge:null},
    {id:'g48', name:'Basilic frais',                       name_en:'Fresh basil',               name_ro:'Busuioc proaspăt',                         qty:'1 bouquet',        price:5,  badge:null},
    {id:'g49', name:'Menthe fraîche',                      name_en:'Fresh mint',                name_ro:'Mentă proaspătă',                          qty:'1 bouquet',        price:5,  badge:null},
    {id:'g50', name:'Grenade',                             name_en:'Pomegranate',               name_ro:'Rodie',                                    qty:'1 pièce',          price:8,  badge:null},
    {id:'g51', name:'Oranges',                             name_en:'Oranges',                   name_ro:'Portocale',                                qty:'2 pièces',         price:6,  badge:null},
    {id:'g52', name:'Pamplemousse',                        name_en:'Grapefruit',                name_ro:'Grapefruit',                               qty:'1 pièce',          price:5,  badge:null},
    {id:'g53', name:'Dattes (hydratées)',                  name_en:'Dates (soaked)',            name_ro:'Curmale (hidratate)',                      qty:'150 g',            price:15, badge:null},
  ]},
  { id:'s4', section:'Céréales & Légumineuses', section_en:'Grains & Legumes', section_ro:'Cereale & Leguminoase', icon:'🌾', items:[
    {id:'g30', name:'Lentilles rouges (linte rosie)',      name_en:'Red lentils',               name_ro:'Linte roșie',                              qty:'500 g',            price:9,  badge:'protéine'},
    {id:'g31', name:'Haricots blancs (fasole alba)',       name_en:'White beans',               name_ro:'Fasole albă',                              qty:'500 g sec / 1 bte',price:7,  badge:'protéine'},
    {id:'g32', name:'Pois chiches (naut)',                 name_en:'Chickpeas',                 name_ro:'Năut',                                     qty:'1 boîte',          price:6,  badge:'protéine'},
    {id:'g33', name:'Riz complet (orez brun)',             name_en:'Brown rice',                name_ro:'Orez brun',                                qty:'500 g',            price:8,  badge:null},
    {id:'g34', name:"Flocons d'avoine (ovaz)",            name_en:'Oat flakes',                name_ro:'Fulgi de ovăz',                            qty:'500 g',            price:7,  badge:null},
    {id:'g35', name:'Pain complet (paine integrala)',      name_en:'Wholegrain bread',          name_ro:'Pâine integrală',                          qty:'1 miche',          price:8,  badge:null},
    {id:'g54', name:'Pâtes penne',                         name_en:'Penne pasta',               name_ro:'Paste penne',                              qty:'500 g',            price:8,  badge:null},
    {id:'g55', name:'Couscous',                            name_en:'Couscous',                  name_ro:'Cous cous',                                qty:'500 g',            price:7,  badge:null},
    {id:'g56', name:"Farine d'amande",                    name_en:'Almond flour',              name_ro:'Făină de migdale',                         qty:'200 g',            price:18, badge:'bon gras'},
    {id:'g57', name:'Farine de blé',                      name_en:'Wheat flour',               name_ro:'Făină de grâu',                            qty:'1 kg',             price:5,  badge:null},
  ]},
  { id:'s5', section:'Graisses, Noix & Pantry', section_en:'Fats, Nuts & Pantry', section_ro:'Grăsimi, Nuci & Bază', icon:'🧴', items:[
    {id:'g36', name:'Noix (nuci)',                         name_en:'Walnuts',                   name_ro:'Nuci',                                     qty:'200 g',            price:18, badge:'oméga-3'},
    {id:'g37', name:'Amandes ou graines tournesol',        name_en:'Almonds or sunflower seeds',name_ro:'Migdale sau semințe floarea soarelui',     qty:'200 g',            price:14, badge:'bon gras'},
    {id:'g38', name:"Huile d'olive extra vierge",         name_en:'Extra virgin olive oil',    name_ro:'Ulei de măsline extravirgin',              qty:'1 bouteille',      price:28, badge:'bon gras'},
    {id:'g39', name:"Beurre d'amande ou cacahuète",       name_en:'Almond or peanut butter',   name_ro:'Unt de migdale sau arahide',               qty:'1 pot',            price:22, badge:'bon gras'},
    {id:'g40', name:'Graines de chia',                     name_en:'Chia seeds',                name_ro:'Semințe de chia',                          qty:'200 g',            price:18, badge:null},
    {id:'g41', name:'Graines de courge (seminte dovleac)', name_en:'Pumpkin seeds',             name_ro:'Semințe de dovleac',                       qty:'150 g',            price:12, badge:'magnésium'},
    {id:'g42', name:'Chocolat noir 70%+',                  name_en:'Dark chocolate 70%+',       name_ro:'Ciocolată neagră 70%+',                    qty:'2 tablettes',      price:16, badge:'magnésium'},
    {id:'g43', name:'Miel (miere)',                        name_en:'Honey',                     name_ro:'Miere',                                    qty:'1 pot',            price:18, badge:null},
    {id:'g44', name:'Varza murata (chou fermenté)',        name_en:'Sauerkraut (fermented)',    name_ro:'Varză murată',                             qty:'1 bocal',          price:8,  badge:'probiotique'},
    {id:'g58', name:'Pistaches moulues',                   name_en:'Ground pistachios',         name_ro:'Fistic măcinat',                           qty:'100 g',            price:15, badge:null},
    {id:'g59', name:'Huile de tournesol',                  name_en:'Sunflower oil',             name_ro:'Ulei de floarea soarelui',                 qty:'1 L',              price:10, badge:null},
    {id:'g60', name:'Moutarde classique',                  name_en:'Classic mustard',           name_ro:'Muștar clasic',                            qty:'100 g',            price:8,  badge:null},
    {id:'g61', name:"Moutarde à l'ancienne",              name_en:'Whole grain mustard',       name_ro:'Muștar boabe',                             qty:'100 g',            price:10, badge:null},
    {id:'g62', name:'Sauce tomate',                        name_en:'Tomato sauce',              name_ro:'Sos de roșii',                             qty:'400 g',            price:6,  badge:null},
    {id:'g63', name:'Cacao en poudre',                     name_en:'Cocoa powder',              name_ro:'Cacao pudră',                              qty:'100 g',            price:10, badge:null},
    {id:'g64', name:'Levure chimique',                     name_en:'Baking powder',             name_ro:'Praf de copt',                             qty:'1 sachet',         price:4,  badge:null},
    {id:'g65', name:"Extrait de vanille",                 name_en:'Vanilla extract',           name_ro:'Esență de vanilie',                        qty:'1 flacon',         price:8,  badge:null},
  ]}
];

// Frequently-needed extras not in the weekly list. Quick-add inserts them into
// manualItems via the existing /api/add-item route (sectionId places them in the
// matching grocery section). price is informational (shown in the modal only).
const FAVORITES_DATA = [
  { name:'Yaourt nature',        name_en:'Plain yogurt',         name_ro:'Iaurt natural',        qty:'500 g',   sectionId:'s2', price:8 },
  { name:'Fromage blanc',        name_en:'Fromage blanc (quark)',name_ro:'Brânză proaspătă',     qty:'300 g',   sectionId:'s2', price:10 },
  { name:'Crème fraîche',        name_en:'Crème fraîche',        name_ro:'Smântână',             qty:'200 g',   sectionId:'s2', price:7 },
  { name:'Houmous',              name_en:'Hummus',               name_ro:'Humus',                qty:'200 g',   sectionId:'s2', price:12 },
  { name:'Pommes de terre',      name_en:'Potatoes',             name_ro:'Cartofi',              qty:'1 kg',    sectionId:'s3', price:6 },
  { name:'Betteraves',           name_en:'Beetroot',             name_ro:'Sfeclă roșie',         qty:'500 g',   sectionId:'s3', price:5 },
  { name:'Céleri',               name_en:'Celery',               name_ro:'Țelină',               qty:'1 pièce', sectionId:'s3', price:5 },
  { name:'Persil frais',         name_en:'Fresh parsley',        name_ro:'Pătrunjel proaspăt',   qty:'1 bouquet',sectionId:'s3',price:3 },
  { name:'Gingembre',            name_en:'Ginger',               name_ro:'Ghimbir',              qty:'100 g',   sectionId:'s3', price:5 },
  { name:'Quinoa',               name_en:'Quinoa',               name_ro:'Quinoa',               qty:'500 g',   sectionId:'s4', price:16 },
  { name:'Millet',               name_en:'Millet',               name_ro:'Mei',                  qty:'500 g',   sectionId:'s4', price:8 },
  { name:'Lait de coco',         name_en:'Coconut milk',         name_ro:'Lapte de cocos',       qty:'400 ml',  sectionId:'s5', price:9 },
  { name:'Beurre de cacao',      name_en:'Cocoa butter',         name_ro:'Unt de cacao',         qty:'100 g',   sectionId:'s5', price:14 },
  { name:'Graines de lin',       name_en:'Flax seeds',           name_ro:'Semințe de in',        qty:'200 g',   sectionId:'s5', price:7 },
  { name:'Amandes entières',     name_en:'Whole almonds',        name_ro:'Migdale întregi',      qty:'200 g',   sectionId:'s5', price:16 },
  { name:'Noix de cajou',        name_en:'Cashew nuts',          name_ro:'Caju',                 qty:'200 g',   sectionId:'s5', price:20 },
  { name:'Sauce soja',           name_en:'Soy sauce',            name_ro:'Sos de soia',          qty:'250 ml',  sectionId:'s5', price:10 },
  { name:'Vinaigre de cidre',    name_en:'Apple cider vinegar',  name_ro:'Oțet de mere',         qty:'500 ml',  sectionId:'s5', price:9 },
  { name:'Tahini',               name_en:'Tahini',               name_ro:'Tahini',               qty:'300 g',   sectionId:'s5', price:18 },
  { name:'Curcuma',              name_en:'Turmeric',             name_ro:'Curcuma',              qty:'50 g',    sectionId:'s5', price:6 }
];

const DEFAULT_PLAN = {
  lun:{ breakfast:{name:'Overnight oats kéfir & noix',       detail:'80g avoine + kéfir + banane + noix — prep dimanche soir', type:'prep',  time:'5 min'},
        lunch:   {name:'Bowl lentilles & légumes rôtis',      detail:'200g lentilles du batch + légumes rôtis + vinaigrette citron-cumin', type:'batch', time:'10 min'},
        snack:   {name:'2 oeufs durs + pomme',                detail:'Girlfriend: ajouter 30g noix', type:'free', time:'2 min'},
        dinner:  {name:'Omelette féta & épinards',            detail:'3 oeufs/pers + épinards + 40g féta + salade concombre-tomate', type:'cook', time:'15 min'} },
  mar:{ breakfast:{name:'Oeufs brouillés & avocat',           detail:'3-4 oeufs + 1/2 avocat + 1 tranche pain complet', type:'cook', time:'10 min'},
        lunch:   {name:'Bowl poulet & riz complet',           detail:'150g poulet du batch + 120g riz + légumes rôtis + paprika', type:'batch', time:'5 min'},
        snack:   {name:'Brânza de vaci + miel + noix',        detail:'100g brânza + 1cc miel + 20g noix — Girlfriend: + crackers riz', type:'free', time:'2 min'},
        dinner:  {name:'Saumon & haricots verts vapeur',      detail:'150g saumon poêlé ail-citron + 200g haricots verts + riz option', type:'cook', time:'20 min'} },
  mer:{ breakfast:{name:'Bowl yaourt grec & graines',         detail:'200g yaourt + 40g avoine + 1cs chia + fruits rouges + 25g noix', type:'free', time:'5 min'},
        lunch:   {name:'Ciorba de pui (soupe poulet)',        detail:'Restes poulet + bouillon + carottes + céleri + leustan', type:'cook', time:'15 min'},
        snack:   {name:'Banane + beurre amande',              detail:'1 banane + 30g beurre amande — Girlfriend: + pain complet', type:'free', time:'2 min'},
        dinner:  {name:'Salade thon & haricots blancs',       detail:'1 boîte thon + 100g haricots blancs + tomates cerises + citron-huile', type:'free', time:'10 min'} },
  jeu:{ breakfast:{name:'Muffin oeufs poivrons-féta',         detail:'2-3 oeufs + poivrons + épinards + féta — Girlfriend: + tartine beurre amande', type:'cook', time:'10 min'},
        lunch:   {name:'Fasole batuta & pain complet',        detail:'250g haricots + oignon frit + ail + tomate + paprika + 2 tranches pain', type:'batch', time:'10 min'},
        snack:   {name:'Kéfir + noix',                        detail:'200ml kéfir + poignée noix — Girlfriend: + crackers riz + houmous', type:'free', time:'2 min'},
        dinner:  {name:'Poulet & patate douce au four',       detail:'150g poulet + 1 patate douce + brocoli vapeur + huile olive-citron', type:'cook', time:'20 min'} },
  ven:{ breakfast:{name:'Overnight oats graines de courge',   detail:'80g avoine + kéfir + banane + graines courge + chocolat noir 10g', type:'prep', time:'5 min'},
        lunch:   {name:'Saumon frais & riz (repas signature)', detail:'150g saumon poêlé ail-aneth + riz restant + salade fraîche', type:'cook', time:'20 min'},
        snack:   {name:'2 oeufs durs + chocolat noir',        detail:'2 oeufs + 20g chocolat 70% — Girlfriend: + 200ml kéfir', type:'free', time:'2 min'},
        dinner:  {name:'Soupe crémeuse légumes rôtis',        detail:'Mixer légumes rôtis du batch avec bouillon chaud — ou grande salade mixte', type:'batch', time:'10 min'} },
  sam:{ breakfast:{name:'Petit-déj complet du weekend',       detail:'3-4 oeufs brouillés + maquereau grillé + tomates ail + pain + kéfir', type:'cook', time:'25 min'},
        lunch:   {name:'Cuisiner ensemble — repas plaisir',   detail:'Idées: poulet aux pois chiches / boeuf sauté riz / ardei umpluti (poivrons farcis)', type:'cook', time:'40 min'},
        snack:   {name:'Fruits & noix freestyle',             detail:'Snack libre selon envie', type:'free', time:'5 min'},
        dinner:  {name:'Dîner libre du weekend',              detail:'Cuisinez ce qui vous fait plaisir. Un verre de vin ok.', type:'free', time:'—'} },
  dim:{ breakfast:{name:'Bowl yaourt & café tranquille',      detail:'200g yaourt + miel + noix + banane — profitez du café !', type:'free', time:'5 min'},
        lunch:   {name:'Oeufs au four & légumes (quiche rapide)', detail:'4-5 oeufs + légumes restants + féta + herbes — 20 min au four 180°C', type:'cook', time:'20 min'},
        snack:   {name:'Batch cook 90 min',                   detail:'1) Riz brun 2) Légumes rôtis 3) Lentilles/haricots 4) Oeufs durs 5) Poulet mariné 6) Légumes lavés', type:'prep', time:'90 min'},
        dinner:  {name:'Soupe lentilles ou poisson grillé',   detail:'Dîner léger tôt (18h30-19h) avant semaine de travail', type:'cook', time:'10 min'} }
};

// Pre-loaded recipes — shown only while state.recipes is empty (pure display
// fallback, never seeded into KV on startup). Ingredient itemId references a
// GROCERY_DATA id when the ingredient already exists in the catalogue.
const DEFAULT_RECIPES = [
  { id:'dr1', name:'Pasta Burrata', name_en:'Pasta Burrata', name_ro:'Paste cu Burrata', image:'🍝',
    servings:2,
    ingredients:[
      {name:'Pâtes penne',      name_ro:'Paste penne',      qty:'100g', sectionId:'s4', itemId:'g54'},
      {name:'Sauce tomate',     name_ro:'Sos de roșii',     qty:'50g',  sectionId:'s5', itemId:'g62'},
      {name:'Tomates cerises',  name_ro:'Roșii cherry',     qty:'100g', sectionId:'s3', itemId:'g16'},
      {name:'Ail',              name_ro:'Usturoi',          qty:'10g',  sectionId:'s3', itemId:'g23'},
      {name:"Huile d'olive",    name_ro:'Ulei de măsline',  qty:'10ml', sectionId:'s5', itemId:'g38'},
      {name:'Basilic frais',    name_ro:'Busuioc proaspăt', qty:'5g',   sectionId:'s3', itemId:'g48'},
      {name:'Pistaches moulues',name_ro:'Fistic măcinat',   qty:'10g',  sectionId:'s5', itemId:'g58'},
      {name:'Burrata',          name_ro:'Burrata',          qty:'100g', sectionId:'s2', itemId:'g45'},
    ]},
  { id:'dr2', name:'Salade Halloumi', name_en:'Halloumi Salad', name_ro:'Salată cu Halloumi', image:'🥗',
    servings:2,
    ingredients:[
      {name:'Couscous',        name_ro:'Cous cous',        qty:'60g',  sectionId:'s4', itemId:'g55'},
      {name:'Concombre',       name_ro:'Castraveți',       qty:'40g',  sectionId:'s3', itemId:'g17'},
      {name:'Grenade',         name_ro:'Rodie',            qty:'10g',  sectionId:'s3', itemId:'g50'},
      {name:'Menthe fraîche',  name_ro:'Mentă proaspătă',  qty:'10g',  sectionId:'s3', itemId:'g49'},
      {name:'Halloumi',        name_ro:'Halloumi',         qty:'90g',  sectionId:'s2', itemId:'g46'},
      {name:"Huile d'olive",   name_ro:'Ulei de măsline',  qty:'10ml', sectionId:'s5', itemId:'g38'},
      {name:'Épinards',        name_ro:'Spanac',           qty:'30g',  sectionId:'s3', itemId:'g18'},
      {name:'Basilic frais',   name_ro:'Busuioc proaspăt', qty:'10g',  sectionId:'s3', itemId:'g48'},
      {name:'Oranges',         name_ro:'Portocale',        qty:'40g',  sectionId:'s3', itemId:'g51'},
      {name:'Pamplemousse',    name_ro:'Grapefruit',       qty:'40g',  sectionId:'s3', itemId:'g52'},
    ]},
  { id:'dr3', name:'Vinaigrette maison', name_en:'Homemade vinaigrette', name_ro:'Vinaigretă de casă', image:'🫙',
    servings:8,
    ingredients:[
      {name:'Moutarde classique',    name_ro:'Muștar clasic',          qty:'100g', sectionId:'s5', itemId:'g60'},
      {name:"Moutarde à l'ancienne", name_ro:'Muștar boabe',           qty:'100g', sectionId:'s5', itemId:'g61'},
      {name:'Miel',                  name_ro:'Miere',                  qty:'100g', sectionId:'s5', itemId:'g43'},
      {name:"Huile d'olive",         name_ro:'Ulei de măsline',        qty:'100ml',sectionId:'s5', itemId:'g38'},
      {name:'Huile de tournesol',    name_ro:'Ulei floarea soarelui',  qty:'300ml',sectionId:'s5', itemId:'g59'},
      {name:'Citron',                name_ro:'Lămâie',                 qty:'1 buc',sectionId:'s3', itemId:'g27'},
    ]},
  { id:'dr4', name:'Brownie de Curmale', name_en:'Date Brownie', name_ro:'Brownie de Curmale', image:'🥧',
    servings:6,
    ingredients:[
      {name:'Dattes',             name_ro:'Curmale hidratate', qty:'150g',         sectionId:'s3', itemId:'g53'},
      {name:'Lait entier',        name_ro:'Lapte integral',    qty:'200ml',        sectionId:'s2', itemId:'g47'},
      {name:'Œufs',               name_ro:'Ouă',               qty:'2 buc',        sectionId:'s1', itemId:'g1'},
      {name:'Beurre de cacahuète',name_ro:'Unt de arahide',    qty:'3 linguri',    sectionId:'s5', itemId:'g39'},
      {name:"Farine d'amande",    name_ro:'Făină de migdale',  qty:'30g',          sectionId:'s4', itemId:'g56'},
      {name:'Farine de blé',      name_ro:'Făină de grâu',     qty:'60g',          sectionId:'s4', itemId:'g57'},
      {name:'Cacao en poudre',    name_ro:'Cacao pudră',       qty:'1 lingură',    sectionId:'s5', itemId:'g63'},
      {name:'Levure chimique',    name_ro:'Praf de copt',      qty:'10g',          sectionId:'s5', itemId:'g64'},
      {name:'Extrait de vanille', name_ro:'Esență de vanilie', qty:'1 linguriță',  sectionId:'s5', itemId:'g65'},
    ]},
];

const DEFAULT_STATE = { checked:{}, manualItems:[], plan: DEFAULT_PLAN, prices:{}, recipes:[], itemOverrides:{}, manualHistory:[], resetAt: null };

const I18N = {
  fr:{
    nameSub:"Qui est aux courses ou en train de consulter le planning ?",
    navShop:'Courses', navPlan:'Planning', navToday:"Aujourd'hui",
    shopHeader:'Carrefour · Shopping City Piatra Neamt',
    uncheckAll:'Tout décocher',
    addItem:'+ Ajouter un article',
    addTitle:'Ajouter un article', addNamePh:"Nom de l'article",
    addQtyPh:'Quantité (ex : 500 g, 2 pièces…)',
    addSave:'Ajouter',
    editTitle:'Modifier le repas', editNamePh:'Nom du repas',
    editDetailPh:'Détails / préparation', editTimePh:'Temps (ex : 10 min)',
    editSave:'Enregistrer',
    resetConfirm:'Tout décocher ? (utile pour la semaine suivante)',
    manualSection:'Ajoutés manuellement',
    checkedSummary:'articles cochés',
    today:"Aujourd'hui",
    syncOk:'sync ok', syncIng:'sync...', syncErr:'hors ligne',
    toastSaved:'Enregistré ✓', toastErr:'Erreur de connexion — réessaie',
    days:{lun:'Lundi',mar:'Mardi',mer:'Mercredi',jeu:'Jeudi',ven:'Vendredi',sam:'Samedi',dim:'Dimanche'},
    slots:{breakfast:'Petit-déj',lunch:'Déjeuner',snack:'Collation 15h',dinner:'Dîner'},
    locale:'fr-FR'
  },
  en:{
    nameSub:'Who is shopping or checking the meal plan?',
    navShop:'Shopping', navPlan:'Planning', navToday:'Today',
    shopHeader:'Carrefour · Shopping City Piatra Neamt',
    uncheckAll:'Uncheck all',
    addItem:'+ Add item',
    addTitle:'Add item', addNamePh:'Item name',
    addQtyPh:'Quantity (e.g. 500 g, 2 pcs…)',
    addSave:'Add',
    editTitle:'Edit meal', editNamePh:'Meal name',
    editDetailPh:'Details / preparation', editTimePh:'Time (e.g. 10 min)',
    editSave:'Save',
    resetConfirm:'Uncheck all? (useful for next week)',
    manualSection:'Added manually',
    checkedSummary:'items checked',
    today:'Today',
    syncOk:'synced', syncIng:'syncing...', syncErr:'offline',
    toastSaved:'Saved ✓', toastErr:'Connection error — try again',
    days:{lun:'Monday',mar:'Tuesday',mer:'Wednesday',jeu:'Thursday',ven:'Friday',sam:'Saturday',dim:'Sunday'},
    slots:{breakfast:'Breakfast',lunch:'Lunch',snack:'Snack 3pm',dinner:'Dinner'},
    locale:'en-GB'
  },
  ro:{
    nameSub:'Cine face cumpararaturile sau verifica planul?',
    navShop:'Cumparaturi', navPlan:'Plan', navToday:'Azi',
    shopHeader:'Carrefour · Shopping City Piatra Neamt',
    uncheckAll:'Debifeaza tot',
    addItem:'+ Adauga articol',
    addTitle:'Adauga articol', addNamePh:'Denumire',
    addQtyPh:'Cantitate (ex: 500 g, 2 buc…)',
    addSave:'Adauga',
    editTitle:'Editeaza masa', editNamePh:'Numele mesei',
    editDetailPh:'Detalii / preparare', editTimePh:'Timp (ex: 10 min)',
    editSave:'Salveaza',
    resetConfirm:'Debifeazi tot? (util pentru saptamana viitoare)',
    manualSection:'Adaugate manual',
    checkedSummary:'articole bifate',
    today:'Azi',
    syncOk:'sincronizat', syncIng:'sincronizare...', syncErr:'offline',
    toastSaved:'Salvat ✓', toastErr:'Eroare de conexiune — reincearca',
    days:{lun:'Luni',mar:'Marti',mer:'Miercuri',jeu:'Joi',ven:'Vineri',sam:'Sambata',dim:'Duminica'},
    slots:{breakfast:'Mic dejun',lunch:'Pranz',snack:'Gustare 15h',dinner:'Cina'},
    locale:'ro-RO'
  }
};

// Brand colour used by the PWA theme + app accent.
const BRAND_COLOR = '#C85A2A'; // burnt orange — 70s retro palette

/**
 * App icon, served at /icon.svg and referenced by the manifest + apple-touch-icon.
 * Pure vector (no emoji font dependency) so it rasterises identically on every platform.
 * Background fills the full canvas → safe as a maskable icon on Android.
 */
const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'
  + '<rect width="512" height="512" fill="' + BRAND_COLOR + '"/>'
  + '<circle cx="256" cy="206" r="52" fill="#FDF0E8"/>'
  + '<circle cx="200" cy="222" r="42" fill="#ffffff"/>'
  + '<circle cx="312" cy="222" r="42" fill="#ffffff"/>'
  + '<circle cx="230" cy="232" r="16" fill="#ff6b6b"/>'
  + '<circle cx="286" cy="226" r="13" fill="#ffd166"/>'
  + '<path d="M132 250h248a124 124 0 0 1-248 0z" fill="#ffffff"/>'
  + '<rect x="150" y="240" width="212" height="20" rx="10" fill="#FDF0E8"/>'
  + '</svg>';

/**
 * PWA web app manifest, served at /manifest.json.
 * display:standalone + the icon below let iOS/Android users "Add to Home Screen".
 */
function buildManifest() {
  return JSON.stringify({
    name: 'NutriPair',
    short_name: 'NutriPair',
    description: 'Liste de courses + planning repas partagé pour deux.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FEFAE0',
    theme_color: BRAND_COLOR,
    lang: 'fr',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
    ]
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  HTML BUILDERS  (split for readability — composed by buildHTML)
// ─────────────────────────────────────────────────────────────────────────────

/** @returns {string} contents of the <style> block. */
function buildCSS() {
  return `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
/* ════ NutriPair Design System — Foundations v1.0 (imported from claude.ai/design) ════ */
:root{
  /* Brand */
  --color-primary:#C85A2A;--color-primary-light:#FDF0E8;--color-primary-hover:#AD4B22;
  --color-secondary:#3D6B35;--color-secondary-light:#EAF3E8;--color-secondary-hover:#32582C;
  /* Neutrals & surfaces */
  --color-bg:#FEFAE0;--color-surface:#FFFFF5;--color-surface-sunken:#F7EFD6;
  --color-border:#E0D4B8;--color-border-strong:#CBB88F;--color-text:#2C1810;--color-text-muted:#7A5C4A;
  /* Semantic states */
  --color-success:#4F8A3E;--color-success-light:#E8F2E3;--color-warning:#E0A52E;--color-warning-light:#FBF1DA;
  --color-danger:#C0392B;--color-danger-light:#FBEAE7;--color-info:#2F7E7A;--color-info-light:#E2F0EF;
  /* Dark navigation — the brand signature */
  --color-dark:#2C1810;--color-dark-elevated:#3B2418;--color-on-dark:#FEFAE0;--color-on-dark-muted:#9C8166;
  /* Typography */
  --font-display:'Helvetica Neue',Helvetica,Arial,sans-serif;
  --font-body:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --font-label:var(--font-body);
  --weight-regular:400;--weight-medium:500;--weight-semibold:600;--weight-bold:700;
  --text-2xl:36px;--text-xl:28px;--text-lg:22px;--text-md:18px;--text-base:15px;--text-sm:13px;--text-xs:11px;
  /* Spacing (4px grid) */
  --space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;--space-6:24px;--space-7:32px;--space-8:40px;--space-9:48px;--space-10:64px;
  /* Radius */
  --radius-sm:6px;--radius-md:12px;--radius-lg:20px;--radius-full:9999px;
  /* Shadows (warm brown-tinted, never cold gray) */
  --shadow-sm:0 1px 2px rgba(44,24,16,.06),0 1px 3px rgba(44,24,16,.08);
  --shadow-md:0 4px 14px rgba(44,24,16,.10);
  --shadow-lg:0 16px 40px rgba(44,24,16,.18);
  /* Motion */
  --duration-fast:150ms;--duration-base:250ms;--duration-slow:400ms;
  --ease-standard:cubic-bezier(.4,0,.2,1);--ease-out:cubic-bezier(.16,1,.3,1);--ease-bounce:cubic-bezier(.34,1.56,.64,1);
  /* Legacy aliases → canonical tokens (keep existing rules on the system) */
  --orange:var(--color-primary);--orange-light:var(--color-primary-light);--orange-dark:var(--color-primary-hover);
  --green:var(--color-secondary);--green-light:var(--color-secondary-light);
  --blue:var(--color-info);--blue-light:var(--color-info-light);
  --red:var(--color-danger);
  --gray:var(--color-text-muted);--gray-light:var(--color-surface-sunken);
  --border:var(--color-border);--text:var(--color-text);--text2:var(--color-text-muted);
  --white:var(--color-surface);--bg:var(--color-bg);
  --radius:var(--radius-md);--shadow:var(--shadow-sm)
}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);min-height:100dvh;overflow-x:hidden}
/* Editorial grotesque for display headers (foundations §02 Typography) */
.overlay-title,.app-title,.hero-count,.today-day,.day-name,.today-meal-name,.recipe-card-title,.modal-title{font-family:var(--font-display)}
.overlay{position:fixed;inset:0;background:var(--bg);z-index:400;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
.overlay.hidden{display:none}
.overlay-card{background:var(--white);border-radius:20px;padding:32px 28px;width:100%;max-width:360px;box-shadow:var(--shadow);display:flex;flex-direction:column;align-items:center;gap:14px;border:1.5px solid var(--border)}
.overlay-icon{font-size:40px;line-height:1}
.overlay-title{font-size:28px;font-weight:900;text-align:center;letter-spacing:-.5px}
.overlay-rule{width:40px;height:2px;background:var(--orange);border-radius:2px}
.overlay-sub{font-size:14px;color:var(--text2);text-align:center;line-height:1.5}
.lang-row{display:flex;gap:8px}
.lang-btn{padding:6px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--white);font-size:13px;font-weight:600;cursor:pointer;color:var(--text2)}
.lang-btn.active{border-color:var(--orange);background:var(--orange-light);color:var(--orange)}
.name-btn{display:block;width:100%;padding:17px;border-radius:14px;font-size:18px;font-weight:700;cursor:pointer;border:none;letter-spacing:.3px}
.name-martin{background:var(--orange);color:#fff}
.name-giulia{background:var(--green);color:#fff}
.name-other{background:var(--gray-light);color:var(--text);border:1.5px solid var(--border)}
.custom-row{display:none;flex-direction:column;gap:8px;width:100%}
.custom-row input{width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:16px;outline:none;background:var(--color-surface-sunken)}
.custom-row input:focus{border-color:var(--orange)}
.custom-row .ok-btn{background:var(--orange);color:#fff;padding:12px;border-radius:10px;border:none;font-size:16px;font-weight:700;cursor:pointer}
#app{display:none;flex-direction:column;height:100dvh;overflow:hidden}
.header{background:var(--white);border-bottom:3px solid var(--orange);padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;min-height:48px}
.header-left{display:flex;align-items:center;gap:8px}
.logo{font-size:20px}.app-title{font-size:17px;font-weight:700}
.user-pill{background:var(--orange-light);color:var(--orange);padding:4px 10px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
.header-right{display:flex;align-items:center;gap:6px}
.sync-dot{width:7px;height:7px;border-radius:50%;background:#ccc;flex-shrink:0}
.sync-dot.ok{background:var(--green)}.sync-dot.syncing{background:#f59e0b;animation:pulse 1s infinite}
.sync-label{font-size:11px;color:var(--text2)}
.hdr-lang{display:flex;gap:4px}
.hdr-lang button{padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--white);font-size:11px;font-weight:600;cursor:pointer;color:var(--text2)}
.hdr-lang button.active{border-color:var(--orange);background:var(--orange-light);color:var(--orange)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.tab-content{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
.panel{display:none;padding-bottom:90px}.panel.active{display:block}
.tab-bar{position:fixed;bottom:0;left:0;right:0;background:var(--color-dark);border-top:1px solid var(--color-dark-elevated);display:flex;padding-bottom:env(safe-area-inset-bottom);z-index:100}
.tab-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 4px 6px;border:none;background:none;cursor:pointer;gap:3px;color:var(--color-on-dark-muted);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px}
.tab-btn svg{width:22px;height:22px;padding:5px 14px;border-radius:var(--radius-full);box-sizing:content-box}
.tab-btn.active{color:var(--color-primary-light);font-weight:700}.tab-btn.active svg{background:rgba(200,90,42,.22)}
.grocery-header{padding:12px 16px;background:var(--white);position:sticky;top:0;z-index:10}
.hero-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.hero-count{font-size:44px;font-weight:var(--weight-bold);letter-spacing:-1.5px;line-height:1}
.uncheck-link{font-size:12px;color:var(--text2);background:none;border:none;cursor:pointer;padding:4px;text-decoration:underline;white-space:nowrap}
.hero-sub{font-size:var(--text-sm);color:var(--text2);line-height:1.4;margin:3px 0 16px}
.progress-bar{height:12px;background:var(--color-surface-sunken);border-radius:var(--radius-full);overflow:hidden}
.progress-fill{height:100%;background:var(--color-primary);border-radius:var(--radius-full);transition:width var(--duration-base) var(--ease-out)}
.section-title{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);margin:14px 12px 8px}
.sec-emoji{font-size:20px;line-height:1;flex-shrink:0}
.sec-name{flex:1;min-width:0;font-family:var(--font-display);font-size:16px;font-weight:700;letter-spacing:-.3px;color:var(--text)}
.sec-count{flex-shrink:0;font-size:11px;font-weight:700;color:var(--color-primary);background:var(--color-primary-light);padding:5px 9px;border-radius:var(--radius-full);min-width:24px;text-align:center}
.sec-count.done{color:var(--text2);background:var(--white);border:1px solid var(--border)}
.section-done{opacity:.5}
.checked-collapse-row{padding:10px 16px;font-size:12px;color:var(--text2);cursor:pointer;background:var(--color-surface-sunken);border:1px solid var(--border);border-radius:var(--radius-md);margin:0 12px 8px}
.item-right-top{display:flex;align-items:center;gap:8px}
.mi-edit-cat{opacity:.55}
.item-price[data-price-id]{cursor:pointer;border-bottom:1px dashed var(--border)}
.price-input{width:60px;border:none;border-bottom:2px solid var(--orange);background:transparent;font-size:13px;font-weight:600;text-align:right;color:var(--text);outline:none}
.manual-actions{display:flex;gap:6px;margin-bottom:2px}
.mi-btn{background:none;border:none;font-size:15px;line-height:1;cursor:pointer;padding:2px;flex-shrink:0}
.manual-tag{font-size:9px;font-weight:700;color:var(--orange);background:var(--orange-light);padding:1px 5px;border-radius:8px;text-transform:uppercase;letter-spacing:.3px;margin-left:4px}
.cat-select{width:100%;padding:11px 13px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;outline:none;font-family:inherit;margin-bottom:12px;background:var(--color-surface-sunken);color:var(--text)}
.cat-select:focus{border-color:var(--orange)}
.item-row{display:flex;align-items:center;gap:14px;padding:12px 16px;min-height:56px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);box-shadow:var(--shadow-sm);margin:0 12px 8px;cursor:pointer;user-select:none;transition:opacity .3s ease,background-color .3s ease}
.item-row.done{border-color:#cfe3ca}
.item-row.done{background:var(--color-success-light)}
.item-row.flash{animation:rowflash .6s ease}
@keyframes rowflash{0%{background:var(--color-success-light)}55%{background:var(--color-success-light)}100%{background:var(--white)}}
.check-circle{width:26px;height:26px;border-radius:var(--radius-full);border:2px solid var(--color-border-strong);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:background var(--duration-fast) var(--ease-bounce),transform var(--duration-fast) var(--ease-bounce)}
.check-circle.checked{background:var(--color-success);border-color:var(--color-success);transform:scale(1.1)}
.check-circle svg{opacity:0}.check-circle.checked svg{opacity:1}
.item-info{flex:1;min-width:0}.item-name{font-size:15px;font-weight:500;line-height:1.3}
.item-row.done .item-name{text-decoration:line-through;color:var(--gray)}
.item-qty{font-size:12px;color:var(--text2);margin-top:1px}
.item-right{display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0}
.item-price{font-size:15px;font-weight:600;flex-shrink:0}.item-row.done .item-price{text-decoration:line-through;color:var(--gray)}.checked-by{font-size:11px;color:var(--color-success);font-weight:600}
.badge{font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px}
.badge-vert{background:#dcfce7;color:#16a34a}.badge-bleu{background:#dbeafe;color:#2563eb}
.badge-rouge{background:#fee2e2;color:#dc2626}.badge-violet{background:#ede9fe;color:#7c3aed}
.fab-add{position:fixed;bottom:calc(72px + env(safe-area-inset-bottom) + 12px);right:16px;z-index:90;width:62px;height:62px;background:var(--color-primary);color:#fff;font-size:34px;font-weight:300;line-height:62px;text-align:center;border:none;border-radius:var(--radius-full);box-shadow:0 16px 40px rgba(200,90,42,.36);cursor:pointer;padding:0}
.fab-fav{position:fixed;bottom:calc(72px + env(safe-area-inset-bottom) + 92px);right:16px;z-index:90;width:48px;height:48px;background:var(--color-surface);color:var(--color-primary);font-size:20px;line-height:48px;text-align:center;border:1px solid var(--color-border);border-radius:var(--radius-full);box-shadow:var(--shadow-md);cursor:pointer;padding:0}
.fav-modal{max-height:80dvh;display:flex;flex-direction:column}
.fav-search{width:100%;padding:10px 13px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;margin-bottom:12px;background:var(--color-surface-sunken);color:var(--text);outline:none}
.fav-search:focus{border-color:var(--orange)}
.fav-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;margin-bottom:12px}
.fav-group{position:sticky;top:0;background:var(--white);font-size:11px;font-weight:800;color:var(--orange);text-transform:uppercase;letter-spacing:.6px;padding:8px 0 4px;z-index:1}
.fav-item-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.fav-item-info{min-width:0}
.fav-item-name{font-size:15px;font-weight:600;line-height:1.3}
.fav-item-meta{font-size:12px;color:var(--text2);margin-top:1px}
.fav-add-btn{background:var(--orange);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:700;cursor:pointer;flex-shrink:0}
.fav-add-btn:disabled{background:var(--green);opacity:.9}
.fav-empty{padding:24px 0;text-align:center;color:var(--text2);font-size:14px}
.recipe-new-btn{display:block;width:calc(100% - 24px);margin:12px;padding:13px;border-radius:12px;border:1.5px dashed var(--orange);background:var(--orange-light);color:var(--orange);font-size:15px;font-weight:700;cursor:pointer;text-align:center}
.recipe-card{display:flex;flex-direction:column;background:var(--white);border-radius:16px;margin:8px 12px;border:1px solid var(--border);box-shadow:var(--shadow-md);overflow:hidden}
.recipe-card-body{padding:16px 18px 18px;min-width:0}
.recipe-thumb{width:100%;height:120px;object-fit:cover;flex-shrink:0}
.recipe-emoji{width:100%;height:120px;font-size:52px;display:flex;align-items:center;justify-content:center;background:var(--orange-light);flex-shrink:0}
.recipe-emoji.placeholder{background:var(--gray-light);color:var(--text2)}
.rec-emoji-picks{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.emoji-pick{font-size:22px;line-height:1;width:40px;height:40px;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;cursor:pointer;padding:0}
.recipe-pick-section{margin-bottom:12px}
.recipe-pick-toggle{width:100%;text-align:left;background:var(--orange-light);color:var(--orange);border:1.5px solid var(--orange);border-radius:10px;padding:9px 12px;font-size:13px;font-weight:700;cursor:pointer}
.recipe-pick-wrap{margin-top:8px}
.recipe-pick-row{display:flex;gap:8px;overflow-x:auto;padding:4px 0 8px;-webkit-overflow-scrolling:touch}
.recipe-pick-card{flex-shrink:0;width:100px;border-radius:10px;border:1.5px solid var(--border);background:var(--white);padding:8px;text-align:center;cursor:pointer}
.recipe-pick-card.selected{border-color:var(--orange);background:var(--orange-light)}
.recipe-pick-emoji{font-size:24px;margin-bottom:4px}
.recipe-pick-name{font-size:11px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.recipe-pick-check{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;cursor:pointer}
.recipe-card-title{font-size:var(--text-md);font-weight:700;letter-spacing:-.3px;margin-bottom:6px}
.recipe-card-meta{font-size:var(--text-sm);color:var(--text2);line-height:1.3;margin-bottom:14px}
.recipe-add-btn{background:var(--orange);color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer;width:100%}
.recipe-actions{display:flex;gap:8px;margin-top:8px}
.recipe-actions button{flex:1;background:var(--white);border:1.5px solid var(--border);border-radius:8px;padding:8px;font-size:15px;cursor:pointer}
.recipe-modal{max-height:85dvh;display:flex;flex-direction:column}
.recipe-modal #recIngredients{overflow-y:auto;-webkit-overflow-scrolling:touch}
.rec-ing-row{display:flex;gap:6px;align-items:center;margin-bottom:8px}
.rec-ing-row input,.rec-ing-row select{width:auto;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;background:var(--color-surface-sunken);color:var(--text);outline:none;min-width:0;margin:0}
.rec-ing-row input:focus,.rec-ing-row select:focus{border-color:var(--orange)}
.rec-ing-name{flex:2}
.rec-ing-qty{flex:1}
.rec-ing-cat{flex:1.4}
.rec-ing-del{flex-shrink:0;background:none;border:none;font-size:22px;color:var(--red);cursor:pointer;padding:0 4px;line-height:1}
.rec-add-ing{background:none;border:1.5px dashed var(--border);border-radius:8px;padding:8px;font-size:13px;font-weight:600;color:var(--text2);cursor:pointer;width:100%;margin-bottom:12px}
.plan-bar{background:var(--white)}
.plan-bar-top{display:flex;align-items:center;justify-content:space-between;padding:8px 16px}
.plan-title{font-size:15px;font-weight:800}
.view-toggle{background:var(--orange-light);color:var(--orange);border:1.5px solid var(--orange);border-radius:8px;padding:5px 14px;font-size:12px;font-weight:700;cursor:pointer}
.week-nav{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--white);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}
.week-nav-btn{background:none;border:1.5px solid var(--border);border-radius:8px;padding:4px 12px;font-size:18px;cursor:pointer;color:var(--text)}
.week-label{font-size:13px;font-weight:700;color:var(--text);text-align:center}
.month-head{padding:10px 16px;font-size:13px;font-weight:800;color:var(--text);text-transform:capitalize;border-bottom:1px solid var(--border);background:var(--white);text-align:center;position:sticky;top:0;z-index:10}
.month-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:8px 12px}
.month-wd{font-size:10px;font-weight:700;color:var(--text2);text-transform:uppercase;text-align:center;padding-bottom:2px}
.month-cell{aspect-ratio:1;border-radius:6px;background:var(--white);border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;font-weight:600;cursor:pointer;color:var(--text)}
.month-cell.out{opacity:.35}
.month-cell.today{border-color:var(--orange);color:var(--orange)}
.month-dots{display:flex;flex-wrap:wrap;justify-content:center;max-width:22px;margin-top:2px}
.month-dot{width:5px;height:5px;border-radius:50%;margin:1px}
.day-card{margin:8px 12px;border-radius:14px;background:var(--white);box-shadow:var(--shadow-sm);overflow:hidden;scroll-margin-top:52px;border:1px solid var(--border)}
.day-card.today-card{border-color:var(--color-primary)}
.day-card.today-card .day-header{background:var(--color-primary-light);border-bottom:1px solid #f3d8c6}
.day-header{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;min-height:52px;cursor:pointer;user-select:none}
.day-name{font-weight:700;font-size:16px;letter-spacing:-.3px}.day-date{font-size:13px;font-weight:500;color:var(--text2)}
.today-badge{font-size:9px;font-weight:600;color:#fff;background:var(--color-primary);padding:5px 8px;border-radius:var(--radius-full);text-transform:uppercase;letter-spacing:1px}
.day-chevron{font-size:12px;color:var(--gray);transition:transform .2s}
.day-body{display:none;border-top:1px solid var(--border)}.day-card.open .day-body{display:block}.day-card.open .day-chevron{transform:rotate(180deg)}
.meal-row{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);cursor:pointer}
.meal-row:last-child{border-bottom:none}.meal-slot-label{font-size:11px;font-weight:700;color:var(--gray);text-transform:uppercase;width:68px;flex-shrink:0;padding-top:2px}
.meal-info{flex:1;min-width:0}.meal-name{font-size:14px;font-weight:500;line-height:1.3}
.meal-detail{font-size:12px;color:var(--text2);margin-top:2px;line-height:1.4}
.meal-time{font-size:11px;color:var(--gray);margin-top:2px}
.meal-type-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:5px}
.dot-prep{background:#8b5cf6}.dot-cook{background:var(--orange)}.dot-batch{background:var(--green)}.dot-free{background:var(--gray)}
.today-header{padding:16px 16px 12px;background:var(--white);border-bottom:1px solid var(--border)}
.today-day{font-size:26px;font-weight:900;letter-spacing:-.5px}.today-date{font-size:14px;color:var(--text2);margin-top:2px}
.today-tagline{font-size:13px;color:var(--text2);margin-top:4px;font-weight:600}
.today-meals{padding:12px}
.today-meal-card{background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 18px;margin-bottom:12px;box-shadow:var(--shadow-sm)}
.today-meal-card[data-type="prep"]{border-left:5px solid #8b5cf6}
.today-meal-card[data-type="cook"]{border-left:5px solid var(--color-primary)}
.today-meal-card[data-type="batch"]{border-left:5px solid var(--color-secondary)}
.today-meal-card[data-type="free"]{border-left:5px solid var(--color-text-muted)}
.today-slot-label{font-size:10px;font-weight:600;color:var(--color-primary);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px}
.today-meal-name{font-size:16px;font-weight:600;margin-bottom:4px;line-height:1.2}
.today-meal-detail{font-size:13px;color:var(--text2);line-height:1.5}
.today-meal-time{font-size:12px;color:var(--gray);margin-top:6px;font-weight:600}
.modal-overlay{position:fixed;inset:0;background:rgba(44,24,16,.5);z-index:200;display:none;align-items:flex-end;justify-content:center}
.modal-overlay.open{display:flex}
.modal{background:var(--white);border-radius:var(--radius-lg) var(--radius-lg) 0 0;padding:14px 22px;width:100%;max-width:520px;padding-bottom:calc(24px + env(safe-area-inset-bottom));box-shadow:var(--shadow-lg)}
.modal-title{font-size:19px;font-weight:700;letter-spacing:-.3px;margin-bottom:18px}
.modal label{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--text2);display:block;margin-bottom:8px}
.modal input,.modal textarea{width:100%;padding:13px 14px;border:1px solid var(--border);border-radius:10px;font-size:15px;outline:none;font-family:inherit;margin-bottom:12px;background:var(--color-surface-sunken)}
.modal input:focus,.modal textarea:focus{border-color:var(--orange)}
.modal textarea{height:70px;resize:none}
.modal-btns{display:flex;gap:10px;margin-top:4px}
.modal-save{flex:2;background:var(--color-primary);color:#fff;padding:14px;border-radius:var(--radius-md);border:none;font-size:15px;font-weight:600;cursor:pointer}
.modal-cancel{flex:1;padding:14px 20px;border-radius:var(--radius-md);border:1px solid var(--border);background:var(--white);font-size:15px;font-weight:600;cursor:pointer;color:var(--text2)}
.toast{position:fixed;left:50%;bottom:88px;transform:translateX(-50%) translateY(16px);background:var(--color-dark);color:var(--color-on-dark);padding:13px 20px;border-radius:var(--radius-full);font-size:14px;font-weight:500;box-shadow:var(--shadow-lg);opacity:0;pointer-events:none;transition:opacity var(--duration-base) var(--ease-out),transform var(--duration-base) var(--ease-out);z-index:500;max-width:90%;text-align:center}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast.err{background:var(--color-danger)}
.pf-card{background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);box-shadow:var(--shadow-sm);margin:8px 12px;padding:16px}
.pf-head{display:flex;align-items:center;gap:14px}
.pf-av{width:48px;height:48px;border-radius:var(--radius-full);background:var(--color-primary);color:#fff;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pf-av.sm{width:30px;height:30px;font-size:12px}
.pf-name{font-family:var(--font-display);font-size:18px;font-weight:700;letter-spacing:-.3px}
.pf-email{font-size:13px;color:var(--text2)}
.pf-lbl{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--text2);margin-bottom:10px}
.pf-members{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.pf-member{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:500}
.pf-btn{width:100%;background:var(--color-primary);color:#fff;border:none;border-radius:var(--radius-md);padding:13px;font-size:15px;font-weight:700;cursor:pointer}
.pf-btn.danger{background:var(--white);color:var(--color-danger);border:1.5px solid var(--border)}
.pf-chips{display:flex;gap:8px}
.pf-chip{flex:1;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:10px;font-size:14px;font-weight:600;color:var(--text2);cursor:pointer}
.pf-chip.on{border-color:var(--color-primary);background:var(--color-primary-light);color:var(--color-primary)}
.pf-invite{display:flex;gap:8px;margin-top:10px}
.pf-invite input{flex:1;min-width:0;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--color-surface-sunken);font-size:12px;color:var(--text)}
.pf-copy{background:var(--color-primary);color:#fff;border:none;border-radius:10px;padding:0 14px;font-size:13px;font-weight:700;cursor:pointer;flex-shrink:0}
.pf-hint{font-size:11px;color:var(--text2);margin-top:6px}
`;
}

/** @returns {string} the name / language selection overlay markup. */
function buildOverlay() {
  return `
<div id="overlay" class="overlay">
  <div class="overlay-card">
    <div class="overlay-icon">🥗</div>
    <div class="overlay-title">NutriPair</div>
    <div class="overlay-rule"></div>
    <div class="lang-row">
      <button class="lang-btn active" data-lang="fr">🇫🇷 FR</button>
      <button class="lang-btn" data-lang="en">🇬🇧 EN</button>
      <button class="lang-btn" data-lang="ro">🇷🇴 RO</button>
    </div>
    <div class="overlay-sub" id="overlaySub">Qui est aux courses ou en train de consulter le planning ?</div>
    <button class="name-btn name-martin" id="btnMartin">Martin</button>
    <button class="name-btn name-giulia" id="btnGiulia">Giulia</button>
    <button class="name-btn name-other" id="btnOther">Autre prénom…</button>
    <div class="custom-row" id="customRow">
      <input type="text" id="customInput" placeholder="Prénom" maxlength="20" autocomplete="off">
      <button class="ok-btn" id="btnCustomOk">OK</button>
    </div>
  </div>
</div>`;
}

/** @returns {string} the main #app shell (header, panels, bottom tab bar). */
function buildApp() {
  return `
<div id="app">
  <div class="header">
    <div class="header-left">
      <span class="logo">🥗</span>
      <span class="app-title">NutriPair</span>
    </div>
    <div class="header-right">
      <div class="hdr-lang">
        <button data-hlang="fr" class="active">FR</button>
        <button data-hlang="en">EN</button>
        <button data-hlang="ro">RO</button>
      </div>
      <div class="sync-dot" id="syncDot"></div>
      <span class="sync-label" id="syncLabel"></span>
      <div class="user-pill" id="userPill">—</div>
    </div>
  </div>

  <div class="tab-content">
    <div class="panel active" id="panelCourses">
      <div class="grocery-header">
        <div class="hero-top">
          <div class="hero-count" id="totalSub">0 / 47</div>
          <button class="uncheck-link" id="uncheckAllBtn">Tout décocher</button>
        </div>
        <div class="hero-sub" id="totalPrice">0 RON / 0 RON</div>
        <div class="progress-bar"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>
      </div>
      <div id="groceryList"></div>
      <button class="fab-fav" id="favBtn" aria-label="Accès rapide">⚡</button>
      <button class="fab-add" id="addItemBtn" aria-label="Ajouter un article">+</button>
    </div>

    <div class="panel" id="panelPlanning">
      <div class="plan-bar">
        <div class="plan-bar-top">
          <span class="plan-title">Planning</span>
          <button class="view-toggle" id="viewToggle">Mois</button>
        </div>
        <div class="week-nav" id="weekNav">
          <button class="week-nav-btn" id="weekPrev">&#8592;</button>
          <span class="week-label" id="weekLabel">—</span>
          <button class="week-nav-btn" id="weekNext">&#8594;</button>
        </div>
      </div>
      <div id="planningList"></div>
    </div>

    <div class="panel" id="panelToday">
      <div class="today-header">
        <div class="today-day" id="todayDayName">—</div>
        <div class="today-date" id="todayDateStr">—</div>
        <div class="today-tagline">4 repas · batch cook disponible</div>
      </div>
      <div class="today-meals" id="todayMeals"></div>
    </div>

    <div class="panel" id="panelRecipes">
      <div id="recipesList"></div>
    </div>

    <div class="panel" id="panelProfile">
      <div id="profileBody"></div>
    </div>
  </div>

  <div class="tab-bar">
    <button class="tab-btn active" data-tab="panelCourses" id="tabCourses">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span id="navShopLabel">Courses</span>
    </button>
    <button class="tab-btn" data-tab="panelPlanning" id="tabPlanning">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span id="navPlanLabel">Planning</span>
    </button>
    <button class="tab-btn" data-tab="panelRecipes" id="tabRecipes">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      <span id="navRecipesLabel">Recettes</span>
    </button>
    <button class="tab-btn" data-tab="panelToday" id="tabToday">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <span id="navTodayLabel">Aujourd'hui</span>
    </button>
    <button class="tab-btn" data-tab="panelProfile" id="tabProfile">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span id="navProfileLabel">Profil</span>
    </button>
  </div>
</div>`;
}

/** @returns {string} the add-item and edit-meal modal sheets + the toast element. */
function buildModals() {
  return `
<div class="modal-overlay" id="addModal">
  <div class="modal">
    <div class="sheet-handle" style="width:40px;height:5px;background:var(--color-border);border-radius:var(--radius-full);margin:0 auto 18px"></div>
    <div class="modal-title" id="addModalTitle">Ajouter un article</div>
    <label>Nom</label><input type="text" id="addName" autocomplete="off">
    <label>Quantité</label><input type="text" id="addQty" autocomplete="off">
    <div class="modal-btns">
      <button class="modal-cancel" id="addCancelBtn">✕</button>
      <button class="modal-save" id="addSaveBtn">Ajouter</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="editModal">
  <div class="modal">
    <div class="sheet-handle" style="width:40px;height:5px;background:var(--color-border);border-radius:var(--radius-full);margin:0 auto 18px"></div>
    <div class="modal-title" id="editModalTitle">Modifier le repas</div>
    <div class="recipe-pick-section">
      <button type="button" class="recipe-pick-toggle" id="recipePickToggle">📖 Choisir depuis les recettes</button>
      <div class="recipe-pick-wrap" id="recipePickWrap" style="display:none">
        <div class="recipe-pick-row" id="recipePickRow"></div>
        <label class="recipe-pick-check" id="recipeAddIngWrap" style="display:none"><input type="checkbox" id="recipeAddIngredients" checked> <span id="recipeAddIngText">🛒 Ajouter les ingrédients à la liste</span></label>
      </div>
    </div>
    <label>Nom du repas</label><input type="text" id="editMealName" autocomplete="off">
    <label>Détails</label><textarea id="editMealDetail"></textarea>
    <label>Temps</label><input type="text" id="editMealTime" autocomplete="off">
    <input type="hidden" id="editDay">
    <input type="hidden" id="editSlot">
    <div class="modal-btns">
      <button class="modal-cancel" id="editCancelBtn">✕</button>
      <button class="modal-save" id="editSaveBtn">Enregistrer</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="recipeModal">
  <div class="modal recipe-modal">
    <div class="sheet-handle" style="width:40px;height:5px;background:var(--color-border);border-radius:var(--radius-full);margin:0 auto 18px"></div>
    <div class="modal-title" id="recipeModalTitle">Nouvelle recette</div>
    <label id="recNameLabel">Nom de la recette</label><input type="text" id="recName" autocomplete="off">
    <label id="recServLabel">Portions</label><input type="number" id="recServings" value="2" min="1">
    <label id="recImageLabel">Image</label>
    <input type="text" id="recImage" placeholder="https://... ou emoji ex: 🍝" autocomplete="off">
    <div class="rec-emoji-picks" id="recEmojiPicks">
      <button type="button" class="emoji-pick" data-emoji="🍝">🍝</button>
      <button type="button" class="emoji-pick" data-emoji="🥗">🥗</button>
      <button type="button" class="emoji-pick" data-emoji="🍳">🍳</button>
      <button type="button" class="emoji-pick" data-emoji="🥩">🥩</button>
      <button type="button" class="emoji-pick" data-emoji="🐟">🐟</button>
      <button type="button" class="emoji-pick" data-emoji="🥘">🥘</button>
      <button type="button" class="emoji-pick" data-emoji="🍲">🍲</button>
      <button type="button" class="emoji-pick" data-emoji="🥙">🥙</button>
      <button type="button" class="emoji-pick" data-emoji="🍜">🍜</button>
      <button type="button" class="emoji-pick" data-emoji="🥧">🥧</button>
      <button type="button" class="emoji-pick" data-emoji="🍰">🍰</button>
      <button type="button" class="emoji-pick" data-emoji="🫙">🫙</button>
    </div>
    <label id="recIngLabel">Ingrédients</label>
    <div id="recIngredients"></div>
    <button class="rec-add-ing" id="recAddIng" type="button">+ Ingrédient</button>
    <div class="modal-btns">
      <button class="modal-cancel" id="recCancelBtn">✕</button>
      <button class="modal-save" id="recSaveBtn">Enregistrer</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="favModal">
  <div class="modal fav-modal">
    <div class="sheet-handle" style="width:40px;height:5px;background:var(--color-border);border-radius:var(--radius-full);margin:0 auto 18px"></div>
    <div class="modal-title" id="favModalTitle">⚡ Accès rapide</div>
    <input type="text" class="fav-search" id="favSearch" placeholder="Rechercher…" autocomplete="off">
    <div class="fav-list" id="favList"></div>
    <div class="modal-btns">
      <button class="modal-cancel" id="favCloseBtn">✕</button>
    </div>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

/**
 * @returns {string} the browser-side application script.
 * All DATA is injected as JSON; everything else uses string concatenation
 * (never template literals) so the embedded <script> needs no escaping.
 */
function buildScript() {
  const groceryJSON   = JSON.stringify(GROCERY_DATA);
  const i18nJSON      = JSON.stringify(I18N);
  const planJSON      = JSON.stringify(DEFAULT_PLAN);
  const favoritesJSON = JSON.stringify(FAVORITES_DATA);
  const recipesJSON   = JSON.stringify(DEFAULT_RECIPES);

  return `
var GROCERY = ${groceryJSON};
var I18N    = ${i18nJSON};
var DEFAULT_PLAN = ${planJSON};
var FAVORITES = ${favoritesJSON};
var DEFAULT_RECIPES = ${recipesJSON};
var DAYS  = ['lun','mar','mer','jeu','ven','sam','dim'];
var SLOTS = ['breakfast','lunch','snack','dinner'];

var user = '';
var lang = 'fr';
var T    = I18N.fr;
var state = {checked:{}, manualItems:[], plan:{}, resetAt:null};
var pollTimer = null;
var lastRenderHash = '';   // perf: skip renderAll() when state is unchanged
var togglePending = {};    // bug: debounce double-taps on the same grocery row
var toastTimer = null;
var checkedExpanded = {};  // per-section reveal state for the collapsed "N cochés" rows
var currentWeek = '';      // ISO week key currently shown in the Planning tab
var planView = 'week';     // 'week' | 'month'
var editWeek = '';         // week captured when the edit-meal modal opens
var pendingScrollDay = null;
var addModalItemId = null; // target id for the add/edit-item modal (null when adding)
var addModalMode = 'add';  // 'add' | 'manual' | 'catalog'
var editingRecipeId = null; // null = new recipe, else the recipe id being edited
var priceEditing = false;   // true while a price input is open (blocks poll re-render)
var selectedRecipeForMeal = null; // recipe chosen in the edit-meal modal (or null)
var favCatalog = [];        // last-rendered merged quick-add catalog (for add lookup)

function ge(id){ return document.getElementById(id); }

// ── TOAST ──
function showToast(msg, isErr){
  var t = ge('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' err' : '');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.className = 'toast' + (isErr ? ' err' : ''); }, 1800);
}

// ── LANGUAGE ──
function setLang(l) {
  if (!I18N[l]) return;
  lang = l;
  T    = I18N[l];
  try { localStorage.setItem('np_lang', l); } catch(e) {}
  updateLangUI();
}

function updateLangUI() {
  ge('overlaySub').textContent       = T.nameSub;
  ge('uncheckAllBtn').textContent    = T.uncheckAll;
  ge('addModalTitle').textContent    = T.addTitle;
  ge('addName').placeholder          = T.addNamePh;
  ge('addQty').placeholder           = T.addQtyPh;
  ge('addSaveBtn').textContent       = T.addSave;
  ge('editModalTitle').textContent   = T.editTitle;
  ge('editMealName').placeholder     = T.editNamePh;
  ge('editMealDetail').placeholder   = T.editDetailPh;
  ge('editMealTime').placeholder     = T.editTimePh;
  ge('editSaveBtn').textContent      = T.editSave;
  ge('navShopLabel').textContent     = T.navShop;
  ge('navPlanLabel').textContent     = T.navPlan;
  ge('navTodayLabel').textContent    = T.navToday;
  document.querySelectorAll('[data-lang]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-lang') === lang); });
  document.querySelectorAll('[data-hlang]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-hlang') === lang); });
}

// ── INIT ──
(function init() {
  try { var sl = localStorage.getItem('np_lang'); if (sl && I18N[sl]) { lang = sl; T = I18N[lang]; } } catch(e) {}
  try { var sw = localStorage.getItem('np_week'); if (sw) currentWeek = sw; } catch(e) {}
  if (!currentWeek) currentWeek = currentISOWeek();
  updateLangUI();

  // overlay lang buttons
  document.querySelectorAll('[data-lang]').forEach(function(btn) {
    btn.addEventListener('click', function(){ setLang(btn.getAttribute('data-lang')); });
  });
  // header lang buttons — force a re-render since strings changed but state did not
  document.querySelectorAll('[data-hlang]').forEach(function(btn) {
    btn.addEventListener('click', function(){ setLang(btn.getAttribute('data-hlang')); renderAll(true); });
  });

  // name presets
  ge('btnMartin').addEventListener('click', function(){ setUser('Martin'); });
  ge('btnGiulia').addEventListener('click', function(){ setUser('Giulia'); });
  ge('btnOther').addEventListener('click', function(){
    ge('customRow').style.display = 'flex';
    ge('btnOther').style.display  = 'none';
    ge('customInput').focus();
  });
  ge('btnCustomOk').addEventListener('click', function(){ setUser(ge('customInput').value); });
  ge('customInput').addEventListener('keydown', function(e){ if (e.key === 'Enter') setUser(ge('customInput').value); });

  // user pill → back to name screen
  ge('userPill').addEventListener('click', function(){
    try { localStorage.removeItem('np_user'); } catch(e) {}
    user = '';
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    ge('app').style.display = 'none';
    ge('overlay').classList.remove('hidden');
    ge('customRow').style.display = 'none';
    ge('btnOther').style.display  = 'block';
    ge('customInput').value = '';
  });

  // tabs
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function(){
      var tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      ge(tab).classList.add('active');
      if (tab === 'panelPlanning') scrollToToday();
      if (tab === 'panelProfile') renderProfile();
    });
  });

  // planning: week navigation + week/month view toggle (persistent controls)
  ge('viewToggle').addEventListener('click', function(){
    planView = (planView === 'week') ? 'month' : 'week';
    renderPlanning();
  });
  ge('weekPrev').addEventListener('click', function(){
    currentWeek = addWeeks(currentWeek, -1); saveWeek(); renderPlanning();
  });
  ge('weekNext').addEventListener('click', function(){
    currentWeek = addWeeks(currentWeek, 1); saveWeek(); renderPlanning();
  });

  // uncheck all
  ge('uncheckAllBtn').addEventListener('click', function(){
    if (!confirm(T.resetConfirm)) return;
    doReset();
  });

  // add item — inject the category <select> into the add-item modal once
  (function injectCategorySelect(){
    var modal = ge('addModal').querySelector('.modal');
    var btns  = modal.querySelector('.modal-btns');
    var lbl = document.createElement('label'); lbl.id = 'addCatLabel'; lbl.textContent = 'Catégorie';
    var sel = document.createElement('select'); sel.id = 'addCategory'; sel.className = 'cat-select';
    modal.insertBefore(lbl, btns);
    modal.insertBefore(sel, btns);
  })();
  ge('addItemBtn').addEventListener('click', openAddItem);
  ge('addCancelBtn').addEventListener('click', function(){ ge('addModal').classList.remove('open'); resetAddModal(); });
  ge('addSaveBtn').addEventListener('click', doAddItem);
  ge('addName').addEventListener('keydown', function(e){ if (e.key === 'Enter') doAddItem(); });
  ge('addModal').addEventListener('click', function(e){ if (e.target === this) { this.classList.remove('open'); resetAddModal(); } });

  // favorites quick-add modal
  ge('favBtn').addEventListener('click', openFavorites);
  ge('favCloseBtn').addEventListener('click', function(){ ge('favModal').classList.remove('open'); });
  ge('favModal').addEventListener('click', function(e){ if (e.target === this) this.classList.remove('open'); });
  ge('favSearch').addEventListener('input', renderFavorites);

  // edit meal
  ge('editCancelBtn').addEventListener('click', function(){ ge('editModal').classList.remove('open'); });
  ge('editSaveBtn').addEventListener('click', doEditMeal);
  ge('editModal').addEventListener('click', function(e){ if (e.target === this) this.classList.remove('open'); });

  // recipe modal
  ge('recAddIng').addEventListener('click', function(){
    ge('recIngredients').insertAdjacentHTML('beforeend', recIngRowHTML({}));
  });
  ge('recIngredients').addEventListener('click', function(e){
    var btn = e.target.closest ? e.target.closest('.rec-ing-del') : null;
    if (!btn) return;
    var row = btn.closest('.rec-ing-row');
    if (row && row.parentNode) row.parentNode.removeChild(row);
  });
  ge('recCancelBtn').addEventListener('click', function(){ ge('recipeModal').classList.remove('open'); editingRecipeId = null; });
  ge('recSaveBtn').addEventListener('click', saveRecipe);
  ge('recipeModal').addEventListener('click', function(e){ if (e.target === this) { this.classList.remove('open'); editingRecipeId = null; } });
  ge('recEmojiPicks').addEventListener('click', function(e){
    var btn = e.target.closest ? e.target.closest('.emoji-pick') : null;
    if (btn) ge('recImage').value = btn.getAttribute('data-emoji');
  });

  // meal-edit recipe picker
  ge('recipePickToggle').addEventListener('click', function(){
    var w = ge('recipePickWrap');
    w.style.display = (w.style.display === 'none') ? '' : 'none';
  });

  // poll faster when visible, slower when the tab is hidden
  document.addEventListener('visibilitychange', function(){
    if (!user) return;
    schedulePoll();
    if (!document.hidden) fetchState();
  });

  // check saved user
  try { var su = localStorage.getItem('np_user'); if (su) showApp(su); } catch(e) {}
})();

function setUser(name) {
  name = (name || '').trim();
  if (!name) return;
  try { localStorage.setItem('np_user', name); } catch(e) {}
  showApp(name);
}

function showApp(name) {
  user = name;
  ge('userPill').textContent = user;
  ge('overlay').classList.add('hidden');
  ge('app').style.display = 'flex';
  updateLangUI();
  startPoll();
  renderAll(true);
}

// ── SYNC ──
function setSyncState(s) {
  var dot = ge('syncDot');
  var lbl = ge('syncLabel');
  dot.className = 'sync-dot' + (s === 'ok' ? ' ok' : s === 'syncing' ? ' syncing' : '');
  lbl.textContent = s === 'ok' ? T.syncOk : s === 'syncing' ? T.syncIng : T.syncErr;
}
function startPoll() {
  fetchState();
  schedulePoll();
}
function schedulePoll() {
  if (pollTimer) clearInterval(pollTimer);
  // 3s when the tab is visible, 5s when hidden to save battery/requests
  pollTimer = setInterval(fetchState, document.hidden ? 5000 : 3000);
}
function fetchState() {
  setSyncState('syncing');
  fetch('/api/state')
    .then(function(r){ if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(function(d){ state = d; renderAll(); setSyncState('ok'); })
    .catch(function(){ setSyncState('err'); });
}

// Small JSON POST helper with a rejecting promise on any non-2xx response.
function apiPost(path, body) {
  return fetch(path, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: body ? JSON.stringify(body) : undefined
  }).then(function(r){ if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
}

// ── PLAN HELPERS ──
// ── ISO WEEK HELPERS (identical math to the Worker, UTC-based) ──
function isoWeekKey(date) {
  var d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + '-W' + (weekNo < 10 ? '0' : '') + weekNo;
}
function currentISOWeek() { return isoWeekKey(new Date()); }
function parseWeekKey(wk) {
  var parts = (wk || '').split('-W');
  return { year: parseInt(parts[0], 10), week: parseInt(parts[1], 10) };
}
// Monday (UTC midnight) of a given ISO week key.
function isoWeekMonday(year, week) {
  var jan4 = new Date(Date.UTC(year, 0, 4));
  var jan4Day = jan4.getUTCDay() || 7;
  var monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7);
  return monday;
}
function addWeeks(wk, n) {
  var p = parseWeekKey(wk);
  var mon = isoWeekMonday(p.year, p.week);
  mon.setUTCDate(mon.getUTCDate() + n * 7);
  return isoWeekKey(mon);
}
// {lun:Date, …} (UTC midnights) for the seven days of a week key.
function datesForWeek(wk) {
  var p = parseWeekKey(wk);
  var mon = isoWeekMonday(p.year, p.week);
  var out = {};
  DAYS.forEach(function(d, i) { var dt = new Date(mon); dt.setUTCDate(mon.getUTCDate() + i); out[d] = dt; });
  return out;
}
function typeColor(t) {
  return t === 'prep' ? '#8b5cf6' : t === 'cook' ? '#C85A2A' : t === 'batch' ? '#3D6B35' : '#7A5C4A';
}

// Return a complete plan for one week: every day + slot present, falling back to
// DEFAULT_PLAN for anything the server state is missing for that week.
function planForWeek(wk) {
  var plan = (state.plan && typeof state.plan === 'object') ? state.plan : {};
  var primary = (plan[wk] && typeof plan[wk] === 'object') ? plan[wk] : null;
  // When the requested week has no plan, fall back to the most recently edited
  // week (ISO week keys sort chronologically as strings, so max = most recent),
  // then DEFAULT_PLAN as the absolute last resort.
  var fb = null;
  if (!primary) {
    var keys = Object.keys(plan).filter(function(k){ return /^\d{4}-W\d{2}$/.test(k); }).sort();
    if (keys.length) fb = plan[keys[keys.length - 1]];
  }
  var out = {};
  DAYS.forEach(function(day) {
    var sp = (primary && primary[day]) ? primary[day] : {};
    var sf = (fb && fb[day]) ? fb[day] : {};
    var dd = {};
    SLOTS.forEach(function(slot) {
      var def = (DEFAULT_PLAN[day] && DEFAULT_PLAN[day][slot]) || {name:'—', detail:'', type:'free', time:''};
      dd[slot] = sp[slot] || sf[slot] || def;
    });
    out[day] = dd;
  });
  return out;
}

// ── RENDER ──
function renderAll(force) {
  // Don't let a background poll rebuild the list while a price input is open.
  if (!force && priceEditing) return;
  // Perf: skip the full re-render when the state is byte-identical to last paint.
  var h = JSON.stringify(state) + '|' + lang;
  if (!force && h === lastRenderHash) return;
  lastRenderHash = h;
  try { renderGrocery(); }  catch(e){ console.error('G', e); }
  try { renderPlanning(); } catch(e){ console.error('P', e); }
  try { renderToday(); }    catch(e){ console.error('T', e); }
  try { renderRecipes(); }  catch(e){ console.error('R', e); }
}

function getBadge(b) {
  if (!b) return '';
  var cls = (b === 'viande' || b === 'viande rouge') ? 'badge-rouge'
           : (b === 'oméga-3' || b === 'poisson gras') ? 'badge-bleu'
           : (b === 'probiotique') ? 'badge-violet'
           : 'badge-vert';
  return '<span class="badge ' + cls + '">' + b + '</span>';
}

// Resolve the in-store price for a grocery item: a user-edited price overrides
// the GROCERY_DATA default.
function priceOf(item) {
  return (state.prices && state.prices[item.id] !== undefined) ? state.prices[item.id] : item.price;
}

// Catalog item name in the current language (FR fallback). Used outside renderGrocery.
function gName(item) {
  return (lang === 'ro' && item.name_ro) ? item.name_ro
       : (lang === 'en' && item.name_en) ? item.name_en
       : item.name;
}

// Build a regular grocery item row. price is the resolved (possibly edited) price;
// it is rendered as a tap-to-edit element carrying data-price-id.
// Spec anatomy (Mobile · B): checkbox(26px) | content[name + meta] | price | action.
// Attribution ("· Giulia") folds into the meta line; row is centre-aligned.
function itemRowHTML(id, name, qty, badge, price, c) {
  var rc = 'item-row' + (c ? ' done' : '');
  var cc = 'check-circle' + (c ? ' checked' : '');
  var meta = qty + (c && c.by ? ' · ' + c.by : '');
  return '<div class="' + rc + '" data-id="' + id + '">'
       + '<div class="' + cc + '"><svg viewBox="0 0 13 10" fill="none" stroke="#fff" stroke-width="2"><polyline points="1.5,5 5,8.5 11.5,1.5"/></svg></div>'
       + '<div class="item-info"><div class="item-name">' + name + '</div>'
       + '<div class="item-qty">' + meta + '</div>' + getBadge(badge) + '</div>'
       + '<div class="item-price" data-price-id="' + id + '" data-price="' + price + '">' + price + ' RON</div>'
       + '<button class="mi-btn mi-edit-cat" data-edit-cat="' + id + '">&#9998;</button>'
       + '</div>';
}

// Manual-item row: same anatomy, edit + delete action cluster (no price).
function manualRowHTML(m, c, tag) {
  var rc = 'item-row' + (c ? ' done' : '');
  var cc = 'check-circle' + (c ? ' checked' : '');
  var meta = (m.qty || '') + (c && c.by ? ' · ' + c.by : '');
  return '<div class="' + rc + '" data-id="' + m.id + '">'
       + '<div class="' + cc + '"><svg viewBox="0 0 13 10" fill="none" stroke="#fff" stroke-width="2"><polyline points="1.5,5 5,8.5 11.5,1.5"/></svg></div>'
       + '<div class="item-info"><div class="item-name">' + m.name + (tag ? ' <span class="manual-tag">' + tag + '</span>' : '') + '</div>'
       + '<div class="item-qty">' + meta + '</div></div>'
       + '<div class="manual-actions"><button class="mi-btn mi-edit" data-mid="' + m.id + '">&#9998;</button>'
       + '<button class="mi-btn mi-del" data-mid="' + m.id + '">&#128465;</button></div>'
       + '</div>';
}

function renderGrocery() {
  var ck   = state.checked || {};
  var mans = state.manualItems || [];
  var html = '';
  var total = 0; var done = 0; var tprice = 0; var cprice = 0;
  // in-store micro-copy (kept out of the I18N data block on purpose)
  var W_LEFT = {fr:'restants', en:'left',    ro:'ramase'};
  var W_DONE = {fr:'FAIT',     en:'DONE',    ro:'GATA'};
  var W_CHK  = {fr:'cochés',   en:'checked', ro:'bifate'};
  var W_ADD  = {fr:'ajouté',   en:'added',   ro:'adăugat'};
  var wLeft = W_LEFT[lang] || W_LEFT.fr;
  var wDone = W_DONE[lang] || W_DONE.fr;
  var wChk  = W_CHK[lang]  || W_CHK.fr;
  var wAdd  = W_ADD[lang]  || W_ADD.fr;
  // resolve a translated item name, falling back to FR (item.name)
  function nameOf(item) {
    return (lang === 'ro' && item.name_ro) ? item.name_ro
         : (lang === 'en' && item.name_en) ? item.name_en
         : item.name;
  }

  // partition manual items: those assigned to a section vs. uncategorised
  var manualBySection = {}, manualNone = [];
  mans.forEach(function(m) {
    if (m.sectionId && m.sectionId !== 'manual') {
      (manualBySection[m.sectionId] = manualBySection[m.sectionId] || []).push(m);
    } else { manualNone.push(m); }
  });

  GROCERY.forEach(function(sec) {
    var unchecked = [], checkedItems = [];
    sec.items.forEach(function(item) {
      var p = priceOf(item);
      total++; tprice += p;
      var c = ck[item.id];
      if (c) { done++; cprice += p; checkedItems.push(item); }
      else { unchecked.push(item); }
    });
    var allDone   = sec.items.length > 0 && checkedItems.length === sec.items.length;
    var remaining = sec.items.length - checkedItems.length;
    var sectionLabel = (lang === 'ro' && sec.section_ro) ? sec.section_ro
                     : (lang === 'en' && sec.section_en) ? sec.section_en
                     : sec.section;
    // Spec anatomy (Mobile · C): emoji + title + count badge pill.
    html += '<div class="section-title' + (allDone ? ' section-done' : '') + '">'
          + '<span class="sec-emoji">' + sec.icon + '</span>'
          + '<span class="sec-name">' + sectionLabel + '</span>'
          + '<span class="sec-count' + (allDone ? ' done' : '') + '">' + (allDone ? '&#10003;' : remaining) + '</span>'
          + '</div>';

    unchecked.forEach(function(item) {
      var ov = (state.itemOverrides || {})[item.id] || {};
      html += itemRowHTML(item.id, ov.name || nameOf(item), ov.qty || item.qty, item.badge, priceOf(item), null);
    });

    // manual items assigned to this section (after the regular items)
    var secManual = manualBySection[sec.id] || [];
    secManual.forEach(function(m) {
      total++;
      var c = ck[m.id];
      if (c) done++;
      html += manualRowHTML(m, c, wAdd);
    });

    if (checkedItems.length) {
      var expanded = !!checkedExpanded[sec.id];
      html += '<div class="checked-collapse-row" data-section="' + sec.id + '">'
            + (expanded ? '&#9650; ' : '&#9660; ') + checkedItems.length + ' ' + wChk + '</div>';
      if (expanded) {
        checkedItems.forEach(function(item) {
          var ov = (state.itemOverrides || {})[item.id] || {};
          html += itemRowHTML(item.id, ov.name || nameOf(item), ov.qty || item.qty, item.badge, priceOf(item), ck[item.id]);
        });
      }
    }
  });

  if (manualNone.length) {
    html += '<div class="section-title"><span class="sec-emoji">&#9998;</span><span class="sec-name">' + T.manualSection + '</span></div>';
    manualNone.forEach(function(m) {
      total++;
      var c = ck[m.id];
      if (c) done++;
      html += manualRowHTML(m, c, null);
    });
  }

  ge('groceryList').innerHTML = html;
  document.querySelectorAll('.item-row[data-id]').forEach(function(row) {
    row.addEventListener('click', function(){ toggleItem(row.getAttribute('data-id')); });
  });
  document.querySelectorAll('.checked-collapse-row').forEach(function(r) {
    r.addEventListener('click', function(){
      var sid = r.getAttribute('data-section');
      checkedExpanded[sid] = !checkedExpanded[sid];
      renderGrocery();
    });
  });
  // manual item edit / delete (stopPropagation so the row doesn't toggle)
  document.querySelectorAll('.mi-edit').forEach(function(b) {
    b.addEventListener('click', function(ev){ ev.stopPropagation(); openEditManual(b.getAttribute('data-mid')); });
  });
  document.querySelectorAll('.mi-del').forEach(function(b) {
    b.addEventListener('click', function(ev){ ev.stopPropagation(); deleteManual(b.getAttribute('data-mid')); });
  });
  // tap a price to edit it inline
  document.querySelectorAll('.item-price[data-price-id]').forEach(function(el) {
    el.addEventListener('click', function(ev){ ev.stopPropagation(); openPriceEdit(el); });
  });
  // edit a catalog item's name/qty (override)
  document.querySelectorAll('.mi-edit-cat').forEach(function(b) {
    b.addEventListener('click', function(ev){ ev.stopPropagation(); openEditCatalog(b.getAttribute('data-edit-cat')); });
  });

  var pct = total > 0 ? Math.round(done / total * 100) : 0;
  ge('progressFill').style.width = pct + '%';
  ge('totalSub').innerHTML     = done + '<span style="color:var(--color-border-strong)"> / ' + total + '</span>';
  ge('totalPrice').textContent = cprice + ' RON / ' + tprice + ' RON';
}

// Replace a price label with an inline number input; commit on blur/Enter.
// Re-renders ONLY this span (never a full renderAll), and blocks background
// polls from rebuilding the list while the input is open.
function openPriceEdit(el) {
  var pid = el.getAttribute('data-price-id');
  var cur = el.getAttribute('data-price');
  priceEditing = true;
  el.innerHTML = '<input type="number" class="price-input" value="' + cur + '" inputmode="decimal" min="0" step="1">';
  var inp = el.querySelector('input');
  inp.focus(); inp.select();
  inp.addEventListener('click', function(e){ e.stopPropagation(); });
  function restore() { el.setAttribute('data-price', cur); el.textContent = cur + ' RON'; }
  var settled = false;
  function commit() {
    if (settled) return; settled = true;
    var v = parseFloat(inp.value);
    if (isNaN(v) || v < 0 || v === parseFloat(cur)) { priceEditing = false; restore(); return; }
    savePrice(pid, v, el);   // savePrice clears priceEditing when it settles
  }
  inp.addEventListener('blur', commit);
  inp.addEventListener('keydown', function(e){
    if (e.key === 'Enter')  { e.preventDefault(); inp.blur(); }
    if (e.key === 'Escape') { settled = true; priceEditing = false; restore(); }
  });
}

function savePrice(id, price, el) {
  setSyncState('syncing');
  // optimistic: show the new value on the span immediately
  if (el) { el.setAttribute('data-price', price); el.textContent = price + ' RON'; }
  apiPost('/api/update-price', {id:id, price:Number(price)})
    .then(function(d){
      state = d;
      priceEditing = false;
      var span = el || document.querySelector('.item-price[data-price-id="' + id + '"]');
      var p = (state.prices && state.prices[id] !== undefined) ? state.prices[id] : price;
      if (span) { span.setAttribute('data-price', p); span.textContent = p + ' RON'; }
      showTotals();          // keep the hero total in sync without a full re-render
      setSyncState('ok');
    })
    .catch(function(){ priceEditing = false; setSyncState('err'); showToast(T.toastErr, true); renderGrocery(); });
}

// Recompute + repaint just the grocery header totals (uses edited prices).
function showTotals() {
  var ck = state.checked || {};
  var total = 0, done = 0, tprice = 0, cprice = 0;
  GROCERY.forEach(function(sec){ sec.items.forEach(function(item){ var p = priceOf(item); total++; tprice += p; if (ck[item.id]) { done++; cprice += p; } }); });
  (state.manualItems || []).forEach(function(m){ total++; if (ck[m.id]) done++; });
  var pct = total > 0 ? Math.round(done / total * 100) : 0;
  ge('progressFill').style.width = pct + '%';
  ge('totalSub').innerHTML     = done + '<span style="color:var(--color-border-strong)"> / ' + total + '</span>';
  ge('totalPrice').textContent = cprice + ' RON / ' + tprice + ' RON';
}

function deleteManual(id) {
  var W_DEL = {fr:'Supprimer cet article ?', en:'Delete this item?', ro:'Ștergi acest articol?'};
  if (!confirm(W_DEL[lang] || W_DEL.fr)) return;
  setSyncState('syncing');
  apiPost('/api/delete-item', {id:id})
    .then(function(d){ state = d; renderAll(true); setSyncState('ok'); })
    .catch(function(){ setSyncState('err'); showToast(T.toastErr, true); });
}

function toggleItem(id) {
  if (togglePending[id]) return;   // ignore double-taps while a toggle is in flight
  togglePending[id] = true;
  setSyncState('syncing');
  apiPost('/api/toggle', {id:id, user:user})
    .then(function(d){
      var nowChecked = !!(d.checked && d.checked[id]);
      // short haptic pulse confirms the check in a noisy store environment
      if (navigator.vibrate) navigator.vibrate(30);
      state = d;
      renderAll(true);
      // brief green flash on the freshly-checked row before it fades to "done"
      if (nowChecked) {
        var row = document.querySelector('[data-id="' + id + '"]');
        if (row) row.classList.add('flash');
      }
      setSyncState('ok');
    })
    .catch(function(){ setSyncState('err'); showToast(T.toastErr, true); })
    .then(function(){ delete togglePending[id]; });
}

function doReset() {
  setSyncState('syncing');
  apiPost('/api/reset', null)
    .then(function(d){ state = d; renderAll(true); setSyncState('ok'); })
    .catch(function(){ setSyncState('err'); showToast(T.toastErr, true); });
}

// (Re)build the category <select> options for the current language.
function fillCategories(selected) {
  var sel = ge('addCategory');
  if (!sel) return;
  var W_NONE = {fr:'Sans catégorie', en:'Uncategorized', ro:'Fără categorie'};
  var html = '';
  GROCERY.forEach(function(sec) {
    var label = (lang === 'ro' && sec.section_ro) ? sec.section_ro
              : (lang === 'en' && sec.section_en) ? sec.section_en
              : sec.section;
    html += '<option value="' + sec.id + '">' + sec.icon + ' ' + label + '</option>';
  });
  html += '<option value="manual">&#128203; ' + (W_NONE[lang] || W_NONE.fr) + '</option>';
  sel.innerHTML = html;
  sel.value = selected || 's2';
}

// Open the add-item modal in "add" mode (FAB).
// Show/hide the category selector (catalog overrides can't recategorise).
function setCatVisible(v) {
  var sel = ge('addCategory'), lbl = ge('addCatLabel');
  if (sel) sel.style.display = v ? '' : 'none';
  if (lbl) lbl.style.display = v ? '' : 'none';
}
// Reset the add/edit modal back to "add" mode.
function resetAddModal() {
  addModalMode = 'add'; addModalItemId = null;
  ge('addName').value = ''; ge('addQty').value = '';
  setCatVisible(true);
}

function openAddItem() {
  resetAddModal();
  ge('addModalTitle').textContent = T.addTitle;
  fillCategories('s2');
  ge('addModal').classList.add('open');
  ge('addName').focus();
}

// Open the modal pre-filled to edit an existing manual item.
function openEditManual(id) {
  var m = (state.manualItems || []).filter(function(x){ return x.id === id; })[0];
  if (!m) return;
  addModalMode = 'manual'; addModalItemId = id;
  var W_EDIT = {fr:"Modifier l'article", en:'Edit item', ro:'Editează articol'};
  ge('addModalTitle').textContent = W_EDIT[lang] || W_EDIT.fr;
  ge('addName').value = m.name || '';
  ge('addQty').value  = m.qty  || '';
  setCatVisible(true);
  fillCategories(m.sectionId || 'manual');
  ge('addModal').classList.add('open');
  ge('addName').focus();
}

// Open the modal pre-filled to override a catalog item (g1–g65): name + qty only.
function openEditCatalog(id) {
  var item = null;
  GROCERY.forEach(function(sec){ sec.items.forEach(function(it){ if (it.id === id) item = it; }); });
  if (!item) return;
  addModalMode = 'catalog'; addModalItemId = id;
  var ov = (state.itemOverrides || {})[id] || {};
  var W_EDIT = {fr:"Modifier l'article", en:'Edit item', ro:'Editează articol'};
  ge('addModalTitle').textContent = W_EDIT[lang] || W_EDIT.fr;
  ge('addName').value = ov.name || gName(item);
  ge('addQty').value  = ov.qty  || item.qty;
  setCatVisible(false);   // catalog items keep their section
  ge('addModal').classList.add('open');
  ge('addName').focus();
}

function doAddItem() {
  var n = ge('addName').value.trim();
  var q = ge('addQty').value.trim();
  if (!n) return;
  var route, body;
  if (addModalMode === 'catalog') {
    route = '/api/override-item'; body = {id:addModalItemId, name:n, qty:q};
  } else if (addModalMode === 'manual') {
    var sidM = ge('addCategory') ? ge('addCategory').value : 'manual';
    route = '/api/edit-item'; body = {id:addModalItemId, name:n, qty:q, sectionId:sidM};
  } else {
    var sidA = ge('addCategory') ? ge('addCategory').value : 'manual';
    route = '/api/add-item'; body = {name:n, qty:q, sectionId:sidA, user:user};
  }
  setSyncState('syncing');
  apiPost(route, body)
    .then(function(d){
      state = d; renderAll(true);
      ge('addModal').classList.remove('open');
      resetAddModal();
      setSyncState('ok');
    })
    .catch(function(){ setSyncState('err'); showToast(T.toastErr, true); });
}

// ── FAVORITES (quick-add) ──
function favName(f) {
  return (lang === 'ro' && f.name_ro) ? f.name_ro
       : (lang === 'en' && f.name_en) ? f.name_en
       : f.name;
}

function openFavorites() {
  var W_TITLE = {fr:'⚡ Accès rapide', en:'⚡ Quick add', ro:'⚡ Acces rapid'};
  var W_PH    = {fr:'Rechercher…',    en:'Search…',     ro:'Caută…'};
  ge('favModalTitle').textContent = W_TITLE[lang] || W_TITLE.fr;
  ge('favSearch').placeholder     = W_PH[lang] || W_PH.fr;
  ge('favSearch').value = '';
  renderFavorites();
  ge('favModal').classList.add('open');
}

// Merge three sources into one deduplicated quick-add catalogue (first-seen wins,
// in group priority order: main list → favorites → recent). Names resolve to the
// current language. Each entry: {group, name, qty, sectionId}.
function buildFavCatalog() {
  var seen = {}, out = [];
  function add(group, name, qty, sectionId) {
    var k = (name || '').toLowerCase();
    if (!name || seen[k]) return;
    seen[k] = 1;
    out.push({group:group, name:name, qty:qty || '', sectionId:sectionId || 'manual'});
  }
  GROCERY.forEach(function(sec){ sec.items.forEach(function(item){
    var ov = (state.itemOverrides || {})[item.id] || {};
    add('main', ov.name || gName(item), ov.qty || item.qty, sec.id);
  }); });
  FAVORITES.forEach(function(f){ add('fav', favName(f), f.qty, f.sectionId); });
  (state.manualHistory || []).forEach(function(m){ add('recent', m.name, m.qty, m.sectionId); });
  return out;
}

function renderFavorites() {
  var q = (ge('favSearch').value || '').trim().toLowerCase();
  var W_EMPTY = {fr:'Aucun résultat', en:'No results', ro:'Niciun rezultat'};
  var W_GROUPS = {
    main:   {fr:'Liste principale', en:'Main list', ro:'Listă principală'},
    fav:    {fr:'Favoris',          en:'Favorites', ro:'Favorite'},
    recent: {fr:'Récents',          en:'Recent',    ro:'Recente'}
  };
  favCatalog = buildFavCatalog();
  var html = '';
  ['main','fav','recent'].forEach(function(g) {
    var rows = '';
    favCatalog.forEach(function(it, i) {
      if (it.group !== g || it.name.toLowerCase().indexOf(q) < 0) return;
      rows += '<div class="fav-item-row">'
            + '<div class="fav-item-info"><div class="fav-item-name">' + it.name + '</div>'
            + (it.qty ? '<div class="fav-item-meta">' + it.qty + '</div>' : '') + '</div>'
            + '<button class="fav-add-btn" data-fav="' + i + '">+ ' + T.addSave + '</button>'
            + '</div>';
    });
    if (rows) html += '<div class="fav-group">' + (W_GROUPS[g][lang] || W_GROUPS[g].fr) + '</div>' + rows;
  });
  if (!html) html = '<div class="fav-empty">' + (W_EMPTY[lang] || W_EMPTY.fr) + '</div>';
  ge('favList').innerHTML = html;
  document.querySelectorAll('.fav-add-btn').forEach(function(b) {
    b.addEventListener('click', function(){ addFavorite(parseInt(b.getAttribute('data-fav'), 10), b); });
  });
}

// Add a quick-add catalogue entry to the shared list via /api/add-item.
function addFavorite(i, btn) {
  var f = favCatalog[i];
  if (!f) return;
  if (btn) btn.disabled = true;
  setSyncState('syncing');
  apiPost('/api/add-item', {name:f.name, qty:f.qty, sectionId:f.sectionId, user:user})
    .then(function(d){
      state = d; renderAll(true);
      if (btn) btn.textContent = '✓';   // stays open so several can be added in a row
      setSyncState('ok');
      showToast(T.toastSaved, false);
    })
    .catch(function(){ if (btn) btn.disabled = false; setSyncState('err'); showToast(T.toastErr, true); });
}

// ── RECIPES ──
function recipeName(r) {
  return (lang === 'ro' && r.name_ro) ? r.name_ro
       : (lang === 'en' && r.name_en) ? r.name_en
       : r.name;
}
function ingName(ing) {
  return (lang === 'ro' && ing.name_ro) ? ing.name_ro : ing.name;
}
function escAttr(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;'); }

// <option> list for an ingredient category select.
function catOptions(selected) {
  var W_NONE = {fr:'Sans catégorie', en:'Uncategorized', ro:'Fără categorie'};
  var h = '';
  GROCERY.forEach(function(sec) {
    var label = (lang === 'ro' && sec.section_ro) ? sec.section_ro
              : (lang === 'en' && sec.section_en) ? sec.section_en
              : sec.section;
    h += '<option value="' + sec.id + '"' + (selected === sec.id ? ' selected' : '') + '>' + sec.icon + ' ' + label + '</option>';
  });
  h += '<option value="manual"' + (selected === 'manual' ? ' selected' : '') + '>&#128203; ' + (W_NONE[lang] || W_NONE.fr) + '</option>';
  return h;
}

// One editable ingredient row in the recipe modal. itemId (if any) is preserved
// on a data attribute so recipe-to-cart can still map it to a catalogue item.
function recIngRowHTML(ing) {
  ing = ing || {};
  var W_N = {fr:'Ingrédient', en:'Ingredient', ro:'Ingredient'};
  var W_Q = {fr:'Qté', en:'Qty', ro:'Cant.'};
  return '<div class="rec-ing-row" data-item-id="' + escAttr(ing.itemId || '') + '">'
       + '<input class="rec-ing-name" placeholder="' + (W_N[lang] || W_N.fr) + '" value="' + escAttr(ingName(ing)) + '">'
       + '<input class="rec-ing-qty" placeholder="' + (W_Q[lang] || W_Q.fr) + '" value="' + escAttr(ing.qty || '') + '">'
       + '<select class="rec-ing-cat">' + catOptions(ing.sectionId || 'manual') + '</select>'
       + '<button class="rec-ing-del" type="button">&times;</button>'
       + '</div>';
}

// ── PROFILE (auth) ──
function initialsOf(name) { name = (name || '').trim(); if (!name) return '?'; var p = name.split(/\\s+/); return (p[0].charAt(0) + (p[1] ? p[1].charAt(0) : '')).toUpperCase(); }
function renderProfile() {
  fetch('/auth/me').then(function(r){ if (!r.ok) throw new Error('http'); return r.json(); }).then(function(d){
    var members = (d.members || []).map(function(m){ return '<div class="pf-member"><span class="pf-av sm">' + initialsOf(m.name) + '</span><span>' + m.name + '</span></div>'; }).join('');
    var langs = ['fr','en','ro'].map(function(l){ return '<button class="pf-chip' + (d.lang === l ? ' on' : '') + '" data-pflang="' + l + '">' + l.toUpperCase() + '</button>'; }).join('');
    var curs  = ['RON','EUR','USD'].map(function(c){ return '<button class="pf-chip' + (d.currency === c ? ' on' : '') + '" data-pfcur="' + c + '">' + c + '</button>'; }).join('');
    ge('profileBody').innerHTML =
        '<div class="pf-card pf-head"><span class="pf-av">' + initialsOf(d.name) + '</span><div><div class="pf-name">' + d.name + '</div><div class="pf-email">' + d.email + '</div></div></div>'
      + '<div class="pf-card"><div class="pf-lbl">Foyer · ' + ((d.members || []).length) + ' membre(s)</div><div class="pf-members">' + members + '</div>'
      + '<button class="pf-btn" id="pfInvite">&#65291; Inviter un partenaire</button><div id="pfInviteBox"></div></div>'
      + '<div class="pf-card"><div class="pf-lbl">Langue</div><div class="pf-chips">' + langs + '</div></div>'
      + '<div class="pf-card"><div class="pf-lbl">Devise</div><div class="pf-chips">' + curs + '</div></div>'
      + '<form method="POST" action="/auth/logout"><button class="pf-btn danger" type="submit">Se déconnecter</button></form>';
    ge('pfInvite').addEventListener('click', createInvite);
    document.querySelectorAll('[data-pflang]').forEach(function(b){ b.addEventListener('click', function(){ var l = b.getAttribute('data-pflang'); savePrefs({lang:l}); setLang(l); }); });
    document.querySelectorAll('[data-pfcur]').forEach(function(b){ b.addEventListener('click', function(){ savePrefs({currency:b.getAttribute('data-pfcur')}); }); });
  }).catch(function(){ ge('profileBody').innerHTML = '<div class="pf-card">Session expirée. <a href="/login">Se reconnecter</a></div>'; });
}
function createInvite() {
  var btn = ge('pfInvite'); btn.disabled = true; btn.textContent = '…';
  apiPost('/api/invite/create', {}).then(function(d){
    ge('pfInviteBox').innerHTML = '<div class="pf-invite"><input id="pfLink" readonly value="' + d.inviteUrl + '"><button class="pf-copy" id="pfCopy">Copier</button></div><div class="pf-hint">Lien valable 7 jours — envoie-le à ton partenaire.</div>';
    btn.style.display = 'none';
    ge('pfCopy').addEventListener('click', function(){ var i = ge('pfLink'); i.select(); if (navigator.clipboard) { navigator.clipboard.writeText(i.value); ge('pfCopy').textContent = 'Copié ✓'; } });
  }).catch(function(){ btn.disabled = false; btn.textContent = '\\uFF0B Inviter un partenaire'; showToast(T.toastErr, true); });
}
function savePrefs(p) { apiPost('/api/user/prefs', p).then(function(){ renderProfile(); showToast(T.toastSaved, false); }).catch(function(){ showToast(T.toastErr, true); }); }

// Recipe visual: <img> for a URL, coloured emoji tile for an emoji, gray 🍽️ placeholder otherwise.
function recipeThumbHTML(r) {
  var img = (r.image || '');
  if (img.indexOf('http') === 0) return '<img src="' + escAttr(img) + '" class="recipe-thumb" alt="">';
  if (img) return '<div class="recipe-emoji">' + img + '</div>';
  return '<div class="recipe-emoji placeholder">🍽️</div>';
}

function renderRecipes() {
  var W_REC  = {fr:'Recettes', en:'Recipes', ro:'Rețete'};
  var W_ING  = {fr:'ingrédients', en:'ingredients', ro:'ingrediente'};
  var W_SERV = {fr:'portions', en:'servings', ro:'porții'};
  var W_ADD  = {fr:'🛒 Ajouter à la liste', en:'🛒 Add to list', ro:'🛒 Adaugă pe listă'};
  var W_NEW  = {fr:'➕ Nouvelle recette', en:'➕ New recipe', ro:'➕ Rețetă nouă'};
  if (ge('navRecipesLabel')) ge('navRecipesLabel').textContent = W_REC[lang] || W_REC.fr;

  var list = (state.recipes && state.recipes.length) ? state.recipes : DEFAULT_RECIPES;
  var html = '<button class="recipe-new-btn" id="recipeNewBtn">' + (W_NEW[lang] || W_NEW.fr) + '</button>';
  list.forEach(function(r) {
    var ingCount = (r.ingredients || []).length;
    html += '<div class="recipe-card">'
          + recipeThumbHTML(r)
          + '<div class="recipe-card-body">'
          + '<div class="recipe-card-title">' + recipeName(r) + '</div>'
          + '<div class="recipe-card-meta">' + ingCount + ' ' + (W_ING[lang] || W_ING.fr) + ' &middot; ' + (r.servings || 2) + ' ' + (W_SERV[lang] || W_SERV.fr) + '</div>'
          + '<button class="recipe-add-btn" data-recipe="' + r.id + '">' + (W_ADD[lang] || W_ADD.fr) + '</button>'
          + '<div class="recipe-actions"><button class="rec-edit" data-recipe="' + r.id + '">&#9998;</button>'
          + '<button class="rec-del" data-recipe="' + r.id + '">&#128465;</button></div>'
          + '</div>'
          + '</div>';
  });
  ge('recipesList').innerHTML = html;
  ge('recipeNewBtn').addEventListener('click', function(){ openRecipeModal(null); });
  document.querySelectorAll('.recipe-add-btn').forEach(function(b){
    b.addEventListener('click', function(){ recipeToCart(b.getAttribute('data-recipe'), b); });
  });
  document.querySelectorAll('.rec-edit').forEach(function(b){
    b.addEventListener('click', function(){ openRecipeModal(b.getAttribute('data-recipe')); });
  });
  document.querySelectorAll('.rec-del').forEach(function(b){
    b.addEventListener('click', function(){ deleteRecipe(b.getAttribute('data-recipe')); });
  });
}

function recipeToCart(id, btn) {
  if (btn) btn.disabled = true;
  setSyncState('syncing');
  apiPost('/api/recipe-to-cart', {id:id})
    .then(function(d){ state = d; renderAll(true); setSyncState('ok'); showToast(T.toastSaved, false); })
    .catch(function(){ if (btn) btn.disabled = false; setSyncState('err'); showToast(T.toastErr, true); });
}

function deleteRecipe(id) {
  var W_DEL = {fr:'Supprimer cette recette ?', en:'Delete this recipe?', ro:'Ștergi această rețetă?'};
  if (!confirm(W_DEL[lang] || W_DEL.fr)) return;
  setSyncState('syncing');
  apiPost('/api/delete-recipe', {id:id})
    .then(function(d){ state = d; renderAll(true); setSyncState('ok'); })
    .catch(function(){ setSyncState('err'); showToast(T.toastErr, true); });
}

function openRecipeModal(id) {
  var W_NEW  = {fr:'Nouvelle recette', en:'New recipe', ro:'Rețetă nouă'};
  var W_EDIT = {fr:'Modifier la recette', en:'Edit recipe', ro:'Editează rețeta'};
  var rec = null;
  if (id) {
    var list = (state.recipes && state.recipes.length) ? state.recipes : DEFAULT_RECIPES;
    rec = list.filter(function(r){ return r.id === id; })[0] || null;
  }
  editingRecipeId = id || null;
  ge('recipeModalTitle').textContent = id ? (W_EDIT[lang] || W_EDIT.fr) : (W_NEW[lang] || W_NEW.fr);
  ge('recName').value = rec ? recipeName(rec) : '';
  ge('recServings').value = rec ? (rec.servings || 2) : 2;
  ge('recImage').value = rec ? (rec.image || '') : '';
  var W_IMGPH = {fr:'https://... ou emoji ex: 🍝', en:'https://... or emoji e.g. 🍝', ro:'https://... sau emoji ex: 🍝'};
  ge('recImage').placeholder = W_IMGPH[lang] || W_IMGPH.fr;
  var ings = (rec && rec.ingredients && rec.ingredients.length) ? rec.ingredients : [{}];
  var h = '';
  ings.forEach(function(ing){ h += recIngRowHTML(ing); });
  ge('recIngredients').innerHTML = h;
  ge('recipeModal').classList.add('open');
  ge('recName').focus();
}

function saveRecipe() {
  var name = ge('recName').value.trim();
  if (!name) return;
  var servings = parseInt(ge('recServings').value, 10) || 2;
  var ings = [];
  document.querySelectorAll('#recIngredients .rec-ing-row').forEach(function(row) {
    var nm = row.querySelector('.rec-ing-name').value.trim();
    if (!nm) return;
    var ing = {
      name: nm,
      name_ro: nm,
      qty: row.querySelector('.rec-ing-qty').value.trim(),
      sectionId: row.querySelector('.rec-ing-cat').value
    };
    var iid = row.getAttribute('data-item-id');
    if (iid) ing.itemId = iid;
    ings.push(ing);
  });
  var recipe = {
    id: editingRecipeId || ('r_' + Date.now()),
    name: name, name_en: name, name_ro: name,
    image: ge('recImage').value.trim(),
    servings: servings,
    ingredients: ings
  };
  setSyncState('syncing');
  apiPost('/api/save-recipe', {recipe:recipe})
    .then(function(d){
      state = d; renderAll(true);
      ge('recipeModal').classList.remove('open');
      editingRecipeId = null;
      setSyncState('ok');
      showToast(T.toastSaved, false);
    })
    .catch(function(){ setSyncState('err'); showToast(T.toastErr, true); });
}

function getDayDates() {
  var today = new Date(); var dow = today.getDay();
  var mon   = new Date(today); mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1)); mon.setHours(0,0,0,0);
  var out   = {};
  DAYS.forEach(function(d, i){ var dt = new Date(mon); dt.setDate(mon.getDate() + i); out[d] = dt; });
  return out;
}

function todayKey() {
  return ['dim','lun','mar','mer','jeu','ven','sam'][new Date().getDay()];
}

function saveWeek() { try { localStorage.setItem('np_week', currentWeek); } catch(e) {} }

// Smoothly bring today's card into view (week view + current week only).
function scrollToToday() {
  if (planView !== 'week' || currentWeek !== currentISOWeek()) return;
  setTimeout(function(){
    var el = ge('dc_' + todayKey());
    if (el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth', block:'start'});
  }, 0);
}

var W_WEEK  = {fr:'Semaine', en:'Week',  ro:'Săptămâna'};
var W_MONTH = {fr:'Mois',    en:'Month', ro:'Lună'};
var W_WD    = {fr:['Lu','Ma','Me','Je','Ve','Sa','Di'], en:['Mo','Tu','We','Th','Fr','Sa','Su'], ro:['Lu','Ma','Mi','Jo','Vi','Sâ','Du']};

// "Semaine 26 — 23–29 juin 2026"
function weekLabelFor(wk) {
  var p = parseWeekKey(wk);
  var dates = datesForWeek(wk);
  var mon = dates['lun'], sun = dates['dim'];
  var loc = T.locale;
  var ww  = W_WEEK[lang] || W_WEEK.fr;
  if (mon.getUTCMonth() === sun.getUTCMonth()) {
    var monthName = sun.toLocaleDateString(loc, {month:'long', timeZone:'UTC'});
    return ww + ' ' + p.week + ' — ' + mon.getUTCDate() + '–' + sun.getUTCDate() + ' ' + monthName + ' ' + sun.getUTCFullYear();
  }
  var m1 = mon.toLocaleDateString(loc, {day:'numeric', month:'short', timeZone:'UTC'});
  var m2 = sun.toLocaleDateString(loc, {day:'numeric', month:'short', timeZone:'UTC'});
  return ww + ' ' + p.week + ' — ' + m1 + '–' + m2 + ' ' + sun.getUTCFullYear();
}

// Dispatcher: week view (day cards) or month view (calendar grid).
function renderPlanning() {
  ge('viewToggle').textContent = (planView === 'month') ? (W_WEEK[lang] || W_WEEK.fr) : (W_MONTH[lang] || W_MONTH.fr);
  ge('weekNav').style.display  = (planView === 'week') ? 'flex' : 'none';
  if (planView === 'week') {
    ge('weekLabel').textContent = weekLabelFor(currentWeek);
    renderWeekDays();
  } else {
    renderMonthGrid();
  }
  if (pendingScrollDay && planView === 'week') {
    var d = pendingScrollDay; pendingScrollDay = null;
    setTimeout(function(){ var el = ge('dc_' + d); if (el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth', block:'start'}); }, 0);
  }
}

function renderWeekDays() {
  var dates  = datesForWeek(currentWeek);
  var plan   = planForWeek(currentWeek);
  var realWk = currentISOWeek();
  var today  = todayKey();
  var loc    = T.locale;
  var html = '';
  DAYS.forEach(function(day) {
    var dp      = plan[day];
    var isToday = (currentWeek === realWk) && (day === today);
    var cardCls = 'day-card' + (isToday ? ' today-card open' : '');
    var dstr    = dates[day].toLocaleDateString(loc, {day:'numeric', month:'short', timeZone:'UTC'});
    html += '<div class="' + cardCls + '" id="dc_' + day + '">';
    html += '<div class="day-header" data-day="' + day + '">'
          + '<div><span class="day-name">' + (T.days[day] || day) + '</span>'
          + (isToday ? ' <span class="today-badge" style="text-transform:uppercase;letter-spacing:1px">' + T.today + '</span>' : '')
          + '</div>'
          + '<div style="display:flex;align-items:center;gap:8px"><span class="day-date">' + dstr + '</span><span class="day-chevron">&#9660;</span></div>'
          + '</div>';
    html += '<div class="day-body">';
    SLOTS.forEach(function(slot) {
      var m   = dp[slot];
      // accent by meal SLOT (breakfast/lunch/dinner/snack), not cooking type
      var SLOT_ACCENT = {breakfast:'var(--color-warning)', lunch:'var(--color-primary)', dinner:'var(--color-secondary)', snack:'var(--color-info)'};
      var slotColor = SLOT_ACCENT[slot] || 'var(--color-text-muted)';
      html += '<div class="meal-row" data-day="' + day + '" data-slot="' + slot + '">'
            + '<div class="meal-slot-label">' + (T.slots[slot] || slot) + '</div>'
            + '<div class="meal-info"><div class="meal-name">' + (m.name || '—') + '</div>'
            + (m.detail ? '<div class="meal-detail">' + m.detail + '</div>' : '')
            + (m.time   ? '<div class="meal-time">&#8987; ' + m.time + '</div>' : '')
            + '</div>'
            + '<div class="meal-type-dot" style="background:' + slotColor + '"></div>'
            + '</div>';
    });
    html += '</div></div>';
  });
  ge('planningList').innerHTML = html;
  document.querySelectorAll('.day-header').forEach(function(h) {
    h.addEventListener('click', function(){ ge('dc_' + h.getAttribute('data-day')).classList.toggle('open'); });
  });
  document.querySelectorAll('.meal-row').forEach(function(row) {
    row.addEventListener('click', function(){ openEdit(row.getAttribute('data-day'), row.getAttribute('data-slot')); });
  });
}

// Compact month calendar. Each cell shows a coloured dot per planned meal slot.
function renderMonthGrid() {
  var p = parseWeekKey(currentWeek);
  var thu = isoWeekMonday(p.year, p.week); thu.setUTCDate(thu.getUTCDate() + 3); // owning month
  var year = thu.getUTCFullYear(), month = thu.getUTCMonth();
  var loc = T.locale;
  var first = new Date(Date.UTC(year, month, 1));
  var firstDow = first.getUTCDay() || 7;
  var gridStart = new Date(first); gridStart.setUTCDate(1 - (firstDow - 1)); // Monday on/before the 1st
  var last = new Date(Date.UTC(year, month + 1, 0));
  var now = new Date();
  var nowY = now.getUTCFullYear(), nowM = now.getUTCMonth(), nowD = now.getUTCDate();

  var html = '<div class="month-head">' + first.toLocaleDateString(loc, {month:'long', year:'numeric', timeZone:'UTC'}) + '</div>';
  html += '<div class="month-grid">';
  (W_WD[lang] || W_WD.fr).forEach(function(w){ html += '<div class="month-wd">' + w + '</div>'; });

  var cur = new Date(gridStart);
  while (true) {
    var inMonth = cur.getUTCMonth() === month;
    var wk      = isoWeekKey(cur);
    var dayKey  = DAYS[(cur.getUTCDay() + 6) % 7];
    var planWk  = state.plan && state.plan[wk];
    var dayPlan = planWk && planWk[dayKey];
    var dots = '';
    if (dayPlan) {
      SLOTS.forEach(function(slot){
        var m = dayPlan[slot];
        if (m && m.type) dots += '<span class="month-dot" style="background:' + typeColor(m.type) + '"></span>';
      });
    }
    var isToday = cur.getUTCFullYear() === nowY && cur.getUTCMonth() === nowM && cur.getUTCDate() === nowD;
    var cls = 'month-cell' + (inMonth ? '' : ' out') + (isToday ? ' today' : '');
    html += '<div class="' + cls + '" data-week="' + wk + '" data-day="' + dayKey + '">'
          + '<span>' + cur.getUTCDate() + '</span>'
          + (dots ? '<div class="month-dots">' + dots + '</div>' : '')
          + '</div>';
    cur.setUTCDate(cur.getUTCDate() + 1);
    if (cur > last && (cur.getUTCDay() || 7) === 1) break;  // stop at the Monday after month end
  }
  html += '</div>';
  ge('planningList').innerHTML = html;
  document.querySelectorAll('.month-cell').forEach(function(cell) {
    cell.addEventListener('click', function(){
      currentWeek = cell.getAttribute('data-week');
      saveWeek();
      pendingScrollDay = cell.getAttribute('data-day');
      planView = 'week';
      renderPlanning();
    });
  });
}

// Mini thumb for a recipe-pick card: small <img> for URLs, else emoji / placeholder.
function pickThumb(r) {
  var img = (r.image || '');
  if (img.indexOf('http') === 0) return '<img src="' + escAttr(img) + '" style="width:24px;height:24px;object-fit:cover;border-radius:4px" alt="">';
  return img || '🍽️';
}

// Render the horizontal recipe picker inside the edit-meal modal.
function renderMealRecipePicker() {
  var list = (state.recipes && state.recipes.length) ? state.recipes : DEFAULT_RECIPES;
  var html = '';
  list.forEach(function(r) {
    html += '<div class="recipe-pick-card" data-recipe="' + r.id + '">'
          + '<div class="recipe-pick-emoji">' + pickThumb(r) + '</div>'
          + '<div class="recipe-pick-name">' + recipeName(r) + '</div>'
          + '</div>';
  });
  ge('recipePickRow').innerHTML = html;
  document.querySelectorAll('#recipePickRow .recipe-pick-card').forEach(function(c) {
    c.addEventListener('click', function(){ pickRecipeForMeal(c.getAttribute('data-recipe'), c); });
  });
}

// Tapping a recipe card fills the meal name + details (but does not save).
function pickRecipeForMeal(id, card) {
  var list = (state.recipes && state.recipes.length) ? state.recipes : DEFAULT_RECIPES;
  var r = list.filter(function(x){ return x.id === id; })[0];
  if (!r) return;
  selectedRecipeForMeal = id;
  ge('editMealName').value   = recipeName(r);
  ge('editMealDetail').value = (r.ingredients || []).map(function(i){ return i.qty + ' ' + ingName(i); }).join(' + ');
  document.querySelectorAll('#recipePickRow .recipe-pick-card').forEach(function(c){ c.classList.remove('selected'); });
  if (card) card.classList.add('selected');
  ge('recipeAddIngWrap').style.display = '';
  ge('recipeAddIngredients').checked = true;
}

function openEdit(day, slot) {
  editWeek = currentWeek;
  var m = planForWeek(currentWeek)[day][slot];
  ge('editDay').value        = day;
  ge('editSlot').value       = slot;
  ge('editMealName').value   = m.name   || '';
  ge('editMealDetail').value = m.detail || '';
  ge('editMealTime').value   = m.time   || '';
  // reset + (re)build the recipe picker
  selectedRecipeForMeal = null;
  var W_PICK = {fr:'📖 Choisir depuis les recettes', en:'📖 Pick from recipes', ro:'📖 Alege din rețete'};
  var W_CHK  = {fr:'🛒 Ajouter les ingrédients à la liste', en:'🛒 Add ingredients to list', ro:'🛒 Adaugă ingredientele pe listă'};
  ge('recipePickToggle').textContent = W_PICK[lang] || W_PICK.fr;
  ge('recipeAddIngText').textContent = W_CHK[lang] || W_CHK.fr;
  ge('recipePickWrap').style.display = 'none';
  ge('recipeAddIngWrap').style.display = 'none';
  renderMealRecipePicker();
  ge('editModal').classList.add('open');
  ge('editMealName').focus();
}

function doEditMeal() {
  var day      = ge('editDay').value;
  var slot     = ge('editSlot').value;
  var existing = planForWeek(editWeek)[day][slot];
  var meal = {
    name:   ge('editMealName').value.trim(),
    detail: ge('editMealDetail').value.trim(),
    time:   ge('editMealTime').value.trim(),
    type:   existing.type || 'cook'
  };
  // capture picker intent before the modal closes
  var addIng = selectedRecipeForMeal
    && ge('recipeAddIngWrap').style.display !== 'none'
    && ge('recipeAddIngredients').checked;
  var recipeId = selectedRecipeForMeal;
  setSyncState('syncing');
  apiPost('/api/update-meal', {week:editWeek, day:day, slot:slot, meal:meal})
    .then(function(d){
      state = d;
      ge('editModal').classList.remove('open');
      selectedRecipeForMeal = null;
      if (addIng) {
        // also push the recipe's ingredients to the shopping list
        return apiPost('/api/recipe-to-cart', {id:recipeId}).then(function(d2){ state = d2; });
      }
    })
    .then(function(){ renderAll(true); setSyncState('ok'); showToast(T.toastSaved, false); })
    .catch(function(){ setSyncState('err'); showToast(T.toastErr, true); });
}

function renderToday() {
  var tk     = todayKey();
  var dp     = planForWeek(currentISOWeek())[tk];
  var locale = T.locale;
  var full   = new Date().toLocaleDateString(locale, {weekday:'long', day:'numeric', month:'long'});
  ge('todayDayName').textContent = T.days[tk] || tk;
  ge('todayDateStr').textContent = full;
  var html = '';
  SLOTS.forEach(function(slot) {
    var m = dp[slot];
    html += '<div class="today-meal-card" data-type="' + (m.type || 'free') + '">'
          + '<div class="today-slot-label">' + (T.slots[slot] || slot) + '</div>'
          + '<div class="today-meal-name">' + (m.name || '—') + '</div>'
          + (m.detail ? '<div class="today-meal-detail">' + m.detail + '</div>' : '')
          + (m.time   ? '<div class="today-meal-time">&#8987; ' + m.time + '</div>' : '')
          + '</div>';
  });
  ge('todayMeals').innerHTML = html;
}
`;
}

/** @returns {string} the complete self-contained HTML document served at GET /. */
function buildHTML() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${BRAND_COLOR}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="NutriPair">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icon.svg">
<link rel="icon" type="image/svg+xml" href="/icon.svg">
<title>NutriPair</title>
<style>${buildCSS()}</style>
</head>
<body>
${buildOverlay()}
${buildApp()}
${buildModals()}
<script>${buildScript()}</script>
</body>
</html>`;
}

/**
 * ISO-8601 week key for a date, e.g. '2026-W26'. Used as the top-level key of
 * state.plan so every calendar week has its own meal plan. Computed in UTC so
 * the Worker and the browser always derive the same key for the same instant.
 * @param {Date} date
 * @returns {string} 'YYYY-Www'
 */
function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;            // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);    // shift to the Thursday of this week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + '-W' + (weekNo < 10 ? '0' : '') + weekNo;
}

/** @returns {string} the ISO week key for "now", e.g. '2026-W26'. */
function currentISOWeek() {
  return isoWeekKey(new Date());
}

/**
 * One-time, in-place migration of the plan from the old flat shape
 * { lun:{…}, mar:{…} } to the week-keyed shape { '2026-W26': { lun:{…} } }.
 * Detected by the presence of a day key ('lun') at the top of state.plan.
 * @returns {boolean} true if a migration happened
 */
function migratePlanShape(s) {
  if (s.plan && s.plan.lun) {
    s.plan = { [currentISOWeek()]: s.plan };
    return true;
  }
  return false;
}

// Rough macro estimates per 100 g/ml for catalogue items (refine later).
// Items not listed contribute 0 to the macro KPIs.
const MACROS = {
  g1:{p:13,c:1,f:11,k:155}, g2:{p:27,c:0,f:14,k:239}, g3:{p:20,c:0,f:13,k:208},
  g4:{p:19,c:0,f:25,k:305}, g5:{p:25,c:0,f:11,k:208}, g6:{p:26,c:0,f:1,k:116},
  g7:{p:10,c:4,f:5,k:97},   g8:{p:3,c:4,f:1,k:41},    g9:{p:12,c:4,f:5,k:98},
  g10:{p:3,c:5,f:2,k:55},   g11:{p:14,c:4,f:21,k:264},g12:{p:1,c:0,f:81,k:717},
  g16:{p:1,c:4,f:0,k:18},   g20:{p:2,c:20,f:0,k:86},  g25:{p:1,c:23,f:0,k:89},
  g26:{p:0,c:14,f:0,k:52},  g28:{p:2,c:9,f:15,k:160}, g30:{p:9,c:20,f:0,k:116},
  g31:{p:9,c:25,f:1,k:139}, g32:{p:9,c:27,f:3,k:164}, g33:{p:3,c:23,f:1,k:111},
  g34:{p:17,c:66,f:7,k:389},g35:{p:9,c:49,f:3,k:247}, g36:{p:15,c:14,f:65,k:654},
  g37:{p:21,c:22,f:49,k:579},g38:{p:0,c:0,f:100,k:884},g39:{p:25,c:20,f:50,k:588},
  g40:{p:17,c:42,f:31,k:486},g42:{p:8,c:46,f:43,k:600},g43:{p:0,c:82,f:0,k:304},
  g54:{p:13,c:75,f:2,k:371},g55:{p:13,c:72,f:2,k:376},g56:{p:21,c:22,f:49,k:579},
  g57:{p:10,c:76,f:1,k:364},g47:{p:3,c:5,f:4,k:64},   g45:{p:11,c:3,f:20,k:230},
  g46:{p:22,c:2,f:25,k:321}
};

/**
 * GET /web — the desktop dashboard. A self-contained SPA, separate from the
 * mobile PWA, sharing the same KV via /api/state (read-only for now).
 * @returns {string} the full desktop HTML document.
 */
function buildWebHTML() {
  const groceryJSON = JSON.stringify(GROCERY_DATA);
  const recipesJSON = JSON.stringify(DEFAULT_RECIPES);
  const planJSON    = JSON.stringify(DEFAULT_PLAN);
  const macrosJSON  = JSON.stringify(MACROS);

  const CSS = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{--color-primary:#C85A2A;--color-primary-light:#FDF0E8;--color-primary-hover:#AD4B22;--color-secondary:#3D6B35;--color-secondary-light:#EAF3E8;--color-bg:#FEFAE0;--color-surface:#FFFFF5;--color-surface-sunken:#F7EFD6;--color-border:#E0D4B8;--color-border-strong:#CBB88F;--color-text:#2C1810;--color-text-muted:#7A5C4A;--color-success:#4F8A3E;--color-success-light:#E8F2E3;--color-warning:#E0A52E;--color-danger:#C0392B;--color-info:#2F7E7A;--color-info-light:#E2F0EF;--color-dark:#2C1810;--color-dark-elevated:#3B2418;--color-on-dark:#FEFAE0;--color-on-dark-muted:#9C8166;--font-display:'Helvetica Neue',Helvetica,Arial,sans-serif;--font-body:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;--radius-sm:6px;--radius-md:12px;--radius-lg:20px;--radius-full:9999px;--shadow-sm:0 1px 2px rgba(44,24,16,.06),0 1px 3px rgba(44,24,16,.08);--shadow-md:0 4px 14px rgba(44,24,16,.10);--shadow-lg:0 16px 40px rgba(44,24,16,.18);--ease-standard:cubic-bezier(.4,0,.2,1)}
body{font-family:var(--font-body);background:var(--color-bg);color:var(--color-text);-webkit-font-smoothing:antialiased;min-width:1024px}
.shell{display:flex;min-height:100vh}
.sidebar{width:220px;flex-shrink:0;background:var(--color-dark);padding:20px 14px;position:sticky;top:0;height:100vh;overflow:hidden;transition:width 250ms var(--ease-standard)}
.shell.collapsed .sidebar{width:72px;padding:20px 0}
.sb-head{display:flex;align-items:center;gap:9px;padding:0 8px 20px}
.shell.collapsed .sb-head{justify-content:center;padding:0 0 18px}
.sb-dot{width:10px;height:10px;border-radius:var(--radius-full);background:var(--color-primary);flex-shrink:0}
.shell.collapsed .sb-dot{width:12px;height:12px}
.sb-brand{font-family:var(--font-display);font-size:18px;font-weight:700;letter-spacing:-.5px;color:var(--color-on-dark);white-space:nowrap}
.shell.collapsed .sb-brand{display:none}
.sb-nav{display:flex;flex-direction:column;gap:2px}
.shell.collapsed .sb-nav{align-items:center;gap:6px}
.sb-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;cursor:pointer;color:#C7B299;font-size:14px;font-weight:500;white-space:nowrap;transition:background 150ms var(--ease-standard)}
.sb-ico{font-size:16px;opacity:.65;flex-shrink:0;width:18px;text-align:center}
.sb-item:hover{background:var(--color-dark-elevated)}
.sb-item.active{background:var(--color-primary);color:#fff;font-weight:600}
.sb-item.active .sb-ico{opacity:1}
.shell.collapsed .sb-label{display:none}
.shell.collapsed .sb-item{justify-content:center;width:44px;height:44px;padding:0;border-radius:10px}
.sb-collapse{margin-top:18px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:none;border:1px solid var(--color-dark-elevated);color:var(--color-on-dark-muted);border-radius:10px;padding:9px;font-size:13px;cursor:pointer}
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.topbar{background:var(--color-surface);border-bottom:1px solid var(--color-border);padding:14px 24px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:10}
.tb-title{font-family:var(--font-display);font-size:20px;font-weight:700;letter-spacing:-.5px;color:var(--color-text)}
.week-sel{display:flex;align-items:center;gap:8px;background:var(--color-surface-sunken);border:1px solid var(--color-border);border-radius:var(--radius-full);padding:7px 14px;margin-left:6px}
.week-sel .nav{color:var(--color-text-muted);cursor:pointer;font-size:16px;line-height:1;user-select:none}
.week-lbl{font-size:13px;font-weight:600;color:var(--color-text);min-width:120px;text-align:center}
.tb-right{margin-left:auto;display:flex;align-items:center;gap:12px}
.sync-chip{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;padding:7px 11px;border-radius:var(--radius-full)}
.sync-chip.ok{color:var(--color-secondary);background:var(--color-secondary-light);border:1px solid #cfe3ca}
.sync-chip.err{color:var(--color-danger);background:#FBEAE7;border:1px solid #f0c8c2}
.sync-chip .d{width:7px;height:7px;border-radius:var(--radius-full);background:var(--color-success)}
.sync-chip.err .d{background:var(--color-danger)}
.avatars{display:flex}
.av{width:30px;height:30px;border-radius:var(--radius-full);color:#fff;font-size:12px;font-weight:600;text-align:center;line-height:30px;border:2px solid var(--color-surface)}
.av.m{background:var(--color-primary)}.av.g{background:var(--color-secondary);margin-left:-8px}
.content{padding:22px 24px;overflow-y:auto}
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.kpi{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:14px 16px}
.kpi-lbl{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--color-text-muted);margin-bottom:8px}
.kpi-val{font-family:var(--font-display);font-size:24px;font-weight:700;letter-spacing:-.5px;color:var(--color-text)}
.kpi-val .u{font-size:13px;color:var(--color-on-dark-muted)}
.kpi.dark{background:var(--color-dark)}.kpi.dark .kpi-lbl{color:var(--color-on-dark-muted)}.kpi.dark .kpi-val{color:var(--color-on-dark)}
.ov-row2{display:grid;grid-template-columns:1fr 1.4fr;gap:16px;align-items:start}
.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:14px;padding:18px}
.budget-card{display:flex;align-items:center;gap:20px}
.donut-wrap{width:150px;height:150px;flex-shrink:0;position:relative}
.donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.dc-val{font-family:var(--font-display);font-size:24px;font-weight:700;letter-spacing:-1px;color:var(--color-text)}
.dc-sub{font-size:11px;color:var(--color-on-dark-muted);margin-top:2px}
.budget-legend{display:flex;flex-direction:column;gap:8px}
.lg{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;color:var(--color-text)}
.lg .sw{width:11px;height:11px;border-radius:4px;flex-shrink:0}
.prices-table{padding:6px 18px}
.prow{display:flex;align-items:center;padding:11px 0;border-bottom:1px solid #EDE2C6}
.prow:last-child{border-bottom:none}
.prow .pn{flex:1;font-size:14px;font-weight:600}.prow .ps{font-size:13px;color:var(--color-text-muted);width:120px}.prow .pp{font-size:13px;font-weight:600}
.muted{color:var(--color-text-muted);font-size:13px}
.gtable{background:var(--color-surface);border:1px solid var(--color-border);border-radius:14px;overflow:hidden}
.gt-head{display:grid;grid-template-columns:44px 2fr 1fr 1fr 1.2fr;background:var(--color-surface-sunken);border-bottom:1px solid var(--color-border)}
.gt-head>div{padding:12px 14px;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--color-text-muted)}
.gt-sec{padding:12px 16px;background:var(--color-surface);border-bottom:1px solid var(--color-border);font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--color-primary)}
.gt-row{display:grid;grid-template-columns:44px 2fr 1fr 1fr 1.2fr;border-bottom:1px solid #EDE2C6;align-items:center;transition:background 150ms var(--ease-standard)}
.gt-row:hover{background:#FFFDF2}
.gt-row>div{padding:13px 14px;font-size:13px;color:var(--color-text-muted)}
.gt-row .gt-name{font-size:14px;font-weight:500;color:var(--color-text)}
.gt-row.done .gt-name{color:var(--color-text-muted);text-decoration:line-through}
.gt-row .gt-price{font-weight:600;color:var(--color-text)}
.gt-check{width:18px;height:18px;border-radius:5px;border:2px solid var(--color-border-strong);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:11px}
.gt-check.on{background:var(--color-success);border-color:var(--color-success)}
.cal-wrap{overflow-x:auto}
.cal{min-width:820px;display:grid;grid-template-columns:88px repeat(7,1fr);gap:8px}
.cal-day{text-align:center;font-size:11px;font-weight:600;line-height:1.3;color:var(--color-text-muted);padding-bottom:4px}
.cal-day.today{color:var(--color-primary)}
.cal-day span{font-weight:400;color:var(--color-on-dark-muted)}
.cal-day.today span{color:var(--color-primary)}
.cal-slot{font-size:9px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--color-on-dark-muted);display:flex;align-items:center}
.cal-cell{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:8px;font-size:11px;font-weight:500;line-height:1.2;color:var(--color-text);min-height:46px}
.cal-cell.bf{border-left:3px solid var(--color-warning)}.cal-cell.lu{border-left:3px solid var(--color-primary)}.cal-cell.di{border-left:3px solid var(--color-secondary)}.cal-cell.sn{border-left:3px solid var(--color-info)}
.rec-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.rec-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm)}
.rec-thumb{height:96px;display:flex;align-items:center;justify-content:center;font-size:40px;background:var(--color-primary-light)}
.rec-body{padding:12px 14px}
.rec-name{font-family:var(--font-display);font-size:15px;font-weight:700;letter-spacing:-.3px;margin-bottom:5px}
.rec-meta{font-size:12px;color:var(--color-text-muted);margin-bottom:10px}
.rec-btn{width:100%;font-size:12px;font-weight:600;color:#fff;background:var(--color-primary);border:none;border-radius:9px;padding:9px 0;cursor:pointer}
.rec-btn:disabled{opacity:.55;cursor:not-allowed}
.placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:90px 0;color:var(--color-text-muted)}
.placeholder .ic{font-size:48px;margin-bottom:14px;opacity:.5}
.placeholder .t{font-size:16px;font-weight:600}
.view{display:none}
.wpf-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:760px}
.wpf-head{display:flex;align-items:center;gap:16px}
.wpf-av{width:52px;height:52px;border-radius:var(--radius-full);background:var(--color-primary);color:#fff;font-weight:700;font-size:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.wpf-av.sm{width:30px;height:30px;font-size:12px}
.wpf-name{font-family:var(--font-display);font-size:20px;font-weight:700;letter-spacing:-.3px}
.wpf-email{font-size:13px;color:var(--color-text-muted)}
.wpf-lbl{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--color-text-muted);margin-bottom:10px}
.wpf-member{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:500;margin-bottom:8px}
.wpf-btn{margin-top:12px;width:100%;background:var(--color-primary);color:#fff;border:none;border-radius:var(--radius-md);padding:12px;font-size:14px;font-weight:700;cursor:pointer}
.wpf-btn.danger{margin-top:0;background:var(--color-surface);color:var(--color-danger);border:1.5px solid var(--color-border)}
.wpf-chips{display:flex;gap:8px}
.wpf-chip{flex:1;background:var(--color-surface-sunken);border:1.5px solid var(--color-border);border-radius:10px;padding:10px;font-size:14px;font-weight:600;color:var(--color-text-muted);cursor:pointer}
.wpf-chip.on{border-color:var(--color-primary);background:var(--color-primary-light);color:var(--color-primary)}
.wpf-invite{display:flex;gap:8px;margin-top:12px}
.wpf-invite input{flex:1;min-width:0;padding:10px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface-sunken);font-size:12px;color:var(--color-text)}
.wpf-copy{background:var(--color-primary);color:#fff;border:none;border-radius:10px;padding:0 14px;font-size:13px;font-weight:700;cursor:pointer;flex-shrink:0}
`;

  const SCRIPT = `
var GROCERY = ${groceryJSON};
var RECIPES = ${recipesJSON};
var DEFAULT_PLAN = ${planJSON};
var MACROS = ${macrosJSON};
var DAYS=['lun','mar','mer','jeu','ven','sam','dim'];
var SLOTS=['breakfast','lunch','snack','dinner'];
var SLOT_FR={breakfast:'Petit-déj',lunch:'Déjeuner',snack:'Collation',dinner:'Dîner'};
var DAY_FR={lun:'Lun',mar:'Mar',mer:'Mer',jeu:'Jeu',ven:'Ven',sam:'Sam',dim:'Dim'};
var SLOT_CLASS={breakfast:'bf',lunch:'lu',snack:'sn',dinner:'di'};
var TITLES={overview:'Overview',shopping:'Courses',planning:'Planning',recipes:'Recettes',nutrition:'Nutrition',budget:'Budget',history:'Historique',profile:'Profil'};
var VIEWS=['overview','shopping','planning','recipes','nutrition','budget','history','profile'];
var DONUT_COLORS=['#C85A2A','#3D6B35','#E0A52E','#2F7E7A','#8b5cf6','#C0392B'];
var WS={checked:{},manualItems:[],plan:{},prices:{},recipes:[]};
var currentView='overview';
var currentWeek='';
var collapsed=false;
var donutChart=null;
var pollTimer=null;

function ge(id){return document.getElementById(id);}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}

// ── ISO week (UTC, same as Worker) ──
function isoWeekKey(d){var x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));var n=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-n);var ys=new Date(Date.UTC(x.getUTCFullYear(),0,1));var w=Math.ceil((((x-ys)/86400000)+1)/7);return x.getUTCFullYear()+'-W'+(w<10?'0':'')+w;}
function currentISOWeek(){return isoWeekKey(new Date());}
function parseWeekKey(wk){var p=(wk||'').split('-W');return {year:parseInt(p[0],10),week:parseInt(p[1],10)};}
function isoWeekMonday(y,w){var j=new Date(Date.UTC(y,0,4));var jd=j.getUTCDay()||7;var m=new Date(j);m.setUTCDate(j.getUTCDate()-(jd-1)+(w-1)*7);return m;}
function datesForWeek(wk){var p=parseWeekKey(wk);var m=isoWeekMonday(p.year,p.week);var o={};DAYS.forEach(function(d,i){var dt=new Date(m);dt.setUTCDate(m.getUTCDate()+i);o[d]=dt;});return o;}
function addWeeks(wk,n){var p=parseWeekKey(wk);var m=isoWeekMonday(p.year,p.week);m.setUTCDate(m.getUTCDate()+n*7);return isoWeekKey(m);}
function todayKey(){return ['dim','lun','mar','mer','jeu','ven','sam'][new Date().getDay()];}
function weekLabel(wk){var dates=datesForWeek(wk);var mon=dates['lun'];return 'Sem. '+parseWeekKey(wk).week+' · '+mon.toLocaleDateString('fr-FR',{day:'numeric',month:'short',timeZone:'UTC'});}

// ── data helpers ──
var SECTION_OF={}; GROCERY.forEach(function(s){s.items.forEach(function(it){SECTION_OF[it.id]=s;});});
function gItem(id){var r=null;GROCERY.forEach(function(s){s.items.forEach(function(it){if(it.id===id)r=it;});});return r;}
function sectionName(id){var s=SECTION_OF[id];if(s)return s.section;var m=(WS.manualItems||[]).filter(function(x){return x.id===id;})[0];return m?'Ajouté':'—';}
function defPrice(id){var it=gItem(id);return it?it.price:0;}
function priceOf(id){return (WS.prices&&WS.prices[id]!==undefined)?WS.prices[id]:defPrice(id);}
function nameOf(id){var it=gItem(id);if(it)return it.name;var m=(WS.manualItems||[]).filter(function(x){return x.id===id;})[0];return m?m.name:id;}
function parseGrams(qty){qty=(qty||'').toLowerCase();var m=qty.match(/([0-9]+([.,][0-9]+)?)/);var n=m?parseFloat(m[1].replace(',','.')):1;if(qty.indexOf('kg')>=0)return n*1000;if(qty.indexOf('ml')>=0)return n;if(qty.indexOf(' l')>=0||/^[0-9.,]+\\s*l$/.test(qty))return n*1000;if(qty.indexOf('g')>=0)return n;return n*100;}
function macroTotals(){var t={p:0,c:0,f:0,k:0};var ck=WS.checked||{};GROCERY.forEach(function(s){s.items.forEach(function(it){if(ck[it.id]&&MACROS[it.id]){var g=parseGrams(it.qty)/100;var mm=MACROS[it.id];t.p+=mm.p*g;t.c+=mm.c*g;t.f+=mm.f*g;t.k+=mm.k*g;}});});return t;}
function planForWeek(wk){var plan=(WS.plan&&typeof WS.plan==='object')?WS.plan:{};var primary=plan[wk]||null;var fb=null;if(!primary){var keys=Object.keys(plan).filter(function(k){return /^[0-9]{4}-W[0-9]{2}$/.test(k);}).sort();if(keys.length)fb=plan[keys[keys.length-1]];}var out={};DAYS.forEach(function(day){var sp=(primary&&primary[day])?primary[day]:{};var sf=(fb&&fb[day])?fb[day]:{};var dd={};SLOTS.forEach(function(slot){var def=(DEFAULT_PLAN[day]&&DEFAULT_PLAN[day][slot])||{name:'',type:'free'};dd[slot]=sp[slot]||sf[slot]||def;});out[day]=dd;});return out;}

// ── views ──
function kpiCard(lbl,val,unit,dark){return '<div class="kpi'+(dark?' dark':'')+'"><div class="kpi-lbl">'+lbl+'</div><div class="kpi-val">'+val+(unit?'<span class="u"> '+unit+'</span>':'')+'</div></div>';}
function budgetData(){var bySec={};var spent=0;var prices=WS.prices||{};Object.keys(prices).forEach(function(id){var v=prices[id];if(typeof v!=='number')return;spent+=v;var s=SECTION_OF[id];var key=s?s.section:'Autre';bySec[key]=(bySec[key]||0)+v;});var segs=Object.keys(bySec).map(function(k){return {name:k,val:bySec[k]};});return {segs:segs,spent:spent};}
function recentPrices(){var prices=WS.prices||{};var ids=Object.keys(prices).slice(-10).reverse();return ids.map(function(id){return {name:nameOf(id),section:sectionName(id),price:prices[id]};});}

function renderOverview(){
  var t=macroTotals();var b=budgetData();
  var rows=recentPrices().map(function(r){return '<div class="prow"><span class="pn">'+r.name+'</span><span class="ps">'+r.section+'</span><span class="pp">'+r.price+' RON</span></div>';}).join('');
  if(!rows)rows='<div class="muted" style="padding:14px 0">Aucun prix enregistré pour l\\'instant.</div>';
  var legend=b.segs.map(function(s,i){return '<span class="lg"><span class="sw" style="background:'+DONUT_COLORS[i%DONUT_COLORS.length]+'"></span>'+s.name+' '+Math.round(s.val)+'</span>';}).join('');
  if(!legend)legend='<span class="muted">Aucune dépense</span>';
  ge('viewOverview').innerHTML=
    '<div class="kpi-row">'+kpiCard('Protein',Math.round(t.p),'g',false)+kpiCard('Carbs',Math.round(t.c),'g',false)+kpiCard('Fats',Math.round(t.f),'g',false)+kpiCard('Calories',Math.round(t.k).toLocaleString('fr-FR'),'',true)+'</div>'
   +'<div class="ov-row2"><div class="card budget-card"><div class="donut-wrap"><canvas id="budgetDonut"></canvas><div class="donut-center" id="donutCenter"></div></div><div class="budget-legend">'+legend+'</div></div>'
   +'<div class="card prices-table">'+rows+'</div></div>';
  renderDonut(b.segs,b.spent,100);
}
function renderDonut(segs,spent,ceiling){
  var ctx=ge('budgetDonut');if(!ctx||typeof Chart==='undefined')return;
  var data=segs.map(function(s){return s.val;});var labels=segs.map(function(s){return s.name;});
  if(donutChart){donutChart.destroy();donutChart=null;}
  donutChart=new Chart(ctx,{type:'doughnut',data:{labels:labels.length?labels:['—'],datasets:[{data:data.length?data:[1],backgroundColor:data.length?DONUT_COLORS:['#E0D4B8'],borderWidth:0}]},options:{cutout:'64%',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:data.length>0}}}});
  ge('donutCenter').innerHTML='<div class="dc-val">'+Math.round(spent)+' RON</div><div class="dc-sub">/ '+ceiling+' RON</div>';
}

function renderShopping(){
  var ck=WS.checked||{};
  var html='<div class="gtable"><div class="gt-head"><div></div><div>Article</div><div>Quantité</div><div>Prix</div><div>Coché par</div></div>';
  GROCERY.forEach(function(sec){
    html+='<div class="gt-sec">'+sec.icon+' '+sec.section+'</div>';
    sec.items.forEach(function(it){var c=ck[it.id];
      html+='<div class="gt-row'+(c?' done':'')+'"><div><span class="gt-check'+(c?' on':'')+'">'+(c?'&#10003;':'')+'</span></div><div class="gt-name">'+it.name+'</div><div>'+it.qty+'</div><div class="gt-price">'+priceOf(it.id)+' RON</div><div>'+(c?c.by:'—')+'</div></div>';
    });
  });
  var mans=WS.manualItems||[];
  if(mans.length){html+='<div class="gt-sec">&#9998; Ajoutés manuellement</div>';mans.forEach(function(m){var c=ck[m.id];html+='<div class="gt-row'+(c?' done':'')+'"><div><span class="gt-check'+(c?' on':'')+'">'+(c?'&#10003;':'')+'</span></div><div class="gt-name">'+m.name+'</div><div>'+(m.qty||'')+'</div><div>—</div><div>'+(c?c.by:'—')+'</div></div>';});}
  html+='</div>';
  ge('viewShopping').innerHTML=html;
}

function renderPlanning(){
  var wk=currentWeek;var plan=planForWeek(wk);var dates=datesForWeek(wk);var realWk=currentISOWeek();var tk=todayKey();
  var html='<div class="cal-wrap"><div class="cal"><div></div>';
  DAYS.forEach(function(d){var isT=(wk===realWk&&d===tk);html+='<div class="cal-day'+(isT?' today':'')+'">'+DAY_FR[d]+'<br><span>'+dates[d].getUTCDate()+'</span></div>';});
  SLOTS.forEach(function(slot){
    html+='<div class="cal-slot">'+SLOT_FR[slot]+'</div>';
    DAYS.forEach(function(d){var m=plan[d][slot];html+='<div class="cal-cell '+(SLOT_CLASS[slot]||'')+'">'+(m.name||'')+'</div>';});
  });
  html+='</div></div>';
  ge('viewPlanning').innerHTML=html;
}

function renderRecipes(){
  var list=(WS.recipes&&WS.recipes.length)?WS.recipes:RECIPES;
  var html='<div class="rec-grid">';
  list.forEach(function(r){
    var img=r.image||'';var thumb=(img.indexOf('http')===0)?'<div class="rec-thumb" style="padding:0"><img src="'+img+'" style="width:100%;height:96px;object-fit:cover"></div>':'<div class="rec-thumb">'+(img||'🍽️')+'</div>';
    html+='<div class="rec-card">'+thumb+'<div class="rec-body"><div class="rec-name">'+(r.name||'')+'</div><div class="rec-meta">'+((r.ingredients||[]).length)+' ingrédients · '+(r.servings||2)+' portions</div><button class="rec-btn" disabled title="Lecture seule (web)">+ Ajouter au panier</button></div></div>';
  });
  html+='</div>';
  ge('viewRecipes').innerHTML=html;
}

function renderCurrent(){
  if(currentView==='overview')renderOverview();
  else if(currentView==='shopping')renderShopping();
  else if(currentView==='planning')renderPlanning();
  else if(currentView==='recipes')renderRecipes();
  else if(currentView==='profile')renderProfileWeb();
}
function wInit(n){n=(n||'').trim();if(!n)return '?';var p=n.split(/\\s+/);return (p[0].charAt(0)+(p[1]?p[1].charAt(0):'')).toUpperCase();}
function renderProfileWeb(){
  fetch('/auth/me').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(d){
    var members=(d.members||[]).map(function(m){return '<div class="wpf-member"><span class="wpf-av sm">'+wInit(m.name)+'</span>'+m.name+'</div>';}).join('');
    var langs=['fr','en','ro'].map(function(l){return '<button class="wpf-chip'+(d.lang===l?' on':'')+'" data-pflang="'+l+'">'+l.toUpperCase()+'</button>';}).join('');
    var curs=['RON','EUR','USD'].map(function(c){return '<button class="wpf-chip'+(d.currency===c?' on':'')+'" data-pfcur="'+c+'">'+c+'</button>';}).join('');
    ge('viewProfile').innerHTML='<div class="wpf-grid">'
      +'<div class="card wpf-head"><span class="wpf-av">'+wInit(d.name)+'</span><div><div class="wpf-name">'+d.name+'</div><div class="wpf-email">'+d.email+'</div></div></div>'
      +'<div class="card"><div class="wpf-lbl">Foyer · '+((d.members||[]).length)+' membre(s)</div>'+members+'<button class="wpf-btn" id="wpfInvite">+ Inviter un partenaire</button><div id="wpfInviteBox"></div></div>'
      +'<div class="card"><div class="wpf-lbl">Langue</div><div class="wpf-chips">'+langs+'</div><div class="wpf-lbl" style="margin-top:16px">Devise</div><div class="wpf-chips">'+curs+'</div></div>'
      +'<div class="card"><form method="POST" action="/auth/logout"><button class="wpf-btn danger" type="submit">Se déconnecter</button></form></div></div>';
    ge('wpfInvite').addEventListener('click',wCreateInvite);
    document.querySelectorAll('[data-pflang]').forEach(function(b){b.addEventListener('click',function(){wSavePrefs({lang:b.getAttribute('data-pflang')});});});
    document.querySelectorAll('[data-pfcur]').forEach(function(b){b.addEventListener('click',function(){wSavePrefs({currency:b.getAttribute('data-pfcur')});});});
  }).catch(function(){ge('viewProfile').innerHTML='<div class="card">Session expirée. <a href="/login">Se reconnecter</a></div>';});
}
function wCreateInvite(){var b=ge('wpfInvite');b.disabled=true;b.textContent='…';fetch('/api/invite/create',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.json();}).then(function(d){ge('wpfInviteBox').innerHTML='<div class="wpf-invite"><input id="wpfLink" readonly value="'+d.inviteUrl+'"><button class="wpf-copy" id="wpfCopy">Copier</button></div>';b.style.display='none';ge('wpfCopy').addEventListener('click',function(){var i=ge('wpfLink');i.select();if(navigator.clipboard){navigator.clipboard.writeText(i.value);ge('wpfCopy').textContent='Copié ✓';}});}).catch(function(){b.disabled=false;b.textContent='+ Inviter un partenaire';});}
function wSavePrefs(p){fetch('/api/user/prefs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}).then(function(){renderProfileWeb();}).catch(function(){});}

function showView(v){
  if(VIEWS.indexOf(v)<0)v='overview';
  currentView=v;
  VIEWS.forEach(function(x){var el=ge('view'+cap(x));if(el)el.style.display=(x===v)?'block':'none';});
  document.querySelectorAll('.sb-item').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-view')===v);});
  ge('tbTitle').textContent=TITLES[v]||v;
  ge('weekSel').style.display=(v==='overview'||v==='planning')?'flex':'none';
  renderCurrent();
}

function setSync(s){var c=ge('syncChip');if(!c)return;c.className='sync-chip '+(s==='ok'?'ok':'err');c.querySelector('.lbl').textContent=(s==='ok'?'Synced':'Hors ligne');}

function fetchState(){
  fetch('/api/state').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(d){WS=d;setSync('ok');renderCurrent();}).catch(function(){setSync('err');});
}

(function init(){
  currentWeek=currentISOWeek();
  ge('weekLbl').textContent=weekLabel(currentWeek);
  // sidebar nav
  document.querySelectorAll('.sb-item').forEach(function(b){b.addEventListener('click',function(){location.hash=b.getAttribute('data-view');});});
  ge('sbCollapse').addEventListener('click',function(){collapsed=!collapsed;ge('shell').classList.toggle('collapsed',collapsed);});
  // week nav
  ge('wkPrev').addEventListener('click',function(){currentWeek=addWeeks(currentWeek,-1);ge('weekLbl').textContent=weekLabel(currentWeek);renderCurrent();});
  ge('wkNext').addEventListener('click',function(){currentWeek=addWeeks(currentWeek,1);ge('weekLbl').textContent=weekLabel(currentWeek);renderCurrent();});
  // hash routing
  window.addEventListener('hashchange',function(){showView((location.hash||'#overview').slice(1));});
  showView((location.hash||'#overview').slice(1));
  fetchState();
  pollTimer=setInterval(fetchState,5000);
})();
`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#2C1810">
<title>NutriPair · Dashboard</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<style>${CSS}</style>
</head>
<body>
<div class="shell" id="shell">
  <aside class="sidebar">
    <div class="sb-head"><span class="sb-dot"></span><span class="sb-brand">NutriPair</span></div>
    <nav class="sb-nav">
      <div class="sb-item active" data-view="overview"><span class="sb-ico">📊</span><span class="sb-label">Overview</span></div>
      <div class="sb-item" data-view="shopping"><span class="sb-ico">🛒</span><span class="sb-label">Shopping</span></div>
      <div class="sb-item" data-view="planning"><span class="sb-ico">📅</span><span class="sb-label">Planning</span></div>
      <div class="sb-item" data-view="recipes"><span class="sb-ico">📖</span><span class="sb-label">Recipes</span></div>
      <div class="sb-item" data-view="nutrition"><span class="sb-ico">🥗</span><span class="sb-label">Nutrition</span></div>
      <div class="sb-item" data-view="budget"><span class="sb-ico">💰</span><span class="sb-label">Budget</span></div>
      <div class="sb-item" data-view="history"><span class="sb-ico">🕑</span><span class="sb-label">History</span></div>
      <div class="sb-item" data-view="profile"><span class="sb-ico">👤</span><span class="sb-label">Profil</span></div>
    </nav>
    <button class="sb-collapse" id="sbCollapse">⟨⟩</button>
  </aside>
  <main class="main">
    <div class="topbar">
      <div class="tb-title" id="tbTitle">Overview</div>
      <div class="week-sel" id="weekSel"><span class="nav" id="wkPrev">‹</span><span class="week-lbl" id="weekLbl">—</span><span class="nav" id="wkNext">›</span></div>
      <div class="tb-right">
        <span class="sync-chip ok" id="syncChip"><span class="d"></span><span class="lbl">Synced</span></span>
        <div class="avatars"><span class="av m">M</span><span class="av g">G</span></div>
      </div>
    </div>
    <div class="content">
      <div class="view" id="viewOverview" style="display:block"></div>
      <div class="view" id="viewShopping"></div>
      <div class="view" id="viewPlanning"></div>
      <div class="view" id="viewRecipes"></div>
      <div class="view" id="viewNutrition"><div class="placeholder"><div class="ic">🥗</div><div class="t">Nutrition — Coming soon</div></div></div>
      <div class="view" id="viewBudget"><div class="placeholder"><div class="ic">💰</div><div class="t">Budget — Coming soon</div></div></div>
      <div class="view" id="viewHistory"><div class="placeholder"><div class="ic">🕑</div><div class="t">History — Coming soon</div></div></div>
      <div class="view" id="viewProfile"></div>
    </div>
  </main>
</div>
<script>${SCRIPT}</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH  (Supabase Auth — ES256 JWT validation via JWKS + crypto.subtle; REST via fetch)
// ─────────────────────────────────────────────────────────────────────────────
function toHex(u8) { return Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join(''); }

// ── base64url decode ──
function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64urlToString(s) { return new TextDecoder().decode(b64urlToBytes(s)); }

// ── JWKS cache (this project signs with ES256) — survives between requests in the same isolate ──
let JWKS_KEYS = null;
async function getJwks(env) {
  if (JWKS_KEYS) return JWKS_KEYS;
  const res = await fetch(env.SUPABASE_URL + '/auth/v1/.well-known/jwks.json');
  if (!res.ok) throw new Error('jwks fetch failed');
  const data = await res.json();
  const keys = {};
  for (const jwk of (data.keys || [])) {
    const importAlgo = jwk.kty === 'EC'
      ? { name: 'ECDSA', namedCurve: jwk.crv || 'P-256' }
      : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
    keys[jwk.kid] = { key: await crypto.subtle.importKey('jwk', jwk, importAlgo, false, ['verify']), kty: jwk.kty };
  }
  JWKS_KEYS = keys;
  return keys;
}
// Validate a Supabase access token locally. Returns the JWT payload, or null.
async function verifyJwt(token, env) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header  = JSON.parse(b64urlToString(parts[0]));
    const payload = JSON.parse(b64urlToString(parts[1]));
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;          // expired
    let keys = await getJwks(env);
    let entry = keys[header.kid];
    if (!entry) { JWKS_KEYS = null; keys = await getJwks(env); entry = keys[header.kid]; } // key rotation
    if (!entry) return null;
    const verifyAlgo = entry.kty === 'EC' ? { name: 'ECDSA', hash: 'SHA-256' } : { name: 'RSASSA-PKCS1-v1_5' };
    const ok = await crypto.subtle.verify(verifyAlgo, entry.key,
      b64urlToBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
    return ok ? payload : null;
  } catch (e) { return null; }
}

// ── cookies ──
function cookieVal(request, name) {
  const c = request.headers.get('Cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}
const AUTH_MAXAGE = 604800; // 7 days
function setCookie(name, val) { return name + '=' + val + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=' + AUTH_MAXAGE; }
function clearCookie(name)    { return name + '=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'; }
function sessionCookies(access, refresh) { return [ setCookie('sb-access-token', access), setCookie('sb-refresh-token', refresh || '') ]; }

// ── Supabase REST + GoTrue helpers (fetch only, no SDK) ──
function supabase(env, path, options, token) {
  const o = options || {};
  return fetch(env.SUPABASE_URL + '/rest/v1/' + path, {
    method: o.method || 'GET',
    headers: Object.assign({
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + (token || env.SUPABASE_ANON_KEY),
      'Content-Type': 'application/json',
      'Prefer': o.prefer || 'return=representation'
    }, o.headers || {}),
    body: o.body
  });
}
function gotrue(env, path, body) {
  return fetch(env.SUPABASE_URL + '/auth/v1/' + path, {
    method: 'POST',
    headers: { 'apikey': env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// userId → { householdId, name, lang, currency } short-lived isolate cache
const PROFILE_CACHE = new Map();
function clearProfileCache(userId) { PROFILE_CACHE.delete(userId); }
async function profileFor(userId, token, env) {
  const c = PROFILE_CACHE.get(userId);
  if (c && (Date.now() - c.at) < 30000) return c;
  const r = await supabase(env, 'profiles?id=eq.' + userId + '&select=household_id,name,lang,currency', {}, token);
  if (!r.ok) return null;
  const rows = await r.json();
  if (!rows[0]) return null;
  const rec = { householdId: rows[0].household_id, name: rows[0].name, lang: rows[0].lang, currency: rows[0].currency, at: Date.now() };
  PROFILE_CACHE.set(userId, rec);
  return rec;
}
// Validate the request's access token → { userId, email, name, householdId, token } or null.
async function getUser(request, env) {
  let token = cookieVal(request, 'sb-access-token');
  const auth = request.headers.get('Authorization');
  if (!token && auth && auth.indexOf('Bearer ') === 0) token = auth.slice(7);
  if (!token) return null;
  const payload = await verifyJwt(token, env);
  if (!payload || !payload.sub) return null;
  const prof = await profileFor(payload.sub, token, env);
  return {
    userId: payload.sub,
    email: payload.email,
    name: (prof && prof.name) || (payload.user_metadata && payload.user_metadata.name) || 'Membre',
    householdId: prof ? prof.householdId : null,
    token
  };
}
// Exchange a refresh token for a fresh session. Returns { access_token, refresh_token } or null.
async function refreshSession(request, env) {
  const rt = cookieVal(request, 'sb-refresh-token');
  if (!rt) return null;
  const res = await gotrue(env, 'token?grant_type=refresh_token', { refresh_token: rt });
  if (!res.ok) return null;
  try { return await res.json(); } catch (e) { return null; }
}

function redirectRes(location, cookies) {
  const h = new Headers({ 'Location': location });
  (Array.isArray(cookies) ? cookies : (cookies ? [cookies] : [])).forEach(c => h.append('Set-Cookie', c));
  return new Response(null, { status: 302, headers: h });
}
// attach freshly-rotated session cookies to any Response (used after a silent refresh)
function withCookies(resp, cookies) {
  if (!cookies || !cookies.length) return resp;
  const h = new Headers(resp.headers);
  cookies.forEach(c => h.append('Set-Cookie', c));
  return new Response(resp.body, { status: resp.status, headers: h });
}
function jsonRes(obj, status, extra) { return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, extra || {}) }); }
function htmlRes(html) { return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store' } }); }
// only allow same-origin relative paths as redirect targets
function safeNext(n) { return (typeof n === 'string' && n.charAt(0) === '/' && n.charAt(1) !== '/') ? n : '/'; }
async function parseBody(request) {
  const ct = request.headers.get('Content-Type') || '';
  if (ct.indexOf('application/json') >= 0) { try { return await request.json(); } catch (e) { return {}; } }
  const params = new URLSearchParams(await request.text());
  const o = {}; for (const [k, v] of params) o[k] = v; return o;
}

/** Shared design tokens + auth-page chrome for the login / invite pages. */
const AUTH_CSS = `*{box-sizing:border-box;margin:0;padding:0}
:root{--color-primary:#C85A2A;--color-primary-light:#FDF0E8;--color-primary-hover:#AD4B22;--color-secondary:#3D6B35;--color-bg:#FEFAE0;--color-surface:#FFFFF5;--color-surface-sunken:#F7EFD6;--color-border:#E0D4B8;--color-text:#2C1810;--color-text-muted:#7A5C4A;--color-danger:#C0392B;--font-display:'Helvetica Neue',Helvetica,Arial,sans-serif;--font-body:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;--radius-md:12px;--radius-lg:20px;--shadow-md:0 4px 14px rgba(44,24,16,.10)}
body{font-family:var(--font-body);background:var(--color-surface-sunken);color:var(--color-text);min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;-webkit-font-smoothing:antialiased}
.auth-card{background:var(--color-surface);border:1.5px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);padding:30px 28px;width:100%;max-width:380px}
.auth-logo{display:flex;align-items:center;gap:9px;justify-content:center;margin-bottom:22px}
.auth-logo .dot{width:11px;height:11px;border-radius:9999px;background:var(--color-primary)}
.auth-logo .brand{font-family:var(--font-display);font-size:24px;font-weight:700;letter-spacing:-.5px}
.auth-tabs{display:flex;gap:6px;background:var(--color-surface-sunken);border:1px solid var(--color-border);border-radius:10px;padding:4px;margin-bottom:18px}
.auth-tab{flex:1;border:none;background:none;padding:9px;border-radius:7px;font:600 13px/1 var(--font-body);color:var(--color-text-muted);cursor:pointer}
.auth-tab.active{background:var(--color-surface);color:var(--color-primary);box-shadow:0 1px 2px rgba(44,24,16,.08)}
.auth-err{background:#FBEAE7;border:1px solid #f0c8c2;color:var(--color-danger);font-size:13px;font-weight:500;padding:10px 12px;border-radius:10px;margin-bottom:14px}
.auth-card label{display:block;font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--color-text-muted);margin:0 0 6px}
.auth-card input{width:100%;padding:12px 13px;border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:15px;background:var(--color-surface-sunken);color:var(--color-text);outline:none;margin-bottom:14px;font-family:inherit}
.auth-card input:focus{border-color:var(--color-primary)}
.auth-submit{width:100%;background:var(--color-primary);color:#fff;border:none;border-radius:var(--radius-md);padding:14px;font-size:15px;font-weight:700;cursor:pointer}
.inv-q{font-size:16px;line-height:1.5;text-align:center;margin:8px 0 18px}
.inv-no{display:block;text-align:center;margin-top:14px;font-size:13px;color:var(--color-text-muted);text-decoration:none}`;

/** @returns {string} the full login / register page (public, no session). */
function buildLoginHTML(url) {
  const error = url.searchParams.get('error') || '';
  const mode  = url.searchParams.get('mode') === 'register' ? 'register' : 'login';
  const next  = safeNext(url.searchParams.get('next'));
  const ERR = { creds:'Email ou mot de passe incorrect.', exists:'Un compte existe déjà avec cet email.', email:'Adresse email invalide.', password:'Le mot de passe doit faire au moins 8 caractères.' };
  const errBox = error ? '<div class="auth-err">' + (ERR[error] || 'Une erreur est survenue.') + '</div>' : '';
  return `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#F7EFD6"><title>NutriPair · Connexion</title>
<style>${AUTH_CSS}</style></head><body>
<div class="auth-card">
  <div class="auth-logo"><span class="dot"></span><span class="brand">NutriPair</span></div>
  <div class="auth-tabs"><button class="auth-tab" id="tabLogin" type="button">Se connecter</button><button class="auth-tab" id="tabReg" type="button">Créer un compte</button></div>
  ${errBox}
  <form method="POST" id="authForm" action="/auth/login">
    <div id="nameRow" style="display:none"><label>Nom</label><input type="text" name="name" id="fName" autocomplete="name" maxlength="40"></div>
    <label>Email</label><input type="email" name="email" required autocomplete="email">
    <label>Mot de passe</label><input type="password" name="password" id="fPass" required minlength="8" autocomplete="current-password">
    <input type="hidden" name="next" value="${next}">
    <button class="auth-submit" id="submitBtn" type="submit">Se connecter</button>
  </form>
</div>
<script>
var mode='${mode}';
function ge(id){return document.getElementById(id);}
function setMode(m){
  mode=m;var login=(m==='login');
  ge('authForm').action=login?'/auth/login':'/auth/register';
  ge('nameRow').style.display=login?'none':'block';
  ge('fName').required=!login;
  ge('fPass').setAttribute('autocomplete',login?'current-password':'new-password');
  ge('submitBtn').textContent=login?'Se connecter':'Créer mon compte';
  ge('tabLogin').classList.toggle('active',login);
  ge('tabReg').classList.toggle('active',!login);
}
ge('tabLogin').addEventListener('click',function(){setMode('login');});
ge('tabReg').addEventListener('click',function(){setMode('register');});
setMode(mode);
</script></body></html>`;
}

/** @returns {string} the invitation accept page. */
function invitePage(token, errorMsg, creatorName) {
  const body = errorMsg
    ? '<div class="auth-err">' + errorMsg + '</div><a class="auth-submit" href="/" style="display:block;text-align:center;text-decoration:none">Retour à l\'app</a>'
    : '<p class="inv-q">Rejoindre le foyer de <strong>' + creatorName + '</strong> ?<br>Vous partagerez la même liste de courses et le même planning.</p>'
      + '<form method="POST" action="/invite/' + token + '/accept"><button class="auth-submit" type="submit">Accepter l\'invitation</button></form>'
      + '<a class="inv-no" href="/">Non merci</a>';
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#F7EFD6"><title>NutriPair · Invitation</title><style>${AUTH_CSS}</style></head><body>
<div class="auth-card"><div class="auth-logo"><span class="dot"></span><span class="brand">NutriPair</span></div>${body}</div>
</body></html>`;
}

/**
 * One-time migration of a household's legacy KV recipes + meal plan into Supabase.
 * Runs on the first authenticated request once the schema is live. Idempotent two ways:
 *   1. a KV marker (h:{hid}:sbmigrated) makes it a true one-shot per household;
 *   2. it only migrates when the recipes table is currently empty for the household.
 * Safe before the schema exists: the count query fails → we return without marking,
 * so it simply retries on a later request. Never resets real data to defaults.
 */
async function migrateKvToSupabase(env, hid, token, kvRecipes, kvPlan) {
  if (!hid) return;
  const marker = 'h:' + hid + ':sbmigrated';
  try {
    if (await env.KV.get(marker)) return;                              // already migrated
    const head = await supabase(env, 'recipes?household_id=eq.' + hid + '&select=id&limit=1', {}, token);
    if (!head.ok) return;                                              // schema not live yet → retry later
    const existing = await head.json();
    if (existing.length > 0) { await env.KV.put(marker, '1'); return; } // household already has DB data

    const migratedIds = new Set();
    if (Array.isArray(kvRecipes) && kvRecipes.length) {
      const rows = kvRecipes.map(r => {
        migratedIds.add(r.id);
        const isUrl = (r.image || '').indexOf('http') === 0;
        return { id: r.id, household_id: hid, name: r.name || '', emoji: isUrl ? null : (r.image || null),
                 photo_url: isUrl ? r.image : null, servings: r.servings || 2, ingredients: r.ingredients || [] };
      });
      await supabase(env, 'recipes', { method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }, token);
    }
    if (kvPlan && typeof kvPlan === 'object') {
      const rows = [];
      for (const week of Object.keys(kvPlan)) {
        if (!/^\d{4}-W\d{2}$/.test(week)) continue;                    // only week-keyed entries
        const days = kvPlan[week] || {};
        for (const day of Object.keys(days)) {
          const slots = days[day] || {};
          for (const slot of Object.keys(slots)) {
            const m = slots[slot] || {};
            if (!m.name && !m.detail) continue;                        // skip empty slots
            const rid = (m.recipeId || m.recipe_id);
            rows.push({ household_id: hid, week_key: week, day, slot, name: m.name || '', detail: m.detail || '',
                        type: m.type || 'free', time: m.time || '', recipe_id: migratedIds.has(rid) ? rid : null });
          }
        }
      }
      if (rows.length) await supabase(env, 'meal_plans', { method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) }, token);
    }
    await env.KV.put(marker, '1');
    console.log('migrated KV recipes/plan to Supabase for household ' + hid);
  } catch (e) { /* leave marker unset → retry on a later request */ }
}

/**
 * Build the full client state: KV holds the live shopping list; Supabase holds
 * recipes + the weekly meal plan. We read KV and overlay the Supabase data so
 * mobile + web clients still get everything in a single /api/state response.
 * @returns {Object} { checked, manualItems, prices, itemOverrides, manualHistory, resetAt, recipes, plan }
 */
async function mergedState(env, skey, hid, token) {
  let raw = await env.KV.get(skey);
  if (!raw) {                                   // one-time legacy KV migration (shopping fields only)
    const legacy = await env.KV.get('state');
    if (legacy) { await env.KV.put(skey, legacy); raw = legacy; }
  }
  const s = raw ? JSON.parse(raw) : { checked: {}, manualItems: [], prices: {}, itemOverrides: {}, manualHistory: [], resetAt: null };
  // one-time: lift legacy KV recipes + plan into Supabase before we overlay from it
  await migrateKvToSupabase(env, hid, token, s.recipes, s.plan);
  // recipes + plan come from Supabase, not KV
  s.plan = {};
  s.recipes = [];
  try {
    const rr = await supabase(env, 'recipes?household_id=eq.' + hid + '&select=*&order=created_at', {}, token);
    if (rr.ok) s.recipes = (await rr.json()).map(r => ({
      id: r.id, name: r.name, image: r.photo_url || r.emoji || '', servings: r.servings, ingredients: r.ingredients || []
    }));
  } catch (e) {}
  try {
    const mr = await supabase(env, 'meal_plans?household_id=eq.' + hid + '&select=*', {}, token);
    if (mr.ok) for (const row of await mr.json()) {
      if (!s.plan[row.week_key]) s.plan[row.week_key] = {};
      if (!s.plan[row.week_key][row.day]) s.plan[row.week_key][row.day] = {};
      s.plan[row.week_key][row.day][row.slot] = {
        name: row.name || '', detail: row.detail || '', type: row.type || 'free', time: row.time || '', recipeId: row.recipe_id || null
      };
    }
  } catch (e) {}
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
//  WORKER HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    // ══════════════════ PUBLIC AUTH ROUTES (delegated to Supabase) ══════════════════

    // GET /login — login / register page
    if (path === '/login' && method === 'GET') return htmlRes(buildLoginHTML(url));

    // POST /auth/register {email, password, name} → Supabase signup (trigger provisions household+profile)
    if (path === '/auth/register' && method === 'POST') {
      const b = await parseBody(request);
      const email = (b.email || '').trim().toLowerCase();
      const password = b.password || '';
      const name = (b.name || '').trim() || 'Membre';
      const next = safeNext(b.next);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return redirectRes('/login?mode=register&error=email');
      if (password.length < 8) return redirectRes('/login?mode=register&error=password');
      const res = await gotrue(env, 'signup', { email, password, data: { name } });
      if (!res.ok) return redirectRes('/login?mode=register&error=exists');
      let data = {}; try { data = await res.json(); } catch (e) {}
      // Email-confirmation OFF → session returned immediately; ON → user must confirm first.
      if (data.access_token) return redirectRes(next, sessionCookies(data.access_token, data.refresh_token));
      return redirectRes('/login?pending=1');
    }

    // POST /auth/login {email, password} → Supabase password grant
    if (path === '/auth/login' && method === 'POST') {
      const b = await parseBody(request);
      const email = (b.email || '').trim().toLowerCase();
      const next = safeNext(b.next);
      const res = await gotrue(env, 'token?grant_type=password', { email, password: b.password || '' });
      if (!res.ok) return redirectRes('/login?error=creds');
      let data = {}; try { data = await res.json(); } catch (e) {}
      if (!data.access_token) return redirectRes('/login?error=creds');
      return redirectRes(next, sessionCookies(data.access_token, data.refresh_token));
    }

    // POST /auth/logout → revoke at Supabase + clear cookies
    if (path === '/auth/logout' && method === 'POST') {
      const token = cookieVal(request, 'sb-access-token');
      if (token) { try { await fetch(env.SUPABASE_URL + '/auth/v1/logout', { method: 'POST', headers: { 'apikey': env.SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token } }); } catch (e) {} }
      return redirectRes('/login', [clearCookie('sb-access-token'), clearCookie('sb-refresh-token')]);
    }

    // GET /auth/me → current user JSON (from profiles)
    if (path === '/auth/me' && method === 'GET') {
      const u = await getUser(request, env);
      if (!u) return jsonRes({ error: 'unauthorized' }, 401);
      const prof = await profileFor(u.userId, u.token, env);
      let members = [];
      if (prof && prof.householdId) {
        const mr = await supabase(env, 'profiles?household_id=eq.' + prof.householdId + '&select=id,name', {}, u.token);
        if (mr.ok) members = (await mr.json()).map(m => ({ userId: m.id, name: m.name }));
      }
      return jsonRes({ userId: u.userId, name: u.name, email: u.email, householdId: prof ? prof.householdId : null, lang: prof ? (prof.lang || 'fr') : 'fr', currency: prof ? (prof.currency || 'RON') : 'RON', members });
    }

    // /invite/{token}  (GET = accept page, POST .../accept = join). Backed by invitations table.
    if (path.indexOf('/invite/') === 0) {
      const acceptMatch = path.match(/^\/invite\/([^\/]+)\/accept$/);
      if (acceptMatch && method === 'POST') {
        const token = acceptMatch[1];
        const u = await getUser(request, env);
        if (!u) return redirectRes('/login?next=' + encodeURIComponent('/invite/' + token));
        const ir = await supabase(env, 'invitations?token=eq.' + encodeURIComponent(token) + '&select=*', {}, u.token);
        if (!ir.ok) return redirectRes('/?error=invite_invalid');
        const inv = (await ir.json())[0];
        if (!inv || inv.used || new Date(inv.expires_at).getTime() < Date.now()) return redirectRes('/?error=invite_expired');
        // Join: repoint my profile at the inviter's household, then burn the token.
        await supabase(env, 'profiles?id=eq.' + u.userId, { method: 'PATCH', body: JSON.stringify({ household_id: inv.household_id }) }, u.token);
        await supabase(env, 'invitations?id=eq.' + inv.id, { method: 'PATCH', body: JSON.stringify({ used: true }) }, u.token);
        clearProfileCache(u.userId);
        return redirectRes('/');
      }
      if (method === 'GET') {
        const token = path.slice('/invite/'.length).replace(/\/.*$/, '');
        const u = await getUser(request, env);
        if (!u) return redirectRes('/login?next=' + encodeURIComponent('/invite/' + token));
        const ir = await supabase(env, 'invitations?token=eq.' + encodeURIComponent(token) + '&select=*', {}, u.token);
        if (!ir.ok) return htmlRes(invitePage(null, 'Lien d\'invitation invalide.'));
        const inv = (await ir.json())[0];
        if (!inv || inv.used || new Date(inv.expires_at).getTime() < Date.now()) return htmlRes(invitePage(null, 'Cette invitation a expiré ou a déjà été utilisée.'));
        let creatorName = 'votre partenaire';
        const cr = await supabase(env, 'profiles?id=eq.' + inv.created_by + '&select=name', {}, u.token);
        if (cr.ok) { const c = await cr.json(); if (c[0]) creatorName = c[0].name; }   // null if cross-household (RLS) → fallback
        return htmlRes(invitePage(token, null, creatorName));
      }
    }

    // ══════════════════ AUTH GATE (Supabase JWT, with silent refresh) ══════════════════
    // Public PWA assets stay open so install/icon works pre-login.
    const PUBLIC_ASSET = (path === '/manifest.json' || path === '/icon.svg');
    let user = PUBLIC_ASSET ? null : await getUser(request, env);
    let refreshedCookies = null;
    if (!PUBLIC_ASSET && !user) {
      const rs = await refreshSession(request, env);                 // access token expired? try the refresh token
      if (rs && rs.access_token) {
        const payload = await verifyJwt(rs.access_token, env);
        if (payload && payload.sub) {
          const prof = await profileFor(payload.sub, rs.access_token, env);
          user = { userId: payload.sub, email: payload.email, name: (prof && prof.name) || 'Membre', householdId: prof ? prof.householdId : null, token: rs.access_token };
          refreshedCookies = sessionCookies(rs.access_token, rs.refresh_token);   // rotated → must persist on this response
        }
      }
    }
    if (!PUBLIC_ASSET && !user) {
      if (path.indexOf('/api/') === 0) return jsonRes({ error: 'unauthorized' }, 401);
      return redirectRes('/login');
    }
    const HID   = user ? user.householdId : null;
    const SKEY  = HID ? ('h:' + HID + ':state') : 'state';
    const TOKEN = user ? user.token : null;
    const UID   = user ? user.userId : null;

    // Everything below is authed; wrap so a silently-refreshed session is persisted on any response.
    const resp = await (async () => {

    // POST /api/invite/create  (auth) → INSERT invitations, return { inviteUrl }
    if (path === '/api/invite/create' && method === 'POST') {
      const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
      const expires = new Date(Date.now() + 7 * 86400 * 1000).toISOString();
      const r = await supabase(env, 'invitations', { method: 'POST', body: JSON.stringify({ token, household_id: HID, created_by: UID, expires_at: expires, used: false }) }, TOKEN);
      if (!r.ok) return jsonRes({ error: 'invite_failed' }, 500);
      return jsonRes({ inviteUrl: url.origin + '/invite/' + token });
    }

    // POST /api/user/prefs {lang?, currency?}  (auth) → PATCH profiles
    if (path === '/api/user/prefs' && method === 'POST') {
      const b = await parseBody(request);
      const patch = {};
      if (b.lang) patch.lang = b.lang;
      if (b.currency) patch.currency = b.currency;
      const r = await supabase(env, 'profiles?id=eq.' + UID, { method: 'PATCH', body: JSON.stringify(patch) }, TOKEN);
      clearProfileCache(UID);
      if (!r.ok) return jsonRes({ error: 'prefs_failed' }, 500);
      return jsonRes({ ok: true, lang: b.lang, currency: b.currency });
    }

    /**
     * GET /
     * Serve the full self-contained PWA HTML document.
     */
    if (path === '/' || path === '') {
      return new Response(buildHTML(), {
        headers: {'Content-Type':'text/html;charset=UTF-8', 'Cache-Control':'no-store'}
      });
    }

    /**
     * GET /web
     * Serve the desktop dashboard SPA (separate from the mobile PWA; shares KV).
     */
    if (path === '/web' || path === '/web/') {
      return new Response(buildWebHTML(), {
        headers: {'Content-Type':'text/html;charset=UTF-8', 'Cache-Control':'no-store'}
      });
    }

    /**
     * GET /manifest.json
     * PWA web app manifest — enables "Add to Home Screen" with name + icon.
     */
    if (path === '/manifest.json') {
      return new Response(buildManifest(), {
        headers: {'Content-Type':'application/manifest+json', 'Cache-Control':'public, max-age=86400'}
      });
    }

    /**
     * GET /icon.svg
     * App / home-screen icon (vector). Referenced by the manifest + apple-touch-icon.
     */
    if (path === '/icon.svg') {
      return new Response(ICON_SVG, {
        headers: {'Content-Type':'image/svg+xml', 'Cache-Control':'public, max-age=86400'}
      });
    }

    const cors = {'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*'};

    /**
     * GET /api/debug  (local dev only)
     * Returns the full KV state pretty-printed. Hidden (404) in production.
     */
    if (path === '/api/debug' && request.method === 'GET') {
      if (!isLocal) return new Response('Not found', {status:404});
      const raw = await env.KV.get(SKEY);
      const s   = raw ? JSON.parse(raw) : DEFAULT_STATE;
      return new Response(JSON.stringify(s, null, 2), {
        headers: {'Content-Type':'application/json', 'Cache-Control':'no-store'}
      });
    }

    /**
     * GET /api/state
     * KV shopping state + Supabase recipes + Supabase meal plans, merged into one
     * response so mobile + web clients get everything in a single call.
     */
    if (path === '/api/state' && request.method === 'GET') {
      return new Response(JSON.stringify(await mergedState(env, SKEY, HID, TOKEN)), {headers: cors});
    }

    /**
     * POST /api/toggle
     * Toggle one grocery item checked/unchecked.
     * @body {{ id: string, user: string }} id = grocery/manual item id, user = who toggled
     * @returns {Object} the updated state
     */
    if (path === '/api/toggle' && request.method === 'POST') {
      const body = await request.json();
      const raw  = await env.KV.get(SKEY);
      const s    = raw ? JSON.parse(raw) : {...DEFAULT_STATE};
      s.checked  = s.checked || {};
      if (s.checked[body.id]) { delete s.checked[body.id]; }
      else { s.checked[body.id] = {by: body.user, at: new Date().toISOString()}; }
      await env.KV.put(SKEY, JSON.stringify(s));
      return new Response(JSON.stringify(s), {headers: cors});
    }

    /**
     * POST /api/reset
     * Clear every checked item (e.g. to start a new shopping week).
     * @returns {Object} the updated state with checked = {} and a fresh resetAt timestamp
     */
    if (path === '/api/reset' && request.method === 'POST') {
      const raw = await env.KV.get(SKEY);
      const s   = raw ? JSON.parse(raw) : {...DEFAULT_STATE};
      // Snapshot the finished shop to shopping_history (analytics + Budget view) before clearing.
      try {
        const checked = s.checked || {}, prices = s.prices || {};
        const catalog = {};
        for (const sec of GROCERY_DATA) for (const it of sec.items) catalog[it.id] = it.price;
        let itemsTotal = (s.manualItems || []).length;
        for (const sec of GROCERY_DATA) itemsTotal += sec.items.length;
        let spent = 0;
        for (const id of Object.keys(checked)) {
          const p = (prices[id] !== undefined) ? prices[id] : (catalog[id] || 0);
          if (typeof p === 'number') spent += p;
        }
        await supabase(env, 'shopping_history', { method: 'POST', headers: { 'Prefer': 'return=minimal' }, body: JSON.stringify({
          household_id: HID, reset_at: new Date().toISOString(),
          items_checked: Object.keys(checked).length, items_total: itemsTotal,
          total_spent: spent, currency: 'RON',
          snapshot: { checked, manualItems: s.manualItems || [], prices }
        }) }, TOKEN);
      } catch (e) {}
      s.checked = {}; s.resetAt = new Date().toISOString();
      await env.KV.put(SKEY, JSON.stringify(s));
      return new Response(JSON.stringify(s), {headers: cors});
    }

    /**
     * POST /api/add-item
     * Append a manually-added grocery item (id auto-generated as m_<timestamp>).
     * Also records the item in manualHistory (newest-first, deduped, capped at 20)
     * to power the "Récents" group in quick-add.
     * @body {{ name: string, qty?: string, sectionId?: string, user?: string }}
     *       sectionId is a GROCERY_DATA section id ('s1'…'s5') or 'manual'.
     * @returns {Object} the updated state
     */
    if (path === '/api/add-item' && request.method === 'POST') {
      const body = await request.json();
      const raw  = await env.KV.get(SKEY);
      const s    = raw ? JSON.parse(raw) : {...DEFAULT_STATE};
      const sectionId = body.sectionId || 'manual';
      s.manualItems = s.manualItems || [];
      s.manualItems.push({id:'m_'+Date.now(), name:body.name, qty:body.qty||'', sectionId});
      // maintain manualHistory: newest first, dedup by name (case-insensitive), max 20
      const nm = body.name || '';
      s.manualHistory = (s.manualHistory || []).filter(h => (h.name || '').toLowerCase() !== nm.toLowerCase());
      s.manualHistory.unshift({name:nm, qty:body.qty||'', sectionId});
      if (s.manualHistory.length > 20) s.manualHistory = s.manualHistory.slice(0, 20);
      await env.KV.put(SKEY, JSON.stringify(s));
      return new Response(JSON.stringify(s), {headers: cors});
    }

    /**
     * POST /api/edit-item
     * Update an existing manual item's name / qty / sectionId.
     * @body {{ id: string, name?: string, qty?: string, sectionId?: string }}
     * @returns {Object} the updated state
     */
    if (path === '/api/edit-item' && request.method === 'POST') {
      const body = await request.json();
      const raw  = await env.KV.get(SKEY);
      const s    = raw ? JSON.parse(raw) : {...DEFAULT_STATE};
      s.manualItems = s.manualItems || [];
      const it = s.manualItems.find(m => m.id === body.id);
      if (it) {
        if (body.name !== undefined)      it.name = body.name;
        if (body.qty !== undefined)       it.qty = body.qty;
        if (body.sectionId !== undefined) it.sectionId = body.sectionId;
      }
      await env.KV.put(SKEY, JSON.stringify(s));
      return new Response(JSON.stringify(s), {headers: cors});
    }

    /**
     * POST /api/delete-item
     * Remove a manual item (and clear any checked state it had).
     * @body {{ id: string }}
     * @returns {Object} the updated state
     */
    if (path === '/api/delete-item' && request.method === 'POST') {
      const body = await request.json();
      const raw  = await env.KV.get(SKEY);
      const s    = raw ? JSON.parse(raw) : {...DEFAULT_STATE};
      s.manualItems = (s.manualItems || []).filter(m => m.id !== body.id);
      if (s.checked && s.checked[body.id]) delete s.checked[body.id];
      await env.KV.put(SKEY, JSON.stringify(s));
      return new Response(JSON.stringify(s), {headers: cors});
    }

    /**
     * POST /api/update-price
     * Store an in-store price override for a grocery item id.
     * @body {{ id: string, price: number }}
     * @returns {Object} the updated state
     */
    if (path === '/api/update-price' && request.method === 'POST') {
      const body = await request.json();
      const raw  = await env.KV.get(SKEY);
      const s    = raw ? JSON.parse(raw) : {...DEFAULT_STATE};
      s.prices = s.prices || {};
      s.prices[body.id] = body.price;
      await env.KV.put(SKEY, JSON.stringify(s));
      return new Response(JSON.stringify(s), {headers: cors});
    }

    /**
     * POST /api/override-item
     * Override a catalog item's (g1–g65) display name + quantity. The name is
     * stored as a single string (edited in whatever language is active); other
     * languages fall back to the original via the client resolver.
     * @body {{ id: string, name: string, qty?: string }}
     * @returns {Object} the updated state
     */
    if (path === '/api/override-item' && request.method === 'POST') {
      const body = await request.json();
      const raw  = await env.KV.get(SKEY);
      const s    = raw ? JSON.parse(raw) : {...DEFAULT_STATE};
      s.itemOverrides = s.itemOverrides || {};
      s.itemOverrides[body.id] = { name: body.name, qty: body.qty || '' };
      await env.KV.put(SKEY, JSON.stringify(s));
      return new Response(JSON.stringify(s), {headers: cors});
    }

    /**
     * POST /api/update-meal
     * Replace a single meal slot in a specific week of the plan.
     * @body {{ week?: string, day: string, slot: string, meal: { name, detail, time, type } }}
     *       week defaults to the current ISO week when omitted (backward compatible).
     * @returns {Object} the updated state
     */
    if (path === '/api/update-meal' && request.method === 'POST') {
      const body = await request.json();
      const week = body.week || currentISOWeek();
      const meal = body.meal || {};
      const row = {
        household_id: HID, week_key: week, day: body.day, slot: body.slot,
        name: meal.name || '', detail: meal.detail || '', type: meal.type || 'free',
        time: meal.time || '', recipe_id: meal.recipeId || null, updated_at: new Date().toISOString()
      };
      // upsert on the unique (household_id, week_key, day, slot)
      const r = await supabase(env, 'meal_plans', { method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(row) }, TOKEN);
      if (!r.ok) return jsonRes({ error: 'meal_failed' }, 500);
      return new Response(JSON.stringify(await mergedState(env, SKEY, HID, TOKEN)), {headers: cors});
    }

    /**
     * POST /api/save-recipe  → UPSERT into the recipes table (per household).
     * @body {{ recipe: { id, name, image?, servings?, ingredients? } }}
     */
    if (path === '/api/save-recipe' && request.method === 'POST') {
      const body = await request.json();
      const r = body.recipe || {};
      const isUrl = (r.image || '').indexOf('http') === 0;
      const row = {
        id: r.id, household_id: HID, name: r.name || '',
        emoji: isUrl ? null : (r.image || null),
        photo_url: isUrl ? r.image : null,
        servings: r.servings || 2, ingredients: r.ingredients || [],
        updated_at: new Date().toISOString()
      };
      const res = await supabase(env, 'recipes', { method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(row) }, TOKEN);
      if (!res.ok) return jsonRes({ error: 'recipe_failed' }, 500);
      return new Response(JSON.stringify(await mergedState(env, SKEY, HID, TOKEN)), {headers: cors});
    }

    /**
     * POST /api/delete-recipe  → DELETE from the recipes table (household-scoped).
     * @body {{ id: string }}
     */
    if (path === '/api/delete-recipe' && request.method === 'POST') {
      const body = await request.json();
      await supabase(env, 'recipes?id=eq.' + encodeURIComponent(body.id) + '&household_id=eq.' + HID, { method: 'DELETE', headers: { 'Prefer': 'return=minimal' } }, TOKEN);
      return new Response(JSON.stringify(await mergedState(env, SKEY, HID, TOKEN)), {headers: cors});
    }

    /**
     * POST /api/recipe-to-cart
     * Pull a recipe's ingredients into the KV shopping list: catalogue items get
     * un-checked (so they show as "to buy"), the rest are added as manual items.
     * The recipe is read from Supabase (falling back to DEFAULT_RECIPES).
     * @body {{ id: string }}
     */
    if (path === '/api/recipe-to-cart' && request.method === 'POST') {
      const body = await request.json();
      let recipe = null;
      const rr = await supabase(env, 'recipes?id=eq.' + encodeURIComponent(body.id) + '&household_id=eq.' + HID + '&select=*', {}, TOKEN);
      if (rr.ok) { const rows = await rr.json(); if (rows[0]) recipe = { id: rows[0].id, ingredients: rows[0].ingredients || [] }; }
      if (!recipe) recipe = DEFAULT_RECIPES.find(r => r.id === body.id);
      const raw = await env.KV.get(SKEY);
      const s   = raw ? JSON.parse(raw) : {...DEFAULT_STATE};
      s.manualItems = s.manualItems || [];
      s.checked = s.checked || {};
      if (recipe && Array.isArray(recipe.ingredients)) {
        const gids = new Set();
        for (const sec of GROCERY_DATA) for (const it of sec.items) gids.add(it.id);
        recipe.ingredients.forEach((ing, i) => {
          if (ing.itemId && gids.has(ing.itemId)) {
            if (s.checked[ing.itemId]) delete s.checked[ing.itemId];   // mark as to-buy
          } else {
            const exists = s.manualItems.some(m =>
              (m.name || '').toLowerCase() === (ing.name || '').toLowerCase() &&
              (m.sectionId || 'manual') === (ing.sectionId || 'manual'));
            if (!exists) {
              s.manualItems.push({id:'m_'+Date.now()+'_'+i, name:ing.name, qty:ing.qty||'', sectionId:ing.sectionId||'manual'});
            }
          }
        });
      }
      await env.KV.put(SKEY, JSON.stringify(s));
      return new Response(JSON.stringify(await mergedState(env, SKEY, HID, TOKEN)), {headers: cors});
    }

    return new Response('Not found', {status:404});
    })();
    return withCookies(resp, refreshedCookies);
  }
};
