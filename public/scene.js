(function(){
 const canvas=document.getElementById('scenery'),ctx=canvas.getContext('2d');const extent=CityWorld.size*25;canvas.width=canvas.height=extent;canvas.style.width=canvas.style.height=CityWorld.size*100+'px';document.getElementById('life').style.width=document.getElementById('life').style.height=CityWorld.size*100+'px';ctx.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 let seed=19;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(const c of CityWorld.cells){const x=c.x*25,y=c.y*25;rect(x,y,25,25,c.road?'#514d45':c.place?'#756c51':'#72745a');for(let n=0;n<12;n++)rect(x+rnd()*24,y+rnd()*24,1+rnd()*2,1,c.road?'#403f3b':rnd()>.5?'#8b8462':'#5e634b');if(c.road){if([4,12,28,36,44,52].includes(c.y))rect(x+7,y+12,9,1,'#b5a77c');else rect(x+12,y+7,1,9,'#b5a77c');if(rnd()>.7){rect(x+3,y+6,7,3,'#373d3c');rect(x+4,y+6,4,1,'#637575');}}}
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

 for(const p of CityWorld.landmarks){const x=p.x*25,y=p.y*25;
 if(p.key==='market'){for(let i=0;i<4;i++){rect(x+5+i*29,y+18,24,24,'#68543e');for(let k=0;k<6;k++)rect(x+5+i*29+k*4,y+12,4,9,k%2?'#ad6147':'#d3ba83');for(let k=0;k<5;k++)rect(x+8+i*29+k*4,y+36,3,3,k%2?'#8c994e':'#c58445');}sign('РЫНОК',x+43,y+8);}
 if(p.key==='kiosk'){building(x+16,y+6,43,31,'#78877c');rect(x+20,y+12,35,15,'#333f39');rect(x+20,y+28,35,3,'#b5a479');sign('ПЕЧАТЬ',x+21,y+11);}
 if(p.key==='bus'){rect(x+10,y+14,84,28,'#b9a367');rect(x+13,y+17,75,10,'#405c59');for(let i=0;i<8;i++)rect(x+14+i*10,y+17,2,12,'#b9a367');rect(x+21,y+39,9,9,'#303a30');rect(x+75,y+39,9,9,'#303a30');rect(x+105,y+10,2,35,'#4e5848');rect(x+100,y+9,13,9,'#aab6a0');sign('7',x+104,y+16,'#3b4434');}
 if(p.key==='park'){for(let i=0;i<6;i++)tree(x+8+i*17,y+8);rect(x+37,y+36,35,26,'#9f9a7b');rect(x+43,y+41,23,15,'#6a7565');rect(x+18,y+70,40,4,'#a08459');rect(x+79,y+60,22,20,'#b5a680');for(let i=0;i<4;i++)for(let j=0;j<4;j++)rect(x+81+i*4,y+62+j*4,4,4,(i+j)%2?'#403e31':'#c7b995');}
 if(p.key==='cafe'){building(x+5,y+10,89,43,'#a68365');rect(x+9,y+14,79,10,'#983f31');sign('ПЕЛЬМЕНИ',x+25,y+21);windows(x+13,y+30,4,1);rect(x+71,y+30,12,23,'#4b5342');rect(x+15,y+61,16,7,'#988660');rect(x+58,y+61,16,7,'#988660');}
 if(p.key==='clinic'){building(x+5,y+5,112,56,'#b1b49e');windows(x+13,y+21,8,2);rect(x+50,y+10,15,4,'#a1503c');rect(x+56,y+5,4,15,'#a1503c');rect(x+52,y+45,14,16,'#4b5a4e');}
 if(p.key==='workshop'){building(x+7,y+10,111,45,'#8b8065');rect(x+14,y+25,45,28,'#3a4338');sign('ШИНОМОНТАЖ',x+15,y+21);for(let i=0;i<4;i++){rect(x+80,y+32+i*6,18,5,'#303a30');rect(x+84,y+33+i*6,10,2,'#687260');}}
 if(p.key==='boiler'){building(x+8,y+10,104,28,'#85664c');rect(x+20,y+1,6,10,'#655948');rect(x+10,y+40,107,5,'#766b57');rect(x+10,y+42,107,1,'#b9a583');sign('ТЕПЛО',x+44,y+25);}
 }

 for(const p of CityWorld.landmarks.filter(p=>p.kind)){const x=p.x*25,y=p.y*25,w=p.w*25,h=p.h*25;
 if(p.kind==='residence'){building(x+5,y+9,w-12,h-25,'#96947d');windows(x+13,y+20,Math.floor((w-22)/13),Math.max(1,Math.floor((h-45)/12)));rect(x+w/2,y+h-28,12,17,'#3c493a');for(let i=0;i<5;i++){rect(x+15+i*13,y+1,1,8,'#3c4437');rect(x+11+i*13,y+3,9,1,'#3c4437');}}
 else if(p.key==='stadium'){rect(x+9,y+10,w-18,h-25,'#586b45');rect(x+13,y+14,w-26,1,'#c9be8b');rect(x+13,y+h-20,w-26,1,'#c9be8b');rect(x+13,y+14,1,h-33,'#c9be8b');rect(x+w-14,y+14,1,h-33,'#c9be8b');rect(x+w/2,y+14,1,h-33,'#c9be8b');rect(x+7,y+h/2-12,9,25,'#c9be8b');rect(x+w-16,y+h/2-12,9,25,'#c9be8b');}
 else if(['park','sport'].includes(p.kind)){for(let i=0;i<8;i++)tree(x+9+(i%4)*(w-15)/4,y+5+Math.floor(i/4)*(h-30)/2);rect(x+18,y+h-24,w-36,5,'#a28b61');if(p.key==='pond'){rect(x+25,y+27,w-50,h-61,'#627e75');rect(x+31,y+31,w-62,2,'#9da996');}if(p.key==='allotment'){for(let i=0;i<9;i++){rect(x+8+i*25,y+37,17,h-75,'#655a3d');for(let j=0;j<6;j++)rect(x+11+i*25,y+40+j*10,11,3,'#799451');}}if(p.key==='memorial'){rect(x+w/2-16,y+37,32,30,'#939680');rect(x+w/2-5,y+7,10,31,'#424f41');rect(x+w/2-4,y+3,8,7,'#424f41');}}
 else if(p.kind==='trade'){building(x+6,y+12,w-12,h-32,'#a18763');rect(x+10,y+16,w-20,9,'#914d34');windows(x+14,y+32,Math.floor((w-22)/13),1);rect(x+w-26,y+32,12,h-52,'#3f4e3b');if(['fair','beer','bakery'].includes(p.key)){for(let i=0;i<Math.floor(w/8)-2;i++)rect(x+8+i*8,y+10,8,6,i%2?'#cbbb87':'#ac6746');}}
 else{building(x+7,y+15,w-14,h-34,p.kind==='work'?'#8a6c51':'#a09678');windows(x+15,y+31,Math.floor((w-26)/13),Math.max(1,Math.floor((h-66)/12)));rect(x+12,y+20,w-24,8,'#725d43');if(p.key==='fire'){rect(x+15,y+h-33,35,11,'#ac4e36');rect(x+40,y+h-31,8,6,'#58716c');}if(p.key==='depot'){for(let i=0;i<Math.max(1,Math.floor((w-20)/52));i++){rect(x+15+i*52,y+h-40,43,15,'#ac9860');rect(x+18+i*52,y+h-38,35,6,'#485e57');}}if(p.key==='scrap'){for(let i=0;i<12;i++)rect(x+10+rnd()*(w-25),y+h-30+rnd()*12,15,3,'#8d5a3b');}}
 if(!p.generated)sign(p.name.slice(0,24),x+12,y+11,'#d2be8a');
 else{rect(x+5,y+h-9,w-10,1,'#637157');rect(x+12,y+h-8,17,3,'#99815b');tree(x+w-16,y+h-20);if(p.key.endsWith('2')){rect(x+2,y+h-14,15,3,'#865d44');rect(x+2,y+h-11,1,10,'#534e3a');}}
 }
 for(const p of CityWorld.landmarks){if(p.key==='shop')sign('ГАСТРОНОМ',p.x*25+20,p.y*25+24);if(p.key==='factory')sign('КРАСНЫЙ ОКТЯБРЬ',p.x*25+12,p.y*25+68);}
 for(let i=0;i<100;i++){let x=Math.floor(rnd()*CityWorld.size),y=Math.floor(rnd()*CityWorld.size);const c=CityWorld.cells[y*CityWorld.size+x];if(!c.road&&!c.place)tree(x*25+15,y*25+4);}

})();
