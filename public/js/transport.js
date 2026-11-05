/* Transport board page */
(function(){
 let rows=[];
 function render(){const g=$("#trips");g.replaceChildren();
  if(!rows.length){g.append(el("p","note","No transport posts yet."));return}
  rows.forEach(t=>{const c=el("div","card pic"),b=el("div","b");c.append(pic(t.img,t.veh==="car"?"car":"trip"));
   b.append(el("span","tag",t.kind==="offer"?"🚛 Vehicle available":"📦 Needs transport"),el("h3","",t.route||""),el("div","note","🗓 "+(t.when||"")+" · "+(t.name||"")));
   if(t.info)b.append(el("div","",t.info));actions(b,t.phone);c.append(b);g.append(c)});stagger(g)}
 render();
 const live=liveData({transport:r=>{rows=r;render()}});
 wire("#tform","transport",{after:()=>live.reload("transport")});
})();
