/* Village Market page */
(function(){
 let rows=[],cat="All";
 const CATS=["All","Crops","Vegetables","Fruit","Livestock","Eggs & Dairy","Honey & Other"];
 function filters(){const f=$("#filters");f.replaceChildren();
  CATS.forEach(k=>{const b=el("button",k===cat?"on":"",k);b.onclick=()=>{cat=k;filters();render()};f.append(b)})}
 function render(){const g=$("#listings");g.replaceChildren();const q=$("#q").value.toLowerCase();
  const list=rows.filter(l=>(cat==="All"||l.cat===cat)&&(!q||((l.title||"")+(l.village||"")+(l.desc||"")).toLowerCase().includes(q)));
  if(!list.length){g.append(el("p","note","No products yet. Be the first to post one."));return}
  list.forEach(l=>{const c=el("div","card pic"),b=el("div","b");c.append(pic(l.img,l.cat));
   b.append(el("span","tag",l.cat||""),el("h3","",l.title||""),el("div","price",l.price||""));
   if(l.qty)b.append(el("div","note","Qty: "+l.qty));
   b.append(el("div","note","📍 "+(l.village||"")+" · "+(l.name||"")));if(l.desc)b.append(el("p","",l.desc));
   actions(b,l.phone);c.append(b);g.append(c)});stagger(g)}
 $("#q").addEventListener("input",render);
 filters();render();
 const live=liveData({listings:r=>{rows=r;render()}});
 wire("#lform","listings",{after:()=>live.reload("listings")});
})();
