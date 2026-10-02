(function(){
 const sim=createCitySimulation(CityWorld);const canvas=document.getElementById('life'),ctx=canvas.getContext('2d');canvas.width=canvas.height=1000;ctx.imageSmoothingEnabled=false;
 const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let paused=reduced,speed=1,last=0,drawTime=0,selected=null;
 const labels={walk:'идёт',talk:'разговаривает с соседом',fight:'устроил потасовку',buy:'делает покупки',work:'работает',rest:'отдыхает'};
 function pauseUI(){$('pause-life').textContent=paused?'Продолжить':'Пауза';$('pause-life').setAttribute('aria-pressed',paused);}
 $('pause-life').onclick=()=>{paused=!paused;pauseUI();};$('speed-life').onclick=()=>{speed=speed===1?2:speed===2?4:1;$('speed-life').textContent='Скорость ×'+speed;};pauseUI();
 function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
 function draw(){ctx.clearRect(0,0,1000,1000);
 const phase=sim.time;
 // Residents are painted in depth order, with bags and distinct social gestures.
 for(const a of [...sim.agents].sort((a,b)=>a.y-b.y)){
 const x=a.x,y=a.y-9,step=a.state==='walk'?Math.sin(phase*9+a.id):0;
 rect(x-3,y+13,8,2,'#29392b65');rect(x-1,y,3,3,'#c4a27c');rect(x-2,y-1,4,1,a.id%3?'#49483c':'#a99870');rect(x-2,y+3,5,6,a.color);
 rect(x-2,y+9+Math.max(0,step),2,4,'#313e33');rect(x+1,y+9+Math.max(0,-step),2,4,'#313e33');
 const punch=a.state==='fight'?(Math.sin(phase*16+a.id)>0?4:-4):0;rect(x-3+punch,y+4,2,4,a.color);rect(x+3,y+4,1,4,a.color);
 if(a.bag){rect(x+4,y+6,4,5,'#c8b88b');rect(x+5,y+4,2,2,'#8d805d');}
 if(a.state==='work'){rect(x+5,y+3,1,6,'#b0ad94');rect(x+3,y+3,4,1,'#a0a997');}
 if(a.state==='fight'){rect(x+6,y-3,1,5,'#d9ba70');rect(x+6,y+3,1,1,'#d9ba70');}
 if(a.bubble&&phase<a.bubbleUntil){ctx.font='4px monospace';const w=ctx.measureText(a.bubble).width+6;rect(x-w/2,y-10,w,7,'#ded2b2');ctx.fillStyle='#313c2f';ctx.fillText(a.bubble,Math.round(x-w/2+3),Math.round(y-5));}
 }
 // A tram-era delivery van circles the road instead of crossing the buildings.
 const v=phase*9%900;rect(v,709,19,9,'#a79960');rect(v+12,710,5,4,'#425952');rect(v+2,718,4,3,'#303d30');rect(v+13,718,4,3,'#303d30');
 for(let i=0;i<5;i++)rect(908-Math.round(phase*4+i*13)%40,496-i*5,10+i*2,4,'#9c998480');
 rect(745,684,3,3,Math.sin(phase*3)>-.4?'#d1b269':'#756547');
 const dogX=705+Math.sin(phase*.3)*14;rect(dogX,695,8,4,'#9d865f');rect(dogX+6,692,4,5,'#9d865f');rect(dogX,699,1,3,'#4a513a');rect(dogX+5,699,1,3,'#4a513a');
 $('city-clock').textContent=String(8+Math.floor(sim.time/60)%16).padStart(2,'0')+':'+String(Math.floor(sim.time)%60).padStart(2,'0');
 $('life-news').textContent=sim.log.slice(0,3).map(e=>e.text).join(' / ')||'Город просыпается. Нажмите на жителя, чтобы познакомиться.';
 if(selected&&$('dialog').open&&$('adAddress').textContent==='ЖИТЕЛЬ РАЙОНА')updateResident(selected);
 }
 function updateResident(a){$('adName').textContent=a.name+' / '+a.role;$('adText').textContent='Сейчас '+labels[a.state]+(a.state==='walk'?' к месту «'+a.goal.name+'».':'.')+'\nВ кармане: '+a.money+' ₽. '+(a.bag?'Несёт пакет с покупками.':'Пока без покупок.');}
 $('viewport').addEventListener('click',e=>{if(e.defaultPrevented||e.target.closest('.zoom,.landmark-label'))return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*1000,y=(e.clientY-r.top)/r.height*1000;const a=sim.agents.find(a=>Math.hypot(a.x-x,a.y-3-y)<7);if(!a)return;e.preventDefault();e.stopPropagation();selected=a;$('formView').hidden=true;$('adView').hidden=false;$('adAddress').textContent='ЖИТЕЛЬ РАЙОНА';$('adLink').hidden=true;updateResident(a);$('dialog').showModal();},true);
 function frame(t){const dt=last?Math.min((t-last)/1000,.1):0;last=t;if(!paused&&!document.hidden){for(let i=0;i<speed;i++)sim.tick(dt);}if(t-drawTime>100){drawTime=t;draw();}requestAnimationFrame(frame);}
 document.addEventListener('visibilitychange',()=>{last=0;});requestAnimationFrame(frame);
})();
