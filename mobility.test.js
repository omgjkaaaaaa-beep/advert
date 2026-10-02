const{test}=require('node:test');const assert=require('node:assert/strict');const world=require('./public/world');const{createMobility}=require('./public/mobility');const{createSimulation}=require('./public/simulation');
test('lawful pedestrians use sidewalks and zebras; reckless shortcuts can enter lanes',()=>{
 const mobility=createMobility(world),destination={door:[21,27]},start={x:21*25+12,y:29*25+12};
 const path=mobility.route(start,destination);assert.ok(path.length>0);assert.ok(path.every(p=>mobility.legal(Math.floor(p.x/5),Math.floor(p.y/5))));assert.ok(path.some(p=>mobility.onRoad(p)&&mobility.isCrosswalk(p)));
 const shortcut=mobility.route(start,destination,true);assert.ok(shortcut.some(p=>mobility.onRoad(p)&&!mobility.legal(Math.floor(p.x/5),Math.floor(p.y/5))));
});
test('right-hand lanes are separated for all four headings',()=>{
 const sim=createSimulation(world),services=sim.services;for(const heading of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){const v={x:462,y:712,heading},p=services.position(v);assert.equal(p.x,462-heading.y*5);assert.equal(p.y,712+heading.x*5);}assert.notDeepEqual(services.position({x:462,y:712,heading:{x:1,y:0}}),services.position({x:462,y:712,heading:{x:-1,y:0}}));
});
test('a driver yields at a zebra; a jaywalker hit requires medical assistance',()=>{
 const sim=createSimulation(world),traffic=sim.services;
 for(const c of traffic.cars){c.state='stopped';c.path=[];}
 const car=traffic.cars[0];Object.assign(car,{x:512,y:711,state:'drive',heading:{x:1,y:0},speed:20,path:[{x:537,y:711}]});
 const lawful={id:0,x:518,y:717,state:'walk',reckless:false,path:[],dialogue:[]};const before=car.x;traffic.tick(.1,[lawful]);assert.equal(car.x,before);assert.equal(car.waitReason,'переход');assert.equal(lawful.state,'walk');
 Object.assign(car,{x:537,y:712,state:'drive',heading:{x:1,y:0},speed:20,path:[{x:562,y:712}]});
 const jaywalker={id:0,x:540,y:717,state:'walk',reckless:true,path:[],dialogue:[],health:100};traffic.tick(.2,[jaywalker]);assert.equal(jaywalker.state,'injured');assert.equal(car.state,'stopped');assert.equal(traffic.statistics.pedestrianHits,1);
 for(let i=0;i<3000&&jaywalker.state==='injured';i++)traffic.tick(.2,[jaywalker]);assert.equal(jaywalker.health,100);assert.equal(jaywalker.state,'rest');assert.ok(traffic.statistics.medicalCalls>0);
});
