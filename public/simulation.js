(function(root){
 function createSimulation(world,{seed=71,count=44}={}){
 let time=0;const log=[],events={walk:0,talk:0,fight:0,buy:0,work:0,rest:0};
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const free=(x,y)=>x>=0&&y>=0&&x<40&&y<40&&!world.cells[y*40+x].place;
 function nearest(x,y){x=Math.max(0,Math.min(39,x));y=Math.max(0,Math.min(39,y));const q=[[x,y]],seen=new Set();for(let i=0;i<q.length;i++){const [a,b]=q[i],k=b*40+a;if(seen.has(k))continue;seen.add(k);if(free(a,b))return[a,b];for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(a+dx>=0&&a+dx<40&&b+dy>=0&&b+dy<40)q.push([a+dx,b+dy]);}throw Error('No pedestrian space');}
 const places=world.landmarks.map(p=>({...p,door:nearest(p.x+Math.floor(p.w/2),p.y+p.h)}));
 function route(from,to){const start=nearest(Math.floor(from.x/25),Math.floor(from.y/25)),goal=to.door;const key=(x,y)=>y*40+x;const q=[start],parents=new Map([[key(...start),null]]);for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x===goal[0]&&y===goal[1])break;for(const [dx,dy]of[[1,0],[0,1],[-1,0],[0,-1]]){const a=x+dx,b=y+dy,k=key(a,b);if(free(a,b)&&!parents.has(k)){parents.set(k,key(x,y));q.push([a,b]);}}}let k=key(...goal);if(!parents.has(k))return[];const result=[];while(k!==null){result.push({x:(k%40)*25+12,y:Math.floor(k/40)*25+12});k=parents.get(k);}return result.reverse();}
 const names=['Вася','Нина','Петрович','Света','Гена','Тамара','Борис','Зина','Семён','Люба','Коля','Галина','Аркадий','Вера','Миша','Лида','Степан','Рая','Игорь','Антонина','Виктор','Ольга'];
 const roles=['слесарь','соседка','механик','продавщица','дворник','пенсионерка','рабочий','библиотекарь'];
 const colors=['#778c81','#a2775d','#83718a','#a39266','#596f81','#9f6e69'];
 const agents=Array.from({length:count},(_,i)=>{const home=places.find(p=>p.key==='block'),p=places[i%places.length];return{id:i,name:names[i%names.length]+(i>=names.length?' '+(i+1):''),role:roles[i%roles.length],color:colors[i%colors.length],x:p.door[0]*25+10+random()*4,y:p.door[1]*25+10+random()*4,state:'rest',until:1+random()*8,cooldown:0,path:[],home,goal:p,bag:false,money:30+Math.floor(random()*100),mood:random(),speed:9+random()*8,bubble:'',bubbleUntil:0};});
 function note(text){log.unshift({time,text});if(log.length>8)log.pop();}
 function setState(a,state,duration,bubble){a.state=state;a.until=time+duration;a.bubble=bubble||'';a.bubbleUntil=a.until;events[state]++;}
 function choose(a){let goal;if(a.money<5&&!a.bag)goal=places.find(p=>p.key==='factory');else if(a.bag)goal=a.home;else if(random()<.4){const key=random()<.5?'market':'shop';goal=places.find(p=>p.key===key);}else goal=places[Math.floor(random()*places.length)];a.goal=goal;a.path=route(a,goal);setState(a,'walk',0,'');}
 function arrive(a){if(['market','shop','kiosk','cafe'].includes(a.goal.key)){setState(a,'buy',4+random()*4,'Почём?');note(a.name+' покупает в «'+a.goal.name+'».');}else if(['factory','garages','workshop','boiler'].includes(a.goal.key)){setState(a,'work',6+random()*8,'За работу!');note(a.name+' занят делом: '+a.goal.name+'.');}else{if(a.goal.key==='block')a.bag=false;setState(a,'rest',4+random()*9,'Отдохну.');}}
 function tick(dt){if(!Number.isFinite(dt)||dt<=0)return;time+=Math.min(dt,.5);
 for(const a of agents){if(a.state==='walk'){
 let remaining=a.speed*Math.min(dt,.5);while(a.path.length&&remaining>0){const p=a.path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy);if(d<=remaining){a.x=p.x;a.y=p.y;remaining-=d;a.path.shift();}else{a.x+=dx/d*remaining;a.y+=dy/d*remaining;remaining=0;}}if(!a.path.length)arrive(a);
 }else if(time>=a.until){if(a.state==='buy'){a.bag=true;a.money=Math.max(0,a.money-5);a.bubble='С пакетом домой';a.bubbleUntil=time+3;}if(a.state==='work'){a.money+=20;}if(a.state==='fight'){a.mood=Math.max(0,a.mood-.4);a.cooldown=time+45;}choose(a);}}
 for(let i=0;i<agents.length;i++){const a=agents[i];if(a.state!=='walk'||time<a.cooldown)continue;for(let j=i+1;j<agents.length;j++){const b=agents[j];if(b.state!=='walk'||time<b.cooldown||Math.hypot(a.x-b.x,a.y-b.y)>9)continue;const fight=random()<.12;const duration=fight?3:5;setState(a,fight?'fight':'talk',duration,fight?'Эй!':'Как дела?');setState(b,fight?'fight':'talk',duration,fight?'Сам такой!':'Живём!');a.cooldown=b.cooldown=time+25;note(a.name+' и '+b.name+(fight?' устроили потасовку.':' болтают во дворе.'));break;}}
 }
 return{agents,places,events,log,tick,get time(){return time;},route};
 }
 if(typeof module!=='undefined')module.exports={createSimulation};else root.createCitySimulation=createSimulation;
})(typeof globalThis!=='undefined'?globalThis:this);
