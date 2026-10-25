'use strict';
const $=s=>document.querySelector(s);
const sleep=ms=>/auto/.test(location.search)?Promise.resolve():new Promise(r=>setTimeout(r,ms));
const G={};let uid=0;
const SUITS=['spade','heart','club','diamond'],SYM={spade:'♠',heart:'♥',club:'♣',diamond:'♦'};
function buildDeck(){const d=[];for(const k in CARD_DEFS)for(let i=0;i<CARD_DEFS[k].cnt;i++)d.push({id:uid++,k,s:SUITS[Math.random()*4|0],r:1+(Math.random()*13|0)});return shuffle(d);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
const cn=k=>CARD_DEFS[k].n;
const RANK=r=>({1:'A',11:'J',12:'Q',13:'K'}[r]||r);
const cs=c=>c&&c.s?`${SYM[c.s]}${RANK(c.r)}`:'';
const cname=c=>`【${cn(c.k)}】${cs(c)}`;
const suitOf=(p,c)=>p&&has(p,'hongyan')&&c.s==='spade'?'heart':c.s;
const isRed=c=>c.s==='heart'||c.s==='diamond';
const skillsOf=p=>p.g.skills.concat(p.gained||[]);
const has=(p,k)=>skillsOf(p).some(s=>s.k===k);
const sk=(p,k)=>(skillsOf(p).find(s=>s.k===k)||{}).n;
function log(t){if(window.HARNESS){(window.LOGS=window.LOGS||[]).push(t);if(LOGS.length>(window.LOGMAX||30))LOGS.shift();return;}if(NET&&NET.role==='host')send({type:'log',t});const el=$('#log');const d=document.createElement('div');d.textContent=t;el.prepend(d);}
function opp(p){return G.P[1-p.i];}
function topCard(){if(!G.deck.length){G.deck=shuffle(G.discard);G.discard=[];}return G.deck.pop();}
function drawCards(p,n){for(let i=0;i<n;i++){const c=topCard();if(!c)break;p.hand.push(c);}render();}
function afterLose(p){if(has(p,'lianying')&&!p.hand.length&&!p.lyBusy){p.lyBusy=true;log(`${p.g.name}发动【${sk(p,'lianying')}】`);drawCards(p,1);p.lyBusy=false;}}
function removeCard(p,c){p.hand=p.hand.filter(x=>x!==c);G.discard.push(c);afterLose(p);}
function randDiscard(p,why){if(!p.hand.length)return;const c=p.hand[Math.random()*p.hand.length|0];removeCard(p,c);log(`${p.g.name}${why||''}弃置了${cname(c)}`);}
function handLimit(p){return Math.max(0,p.hp)+(has(p,'yinren')?2:0)+(has(p,'jiancheng')?2:0)+(has(p,'songwei')?1:0)+(has(p,'xueyi')?2:0);}
function float(p,txt,cls){if(NET&&NET.role==='host')send({type:'fx',w:p.remote?0:1,txt,cls});const el=$(p.i?'#ai':'#me');const f=document.createElement('div');f.className='float '+cls;f.textContent=txt;el.appendChild(f);setTimeout(()=>f.remove(),900);}
function loseEquip(p,slot,to){const e=p[slot];p[slot]=null;if(to){if(to[slot])G.discard.push(to[slot]);to[slot]=e;}else G.discard.push(e);
 if(has(p,'xiaoji')){log(`${p.g.name}发动【${sk(p,'xiaoji')}】`);drawCards(p,2);}render();return e;}
const canTakeEquip=t=>!has(t,'qicai')&&(t.weapon||t.armor);

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
// 统一选择：AI 用 aiVal
async function choose(p,msg,opts,aiVal){if(p.ai)return aiVal;return ask(p,msg,opts);}
async function yesno(p,msg,aiVal){return choose(p,msg,[{label:'是',val:true},{label:'否',val:false}],aiVal);}
async function pickCard(p,msg,cards,aiCard){if(!cards.length)return null;if(p.ai)return aiCard||cards[0];
 const id=await ask(p,msg,cards.map(c=>({label:cname(c),val:c.id})));return cards.find(c=>c.id===id)||cards[0];}

// 判定：good(c) 表示对被判定者有利
async function judge(p,why,good){let c=topCard();if(!c)return {s:'heart',r:7,k:'zhan'};log(`${p.g.name}【${why}】判定：${cname(c)}`);await sleep(250);
 for(const o of G.P){if(!has(o,'guidao'))continue;const blacks=o.hand.filter(x=>x.s==='spade'||x.s==='club');if(!blacks.length)continue;
  const want=o===p?good:(x=>!good(x));if(want(c))continue;const fit=blacks.filter(want);
  let rep=null;if(o.ai){if(!fit.length)continue;rep=fit[0];}
  else{const id=await ask(o,`【${sk(o,'guidao')}】${p.g.name}的判定为${cname(c)}，打出黑色牌替换？`,blacks.map(x=>({label:cname(x),val:x.id})).concat([{label:'不替换',val:-1}]));rep=blacks.find(x=>x.id===id);if(!rep)continue;}
  o.hand=o.hand.filter(x=>x!==rep);G.discard.push(c);c=rep;afterLose(o);log(`${o.g.name}发动【${sk(o,'guidao')}】改判为${cname(c)}`);}
 G.discard.push(c);render();return c;}

// 拼点
async function pindian(p,t,mine){removeCard(p,mine);if(!t.hand.length){log('对方没有手牌，拼点自动获胜');return {win:true,cards:[mine]};}
 const best=[...t.hand].sort((a,b)=>b.r-a.r)[0];const theirs=await pickCard(t,`${p.g.name}与你拼点，选择一张手牌`,t.hand,best);
 removeCard(t,theirs);log(`拼点：${p.g.name}${cname(mine)} vs ${t.g.name}${cname(theirs)}`);const win=mine.r>theirs.r;log(win?`${p.g.name}拼点赢`:`${p.g.name}拼点没赢`);return {win,cards:[mine,theirs]};}

// 可作为某牌打出的手牌
function asCards(p,k){const h=p.hand;
 if(k==='bi')return h.filter(c=>c.k==='bi'||(has(p,'longdan')&&c.k==='zhan'));
 if(k==='zhan')return h.filter(c=>c.k==='zhan'||(has(p,'longdan')&&c.k==='bi')||(has(p,'chifeng')&&isRed(c)&&c.k!=='yao')||(G.inDuel&&has(p,'mengjin')&&c.k==='bi'));
 return h.filter(c=>c.k===k);}
// 请求某人打出一张某牌（响应）。返回是否打出。
async function respond(p,k,msg){
 if(k==='bi'&&p.armor&&p.armor.k==='tengdun'&&!(G.ignoreArmor)&&!G.fire){if(Math.random()<.4){log(`${p.g.name}的【藤盾】生效，自动抵消！`);float(p,'藤盾','good');await sleep(400);return true;}}
 const list=asCards(p,k);if(!list.length)return false;
 const VALr=c=>c.k===k?1:0;const c=[...list].sort((a,b)=>VALr(b)-VALr(a))[0];
 let use=true;if(!p.ai)use=await ask(p,msg+`（可用${list.length}张）`,[{label:'打出'+cname(c)+(c.k!==k?`当【${cn(k)}】`:''),val:true},{label:'不出',val:false}]);
 if(!use)return false;removeCard(p,c);log(`${p.g.name}打出${cname(c)}${c.k!==k?`当【${cn(k)}】`:''}`);render();await sleep(350);
 if(k==='bi'&&has(p,'leiji')&&!G.over){const t=opp(p);if(await yesno(p,`发动【${sk(p,'leiji')}】令对方判定？`,true)){log(`${p.g.name}发动【${sk(p,'leiji')}】`);const j=await judge(t,sk(p,'leiji'),x=>x.s!=='spade');if(j.s==='spade')await damage(p,t,2,'雷击');}}
 return true;}

function guardCap(t,n){if(G.guardT===t&&t.hp-n<1){const m=Math.max(0,t.hp-1);if(m<n)log(`【护体】${t.g.name}本回合开始时体力全满，不会被一回合击杀（伤害${n}→${m}）`);return m;}return n;}
async function damage(src,t,n,why,card){
 if(G.over)return;if(n>1&&t.armor&&t.armor.k==='linjia'){log(`${t.g.name}的【鳞甲】将伤害减为1`);n=1;}n=guardCap(t,n);if(n<=0)return;
 if(has(t,'tianxiang')){const hs=t.hand.filter(c=>suitOf(t,c)==='heart');if(hs.length){const aiC=[...hs].sort((a,b)=>VAL[a.k]-VAL[b.k])[0];
  const use=await yesno(t,`发动【${sk(t,'tianxiang')}】弃一张♥牌防止${n}点伤害？`,n>=2||t.hp<=n+1||VAL[aiC.k]<=6);
  if(use){const c=t.ai?aiC:await pickCard(t,'弃置哪张♥牌？',hs,aiC);removeCard(t,c);log(`${t.g.name}发动【${sk(t,'tianxiang')}】防止伤害`);if(src&&src!==t)randDiscard(src);drawCards(t,1);render();return;}}}
 t.hp-=n;log(`${t.g.name}受到${n}点伤害${why?'（'+why+'）':''}，体力${t.hp}`);float(t,'-'+n,'bad');shake(t);render();await sleep(450);
 if(t.hp<=0)await dying(t);
 if(G.over)return;
 const s=src&&src!==t?src:null;
 if(has(t,'nafeng')&&why==='斩'&&card&&G.discard.includes(card)){G.discard=G.discard.filter(x=>x!==card);t.hand.push(card);log(`${t.g.name}发动【${sk(t,'nafeng')}】获得${cname(card)}`);}
 if(has(t,'jieming')){log(`${t.g.name}发动【${sk(t,'jieming')}】`);drawCards(t,t.hand.length<t.hp?2:1);}
 if(has(t,'yisuan')){log(`${t.g.name}发动【${sk(t,'yisuan')}】`);drawCards(t,n+1);}
 if(s&&has(t,'yingshi')&&s.hand.length){log(`${t.g.name}发动【${sk(t,'yingshi')}】`);steal(t,s);}
 if(s&&has(t,'fangzhu')){log(`${t.g.name}发动【${sk(t,'fangzhu')}】`);s.drawMinus=(s.drawMinus||0)+1;}
 if(s&&has(t,'enyuan')){const give=s.hand.length?await yesno(s,`【${sk(t,'enyuan')}】交给${t.g.name}一张手牌？（否则失去1点体力）`,s.hp<=2||s.hand.length>=3):false;
  if(give){const c=s.ai?aiDiscardOrder(s)[0]:await pickCard(s,'交出哪张？',s.hand);if(!c)return;s.hand=s.hand.filter(x=>x!==c);t.hand.push(c);afterLose(s);log(`${s.g.name}交给${t.g.name}一张牌`);render();}
  else{log(`${s.g.name}因【${sk(t,'enyuan')}】失去1点体力`);await loseHp(s,1);if(G.over)return;}}
 if(s&&has(t,'liemu')){const j=await judge(t,sk(t,'liemu'),x=>!isRed(x));if(!isRed(j)){const dis=s.hand.length>=2&&await yesno(s,`【${sk(t,'liemu')}】弃置2张手牌？（否则受到1点伤害）`,s.hand.length>=4||s.hp<=1);if(dis){randDiscard(s,'因【烈目】');randDiscard(s,'因【烈目】');}else{await damage(t,s,1,sk(t,'liemu'));if(G.over)return;}}}
 if(s&&why==='斩'&&has(t,'beige')&&t.hand.length&&await yesno(t,`发动【${sk(t,'beige')}】弃1张牌判定？`,true)){
  const c=t.ai?aiDiscardOrder(t)[0]:await pickCard(t,'弃置哪张？',t.hand);removeCard(t,c);const j=await judge(t,sk(t,'beige'),()=>true);
  if(j.s==='heart')await heal(t,1);else if(j.s==='diamond')drawCards(t,2);else if(j.s==='club'){randDiscard(s);randDiscard(s);}else{s.skipPlay=true;log(`${s.g.name}下回合将跳过出牌阶段`);}}
 render();}
async function loseHp(p,n){n=guardCap(p,n);if(n<=0)return;p.hp-=n;float(p,'-'+n,'bad');render();await sleep(300);if(p.hp<=0)await dying(p);}
async function heal(p,n){if(p.hp>=p.maxHp)return;p.hp=Math.min(p.maxHp,p.hp+n);float(p,'+'+n,'good');log(`${p.g.name}回复${n}点体力，体力${p.hp}`);render();await sleep(300);}
async function dying(p){
 const blocked=has(opp(p),'juesha')&&G.cur===opp(p);if(blocked)log(`【${sk(opp(p),'juesha')}】：${p.g.name}不能使用【药】`);
 while(p.hp<=0&&!blocked){
  const c=p.hand.find(x=>x.k==='yao')||(has(p,'jijiu')&&p.hand.find(x=>isRed(x)));
  if(!c)break;
  let use=true;if(!p.ai)use=await ask(p,`你濒死！使用${cname(c)}${c.k!=='yao'?'当【药】':''}救自己吗？`,[{label:'使用',val:true},{label:'放弃',val:false}]);
  if(!use)break;removeCard(p,c);log(`${p.g.name}濒死使用${cname(c)}`);await heal(p,1);}
 if(p.hp<=0&&has(p,'niepan')&&!p.niepanUsed&&await yesno(p,`发动【${sk(p,'niepan')}】？`,true)){p.niepanUsed=true;log(`${p.g.name}发动【${sk(p,'niepan')}】`);
  [...p.hand].forEach(c=>{p.hand=p.hand.filter(x=>x!==c);G.discard.push(c);});['weapon','armor'].forEach(s=>{if(p[s]){G.discard.push(p[s]);p[s]=null;}});p.hp=Math.min(2,p.maxHp);drawCards(p,2);}
 if(p.hp<=0&&has(p,'buqu')){p.buqu=p.buqu||[];const c=topCard();if(c){const dup=p.buqu.some(x=>x.r===c.r)||p.buqu.length>=4;p.buqu.push(c);log(`${p.g.name}【${sk(p,'buqu')}】亮出${cname(c)}${dup?'，点数重复！':'，存活'}`);if(!dup)p.hp=1;}}
 if(p.hp<=0&&!G.over)endGame(opp(p));}
function endGame(w){G.over=true;render();if(NET){send({type:'over',win:w.i===1,name:w.g.name});}const me=w.i===0;const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');if(!AUTO){me?st.w++:st.l++;localStorage.sgStats=JSON.stringify(st);}
 if(window.onGameOver)window.onGameOver(w);
 $('#prompt').classList.add('hide');$('#over').innerHTML=`<h2>${me?'胜利！':'败北…'}</h2><p>${w.g.name} 获胜</p><p>战绩：${st.w} 胜 ${st.l} 负</p><button onclick="location.reload()">再来一局</button>`;$('#over').classList.remove('hide');resolveUser(null);}

// ---- 出牌 ----
function canPlay(p,c){const k=c.k;
 if(k==='bi')return false;
 if(k==='yao')return p.hp<p.maxHp;
 if(k==='zhan'||k==='huozhan')return canZhan(p);
 if(k==='zhangu')return !p.zhanguUsed;
 if(k==='xiuyang')return p.hp<p.maxHp;
 if(k==='tanma')return opp(p).hand.length>0;
 return true;}
function canZhan(p){return !p.noZhan&&p.zhanUsed<zhanLimit(p);}
function zhanLimit(p){if(p.weapon&&p.weapon.k==='liannu')return 99;return (has(p,'baohe')?2:1)+(p.extraZhan||0);}
const BLACK_IMMUNE=(t,c)=>has(t,'weimu')&&c&&!isRed(c)&&CARD_DEFS[c.k].type==='trick';
async function playCard(p,c,as){if(G.over)return;const t=opp(p);removeCard(p,c);const k=as||c.k,D=CARD_DEFS[k];
 log(`${p.g.name}使用${cname(c)}${as?`当【${D.n}】`:''}`);render();await sleep(300);
 if(D.type==='weapon'||D.type==='armor'){const slot=D.type;if(p[slot])G.discard.push(p[slot]);G.discard=G.discard.filter(x=>x!==c);p[slot]=c;if(has(p,'xiaoji')){log(`${p.g.name}发动【${sk(p,'xiaoji')}】`);drawCards(p,2);}render();return;}
 if(D.type==='trick'&&has(p,'jizhi')){log(`${p.g.name}发动【${sk(p,'jizhi')}】`);drawCards(p,1);}
 if(D.type==='trick'&&BLACK_IMMUNE(t,c)){log(`${t.g.name}【${sk(t,'weimu')}】：黑色锦囊无效`);return;}
 if(k==='yao'){await heal(p,1);return;}
 if(k==='zhan'){if(has(p,'chifeng')&&isRed(c)&&!p.chifengFree){p.chifengFree=true;log(`${p.g.name}【${sk(p,'chifeng')}】：红色【斩】不计次数`);}else p.zhanUsed++;await doZhan(p,t,c);return;}
 if(k==='liangcao'){drawCards(p,2);return;}
 if(k==='huozhan'){p.zhanUsed++;G.fire=true;await doZhan(p,t,c);G.fire=false;return;}
 if(k==='zhangu'){p.zhanguUsed=true;p.zhanguOn=true;log(`${p.g.name}擂响【战鼓】：下一张斩伤害+1`);return;}
 if(k==='fengshou'){drawCards(t,1);drawCards(p,2);return;}
 if(k==='jiezi'){t.drawMinus=(t.drawMinus||0)+1;log(`${t.g.name}下个摸牌阶段少摸1张`);return;}
 if(k==='xiuyang'){await heal(p,1);if(t.hp<t.maxHp)await heal(t,1);return;}
 if(k==='tanma'){if(has(t,'qianxun')){log(`${t.g.name}【${sk(t,'qianxun')}】：无效`);return;}if(!t.hand.length)return;const best=[...t.hand].sort((a,b)=>VAL[b.k]-VAL[a.k])[0];const x=p.ai?best:await pickCard(p,'【探马】弃置对方哪张牌？',t.hand,best);removeCard(t,x);log(`${p.g.name}【探马】弃置了${t.g.name}的${cname(x)}`);render();return;}
 if(k==='yexi'){if(has(t,'qianxun')){log(`${t.g.name}【${sk(t,'qianxun')}】：无效`);return;}steal(p,t);return;}
 if(k==='pozhen'){await pozhen(p,t);return;}
 if(k==='jianyu'||k==='fenghuo'){await aoe(p,t,k);return;}
 if(k==='dantiao'){if(has(t,'qianxun')){log(`${t.g.name}【${sk(t,'qianxun')}】：无效`);return;}await duel(p,t);return;}
}
async function pozhen(p,t){if(canTakeEquip(t)){const s=t.weapon&&(!t.armor||Math.random()<.5)?'weapon':'armor';log(`${t.g.name}的【${cn(t[s].k)}】被破坏`);loseEquip(t,s);return true;}randDiscard(t,'被【破阵】');render();return false;}
async function duel(p,t){G.inDuel=true;let cur=t;while(!G.over){const ok=await respond(cur,'zhan',`【单挑】轮到你打出【斩】`);if(!ok){G.inDuel=false;const w=opp(cur);const bonus=w.luozhanOn&&G.cur===w?1:0;if(bonus)log(`${w.g.name}【${sk(w,'luozhan')}】：伤害+1`);await damage(w,cur,1+bonus,'单挑');break;}cur=opp(cur);}G.inDuel=false;}
function steal(p,t){if(!t.hand.length){log('对方没有手牌');return;}const c=t.hand[Math.random()*t.hand.length|0];t.hand=t.hand.filter(x=>x!==c);p.hand.push(c);afterLose(t);log(`${p.g.name}获得了${t.g.name}的一张手牌`);render();}
async function aoe(p,t,k){if(t.armor&&t.armor.k==='tiejia'){log(`${t.g.name}的【玄铁甲】使其无效`);return;}
 const need=k==='jianyu'?'bi':'zhan';const ok=await respond(t,need,`对方对你使用【${cn(k)}】，${k==='jianyu'?'打出':'弃置'}【${cn(need)}】抵消？`);
 if(!ok)await damage(p,t,1,cn(k));}
async function doZhan(p,t,card){
 if(has(t,'kongying')&&t.hand.length===0){log(`${t.g.name}【${sk(t,'kongying')}】：斩无效`);return;}
 G.ignoreArmor=(p.weapon&&p.weapon.k==='pojia')||(has(p,'yicong')&&p.hp>2);
 if(has(t,'yicong')&&t.hp<=2){const j=await judge(t,sk(t,'yicong'),x=>!isRed(x));if(!isRed(j)){log(`${t.g.name}【${sk(t,'yicong')}】：斩无效`);G.ignoreArmor=false;return;}}
 let hard=false;
 if(has(p,'liegong')&&t.hand.length>=p.hp){hard=true;log(`${p.g.name}发动【${sk(p,'liegong')}】：不可闪避`);}
 if(!hard&&has(p,'tieqi')){const j=await judge(p,sk(p,'tieqi'),isRed);if(isRed(j)){hard=true;log(`${p.g.name}【${sk(p,'tieqi')}】：对方不能出避`);}}
 const need=hard?0:(has(p,'lietian')||(has(p,'nuhou')&&p.zhanUsed===2))?2:1;let dodged=need>0;
 for(let i=0;i<need;i++){if(!await respond(t,'bi',`${p.g.name}对你使用【斩】${need>1?`（需${need}张，第${i+1}张）`:''}，打出【避】？`)){dodged=false;break;}if(G.over)return;}
 G.ignoreArmor=false;if(G.over)return;
 if(dodged){if(has(p,'huxiao')&&!p.huxiaoUsed){p.huxiaoUsed=true;p.extraZhan=(p.extraZhan||0)+1;drawCards(p,1);log(`${p.g.name}【${sk(p,'huxiao')}】：摸1张牌并可多出一张斩`);}
  if(p.weapon&&p.weapon.k==='zhongchui')randDiscard(t,'受【流星锤】');
  if(p.weapon&&p.weapon.k==='shuangren'&&p.hand.length>=2&&!G.over){const two=aiDiscardOrder(p).slice(0,2);if(await yesno(p,'【双刃戟】弃2张手牌令此斩仍造成1点伤害？',t.hp<=2||VAL[two[1].k]<=6)){two.forEach(x=>removeCard(p,x));log(`${p.g.name}发动【双刃戟】`);await damage(p,t,1,'双刃戟',card);}}
  render();return;}
 let n=1;if(p.zhanguOn){p.zhanguOn=false;n++;log(`${p.g.name}【战鼓】：伤害+1`);}if(G.fire&&t.armor&&t.armor.k==='tengdun'){n++;log(`【火斩】点燃【藤盾】：伤害+1`);}if(p.luozhanOn){n++;log(`${p.g.name}【${sk(p,'luozhan')}】：伤害+1`);}
 if(p.tianyiBonus){n++;p.tianyiBonus=0;log(`${p.g.name}【${sk(p,'tianyi')}】：伤害+1`);}
 await damage(p,t,n,'斩',card);if(G.over)return;
 if(p.weapon&&p.weapon.k==='changqiang'){log(`${p.g.name}【长枪】摸1张`);drawCards(p,1);}
 if(has(p,'kuanggu')&&!p.yinxue&&p.hp<p.maxHp){p.yinxue=true;log(`${p.g.name}发动【${sk(p,'kuanggu')}】`);await heal(p,1);}
 if(has(p,'baonue')){const j=await judge(p,sk(p,'baonue'),x=>!isRed(x));if(!isRed(j))await heal(p,1);}}

// ---- 主动技能 ----
const lowVal=p=>aiDiscardOrder(p);
const ACTIVES={
 xieling:{can:p=>opp(p).hand.length>0,need:0,async run(p){const t=opp(p);const c=t.hand[Math.random()*t.hand.length|0];log(`${p.g.name}展示了${t.g.name}的${cname(c)}`);
  if(c.k==='zhan'||c.k==='bi'){t.hand=t.hand.filter(x=>x!==c);p.hand.push(c);afterLose(t);log(`${p.g.name}获得之`);}else{drawCards(t,1);log(`${t.g.name}摸1张牌`);}render();}},
 ezhan:{can:p=>!!p.weapon||p.hp>1,need:0,async run(p){let w=!!p.weapon;if(w&&p.hp>1)w=await yesno(p,'弃置武器？（否则失去1点体力）',p.hp<=2);
  if(w){log(`${p.g.name}弃置了武器`);G.discard.push(p.weapon);p.weapon=null;render();}else await loseHp(p,1);if(G.over)return;
  const t=opp(p);if(!await respond(t,'bi',`【恶战】打出【避】？`)){await damage(p,t,1,sk(p,'ezhan'));if(!G.over)drawCards(p,1);}}},
 quce:{can:p=>p.hand.length>=1,need:1,async run(p,cards){const r=await pindian(p,opp(p),cards[0]);if(r.win){const c=r.cards[1]||r.cards.find(x=>x!==cards[0]);if(c){G.discard=G.discard.filter(x=>x!==c);p.hand.push(c);}log(`${p.g.name}获得对方的拼点牌`);}else randDiscard(p);render();}},
 duanliang:{times:2,can:p=>p.hand.some(ACT_F.duanliang),need:1,filter:c=>ACT_F.duanliang(c),async run(p,cards){removeCard(p,cards[0]);log(`${p.g.name}将${cname(cards[0])}当【破阵】`);const t=opp(p);if(await pozhen(p,t)){t.drawMinus=(t.drawMinus||0)+1;log(`${t.g.name}下回合少摸1张`);}}},
 renwang:{can:p=>p.hand.length>=2,need:2,async run(p,cards){cards.forEach(c=>removeCard(p,c));const h=p.hp<p.maxHp&&await yesno(p,'回复1点体力？（否则摸3张）',p.hp<=2);if(h)await heal(p,1);else drawCards(p,3);}},
 chifeng:{times:99,can:p=>canZhan(p)&&p.hand.some(ACT_F.chifeng),need:1,filter:c=>ACT_F.chifeng(c),async run(p,cards){await playCard(p,cards[0],'zhan');},silent:true},
 longdan:{times:99,can:p=>canZhan(p)&&p.hand.some(c=>c.k==='bi'),need:1,filter:c=>c.k==='bi',async run(p,cards){await playCard(p,cards[0],'zhan');},silent:true},
 qimou:{limited:true,can:p=>p.hp>1,need:0,async run(p){const max=p.hp-1;const zh=p.hand.filter(c=>c.k==='zhan').length;
  const x=p.ai?Math.max(1,Math.min(max,zh-1,p.hp-2)):await ask(p,'失去几点体力？',Array.from({length:max},(_,i)=>({label:String(i+1),val:i+1})));
  p.extraZhan=(p.extraZhan||0)+x;log(`${p.g.name}失去${x}点体力，本回合多出${x}张斩`);await loseHp(p,x);}},
 lianhuan:{can:p=>p.hand.some(c=>c.s==='club')&&opp(p).hand.length,need:1,filter:c=>c.s==='club',async run(p,cards){removeCard(p,cards[0]);randDiscard(opp(p),'被【连环】');}},
 tiaoxin:{can:p=>true,need:0,async run(p){const t=opp(p);const ok=await respond(t,'zhan',`${p.g.name}【挑衅】：对其使用【斩】？（否则被弃牌）`);
  if(ok){await doZhan(t,p,null);}else{randDiscard(t,'被【挑衅】');}}},
 xuanhuo:{can:p=>p.hand.some(c=>c.k==='yao')&&opp(p).hand.length,need:1,filter:c=>c.k==='yao',async run(p,cards){removeCard(p,cards[0]);steal(p,opp(p));steal(p,opp(p));}},
 zhiheng:{can:p=>p.hand.length>=1,needAny:true,need:1,async run(p,cards){const all=cards.length===p.hand.length;cards.forEach(c=>removeCard(p,c));drawCards(p,cards.length+(all?1:0));if(all)log(`${p.g.name}【${sk(p,'zhiheng')}】弃置全部手牌，额外摸1张`);}},
 fanjian:{can:p=>p.hand.length>=1,need:1,async run(p,cards){const t=opp(p);const c=cards[0];
  const g=await choose(t,`【反间】猜${p.g.name}扣置的这张牌是什么颜色？`,[{label:'红色',val:'red'},{label:'黑色',val:'black'}],Math.random()<.5?'red':'black');
  p.hand=p.hand.filter(x=>x!==c);const real=isRed(c)?'red':'black';const right=real===g;if(right)t.hand.push(c);else G.discard.push(c);afterLose(p);log(`${t.g.name}猜${g==='red'?'红色':'黑色'}，${right?'猜对，获得':'猜错，弃置'}${cname(c)}`);
  if(!right)await damage(p,t,1,sk(p,'fanjian'));render();}},
 qixi:{times:99,can:p=>p.hand.some(c=>!isRed(c)),need:1,filter:c=>!isRed(c),async run(p,cards){removeCard(p,cards[0]);log(`${p.g.name}将${cname(cards[0])}当【破阵】`);await pozhen(p,opp(p));if(has(p,'jieying')&&p.jieyingT!==G.turnNo){p.jieyingT=G.turnNo;log(`${p.g.name}【${sk(p,'jieying')}】摸1张牌`);drawCards(p,1);}}},
 jieyin:{can:p=>p.hand.length>=2&&p.hp<p.maxHp,need:2,async run(p,cards){cards.forEach(c=>removeCard(p,c));await heal(p,1);drawCards(p,1);}},
 dimeng:{can:p=>p.hand.length>=1,need:1,async run(p,cards){removeCard(p,cards[0]);const t=opp(p);[p.hand,t.hand]=[t.hand,p.hand];log(`${p.g.name}与${t.g.name}交换了手牌`);afterLose(p);afterLose(t);render();}},
 gongxin:{can:p=>opp(p).hand.length>0,need:0,async run(p){const t=opp(p);const best=[...t.hand].sort((a,b)=>VAL[b.k]-VAL[a.k])[0];const c=await pickCard(p,`${t.g.name}的手牌，选一张弃置`,t.hand,best);removeCard(t,c);log(`${t.g.name}被弃置了${cname(c)}`);render();}},
 tianyi:{can:p=>p.hand.length>=1&&opp(p).hand.length>0,need:1,async run(p,cards){const r=await pindian(p,opp(p),cards[0]);if(r.win){p.extraZhan=(p.extraZhan||0)+1;p.tianyiBonus=1;}else p.noZhan=true;render();}},
 kurou:{times:2,can:p=>p.hp>1,need:0,async run(p){await loseHp(p,1);drawCards(p,2);if(has(p,'zhaxiang')&&!p.zhaxiangOn){p.zhaxiangOn=true;p.extraZhan=(p.extraZhan||0)+1;log(`${p.g.name}【${sk(p,'zhaxiang')}】：多出一张斩`);}}},
 guose:{can:p=>p.hand.some(c=>c.s==='diamond')&&!opp(p).guose,need:1,filter:c=>c.s==='diamond',async run(p,cards){removeCard(p,cards[0]);opp(p).guose=true;log(`${opp(p).g.name}下回合需判定【国色】`);}},
 qingnang:{can:p=>p.hand.length>=1&&p.hp<p.maxHp,need:1,async run(p,cards){removeCard(p,cards[0]);await heal(p,1);}},
 lihun:{can:p=>p.hand.length>=1,need:1,async run(p,cards){removeCard(p,cards[0]);const t=opp(p);if(has(t,'qianxun')){log('【谦逊】：无效');return;}await duel(p,t);}},
 luanji:{times:2,can:p=>p.hand.filter(isRed).length>=2||p.hand.filter(x=>!isRed(x)).length>=2,need:2,valid:cs=>isRed(cs[0])===isRed(cs[1]),async run(p,cards){cards.forEach(c=>removeCard(p,c));log(`${p.g.name}将两张牌当【箭雨】`);const t=opp(p),h=t.hp;await aoe(p,t,'jianyu');if(!G.over&&t.hp<h){log(`${p.g.name}【乱击】命中，摸2张牌`);drawCards(p,2);}}},
 yandou:{can:p=>p.hand.some(c=>c.k==='zhan'),need:1,filter:c=>c.k==='zhan',async run(p,cards){removeCard(p,cards[0]);const t=opp(p);if(has(t,'qianxun')){log('【谦逊】：无效');return;}await duel(p,t);}},
 xionglie:{limited:true,can:p=>true,need:0,async run(p){drawCards(p,3);drawCards(opp(p),3);await heal(p,1);p.extraZhan=(p.extraZhan||0)+1;}},
};
const ACT_F={duanliang:c=>c.k==='yao'||['weapon','armor'].includes(CARD_DEFS[c.k].type),chifeng:c=>isRed(c)&&c.k!=='yao'&&c.k!=='zhan'};
const GONGXIN={n:'攻心',k:'gongxin',active:true,t:'出牌阶段限一次：观看对方手牌并弃置其中一张。'};
const ZHANXING={n:'占星',k:'zhanxing',t:'摸牌阶段开始时，观看牌堆顶3张牌，可以将其中任意1张置于牌堆底。'};
function activeOf(p){const s=skillsOf(p).find(s=>s.active);return s?{s,a:ACTIVES[s.k]}:null;}
function usedUp(p,act){if(act.a.limited)return !!(p.limitUsed||{})[act.s.k];return ((p.used||{})[act.s.k]||0)>=(act.a.times||1);}
function markUsed(p,act){p.used=p.used||{};p.used[act.s.k]=(p.used[act.s.k]||0)+1;if(act.a.limited){p.limitUsed=p.limitUsed||{};p.limitUsed[act.s.k]=true;}}
function validSel(act,cs){if(act.a.needAny?cs.length<1:cs.length!==act.a.need)return false;if(act.a.filter&&!cs.every(act.a.filter))return false;if(act.a.valid&&!act.a.valid(cs))return false;return true;}

// ---- 回合 ----
const FATIGUE_T=20;// 第11轮起每回合开始失去1点体力，防止拖局
async function turn(p){if(G.over)return;G.cur=p;Object.assign(p,{zhanUsed:0,used:{},extraZhan:0,yinxue:false,huxiaoUsed:false,luozhanOn:false,tianyiBonus:0,noZhan:false,zhaxiangOn:false,chifengFree:false,zhanguUsed:false,zhanguOn:false});G.turnNo++;G.guardT=opp(p).hp>=opp(p).maxHp?opp(p):null;if(window.HARNESS)window.__oppFull=opp(p).hp>=opp(p).maxHp;
 log(`—— 第${G.turnNo}回合：${p.g.name} ——`);render();const t=opp(p);
 if(G.turnNo>FATIGUE_T){log(`【兵疲】${p.g.name}失去1点体力`);await loseHp(p,1);if(G.over)return;}
 if(has(p,'zhiji')&&!p.woke&&!p.hand.length){p.woke=true;p.maxHp--;p.hp=Math.min(p.hp,p.maxHp);log(`${p.g.name}觉醒【${sk(p,'zhiji')}】`);await heal(p,1);drawCards(p,2);p.gained=[ZHANXING];}
 if(has(p,'qinxue')&&!p.woke&&(p.kejiN||0)>=2){p.woke=true;p.maxHp--;p.hp=Math.min(p.hp,p.maxHp);log(`${p.g.name}觉醒【${sk(p,'qinxue')}】，获得【攻心】`);drawCards(p,2);p.gained=[GONGXIN];if(p.hp<=0){await dying(p);if(G.over)return;}}
 if(has(p,'tiegu')&&p.hp<t.hp){log(`${p.g.name}发动【${sk(p,'tiegu')}】`);drawCards(p,1);}
 if(p.guose){p.guose=false;const j=await judge(p,'国色',x=>x.s==='heart');if(j.s!=='heart'){p.skipPlay=true;log(`${p.g.name}将跳过出牌阶段`);}}
 // 摸牌阶段
 let n=2+(has(p,'yingfa')?1:0)+(has(p,'haoshi')?2:0)-(p.drawMinus||0);p.drawMinus=0;
 if(has(p,'zhanxing')){const top=G.deck.slice(-3);if(top.length){const worst=[...top].sort((a,b)=>VAL[a.k]-VAL[b.k])[0];
  const id=p.ai?(VAL[worst.k]<=5?worst.id:-1):await ask(p,`【占星】牌堆顶（最上方在前）：选一张置底`,top.slice().reverse().map(c=>({label:cname(c),val:c.id})).concat([{label:'不调整',val:-1}]));
  const c=top.find(x=>x.id===id);if(c){G.deck=G.deck.filter(x=>x!==c);G.deck.unshift(c);log(`${p.g.name}【占星】将一张牌置于牌堆底`);}}}
 if(has(p,'qiaobian')&&n>0&&(canTakeEquip(t)||t.hand.length)&&await yesno(p,`发动【${sk(p,'qiaobian')}】少摸1张，夺取对方装备/手牌？`,!!canTakeEquip(t)||t.hand.length>=4)){
  n--;log(`${p.g.name}发动【${sk(p,'qiaobian')}】`);
  if(canTakeEquip(t)){const sl=t.weapon?'weapon':'armor';const e=loseEquip(t,sl,p);log(`${p.g.name}夺得【${cn(e.k)}】`);}else steal(p,t);}
 if(has(p,'yeben')&&n>0&&t.hand.length&&await yesno(p,`发动【${sk(p,'yeben')}】少摸1张，获得对方一张随机手牌？`,t.hand.length>=2)){n--;log(`${p.g.name}发动【${sk(p,'yeben')}】`);steal(p,t);}
 if(has(p,'luozhan')&&n>0&&await yesno(p,`发动【${sk(p,'luozhan')}】少摸1张，本回合【斩】伤害+1？`,p.hand.some(c=>c.k==='zhan'))){n--;p.luozhanOn=true;log(`${p.g.name}发动【${sk(p,'luozhan')}】`);}
 drawCards(p,Math.max(0,n));
 if(has(p,'haoshi')&&p.hand.length>5){const k=p.hand.length>>1;for(let i=0;i<k;i++){const c=p.hand[Math.random()*p.hand.length|0];p.hand=p.hand.filter(x=>x!==c);t.hand.push(c);}log(`${p.g.name}【${sk(p,'haoshi')}】交给对方${k}张牌`);render();}
 await sleep(300);
 if(p.skipPlay){p.skipPlay=false;log(`${p.g.name}跳过出牌阶段`);}
 else if(p.ai)await aiPlay(p);else if(p.remote)await remotePlay(p);else await humanPlay(p);
 if(G.over)return;
 if(has(p,'keji')&&p.zhanUsed===0){p.kejiN=(p.kejiN||0)+1;log(`${p.g.name}【${sk(p,'keji')}】跳过弃牌阶段`);}else await discardPhase(p);
 if(has(p,'biyue')&&p.hand.length<2){log(`${p.g.name}发动【${sk(p,'biyue')}】`);drawCards(p,1);}
 if(has(p,'wanyue')&&p.hand.length<t.hand.length){log(`${p.g.name}发动【${sk(p,'wanyue')}】`);drawCards(p,1);}
 if(has(p,'tianji')&&p.hand.length<1){log(`${p.g.name}发动【${sk(p,'tianji')}】`);drawCards(p,1);}
 if(has(p,'hujia')){const j=await judge(p,sk(p,'hujia'),x=>!isRed(x));if(!isRed(j)){G.discard=G.discard.filter(x=>x!==j);p.hand.push(j);log(`${p.g.name}获得判定牌`);render();}}
 if(has(p,'jushou')&&await yesno(p,`发动【${sk(p,'jushou')}】摸3张，跳过下回合出牌阶段？`,p.hand.length<=1&&p.hp>=2)){log(`${p.g.name}发动【${sk(p,'jushou')}】`);drawCards(p,3);p.skipPlay=true;}
 if(has(p,'benghuai')&&p.hp>=t.hp+2){const mx=p.maxHp>p.hp&&await yesno(p,`【${sk(p,'benghuai')}】减1点体力上限？（否则失去1点体力）`,true);
  if(mx){p.maxHp--;log(`${p.g.name}【崩坏】体力上限-1`);render();}else{log(`${p.g.name}【崩坏】失去1点体力`);await loseHp(p,1);}}
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
 if(p.ai){const order=aiDiscardOrder(p);for(let i=0;i<over;i++){p.hand=p.hand.filter(x=>x!==order[i]);G.discard.push(order[i]);}log(`${p.g.name}弃置${over}张牌`);render();return;}
 G.phase='discard';G.sel=[];G.needSel=over;render();await waitUser();
 G.sel.forEach(c=>{p.hand=p.hand.filter(x=>x!==c);G.discard.push(c);});log(`${p.g.name}弃置${over}张牌`);G.sel=[];G.phase='';render();}

// ---- AI ----
const VAL={bi:9,yao:10,zhan:6,yexi:7,liangcao:7,fenghuo:5,jianyu:6,pozhen:5,dantiao:5,liannu:4,pojia:4,zhongchui:4,tengdun:5,tiejia:5,huozhan:6,zhangu:4,fengshou:7,tanma:6,jiezi:5,xiuyang:6,changqiang:4,shuangren:4,linjia:5};
function aiDiscardOrder(p){return [...p.hand].sort((a,b)=>VAL[a.k]-VAL[b.k]);}
async function aiPlay(p){const t=opp(p);
 for(let guard=0;guard<40&&!G.over;guard++){await sleep(450);
  const act=activeOf(p);
  if(act&&!usedUp(p,act)&&act.a.can(p)&&aiWantSkill(p,act.s.k)){const sel=aiSel(p,act);if(sel&&validSel(act,sel)||(sel&&act.a.need===0&&!act.a.needAny)){markUsed(p,act);if(!act.a.silent)log(`${p.g.name}发动【${act.s.n}】`);await act.a.run(p,sel);render();continue;}}
  const pick=aiChoose(p,t);if(!pick)break;await playCard(p,pick);}
}
function aiSel(p,act){const a=act.a;if(act.s.k==='luanji'){const by={};for(const c of aiDiscardOrder(p))(by[isRed(c)]=by[isRed(c)]||[]).push(c);const g=Object.values(by).find(v=>v.length>=2);return g?g.slice(0,2):null;}if(act.s.k==='luanji'||act.s.k==='fanjian'){}
 if(act.s.k==='zhiheng'){const cs=p.hand.filter(c=>VAL[c.k]<=5||(c.k==='zhan'&&!canZhan(p)));return cs.length?cs:null;}
 if(act.s.k==='quce'||act.s.k==='tianyi'){const c=[...p.hand].sort((a,b)=>b.r-a.r)[0];return [c];}
 let pool=aiDiscardOrder(p).filter(a.filter||(()=>true));if(act.s.k==='qixi'){const zh=p.hand.filter(c=>c.k==='zhan').length;pool=pool.filter(c=>!['pozhen','bi','yao'].includes(c.k)&&(c.k!=='zhan'||zh>=2||!canZhan(p)));}if(pool.length<a.need)return null;return pool.slice(0,a.need);}
function aiWantSkill(p,id){const t=opp(p);const zh=p.hand.filter(c=>c.k==='zhan').length;switch(id){
 case 'xieling':return true;case 'ezhan':return p.weapon?true:p.hp>=3;case 'quce':return Math.max(...p.hand.map(c=>c.r))>=10;
 case 'duanliang':return !!canTakeEquip(t)||p.hand.some(c=>c.k!=='yao'&&ACT_F.duanliang(c));
 case 'renwang':return p.hand.length>=3||p.hp<=2;case 'chifeng':return !p.hand.some(c=>c.k==='zhan');case 'longdan':return !p.hand.some(c=>c.k==='zhan')&&(p.hand.filter(c=>c.k==='bi').length>=2||t.hp<=1);
 case 'qimou':return p.hp>=3&&zh>=2;case 'lianhuan':return true;case 'tiaoxin':return t.hand.length<=2||p.hp>=3;
 case 'xuanhuo':return t.hand.length>=3&&p.hp>=2;case 'zhiheng':return true;case 'fanjian':return p.hand.some(c=>!['bi','yao'].includes(c.k));
 case 'qixi':return (!!canTakeEquip(t)||t.hand.length>=1)&&!!aiSel(p,{a:ACTIVES.qixi,s:{k:'qixi'}});case 'jieyin':return true;case 'dimeng':return t.hand.length>=p.hand.length+2;
 case 'gongxin':return true;case 'tianyi':return zh>=1&&Math.max(...p.hand.map(c=>c.r))>=9;case 'kurou':return p.hp>=3||(p.hp>=2&&p.hand.some(c=>c.k==='yao'));
 case 'guose':return true;case 'qingnang':return true;case 'lihun':return zh>=1||t.hand.length<=1;case 'luanji':return p.hand.filter(c=>!['zhan','bi','yao'].includes(c.k)).length>=2||p.hand.length>=5;
 case 'yandou':return zh>=2||t.hand.length<=1;case 'xionglie':return p.hp<=2||G.turnNo>=6;}return false;}
function aiChoose(p,t){const h=p.hand;const f=k=>h.find(c=>c.k===k&&canPlay(p,c));
 if(p.hp<p.maxHp&&f('yao')&&(p.hp<=2||h.filter(c=>c.k==='yao').length>1))return f('yao');
 for(const k of ['liangcao','fengshou','yexi','tanma'])if(f(k)&&(!['yexi','tanma'].includes(k)||t.hand.length))return f(k);
 if(f('jiezi'))return f('jiezi');
 if(f('xiuyang')&&p.hp<=2&&p.maxHp-p.hp>=t.maxHp-t.hp)return f('xiuyang');
 for(const k of ['liannu','pojia','changqiang','shuangren','zhongchui'])if(f(k)&&!p.weapon)return f(k);
 for(const k of ['linjia','tengdun','tiejia'])if(f(k)&&!p.armor)return f(k);
 if(f('pozhen')&&(canTakeEquip(t)||t.hand.length))return f('pozhen');
 if(f('jianyu')&&!(t.armor&&t.armor.k==='tiejia'))return f('jianyu');
 if(f('fenghuo')&&!(t.armor&&t.armor.k==='tiejia'))return f('fenghuo');
 if(f('dantiao')&&h.filter(c=>c.k==='zhan').length>=2)return f('dantiao');
 const zk=()=>f('huozhan')&&t.armor&&t.armor.k==='tengdun'?f('huozhan'):(f('zhan')||f('huozhan'));
 if(zk()&&!(has(t,'kongying')&&!t.hand.length)){if(f('zhangu')&&!p.zhanguOn)return f('zhangu');return zk();}
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
function render(){if(!G.P)return;if(window.HARNESS){for(const p of G.P)if(p.hand.some(c=>!c))throw new Error('undef card '+p.g.id+' '+new Error().stack);}if(NET&&NET.role==='host'&&G.P[1].remote)send(snap());const [me,ai]=G.P;
 $('#ai').innerHTML=seat(ai);$('#me').innerHTML=seat(me);
 $('#aihand').innerHTML=ai.hand.map(()=>'<div class="card back"></div>').join('');
 $('#deckinfo').textContent=`牌堆 ${G.deck.length}　弃牌 ${G.discard.length}`;
 const hand=$('#hand');hand.innerHTML='';
 for(const c of me.hand){const D=CARD_DEFS[c.k];const el=document.createElement('div');el.className=`card ${D.type} k-${c.k}`;el.innerHTML=`<b>${D.n}</b><i class="suit ${isRed(c)?'red':''}">${cs(c)}</i><small>${D.t}</small>`;el.title=D.t;
  if(G.phase==='play'&&G.cur===me&&canPlay(me,c)){el.classList.add('ok');el.onclick=()=>resolveUser({t:'card',c});}
  if(G.phase==='discard'||G.phase==='skill'){const okc=!G.selFilter||G.selFilter(c);if(okc)el.classList.add('ok');if(G.sel.includes(c))el.classList.add('sel');el.onclick=()=>{if(!okc)return;G.sel.includes(c)?G.sel=G.sel.filter(x=>x!==c):G.sel.length<G.needSel&&G.sel.push(c);render();};}
  hand.appendChild(el);}
 const bar=$('#actions');bar.innerHTML='';
 if(G.over)return;
 const btn=(t,fn,dis)=>{const b=document.createElement('button');b.textContent=t;b.disabled=!!dis;b.onclick=fn;bar.appendChild(b);};
 if(G.phase==='play'&&G.cur===me){const act=activeOf(me);
  if(act)btn(`技能·${act.s.n}`,()=>startSkill(me,act),usedUp(me,act)||!act.a.can(me));
  btn('结束出牌',()=>resolveUser({t:'end'}));}
 if(G.phase==='discard')btn(`弃牌 ${G.sel.length}/${G.needSel}`,()=>resolveUser(true),G.sel.length!==G.needSel);
 if(G.phase==='skill'){btn(`确认 ${G.sel.length}${G.selAct&&G.selAct.a.needAny?'':'/'+G.needSel}`,()=>{const cards=G.sel;G.sel=[];G.selFilter=null;G.phase='busy';G.skillDone(cards);},!(G.selAct&&validSel(G.selAct,G.sel)));btn('取消',()=>{G.sel=[];G.selFilter=null;G.phase='play';render();});}
 if(!G.phase||G.cur!==me)bar.innerHTML='<span class="wait">'+(G.cur===me?'…':(NET?'对手思考中…':'AI 思考中…'))+'</span>';
}
function startSkill(p,act){const go=cards=>{if(NET&&NET.role==='guest'){resolveUser({t:'skill',cids:cards.map(c=>c.id)});return;}markUsed(p,act);if(!act.a.silent)log(`${p.g.name}发动【${act.s.n}】`);resolveUser({t:'skill',run:()=>act.a.run(p,cards)});};
 if(!act.a.need){go([]);return;}
 G.phase='skill';G.sel=[];G.selAct=act;G.needSel=act.a.needAny?p.hand.length:act.a.need;G.selFilter=act.a.filter||null;G.skillDone=go;render();}

// ---- 联机（PeerJS，房主权威） ----
let NET=null,rpending=null;
function send(m){if(NET&&NET.conn&&NET.conn.open)NET.conn.send(m);}
function waitRemote(f){return new Promise(r=>rpending={r,f});}
function snap(){const R=G.P[1];const v=p=>({i:p===R?0:1,id:p.g.id,hp:p.hp,maxHp:p.maxHp,hand:p===R?p.hand:p.hand.length,weapon:p.weapon,armor:p.armor,zhanUsed:p.zhanUsed,extraZhan:p.extraZhan,used:p.used,limitUsed:p.limitUsed,gained:p.gained,noZhan:p.noZhan});
 return {type:'state',P:[v(R),v(G.P[0])],cur:G.cur===R?0:G.cur?1:-1,phase:G.rphase||'',need:G.rneed||0,deck:G.deck.length,disc:G.discard.length,over:G.over};}
async function remotePlay(p){
 while(!G.over){G.rphase='play';render();const a=await waitRemote(a=>['card','skill','end'].includes(a.t));if(G.over)break;
  if(a.t==='end')break;
  if(a.t==='card'){const c=p.hand.find(x=>x.id===a.cid);if(c&&canPlay(p,c)){G.rphase='busy';render();await playCard(p,c);}}
  if(a.t==='skill'){const act=activeOf(p);if(act&&!usedUp(p,act)&&act.a.can(p)){const cs=(a.cids||[]).map(id=>p.hand.find(x=>x.id===id)).filter(Boolean);
   if(validSel(act,cs)||(act.a.need===0&&!act.a.needAny)){markUsed(p,act);if(!act.a.silent)log(`${p.g.name}发动【${act.s.n}】`);G.rphase='busy';render();await act.a.run(p,cs);}}}}
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
 const mk=(i,gg,ai)=>({i,g:gg,ai,hp:gg.hp,maxHp:gg.hp,hand:[],weapon:null,armor:null,zhanUsed:0,used:{},gained:[]});
 Object.assign(G,{deck:buildDeck(),discard:[],P:[mk(0,g,AUTO),mk(1,ag,!net)],over:false,turnNo:0,phase:'',sel:[]});
 if(net)G.P[1].remote=true;
 log(net?`房主选择了${g.name}，对手选择了${ag.name}`:`你选择了${g.name}，AI 选择了${ag.name}`);
 G.P.forEach(p=>drawCards(p,4));
 let cur=Math.random()<.5?0:1;log(`${G.P[cur].g.name} 先手`);
 while(!G.over){await turn(G.P[cur]);cur=1-cur;}}
function initLobby(){const room=new URLSearchParams(location.search).get('room');
 $('#pve').onclick=()=>{selectScreen();};$('#host').onclick=()=>{$('#modes').classList.add('hide');hostRoom();};
 if(room)joinRoom(room.toUpperCase());else selectScreen();}
$('#rules').onclick=()=>$('#ruleBox').classList.toggle('hide');
$('#ruleBox').innerHTML='<h3>规则</h3><p>回合：摸2张 → 出牌 → 弃牌至手牌上限（=当前体力）。把对方体力打到0即获胜。双方起手4张。</p><p><b>花色与判定</b>：每张牌有花色（♠♥♣♦）与点数（A–K），判定=亮出牌堆顶一张牌；拼点=双方各出一张手牌比点数。</p><p><b>护体</b>：回合开始时对方体力全满，则本回合无法将其击杀（至多打到1）。</p><p><b>兵疲</b>：第21回合起，每名角色回合开始时失去1点体力。</p>'+Object.values(CARD_DEFS).map(d=>`<p><b>【${d.n}】</b>×${d.cnt} ${d.t}</p>`).join('');
initLobby();
const AUTO=/auto/.test(location.search);if(AUTO&&!window.HARNESS){window.onerror=e=>document.title="ERR "+e;window.onunhandledrejection=e=>document.title="ERR "+(e.reason&&e.reason.stack||e.reason);window.onGameOver=w=>{if(!/^ERR/.test(document.title))document.title="OVER "+w.g.id+" T"+G.turnNo;};{const g=GENERALS[+(location.search.split("g=")[1]||0)];const pool=GENERALS.filter(x=>x!==g);start(g,pool[Math.random()*pool.length|0],false);}}
