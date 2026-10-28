// 验证教程与残局 1–5 可通关：node tools/verify-modes.js [教程局数]
// 我方由 AI 代打（教程中把 AI 出牌也计入教程步骤），残局用固定种子，结果确定。
const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.join(__dirname,'..');
const el=()=>new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='classList'?{add(){},remove(){},toggle(){}}:typeof k==='string'&&/^(appendChild|prepend|remove|setProperty|addEventListener)$/.test(k)?()=>{}:k==='style'?{setProperty(){}}:''),set:(t,k,v)=>(t[k]=v,true)});
function mkctx(){const ctx={URLSearchParams,console,Math:Object.create(Math),JSON,Promise,setTimeout,Array,Object,Set,String,Number,document:{querySelector:()=>el(),createElement:()=>el()},localStorage:{sgPuzzle:'9'},location:{search:'?auto',origin:'',pathname:'/'},navigator:{}};
 ctx.window=ctx;ctx.HARNESS=true;vm.createContext(ctx);
 for(const f of ['data/generals.js','data/cards.js','data/lines.js','data/modes.js','game.js']){let src=fs.readFileSync(path.join(root,f),'utf8');if(f==='game.js')src=src.split('G.tut&&!p.ai').join('G.tut&&p.i===0');vm.runInContext(src,ctx,{filename:f});}
 vm.runInContext('window.__G=G;window.__start=start;window.__tut=startTutorial;',ctx);return ctx;}
function run(fn){const ctx=mkctx();return new Promise(res=>{let d=false;ctx.onGameOver=w=>{if(!d){d=true;const G=ctx.__G;setTimeout(()=>res({win:w.i===0,turns:G.turnNo,tut:G.tut,done:ctx.localStorage.sgTutDone,pz:ctx.localStorage.sgPuzzle,log:(ctx.LOGS||[]).slice(-80)}),0);}};
 setTimeout(()=>{if(!d){d=true;res({stuck:true});}},5000);fn(ctx);}).then(r=>new Promise(z=>setTimeout(()=>z(r),5)));}
(async()=>{let bad=0;
 for(let id=1;id<=5;id++){const r=await run(c=>{c.localStorage.sgPuzzle=String(id-1);vm.runInContext(`startPuzzle(${id})`,c);});
  const ok=r.win&&+r.pz>=id;if(!ok){bad++;console.log((r.log||[]).join('\n'));}console.log(`残局${id}: ${ok?'通关':'失败'} turns=${r.turns}`);}
 const N=+process.argv[2]||50;let w=0,full=0,stuck=0;
 for(let i=0;i<N;i++){const r=await run(c=>c.__tut());if(r.stuck){stuck++;continue;}if(r.win&&r.done==='1')w++;if(r.tut&&r.tut.zhan&&r.tut.bi&&r.tut.skill)full++;}
 console.log(`教程: ${N}局 胜并写入sgTutDone=${w} 完成出斩/避/技能三步=${full} stuck=${stuck}`);
 if(bad||stuck||!w)process.exitCode=1;})();
