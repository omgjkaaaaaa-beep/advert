(function(){
 const canvas=document.getElementById('scenery'),ctx=canvas.getContext('2d');canvas.width=canvas.height=1000;ctx.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 let seed=19;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(const c of CityWorld.cells){const x=c.x*25,y=c.y*25;rect(x,y,25,25,c.road?'#514d45':c.place?'#756c51':'#72745a');for(let n=0;n<12;n++)rect(x+rnd()*24,y+rnd()*24,1+rnd()*2,1,c.road?'#403f3b':rnd()>.5?'#8b8462':'#5e634b');if(c.road){if([4,12,28,36].includes(c.y))rect(x+7,y+12,9,1,'#b5a77c');else rect(x+12,y+7,1,9,'#b5a77c');if(rnd()>.7){rect(x+3,y+6,7,3,'#373d3c');rect(x+4,y+6,4,1,'#637575');}}}
 function rust(x,y,w,h){for(let i=0;i<35;i++){const px=x+rnd()*w,py=y+rnd()*h;rect(px,py,2,1+rnd()*5,'#83543b');}}
 function building(x,y,w,h,color){rect(x+4,y+5,w,h,'#37382e');rect(x,y,w,h,color);rect(x,y,w,4,'#9b977b');rect(x,y+h-5,w,5,'#514e41');rust(x,y,w,h);}
 function windows(x,y,cols,rows){for(let a=0;a<cols;a++)for(let b=0;b<rows;b++){rect(x+a*13,y+b*12,6,7,'#343f3b');rect(x+a*13,y+b*12,6,1,'#9b9e82');if(rnd()>.65)rect(x+a*13+1,y+b*12+1,3,4,'#c6ac66');}}
 function person(x,y,coat,bottle=false){rect(x+2,y,3,3,'#b49a75');rect(x+1,y+3,5,7,coat);rect(x+1,y+10,2,4,'#2b3030');rect(x+4,y+10,2,4,'#2b3030');rect(x,y+4,1,5,coat);if(bottle){rect(x+7,y+6,2,5,'#668166');rect(x+7,y+5,1,2,'#d3c5a1');}}
 function tree(x,y){rect(x+4,y+9,3,8,'#62543d');rect(x,y+3,12,8,'#444f3c');rect(x+3,y,7,13,'#536046');}
 function sign(text,x,y,color='#d6c599'){ctx.fillStyle=color;ctx.font='bold 5px monospace';ctx.fillText(text,x,y);}
 for(const p of CityWorld.landmarks){const x=p.x*25,y=p.y*25;
 if(p.key==='garages'){for(let i=0;i<5;i++){building(x+2+i*24,y+9,21,34,i%2?'#7a7b69':'#9a8062');rect(x+4+i*24,y+18,17,24,'#655f4d');rect(x+12+i*24,y+18,1,24,'#343a32');rust(x+4+i*24,y+18,17,24);}person(x+15,y+53,'#65707a',true);rect(x+55,y+55,25,3,'#544d3d');rect(x+76,y+43,6,9,'#915d3d');}
 if(p.key==='school'){building(x+6,y+10,111,62,'#a59977');windows(x+13,y+22,8,3);rect(x+44,y+64,25,9,'#504b40');rect(x+48,y+64,7,9,'#302f2b');rect(x+1,y+88,120,2,'#343c35');for(let i=0;i<24;i++)rect(x+i*5,y+79,1,12,'#343c35');person(x+82,y+71,'#524959');person(x+95,y+73,'#786449',true);person(x+104,y+72,'#4d5b4d');rect(x+90,y+69,4,1,'#b7b0a0');}
 if(p.key==='zil'){rect(x+5,y+52,85,7,'#535343');rect(x+10,y+17,49,27,'#827158');for(let i=0;i<5;i++)rect(x+13+i*9,y+20,2,19,'#574f3e');rust(x+10,y+17,49,27);rect(x+59,y+23,26,25,'#537777');rect(x+62,y+26,16,10,'#2a444a');rect(x+79,y+36,11,12,'#477070');rect(x+87,y+39,3,5,'#d0bc76');rect(x+60,y+39,20,3,'#91543b');rect(x+13,y+44,12,12,'#292f2b');rect(x+16,y+47,5,5,'#73796a');rect(x+66,y+44,12,12,'#292f2b');rect(x+69,y+47,5,5,'#73796a');rect(x+35,y+60,20,3,'#425252');person(x+92,y+39,'#615844');}
 if(p.key==='yard'){rect(x+4,y+8,113,6,'#7c6550');rust(x+4,y+8,113,6);rect(x+9,y+14,5,28,'#5b5548');rect(x+90,y+14,5,30,'#5b5548');rect(x+20,y+45,50,4,'#745f46');rect(x+24,y+49,3,8,'#454439');rect(x+63,y+49,3,8,'#454439');person(x+28,y+32,'#82715c',true);person(x+48,y+33,'#5f6670',true);rect(x+79,y+46,13,5,'#9a8260');rect(x+89,y+42,5,7,'#9a8260');rect(x+80,y+50,2,4,'#62543c');rect(x+89,y+50,2,4,'#62543c');rect(x+13,y+50,8,6,'#7d694c');rect(x+16,y+46,2,5,'#829274');}
 if(p.key==='block'){building(x+8,y+10,130,82,'#9d967f');windows(x+16,y+23,9,5);rect(x+13,y+91,15,15,'#383f36');rect(x+112,y+91,15,15,'#383f36');for(let i=0;i<8;i++){rect(x+12+i*16,y+1,1,10,'#343a32');rect(x+8+i*16,y+3,10,1,'#343a32');}rect(x+39,y+108,65,1,'#302e29');for(let i=0;i<5;i++)rect(x+44+i*12,y+109,7,9,i%2?'#c2b697':'#775c54');tree(x+2,y+103);}
 if(p.key==='school'){sign('ШКОЛА 13',x+42,y+19,'#583d2d');sign('НЕТ БУДУЩЕГО',x+53,y+61,'#615944');}
 if(p.key==='block'){sign('☭',x+119,y+23,'#8d4230');sign('МИР ТРУД',x+52,y+86,'#574f3c');}
 if(p.key==='shop'){building(x+4,y+12,88,41,'#a68b6b');rect(x+9,y+17,77,9,'#8d3b2d');windows(x+12,y+31,4,1);rect(x+73,y+29,12,22,'#343d34');person(x+61,y+52,'#807859',true);rect(x+16,y+58,2,5,'#7f946a');rect(x+23,y+60,2,4,'#7f946a');}
 if(p.key==='factory'){building(x+4,y+56,110,79,'#94664e');windows(x+13,y+74,7,4);rect(x+10,y+22,95,32,'#715545');for(let i=0;i<12;i++)rect(x+12+i*8,y+27,5,15,'#3a4240');rect(x+78,y+4,13,62,'#795b48');rect(x+78,y+4,13,3,'#3c3f36');rust(x+78,y+4,13,62);rect(x+10,y+146,100,2,'#45463b');for(let i=0;i<20;i++)rect(x+10+i*5,y+140,1,16,'#45463b');}
 }
 for(const p of CityWorld.landmarks){if(p.key==='shop')sign('ГАСТРОНОМ',p.x*25+20,p.y*25+24);if(p.key==='factory')sign('КРАСНЫЙ ОКТЯБРЬ',p.x*25+12,p.y*25+68);}
 for(let i=0;i<100;i++){let x=Math.floor(rnd()*40),y=Math.floor(rnd()*40);const c=CityWorld.cells[y*40+x];if(!c.road&&!c.place)tree(x*25+15,y*25+4);}
 const live=document.getElementById('life'),a=live.getContext('2d');live.width=live.height=1000;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let last=0;function animate(t){if(t-last>150){last=t;a.clearRect(0,0,1000,1000);const phase=reduced?0:t/1000;
 for(let i=0;i<9;i++){const x=470+i*33+Math.sin(phase*.3+i)*10,y=700+(i%3)*18;a.fillStyle='#343b33';a.fillRect(Math.round(x),Math.round(y),3,5);a.fillStyle='#b29673';a.fillRect(Math.round(x),Math.round(y)-2,2,2);a.fillStyle='#4e6748';a.fillRect(Math.round(x)+4,Math.round(y)+1,1,3);}
 for(let i=0;i<5;i++){a.fillStyle='#9c998480';a.fillRect(908-Math.round(phase*4+i*13)%40,496-i*5,10+i*2,4);}
 const light=Math.sin(phase*3)>-.4;a.fillStyle=light?'#d1b269':'#756547';a.fillRect(745,684,3,3);
 }if(!reduced)requestAnimationFrame(animate);}requestAnimationFrame(animate);
})();
