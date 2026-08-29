import { chromium } from 'playwright'; import fs from 'fs';
const OUT='/tmp/claude-0/-home-user-agrarkit/4f4195ea-1f0e-5f1a-9e5d-873c84546309/scratchpad';
const B='http://localhost:8099/agrarkit';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const errs=[];
const unsichtbar=()=>[...document.querySelectorAll('main *,footer *,header *')]
  .filter(e=>e.offsetParent&&parseFloat(getComputedStyle(e).opacity)<0.05&&e.getBoundingClientRect().height>0).map(e=>e.className+'');

// Bewegung EIN (dort lag der letzte Fehler)
{const p=await b.newPage({viewport:{width:1440,height:900}});
 p.on('pageerror',e=>errs.push('JS: '+e.message));
 await p.goto(B+'/',{waitUntil:'load'});
 await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=innerHeight/2){scrollTo(0,y);await new Promise(r=>setTimeout(r,110));}await new Promise(r=>setTimeout(r,800));});
 const r=await p.evaluate(unsichtbar);
 console.log('MIT JS + Bewegung ', r.length?[...new Set(r)].join(' | '):'nichts unsichtbar'); await p.close();}
{const c=await b.newContext({viewport:{width:1440,height:900},javaScriptEnabled:false});
 const p=await c.newPage(); await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(500);
 const r=await p.evaluate(unsichtbar).catch(()=>['?']);
 console.log('OHNE JS           ', r.length?[...new Set(r)].join(' | '):'nichts unsichtbar'); await c.close();}
{const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await p.goto(B+'/',{waitUntil:'load'}); await p.waitForTimeout(400);
 console.log('RUHIG             ', (await p.evaluate(unsichtbar)).length?'PROBLEM':'nichts unsichtbar'); await p.close();}

// Alle Seiten, zwei Breiten
for (const [pfad,name] of [['/','Start'],['/impressum.html','Impressum'],['/datenschutz.html','Datenschutz'],['/404.html','404']]) {
  for (const [w,h,art] of [[1440,900,'breit'],[390,844,'schmal']]) {
    const p=await b.newPage({viewport:{width:w,height:h},...(w<900?{isMobile:true,hasTouch:true}:{})});
    p.on('response',r=>r.status()>=400&&errs.push(`${name}/${art}: HTTP ${r.status()} ${r.url()}`));
    p.on('pageerror',e=>errs.push(`${name}/${art}: ${e.message}`));
    await p.goto(B+pfad,{waitUntil:'load'});
    await p.evaluate(()=>{for(const i of document.images) i.loading='eager';});
    await p.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,9000))]));
    await p.waitForTimeout(250);
    const m=await p.evaluate(()=>{
      const bal=document.querySelector('.beta-balken');
      const kopf=document.querySelector('.kopf').getBoundingClientRect();
      const rb=bal.getBoundingClientRect();
      return {breit:document.documentElement.scrollWidth, fenster:innerWidth,
              leer:[...document.images].filter(i=>i.naturalWidth===0).length,
              spalt: Math.round(rb.top-kopf.bottom)};});
    if(m.breit>m.fenster+1) errs.push(`${name}/${art}: Überlauf ${m.breit}>${m.fenster}`);
    if(m.leer) errs.push(`${name}/${art}: ${m.leer} leere Bilder`);
    if(Math.abs(m.spalt)>1) errs.push(`${name}/${art}: Spalt ${m.spalt} px zwischen Kopf und Balken`);
    await p.close();
  }
}
// Rechtsseite als Bild
{const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'reduce'});
 await p.goto(B+'/impressum.html',{waitUntil:'load'}); await p.waitForTimeout(500);
 fs.writeFileSync(`${OUT}/r-impressum.png`, await p.screenshot()); await p.close();}
await b.close();
console.log('\n'+(errs.length?errs.join('\n'):'keine Fehler, kein Überlauf, kein Spalt, keine leeren Bilder'));
