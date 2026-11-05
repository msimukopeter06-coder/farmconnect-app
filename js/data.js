/* FarmConnect Zambia: content data. Edit the farming tips, disease library, towns and
   translations here. Pages load this file first. */
const HELP={
"Crops":["Rotate crops each season (cereal → legume → vegetable) to cut pests and restore nitrogen.","Scout fields weekly; remove infected plants early.","Use certified seed or saved seed from your best plants and test germination.","Use compost, manure and mulch; fertilise by soil need.","Store grain under 13% moisture in sealed bags to avoid aflatoxin and weevils.","Intercrop maize with beans or cowpeas to spread risk."],
"Animals":["Keep a vaccination calendar with your vet.","Provide clean water daily and shade in hot weather.","Grow fodder (napier, legumes) and make hay for the dry season.","Isolate sick animals and report unusual deaths.","Rotate grazing to prevent overgrazing and parasites.","Keep records of births, treatments and sales."],
"Soil Erosion":["Plough and plant along the contour.","Plant vetiver or napier grass strips and trees on slopes and gullies.","Keep soil covered with mulch, cover crops and residues.","Build stone lines, terraces or check dams in gullies.","Use conservation farming: minimum tillage, planting basins, rotation.","Avoid burning residues and farming stream banks."],
"Climate Change":["Choose drought-tolerant, early-maturing varieties (sorghum, millet, cassava, cowpeas).","Harvest rainwater with ponds, tanks or basins.","Stagger planting dates to spread weather risk.","Diversify crops and small livestock.","Plant trees (agroforestry) for shade, fodder and fertility.","Follow seasonal forecasts and plan before planting."],
"Logistics & Selling":["Group with neighbours to share transport.","Post products on the Village Market with price and quantity.","Harvest early, grade and pack in crates to reduce spoilage.","Add value: dry, mill, press oil, pack honey.","Check market prices and agree weights before selling.","Use mobile money and keep sales records."]
};
const DIS={
crop:{
"Fall armyworm":["Ragged leaf holes, sawdust-like droppings in the maize whorl.","Scout early; hand-pick egg masses and larvae; put sand or ash in whorls; plant early and together with neighbours; intercrop; ask extension about approved bio-pesticides."],
"Maize streak virus":["Yellow streaks along leaves, stunted plants.","Spread by leafhoppers. Uproot infected plants, plant resistant varieties, control weeds, avoid late planting."],
"Cassava mosaic":["Twisted, mottled yellow-green leaves, small tubers.","Use clean, disease-free cuttings; remove infected plants; plant resistant varieties."],
"Tomato blight":["Dark patches on leaves and fruit, white mould in damp weather.","Space plants, water at the base not the leaves, stake, remove infected parts, rotate away from potatoes and tomatoes."],
"Crop locusts / quelea":["Swarms or flocks stripping fields.","Report to the nearest agriculture office at once; do not attempt large-scale control alone."]},
animal:{
"Newcastle disease (chickens)":["Gasping, green watery droppings, twisted necks, sudden deaths.","Vaccinate regularly, isolate sick birds, no sharing birds between homes, report outbreaks."],
"African swine fever (pigs)":["High fever, red or purple skin, sudden deaths.","No vaccine. Isolate, restrict movement, do not sell or move pigs, report to the vet immediately."],
"Foot-and-mouth disease":["Blisters on mouth and hooves, drooling, limping.","Report immediately, stop animal movement, isolate, disinfect equipment, follow vaccination advice."],
"Anthrax":["Sudden death, bleeding from openings. Do not open the carcass or eat the meat.","Report to the vet and authorities at once, bury or burn as directed, vaccinate herds in risk areas."],
"East Coast fever (cattle)":["High fever, swollen lymph nodes, laboured breathing.","Dip or spray regularly for ticks, use treatment prescribed by a vet, keep tick records."],
"Rabies":["Strange aggression or paralysis in dogs and livestock.","Vaccinate dogs; anyone bitten should go to a clinic immediately."]}
};
const TOWNS={"Lusaka":[-15.39,28.32],"Ndola":[-12.97,28.63],"Kitwe":[-12.82,28.21],"Livingstone":[-17.85,25.86],"Chipata":[-13.64,32.65],"Kasama":[-10.21,31.18],"Mongu":[-15.25,23.13],"Solwezi":[-12.18,26.4],"Choma":[-16.81,26.99],"Mansa":[-11.2,28.89],"Kabwe":[-14.45,28.45],"Chinsali":[-10.55,32.07]};

/* Languages: edit this list to correct or add words. Missing words fall back to English. */
const LANG={
ny:{nav_w:"Nyengo",bn_w:"Nyengo",nav_m:"Msika",nav_l:"Malo",nav_t:"Zoyendera",nav_h:"Thandizo",
h1:"Limani bwino. Gulitsani patali. Khalani ndi malo.",
hero:"Thandizo la mbewu, ziweto ndi nthaka · machenjezo a mvula ndi matenda pafupi nanu · msika waulere wa m'mudzi · minda yogulitsa.",
h_g:"🖼 Zithunzi",h_w:"📍 Nyengo, Mvula ndi Machenjezo a Matenda",h_m:"🛒 Msika wa M'mudzi",h_l:"🏞 Minda ndi Malo Ogulitsa",h_t:"🚚 Zoyendera ndi Kunyamula Katundu",h_h:"🌱 Thandizo la Ulimi",
gps:"Gwiritsani GPS yanga",rain:"Mvula yayamba kuno",out:"Uzani za matenda",post:"Ikani katundu wanga",list:"Ikani malo ogulitsa",board:"Ikani pa bolodi",rights:"Ufulu wonse ndi wotetezedwa."},
bem:{nav_w:"Umwela",bn_w:"Umwela",nav_m:"Isoko",nav_l:"Umushili",nav_t:"Ukusenda",nav_h:"Ubwafwilisho",
h_w:"📍 Umwela, Imvula na Ukucenjeshya",h_m:"🛒 Isoko lya Mushitungulu",h_l:"🏞 Umushili wa Kushitisha",h_t:"🚚 Ukusenda Ifintu",h_h:"🌱 Ubwafwilisho bwa Bulimi",
rain:"Imvula yatampa apa"},
toi:{nav_w:"Mvwula",bn_w:"Mvwula",nav_m:"Musika",nav_l:"Bulongo",nav_t:"Kutwala",nav_h:"Lugwasyo",
h_w:"📍 Mvwula, Mulimo wa Bucenjezyo",h_m:"🛒 Musika wa Mumunzi",h_l:"🏞 Bulongo bwa Kulansya",h_t:"🚚 Kutwala Zintu",h_h:"🌱 Lugwasyo lwa Bulimi",
rain:"Mvwula yatalika awa"},
loz:{nav_w:"Pula",bn_w:"Pula",nav_m:"Mmaraka",nav_l:"Mubu",nav_t:"Transport",nav_h:"Thuso",
h_w:"📍 Pula ni Temoso",h_m:"🛒 Mmaraka wa Mubasa",h_l:"🏞 Mubu wa Ku Rekisa",h_t:"🚚 Transport ni Ku Isa Lika",h_h:"🌱 Thuso ya Temo",
rain:"Pula i qalile fa"}
};
