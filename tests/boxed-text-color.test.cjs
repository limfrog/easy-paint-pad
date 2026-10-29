// Serve the app on port 4181; requires Playwright and Chromium.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1400,height:1000},serviceWorkers:'block'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route(/https:\/\/.*/,r=>r.abort());await p.goto(process.env.EPP_TEST_URL||'http://127.0.0.1:4181');
 async function setup(existing){await p.evaluate(existing=>{
  doNewFile();switchTab('draw',document.querySelectorAll('.tab-btn')[1]);fgH='#000000';bgH='#ffffff';bgA=1;fBox=true;fBoxFill=true;fBoxBorder=2;fBoxPad=8;
  document.getElementById('boxFill').checked=true;
  if(existing){const o={id:mkId(),type:'text',x:80,y:80,text:'ABCDEF',fontFamily:'Arial',fontSize:24,color:'#0078d4',alpha:1,box:true,boxFill:true,boxBorder:2,boxPad:8,boxBgColor:'#00cc44',boxBgAlpha:.4,layerId:activeLayerId};objs.push(o);saveH();selObj(o.id);openTed(o.x,o.y,o);}
  else{openTed(80,80);actTed.textContent='ABCDEF';}
 },existing);await p.waitForFunction(()=>document.activeElement===actTed);
 await p.evaluate(()=>{const node=document.createTreeWalker(actTed,NodeFilter.SHOW_TEXT).nextNode();const range=document.createRange();range.setStart(node,2);range.setEnd(node,4);restoreEditorRange(actTed,range);});
 await p.locator('#pal1 .swatch').nth(4).click();}
 function attrs(){return p.evaluate(()=>{const o=objs.find(o=>o.type==='text');return{color:o.color,bg:o.boxBgColor,bgAlpha:o.boxBgAlpha,colors:o.richLines.flatMap(line=>line.flatMap(run=>[...run.text].map(()=>run.color))),box:o.box};});}
 for(const existing of [false,true])for(const ending of ['escape','outside']){
  await setup(existing);
  if(ending==='escape')await p.keyboard.press('Escape');else{const r=await p.evaluate(()=>{const r=HC.getBoundingClientRect();return{x:r.x+400*zoom,y:r.y+300*zoom};});await p.mouse.click(r.x,r.y);}
  const expected=existing?'#0078d4':'#000000';const result=await attrs();
  assert.equal(result.color,expected,`${ending}: partial color must not recolor the border`);assert.equal(result.bg,existing?'#00cc44':'#ffffff');assert.equal(result.bgAlpha,existing?.4:1);assert.equal(result.box,true);
  assert.deepEqual(result.colors,[expected,expected,'#ff0000','#ff0000',expected,expected]);
  // Both the stored color and the rendered border must retain the original color.
  const border=await p.evaluate(()=>{const o=objs.find(o=>o.type==='text');return Array.from(ctx.getImageData(o.x+20,o.y-o.boxPad,1,1).data);});
  if(!existing)assert.deepEqual(border,[0,0,0,255]);else assert.deepEqual(border,[0,120,212,255]);
  await p.keyboard.press('Control+z');await p.keyboard.press('Control+y');assert.deepEqual(await attrs(),result);
  const saved=await p.evaluate(()=>JSON.parse(buildEPPJson()));assert.equal(saved.objs.find(o=>o.type==='text').color,expected);
  await p.evaluate(saved=>loadEPP(new File([JSON.stringify(saved)],'boxed.epp')),saved);await p.waitForFunction(()=>projectFileName==='boxed.epp');assert.deepEqual(await attrs(),result);
 }
 // Explicit background edits still apply while a rich-text selection is active.
 await setup(true);await p.evaluate(()=>{bgH='#ffcc00';applyBackgroundColorToSel();onOpacityChange('bg','65');});await p.keyboard.press('Escape');
 const changed=await attrs();assert.equal(changed.color,'#0078d4');assert.equal(changed.bg,'#ffcc00');assert.equal(changed.bgAlpha,.65);
 assert.deepEqual(errors,[]);console.log('PASS: boxed partial text color, new/existing text, Esc/outside commit, border pixels, fill preservation, undo/redo, serialization');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
