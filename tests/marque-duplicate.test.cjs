// Serve the app on port 4181. Requires Playwright and Chromium.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1400,height:1000},serviceWorkers:'block'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route(/https:\/\/.*/,r=>r.abort());await p.goto(process.env.EPP_TEST_URL||'http://127.0.0.1:4181');
 async function setup(staleSelection=false){await p.evaluate(async stale=>{
  doNewFile();const c=document.createElement('canvas');c.width=200;c.height=150;const cx=c.getContext('2d');cx.fillStyle='#ffffff';cx.fillRect(0,0,200,150);cx.fillStyle='#ff0000';cx.fillRect(20,20,20,20);cx.fillStyle='#0000ff';cx.fillRect(120,20,20,20);
  const img=new Image();img.src=c.toDataURL();await img.decode();setCS(200,150);objs=[{id:mkId(),type:'image',img,x:0,y:0,w:200,h:150,alpha:1,isBackground:true,layerId:activeLayerId}];saveH();if(stale)selObj(objs[0].id);setTool('marque');
 },staleSelection);await select();}
 async function xy(x,y){return p.evaluate(({x,y})=>{const r=HC.getBoundingClientRect();return{x:r.x+x*zoom,y:r.y+y*zoom};},{x,y});}
 async function select(){const a=await xy(20,20),z=await xy(40,40);await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(z.x,z.y,{steps:4});await p.mouse.up();}
 async function drag(){const a=await xy(30,30),z=await xy(90,30);await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(z.x,z.y,{steps:6});await p.mouse.up();}
 const pixel=(x,y)=>p.evaluate(({x,y})=>{const c=document.createElement('canvas');c.width=CW;c.height=CH;getRenderObjects().forEach(o=>drawO(c.getContext('2d'),o,false));return Array.from(c.getContext('2d').getImageData(x,y,1,1).data);},{x,y});
 for(const stale of [false,true]){
  await setup(stale);const history=await p.evaluate(()=>undoSt.length);
  await p.keyboard.press('Control+d');await p.waitForFunction(()=>!!marqueSnap);assert.deepEqual(await pixel(30,30),[255,0,0,255]);
  await drag();await p.keyboard.press('Enter');await p.waitForFunction(()=>!marqueSnap&&objs.length===2);
  assert.deepEqual(await pixel(30,30),[255,0,0,255]);assert.deepEqual(await pixel(90,30),[255,0,0,255]);assert.deepEqual(await pixel(130,30),[0,0,255,255]);
  assert.deepEqual(await p.evaluate(()=>[objs[1].x,objs[1].y,objs[1].w,objs[1].h]),[80,20,20,20]);assert.equal(await p.evaluate(()=>undoSt.length),history+1);
  await p.keyboard.press('Control+z');await p.waitForFunction(()=>objs.every(o=>o.type!=='image'||o.img.complete));assert.equal(await p.evaluate(()=>objs.length),1);assert.deepEqual(await pixel(30,30),[255,0,0,255]);
  await p.keyboard.press('Control+y');await p.waitForFunction(()=>objs.every(o=>o.type!=='image'||o.img.complete));assert.deepEqual(await pixel(90,30),[255,0,0,255]);
 }
 await setup();await p.keyboard.press('Meta+d');await p.waitForFunction(()=>!!marqueSnap);await p.keyboard.press('Shift+ArrowRight');await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>objs.length),1);assert.deepEqual(await pixel(30,30),[255,0,0,255]);
 await setup();await p.evaluate(()=>ctxAction('duplicate'));await p.waitForFunction(()=>!!marqueSnap);await p.keyboard.press('Enter');await p.waitForFunction(()=>objs.length===2);assert.deepEqual(await p.evaluate(()=>[objs[1].x,objs[1].y,objs[1].w,objs[1].h]),[20,20,20,20]);
 // Duplicating an already lifted selection first preserves it at its current position.
 await setup();await p.keyboard.press('ArrowRight');await p.keyboard.press('Control+d');await p.waitForFunction(()=>!!marqueSnap&&!marqueDuplicatePending);await p.keyboard.press('Shift+ArrowDown');await p.keyboard.press('Enter');await p.waitForFunction(()=>objs.length===3&&!marqueSnap);
 assert.deepEqual(await pixel(30,25),[255,0,0,255]);assert.deepEqual(await pixel(30,45),[255,0,0,255]);
 await setup();await p.evaluate(()=>objs[0].locked=true);await p.keyboard.press('Control+d');assert.equal(await p.evaluate(()=>!!marqueSnap),false);assert.equal(await p.evaluate(()=>objs.length),1);
 await setup();await p.evaluate(()=>getLayer(activeLayerId).locked=true);await p.keyboard.press('Control+d');assert.equal(await p.evaluate(()=>!!marqueSnap),false);assert.equal(await p.evaluate(()=>objs.length),1);
 assert.deepEqual(errors,[]);console.log('PASS: fresh/stale selection Ctrl+D, source and destination pixels, crop dimensions, single undo/redo, Cmd+D, context menu, Escape, floating source, locks');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
