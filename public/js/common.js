/* FarmConnect Zambia: shared helpers and behaviour. Loaded on every page after data.js. */
const $=s=>document.querySelector(s);
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
const digits=s=>String(s||"").replace(/[^\d]/g,"");
const num=v=>typeof v==="number"&&isFinite(v);
const BG='<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3f5"/><stop offset="1" stop-color="#fffdf5"/></linearGradient></defs><rect width="300" height="150" fill="url(#g)"/><circle cx="262" cy="30" r="16" fill="#ffd54a"/><path d="M0 105 Q80 72 160 98 T300 88 V150 H0Z" fill="#6fae5c"/><path d="M0 128 Q100 100 200 124 T300 116 V150 H0Z" fill="#7b4a22"/>';
const wheel=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="13" fill="#3b2a1a"/><circle cx="'+x+'" cy="'+y+'" r="5" fill="#d9c9b0"/>';
const M={
maize:[40,85,130,175,220,265].map(x=>'<rect x="'+x+'" y="48" width="5" height="82" fill="#3f8a3a"/><path d="M'+(x+2)+' 82 q-20 -6 -24 -26 q16 4 24 26z M'+(x+2)+' 98 q20 -6 24 -26 q-16 4 -24 26z" fill="#4fa046"/><ellipse cx="'+(x+2)+'" cy="68" rx="6" ry="14" fill="#f2c230"/>').join(""),
veg:'<circle cx="70" cy="112" r="17" fill="#d9381e"/><path d="M62 98 l8 -6 l8 6z" fill="#2f7d32"/><circle cx="108" cy="118" r="14" fill="#e24a2b"/><circle cx="170" cy="108" r="24" fill="#5fa84f"/><path d="M150 108 q20 -26 40 0 M156 118 q14 -18 28 0" stroke="#3f8a3a" stroke-width="3" fill="none"/><path d="M225 82 l12 44 l12 -44z" fill="#f08a24"/><path d="M231 82 l6 -14 l6 14z" fill="#3f8a3a"/>',
fruit:'<rect x="144" y="70" width="12" height="58" fill="#7b4a22"/><circle cx="150" cy="52" r="42" fill="#3f8a3a"/><circle cx="125" cy="48" r="7" fill="#f08a24"/><circle cx="160" cy="36" r="7" fill="#f08a24"/><circle cx="172" cy="62" r="7" fill="#f08a24"/><circle cx="140" cy="68" r="7" fill="#f08a24"/>',
cow:'<ellipse cx="140" cy="92" rx="52" ry="26" fill="#fff" stroke="#7b4a22" stroke-width="2"/><ellipse cx="125" cy="86" rx="14" ry="10" fill="#4a3322"/><ellipse cx="160" cy="98" rx="10" ry="8" fill="#4a3322"/><circle cx="198" cy="80" r="17" fill="#fff" stroke="#7b4a22" stroke-width="2"/><ellipse cx="206" cy="86" rx="9" ry="7" fill="#e7b9a0"/><path d="M190 66 l-6 -10 M206 66 l6 -10" stroke="#7b4a22" stroke-width="3"/><circle cx="196" cy="76" r="2.5" fill="#222"/><rect x="100" y="112" width="8" height="20" fill="#7b4a22"/><rect x="124" y="114" width="8" height="18" fill="#7b4a22"/><rect x="156" y="114" width="8" height="18" fill="#7b4a22"/><rect x="176" y="112" width="8" height="20" fill="#7b4a22"/><path d="M90 84 q-16 4 -14 24" stroke="#7b4a22" stroke-width="3" fill="none"/>',
hen:'<ellipse cx="120" cy="98" rx="32" ry="24" fill="#b5642f"/><path d="M92 90 q-18 -14 -4 -30 q4 18 18 24z" fill="#8d4a1f"/><circle cx="155" cy="72" r="13" fill="#b5642f"/><path d="M146 58 q4 -10 9 -2 q4 -8 9 2z" fill="#d9381e"/><path d="M167 72 l12 4 l-12 5z" fill="#f2c230"/><circle cx="158" cy="70" r="2.5" fill="#222"/><path d="M112 120 l-4 14 M128 120 l4 14" stroke="#f2a024" stroke-width="3"/><ellipse cx="215" cy="124" rx="8" ry="10" fill="#fff3d9" stroke="#c9a77a"/><ellipse cx="238" cy="126" rx="8" ry="10" fill="#fff3d9" stroke="#c9a77a"/>',
honey:'<rect x="105" y="100" width="90" height="26" fill="#f2c230" stroke="#7b4a22" stroke-width="2"/><rect x="108" y="72" width="84" height="28" fill="#e4a91e" stroke="#7b4a22" stroke-width="2"/><rect x="112" y="46" width="76" height="26" fill="#f2c230" stroke="#7b4a22" stroke-width="2"/><path d="M104 46 h92 l-8 -14 h-76z" fill="#7b4a22"/><rect x="140" y="108" width="20" height="8" fill="#3b2a1a"/><g fill="#f2c230" stroke="#3b2a1a"><ellipse cx="230" cy="60" rx="7" ry="5"/><ellipse cx="70" cy="76" rx="7" ry="5"/><ellipse cx="240" cy="92" rx="7" ry="5"/></g>',
land:'<path d="M20 108 L150 82 L150 118 L20 130z" fill="#f2d36b"/><path d="M155 82 L285 100 L285 128 L155 118z" fill="#4fa046"/><path d="M20 108 L150 82 L285 100 M20 130 L150 118 L285 128" stroke="#7b4a22" stroke-width="3" fill="none"/><rect x="38" y="52" width="40" height="30" fill="#b5442f"/><polygon points="32,54 58,32 84,54" fill="#7b4a22"/><rect x="52" y="62" width="12" height="20" fill="#f4e3c0"/><rect x="214" y="52" width="5" height="52" fill="#7b4a22"/><rect x="190" y="52" width="52" height="24" rx="3" fill="#fff" stroke="#7b4a22" stroke-width="2"/><text x="216" y="69" font-size="11" font-weight="700" text-anchor="middle" fill="#2e7d32">FOR SALE</text>',
truck:'<rect x="40" y="62" width="130" height="56" rx="4" fill="#7b4a22"/><rect x="172" y="80" width="62" height="38" rx="5" fill="#2e7d32"/><path d="M180 82 h30 l16 20 h-46z" fill="#d6ecf7"/><ellipse cx="70" cy="58" rx="20" ry="12" fill="#e9d9a8"/><ellipse cx="110" cy="56" rx="20" ry="12" fill="#e9d9a8"/><ellipse cx="148" cy="58" rx="18" ry="11" fill="#e9d9a8"/><rect x="30" y="116" width="210" height="6" fill="#3b2a1a"/>'+wheel(70,126)+wheel(130,126)+wheel(205,126),
car:'<rect x="60" y="86" width="170" height="32" rx="8" fill="#2e7d32"/><path d="M95 86 l22 -28 h62 l22 28z" fill="#2e7d32"/><path d="M106 84 l16 -22 h26 v22z M154 84 v-22 h22 l16 22z" fill="#d6ecf7"/><rect x="224" y="98" width="10" height="8" fill="#ffd54a"/>'+wheel(98,122)+wheel(194,122),
weather:'<g fill="#e8eef2" stroke="#9fb3c0" stroke-width="2"><ellipse cx="120" cy="52" rx="42" ry="22"/><ellipse cx="160" cy="44" rx="38" ry="24"/><ellipse cx="195" cy="56" rx="34" ry="18"/></g><g stroke="#3a86c8" stroke-width="3" stroke-linecap="round"><path d="M100 84 l-6 16 M130 84 l-6 16 M160 84 l-6 16 M190 84 l-6 16 M115 104 l-6 14 M145 104 l-6 14 M175 104 l-6 14"/></g>'
};
const KEYMAP={"Crops":"maize","Vegetables":"veg","Fruit":"fruit","Livestock":"cow","Eggs & Dairy":"hen","Honey & Other":"honey","land":"land","trip":"truck","car":"car","rain":"weather","crop":"maize","animal":"cow"};
function art(k){const m=KEYMAP[k]||"maize";return "data:image/svg+xml;utf8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150">'+BG+(M[m]||"")+'</svg>')}
function pic(img,k,alt){const i=document.createElement("img");i.loading="lazy";i.alt=alt||k||"";i.src=(typeof img==="string"&&/^(data:image\/(jpeg|png|webp);base64,|\/api\/|images\/)/.test(img))?img:art(k);return i}
function actions(c,phone){const d=digits(phone);if(!d)return;
 const a=el("a","btn p","📞 Call");a.href="tel:+"+d;
 const w=el("a","btn","💬 WhatsApp");w.href="https://wa.me/"+d;w.target="_blank";w.rel="noopener";c.append(a,w)}
function mapLink(c,lat,lng){if(!num(lat)||!num(lng))return;const a=el("a","btn","🗺 View on map");a.href="https://www.google.com/maps?q="+lat+","+lng;a.target="_blank";a.rel="noopener";c.append(a)}
function km(a,b,c,d){const r=x=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 12742*Math.asin(Math.sqrt(h))}
function photo(file){return new Promise(res=>{if(!file||!file.size)return res(null);
 const im=new Image(),u=URL.createObjectURL(file);
 im.onload=()=>{const s=Math.min(1,520/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=im.width*s;cv.height=im.height*s;
  cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(u);let q=.65,d=cv.toDataURL("image/jpeg",q);
  while(d.length>150000&&q>.3){q-=.1;d=cv.toDataURL("image/jpeg",q)}res(d)};
 im.onerror=()=>res(null);im.src=u})}

/* ===================== Shared behaviour for every page ===================== */

/* ---- Location is shared between pages for this browser tab ---- */
let pos=null,posLabel="";
try{const s=JSON.parse(sessionStorage.getItem("fc-pos")||"null");if(s&&num(s.lat)&&num(s.lng)){pos={lat:s.lat,lng:s.lng};posLabel=s.label||""}}catch(e){}
function savePos(lat,lng,label){pos={lat,lng};posLabel=label||"";try{sessionStorage.setItem("fc-pos",JSON.stringify({lat,lng,label:posLabel}))}catch(e){}}
function requestPos(){return new Promise((res,rej)=>{if(pos)return res(pos);if(!navigator.geolocation)return rej(new Error("no gps"));
 navigator.geolocation.getCurrentPosition(p=>{savePos(p.coords.latitude,p.coords.longitude,"Your GPS location");res(pos)},()=>rej(new Error("denied")),{timeout:12000})})}

/* ---- Header, mobile bottom bar and footer are written once, here ---- */
const PAGES=[
 ["index","🏠","Home","nav_home","Home","nav_home"],
 ["weather","🌦","Weather & Alerts","nav_w","Weather","bn_w"],
 ["market","🛒","Market","nav_m","Market","nav_m"],
 ["land","🏞","Land","nav_l","Land","nav_l"],
 ["transport","🚚","Transport","nav_t","Transport","nav_t"],
 ["help","🌱","Farm Help","nav_h","Farm Help","nav_h"],
 ["about","ℹ️","About","nav_about","About","nav_about"]
];
const CUR=((location.pathname.split("/").pop()||"index").replace(/\.html$/,""))||"index";
(function buildLayout(){
 const header=el("header","site");
 header.innerHTML='<div><a class="brand" href="index.html"><span class="logo">🌾</span><span>FarmConnect <small>ZAMBIA</small></span></a>'+
  '<nav class="top" aria-label="Main">'+PAGES.map(p=>'<a href="'+p[0]+'.html"'+(p[0]===CUR?' class="on" aria-current="page"':'')+' data-i18n="'+p[3]+'">'+p[2]+'</a>').join("")+'</nav>'+
  '<select id="lang" aria-label="Language"><option value="en">English</option><option value="ny">Chinyanja</option><option value="bem">Chibemba</option><option value="toi">Chitonga</option><option value="loz">Silozi</option></select></div>';
 const bar=el("nav","bar");bar.setAttribute("aria-label","Pages");
 bar.innerHTML=PAGES.map(p=>'<a href="'+p[0]+'.html"'+(p[0]===CUR?' class="on" aria-current="page"':'')+'><span>'+p[1]+'</span><small data-i18n="'+p[5]+'">'+p[4]+'</small></a>').join("");
 const footer=el("footer","site");
 footer.innerHTML='<div class="fl">'+PAGES.map(p=>'<a href="'+p[0]+'.html">'+p[2]+'</a>').join("")+'</div>'+
  '<p>© <span id="yr"></span> FarmConnect Zambia. All rights reserved to Msimuko Cephas.</p>';
 document.body.prepend(header);document.body.append(footer,bar);
 $("#yr").textContent=new Date().getFullYear();
})();

/* ---- Languages: edit the LANG table in js/data.js. Missing words fall back to English. ---- */
const EN={};
document.querySelectorAll("[data-i18n]").forEach(n=>{if(!(n.dataset.i18n in EN))EN[n.dataset.i18n]=n.textContent});
function setLang(l){document.documentElement.lang=l;
 document.querySelectorAll("[data-i18n]").forEach(n=>{const k=n.dataset.i18n;n.textContent=(LANG[l]&&LANG[l][k])||EN[k]});
 try{localStorage.setItem("fc-lang",l)}catch(e){}}
$("#lang").onchange=e=>setLang(e.target.value);
try{const l=localStorage.getItem("fc-lang");if(l&&l!=="en"&&LANG[l]){$("#lang").value=l;setLang(l)}}catch(e){}

/* ---- Motion helpers ---- */
const REDUCE=matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveal="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");reveal.unobserve(e.target)}}),{threshold:.12}):null;
document.querySelectorAll(".reveal").forEach(e=>reveal?reveal.observe(e):e.classList.add("in"));
function stagger(c){[...c.children].forEach((e,i)=>e.style.setProperty("--i",Math.min(i,10)))}
function countUp(node,to){if(REDUCE||!to){node.textContent=Number(to||0).toLocaleString();return}
 const t0=performance.now(),d=1000;(function f(t){const p=Math.min(1,(t-t0)/d);node.textContent=Math.round(to*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(f)})(t0)}
function frame(src,alt){const f=el("div","frame"),i=document.createElement("img");i.src=src;i.alt=alt||"";i.loading="lazy";f.append(i);return f}

/* ---- Talking to the backend (server.js) ---- */
async function apiGet(col){const r=await fetch("/api/"+col,{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}
function setNote(t){document.querySelectorAll(".dbnote").forEach(n=>n.textContent=t)}
/* liveData({listings: rows=>...}) loads each list, redraws only when it changed, and refreshes every 30 s */
function liveData(map,every){const last={};
 async function one(col){try{const rows=await apiGet(col),j=JSON.stringify(rows);if(j!==last[col]){last[col]=j;map[col](rows)}return true}catch(e){return false}}
 const all=()=>Promise.all(Object.keys(map).map(one));
 all().then(r=>setNote(r.every(Boolean)?"Posts are saved to the shared database and appear for everyone.":"Could not reach the server. Start it with npm run dev and open http://localhost:3000"));
 setInterval(()=>{if(!document.hidden)all()},every||30000);
 return{reload:one,all}}

function formNote(f,t){let n=f.parentElement.querySelector(".fmsg");if(!n){n=el("p","note fmsg");f.after(n)}n.textContent=t}
async function save(col,data,f,after){
 try{const r=await fetch("/api/"+col,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){formNote(f,j.error||"Could not save. Please try again.");return false}
  formNote(f,"Thank you! Saved.");if(after)await after();return true}
 catch(e){formNote(f,"No connection to the server. Please try again.");return false}}
/* wire(formSelector, apiName, {gps:true|"opt", num:1, after:fn, reset:fn}) */
function wire(id,col,opt){opt=opt||{};const form=$(id);if(!form)return;
 form.addEventListener("submit",async e=>{e.preventDefault();const f=e.target,btn=f.querySelector("button[type=submit]");btn.disabled=true;
  const o={};new FormData(f).forEach((v,k)=>{if(typeof v==="string")o[k]=v.trim()});
  if(f.photo&&f.photo.files[0]){const p=await photo(f.photo.files[0]);if(p)o.img=p}
  if(opt.gps===true){
   if(!pos){const l=$("#loc");if(l){l.textContent="Set your location first (tap Use my GPS or pick a town), then submit again.";l.scrollIntoView({block:"center"})}else formNote(f,"Set your location first.");btn.disabled=false;return}
   o.lat=pos.lat;o.lng=pos.lng}
  else if(opt.gps==="opt"&&o.pin){
   try{const p=await requestPos();o.lat=p.lat;o.lng=p.lng}
   catch(err){formNote(f,"Could not get your location. Allow location access, or untick the pin box.");btn.disabled=false;return}}
  delete o.pin;if(opt.num)o.price=String(parseFloat(o.price)||0);
  const ok=await save(col,o,f,opt.after);if(ok){f.reset();if(opt.reset)opt.reset()}btn.disabled=false})}
