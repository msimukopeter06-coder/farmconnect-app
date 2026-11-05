/* Farm Help page: farming tips and the disease problem solver */
(function(){
 const HELPPIC={"Crops":"images/maize-field-sm.jpg","Animals":"images/poultry-sm.jpg","Soil Erosion":"images/rain-sm.jpg","Climate Change":"images/rain-sm.jpg","Logistics & Selling":"images/market-stall-sm.jpg"};
 const hk=Object.keys(HELP);let ha=hk[0];
 function renderHelp(){const t=$("#htabs");t.replaceChildren();
  hk.forEach(k=>{const b=el("button",k===ha?"on":"",k);b.onclick=()=>{ha=k;renderHelp()};t.append(b)});
  const b=$("#hbody");b.replaceChildren();
  if(HELPPIC[ha])b.append(frame(HELPPIC[ha],ha));
  const ul=el("ul");HELP[ha].forEach((x,i)=>{const li=el("li","",x);li.style.setProperty("--i",Math.min(i,10));ul.append(li)});b.append(ul)}
 renderHelp();

 const DISPIC={crop:"images/maize-field-sm.jpg",animal:"images/cattle-sm.jpg"};
 let dk="crop";
 function renderLib(){const t=$("#dtabs");t.replaceChildren();
  [["crop","🌾 Crop diseases & pests"],["animal","🐄 Animal diseases"]].forEach(([k,n])=>{const b=el("button",k===dk?"on":"",n);b.onclick=()=>{dk=k;renderLib()};t.append(b)});
  const d=$("#dlib");d.replaceChildren();
  d.append(frame(DISPIC[dk],dk==="animal"?"Cattle grazing":"Maize field"));
  Object.entries(DIS[dk]).forEach(([n,[sg,ac]],i)=>{const x=el("details");x.style.setProperty("--i",Math.min(i,10));x.append(el("summary","",n));
   const ul=el("ul");const l1=el("li");l1.append(el("b","","Signs: "),document.createTextNode(sg));const l2=el("li");l2.append(el("b","","What to do: "),document.createTextNode(ac));ul.append(l1,l2);x.append(ul);d.append(x)})}
 renderLib();
})();
