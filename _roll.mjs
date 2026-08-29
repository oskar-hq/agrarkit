import { chromium } from 'playwright'; import fs from 'fs';
const OUT='/tmp/claude-0/-home-user-agrarkit/4f4195ea-1f0e-5f1a-9e5d-873c84546309/scratchpad';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [w,h,name,dpr] of [[1440,900,'desk',2],[390,844,'mob',3]]) {
  const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:dpr,...(w<900?{isMobile:true,hasTouch:true}:{})});
  await p.goto('http://localhost:8099/agrarkit/',{waitUntil:'load'});
  await p.evaluate(()=>{for(const i of document.images) i.loading='eager';});
  await p.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,12000))]));
  await p.waitForTimeout(700);
  fs.writeFileSync(`${OUT}/r-${name}-0.png`, await p.screenshot());
  // ein Stueck rollen: Balken muss weg sein, Kopfleiste bleiben
  await p.evaluate(()=>scrollTo(0,240)); await p.waitForTimeout(500);
  const m=await p.evaluate(()=>{
    const bal=document.querySelector('.beta-balken').getBoundingClientRect();
    const kopf=document.querySelector('.kopf').getBoundingClientRect();
    return {balkenSichtbar: bal.bottom>kopf.bottom, kopfOben: Math.round(kopf.top),
            gerollt: document.querySelector('.kopf').classList.contains('ist-gerollt')};});
  console.log(`${name}: nach 240 px — Balken noch sichtbar? ${m.balkenSichtbar} · Kopf klebt bei ${m.kopfOben} · Leiste gerollt: ${m.gerollt}`);
  fs.writeFileSync(`${OUT}/r-${name}-240.png`, await p.screenshot());
  await p.close();
}
await b.close();
