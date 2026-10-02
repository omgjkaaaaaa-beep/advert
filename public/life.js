(function(){
 const saveKey='kvartal-city-simulation-v2';let sim,saveAvailable=true;try{const raw=localStorage.getItem(saveKey);sim=createCitySimulation(CityWorld,{initialState:raw?JSON.parse(raw):null});}catch{sim=createCitySimulation(CityWorld);}
 function save(){try{localStorage.setItem(saveKey,JSON.stringify(sim.snapshot()));}catch{saveAvailable=false;document.getElementById('save-status').textContent='Браузер не разрешает сохранение. История сохранится только до закрытия страницы.';}}
 setInterval(save,5000);window.addEventListener('pagehide',save);
 document.getElementById('reset-city').onclick=()=>{if(confirm('Начать новую историю? Семьи, бюджеты и отношения будут сброшены. Объявления останутся.')){try{localStorage.removeItem(saveKey);}catch{}sim=createCitySimulation(CityWorld);speechNodes.clear();speechLayer.replaceChildren();incidentMarkers.clear();$('incident-layer').replaceChildren();warMarkers.clear();$('war-layer').replaceChildren();politicalStamp='';incidentStamp='';selected=null;selectedAnimal=null;save();}};const canvas=document.getElementById('life'),ctx=canvas.getContext('2d');const extent=CityWorld.size*25;canvas.width=canvas.height=extent;ctx.imageSmoothingEnabled=false;
 const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let paused=reduced,speed=1,last=0,drawTime=0,selected=null,selectedAnimal=null,speechVisible=true;
const speechLayer=$('speech-layer');
$('life-count').textContent=sim.agents.length;
$('toggle-speech').onclick=()=>{speechVisible=!speechVisible;$('toggle-speech').setAttribute('aria-pressed',speechVisible);$('toggle-speech').textContent=speechVisible?'Реплики: вкл':'Реплики: выкл';speechLayer.hidden=!speechVisible;};
const speechNodes=new Map();
 const labels={walk:'идёт',talk:'разговаривает с соседом',fight:'устроил потасовку',buy:'делает покупки',work:'работает',rest:'отдыхает',argue:'ссорится',reconcile:'мирится с соседом',eat:'ест дома',sleep:'спит',service:'проводит время в заведении',injured:'ждёт помощи после наезда'};
 function pauseUI(){$('pause-life').textContent=paused?'Продолжить':'Пауза';$('pause-life').setAttribute('aria-pressed',paused);}
 $('pause-life').onclick=()=>{paused=!paused;pauseUI();save();};$('speed-life').onclick=()=>{speed=speed===1?2:speed===2?4:1;$('speed-life').textContent='Скорость ×'+speed;};pauseUI();
 function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
 function draw(){ctx.clearRect(0,0,extent,extent);
 const phase=sim.time;const hour=(8+phase/30)%24;document.getElementById('scenery').style.filter='brightness('+(hour<6||hour>=21?.57:hour<8||hour>18?.78:1)+')';
 if(sim.weather==='дождь'){for(let i=0;i<90;i++){const rx=(i*137+phase*30)%extent,ry=(i*79+phase*65)%extent;rect(rx,ry,1,4,'#a0b4ad60');}}
 $('city-weather').textContent=sim.weather.toUpperCase();
 // Residents are painted in depth order, with bags and distinct social gestures.
 for(const a of [...sim.agents].sort((a,b)=>a.y-b.y)){
 const tall=(a.appearance?.height||11)-11;const x=a.x,y=a.y-9-tall,step=a.state==='walk'?Math.sin(phase*9+a.id):0;
 if(a.state==='injured'){rect(x-5,y+6,11,3,a.color);rect(x+5,y+5,3,3,'#c4a27c');continue;}
 rect(x-3,y+13,8,2,'#29392b65');rect(x-1,y,3,3,(a.appearance?.skin||'#c4a27c'));rect(x-2,y-1,4,1,(a.appearance?.hair||'#49483c'));if(a.appearance?.hat===0)rect(x-3,y-2,6,2,a.color);else if(a.appearance?.hat===1)rect(x-2,y-2,4,2,'#c5b28b');rect(x-2,y+3,5,6+tall,a.color);if(a.id%3===0)rect(x-2,y+3,5,1,'#b39e74');if(a.id%6===0)rect(x-1,y+1,4,1,'#35352b');
 rect(x-2,y+9+tall+Math.max(0,step),2,4,'#313e33');rect(x+1,y+9+tall+Math.max(0,-step),2,4,'#313e33');
 const punch=a.state==='fight'?(Math.sin(phase*16+a.id)>0?4:-4):0;rect(x-3+punch,y+4,2,4,a.color);rect(x+3,y+4,1,4,a.color);
 if(a.bag){rect(x+4,y+6,4,5,'#c8b88b');rect(x+5,y+4,2,2,'#8d805d');}
 if(a.state==='work'){rect(x+5,y+3,1,6,'#b0ad94');rect(x+3,y+3,4,1,'#a0a997');}
 if(a.state==='fight'){rect(x+6,y-3,1,5,'#d9ba70');rect(x+6,y+3,1,1,'#d9ba70');}

 }

 drawPolitics();
 for(const car of sim.services.cars)drawVehicle(car,car.color,false);
 for(const unit of sim.services.units)drawVehicle(unit,unit.type==='police'?'#759295':unit.type==='ambulance'?'#d4caae':'#ba6040',unit.state==='respond'||unit.state==='help',unit.type);
 for(const incident of sim.services.incidents.filter(i=>!i.resolved)){rect(incident.x-8,incident.y-12,16,2,'#bf754b');rect(incident.x-8,incident.y-12,2,7,'#bf754b');rect(incident.x+6,incident.y-12,2,7,'#bf754b');if(['accident','pedestrian'].includes(incident.type)){rect(incident.x-12,incident.y-12,24,1,'#f1b97a');rect(incident.x-12,incident.y+12,24,1,'#f1b97a');rect(incident.x-12,incident.y-12,1,24,'#f1b97a');rect(incident.x+12,incident.y-12,1,24,'#f1b97a');rect(incident.x,incident.y-18,5,5,'#8d958477');rect(incident.x+2,incident.y-25,8,4,'#a2a59455');}}
 for(let i=0;i<5;i++)rect(908-Math.round(phase*4+i*13)%40,496-i*5,10+i*2,4,'#9c998480');
 rect(745,684,3,3,Math.sin(phase*3)>-.4?'#d1b269':'#756547');

 for(const a of sim.wildlife.animals){const x=a.x,y=a.y,bob=a.path.length?Math.sin(phase*8+a.id):0,flip=a.path[0]&&a.path[0].x<x?-1:1;
 if(a.kind==='cat'||a.kind==='dog'){const coat=(a.kind==='cat'?['#b58958','#b8b8a0','#776b5a','#c1ad85']:['#8b7956','#665847','#bbb091','#6e7971'])[Math.floor(a.id/4)%4],w=a.kind==='cat'?7:10;rect(x-w/2,y-4,w,4,coat);rect(x+flip*w/2-2,y-7,4,5,coat);rect(x+flip*w/2-1,y-8,1,2,coat);rect(x-w/2+1,y+Math.max(0,bob),1,3,'#39442f');rect(x+w/2-2,y+Math.max(0,-bob),1,3,'#39442f');rect(x-flip*w/2,y-6,1,4,coat);if(a.kind==='dog')rect(x+flip*(w/2+1),y-4,2,1,'#c1b094');}
 else if(a.kind==='pigeon'){rect(x-2,y-3,5,3,['#899891','#74867f','#a3aaa0'][a.id%3]);rect(x+2,y-5,2,3,'#596e67');rect(x+4,y-4,1,1,'#c2a36a');rect(x-1,y-2,2,1,'#576c65');rect(x,y,1,2,'#8f6b53');}
 else{rect(x-3,y-3,7,4,'#a79466');rect(x+2,y-6,3,4,'#496c52');rect(x+5,y-5,2,1,'#d4ae62');rect(x-4,y+2,9,1,'#a6b9a260');}
 if(a.state==='eat'){rect(x+6,y,1,1,'#d7c484');rect(x+9,y+2,1,1,'#d7c484');}
 }
 const minutes=480+Math.floor(sim.time*2);$('city-clock').textContent='ДЕНЬ '+(1+Math.floor(sim.time/720))+' / '+String(Math.floor(minutes/60)%24).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
 renderSpeech();renderEconomy();renderIncidents();renderPolitics();
 $('life-news').textContent=sim.log.slice(0,3).map(e=>e.text).join(' / ')||'Город просыпается. Нажмите на жителя, чтобы познакомиться.';
 if(selectedAnimal&&$('dialog').open&&$('adAddress').textContent==='ЖИВОТНОЕ РАЙОНА')updateAnimal(selectedAnimal);
 if(selected&&$('dialog').open&&$('adAddress').textContent==='ЖИТЕЛЬ РАЙОНА')updateResident(selected);
 }



 $('tax-policy').onchange=e=>sim.politics.setPolicy('tax',Number(e.target.value));$('budget-policy').onchange=e=>sim.politics.setPolicy('priority',e.target.value);
 $('government-auto').onclick=()=>{sim.politics.state.autonomous=!sim.politics.state.autonomous;};$('peace-talks').onclick=()=>{if(!sim.politics.mediate())$('life-news').textContent='В бюджете не хватает 35 ₽ на переговоры.';};
 const warMarkers=new Map();let politicalStamp='';function renderPolitics(){const p=sim.politics,s=p.state;const activeWars=p.conflicts.filter(c=>c.war&&!c.resolved),liveIds=new Set(activeWars.map(c=>c.id)),r=canvas.getBoundingClientRect(),view=$('viewport').getBoundingClientRect();for(const c of activeWars){let button=warMarkers.get(c.id);if(!button){button=document.createElement('button');button.className='incident-marker war-marker';button.textContent='! ВООРУЖЁННЫЙ КОНФЛИКТ';button.onclick=()=>window.dispatchEvent(new CustomEvent('city-focus',{detail:c}));$('war-layer').append(button);warMarkers.set(c.id,button);}const x=r.left-view.left+c.x/extent*r.width,y=r.top-view.top+c.y/extent*r.height;button.style.left=x+'px';button.style.top=(y-55)+'px';button.hidden=x<0||y<0||x>view.width||y>view.height;}for(const[id,b]of warMarkers)if(!liveIds.has(id)){b.remove();warMarkers.delete(id);}$('mayor-name').textContent=s.mayor;$('mayor-status').textContent=s.legitimacy+' / срок '+s.term+' / '+s.crisis;$('city-treasury').textContent=Math.round(s.treasury)+' ₽';$('city-tax').textContent='Налог '+Math.round(s.taxRate*100)+'% · расходы '+s.lastSpending+' ₽';$('city-trust').textContent=Math.round(s.trust)+'%';$('city-unrest').textContent='Недовольство '+Math.round(s.unrest)+'% · гарнизон '+Math.round(s.garrisonLoyalty)+'%';$('city-production').textContent=Math.round(s.production)+' ₽ продукции';$('city-prices').textContent='Продукты '+s.price+' ₽ · торговля '+Math.round(s.tradeMultiplier*100)+'%';$('tax-policy').value=s.taxRate;$('budget-policy').value=s.priority;$('government-auto').textContent=s.autonomous?'Управление: автономное':'Управление: ваши решения';$('government-auto').setAttribute('aria-pressed',s.autonomous);$('peace-talks').disabled=s.treasury<35;
 const stamp=Math.floor(sim.time)+':'+p.factions.length+':'+p.history[0]?.text;if(stamp===politicalStamp)return;politicalStamp=stamp;$('settlement-list').replaceChildren();
 for(const settlement of p.settlements){const button=document.createElement('button');const conflict=p.conflicts.find(c=>!c.resolved&&(c.a===settlement.id||c.b===settlement.id));button.textContent=settlement.name+' · достаток '+Math.round(settlement.prosperity)+'% · '+(conflict?(conflict.war?'ВОЙНА':'спор'):settlement.attitude>45?'напряжение':'торговля');button.onclick=()=>window.dispatchEvent(new CustomEvent('city-focus',{detail:conflict?.war?conflict:settlement}));$('settlement-list').append(button);}
 $('faction-list').replaceChildren();if(!p.factions.length){const text=document.createElement('p');text.textContent='Частных вооружённых групп пока нет. Их появление зависит от недовольства и поддержки жителей.';$('faction-list').append(text);}for(const f of p.factions){const button=document.createElement('button');button.textContent=f.name+' / '+f.members+' участников / поддержка '+Math.round(f.support)+'% / '+f.status;button.onclick=()=>window.dispatchEvent(new CustomEvent('city-focus',{detail:f}));$('faction-list').append(button);}
 $('political-history').replaceChildren();for(const e of p.history){const button=document.createElement('button');button.className='event-entry '+e.type;button.textContent=e.text;button.onclick=()=>window.dispatchEvent(new CustomEvent('city-focus',{detail:e}));$('political-history').append(button);}
 }
 function drawPolitics(){const p=sim.politics;
 for(const u of p.units){const x=u.x,y=u.y;rect(x-2,y-7,4,3,u.kind==='garrison'?'#788660':'#8e6652');rect(x-1,y-4,3,2,'#b2936c');rect(x-2,y-2,4,5,u.kind==='garrison'?'#596947':'#786249');rect(x-2,y+3,1,3,'#2d3b2b');rect(x+1,y+3,1,3,'#2d3b2b');rect(x+3,y-1,4,1,'#30392d');}
 for(const c of p.conflicts.filter(c=>c.war&&!c.resolved)){const t=sim.time,cx=c.x,cy=c.y;for(let i=0;i<4;i++){const x=cx-17+i*11,y=cy+Math.sin(t+i)*5;rect(x,y-6,4,8,i%2?'#87694d':'#5e704d');rect(x,y+2,1,4,'#293b29');rect(x+3,y+2,1,4,'#293b29');if(Math.sin(t*8+i)>0.65){rect(x+5,y-2,2,1,'#eed190');rect(x+9,y-2,5,1,'#cba966');}}
 const building=CityWorld.landmarks.filter(p=>p.generated).sort((a,b)=>Math.hypot(a.x*25-cx,a.y*25-cy)-Math.hypot(b.x*25-cx,b.y*25-cy))[0];if(building&&c.damage>3){const bx=building.x*25+15,by=building.y*25+17;rect(bx,by,8,5,'#49392d');rect(bx+3,by-4,3,7,'#ac6038');rect(bx+5,by-8,2,8,'#c59345');rect(bx,by-17,12,5,'#8e8d7566');}
 const flash=Math.sin(t*5)>0.8;rect(cx+8,cy-10,flash?6:3,flash?6:3,flash?'#d69448':'#7f6750');rect(cx+4,cy-20-Math.floor(t%5),12,5,'#a09e8660');rect(cx-12,cy+9,28,2,'#6f4331');}
 }
 function drawVehicle(v,color,siren,type){const pos=sim.services.position(v);v={...v,x:pos.x,y:pos.y};const vertical=!!v.heading?.y,w=vertical?7:14,h=vertical?14:7;rect(v.x-w/2,v.y-h/2,w,h,color);rect(v.x-w/2+2,v.y-h/2+2,w-4,h-4,'#405e5b');rect(v.x-w/2-1,v.y-h/2+1,1,3,'#2b3b2a');rect(v.x+w/2,v.y+h/2-4,1,3,'#2b3b2a');if(type==='ambulance'){rect(v.x-3,v.y,6,2,'#ac563c');rect(v.x-1,v.y-2,2,6,'#ac563c');}if(siren){rect(v.x-3,v.y-3,3,2,Math.sin(sim.time*14)>0?'#8ab6cf':'#94523f');rect(v.x,v.y-3,3,2,Math.sin(sim.time*14)>0?'#b9634b':'#627884');}}

 const incidentMarkers=new Map();let incidentStamp='';
 function renderIncidents(){const active=sim.services.incidents.filter(i=>!i.resolved),r=canvas.getBoundingClientRect(),view=$('viewport').getBoundingClientRect(),ids=new Set();
 for(const i of active){ids.add(i.id);let button=incidentMarkers.get(i.id);if(!button){button=document.createElement('button');button.className='incident-marker';button.onclick=()=>window.dispatchEvent(new CustomEvent('city-focus',{detail:{x:i.x,y:i.y}}));$('incident-layer').append(button);incidentMarkers.set(i.id,button);}const x=r.left-view.left+i.x/extent*r.width,y=r.top-view.top+i.y/extent*r.height;button.hidden=x<0||y<0||x>view.width||y>view.height;button.style.left=x+'px';button.style.top=(y-30)+'px';button.textContent=i.type==='pedestrian'?'! НАЕЗД':i.type==='accident'?'! ДТП':'! ПОЛИЦИЯ';}
 for(const[id,b]of incidentMarkers)if(!ids.has(id)){b.remove();incidentMarkers.delete(id);}
 const stamp=active.map(i=>i.id+':'+i.policeDone+':'+i.medicalDone).join('|');if(stamp===incidentStamp&&$('active-incidents').childElementCount)return;incidentStamp=stamp;$('active-incidents').replaceChildren();
 if(!active.length){const text=document.createElement('p');text.textContent='Сейчас активных вызовов нет. При происшествии здесь появится адрес и кнопка перехода.';$('active-incidents').append(text);return;}
 for(const i of active){const button=document.createElement('button');button.className='incident-card';const title=document.createElement('strong'),line=document.createElement('span');title.textContent=(i.type==='pedestrian'?'Наезд на пешехода':i.type==='accident'?'Дорожная авария':'Вызов полиции')+' / квадрат '+(Math.floor(i.x/25)+1)+':'+(Math.floor(i.y/25)+1);line.textContent='Полиция: '+(i.policeDone?'закончила':'в пути / на месте')+(i.type!=='fight'?' · Скорая: '+(i.medicalDone?'помощь оказана':'в пути / на месте'):'')+' · ПОКАЗАТЬ НА КАРТЕ';button.append(title,line);button.onclick=()=>window.dispatchEvent(new CustomEvent('city-focus',{detail:{x:i.x,y:i.y}}));$('active-incidents').append(button);}
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
 $('incident-count').textContent=sim.services.incidents.filter(i=>!i.resolved).length;
 $('animal-count').textContent=sim.wildlife.animals.length;$('building-count').textContent=CityWorld.landmarks.filter(p=>p.kind==='residence'||p.key==='block').length;
 $('family-count').textContent=sim.families.length;$('working-count').textContent=sim.agents.filter(a=>a.state==='work').length;$('shop-stock').textContent=[...sim.stocks.values()].reduce((n,s)=>n+s.stock,0);$('family-money').textContent=sim.families.reduce((n,f)=>n+f.money,0)+' ₽';
 const stamp=sim.log[0]?.time+':'+sim.log[0]?.text;if(stamp===lastJournal)return;lastJournal=stamp;$('event-list').replaceChildren();
 for(const e of sim.log.slice(0,12)){const item=document.createElement('button');item.className='event-entry '+e.type;item.textContent=e.text;item.onclick=()=>{if(Number.isFinite(e.x))window.dispatchEvent(new CustomEvent('city-focus',{detail:{x:e.x,y:e.y}}));};$('event-list').append(item);}
 }
 function updateResident(a){const family=sim.families[a.familyId];$('adName').textContent=a.name+' / '+a.role;$('adText').textContent='Сейчас '+labels[a.state]+(a.state==='walk'?' к месту «'+a.goal.name+'».':'.')+'\nХарактер: '+(a.traits.caution>.6?'осторожный':a.traits.temper>.6?'вспыльчивый':a.traits.sociability>.6?'общительный':'сдержанный')+'.\nСемья: '+family.name+'; дом: '+family.home.name+'.\nОбщий бюджет: '+family.money+' ₽. Запас еды: '+family.pantry+' порций.\nГолод: '+Math.round(a.hunger)+' / 100. Силы: '+Math.round(a.energy)+' / 100. Общение: '+Math.round(a.social)+' / 100.\nЗдоровье: '+(a.health??100)+' / 100.\nНапряжение в семье: '+Math.round(family.tension)+' / 100.\n'+(a.bag?'Несёт продукты домой.':'')+(a.bubble?'\nГоворит: «'+a.bubble+'»':'');}
 function openResident(a){selectedAnimal=null;selected=a;$('formView').hidden=true;$('adView').hidden=false;$('adAddress').textContent='ЖИТЕЛЬ РАЙОНА';$('adLink').hidden=true;updateResident(a);if(!$('dialog').open)$('dialog').showModal();}

 function updateAnimal(a){const kind={cat:'кошка',dog:'собака',pigeon:'голубь',duck:'утка'},activity={rest:'отдыхает',wander:'гуляет по дворам',seekFood:'ищет еду',eat:'ест',follow:'идёт следом за жителем',swim:'плавает в пруду'};$('adName').textContent=a.name+' / '+kind[a.kind];$('adText').textContent='Сейчас '+(activity[a.state]||'гуляет')+'.\nГолод: '+Math.round(a.hunger)+' / 100.';}
 function openAnimal(a){selected=null;selectedAnimal=a;$('formView').hidden=true;$('adView').hidden=false;$('adAddress').textContent='ЖИВОТНОЕ РАЙОНА';$('adLink').hidden=true;updateAnimal(a);if(!$('dialog').open)$('dialog').showModal();}
 $('viewport').addEventListener('click',e=>{if(e.defaultPrevented||e.target.closest('.zoom,.landmark-label,.speech-bubble,.incident-marker'))return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*extent,y=(e.clientY-r.top)/r.height*extent;const a=sim.agents.find(a=>Math.hypot(a.x-x,a.y-3-y)<7);if(!a){const animal=sim.wildlife.animals.find(a=>Math.hypot(a.x-x,a.y-2-y)<6);if(animal){e.preventDefault();e.stopPropagation();openAnimal(animal);}return;}e.preventDefault();e.stopPropagation();openResident(a);},true);
 function frame(t){const dt=last?Math.min((t-last)/1000,.1):0;last=t;if(!paused&&!document.hidden){for(let i=0;i<speed;i++)sim.tick(dt);}if(t-drawTime>100){drawTime=t;draw();}requestAnimationFrame(frame);}
 document.addEventListener('visibilitychange',()=>{last=0;});requestAnimationFrame(frame);
})();
