// Start a static server on port 4181, then run: node tests/selection-drag.test.cjs
// Requires Playwright and Chromium; EPP_TEST_URL and CHROMIUM_PATH can override defaults.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1400,height:1000},serviceWorkers:'block'});await p.route(/https:\/\/.*/,r=>r.abort());await p.goto(process.env.EPP_TEST_URL||'http://127.0.0.1:4181');
await p.evaluate(()=>{doNewFile();openTed(50,50);actTed.textContent='First';commitT();selObj(objs[0].id);openTed(150,50);actTed.textContent='Second';commitT();objs.push({id:mkId(),type:'shape',shape:'rect',x1:250,y1:50,x2:290,y2:90,strokeColor:'#ff0000',fillColor:'#ff0000',strokeWidth:2,alpha:1,layerId:activeLayerId});saveH();renderAll();});
assert.deepEqual(await p.evaluate(()=>({selId,selIds})),{selId:2,selIds:[2]});
const r=await p.evaluate(()=>{const r=HC.getBoundingClientRect();return{x:r.x,y:r.y,z:zoom};});const xy=(x,y)=>[r.x+x*r.z,r.y+y*r.z];
await p.keyboard.down('Shift');await p.mouse.click(...xy(270,70));await p.keyboard.up('Shift');
const selected=await p.evaluate(()=>[...selIds]);
await p.mouse.move(...xy(270,70));await p.mouse.down();await p.mouse.move(...xy(270,170),{steps:5});await p.mouse.up();
const positions=await p.evaluate(()=>objs.map(o=>({id:o.id,y:o.y??o.y1})));
assert.deepEqual(selected,[2,3]);assert.deepEqual(positions.map(o=>o.y),[50,150,150]);
await p.keyboard.press('Control+z');assert.deepEqual(await p.evaluate(()=>objs.map(o=>o.y??o.y1)),[50,50,50]);await p.keyboard.press('Control+y');assert.deepEqual(await p.evaluate(()=>objs.map(o=>o.y??o.y1)),[50,150,150]);
// Intentional Ctrl-drag selects the copy, so a later Shift-click must not reselect its original.
await p.evaluate(()=>selObj(objs[1].id));
const history=await p.evaluate(()=>undoSt.length);
await p.keyboard.down('Control');await p.mouse.click(...xy(170,160));await p.keyboard.up('Control');
assert.equal(await p.evaluate(()=>objs.length),3);assert.equal(await p.evaluate(()=>undoSt.length),history);
await p.keyboard.down('Control');await p.mouse.move(...xy(170,160));await p.mouse.down();await p.mouse.move(...xy(172,161));await p.mouse.up();await p.keyboard.up('Control');
assert.equal(await p.evaluate(()=>objs.length),3);assert.equal(await p.evaluate(()=>undoSt.length),history);
await p.keyboard.down('Control');await p.mouse.move(...xy(170,160));await p.mouse.down();await p.mouse.move(...xy(170,260),{steps:5});await p.mouse.up();await p.keyboard.up('Control');
assert.deepEqual(await p.evaluate(()=>({selId,selIds,count:objs.length})),{selId:4,selIds:[4],count:4});
await p.keyboard.down('Shift');await p.mouse.click(...xy(270,170));await p.keyboard.up('Shift');assert.deepEqual(await p.evaluate(()=>selIds),[4,3]);
await p.mouse.move(...xy(270,170));await p.mouse.down();await p.mouse.move(...xy(370,170),{steps:5});await p.mouse.up();
assert.deepEqual(await p.evaluate(()=>objs.map(o=>[o.x??o.x1,o.y??o.y1])),[[50,50],[150,150],[350,150],[250,250]]);
assert.equal(await p.evaluate(()=>objs.length),4);
// Ctrl+click preserves a group; Ctrl+drag copies the entire group exactly once.
await p.keyboard.down('Control');await p.mouse.click(...xy(370,170));await p.keyboard.up('Control');assert.equal(await p.evaluate(()=>objs.length),4);assert.deepEqual(await p.evaluate(()=>selIds),[4,3]);
await p.keyboard.down('Control');await p.mouse.move(...xy(370,170));await p.mouse.down();await p.mouse.move(...xy(370,270),{steps:10});await p.mouse.up();await p.keyboard.up('Control');
assert.equal(await p.evaluate(()=>objs.length),6);assert.deepEqual(await p.evaluate(()=>selIds),[5,6]);
assert.deepEqual(await p.evaluate(()=>objs.map(o=>[o.x??o.x1,o.y??o.y1])),[[50,50],[150,150],[350,150],[250,250],[350,250],[250,350]]);
await p.keyboard.press('Control+z');assert.equal(await p.evaluate(()=>objs.length),4);await p.keyboard.press('Control+y');assert.equal(await p.evaluate(()=>objs.length),6);
// First text in a fresh document also becomes the Shift-selection base.
await p.evaluate(()=>{doNewFile();openTed(50,50);actTed.textContent='New';commitT();});
assert.deepEqual(await p.evaluate(()=>({selId,selIds})),{selId:1,selIds:[1]});
// Editing a different existing text replaces the previous selection coherently.
await p.evaluate(()=>{openTed(150,50);actTed.textContent='Other';commitT();selObj(objs[0].id);openTed(objs[1].x,objs[1].y,objs[1]);actTed.textContent='Edited';commitT();});
assert.deepEqual(await p.evaluate(()=>({selId,selIds,count:objs.length})),{selId:2,selIds:[2],count:2});
console.log('PASS: new/edited text + Shift selection + group drag + undo/redo + Ctrl-drag selection');await b.close();})();
