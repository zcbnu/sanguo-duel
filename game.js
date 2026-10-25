'use strict';
const $=s=>document.querySelector(s);
const sleep=ms=>/auto/.test(location.search)?Promise.resolve():new Promise(r=>setTimeout(r,ms));
const G={};let uid=0;
function buildDeck(){const d=[];for(const k in CARD_DEFS)for(let i=0;i<CARD_DEFS[k].cnt;i++)d.push({id:uid++,k});return shuffle(d);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
const cn=k=>CARD_DEFS[k].n;
const has=(p,sk)=>p.g.skills.some(s=>s.n===sk||s.e===sk);
function log(t){if(NET&&NET.role==='host')send({type:'log',t});const el=$('#log');const d=document.createElement('div');d.textContent=t;el.prepend(d);}
function opp(p){return G.P[1-p.i];}
function drawCards(p,n){for(let i=0;i<n;i++){if(!G.deck.length){G.deck=shuffle(G.discard);G.discard=[];}if(!G.deck.length)break;p.hand.push(G.deck.pop());}render();}
function removeCard(p,c){p.hand=p.hand.filter(x=>x!==c);G.discard.push(c);}
function randDiscard(p,why){if(!p.hand.length)return;const c=p.hand[Math.random()*p.hand.length|0];removeCard(p,c);log(`${p.g.name}${why||''}弃置了【${cn(c.k)}】`);}
function handLimit(p){return Math.max(0,p.hp)+(has(p,'隐忍')?2:0);}
function float(p,txt,cls){if(NET&&NET.role==='host')send({type:'fx',w:p.remote?0:1,txt,cls});const el=$(p.i?'#ai':'#me');const f=document.createElement('div');f.className='float '+cls;f.textContent=txt;el.appendChild(f);setTimeout(()=>f.remove(),900);}

// ---- 人类交互 ----
let pending=null;
function waitUser(){return new Promise(r=>pending=r);}
function resolveUser(v){if(NET&&NET.role==='guest'){guestAct(v);return;}if(pending){const r=pending;pending=null;r(v);}}
async function ask(p,msg,opts){ // opts:[{label,val}]
 if(p.ai)return null;
 if(p.remote){const pv=G.rphase;G.rphase='busy';render();send({type:'ask',msg,opts});const r=await waitRemote(t=>t.t==='ans');G.rphase=pv;return r.val;}
 const box=$('#prompt');box.innerHTML=`<p>${msg}</p>`;
 for(const o of opts){const b=document.createElement('button');b.textContent=o.label;b.onclick=()=>{box.classList.add('hide');resolveUser(o.val);};box.appendChild(b);}
 box.classList.remove('hide');return waitUser();}

// 请求某人打出一张某牌（响应）。返回是否打出。
async function respond(p,k,msg){
 if(k==='bi'&&p.armor&&p.armor.k==='tengdun'&&!(G.ignoreArmor)){if(Math.random()<.4){log(`${p.g.name}的【藤盾】生效，自动抵消！`);float(p,'藤盾','good');await sleep(400);return true;}}
 const c=p.hand.find(x=>x.k===k);if(!c)return false;
 let use;
 if(p.ai)use=true;else use=await ask(p,msg+`（你有${p.hand.filter(x=>x.k===k).length}张【${cn(k)}】）`,[{label:'打出【'+cn(k)+'】',val:true},{label:'不出',val:false}]);
 if(use){removeCard(p,c);log(`${p.g.name}打出【${cn(k)}】`);render();await sleep(350);}
 return use;}

async function damage(src,t,n,why){
 if(G.over)return;t.hp-=n;log(`${t.g.name}受到${n}点伤害${why?'（'+why+'）':''}，体力${t.hp}`);float(t,'-'+n,'bad');shake(t);render();await sleep(450);
 if(t.hp<=0)await dying(t);
 if(G.over)return;
 if(has(t,'烈目')&&src&&src!==t&&src.hand.length){log(`${t.g.name}发动【烈目】`);randDiscard(src);render();}
}
async function heal(p,n){p.hp=Math.min(p.maxHp,p.hp+n);float(p,'+'+n,'good');log(`${p.g.name}回复${n}点体力，体力${p.hp}`);render();await sleep(300);}
async function dying(p){
 while(p.hp<=0){
  const keys=['yao'];if(has(p,'济世'))keys.push('bi');
  const c=p.hand.find(x=>keys.includes(x.k));
  if(!c)break;
  let use=true;if(!p.ai)use=await ask(p,`你濒死！使用【${cn(c.k)}】救自己吗？`,[{label:'使用',val:true},{label:'放弃',val:false}]);
  if(!use)break;removeCard(p,c);log(`${p.g.name}濒死使用【${cn(c.k)}】`);await heal(p,has(p,'英姿')&&c.k==='yao'?2:1);}
 if(p.hp<=0)endGame(opp(p));}
function endGame(w){G.over=true;render();if(NET){send({type:'over',win:w.i===1,name:w.g.name});}const me=w.i===0;const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');me?st.w++:st.l++;localStorage.sgStats=JSON.stringify(st);
 $('#prompt').classList.add('hide');$('#over').innerHTML=`<h2>${me?'胜利！':'败北…'}</h2><p>${w.g.name} 获胜</p><p>战绩：${st.w} 胜 ${st.l} 负</p><button onclick="location.reload()">再来一局</button>`;$('#over').classList.remove('hide');resolveUser(null);}

// ---- 出牌 ----
function canPlay(p,c){const k=c.k;
 if(k==='bi')return false;
 if(k==='yao')return p.hp<p.maxHp;
 if(k==='zhan')return p.zhanUsed<zhanLimit(p);
 return true;}
function zhanLimit(p){if(p.weapon&&p.weapon.k==='liannu')return 99;return (has(p,'暴喝')?2:1)+(p.extraZhan||0);}
async function playCard(p,c){if(G.over)return;const t=opp(p);removeCard(p,c);const k=c.k,D=CARD_DEFS[k];
 log(`${p.g.name}使用【${D.n}】`);render();await sleep(300);
 if(D.type==='weapon'||D.type==='armor'){const slot=D.type;if(p[slot])G.discard.push(p[slot]);G.discard=G.discard.filter(x=>x!==c);p[slot]=c;if(has(p,'弓腰')){log(`${p.g.name}发动【弓腰】`);drawCards(p,2);}render();return;}
 if(k==='yao'){await heal(p,has(p,'英姿')?2:1);return;}
 if(k==='zhan'){p.zhanUsed++;await doZhan(p,t);return;}
 if(k==='liangcao'){drawCards(p,2);return;}
 if(k==='yexi'){steal(p,t);return;}
 if(k==='pozhen'){if(t.weapon||t.armor){const s=t.weapon&&(!t.armor||Math.random()<.5)?'weapon':'armor';log(`${t.g.name}的【${cn(t[s].k)}】被破坏`);G.discard.push(t[s]);t[s]=null;}else randDiscard(t,'被【破阵】');render();return;}
 if(k==='jianyu'||k==='fenghuo'){await aoe(p,t,k);return;}
 if(k==='dantiao'){let cur=t;while(!G.over){const ok=await respond(cur,'zhan',`【单挑】轮到你打出【斩】`);if(!ok){await damage(opp(cur),cur,1,'单挑');break;}cur=opp(cur);}return;}
}
function steal(p,t){if(!t.hand.length){log('对方没有手牌');return;}const c=t.hand[Math.random()*t.hand.length|0];t.hand=t.hand.filter(x=>x!==c);p.hand.push(c);log(`${p.g.name}获得了${t.g.name}的一张手牌`);render();}
async function aoe(p,t,k){if(t.armor&&t.armor.k==='tiejia'){log(`${t.g.name}的【玄铁甲】使其无效`);return;}
 if(has(t,'铁壁')){log(`${t.g.name}的【${t.g.skills.find(s=>s.e==='铁壁').n}】使其无效`);return;}
 const need=k==='jianyu'?'bi':'zhan';const ok=await respond(t,need,`对方对你使用【${cn(k)}】，${k==='jianyu'?'打出':'弃置'}【${cn(need)}】抵消？`);
 if(!ok)await damage(p,t,1+(has(p,'焚江')?1:0),cn(k));}
async function doZhan(p,t){
 if(has(t,'空营')&&t.hand.length===0){log(`${t.g.name}【空营】：斩无效`);return;}
 G.ignoreArmor=(p.weapon&&p.weapon.k==='pojia')||has(p,'穿杨');
 const need=has(p,'裂天')?2:1;let dodged=true;
 for(let i=0;i<need;i++){if(!await respond(t,'bi',`${p.g.name}对你使用【斩】${need>1?`（裂天：需${need}张，第${i+1}张）`:''}，打出【避】？`)){dodged=false;break;}}
 G.ignoreArmor=false;
 if(dodged){if(has(t,'反击')&&p.hand.length){log(`${t.g.name}反击`);randDiscard(p);}if(has(p,'奔袭')){log(`${p.g.name}发动【奔袭】`);drawCards(p,1);}if(p.weapon&&p.weapon.k==='zhongchui')randDiscard(t,'受【流星锤】');render();return;}
 let n=1;if(has(p,'傲刃')&&t.hand.length>p.hand.length){n++;log(`${p.g.name}发动【傲刃】`);}
 if(has(p,'血战')&&p.hp<=2){n++;log(`${p.g.name}血战：伤害+1`);}
 await damage(p,t,n,'斩');
 if(has(p,'饮血')&&!p.yinxue&&!G.over&&p.hp<p.maxHp){p.yinxue=true;await heal(p,1);}}

// ---- 主动技能 ----
const ACTIVES={
 xieling:{can:p=>p.hand.length>=1,async run(p,cards){removeCard(p,cards[0]);drawCards(p,2);},need:1},
 renwang:{can:p=>p.hand.length>=2&&p.hp<p.maxHp,async run(p,cards){cards.forEach(c=>removeCard(p,c));await heal(p,1);},need:2},
 quanheng:{can:p=>p.hand.length>=1,async run(p){const n=p.hand.length;[...p.hand].forEach(c=>removeCard(p,c));drawCards(p,n+1);},need:0},
 jieying:{can:p=>p.hand.some(c=>c.k==='bi')&&opp(p).hand.length,async run(p,cards){removeCard(p,cards[0]);steal(p,opp(p));},need:1,filter:c=>c.k==='bi'},
 miaoshou:{can:p=>p.hand.length>=1&&p.hp<p.maxHp,async run(p,cards){removeCard(p,cards[0]);await heal(p,1);},need:1},
 lijian:{can:p=>opp(p).hand.length>0,async run(p){randDiscard(opp(p),'被【离间】');render();},need:0},
 guwu:{can:p=>p.hand.length>=1,async run(p,cards){removeCard(p,cards[0]);p.extraZhan=(p.extraZhan||0)+1;render();},need:1},
 qiangduo:{can:p=>p.hand.length>=2&&(opp(p).weapon||opp(p).armor||opp(p).hand.length),async run(p,cards){cards.forEach(c=>removeCard(p,c));const t=opp(p);const sl=t.weapon?'weapon':t.armor?'armor':null;if(sl){const e=t[sl];t[sl]=null;if(p[sl])G.discard.push(p[sl]);p[sl]=e;log(`${p.g.name}夺得【${cn(e.k)}】`);render();}else steal(p,t);},need:2},
 yangbing:{can:p=>p.hp>1,async run(p){p.hp--;log(`${p.g.name}失去1点体力`);float(p,'-1','bad');drawCards(p,3);},need:0},
 tiaozhan:{can:p=>p.hand.some(c=>c.k==='zhan'),async run(p,cards){removeCard(p,cards[0]);await aoe(p,opp(p),'jianyu');},need:1,filter:c=>c.k==='zhan'},
 luanshi:{can:p=>p.hand.length>=2,async run(p,cards){cards.forEach(c=>removeCard(p,c));await aoe(p,opp(p),'jianyu');},need:2},
};
function activeOf(p){const s=p.g.skills.find(s=>s.active);return s?{s,a:ACTIVES[s.active]}:null;}

// ---- 回合 ----
async function turn(p){if(G.over)return;G.cur=p;p.zhanUsed=0;p.skillUsed=false;p.extraZhan=0;p.yinxue=false;G.turnNo++;
 log(`—— 第${G.turnNo}回合：${p.g.name} ——`);render();
 const n=2+(['深谋','观天','雅量'].some(s=>has(p,s))?1:0);drawCards(p,n);await sleep(300);
 if(p.ai)await aiPlay(p);else if(p.remote)await remotePlay(p);else await humanPlay(p);
 if(G.over)return;
 await discardPhase(p);
 if(has(p,'月影')){log(`${p.g.name}发动【月影】`);drawCards(p,1);}
 if(has(p,'固守')&&!p.hand.length){log(`${p.g.name}手牌为空，摸2张`);drawCards(p,2);}
}
async function humanPlay(p){G.phase='play';render();
 while(!G.over){const act=await waitUser();if(!act||G.over)break;
  if(act.t==='end')break;
  if(act.t==='card'){await playCard(p,act.c);}
  if(act.t==='skill'){await act.run();}
  G.phase='play';render();}
 G.phase='';}
async function discardPhase(p){let over=p.hand.length-handLimit(p);if(over<=0)return;
 if(p.remote){G.rphase='discard';G.rneed=over;render();for(;;){const a=await waitRemote(a=>a.t==='discard');const cs=(a.cids||[]).map(id=>p.hand.find(x=>x.id===id)).filter(Boolean);if(new Set(cs).size===over){cs.forEach(c=>removeCard(p,c));break;}}G.rphase='';log(`${p.g.name}弃置${over}张牌`);render();return;}
 if(p.ai){const order=aiDiscardOrder(p);for(let i=0;i<over;i++)removeCard(p,order[i]);log(`${p.g.name}弃置${over}张牌`);render();return;}
 G.phase='discard';G.sel=[];G.needSel=over;render();await waitUser();
 G.sel.forEach(c=>removeCard(p,c));log(`${p.g.name}弃置${over}张牌`);G.sel=[];G.phase='';render();}

// ---- AI ----
const VAL={bi:9,yao:10,zhan:6,yexi:7,liangcao:7,fenghuo:5,jianyu:6,pozhen:5,dantiao:5,liannu:4,pojia:4,zhongchui:4,tengdun:5,tiejia:5};
function aiDiscardOrder(p){return [...p.hand].sort((a,b)=>VAL[a.k]-VAL[b.k]);}
async function aiPlay(p){const t=opp(p);
 for(let guard=0;guard<40&&!G.over;guard++){await sleep(450);
  const act=activeOf(p);
  if(act&&!p.skillUsed&&act.a.can(p)&&aiWantSkill(p,act.s.active)){p.skillUsed=true;log(`${p.g.name}发动【${act.s.n}】`);
   const pool=aiDiscardOrder(p).filter(act.a.filter||(()=>true));await act.a.run(p,pool.slice(0,act.a.need));render();continue;}
  const pick=aiChoose(p,t);if(!pick)break;await playCard(p,pick);}
}
function aiWantSkill(p,id){const t=opp(p);switch(id){
 case 'xieling':return p.hand.some(c=>VAL[c.k]<=6&&c.k!=='zhan')||p.hand.filter(c=>c.k==='zhan').length>1;
 case 'renwang':return p.hand.length>=3;case 'quanheng':return p.hand.length<=3&&!p.hand.some(c=>c.k==='yao');
 case 'jieying':return p.hand.filter(c=>c.k==='bi').length>=2||t.hand.length>=4;
 case 'miaoshou':return true;case 'lijian':return true;case 'luanshi':return p.hand.length>=4||t.hp<=1;
 case 'guwu':return p.hand.filter(c=>c.k==='zhan').length>=2&&p.hand.length>=3;
 case 'qiangduo':return !!(t.weapon||t.armor)&&p.hand.length>=3;
 case 'yangbing':return p.hp>=3;
 case 'tiaozhan':return p.hand.filter(c=>c.k==='zhan').length>=2||t.hp<=1;}return false;}
function aiChoose(p,t){const h=p.hand;const f=k=>h.find(c=>c.k===k);
 if(p.hp<p.maxHp&&f('yao')&&(p.hp<=2||h.filter(c=>c.k==='yao').length>1))return f('yao');
 for(const k of ['liangcao','yexi'])if(f(k)&&(k!=='yexi'||t.hand.length))return f(k);
 for(const k of ['liannu','pojia','zhongchui'])if(f(k)&&!p.weapon)return f(k);
 for(const k of ['tengdun','tiejia'])if(f(k)&&!p.armor)return f(k);
 if(f('pozhen')&&(t.weapon||t.armor||t.hand.length))return f('pozhen');
 if(f('jianyu')&&!(t.armor&&t.armor.k==='tiejia'))return f('jianyu');
 if(f('fenghuo')&&!(t.armor&&t.armor.k==='tiejia'))return f('fenghuo');
 if(f('dantiao')&&h.filter(c=>c.k==='zhan').length>=2)return f('dantiao');
 if(f('zhan')&&p.zhanUsed<zhanLimit(p)&&!(has(t,'空营')&&!t.hand.length))return f('zhan');
 if(p.hp<p.maxHp&&f('yao')&&h.length>handLimit(p))return f('yao');
 return null;}

// ---- 渲染 ----
function shake(p){const el=$(p.i?'#ai':'#me');el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');}
function hpBar(p){let s='';for(let i=0;i<p.maxHp;i++)s+=`<i class="${i<p.hp?'on':''}"></i>`;return s;}
function seat(p){const fc=FACTIONS[p.g.f];
 return `<div class="portrait" style="--fc:${fc.c}"><img src="assets/portraits/${p.g.id}.svg" alt=""><span class="fac">${fc.n}</span></div>
 <div class="info"><div class="name">${p.g.name}${G.cur===p&&!G.over?' <em>行动中</em>':''}</div><div class="hp">${hpBar(p)}</div>
 <div class="skills">${p.g.skills.map(s=>`<span title="${s.t}">${s.n}</span>`).join('')}</div>
 <div class="equip">${['weapon','armor'].map(s=>p[s]?`<span title="${CARD_DEFS[p[s].k].t}">${s==='weapon'?'⚔':'🛡'}${cn(p[s].k)}</span>`:'').join('')}</div>
 <div class="cnt">手牌 ${p.hand.length}</div></div>`;}
function render(){if(!G.P)return;if(NET&&NET.role==='host'&&G.P[1].remote)send(snap());const [me,ai]=G.P;
 $('#ai').innerHTML=seat(ai);$('#me').innerHTML=seat(me);
 $('#aihand').innerHTML=ai.hand.map(()=>'<div class="card back"></div>').join('');
 $('#deckinfo').textContent=`牌堆 ${G.deck.length}　弃牌 ${G.discard.length}`;
 const hand=$('#hand');hand.innerHTML='';
 for(const c of me.hand){const D=CARD_DEFS[c.k];const el=document.createElement('div');el.className=`card ${D.type} k-${c.k}`;el.innerHTML=`<b>${D.n}</b><small>${D.t}</small>`;el.title=D.t;
  if(G.phase==='play'&&G.cur===me&&canPlay(me,c)){el.classList.add('ok');el.onclick=()=>resolveUser({t:'card',c});}
  if(G.phase==='discard'||G.phase==='skill'){const okc=!G.selFilter||G.selFilter(c);if(okc)el.classList.add('ok');if(G.sel.includes(c))el.classList.add('sel');el.onclick=()=>{if(!okc)return;G.sel.includes(c)?G.sel=G.sel.filter(x=>x!==c):G.sel.length<G.needSel&&G.sel.push(c);render();};}
  hand.appendChild(el);}
 const bar=$('#actions');bar.innerHTML='';
 if(G.over)return;
 const btn=(t,fn,dis)=>{const b=document.createElement('button');b.textContent=t;b.disabled=!!dis;b.onclick=fn;bar.appendChild(b);};
 if(G.phase==='play'&&G.cur===me){const act=activeOf(me);
  if(act)btn(`技能·${act.s.n}`,()=>startSkill(me,act),me.skillUsed||!act.a.can(me));
  btn('结束出牌',()=>resolveUser({t:'end'}));}
 if(G.phase==='discard')btn(`弃牌 ${G.sel.length}/${G.needSel}`,()=>resolveUser(true),G.sel.length!==G.needSel);
 if(G.phase==='skill'){btn(`确认 ${G.sel.length}/${G.needSel}`,()=>{const cards=G.sel;G.sel=[];G.selFilter=null;G.phase='busy';G.skillDone(cards);},G.sel.length!==G.needSel);btn('取消',()=>{G.sel=[];G.selFilter=null;G.phase='play';render();});}
 if(!G.phase||G.cur!==me)bar.innerHTML='<span class="wait">'+(G.cur===me?'…':(NET?'对手思考中…':'AI 思考中…'))+'</span>';
}
function startSkill(p,act){const go=cards=>{if(NET&&NET.role==='guest'){resolveUser({t:'skill',cids:cards.map(c=>c.id)});return;}p.skillUsed=true;log(`${p.g.name}发动【${act.s.n}】`);resolveUser({t:'skill',run:()=>act.a.run(p,cards)});};
 if(!act.a.need){go([]);return;}
 G.phase='skill';G.sel=[];G.needSel=act.a.need;G.selFilter=act.a.filter||null;G.skillDone=go;render();}

// ---- 联机（PeerJS，房主权威） ----
let NET=null,rpending=null;
function send(m){if(NET&&NET.conn&&NET.conn.open)NET.conn.send(m);}
function waitRemote(f){return new Promise(r=>rpending={r,f});}
function snap(){const R=G.P[1];const v=p=>({i:p===R?0:1,id:p.g.id,hp:p.hp,maxHp:p.maxHp,hand:p===R?p.hand:p.hand.length,weapon:p.weapon,armor:p.armor,zhanUsed:p.zhanUsed,extraZhan:p.extraZhan,skillUsed:p.skillUsed});
 return {type:'state',P:[v(R),v(G.P[0])],cur:G.cur===R?0:G.cur?1:-1,phase:G.rphase||'',need:G.rneed||0,deck:G.deck.length,disc:G.discard.length,over:G.over};}
async function remotePlay(p){
 while(!G.over){G.rphase='play';render();const a=await waitRemote(a=>['card','skill','end'].includes(a.t));if(G.over)break;
  if(a.t==='end')break;
  if(a.t==='card'){const c=p.hand.find(x=>x.id===a.cid);if(c&&canPlay(p,c)){G.rphase='busy';render();await playCard(p,c);}}
  if(a.t==='skill'){const act=activeOf(p);if(act&&!p.skillUsed&&act.a.can(p)){const cs=(a.cids||[]).map(id=>p.hand.find(x=>x.id===id)).filter(Boolean);
   if(cs.length===act.a.need&&(!act.a.filter||cs.every(act.a.filter))){p.skillUsed=true;log(`${p.g.name}发动【${act.s.n}】`);G.rphase='busy';render();await act.a.run(p,cs);}}}}
 G.rphase='';render();}
function guestAct(v){if(v==null)return;let m;
 if(v===true)m={t:'discard',cids:G.sel.map(c=>c.id)};else if(v.t==='card')m={t:'card',cid:v.c.id};else if(v.t==='skill')m={t:'skill',cids:v.cids};else if(v.t==='end')m={t:'end'};
 if(!m)return;send({type:'act',...m});G.sel=[];G.phase='busy';render();}
function onMsg(m){
 if(NET.role==='host'){
  if(m.type==='pick'){NET.guestPick=GENERALS.find(g=>g.id===m.id&&NET.offers[1].includes(g.id));if(NET.guestPick)tryStartNet();}
  if(m.type==='act'&&rpending&&(!rpending.f||rpending.f(m))){const r=rpending.r;rpending=null;r(m);}
  return;}
 // guest
 if(m.type==='offer'){$('#lobby').innerHTML='已连接！从下面 8 位武将中选择出战。';selectScreen(m.ids);}
 if(m.type==='log')log(m.t);
 if(m.type==='fx'){const p=G.P&&G.P[m.w];if(p)float(p,m.txt,m.cls);}
 if(m.type==='state'){$('#select').classList.add('hide');$('#detail').classList.add('hide');$('#battle').classList.remove('hide');
  const P=m.P.map(v=>({...v,g:GENERALS.find(g=>g.id===v.id),hand:Array.isArray(v.hand)?v.hand:Array.from({length:v.hand},()=>({}))}));
  if(G.phase!==m.phase||m.phase==='play'){G.sel=G.phase===m.phase?G.sel||[]:[];}
  if(G.phase==='skill'&&m.phase==='play'){}else G.phase=m.phase;
  Object.assign(G,{P,cur:P[m.cur]||null,needSel:m.need,deck:{length:m.deck},discard:{length:m.disc},over:m.over});if(!G.sel)G.sel=[];render();}
 if(m.type==='ask'){const box=$('#prompt');box.innerHTML=`<p>${m.msg}</p>`;for(const o of m.opts){const b=document.createElement('button');b.textContent=o.label;b.onclick=()=>{box.classList.add('hide');send({type:'act',t:'ans',val:o.val});};box.appendChild(b);}box.classList.remove('hide');}
 if(m.type==='over'){G.over=true;render();$('#prompt').classList.add('hide');$('#over').innerHTML=`<h2>${m.win?'胜利！':'败北…'}</h2><p>${m.name} 获胜</p><p>想再战请让房主新建房间</p><button onclick="location.href=location.pathname">返回首页</button>`;$('#over').classList.remove('hide');}
}
function setupConn(conn){NET.conn=conn;conn.on('data',onMsg);conn.on('close',()=>{if(!G.over)alert('对手已断开连接');});}
function newCode(){return Math.random().toString(36).slice(2,8).toUpperCase();}
function hostRoom(){if(typeof Peer==='undefined'){alert('联机组件加载失败，请检查网络后刷新');return;}
 const code=newCode();NET={role:'host',code};const peer=new Peer('sgduel-'+code);NET.peer=peer;
 const url=location.origin+location.pathname+'?room='+code;
 $('#lobby').innerHTML=`房间 <b>${code}</b> 已创建，把链接发给对手：<br><input id="rl" readonly value="${url}" onclick="this.select()"> <button id="cp">复制</button><br><span id="ls">等待对手加入…</span>`;
 $('#cp').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(url);$('#cp').textContent='已复制';};
 peer.on('error',e=>$('#ls').textContent='连接错误：'+e.type);
 peer.on('connection',conn=>{if(NET.conn){conn.close();return;}setupConn(conn);conn.on('open',()=>{
  const ids=shuffle(GENERALS.map(g=>g.id));NET.offers=[ids.slice(0,8),ids.slice(8,16)];
  send({type:'offer',ids:NET.offers[1]});$('#ls').textContent='对手已加入！请从 8 位武将中选择。';selectScreen(NET.offers[0]);});});}
function joinRoom(code){if(typeof Peer==='undefined'){alert('联机组件加载失败，请检查网络后刷新');return;}
 NET={role:'guest',code};$('#modes').classList.add('hide');$('#grid').innerHTML='';$('#lobby').innerHTML=`正在加入房间 <b>${code}</b>…`;
 const peer=new Peer();NET.peer=peer;peer.on('error',e=>$('#lobby').textContent='连接失败：'+e.type+'（房间可能已关闭）');
 peer.on('open',()=>{const conn=peer.connect('sgduel-'+code,{reliable:true});setupConn(conn);});}
function tryStartNet(){if(NET.myPick&&NET.guestPick)start(NET.myPick,NET.guestPick,true);else if(NET.myPick)$('#lobby').innerHTML='已选择，等待对手选将…';}

// ---- 选将 ----
let OFFER=[];
function selectScreen(ids){const grid=$('#grid');grid.innerHTML='';OFFER=ids||shuffle(GENERALS.map(g=>g.id)).slice(0,8);
 for(const id of OFFER){const g=GENERALS.find(x=>x.id===id);const fc=FACTIONS[g.f];const el=document.createElement('div');el.className='gcard';el.style.setProperty('--fc',fc.c);
  el.innerHTML=`<img src="assets/portraits/${g.id}.svg" alt=""><div class="gn"><span class="fac">${fc.n}</span>${g.name} <small>♥${g.hp}</small></div>`;
  el.onclick=()=>showDetail(g);grid.appendChild(el);}
 const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');$('#stats').textContent=`人机战绩 ${st.w} 胜 ${st.l} 负 · 武将池 ${GENERALS.length} 位，每局随机 8 位`;}
function showDetail(g){const d=$('#detail');const fc=FACTIONS[g.f];
 d.innerHTML=`<img src="assets/portraits/${g.id}.svg"><h3>${fc.n}·${g.name}　♥${g.hp}</h3>${g.skills.map(s=>`<p><b>【${s.n}】</b>${s.t}</p>`).join('')}<button id="go">选择出战</button> <button id="cl">返回</button>`;
 d.classList.remove('hide');$('#cl').onclick=()=>d.classList.add('hide');
 $('#go').onclick=()=>{d.classList.add('hide');
  if(!NET){const pool=GENERALS.filter(x=>x!==g);start(g,pool[Math.random()*pool.length|0],false);return;}
  if(NET.role==='guest'){send({type:'pick',id:g.id});$('#grid').innerHTML='';$('#lobby').innerHTML=`你选择了${g.name}，等待房主选将…`;return;}
  if(!NET.conn)return;NET.myPick=g;$('#grid').innerHTML='';tryStartNet();};}
async function start(g,ag,net){
 $('#select').classList.add('hide');$('#battle').classList.remove('hide');
 const mk=(i,gg,ai)=>({i,g:gg,ai,hp:gg.hp,maxHp:gg.hp,hand:[],weapon:null,armor:null,zhanUsed:0});
 Object.assign(G,{deck:buildDeck(),discard:[],P:[mk(0,g,AUTO),mk(1,ag,!net)],over:false,turnNo:0,phase:'',sel:[]});
 if(net)G.P[1].remote=true;
 log(net?`房主选择了${g.name}，对手选择了${ag.name}`:`你选择了${g.name}，AI 选择了${ag.name}`);
 G.P.forEach(p=>drawCards(p,4+(has(p,'迅捷')?2:0)));
 let cur=Math.random()<.5?0:1;log(`${G.P[cur].g.name} 先手`);
 while(!G.over){await turn(G.P[cur]);cur=1-cur;}}
function initLobby(){const room=new URLSearchParams(location.search).get('room');
 $('#pve').onclick=()=>{selectScreen();};$('#host').onclick=()=>{$('#modes').classList.add('hide');hostRoom();};
 if(room)joinRoom(room.toUpperCase());else selectScreen();}
$('#rules').onclick=()=>$('#ruleBox').classList.toggle('hide');
$('#ruleBox').innerHTML='<h3>规则</h3><p>回合：摸2张 → 出牌 → 弃牌至手牌上限（=当前体力）。把对方体力打到0即获胜。</p>'+Object.values(CARD_DEFS).map(d=>`<p><b>【${d.n}】</b>×${d.cnt} ${d.t}</p>`).join('');
initLobby();
const AUTO=/auto/.test(location.search);if(AUTO){window.onerror=e=>document.title="ERR "+e;{const g=GENERALS[+(location.search.split("g=")[1]||0)];const pool=GENERALS.filter(x=>x!==g);start(g,pool[Math.random()*pool.length|0],false);}}
