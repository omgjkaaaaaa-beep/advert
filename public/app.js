const $=id=>document.getElementById(id);
const palette={mint:'#abb095',violet:'#8d8291',orange:'#c3aa55',blue:'#879ea0',pink:'#c3917a'};
let ads=[], selected=null, color='orange', ready=false;
const demo=location.hostname.endsWith('github.io') || location.protocol==='file:';
$('mode').hidden=!demo;
const world=CityWorld;
const mapExtent=world.size*100+56;
$('map').style.width=$('map').style.height=mapExtent+'px';
$('cells').style.gridTemplateColumns='repeat('+world.size+',96px)';$('cells').style.gridTemplateRows='repeat('+world.size+',96px)';
const address=cell=>`УЧАСТОК №${String(cell+1).padStart(4,'0')} / РЕЕСТР ЗЕМЕЛЬ`;
for(const c of world.cells){
 const el=document.createElement(c.road||c.place?'div':'button');el.className='cell'+(c.road?' road':'')+(c.place?' scenery-cell':'');
 if(!c.road&&!c.place){el.dataset.cell=c.id;el.setAttribute('aria-label',`Свободный участок ${c.id+1}`);el.addEventListener('click',()=>openCell(c.id));}
 $('cells').append(el);
}
for(const p of world.landmarks){
 const button=document.createElement('button');button.className='landmark-label';button.textContent=p.name;button.style.left=(28+p.x*100)+'px';button.style.top=(28+(p.y+p.h)*100-28)+'px';
 button.onclick=()=>{$('formView').hidden=true;$('adView').hidden=false;$('adAddress').textContent='ДОСТОПРИМЕЧАТЕЛЬНОСТЬ / СТАРЫЙ РАЙОН';$('adName').textContent=p.name;$('adText').textContent=p.story;$('adLink').hidden=true;$('dialog').showModal();};$('map').append(button);
 const jump=document.createElement('button');jump.textContent=p.name;jump.onclick=()=>{scale=viewport.clientWidth<600?.65:.85;x=viewport.clientWidth/2-(28+(p.x+p.w/2)*100)*scale;y=viewport.clientHeight/2-(28+(p.y+p.h/2)*100)*scale;apply();};$('locations').append(jump);
}
for(const [key,value] of Object.entries(palette)){
 const button=document.createElement('button');button.type='button';button.style.background=value;button.setAttribute('aria-label',({mint:'Оливковый',violet:'Сиреневый',orange:'Золотистый',blue:'Серо-голубой',pink:'Терракотовый'})[key]);
 button.setAttribute('aria-pressed',key===color);button.onclick=()=>{color=key;[...$('colors').children].forEach(b=>b.setAttribute('aria-pressed',b===button))};$('colors').append(button);
}
function render(){
 // Preserve existing ads if a later city expansion adds scenery to their cell.
 for(const ad of ads){if(!document.querySelector('[data-cell="'+Number(ad.cell)+'"]')){const index=world.cells.findIndex(c=>c.id===ad.cell);if(index>=0){const el=document.createElement('button');el.dataset.cell=ad.cell;el.onclick=()=>openCell(ad.cell);$('cells').children[index].replaceWith(el);}}}
 for(const el of document.querySelectorAll('[data-cell]')){
 const ad=ads.find(a=>a.cell===Number(el.dataset.cell)); el.replaceChildren();el.className='cell'+(ad?' '+ad.color:'');
 el.setAttribute('aria-label',ad?`${ad.name}, занятый участок`:`Свободный участок ${Number(el.dataset.cell)+1}`);
 if(ad){const icon=document.createElement('span');icon.className='cell-icon';icon.textContent='★';const name=document.createElement('span');name.className='cell-name';name.textContent=ad.name;el.append(icon,name);el.title=ad.name;}
 }
 $('count').textContent=ads.length;$('available').textContent=world.available.size-ads.length;
}
async function refresh(){try{if(demo){ads=JSON.parse(localStorage.getItem('kvartal-demo-ads')||'[]');ready=true;render();return;}const response=await fetch('/api/ads');if(!response.ok)throw Error();ads=await response.json();ready=true;render();$('status').textContent='';}catch{$('status').textContent='Не удалось загрузить город. Проверьте соединение и обновите страницу.';}}
function openCell(cell){
 if(!ready){$('status').textContent='Дождитесь загрузки карты. Если соединение прервалось, обновите страницу.';return;}
 selected=cell;const ad=ads.find(a=>a.cell===cell);$('formView').hidden=!!ad;$('adView').hidden=!ad;
 if(ad){$('adAddress').textContent=address(cell);$('adName').textContent=ad.name;$('adText').textContent=ad.text||'Сосед уже занял этот участок. Скоро здесь появится новая история.';$('adLink').hidden=!ad.url;if(ad.url)$('adLink').href=ad.url;}
 else{$('address').textContent=address(cell);$('form').reset();$('error').textContent='';}
 $('dialog').showModal();
}
$('close').onclick=()=>$('dialog').close();
$('dialog').addEventListener('click',event=>{if(event.target===$('dialog')){const r=$('dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('dialog').close();}});
$('form').addEventListener('submit',async event=>{
 event.preventDefault();const data=Object.fromEntries(new FormData(event.target));$('submit').disabled=true;$('error').textContent='';
 try{if(demo){const current=JSON.parse(localStorage.getItem('kvartal-demo-ads')||'[]');if(current.some(a=>a.cell===selected))throw Error('Этот участок уже занят. Выберите другой.');const ad={...data,cell:selected,color,id:crypto.randomUUID()};current.push(ad);localStorage.setItem('kvartal-demo-ads',JSON.stringify(current));ads=current;render();$('dialog').close();$('status').textContent='Участок сохранён в этом браузере. Это деморежим.';return;}const response=await fetch('/api/ads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,cell:selected,color})});const result=await response.json();if(!response.ok)throw Error(result.error);ads.push(result);render();$('dialog').close();$('status').textContent=`Участок «${result.name}» опубликован. Добро пожаловать в город!`;}
 catch(e){$('error').textContent=e.message==='Failed to fetch'?'Нет соединения. Попробуйте ещё раз.':e.message;if(e.message.includes('занят'))await refresh();}
 finally{$('submit').disabled=false;}
});
let scale=.85,x=0,y=0;const viewport=$('viewport');
function apply(){const minX=Math.min(0,viewport.clientWidth-mapExtent*scale),minY=Math.min(0,viewport.clientHeight-mapExtent*scale);x=Math.max(minX-40,Math.min(40,x));y=Math.max(minY-40,Math.min(40,y));$('map').style.transform=`translate(${x}px,${y}px) scale(${scale})`;}
function reset(){scale=viewport.clientWidth<600?.45:.65;x=viewport.clientWidth/2-2580*scale;y=viewport.clientHeight/2-2680*scale;apply();}
function zoom(delta){const next=Math.max(.45,Math.min(1.8,scale+delta));const cx=viewport.clientWidth/2,cy=viewport.clientHeight/2;x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;apply();}
$('plus').onclick=()=>zoom(.15);$('minus').onclick=()=>zoom(-.15);$('reset').onclick=reset;
let drag=null,suppress=false;
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.zoom'))return;drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,x,y,moved:false};});
viewport.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>6){drag.moved=true;viewport.setPointerCapture(e.pointerId);}if(drag.moved){x=drag.x+dx;y=drag.y+dy;apply();}});
viewport.addEventListener('pointerup',()=>{if(drag?.moved){suppress=true;setTimeout(()=>suppress=false,0);}drag=null;});viewport.addEventListener('pointercancel',()=>drag=null);
viewport.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopPropagation();}},true);
viewport.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();zoom(e.deltaY>0?-.1:.1)}},{passive:false});
$('choose').onclick=()=>{$('city').scrollIntoView({behavior:'smooth'});$('status').textContent='Наблюдайте за жителями, нажимайте на реплики и события хроники. Пунктирные участки можно занять.';};
$('how').onclick=()=>document.querySelector('.steps').scrollIntoView({behavior:'smooth'});
window.addEventListener('resize',apply);reset();refresh();setInterval(()=>{if(!$('dialog').open)refresh();},15000);

window.addEventListener('city-focus',e=>{scale=viewport.clientWidth<600?.65:.85;x=viewport.clientWidth/2-(28+e.detail.x*4)*scale;y=viewport.clientHeight/2-(28+e.detail.y*4)*scale;apply();$('city').scrollIntoView({behavior:'smooth'});});

for(const button of document.querySelectorAll('[data-focus]'))button.onclick=()=>{const [x,y]=button.dataset.focus.split(',').map(Number);window.dispatchEvent(new CustomEvent('city-focus',{detail:{x,y}}));};
