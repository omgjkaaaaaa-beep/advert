(function(){
 const saveKey='kvartal-city-simulation-v2';let sim,saveAvailable=true;try{const raw=localStorage.getItem(saveKey);sim=createCitySimulation(CityWorld,{initialState:raw?JSON.parse(raw):null});}catch{sim=createCitySimulation(CityWorld);}
 function save(){try{localStorage.setItem(saveKey,JSON.stringify(sim.snapshot()));}catch{saveAvailable=false;document.getElementById('save-status').textContent='Браузер не разрешает сохранение. История сохранится только до закрытия страницы.';}}
 setInterval(save,5000);window.addEventListener('pagehide',save);
 document.getElementById('reset-city').onclick=()=>{if(confirm('Начать новую историю? Семьи, бюджеты и отношения будут сброшены. Объявления останутся.')){try{localStorage.removeItem(saveKey);}catch{}sim=createCitySimulation(CityWorld);speechNodes.clear();speechLayer.replaceChildren();selected=null;save();}};const canvas=document.getElementById('life'),ctx=canvas.getContext('2d');const extent=CityWorld.size*25;canvas.width=canvas.height=extent;ctx.imageSmoothingEnabled=false;
 const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let paused=reduced,speed=1,last=0,drawTime=0,selected=null,speechVisible=true;
const speechLayer=$('speech-layer');
$('life-count').textContent=sim.agents.length;
$('toggle-speech').onclick=()=>{speechVisible=!speechVisible;$('toggle-speech').setAttribute('aria-pressed',speechVisible);$('toggle-speech').textContent=speechVisible?'Реплики: вкл':'Реплики: выкл';speechLayer.hidden=!speechVisible;};
const speechNodes=new Map();
 const labels={walk:'идёт',talk:'разговаривает с соседом',fight:'устроил потасовку',buy:'делает покупки',work:'работает',rest:'отдыхает',argue:'ссорится',reconcile:'мирится с соседом',eat:'ест дома',sleep:'спит',service:'проводит время в заведении'};
 function pauseUI(){$('pause-life').textContent=paused?'Продолжить':'Пауза';$('pause-life').setAttribute('aria-pressed',paused);}
 $('pause-life').onclick=()=>{paused=!paused;pauseUI();save();};$('speed-life').onclick=()=>{speed=speed===1?2:speed===2?4:1;$('speed-life').textContent='Скорость ×'+speed;};pauseUI();
 function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
 function draw(){ctx.clearRect(0,0,extent,extent);
 const phase=sim.time;const hour=(8+phase/30)%24;document.getElementById('scenery').style.filter='brightness('+(hour<6||hour>=21?.57:hour<8||hour>18?.78:1)+')';
 if(sim.weather==='дождь'){for(let i=0;i<90;i++){const rx=(i*137+phase*30)%extent,ry=(i*79+phase*65)%extent;rect(rx,ry,1,4,'#a0b4ad60');}}
 $('city-weather').textContent=sim.weather.toUpperCase();
 // Residents are painted in depth order, with bags and distinct social gestures.
 for(const a of [...sim.agents].sort((a,b)=>a.y-b.y)){
 const x=a.x,y=a.y-9,step=a.state==='walk'?Math.sin(phase*9+a.id):0;
 rect(x-3,y+13,8,2,'#29392b65');rect(x-1,y,3,3,'#c4a27c');rect(x-2,y-1,4,1,a.id%3?'#49483c':'#a99870');rect(x-2,y+3,5,6,a.color);
 rect(x-2,y+9+Math.max(0,step),2,4,'#313e33');rect(x+1,y+9+Math.max(0,-step),2,4,'#313e33');
 const punch=a.state==='fight'?(Math.sin(phase*16+a.id)>0?4:-4):0;rect(x-3+punch,y+4,2,4,a.color);rect(x+3,y+4,1,4,a.color);
 if(a.bag){rect(x+4,y+6,4,5,'#c8b88b');rect(x+5,y+4,2,2,'#8d805d');}
 if(a.state==='work'){rect(x+5,y+3,1,6,'#b0ad94');rect(x+3,y+3,4,1,'#a0a997');}
 if(a.state==='fight'){rect(x+6,y-3,1,5,'#d9ba70');rect(x+6,y+3,1,1,'#d9ba70');}

 }
 // A tram-era delivery van circles the road instead of crossing the buildings.
 const v=phase*9%900;rect(v,709,19,9,'#a79960');rect(v+12,710,5,4,'#425952');rect(v+2,718,4,3,'#303d30');rect(v+13,718,4,3,'#303d30');
 for(let i=0;i<5;i++)rect(908-Math.round(phase*4+i*13)%40,496-i*5,10+i*2,4,'#9c998480');
 rect(745,684,3,3,Math.sin(phase*3)>-.4?'#d1b269':'#756547');
 const dogX=705+Math.sin(phase*.3)*14;rect(dogX,695,8,4,'#9d865f');rect(dogX+6,692,4,5,'#9d865f');rect(dogX,699,1,3,'#4a513a');rect(dogX+5,699,1,3,'#4a513a');
 const minutes=480+Math.floor(sim.time*2);$('city-clock').textContent='ДЕНЬ '+(1+Math.floor(sim.time/720))+' / '+String(Math.floor(minutes/60)%24).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
 renderSpeech();renderEconomy();
 $('life-news').textContent=sim.log.slice(0,3).map(e=>e.text).join(' / ')||'Город просыпается. Нажмите на жителя, чтобы познакомиться.';
 if(selected&&$('dialog').open&&$('adAddress').textContent==='ЖИТЕЛЬ РАЙОНА')updateResident(selected);
 }

 function renderSpeech(){
 const r=canvas.getBoundingClientRect(),view=$('viewport').getBoundingClientRect(),occupied=[],visible=new Set();
 if(speechVisible){const speakers=sim.agents.filter(a=>a.bubble&&sim.time<a.bubbleUntil).sort((a,b)=>(['argue','fight','reconcile'].includes(b.state)?1:0)-(['argue','fight','reconcile'].includes(a.state)?1:0));
 for(const a of speakers){const px=r.left-view.left+a.x/extent*r.width,py=r.top-view.top+(a.y-12)/extent*r.height;if(px<0||px>view.width||py<0||py>view.height)continue;
 const w=Math.min(230,view.width-24),h=76;let left=Math.max(12,Math.min(view.width-w-12,px-w/2)),top=Math.max(8,Math.min(view.height-h-12,py-h));
 let tries=0;while(occupied.some(b=>left<b.left+w&&left+w>b.left&&top<b.top+h&&top+h>b.top)&&tries++<6)top-=h+6;
 if(top<8||visible.size>=7)continue;occupied.push({left,top});visible.add(a.id);
 let el=speechNodes.get(a.id);if(!el){el=document.createElement('button');el.className='speech-bubble';const name=document.createElement('strong'),line=document.createElement('span');el.append(name,line);el.onclick=()=>openResident(a);speechLayer.append(el);speechNodes.set(a.id,el);}
 el.hidden=false;el.className='speech-bubble '+a.state;el.style.left=left+'px';el.style.top=top+'px';el.style.width=w+'px';el.children[0].textContent=a.name;el.children[1].textContent=a.bubble;
 }}for(const[id,el]of speechNodes)if(!visible.has(id))el.hidden=true;
 }
 let lastJournal='';function renderEconomy(){
 $('family-count').textContent=sim.families.length;$('working-count').textContent=sim.agents.filter(a=>a.state==='work').length;$('shop-stock').textContent=[...sim.stocks.values()].reduce((n,s)=>n+s.stock,0);$('family-money').textContent=sim.families.reduce((n,f)=>n+f.money,0)+' ₽';
 const stamp=sim.log[0]?.time+':'+sim.log[0]?.text;if(stamp===lastJournal)return;lastJournal=stamp;$('event-list').replaceChildren();
 for(const e of sim.log.slice(0,12)){const item=document.createElement('button');item.className='event-entry '+e.type;item.textContent=e.text;item.onclick=()=>{if(Number.isFinite(e.x))window.dispatchEvent(new CustomEvent('city-focus',{detail:{x:e.x,y:e.y}}));};$('event-list').append(item);}
 }
 function updateResident(a){const family=sim.families[a.familyId];$('adName').textContent=a.name+' / '+a.role;$('adText').textContent='Сейчас '+labels[a.state]+(a.state==='walk'?' к месту «'+a.goal.name+'».':'.')+'\nСемья: '+family.name+'; дом: '+family.home.name+'.\nОбщий бюджет: '+family.money+' ₽. Запас еды: '+family.pantry+' порций.\nГолод: '+Math.round(a.hunger)+' / 100. Силы: '+Math.round(a.energy)+' / 100. Общение: '+Math.round(a.social)+' / 100.\nНапряжение в семье: '+Math.round(family.tension)+' / 100.\n'+(a.bag?'Несёт продукты домой.':'')+(a.bubble?'\nГоворит: «'+a.bubble+'»':'');}
 function openResident(a){selected=a;$('formView').hidden=true;$('adView').hidden=false;$('adAddress').textContent='ЖИТЕЛЬ РАЙОНА';$('adLink').hidden=true;updateResident(a);if(!$('dialog').open)$('dialog').showModal();}
 $('viewport').addEventListener('click',e=>{if(e.defaultPrevented||e.target.closest('.zoom,.landmark-label,.speech-bubble'))return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*extent,y=(e.clientY-r.top)/r.height*extent;const a=sim.agents.find(a=>Math.hypot(a.x-x,a.y-3-y)<7);if(!a)return;e.preventDefault();e.stopPropagation();openResident(a);},true);
 function frame(t){const dt=last?Math.min((t-last)/1000,.1):0;last=t;if(!paused&&!document.hidden){for(let i=0;i<speed;i++)sim.tick(dt);}if(t-drawTime>100){drawTime=t;draw();}requestAnimationFrame(frame);}
 document.addEventListener('visibilitychange',()=>{last=0;});requestAnimationFrame(frame);
})();
