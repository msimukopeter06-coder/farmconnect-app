/* Farms & Land page */
(function(){
 let rows=[],lcat="All";
 const CATS=["All","Foreign buyers welcome","Farmland","Farm with house","Residential plot","Ranch / grazing","Lease"];
 function filters(){const l=$("#lfilters");l.replaceChildren();
  CATS.forEach(k=>{const b=el("button",k===lcat?"on":"",k);b.onclick=()=>{lcat=k;filters();render()};l.append(b)})}
 function render(){const g=$("#lands");g.replaceChildren();
  const list=rows.filter(l=>lcat==="All"||(lcat==="Foreign buyers welcome"?l.foreign==="yes":l.type===lcat));
  if(!list.length){g.append(el("p","note","No land listed yet."));return}
  list.forEach(l=>{const c=el("div","card pic"),b=el("div","b");c.append(pic(l.img,"land"));
   b.append(el("span","tag",l.type||""),el("span","tag",l.tenure||""));if(l.foreign==="yes")b.append(el("span","tag","🌍 Foreign buyers welcome"));
   b.append(el("h3","",l.title||""),el("div","price",(l.cur||"")+" "+Number(l.price||0).toLocaleString()),el("div","note","📐 "+(l.size||"")+" · 📍 "+(l.place||"")+" · "+(l.name||"")));
   if(l.desc)b.append(el("p","",l.desc));actions(b,l.phone);mapLink(b,l.lat,l.lng);c.append(b);g.append(c)});stagger(g)}
 filters();render();
 const live=liveData({lands:r=>{rows=r;render()}});
 wire("#dform","lands",{gps:"opt",num:1,after:()=>live.reload("lands")});
})();
