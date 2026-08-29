import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const fehler=[];
for (const [name, inset] of [['ohne safe-area','0px'],['mit safe-area 47px','47px']]) {
  for (const [w,h,geraet] of [[390,844,'Handy'],[1440,900,'Desktop']]) {
    const p=await b.newPage({viewport:{width:w,height:h},...(w<900?{isMobile:true,hasTouch:true}:{})});
    await p.goto('http://localhost:8099/agrarkit/',{waitUntil:'load'});
    if (inset!=='0px') await p.addStyleTag({content:`:root{--kopf:calc(var(--kopf-basis) + ${inset})} .kopf{padding-top:${inset} !important}`});
    await p.evaluate(()=>{for(const i of document.images) i.loading='eager';});
    await p.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,10000))]));
    await p.waitForTimeout(400);
    const m=await p.evaluate(()=>{
      const r=(s)=>{const e=document.querySelector(s); const x=e.getBoundingClientRect();
        return {oben:Math.round(x.top),unten:Math.round(x.bottom),hoehe:Math.round(x.height)};};
      const kopf=r('.kopf'), bal=r('.beta-balken'), held=r('.held-bild');
      // Liegt zwischen Kopfunterkante und Balkenoberkante etwas Fremdes?
      const proben=new Set();
      for (let y=Math.max(0,kopf.unten); y<=bal.oben+1; y++) {
        const e=document.elementFromPoint(Math.round(innerWidth/2),y);
        proben.add(e?(e.className||e.tagName)+'':'—');
      }
      return {kopf,bal,held,spalt:bal.oben-kopf.unten, proben:[...proben],
              heldFuellt: Math.abs(held.hoehe-innerHeight)<=2, fenster:innerHeight};
    });
    const ok = Math.abs(m.spalt)<=1 && m.heldFuellt;
    console.log(`${geraet.padEnd(7)} ${name.padEnd(19)} Kopf ${m.kopf.hoehe} · Balken ab ${m.bal.oben} · Spalt ${m.spalt} px · Held ${m.held.hoehe}/${m.fenster} ${m.heldFuellt?'füllt':'FÜLLT NICHT'}  ${ok?'ok':'>>> FEHLER'}`);
    if (!ok) fehler.push(`${geraet} ${name}: Spalt ${m.spalt}, darin ${m.proben.join('|')}`);
    await p.close();
  }
}
await b.close();
console.log('\n'+(fehler.length?fehler.join('\n'):'kein Spalt, Held füllt überall das Fenster'));
