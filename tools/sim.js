// AI vs AI 平衡模拟：node tools/sim.js [每对局数]
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const el=()=>new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='classList'?{add(){},remove(){},toggle(){}}:typeof k==='string'&&/^(appendChild|prepend|remove|setProperty|addEventListener)$/.test(k)?()=>{}:k==='style'?{setProperty(){}}:''),set:(t,k,v)=>(t[k]=v,true)});
function freshCtx(){
 const ctx={URLSearchParams,console,Math,JSON,Promise,setTimeout,clearTimeout,Array,Object,Set,String,Number,
  document:{querySelector:()=>el(),createElement:()=>el()},localStorage:{},location:{search:'?auto',origin:'',pathname:'/'},navigator:{}};
 ctx.window=ctx;ctx.HARNESS=true;vm.createContext(ctx);
 for(const f of ['data/generals.js','data/cards.js','data/lines.js','data/modes.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
 vm.runInContext('window.__start=start;window.__G=G;',ctx);
 return ctx;
}
let ctx=freshCtx();
const N=+process.argv[2]||6;const ONLY=process.argv[3];
function prog(msg){fs.writeSync(1,msg+'\n');}
function cancelPrev(){try{ctx.__G.over=true;ctx.__G.gen=(ctx.__G.gen||0)+1000;}catch(e){}}
async function game(a,b){
 cancelPrev();
 await new Promise(z=>setTimeout(z,0));
 return new Promise((res,rej)=>{let done=false;
  const finish=r=>{if(done)return;done=true;clearTimeout(t);cancelPrev();res(r);};
  ctx.onGameOver=w=>{if(ctx.__oppFull&&w===ctx.__G.cur&&(ctx.__G.turnNo||0)<=2){ctx.ONESHOT=(ctx.ONESHOT||0)+1;(ctx.OS=ctx.OS||{})[w.g.id]=(ctx.OS[w.g.id]||0)+1;if(!ctx.OSLOG)ctx.OSLOG=[...ctx.LOGS];}finish({w:w.g.id,turns:ctx.__G.turnNo});};
  const t=setTimeout(()=>finish({w:null,turns:ctx.__G&&ctx.__G.turnNo,stuck:true}),2000);
  ctx.__start(a,b,false).catch(e=>{done=true;clearTimeout(t);cancelPrev();rej(e);});
 }).then(async r=>{await new Promise(z=>setTimeout(z,0));return r;});
}
(async()=>{
 const GS=ctx.GENERALS;const S={};GS.forEach(g=>S[g.id]={w:0,n:0,t:0});
 let turns=[],stuck=0,errs=0,done=0;
 // Refresh VM every REF games to clear any leaked state
 const REF=2000;
 for(const a of GS)for(const b of GS){if(a===b)continue;if(ONLY&&a.id!==ONLY&&b.id!==ONLY)continue;for(let i=0;i<N;i++){
  if(done>0&&done%REF===0){
   const keep={ONESHOT:ctx.ONESHOT,OS:ctx.OS,OSLOG:ctx.OSLOG};
   ctx=freshCtx();ctx.ONESHOT=keep.ONESHOT;ctx.OS=keep.OS;ctx.OSLOG=keep.OSLOG;
   prog(`refresh_ctx at done=${done}`);
  }
  const A=ctx.GENERALS.find(g=>g.id===a.id),B=ctx.GENERALS.find(g=>g.id===b.id);
  fs.writeFileSync('/tmp/sim-current.txt',`${a.id}vs${b.id} i=${i} done=${done}`);
  try{const r=await game(A,B);done++;
   if(r.stuck){stuck++;if(stuck<=30||stuck%25===0)prog(`stuck ${stuck} at ${a.id}vs${b.id} turns=${r.turns}`);}
   else{S[a.id].n++;S[b.id].n++;S[r.w].w++;turns.push(r.turns);S[a.id].t+=r.turns;S[b.id].t+=r.turns;if(r.turns>60)S[a.id].L=(S[a.id].L||0)+1,S[b.id].L=(S[b.id].L||0)+1;}
   if(done%500===0)prog(`progress ${turns.length} done=${done} stuck=${stuck} errs=${errs} last=${a.id}vs${b.id}`);
  }catch(e){errs++;done++;if(errs<8)prog(`err ${a.id}vs${b.id} ${e.stack||e}`);}
 }}
 turns.sort((x,y)=>x-y);const med=turns[turns.length>>1],avg=(turns.reduce((s,x)=>s+x,0)/(turns.length||1)).toFixed(1);
 const rows=GS.map(g=>({id:g.id,name:g.name,hp:g.hp,tier:g.tier,wr:S[g.id].n?S[g.id].w/S[g.id].n:0,at:S[g.id].n?(S[g.id].t/S[g.id].n).toFixed(1):'0',L:S[g.id].L||0})).sort((x,y)=>y.wr-x.wr);
 const inBand=rows.filter(r=>r.wr>=0.4&&r.wr<=0.6).length;
 prog(JSON.stringify(ctx.OS||{}));
 if(ctx.OSLOG)prog((ctx.OSLOG||[]).join('\n'));
 prog(`oneshot=${ctx.ONESHOT||0} games=${turns.length} stuck=${stuck} errors=${errs} inBand=${inBand}/${rows.length} turns(avg/med)=${avg}/${med} p10=${turns[turns.length/10|0]} p90=${turns[turns.length*.9|0]}`);
 rows.forEach(r=>prog(`${(r.wr*100).toFixed(1).padStart(5)}%  T${r.tier} ${r.name}(${r.id}) hp${r.hp} avgT=${r.at} long=${r.L}`));
 fs.writeFileSync(path.join(root,'tools/sim-result.json'),JSON.stringify({turns:{avg,med},oneshot:ctx.ONESHOT||0,stuck,errors:errs,inBand,rows},null,1));
 process.exit(0);
})();
