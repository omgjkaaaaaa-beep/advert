(function(root){
 const size=40;
 const landmarks=[
 {key:'garages',name:'Дедовы гаражи',x:20,y:20,w:5,h:3,story:'Кооператив «Рассвет». Ржавые ворота, сварка по субботам и дед, который знает, где достать любую запчасть.'},
 {key:'school',name:'Школа № 13',x:26,y:20,w:5,h:4,story:'Краска облезла ещё в девяностых. За школьным забором тусуется взрослая компания из соседнего двора. На стене — «Будущее за нами», под стеной — совсем другое настоящее.'},
 {key:'zil',name:'ЗИЛ, который не завёлся',x:21,y:24,w:4,h:3,story:'Синий ЗИЛ-130. Тридцать лет обещают починить. Кузов проржавел, колесо спущено, но место во дворе он держит уверенно.'},
 {key:'yard',name:'Двор последней пятилетки',x:26,y:25,w:5,h:3,story:'У теплотрассы греются двое бездомных. На ящике бутылка водки, рядом дворняга. Старый фонарь моргает, голуби спорят за корку хлеба.'},
 {key:'block',name:'Панелька «Светлый путь»',x:20,y:29,w:6,h:5,story:'Пять этажей, сорок антенн и один вечный ремонт. У подъезда сушится бельё, на фасаде ржавые потёки и выцветший серп с молотом.'},
 {key:'shop',name:'Гастроном «У Светы»',x:27,y:29,w:4,h:3,story:'Хлеб, консервы и разговоры до закрытия. Неоновая вывеска пережила три денежные реформы. На углу опять кто-то оставил пустую тару.'},
 {key:'factory',name:'Завод «Красный октябрь»',x:33,y:20,w:5,h:7,story:'Труба ещё дымит. На проходной часы остановились в 1987-м. Забор в ржавчине, плакат требует трудовых подвигов.'}
 ];
 function id(x,y){return x<20&&y<20?y*20+x:y<20?400+y*20+x-20:800+(y-20)*40+x;}
 function road(x,y){return [7,8,18,32].includes(x)||[4,12,28,36].includes(y);}
 function place(x,y){return landmarks.find(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h);}
 const cells=[];for(let y=0;y<size;y++)for(let x=0;x<size;x++)cells.push({x,y,id:id(x,y),road:road(x,y),place:place(x,y)});
 const available=new Set(cells.filter(c=>!c.road&&!c.place).map(c=>c.id));
 const world={size,landmarks,cells,available};if(typeof module!=='undefined')module.exports=world;else root.CityWorld=world;
})(typeof globalThis!=='undefined'?globalThis:this);
