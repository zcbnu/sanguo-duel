// AI vs AI 平衡模拟：node tools/sim.js [每对局数]
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const el=()=>new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='classList'?{add(){},remove(){},toggle(){}}:typeof k==='string'&&/^(appendChild|prepend|remove|setProperty|addEventListener)$/.test(k)?()=>{}:k==='style'?{setProperty(){}}:''),set:(t,k,v)=>(t[k]=v,true)});
const ctx={URLSearchParams,console,Math,JSON,Promise,setTimeout,Array,Object,Set,String,Number,
 document:{querySelector:()=>el(),createElement:()=>el()},localStorage:{},location:{search:'?auto',origin:'',pathname:'/'},navigator:{}};
ctx.window=ctx;ctx.HARNESS=true;vm.createContext(ctx);
for(const f of ['data/generals.js','data/cards.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
vm.runInContext('window.__start=start;window.__G=G;',ctx);
const GS0=ctx.GENERALS,N=+process.argv[2]||6;const ONLY=process.argv[3];const GS=GS0;
async function game(a,b){return new Promise((res,rej)=>{let done=false;ctx.onGameOver=w=>{if(!done){done=true;if(ctx.__oppFull&&w===ctx.__G.cur){ctx.ONESHOT=(ctx.ONESHOT||0)+1;(ctx.OS=ctx.OS||{})[w.g.id]=(ctx.OS[w.g.id]||0)+1;if(!ctx.OSLOG)ctx.OSLOG=[...ctx.LOGS];}res({w:w.g.id,turns:ctx.__G.turnNo});}};
 const t=setTimeout(()=>{if(!done){done=true;res({w:null,turns:ctx.__G.turnNo,stuck:true});}},3000);
 ctx.__start(a,b,false).catch(e=>{done=true;rej(e);});}).then(async r=>{ctx.__G.over=true;await new Promise(z=>setTimeout(z,5));return r;});}
(async()=>{const S={};GS.forEach(g=>S[g.id]={w:0,n:0});let turns=[],stuck=0,errs=0,burst=0;
 for(const a of GS)for(const b of GS){if(a===b)continue;if(ONLY&&a.id!==ONLY&&b.id!==ONLY)continue;for(let i=0;i<N;i++){
  try{const r=await game(a,b);if(r.stuck){stuck++;continue;}S[a.id].n++;S[b.id].n++;S[r.w].w++;turns.push(r.turns);S[a.id].t=(S[a.id].t||0)+r.turns;S[b.id].t=(S[b.id].t||0)+r.turns;if(r.turns>60)S[a.id].L=(S[a.id].L||0)+1,S[b.id].L=(S[b.id].L||0)+1;}catch(e){errs++;if(errs<3)console.error(a.id,b.id,e.stack,'\n'+(ctx.LOGS||[]).join('\n'));}}}
 turns.sort((x,y)=>x-y);const med=turns[turns.length>>1],avg=(turns.reduce((s,x)=>s+x,0)/turns.length).toFixed(1);
 const rows=GS.map(g=>({id:g.id,name:g.name,hp:g.hp,tier:g.tier,wr:S[g.id].w/S[g.id].n,at:(S[g.id].t/S[g.id].n).toFixed(1),L:S[g.id].L||0})).sort((x,y)=>y.wr-x.wr);
 console.log(JSON.stringify(ctx.OS));console.log((ctx.OSLOG||[]).join("\n"));console.log(`oneshot=${ctx.ONESHOT||0} games=${turns.length} stuck=${stuck} errors=${errs} turns(avg/med)=${avg}/${med} p10=${turns[turns.length/10|0]} p90=${turns[turns.length*.9|0]}`);
 if(process.env.SHOWLOG)console.log((ctx.LOGS||[]).join('\n'));rows.forEach(r=>console.log(`${(r.wr*100).toFixed(1).padStart(5)}%  T${r.tier} ${r.name}(${r.id}) hp${r.hp} avgT=${r.at} long=${r.L}`));
 fs.writeFileSync(path.join(root,'tools/sim-result.json'),JSON.stringify({turns:{avg,med},rows},null,1));process.exit(0);})();
