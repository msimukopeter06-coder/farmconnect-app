/* Weather page: location, season advice, rain watch and disease alerts */
(function(){
 // Falling rain over the banner photo
 const rain=$("#rain");
 if(rain&&!REDUCE){for(let i=0;i<70;i++){const d=document.createElement("i");d.style.left=Math.random()*100+"%";d.style.animationDuration=(.55+Math.random()*.7)+"s";d.style.animationDelay=(-Math.random()*1.5)+"s";d.style.opacity=.35+Math.random()*.55;rain.append(d)}}

 const S={alerts:[],rains:[]};
 Object.keys(TOWNS).forEach(t=>$("#town").append(new Option(t,t)));

 function showPos(){const l=$("#loc");l.replaceChildren(el("span","dot","📍"),document.createTextNode(" "+posLabel+" ("+pos.lat.toFixed(3)+", "+pos.lng.toFixed(3)+") "));mapLink(l,pos.lat,pos.lng);renderSeason();renderAlerts();renderRains()}
 function setPos(lat,lng,label){savePos(lat,lng,label);showPos()}
 $("#gps").onclick=()=>{if(!navigator.geolocation){$("#loc").textContent="GPS is not available here. Please pick your nearest town instead.";return}
  $("#loc").textContent="Finding your location…";
  navigator.geolocation.getCurrentPosition(p=>{$("#town").value="";setPos(p.coords.latitude,p.coords.longitude,"Your GPS location")},()=>{$("#loc").textContent="Could not get your location. Allow location access, or pick your nearest town."},{timeout:12000})};
 $("#town").onchange=e=>{const t=TOWNS[e.target.value];if(t)setPos(t[0],t[1],e.target.value)};

 function renderSeason(){const box=$("#season");box.replaceChildren();if(!pos)return;
  const d=new Date(),m=d.getMonth(),o=pos.lat>-13?[10,8]:pos.lat>-16?[10,20]:[11,5],on=new Date(d.getFullYear(),o[0],o[1]);
  let phase,adv;
  if(m<=3){phase="Rainy season";adv="Weed early, watch for fall armyworm, blight and tick-borne disease, protect soil from runoff, plan harvest drying."}
  else if(m<=7){phase="Cool dry season";adv="Harvest, dry and store grain safely, repair terraces, use irrigation for dry-season gardens, vaccinate livestock."}
  else if(d<on){const n=Math.ceil((on-d)/864e5);phase="Hot dry season. First rains expected in about "+n+" days";adv="Prepare fields and planting basins, buy certified seed, make contour ridges. Plant only after rains are well established, not after one shower."}
  else{phase="Rainy season has typically begun here";adv="Plant after several good rains, use contour ridges, scout for pests weekly."}
  const c1=el("div","card");c1.append(el("b","","🌦 Season"),document.createTextNode(phase));
  const c2=el("div","card");c2.append(el("b","","🌱 Do now"),document.createTextNode(adv));
  const near=Object.entries(TOWNS).sort((a,b)=>km(pos.lat,pos.lng,a[1][0],a[1][1])-km(pos.lat,pos.lng,b[1][0],b[1][1]))[0][0];
  const c3=el("div","card");c3.append(el("b","","📡 Live weather"),document.createTextNode("Check "+near+" forecast with the Zambia Meteorological Department."));
  box.append(c1,c2,c3);stagger(box)}

 function sortNear(a){return pos?a.map(x=>Object.assign({d:num(x.lat)&&num(x.lng)?km(pos.lat,pos.lng,x.lat,x.lng):null},x)).sort((p,q)=>(p.d==null)-(q.d==null)||p.d-q.d):a.map(x=>Object.assign({d:null},x))}
 function renderAlerts(){const g=$("#alerts");g.replaceChildren();
  if(!S.alerts.length){g.append(el("p","note","No alerts reported. 🎉"));return}
  sortNear(S.alerts).slice(0,30).forEach(a=>{const c=el("div","card pic"),b=el("div","b");const close=a.d!=null&&a.d<50;
   if(close){c.style.borderColor="var(--warn)";c.style.background="var(--warn-bg)"}
   c.append(pic(a.img,a.kind==="animal"?"animal":"crop"));
   b.append(el("span","tag",a.kind==="animal"?"🐄 Animal":"🌾 Crop"),el("span","tag","Severity: "+(a.sev||"")));
   b.append(el("h3","",(close?"⚠ ":"")+(a.dis||"")),el("div","note",(a.d!=null?Math.round(a.d)+" km away · ":"")+new Date(a.ts||0).toLocaleDateString()+" · "+(a.name||"")));
   if(a.note)b.append(el("p","",a.note));
   const sol=(DIS[a.kind]||{})[a.dis];if(sol){const x=el("details");x.append(el("summary","","What to do"),document.createTextNode(sol[1]));b.append(x)}
   mapLink(b,a.lat,a.lng);actions(b,a.phone);c.append(b);g.append(c)});stagger(g)}
 function renderRains(){const g=$("#rains"),wk=Date.now()-7*864e5;
  const r=S.rains.filter(x=>x.ts>wk);
  if(!r.length){g.textContent="No rain reported in the last 7 days.";return}
  if(!pos){g.textContent=r.length+" rain report(s) in the last 7 days. Set your location to see how close.";return}
  const n=sortNear(r).filter(x=>x.d!=null&&x.d<100);
  g.textContent=n.length?"🌧 "+n.length+" report(s) within 100 km in the last 7 days. Nearest: "+Math.round(n[0].d)+" km away, "+new Date(n[0].ts).toLocaleDateString()+".":"No rain reports within 100 km this week."}

 function fillDis(){const s=$("#adis");s.replaceChildren();Object.keys(DIS[$("#akind").value]).forEach(n=>s.append(new Option(n,n)))}
 $("#akind").onchange=fillDis;fillDis();

 renderAlerts();renderRains();
 if(pos){const t=TOWNS[posLabel];if(t)$("#town").value=posLabel;showPos()}
 const live=liveData({alerts:r=>{S.alerts=r;renderAlerts()},rains:r=>{S.rains=r;renderRains()}});
 wire("#aform","alerts",{gps:true,after:()=>live.reload("alerts"),reset:fillDis});
 wire("#rform","rains",{gps:true,after:()=>live.reload("rains")});
})();
