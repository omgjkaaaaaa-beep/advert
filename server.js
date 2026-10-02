const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const world = require('./public/world');
const root = path.join(__dirname, 'public');
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
let queue = Promise.resolve();
async function readAds() { try { return JSON.parse(await fs.readFile(path.join(dataDir, 'ads.json'), 'utf8')); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } }
function valid(body) {
 if (!Number.isInteger(body.cell) || !world.available.has(body.cell)) return 'Выберите свободный участок города';
 if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 60) return 'Название должно содержать от 1 до 60 символов';
 if (typeof body.text !== 'string' || body.text.length > 500) return 'Текст — до 500 символов';
 if (body.url) { try { if (!['http:', 'https:'].includes(new URL(body.url).protocol)) throw Error(); } catch { return 'Укажите ссылку с https:// или http://'; } }
 if (!['mint','violet','orange','blue','pink'].includes(body.color)) return 'Выберите цвет участка';
 return null;
}
const server = http.createServer(async (req, res) => {
 const send = (code, value) => { res.writeHead(code, {'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(value)); };
 try {
 const pathname = new URL(req.url, 'http://localhost').pathname;
 if (pathname === '/api/ads' && req.method === 'GET') return send(200, await readAds());
 if (pathname === '/api/ads' && req.method === 'POST') {
 let raw = ''; for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw)>8192) return send(413,{error:'Объявление слишком большое'}); }
 let body; try { body=JSON.parse(raw); } catch { return send(400,{error:'Некорректные данные'}); }
 if (!body || typeof body !== 'object') return send(400,{error:'Некорректные данные'});
 const error=valid(body); if(error) return send(400,{error});
 const task = queue.then(async () => {
 const ads=await readAds(); if(ads.some(a=>a.cell===body.cell)) return send(409,{error:'Этот участок уже занят. Выберите другой.'});
 const ad={id:randomUUID(),cell:body.cell,name:body.name.trim(),text:body.text.trim(),url:body.url || '',color:body.color,createdAt:new Date().toISOString()};
 ads.push(ad); await fs.mkdir(dataDir,{recursive:true}); await fs.writeFile(path.join(dataDir,'ads.json.tmp'),JSON.stringify(ads)); await fs.rename(path.join(dataDir,'ads.json.tmp'),path.join(dataDir,'ads.json')); send(201,ad);
 }); queue=task.catch(()=>{}); return await task;
 }
 if (!['GET','HEAD'].includes(req.method)) return send(405,{error:'Метод не поддерживается'});
 const file = {'/':'index.html','/app.js':'app.js','/style.css':'style.css','/world.js':'world.js','/scene.js':'scene.js','/simulation.js':'simulation.js','/life.js':'life.js'}[pathname];
 if(!file) return send(404,{error:'Не найдено'});
 const content=await fs.readFile(path.join(root,file)); res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8'}); res.end(req.method==='HEAD'?undefined:content);
 } catch(e) { console.error(e); if(!res.headersSent) send(500,{error:'Не удалось сохранить данные. Попробуйте позже.'}); }
});
if(require.main===module) server.listen(process.env.PORT || 3000,'0.0.0.0',()=>console.log('Advert City listening on port '+(process.env.PORT || 3000)));
module.exports={server};
