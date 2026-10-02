(function(root){
 function createAnimals(world,{places,route,nearest,seed=903,count=72,initialState=null}){
 let time=0;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const pick=a=>a[Math.floor(random()*a.length)];
 const pond=places.find(p=>p.key==='pond'),water={left:pond.x*25+29,right:(pond.x+pond.w)*25-29,top:pond.y*25+31,bottom:(pond.y+pond.h)*25-38};
 const regular=places.filter(p=>p.generated||['yard','garages','market','park','shop','boiler','block'].includes(p.key));
 const species=['cat','dog','pigeon','duck'],names={cat:['Мурзик','Рыжик','Барсик','Пушок'],dog:['Шарик','Жучка','Бобик','Дружок'],pigeon:['Голубь Сизый','Голубь Ворчун','Голубь Зерно'],duck:['Утка Кря','Утка Маруся','Селезень Фёдор']};
 const activities={wander:0,rest:0,eat:0,follow:0,swim:0,seekFood:0};
 const animals=Array.from({length:count},(_,i)=>{const kind=species[i%4],p=i<16?places.find(p=>p.key===['yard','block','market','pond'][i%4]):pick(regular);return{id:i,kind,name:names[kind][Math.floor(i/4)%names[kind].length]+' '+(Math.floor(i/16)+1),x:kind==='duck'?water.left+random()*(water.right-water.left):p.door[0]*25+12,y:kind==='duck'?water.top+random()*(water.bottom-water.top):p.door[1]*25+12,state:'rest',until:time+random()*6,hunger:random()*50,speed:kind==='dog'?16:kind==='cat'?11:kind==='pigeon'?8:5,path:[],target:null};});
 function go(a,p,state='wander'){a.path=route(a,p);a.state=state;a.target=p.key;activities[state]++;}
 function choose(a,residents){if(a.kind==='duck'){a.state='swim';a.path=[{x:water.left+random()*(water.right-water.left),y:water.top+random()*(water.bottom-water.top)}];activities.swim++;return;}
 if(a.kind==='dog'){const owner=residents.find(r=>Math.hypot(r.x-a.x,r.y-a.y)<35&&r.state==='walk');if(owner&&random()<.6){const door=nearest(Math.floor(owner.x/25),Math.floor(owner.y/25));go(a,{key:'resident-'+owner.id,door},'follow');return;}}
 if(a.hunger>55){const food=pick(places.filter(p=>['market','shop','cafe','bakery','yard'].includes(p.key)));go(a,food,'seekFood');return;}
 const local=regular.filter(p=>Math.hypot(p.door[0]*25-a.x,p.door[1]*25-a.y)<140);go(a,pick(local.length?local:regular));
 }
 function tick(dt,residents=[]){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.5,dt);time+=dt;for(const a of animals){a.hunger=Math.min(100,a.hunger+dt*.32);
 if(a.path.length){let distance=a.speed*dt;while(distance>0&&a.path.length){const p=a.path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy);if(d<=distance){a.x=p.x;a.y=p.y;distance-=d;a.path.shift();}else{a.x+=dx/d*distance;a.y+=dy/d*distance;distance=0;}}if(!a.path.length){a.state=a.state==='seekFood'||a.kind==='duck'&&a.hunger>55?'eat':'rest';activities[a.state]++;a.until=time+4+random()*8;}}
 else if(time>=a.until){if(a.state==='eat')a.hunger=Math.max(0,a.hunger-70);choose(a,residents);}}
 }
 function snapshot(){return JSON.parse(JSON.stringify({seed,time,animals,activities}));}
 if(initialState&&Array.isArray(initialState.animals)&&initialState.animals.length===count&&Number.isFinite(initialState.time)&&Number.isFinite(initialState.seed)){
 let valid=true;for(const a of initialState.animals)if(!Number.isInteger(a.id)||a.id<0||a.id>=count||!species.includes(a.kind)||![a.x,a.y,a.until,a.speed,a.hunger].every(Number.isFinite)||a.x<0||a.y<0||a.x>=world.size*25||a.y>=world.size*25||!Array.isArray(a.path))valid=false;
 if(valid){time=initialState.time;seed=initialState.seed;for(let i=0;i<count;i++){Object.assign(animals[i],initialState.animals[i]);const a=animals[i];if(a.kind!=='duck'&&world.cells[Math.floor(a.y/25)*world.size+Math.floor(a.x/25)].place){const p=nearest(Math.floor(a.x/25),Math.floor(a.y/25));a.x=p[0]*25+12;a.y=p[1]*25+12;a.path=[];a.until=time;}else if(a.kind!=='duck'&&a.path.some(p=>world.cells[Math.floor(p.y/25)*world.size+Math.floor(p.x/25)]?.place)){a.path=[];a.until=time;}} 
 if(initialState.activities)Object.assign(activities,initialState.activities);}
 }
 return{animals,activities,tick,snapshot,water};
 }
 if(typeof module!=='undefined')module.exports={createAnimals};else root.createCityAnimals=createAnimals;
})(typeof globalThis!=='undefined'?globalThis:this);
