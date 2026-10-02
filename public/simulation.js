(function(root){
 function createSimulation(world,{seed=71,count=96,initialState=null}={}){
 const size=world.size,extent=size*25;
 let time=0,nextDelivery=80,nextRent=720,nextPressure=30;const log=[],events={walk:0,talk:0,fight:0,buy:0,work:0,rest:0,argue:0,reconcile:0,eat:0,sleep:0,service:0};
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const pick=list=>list[Math.floor(random()*list.length)];
 const weather=()=>['пасмурно','дождь','ясно','ветер'][Math.floor(time/180)%4];
 const free=(x,y)=>x>=0&&y>=0&&x<size&&y<size&&!world.cells[y*size+x].place;
 function nearest(x,y){x=Math.max(0,Math.min(size-1,x));y=Math.max(0,Math.min(size-1,y));const q=[[x,y]],seen=new Set();for(let i=0;i<q.length;i++){const [a,b]=q[i],k=b*size+a;if(seen.has(k))continue;seen.add(k);if(free(a,b))return[a,b];for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(a+dx>=0&&a+dx<size&&b+dy>=0&&b+dy<size)q.push([a+dx,b+dy]);}throw Error('No pedestrian space');}
 const places=world.landmarks.map(p=>({...p,door:nearest(p.x+Math.floor(p.w/2),p.y+p.h)}));
 const homes=places.filter(p=>p.kind==='residence'||p.key==='block');
 const shops=places.filter(p=>p.kind==='trade'||['market','shop','kiosk','cafe'].includes(p.key));
 const workplaces=places.filter(p=>p.kind==='work'||['factory','garages','workshop','boiler'].includes(p.key));
 const services=places.filter(p=>p.kind==='service'||['clinic','school','park'].includes(p.key));
 const stocks=new Map(shops.map(p=>[p.key,{stock:24,revenue:0}]));
 const families=Array.from({length:Math.ceil(count/4)},(_,i)=>({id:i,name:['Ивановы','Петровы','Сидоровы','Кузнецовы','Смирновы','Волковы','Поповы','Соколовы','Морозовы','Орловы','Фёдоровы','Беловы','Новиковы','Зайцевы','Павловы','Козловы','Егоровы','Андреевы','Макаровы','Никитины','Тихоновы','Фроловы','Соловьёвы','Васильевы'][i%24],home:homes[i%homes.length],money:120+Math.floor(random()*100),pantry:4,tension:i%4===0?65:15,members:[],nextMeeting:i<3?1.5+random():8+random()*40}));
 const relationships=new Map(),cache=new Map();
 function route(from,to){const start=nearest(Math.floor(from.x/25),Math.floor(from.y/25)),goal=to.door,key=(x,y)=>y*size+x,cacheKey=key(...start)+':'+key(...goal);if(cache.has(cacheKey))return cache.get(cacheKey).map(p=>({...p}));const q=[start],parents=new Map([[key(...start),null]]);for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x===goal[0]&&y===goal[1])break;for(const [dx,dy]of[[1,0],[0,1],[-1,0],[0,-1]]){const a=x+dx,b=y+dy,k=key(a,b);if(free(a,b)&&!parents.has(k)){parents.set(k,key(x,y));q.push([a,b]);}}}let k=key(...goal);if(!parents.has(k))return[];const result=[];while(k!==null){result.push({x:(k%size)*25+12,y:Math.floor(k/size)*25+12});k=parents.get(k);}result.reverse();if(cache.size>500)cache.clear();cache.set(cacheKey,result);return result.map(p=>({...p}));}
 const names=['Вася','Нина','Петрович','Света','Гена','Тамара','Борис','Зина','Семён','Люба','Коля','Галина','Аркадий','Вера','Миша','Лида','Степан','Рая','Игорь','Антонина','Виктор','Ольга'];
 const roles=['слесарь','библиотекарь','механик','продавец','дворник','пенсионер','рабочий','почтальон'];
 const colors=['#778c81','#a2775d','#83718a','#a39266','#596f81','#9f6e69'];
 const agents=Array.from({length:count},(_,i)=>{const family=families[Math.floor(i/4)],p=i<12?family.home:places[i%places.length];const a={id:i,name:names[i%names.length]+' '+family.name.replace(/ы$/,'')+(i%2?'а':''),role:roles[i%roles.length],color:colors[i%colors.length],x:p.door[0]*25+10+random()*4,y:p.door[1]*25+10+random()*4,state:'rest',until:2+random()*8,cooldown:0,path:[],home:family.home,workplace:workplaces[i%workplaces.length],familyId:family.id,goal:p,bag:false,money:20,hunger:15+random()*35,energy:65+random()*30,social:35+random()*40,mood:random(),speed:12+random()*9,bubble:'',bubbleUntil:0,dialogue:[],wages:0};family.members.push(i);return a;});
 function note(text,a,type='life'){log.unshift({time,text,x:a?.x,y:a?.y,type});if(log.length>30)log.pop();}
 function speak(a,text){a.bubble=text;a.bubbleUntil=time+7;note(a.name+': «'+text+'»',a,'speech');}
 function setState(a,state,duration){a.state=state;a.until=time+duration;a.dialogue=[];events[state]++;}
 function go(a,goal){a.goal=goal;a.path=route(a,goal);setState(a,'walk',0);}
 function choose(a){const f=families[a.familyId],hour=(8+time/30)%24;let goal;
 if(a.bag||a.energy<24||hour>=22||hour<6)goal=a.home;
 else if(a.hunger>68&&f.pantry>0)goal=a.home;
 else if(a.hunger>68&&f.pantry===0)goal=f.money>=5?(pick(shops.filter(p=>stocks.get(p.key).stock>0))||a.home):a.workplace;
 else if(weather()==='дождь'&&a.energy<60)goal=a.home;
 else if(a.social<25)goal=random()<.5?a.home:places.find(p=>p.key==='park');
 else if(f.pantry<3&&f.money>=5)goal=pick(shops.filter(p=>stocks.get(p.key).stock>0))||a.home;
 else if(f.money<30||hour>=9&&hour<17&&random()<.48)goal=a.workplace;
 else if(time>f.nextMeeting&&random()<.45)goal=a.home;
 else goal=pick(random()<.35?services:places);
 go(a,goal);
 }
 function arrive(a){const f=families[a.familyId];
 if(a.goal.key===a.home.key){if(a.bag){f.pantry+=5;a.bag=false;speak(a,'Продукты принёс. На всех хватит!');}if(a.hunger>35&&f.pantry>0){setState(a,'eat',7);speak(a,'Сначала поедим, потом разберёмся.');}else if(a.energy<45||(8+time/30)%24>=22){setState(a,'sleep',18);}else{setState(a,'rest',8+random()*9);if(f.pantry===0){f.tension=Math.min(100,f.tension+8);speak(a,'В холодильнике пусто. Кто идёт в магазин?');}}}
 else if(stocks.has(a.goal.key)){setState(a,'buy',6+random()*4);speak(a,pick(['Мне хлеб и молоко, пожалуйста.','Почём сегодня картошка?','А свежее что-нибудь осталось?','Дайте пакет, домой нести далеко.']));}
 else if(workplaces.some(p=>p.key===a.goal.key)){setState(a,'work',14+random()*10);speak(a,pick(['Опять смена. Ладно, за дело.','Кто взял мой ключ на семнадцать?','До обеда успеем починить.']));}
 else{setState(a,'service',8+random()*12);speak(a,pick(['Кто последний? Я за вами.','Здесь всегда встречаю знакомых.','После зайду к соседям.','Хоть немного отдохну от дома.']));}
 }
 function conversation(a,b,type){const same=a.familyId===b.familyId,fa=families[a.familyId],fb=families[b.familyId];const duration=type==='fight'?8:20;setState(a,type,duration);setState(b,type,duration);a.cooldown=b.cooldown=time+45;
 const scripts={
 argue:same?[['Ты опять потратил деньги?','Я продукты для всех покупал!'],['А кто посуду будет мыть?','Давай без крика, я после смены.'],['Поговорим дома. Только спокойно.','Ладно. Но сегодня без телевизора!']]:[['Ваш телевизор всю ночь гремел!','А у вас дрель с самого утра!'],['Поговорим без крика?','Сначала прекратите шуметь.'],['Давайте договоримся о времени.','После десяти будет тихо.']],
 fight:[['Ты зачем толкаешься?!','Сам дорогу перекрыл!'],['Ну всё, хватит махать руками!','Разошлись. Не лезь больше.']],
 reconcile:[['Вчера я погорячился. Извини.','Ладно, и я был неправ.'],['Может, вместе чаю попьём?','Давай. Я принесу печенье.'],['Так лучше, чем ругаться.','Согласен. Мир? Мир.']],
 talk:same?[['Что приготовить на ужин?','Давай картошку. Я хлеб куплю.'],['Как прошла смена?','Устал. Но всё починили.'],['Вечером соберёмся дома.','Хорошо, я загляну в магазин.']]:pick([
 [['Слышал, ЗИЛ опять пытались завести?','Третий раз за неделю. Никак!'],['Петрович говорит, нужна новая свеча.','Ему бы новый ЗИЛ.']],
 [['На рынке картошка подешевела.','Надо зайти после работы.'],['Только очередь уже до угла.','Тогда сначала за хлебом.']],
 [['Как там ваши?','Живём. Вчера опять спорили из-за гаража.'],['Заходите вечером на чай.','Спасибо, зайдём всей семьёй.']],
 [['В «Космосе» новый фильм.','Пойдём вечером, если успеем?'],['Я за билетами, ты за семечками.','Договорились.']]])};
 const lines=scripts[type];for(let i=0;i<lines.length;i++){a.dialogue.push({at:time+i*6,text:lines[i][0]});b.dialogue.push({at:time+i*6+.8,text:lines[i][1]});}
 const pair=[a.id,b.id].sort((x,y)=>x-y).join(':');relationships.set(pair,type==='argue'||type==='fight'?'strained':'friendly');
 if(type==='argue'){fa.tension=Math.max(0,fa.tension-10);fb.tension=Math.max(0,fb.tension-5);}if(type==='reconcile'){fa.tension=Math.max(0,fa.tension-25);fb.tension=Math.max(0,fb.tension-25);}
 note(a.name+' и '+b.name+(type==='argue'?' ссорятся.':type==='fight'?' устроили потасовку.':type==='reconcile'?' помирились.':' разговаривают.'),a,type);
 }
 function finish(a){const f=families[a.familyId];if(a.state==='buy'){const shop=stocks.get(a.goal.key);if(shop.stock>0&&f.money>=5){shop.stock--;shop.revenue+=5;f.money-=5;a.bag=true;speak(a,'Спасибо! Понесу покупки домой.');}else{speak(a,shop.stock===0?'Всё раскупили. Пойду в другой магазин.':'Денег не хватает. Надо подработать.');}}
 if(a.state==='work'){f.money+=18;a.wages+=18;a.money+=3;a.energy=Math.max(0,a.energy-8);speak(a,'Смена закончена. Зарплату домой!');}
 if(a.state==='eat'){if(f.pantry>0){f.pantry--;a.hunger=Math.max(0,a.hunger-65);}else{f.tension=Math.min(100,f.tension+10);}}
 if(a.state==='sleep')a.energy=Math.min(100,a.energy+65);if(['rest','service'].includes(a.state))a.energy=Math.min(100,a.energy+12);if(['talk','reconcile'].includes(a.state))a.social=Math.min(100,a.social+35);if(['fight','argue'].includes(a.state))a.energy=Math.max(0,a.energy-8);
 choose(a);
 }
 function tick(dt){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.5);time+=dt;
 if(time>=nextDelivery){for(const stock of stocks.values())stock.stock=Math.min(40,stock.stock+18);nextDelivery+=80;note('Грузовик привёз продукты. Прилавки снова полны.',agents[0],'economy');}
 if(time>=nextRent){for(const f of families){const paid=Math.min(f.money,25);f.money-=paid;if(paid<25)f.tension=Math.min(100,f.tension+20);}nextRent+=720;note('Новый день: семьи оплатили жильё и коммунальные услуги.',agents[0],'economy');}
 if(time>=nextPressure){for(const f of families)f.tension=Math.max(0,Math.min(100,f.tension+(f.pantry===0?5:-1)+(f.money<20?5:0)));nextPressure+=30;}
 for(const a of agents){a.hunger=Math.min(100,a.hunger+dt*.14);a.energy=Math.max(0,a.energy-dt*.055);a.social=Math.max(0,a.social-dt*.07);
 while(a.dialogue.length&&a.dialogue[0].at<=time)speak(a,a.dialogue.shift().text);
 if(a.state==='walk'){let remaining=a.speed*dt*(weather()==='дождь'?.8:1);while(a.path.length&&remaining>0){const p=a.path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy);if(d<=remaining){a.x=p.x;a.y=p.y;remaining-=d;a.path.shift();}else{a.x+=dx/d*remaining;a.y+=dy/d*remaining;remaining=0;}}if(!a.path.length)arrive(a);}else if(time>=a.until)finish(a);
 }
 for(const f of families){if(time<f.nextMeeting)continue;const eligible=f.members.map(id=>agents[id]).filter(a=>time>=a.cooldown&&!['fight','argue','talk','reconcile','buy','work'].includes(a.state));let found=false;for(let i=0;i<eligible.length&&!found;i++)for(let j=i+1;j<eligible.length;j++)if(Math.hypot(eligible[i].x-eligible[j].x,eligible[i].y-eligible[j].y)<20){const a=eligible[i],b=eligible[j],pair=[a.id,b.id].sort((x,y)=>x-y).join(':');conversation(a,b,relationships.get(pair)==='strained'?'reconcile':f.tension>40?'argue':'talk');f.nextMeeting=time+75;found=true;break;}}
 for(let i=0;i<agents.length;i++){const a=agents[i];if(a.state!=='walk'||time<a.cooldown)continue;for(let j=i+1;j<agents.length;j++){const b=agents[j];if(b.state!=='walk'||time<b.cooldown||Math.hypot(a.x-b.x,a.y-b.y)>10)continue;const pair=[a.id,b.id].sort((x,y)=>x-y).join(':'),f=families[a.familyId];const chance=random();conversation(a,b,relationships.get(pair)==='strained'?'reconcile':chance<.10?'fight':chance<.26||a.familyId===b.familyId&&f.tension>40?'argue':'talk');break;}}
 }

 function snapshot(){return JSON.parse(JSON.stringify({version:2,size,seed,time,nextDelivery,nextRent,nextPressure,events,log,families:families.map(f=>({id:f.id,money:f.money,pantry:f.pantry,tension:f.tension,nextMeeting:f.nextMeeting})),stocks:[...stocks],relationships:[...relationships],agents:agents.map(a=>({...a,home:a.home.key,workplace:a.workplace.key,goal:a.goal.key}))}));}
 if(initialState){
 const saved=initialState;const states=new Set(Object.keys(events));const byKey=new Map(places.map(p=>[p.key,p]));
 if(saved.version!==2||saved.size!==size||!Array.isArray(saved.agents)||saved.agents.length!==agents.length||!Array.isArray(saved.families)||saved.families.length!==families.length||![saved.time,saved.seed,saved.nextDelivery,saved.nextRent,saved.nextPressure].every(Number.isFinite)||saved.time<0||!Array.isArray(saved.stocks)||!Array.isArray(saved.relationships)||!Array.isArray(saved.log))throw Error('Invalid city save');
 for(let i=0;i<saved.agents.length;i++){const a=saved.agents[i];if(a.id!==i||!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.x<0||a.y<0||a.x>=extent||a.y>=extent||!free(Math.floor(a.x/25),Math.floor(a.y/25))||!states.has(a.state)||!byKey.has(a.goal)||!byKey.has(a.home)||!byKey.has(a.workplace)||!Array.isArray(a.path)||!Array.isArray(a.dialogue)||![a.until,a.cooldown,a.hunger,a.energy,a.social,a.money,a.wages,a.speed,a.bubbleUntil].every(Number.isFinite)||a.familyId!==agents[i].familyId)throw Error('Invalid resident save');
 for(const p of a.path)if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!free(Math.floor(p.x/25),Math.floor(p.y/25)))throw Error('Invalid saved route');
 }
 for(let i=0;i<saved.families.length;i++){const f=saved.families[i];if(f.id!==i||![f.money,f.pantry,f.tension,f.nextMeeting].every(Number.isFinite)||f.money<0||f.pantry<0)throw Error('Invalid family save');}
 for(const[key,stock]of saved.stocks){if(!stocks.has(key)||!Number.isFinite(stock.stock)||stock.stock<0||!Number.isFinite(stock.revenue))throw Error('Invalid stock save');}
 time=saved.time;seed=saved.seed;nextDelivery=saved.nextDelivery;nextRent=saved.nextRent;nextPressure=saved.nextPressure;
 for(const key of Object.keys(events))events[key]=Number.isFinite(saved.events?.[key])?saved.events[key]:0;
 for(let i=0;i<agents.length;i++)Object.assign(agents[i],saved.agents[i],{home:byKey.get(saved.agents[i].home),workplace:byKey.get(saved.agents[i].workplace),goal:byKey.get(saved.agents[i].goal)});
 for(let i=0;i<families.length;i++)Object.assign(families[i],saved.families[i]);for(const[key,stock]of saved.stocks)stocks.set(key,stock);for(const[key,value]of saved.relationships)relationships.set(key,value);log.push(...saved.log.slice(0,30));
 }
 return{agents,families,stocks,relationships,places,events,log,tick,get time(){return time;},route,extent,snapshot,get weather(){return weather();}};
 }
 if(typeof module!=='undefined')module.exports={createSimulation};else root.createCitySimulation=createSimulation;
})(typeof globalThis!=='undefined'?globalThis:this);
