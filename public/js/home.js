/* Home page: live counters from the backend, and the clickable photo gallery */
(function(){
 // Each gallery card links to the page where that topic lives
 const PHOTO={"Crops":"images/maize-field-sm.jpg","Vegetables":"images/market-stall-sm.jpg","Eggs & Dairy":"images/poultry-sm.jpg","rain":"images/rain-sm.jpg","Livestock":"images/cattle-sm.jpg","land":"images/land-sm.jpg","trip":"images/truck-sm.jpg","car":"images/pickup-sm.jpg","Honey & Other":"images/honey-sm.jpg"};
 const GAL=[["rain","Rain & weather","weather.html"],["land","Farmland","land.html"],["Crops","Maize & crops","market.html"],["Vegetables","Vegetables","market.html"],["Fruit","Fruit trees","market.html"],["Livestock","Cattle","market.html"],["Eggs & Dairy","Poultry & eggs","market.html"],["Honey & Other","Honey","market.html"],["trip","Trucks & logistics","transport.html"],["car","Cars & pickups","transport.html"]];
 const g=$("#gal");
 GAL.forEach(([k,t,href])=>{const c=el("a","card pic");c.href=href;c.append(pic(PHOTO[k]||null,k,t));const b=el("div","b");b.append(el("b","",t));c.append(b);g.append(c)});
 stagger(g);

 // Live numbers from GET /api/stats
 apiGet("stats").then(s=>{
  [["listings","c_listings"],["lands","c_lands"],["trips","c_trips"],["alerts","c_alerts"]].forEach(([k,id])=>countUp($("#"+id),s[k]||0));
  $("#cnote").textContent="Live from the FarmConnect database."}).catch(()=>{
  ["c_listings","c_lands","c_trips","c_alerts"].forEach(id=>$("#"+id).textContent="–");
  $("#cnote").textContent="Start the server to see live numbers."});
})();
