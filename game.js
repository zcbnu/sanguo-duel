'use strict';
const $=s=>document.querySelector(s);
const sleep=ms=>/auto/.test(location.search)?Promise.resolve():new Promise(r=>setTimeout(r,ms));
const G={};let uid=0;
function buildDeck(){const d=[];for(const k in CARD_DEFS)for(let i=0;i<CARD_DEFS[k].cnt;i++)d.push({id:uid++,k});return shuffle(d);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
const cn=k=>CARD_DEFS[k].n;
const has=(p,sk)=>p.g.skills.some(s=>s.n===sk);
function log(t){const el=$('#log');const d=document.createElement('div');d.textContent=t;el.prepend(d);}
function opp(p){return G.P[1-p.i];}
function drawCards(p,n){for(let i=0;i<n;i++){if(!G.deck.length){G.deck=shuffle(G.discard);G.discard=[];}if(!G.deck.length)break;p.hand.push(G.deck.pop());}render();}
function removeCard(p,c){p.hand=p.hand.filter(x=>x!==c);G.discard.push(c);}
function randDiscard(p,why){if(!p.hand.length)return;const c=p.hand[Math.random()*p.hand.length|0];removeCard(p,c);log(`${p.g.name}${why||''}弃置了【${cn(c.k)}】`);}
function handLimit(p){return Math.max(0,p.hp)+(has(p,'隐忍')?2:0);}
function float(p,txt,cls){const el=$(p.i?'#ai':'#me');const f=document.createElement('div');f.className='float '+cls;f.textContent=txt;el.appendChild(f);setTimeout(()=>f.remove(),900);}

// ---- 人类交互 ----
let pending=null;
function waitUser(){return new Promise(r=>pending=r);}
function resolveUser(v){if(pending){const r=pending;pending=null;r(v);}}
async function ask(p,msg,opts){ // opts:[{label,val}]
 if(p.ai)return null;
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
function endGame(w){G.over=true;render();const me=w.i===0;const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');me?st.w++:st.l++;localStorage.sgStats=JSON.stringify(st);
 $('#prompt').classList.add('hide');$('#over').innerHTML=`<h2>${me?'胜利！':'败北…'}</h2><p>${w.g.name} 获胜</p><p>战绩：${st.w} 胜 ${st.l} 负</p><button onclick="location.reload()">再来一局</button>`;$('#over').classList.remove('hide');resolveUser(null);}

// ---- 出牌 ----
function canPlay(p,c){const k=c.k;
 if(k==='bi')return false;
 if(k==='yao')return p.hp<p.maxHp;
 if(k==='zhan')return p.zhanUsed<zhanLimit(p);
 return true;}
function zhanLimit(p){if(p.weapon&&p.weapon.k==='liannu')return 99;return has(p,'暴喝')?2:1;}
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
 const need=k==='jianyu'?'bi':'zhan';const ok=await respond(t,need,`对方对你使用【${cn(k)}】，${k==='jianyu'?'打出':'弃置'}【${cn(need)}】抵消？`);
 if(!ok)await damage(p,t,1+(has(p,'焚江')?1:0),cn(k));}
async function doZhan(p,t){
 if(has(t,'空营')&&t.hand.length===0){log(`${t.g.name}【空营】：斩无效`);return;}
 G.ignoreArmor=p.weapon&&p.weapon.k==='pojia';
 const need=has(p,'裂天')?2:1;let dodged=true;
 for(let i=0;i<need;i++){if(!await respond(t,'bi',`${p.g.name}对你使用【斩】${need>1?`（裂天：需${need}张，第${i+1}张）`:''}，打出【避】？`)){dodged=false;break;}}
 G.ignoreArmor=false;
 if(dodged){if(has(p,'奔袭')){log(`${p.g.name}发动【奔袭】`);drawCards(p,1);}if(p.weapon&&p.weapon.k==='zhongchui')randDiscard(t,'受【流星锤】');render();return;}
 let n=1;if(has(p,'傲刃')&&t.hand.length>p.hand.length){n++;log(`${p.g.name}发动【傲刃】`);}
 await damage(p,t,n,'斩');}

// ---- 主动技能 ----
const ACTIVES={
 xieling:{can:p=>p.hand.length>=1,async run(p,cards){removeCard(p,cards[0]);drawCards(p,2);},need:1},
 renwang:{can:p=>p.hand.length>=2&&p.hp<p.maxHp,async run(p,cards){cards.forEach(c=>removeCard(p,c));await heal(p,1);},need:2},
 quanheng:{can:p=>p.hand.length>=1,async run(p){const n=p.hand.length;[...p.hand].forEach(c=>removeCard(p,c));drawCards(p,n+1);},need:0},
 jieying:{can:p=>p.hand.some(c=>c.k==='bi')&&opp(p).hand.length,async run(p,cards){removeCard(p,cards[0]);steal(p,opp(p));},need:1,filter:c=>c.k==='bi'},
 miaoshou:{can:p=>p.hand.length>=1&&p.hp<p.maxHp,async run(p,cards){removeCard(p,cards[0]);await heal(p,1);},need:1},
 lijian:{can:p=>opp(p).hand.length>0,async run(p){randDiscard(opp(p),'被【离间】');render();},need:0},
 luanshi:{can:p=>p.hand.length>=2,async run(p,cards){cards.forEach(c=>removeCard(p,c));await aoe(p,opp(p),'jianyu');},need:2},
};
function activeOf(p){const s=p.g.skills.find(s=>s.active);return s?{s,a:ACTIVES[s.active]}:null;}

// ---- 回合 ----
async function turn(p){if(G.over)return;G.cur=p;p.zhanUsed=0;p.skillUsed=false;G.turnNo++;
 log(`—— 第${G.turnNo}回合：${p.g.name} ——`);render();
 const n=2+(['深谋','观天','雅量'].some(s=>has(p,s))?1:0);drawCards(p,n);await sleep(300);
 if(p.ai)await aiPlay(p);else await humanPlay(p);
 if(G.over)return;
 await discardPhase(p);
 if(has(p,'月影')){log(`${p.g.name}发动【月影】`);drawCards(p,1);}
}
async function humanPlay(p){G.phase='play';render();
 while(!G.over){const act=await waitUser();if(!act||G.over)break;
  if(act.t==='end')break;
  if(act.t==='card'){await playCard(p,act.c);}
  if(act.t==='skill'){await act.run();}
  G.phase='play';render();}
 G.phase='';}
async function discardPhase(p){let over=p.hand.length-handLimit(p);if(over<=0)return;
 if(p.ai){const order=aiDiscardOrder(p);for(let i=0;i<over;i++)removeCard(p,order[i]);log(`${p.g.name}弃置${over}张牌`);render();return;}
 G.phase='discard';G.sel=[];G.needSel=over;render();await waitUser();
 G.sel.forEach(c=>removeCard(p,c));log(`你弃置${over}张牌`);G.sel=[];G.phase='';render();}

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
 case 'miaoshou':return true;case 'lijian':return true;case 'luanshi':return p.hand.length>=4||t.hp<=1;}return false;}
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
function render(){if(!G.P)return;const [me,ai]=G.P;
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
 if(!G.phase||G.cur!==me)bar.innerHTML='<span class="wait">'+(G.cur===me?'…':'AI 思考中…')+'</span>';
}
function startSkill(p,act){const go=cards=>{p.skillUsed=true;log(`你发动【${act.s.n}】`);resolveUser({t:'skill',run:()=>act.a.run(p,cards)});};
 if(!act.a.need){go([]);return;}
 G.phase='skill';G.sel=[];G.needSel=act.a.need;G.selFilter=act.a.filter||null;G.skillDone=go;render();}

