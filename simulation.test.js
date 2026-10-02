const {test}=require('node:test');const assert=require('node:assert/strict');const world=require('./public/world');const {createSimulation}=require('./public/simulation');
test('residents navigate clear paths, buy, work, talk and fight over time',()=>{
 const sim=createSimulation(world,{seed:71});
 const initial=sim.agents.map(a=>[a.x,a.y]);
 for(let i=0;i<6000;i++){sim.tick(.2);for(const a of sim.agents){assert.ok(a.x>=0&&a.y>=0&&a.x<sim.extent&&a.y<sim.extent);assert.ok(!world.cells[Math.floor(a.y/25)*world.size+Math.floor(a.x/25)].place,'Resident cannot walk through a building');}}
 assert.ok(sim.agents.some((a,i)=>a.x!==initial[i][0]||a.y!==initial[i][1]));
 for(const activity of ['walk','buy','talk','fight','work','rest','argue','reconcile','eat','sleep'])assert.ok(sim.events[activity]>0,activity+' occurred');
 assert.ok(sim.agents.some(a=>a.wages>0));assert.equal(sim.families.length,24);assert.ok(sim.stocks.size>5);assert.ok(sim.relationships.size>0);assert.ok(sim.log.some(e=>e.type==='speech'));assert.ok(sim.families.every(f=>f.money>=0&&f.pantry>=0));assert.ok(sim.log.length>0&&sim.log.length<=30);
});


test('saved city resumes the same families, relationships and future decisions',()=>{
 const city=createSimulation(world,{seed:99});for(let i=0;i<800;i++)city.tick(.2);
 const saved=city.snapshot(),restored=createSimulation(world,{initialState:saved});assert.deepEqual(restored.snapshot(),saved);
 for(let i=0;i<100;i++){city.tick(.2);restored.tick(.2);}assert.deepEqual(restored.snapshot(),city.snapshot());
 assert.throws(()=>createSimulation(world,{initialState:{version:2}}),/Invalid city save/);
});
