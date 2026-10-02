const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
test('shared city: persistence, validation and conflicting claims',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'kvartal-test-'));process.env.DATA_DIR=dir;
 const {server}=require('./server');await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const post=body=>fetch(base+'/api/ads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try{
 assert.equal((await fetch(base+'/')).status,200);
 assert.deepEqual(await (await fetch(base+'/api/ads')).json(),[]);
 const ad={cell:0,name:'Труд',text:'Привет, город!',url:'https://example.com',color:'orange'};
 const results=await Promise.all([post(ad),post(ad)]);assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
 const saved=await (await fetch(base+'/api/ads')).json();assert.equal(saved.length,1);assert.equal(saved[0].name,'Труд');
 assert.equal(JSON.parse(await fs.readFile(path.join(dir,'ads.json'),'utf8')).length,1);
 assert.equal((await post({...ad,cell:1,url:'javascript:alert(1)'})).status,400);
 assert.equal((await post({...ad,cell:7})).status,400);
 assert.equal((await post({...ad,cell:1,name:' '})).status,400);
 assert.equal((await post(null)).status,400);
 const world=require('./public/world');
 assert.equal(new Set(world.cells.map(c=>c.id)).size,3600);
 const scenic=world.cells.find(c=>c.place);assert.equal((await post({...ad,cell:scenic.id})).status,400);
 const expansion=world.cells.find(c=>c.id>=400&&world.available.has(c.id));assert.equal((await post({...ad,cell:expansion.id})).status,201);
 assert.equal((await fetch(base+'/world.js')).status,200);
 assert.equal((await fetch(base+'/scene.js')).status,200);
 assert.equal((await fetch(base+'/missing')).status,404);
 }finally{await new Promise(r=>server.close(r));await fs.rm(dir,{recursive:true,force:true});}
});
