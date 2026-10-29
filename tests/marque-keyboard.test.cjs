// Serve the app on port 4181. Requires Playwright and Chromium.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1400,height:1000},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(/https:\/\/.*/,r=>r.abort());await page.goto(process.env.EPP_TEST_URL||'http://127.0.0.1:4181');
 async function setup(){await page.evaluate(async()=>{
  doNewFile();const c=document.createElement('canvas');c.width=200;c.height=150;const cx=c.getContext('2d');cx.fillStyle='#ffffff';cx.fillRect(0,0,200,150);cx.fillStyle='#ff0000';cx.fillRect(20,20,20,20);
  const img=new Image();img.src=c.toDataURL();await img.decode();setCS(200,150);objs=[{id:mkId(),type:'image',img,x:0,y:0,w:200,h:150,alpha:1,isBackground:true,layerId:activeLayerId}];saveH();setTool('marque');
 });const r=await page.evaluate(()=>{const r=HC.getBoundingClientRect();return{x:r.x,y:r.y,z:zoom};});await page.mouse.move(r.x+10*r.z,r.y+10*r.z);await page.mouse.down();await page.mouse.move(r.x+50*r.z,r.y+50*r.z,{steps:4});await page.mouse.up();}
 const state=()=>page.evaluate(()=>({snap:!!marqueSnap,x:marqueSnapX,y:marqueSnapY,history:undoSt.length,objects:objs.length,active:!!marqueKeyboardMove,rect:marqueRect}));
 const pixel=(x,y)=>page.evaluate(({x,y})=>{const c=document.createElement('canvas');c.width=CW;c.height=CH;getRenderObjects().forEach(o=>drawO(c.getContext('2d'),o,false));return Array.from(c.getContext('2d').getImageData(x,y,1,1).data);},{x,y});
 await setup();const before=await state();await page.keyboard.press('ArrowRight');await page.keyboard.press('Shift+ArrowDown');await page.waitForFunction(()=>marqueKeyboardMove?.ready);
 assert.equal((await state()).x,11);assert.equal((await state()).y,20);assert.equal((await state()).history,before.history);
 assert.deepEqual(await page.evaluate(()=>Array.from(flatten().getContext('2d').getImageData(25,35,1,1).data)),[255,0,0,255]);
 await page.keyboard.press('Enter');await page.waitForFunction(()=>!marqueSnap&&objs.length===2);assert.equal((await state()).history,before.history+1);
 assert.deepEqual(await pixel(10,10),[0,0,0,0]);assert.deepEqual(await pixel(25,35),[255,0,0,255]);
 await page.keyboard.press('Control+z');await page.waitForFunction(()=>objs.every(o=>o.type!=='image'||o.img.complete));await page.evaluate(()=>renderAll());assert.deepEqual(await pixel(20,20),[255,0,0,255]);assert.equal((await state()).objects,1);
 await page.keyboard.press('Control+y');await page.waitForFunction(()=>objs.every(o=>o.type!=='image'||o.img.complete));assert.deepEqual(await pixel(10,10),[0,0,0,0]);
 await setup();await page.evaluate(()=>markSaved());await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>isDirty),true);await page.keyboard.press('Shift+ArrowDown');await page.keyboard.press('Escape');await page.waitForTimeout(50);assert.equal((await state()).objects,1);assert.equal((await state()).snap,false);assert.equal((await state()).history,2);assert.deepEqual(await pixel(20,20),[255,0,0,255]);assert.equal(await page.evaluate(()=>isDirty),false);
 // Dispatch before Image.onload: cancellation/confirmation must not resurrect a stale selection.
 await setup();await page.evaluate(()=>{for(const key of ['ArrowRight','Escape'])document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));});await page.waitForTimeout(50);assert.equal((await state()).snap,false);assert.equal((await state()).objects,1);assert.deepEqual(await pixel(20,20),[255,0,0,255]);
 await setup();assert.deepEqual(await page.evaluate(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));const data=Array.from(flatten().getContext('2d').getImageData(40,25,1,1).data);document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return data;}),[255,0,0,255]);await page.waitForFunction(()=>!marqueSnap&&objs.length===2);assert.equal((await state()).history,3);
 // Clamp a held key to the document, then cancel without adding history.
 await setup();await page.evaluate(()=>{for(let i=0;i<100;i++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',shiftKey:true,repeat:true,bubbles:true,cancelable:true}));});assert.equal((await state()).x,160);await page.keyboard.press('Escape');
 // Input fields and locked pixels must not initiate a cut.
 await setup();await page.evaluate(()=>{const input=document.createElement('input');input.type='number';document.body.appendChild(input);input.focus();});await page.keyboard.press('ArrowRight');assert.equal((await state()).snap,false);await page.evaluate(()=>document.activeElement.blur());await page.evaluate(()=>getLayer(activeLayerId).locked=true);await page.keyboard.press('ArrowRight');assert.equal((await state()).snap,false);assert.equal((await state()).objects,1);
 await setup();await page.evaluate(()=>objs[0].locked=true);await page.keyboard.press('ArrowRight');assert.equal((await state()).snap,false);assert.equal((await state()).objects,1);
 // Undo while floating cancels the move; it must not undo the previous drawing.
 await setup();await page.keyboard.press('ArrowRight');await page.keyboard.press('Control+z');await page.waitForTimeout(50);assert.equal((await state()).objects,1);assert.deepEqual(await pixel(20,20),[255,0,0,255]);
 // Saving a keyboard preview must include the moved pixels, even before Enter.
 await setup();await page.keyboard.press('ArrowRight');const downloadPromise=page.waitForEvent('download');await page.evaluate(()=>saveEPP());const download=await downloadPromise;const project=JSON.parse(require('node:fs').readFileSync(await download.path(),'utf8'));assert.equal(project.objs.length,2);assert.equal(project.objs[1].x,11);assert.equal((await state()).snap,false);
 // A document replacement cancels pending image callbacks rather than resurrecting old pixels.
 await setup();await page.evaluate(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));doNewFile();});await page.waitForTimeout(50);assert.equal((await state()).objects,0);
 assert.deepEqual(errors,[]);console.log('PASS: immediate arrow move, Shift step, commit, cancel, single undo/redo, early key races, bounds, inputs, locks, saving, document replacement');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
