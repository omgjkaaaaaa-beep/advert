const{test}=require('node:test');const assert=require('node:assert/strict');const world=require('./public/world');const{createSimulation}=require('./public/simulation');
test('every block has buildings and animals stay on accessible ground or pond water',()=>{
 for(const b of world.blocks)assert.ok(world.landmarks.some(p=>p.x>=b.left&&p.x<=b.right&&p.y>=b.top&&p.y<=b.bottom),'Populated block '+JSON.stringify(b));
 assert.ok(world.available.size>100);
 const sim=createSimulation(world),before=sim.wildlife.animals.map(a=>[a.x,a.y]);
 for(let i=0;i<2000;i++){sim.tick(.2);for(const a of sim.wildlife.animals){assert.ok(a.x>=0&&a.y>=0&&a.x<sim.extent&&a.y<sim.extent);if(a.kind==='duck'){const w=sim.wildlife.water;assert.ok(a.x>=w.left&&a.x<=w.right&&a.y>=w.top&&a.y<=w.bottom);}else assert.ok(!world.cells[Math.floor(a.y/25)*world.size+Math.floor(a.x/25)].place);}}
 assert.equal(new Set(sim.wildlife.animals.map(a=>a.kind)).size,4);assert.ok(sim.wildlife.animals.some((a,i)=>a.x!==before[i][0]||a.y!==before[i][1]));for(const state of ['wander','eat','swim','follow'])assert.ok(sim.wildlife.activities[state]>0,state);
});
test('traffic stays on roads and emergency units respond to and resolve accidents and fights',()=>{
 const sim=createSimulation(world);sim.services.report('fight',sim.agents[0],[0,1]);
 let seenHelp=false;
 for(let i=0;i<5000;i++){sim.tick(.2);for(const vehicle of [...sim.services.cars,...sim.services.units]){assert.ok(world.cells[Math.floor(vehicle.y/25)*world.size+Math.floor(vehicle.x/25)].road,'Vehicle on road');if(vehicle.state==='help')seenHelp=true;}}
 assert.ok(sim.services.statistics.accidents>0);assert.ok(sim.services.statistics.medicalCalls>0);assert.ok(sim.services.statistics.policeCalls>0);assert.ok(sim.services.statistics.resolved>0);assert.ok(seenHelp);
});
test('new buildings relocate saved residents without losing the household budget',()=>{
 const sim=createSimulation(world),saved=sim.snapshot(),house=world.landmarks.find(p=>p.generated);
 saved.agents[0].x=house.x*25+12;saved.agents[0].y=house.y*25+12;saved.agents[0].state='walk';saved.agents[0].path=[{x:saved.agents[0].x,y:saved.agents[0].y}];delete saved.wildlife;delete saved.services;
 const restored=createSimulation(world,{initialState:saved}),a=restored.agents[0];assert.equal(restored.families[0].money,saved.families[0].money);assert.ok(!world.cells[Math.floor(a.y/25)*world.size+Math.floor(a.x/25)].place);assert.equal(restored.wildlife.animals.length,72);
});