// ---- 选将 ----
function selectScreen(){const grid=$('#grid');grid.innerHTML='';
 for(const g of GENERALS){const fc=FACTIONS[g.f];const el=document.createElement('div');el.className='gcard';el.style.setProperty('--fc',fc.c);
  el.innerHTML=`<img src="assets/portraits/${g.id}.svg" alt=""><div class="gn"><span class="fac">${fc.n}</span>${g.name} <small>♥${g.hp}</small></div>`;
  el.onclick=()=>showDetail(g);grid.appendChild(el);}
 const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');$('#stats').textContent=`战绩 ${st.w} 胜 ${st.l} 负`;}
function showDetail(g){const d=$('#detail');const fc=FACTIONS[g.f];
 d.innerHTML=`<img src="assets/portraits/${g.id}.svg"><h3>${fc.n}·${g.name}　♥${g.hp}</h3>${g.skills.map(s=>`<p><b>【${s.n}】</b>${s.t}</p>`).join('')}<button id="go">选择出战</button> <button id="cl">返回</button>`;
 d.classList.remove('hide');$('#go').onclick=()=>{d.classList.add('hide');start(g);};$('#cl').onclick=()=>d.classList.add('hide');}
async function start(g){const others=GENERALS.filter(x=>x!==g);const ag=others[Math.random()*others.length|0];
 $('#select').classList.add('hide');$('#battle').classList.remove('hide');
 const mk=(i,gg,ai)=>({i,g:gg,ai,hp:gg.hp,maxHp:gg.hp,hand:[],weapon:null,armor:null,zhanUsed:0});
 Object.assign(G,{deck:buildDeck(),discard:[],P:[mk(0,g,AUTO),mk(1,ag,true)],over:false,turnNo:0,phase:'',sel:[]});
 log(`你选择了${g.name}，AI 选择了${ag.name}`);
 G.P.forEach(p=>drawCards(p,4));
 let cur=Math.random()<.5?0:1;log(cur?'AI 先手':'你先手');
 while(!G.over){await turn(G.P[cur]);cur=1-cur;}}
$('#rules').onclick=()=>$('#ruleBox').classList.toggle('hide');
$('#ruleBox').innerHTML='<h3>规则</h3><p>回合：摸2张 → 出牌 → 弃牌至手牌上限（=当前体力）。把对方体力打到0即获胜。</p>'+Object.values(CARD_DEFS).map(d=>`<p><b>【${d.n}】</b>×${d.cnt} ${d.t}</p>`).join('');
selectScreen();
const AUTO=/auto/.test(location.search);if(AUTO){window.onerror=e=>document.title="ERR "+e;start(GENERALS[+(location.search.split("g=")[1]||0)]);}
