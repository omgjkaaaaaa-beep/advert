const {test}=require('node:test');const assert=require('node:assert/strict');const world=require('./public/world');const {createSimulation}=require('./public/simulation');
test('residents navigate clear paths, buy, work, talk and fight over time',()=>{
 const sim=createSimulation(world,{seed:71});
 const initial=sim.agents.map(a=>[a.x,a.y]);
 for(let i=0;i<6000;i++){sim.tick(.2);for(const a of sim.agents){assert.ok(a.x>=0&&a.y>=0&&a.x<1000&&a.y<1000);assert.ok(!world.cells[Math.floor(a.y/25)*40+Math.floor(a.x/25)].place,'Resident cannot walk through a building');}}
 assert.ok(sim.agents.some((a,i)=>a.x!==initial[i][0]||a.y!==initial[i][1]));
 for(const activity of ['walk','buy','talk','fight','work','rest'])assert.ok(sim.events[activity]>0,activity+' occurred');
 assert.ok(sim.agents.some(a=>a.money<30));assert.ok(sim.log.length>0&&sim.log.length<=8);
});
