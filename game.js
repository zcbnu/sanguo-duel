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
function log(t){if(window.HARNESS){(window.LOGS=window.LOGS||[]).push(t);if(LOGS.length>(window.LOGMAX||30))LOGS.shift();return;}if(NET&&NET.role==='host')send({type:'log',t});const el=$('#log');const d=document.createElement('div');d.textContent=t;el.prepend(d);if(NET&&NET.role==='guest')return;const name=fxSkillName(t);if(!name)return;paintSkill(name);if(NET&&NET.role==='host')send({type:'fx',kind:'skill',name});}
function fxSkillName(t){const a=/发动【([^】]*)】/.exec(t);if(a)return a[1];const b=/觉醒【([^】]*)】/.exec(t);return b?b[1]:'';}
function opp(p){return G.P[1-p.i];}
function topCard(){if(!G.deck.length){G.deck=shuffle(G.discard);G.discard=[];}return G.deck.pop();}
function drawCards(p,n){for(let i=0;i<n;i++){const c=topCard();if(!c)break;p.hand.push(c);}render();}
function afterLose(p){if(has(p,'lianying')&&!p.hand.length&&!p.lyBusy){p.lyBusy=true;log(`${p.g.name}发动【${sk(p,'lianying')}】`);drawCards(p,1);p.lyBusy=false;}}
function removeCard(p,c){p.hand=p.hand.filter(x=>x!==c);G.discard.push(c);afterLose(p);}
function randDiscard(p,why){if(!p.hand.length)return;const c=p.hand[Math.random()*p.hand.length|0];removeCard(p,c);log(`${p.g.name}${why||''}弃置了${cname(c)}`);}
function handLimit(p){return Math.max(0,p.hp)+(has(p,'yinren')?2:0)+(has(p,'jiancheng')?2:0)+(has(p,'songwei')?1:0)+(has(p,'xueyi')?2:0)+(has(p,'tunken')?Math.min(2,p.tian||0):0)+(p.quan||0)-(p.wzMinus||0);}
// 特效都挂在 #fxLayer。座位重绘不碰这一层。超过 12 个子节点时先去掉最旧的一个。
function fxTrim(layer){if(layer.childNodes.length>12)layer.removeChild(layer.firstChild);}
function fxHold(layer,node,ms){setTimeout(()=>{if(node.parentNode===layer)node.remove();},ms);}
function clearFx(){const layer=$('#fxLayer');if(!layer)return;while(layer.firstChild)layer.removeChild(layer.firstChild);}
function paintFloat(p,txt,cls){if(window.HARNESS||!p)return;const layer=$('#fxLayer');if(!layer)return;fxTrim(layer);const n=layer.querySelectorAll('.float').length;const f=document.createElement('div');f.className='float '+cls+' '+(p.i===0?'to-me':'to-ai');f.textContent=txt;if(f.style)f.style.right=(12+n*36)+'px';layer.appendChild(f);fxHold(layer,f,900);}
function float(p,txt,cls){if(window.HARNESS)return;if(NET&&NET.role==='host')send({type:'fx',kind:'float',w:p.remote?0:1,txt,cls});paintFloat(p,txt,cls);}
function fxTrack(key){const D=CARD_DEFS[key];if(!D)return null;if(key==='zhangu')return {cls:'track-zhan track-drum',ms:800,pip:'zhan'};if(key==='zhan'||key==='huozhan')return {cls:'track-zhan',ms:900,pip:'zhan'};if(key==='bi')return {cls:'track-bi',ms:700,pip:'bi'};if(key==='yao')return {cls:'track-yao',ms:1000,pip:'yao'};if(D.type==='trick')return {cls:'track-trick',ms:1200,pip:'trick'};if(D.type==='weapon'||D.type==='armor')return {cls:'track-equip',ms:800,pip:'equip'};return null;}
function paintFxCard(p,key,suit,red,faceDown){if(window.HARNESS||!p)return;const layer=$('#fxLayer'),D=CARD_DEFS[key],tr=D&&fxTrack(key);if(!layer||!tr)return;if(faceDown){suit='';red=false;}fxTrim(layer);const el=document.createElement('div');const paper=D.type==='trick'?' paper-trick':(D.type==='weapon'||D.type==='armor')?' paper-equip':'';const name=key==='zhan'||key==='huozhan'?'name-zhan':key==='bi'?'name-bi':key==='yao'?'name-yao':'name-ink';el.className='fx-card '+tr.cls+paper+' '+name+(faceDown?' fx-back':'');const b=document.createElement('b');b.textContent=D.n;el.appendChild(b);if(suit){const i=document.createElement('i');i.className='suit'+(red?' red':'');i.textContent=suit;el.appendChild(i);}for(let n=0;n<8;n++){const s=document.createElement('span');s.className='fx-pip';const anim=tr.pip==='zhan'?(p.i===0?'fx-pip-zhan-up':'fx-pip-zhan-down'):tr.pip==='bi'?(n<4?'fx-pip-bi-left':'fx-pip-bi-right'):tr.pip==='yao'?'fx-pip-yao':tr.pip==='trick'?'fx-pip-trick':'fx-pip-equip';if(s.style&&s.style.setProperty){s.style.setProperty('--pip-anim',anim);if(tr.pip==='zhan')s.style.setProperty('--dx',((n-3.5)*8)+'px');if(tr.pip==='trick'){const rad=n*Math.PI/4;s.style.setProperty('--tx',(Math.cos(rad)*32)+'px');s.style.setProperty('--ty',(Math.sin(rad)*32)+'px');}}el.appendChild(s);}layer.appendChild(el);fxHold(layer,el,tr.ms);}
function fxCard(p,card,key,faceDown){if(window.HARNESS)return;if(!$('#fxLayer'))return;const down=!!faceDown;let suit='',red=false;if(card&&!down){suit=cs(card);red=isRed(card);}paintFxCard(p,key,suit,red,down);if(NET&&NET.role==='host')send({type:'fx',kind:'card',w:p.remote?0:1,key,suit:down?'':suit,red:!!(down?false:red),faceDown:down});}
function paintSkill(name){if(window.HARNESS||!name)return;const layer=$('#fxLayer');if(!layer)return;fxTrim(layer);const el=document.createElement('div');el.className='fx-skill';el.textContent='【'+name+'】';layer.appendChild(el);fxHold(layer,el,800);}
function loseEquip(p,slot,to){const e=p[slot];p[slot]=null;if(to){if(to[slot])G.discard.push(to[slot]);to[slot]=e;}else G.discard.push(e);
 if(has(p,'xiaoji')){log(`${p.g.name}发动【${sk(p,'xiaoji')}】`);drawCards(p,2);}if(has(p,'xuanfeng')&&opp(p).hand.length){log(`${p.g.name}【${sk(p,'xuanfeng')}】`);randDiscard(opp(p));}render();return e;}
const canTakeEquip=t=>!has(t,'qicai')&&(t.weapon||t.armor);

// ---- 人类交互 ----
let pending=null;
// 出牌选中不写入 G.sel。壳层开关只影响本地看见的抽屉。
let playSel=null,playCommit=false,promptOpen=false,logExpanded=false,exitOpen=false,sheetOpener=null,skillWho=null;
function waitUser(){return new Promise(r=>pending=r);}
function resolveUser(v){if(NET&&NET.role==='guest'){guestAct(v);return;}if(pending){const r=pending;pending=null;r(v);}}
async function ask(p,msg,opts){ // opts:[{label,val}]
 if(p.ai)return null;
 if(p.remote){const pv=G.rphase;G.rphase='busy';render();send({type:'ask',msg,opts});const r=await waitRemote(t=>t.t==='ans');G.rphase=pv;return r.val;}
 showPrompt(msg,opts,resolveUser);return waitUser();}
// 统一选择：AI 用 aiVal
async function choose(p,msg,opts,aiVal){if(p.ai)return aiVal;return ask(p,msg,opts);}
async function yesno(p,msg,aiVal){return choose(p,msg,[{label:'是',val:true},{label:'否',val:false}],aiVal);}
async function pickCard(p,msg,cards,aiCard){if(!cards.length)return null;if(p.ai)return aiCard||cards[0];
 const id=await ask(p,msg,cards.map(c=>({label:cname(c),val:c.id})));return cards.find(c=>c.id===id)||cards[0];}

// 判定：good(c) 表示对被判定者有利
async function judge(p,why,good){let c=topCard();if(!c)return {s:'heart',r:7,k:'zhan'};log(`${p.g.name}【${why}】判定：${cname(c)}`);await sleep(250);
 for(const o of G.P){const gk=has(o,'guidao')?'guidao':has(o,'huanshi')?'huanshi':null;if(!gk)continue;const blacks=o.hand.filter(x=>gk==='guidao'?(x.s==='spade'||x.s==='club'):isRed(x));if(!blacks.length)continue;
  const want=o===p?good:(x=>!good(x));if(want(c))continue;const fit=blacks.filter(want);
  let rep=null;if(o.ai){if(!fit.length)continue;rep=fit[0];}
  else{const id=await ask(o,`【${sk(o,gk)}】${p.g.name}的判定为${cname(c)}，打出牌替换？`,blacks.map(x=>({label:cname(x),val:x.id})).concat([{label:'不替换',val:-1}]));rep=blacks.find(x=>x.id===id);if(!rep)continue;}
  o.hand=o.hand.filter(x=>x!==rep);G.discard.push(c);c=rep;afterLose(o);log(`${o.g.name}发动【${sk(o,gk)}】改判为${cname(c)}`);}
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
 if(k==='bi'&&p.noBi){return false;}
 const list=asCards(p,k);if(!list.length)return false;
 const VALr=c=>c.k===k?1:0;const c=[...list].sort((a,b)=>VALr(b)-VALr(a))[0];
 let use=true;if(!p.ai)use=await ask(p,(G.tut&&k==='bi'?'【教程】对方出【斩】了，打出【避】可抵消伤害！':'')+msg+`（可用${list.length}张）`,[{label:'打出'+cname(c)+(c.k!==k?`当【${cn(k)}】`:''),val:true},{label:'不出',val:false}]);
 if(!use)return false;if(G.tut&&!p.ai&&k==='bi')G.tut.bi=true;if(k==='bi'){p.biCnt=(p.biCnt||0)+1;if(p.biCnt>=2)azCheck(p,'sishou');}removeCard(p,c);log(`${p.g.name}打出${cname(c)}${c.k!==k?`当【${cn(k)}】`:''}`);fxCard(p,c,k,false);render();await sleep(350);
 if(k==='bi')await onDodge(p);
 if(k==='bi'&&has(p,'leiji')&&!G.over){const t=opp(p);if(await yesno(p,`发动【${sk(p,'leiji')}】令对方判定？`,true)){log(`${p.g.name}发动【${sk(p,'leiji')}】`);const j=await judge(t,sk(p,'leiji'),x=>x.s!=='spade');if(j.s==='spade')await damage(p,t,2,'雷击');}}
 return true;}

function guardCap(t,n){if(G.guardT===t&&t.hp-n<1){const m=Math.max(0,t.hp-1);if(m<n)log(`【护体】${t.g.name}本回合开始时体力全满，不会被一回合击杀（伤害${n}→${m}）`);return m;}return n;}
async function damage(src,t,n,why,card){
 if(G.over)return;n=await dmgMod(src,t,n,why,card);if(n<=0)return;if(n>1&&t.armor&&t.armor.k==='linjia'){log(`${t.g.name}的【鳞甲】将伤害减为1`);n=1;}n=guardCap(t,n);if(n<=0)return;
 if(has(t,'tianxiang')){const hs=t.hand.filter(c=>suitOf(t,c)==='heart');if(hs.length){const aiC=[...hs].sort((a,b)=>VAL[a.k]-VAL[b.k])[0];
  const use=await yesno(t,`发动【${sk(t,'tianxiang')}】弃一张♥牌防止${n}点伤害？`,n>=2||t.hp<=n+1||VAL[aiC.k]<=6);
  if(use){const c=t.ai?aiC:await pickCard(t,'弃置哪张♥牌？',hs,aiC);removeCard(t,c);log(`${t.g.name}发动【${sk(t,'tianxiang')}】防止伤害`);if(src&&src!==t)randDiscard(src);drawCards(t,1);render();return;}}}
 const wasFull=t.hp>=t.maxHp;t.hp-=n;log(`${t.g.name}受到${n}点伤害${why?'（'+why+'）':''}，体力${t.hp}`);float(t,'-'+n,'bad');shake(t);render();await sleep(450);despairCheck(t);
 if(src&&src!==t)azCheck(src,wasFull?'toux':null);if(src&&src!==t&&t.hp>0&&t.hp<=2)azCheck(src,'zhanshou');if(t.hp>0&&t.hp<=2)azCheck(t,'yanghui');
 if(t.hp<=0)await dying(t);
 if(G.over)return;
 const s=src&&src!==t?src:null;if(s)s.dealt=true;await afterDamaged(t,s,n,why,card);if(G.over)return;
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
async function loseHp(p,n){n=guardCap(p,n);if(n<=0)return;p.hp-=n;float(p,'-'+n,'bad');render();await sleep(300);despairCheck(p);if(p.hp<=0)await dying(p);}
async function heal(p,n){if(p.hp>=p.maxHp)return;p.hp=Math.min(p.maxHp,p.hp+n);float(p,'+'+n,'good');log(`${p.g.name}回复${n}点体力，体力${p.hp}`);render();await sleep(300);}
async function dying(p){
 const blocked=(has(opp(p),'juesha')||opp(p).xiongluanOn)&&G.cur===opp(p);if(blocked)log(`【${sk(opp(p),'juesha')}】：${p.g.name}不能使用【药】`);
 while(p.hp<=0&&!blocked){
  const c=p.hand.find(x=>x.k==='yao')||(has(p,'jijiu')&&p.hand.find(x=>isRed(x)));
  if(!c)break;
  let use=true;if(!p.ai)use=await ask(p,`你濒死！使用${cname(c)}${c.k!=='yao'?'当【药】':''}救自己吗？`,[{label:'使用',val:true},{label:'放弃',val:false}]);
  if(!use)break;removeCard(p,c);log(`${p.g.name}濒死使用${cname(c)}`);fxCard(p,c,'yao',false);await heal(p,1);}
 if(p.hp<=0&&has(p,'niepan')&&!p.niepanUsed&&await yesno(p,`发动【${sk(p,'niepan')}】？`,true)){p.niepanUsed=true;log(`${p.g.name}发动【${sk(p,'niepan')}】`);
  [...p.hand].forEach(c=>{p.hand=p.hand.filter(x=>x!==c);G.discard.push(c);});['weapon','armor'].forEach(s=>{if(p[s]){G.discard.push(p[s]);p[s]=null;}});p.hp=Math.min(2,p.maxHp);drawCards(p,2);}
 if(p.hp<=0&&has(p,'buqu')){p.buqu=p.buqu||[];const c=topCard();if(c){const dup=p.buqu.some(x=>x.r===c.r)||p.buqu.length>=4;p.buqu.push(c);log(`${p.g.name}【${sk(p,'buqu')}】亮出${cname(c)}${dup?'，点数重复！':'，存活'}`);if(!dup)p.hp=1;}}
 if(p.hp<=0&&!G.over){say(p,LINE.defeat(p.g),'defeat');await sleep(900);endGame(opp(p));}}
function endGame(w){G.over=true;render();const me=w.i===0;const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');if(!AUTO&&!G.tut&&!G.mode){me?st.w++:st.l++;localStorage.sgStats=JSON.stringify(st);}
 if(window.onGameOver)window.onGameOver(w);
 promptOpen=false;$('#prompt').classList.add('hide');closeSheets();clearFx();
 const seed=G.seed||0,l=opp(w);if(NET)send({type:'over',win:w.i===1,name:w.g.name,wid:w.g.id,lid:l.g.id,seed,turn:G.turnNo});
 if(G.mode){const tail=G.mode.type==='puzzle'?puzzleResult(me):dailyResult(me);$('#over').innerHTML=overCard(me,w.g,l.g,seed,G.turnNo,tail);$('#over').classList.remove('hide');resolveUser(null);return;}
 if(G.tut){if(me)localStorage.sgTutDone='1';$('#over').innerHTML=overCard(me,w.g,l.g,seed,G.turnNo,me?'<p class="tut-done">教程完成！已解锁自由选将与联机大厅。</p><button class="btn-primary" type="button" onclick="location.reload()">进入大厅</button>':'<p>再试一次，按提示出牌即可。</p><button class="btn-primary" type="button" onclick="location.reload()">重开教程</button>');$('#over').classList.remove('hide');resolveUser(null);return;}
 $('#over').innerHTML=overCard(me,w.g,l.g,seed,G.turnNo,`<p>战绩：${st.w} 胜 ${st.l} 负</p><button class="btn-primary" type="button" onclick="location.reload()">再来一局</button>`);$('#over').classList.remove('hide');resolveUser(null);}
function overCard(me,wg,lg,seed,turn,tail){const fc=FACTIONS[wg.f]||{n:''};return `<div class="over-card f-${wg.f}"><h2>${me?'胜利！':'败北…'}</h2>${portraitImg(wg.id,wg.name)}<p class="over-who"><span class="fac">${fc.n}</span>${wg.name} 获胜</p><p class="over-report">「${LINE.report(wg,lg,seed)}」</p><p class="over-sub">${me?'此战当载入史册':'胜败乃兵家常事'} · 共 ${turn||0} 回合</p></div>${tail}`;}
function say(p,text,kind){if(!p||!text)return;log(`${p.g.name}：「${text}」`);if(window.HARNESS)return;if(NET&&NET.role==='host')send({type:'fx',kind:'line',w:p.remote?0:1,text,cls:kind});paintLine(p,text,kind);}
function paintLine(p,text,kind){if(window.HARNESS||!p)return;const layer=$('#fxLayer');if(!layer)return;const el=document.createElement('div');el.className='fx-line '+(kind||'')+' '+(p.i===0?'to-me':'to-ai');el.textContent=`${p.g.name}：「${text}」`;layer.appendChild(el);fxHold(layer,el,2200);}
function despairCheck(p){if(G.over||p.despair||p.hp<=0||p.hp*3>p.maxHp)return;p.despair=true;say(p,LINE.despair(p.g),'despair');}
async function showIntro(a,b){const ta=LINE.intro(a.g,b.g);let tb=LINE.intro(b.g,a.g);for(let i=0;i<6&&tb===ta;i++)tb=LINE.intro(b.g,a.g);log(`${a.g.name}：「${ta}」`);log(`${b.g.name}：「${tb}」`);if(window.HARNESS)return;
 if(NET&&NET.role==='host')send({type:'fx',kind:'intro',a:b.g.id,b:a.g.id,ta:tb,tb:ta});paintIntro(a.g,b.g,ta,tb);await sleep(2300);}
function paintIntro(me,foe,ta,tb){const app=$('#app');if(!app)return;const old=$('#introBox');if(old)old.remove();const el=document.createElement('div');el.id='introBox';el.className='intro';
 el.innerHTML=`<div class="intro-side foe f-${foe.f}">${portraitImg(foe.id,foe.name)}<p><b>${foe.name}</b>「${tb}」</p></div><div class="intro-vs">VS</div><div class="intro-side me f-${me.f}">${portraitImg(me.id,me.name)}<p><b>${me.name}</b>「${ta}」</p></div>`;
 app.appendChild(el);el.onclick=()=>el.remove();setTimeout(()=>{if(el.parentNode)el.remove();},2300);}

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
async function playCard(p,c,as){if(G.over)return;const t=opp(p);removeCard(p,c);const k=as||c.k,D=CARD_DEFS[k];if(G.tut&&!p.ai&&(k==='zhan'||k==='huozhan'))G.tut.zhan=true;
 log(`${p.g.name}使用${cname(c)}${as?`当【${D.n}】`:''}`);fxCard(p,c,k,false);render();await sleep(300);p.usedCnt=(p.usedCnt||0)+1;if(D.type==='trick')p.trickUsed=true;
 if(has(p,'jiang')&&((k==='zhan'&&isRed(c))||k==='dantiao')){log(`${p.g.name}【${sk(p,'jiang')}】摸1张`);drawCards(p,1);}
 if(D.type==='weapon'||D.type==='armor'){const slot=D.type;if(p[slot])G.discard.push(p[slot]);G.discard=G.discard.filter(x=>x!==c);p[slot]=c;if(has(p,'xiaoji')){log(`${p.g.name}发动【${sk(p,'xiaoji')}】`);drawCards(p,2);}render();return;}
 if(D.type==='trick'&&has(p,'jizhi')){log(`${p.g.name}发动【${sk(p,'jizhi')}】`);drawCards(p,1);}
 if(D.type==='trick'&&BLACK_IMMUNE(t,c)){log(`${t.g.name}【${sk(t,'weimu')}】：黑色锦囊无效`);return;}
 if(k==='yao'){await heal(p,1);return;}
 if(k==='zhan'&&has(p,'lihuo')){p.zhanUsed++;G.fire=true;await doZhan(p,t,c);G.fire=false;return;}
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
 if((k==='jianyu'&&has(t,'juxiang'))||(k==='fenghuo'&&has(t,'huoshou'))){log(`${t.g.name}【${sk(t,k==='jianyu'?'juxiang':'huoshou')}】：无效`);return;}
 if(has(t,'yuguan')&&t.hand.length){randDiscard(t,'因【御关】');return;}
 const need=k==='jianyu'?'bi':'zhan';const ok=await respond(t,need,`对方对你使用【${cn(k)}】，${k==='jianyu'?'打出':'弃置'}【${cn(need)}】抵消？`);
 if(!ok)await damage(p,t,1,cn(k));}
async function doZhan(p,t,card){
 await zyChoice(p,t);
 if(has(t,'kongying')&&t.hand.length===0){log(`${t.g.name}【${sk(t,'kongying')}】：斩无效`);return;}
 if(!await zhanPre(p,t))return;
 G.ignoreArmor=(p.weapon&&p.weapon.k==='pojia')||(has(p,'yicong')&&p.hp>2)||p.xianzhenOn;
 if(has(t,'yicong')&&t.hp<=2){const j=await judge(t,sk(t,'yicong'),x=>!isRed(x));if(!isRed(j)){log(`${t.g.name}【${sk(t,'yicong')}】：斩无效`);G.ignoreArmor=false;return;}}
 let hard=false;if(p.hardNext){p.hardNext=false;hard=true;log(`${p.g.name}【${sk(p,'gongqi')}】：此斩不能被避`);}
 if(has(p,'liegong')&&t.hand.length>=p.hp){hard=true;log(`${p.g.name}发动【${sk(p,'liegong')}】：不可闪避`);}
 if(!hard&&has(p,'tieqi')){const j=await judge(p,sk(p,'tieqi'),isRed);if(isRed(j)){hard=true;log(`${p.g.name}【${sk(p,'tieqi')}】：对方不能出避`);}}
 const need=hard?0:(has(p,'lietian')||(has(p,'nuhou')&&p.zhanUsed===2)||(has(p,'duanbing')&&p.hp<=2))?2:1;let dodged=need>0;
 for(let i=0;i<need;i++){if(!await respond(t,'bi',`${p.g.name}对你使用【斩】${need>1?`（需${need}张，第${i+1}张）`:''}，打出【避】？`)){dodged=false;break;}if(G.over)return;}
 G.ignoreArmor=false;if(G.over)return;
 if(dodged){await zhanMiss(p,t);if(G.over)return;if(has(p,'huxiao')&&!p.huxiaoUsed){p.huxiaoUsed=true;p.extraZhan=(p.extraZhan||0)+1;drawCards(p,1);log(`${p.g.name}【${sk(p,'huxiao')}】：摸1张牌并可多出一张斩`);}
  if(p.weapon&&p.weapon.k==='zhongchui')randDiscard(t,'受【流星锤】');
  if(p.weapon&&p.weapon.k==='shuangren'&&p.hand.length>=2&&!G.over){const two=aiDiscardOrder(p).slice(0,2);if(await yesno(p,'【双刃戟】弃2张手牌令此斩仍造成1点伤害？',t.hp<=2||VAL[two[1].k]<=6)){two.forEach(x=>removeCard(p,x));log(`${p.g.name}发动【双刃戟】`);await damage(p,t,1,'双刃戟',card);}}
  render();return;}
 let n=1;if(p.zhanguOn){p.zhanguOn=false;n++;log(`${p.g.name}【战鼓】：伤害+1`);}if(G.fire&&t.armor&&t.armor.k==='tengdun'){n++;log(`【火斩】点燃【藤盾】：伤害+1`);}if(p.luozhanOn){n++;log(`${p.g.name}【${sk(p,'luozhan')}】：伤害+1`);}
 if(p.zyMode==='wei'){n++;log(`${p.g.name}【${ZY[p.g.f].a}】：伤害+1`);}if(p.zyMode==='xu'){n=Math.max(0,n-1);log(`${p.g.name}【${ZY[p.g.f].b}】：伤害-1`);}if(p.yangweiOn){n++;log(`${p.g.name}【${sk(p,'yangwei')}】：伤害+1`);}if(has(p,'taiguan')&&p.hp<=2){n++;log(`${p.g.name}【${sk(p,'taiguan')}】：伤害+1`);}if(has(p,'pojun')&&t.hand.length>=p.hand.length){n++;log(`${p.g.name}【${sk(p,'pojun')}】：伤害+1`);}
 if(p.tianyiBonus){n++;p.tianyiBonus=0;log(`${p.g.name}【${sk(p,'tianyi')}】：伤害+1`);}
 const h0=t.hp;await damage(p,t,n,'斩',card);if(G.over)return;if(t.hp<h0){await zhanHit(p,t,card);if(G.over)return;}
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
 duanliang:{times:2,can:p=>p.hand.some(ACT_F.duanliang),need:1,filter:c=>ACT_F.duanliang(c),async run(p,cards){removeCard(p,cards[0]);log(`${p.g.name}将${cname(cards[0])}当【破阵】`);fxCard(p,cards[0],'pozhen',false);const t=opp(p);if(await pozhen(p,t)){t.drawMinus=(t.drawMinus||0)+1;log(`${t.g.name}下回合少摸1张`);}}},
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
 qixi:{times:99,can:p=>p.hand.some(c=>!isRed(c)),need:1,filter:c=>!isRed(c),async run(p,cards){removeCard(p,cards[0]);log(`${p.g.name}将${cname(cards[0])}当【破阵】`);fxCard(p,cards[0],'pozhen',false);await pozhen(p,opp(p));if(has(p,'jieying')&&p.jieyingT!==G.turnNo){p.jieyingT=G.turnNo;log(`${p.g.name}【${sk(p,'jieying')}】摸1张牌`);drawCards(p,1);}}},
 jieyin:{can:p=>p.hand.length>=2&&p.hp<p.maxHp,need:2,async run(p,cards){cards.forEach(c=>removeCard(p,c));await heal(p,1);drawCards(p,1);}},
 dimeng:{can:p=>p.hand.length>=1,need:1,async run(p,cards){removeCard(p,cards[0]);const t=opp(p);[p.hand,t.hand]=[t.hand,p.hand];log(`${p.g.name}与${t.g.name}交换了手牌`);afterLose(p);afterLose(t);render();}},
 gongxin:{can:p=>opp(p).hand.length>0,need:0,async run(p){const t=opp(p);const best=[...t.hand].sort((a,b)=>VAL[b.k]-VAL[a.k])[0];const c=await pickCard(p,`${t.g.name}的手牌，选一张弃置`,t.hand,best);removeCard(t,c);log(`${t.g.name}被弃置了${cname(c)}`);render();}},
 tianyi:{can:p=>p.hand.length>=1&&opp(p).hand.length>0,need:1,async run(p,cards){const r=await pindian(p,opp(p),cards[0]);if(r.win){p.extraZhan=(p.extraZhan||0)+1;p.tianyiBonus=1;}else p.noZhan=true;render();}},
 kurou:{times:2,can:p=>p.hp>1,need:0,async run(p){await loseHp(p,1);drawCards(p,2);if(has(p,'zhaxiang')&&!p.zhaxiangOn){p.zhaxiangOn=true;p.extraZhan=(p.extraZhan||0)+1;log(`${p.g.name}【${sk(p,'zhaxiang')}】：多出一张斩`);}}},
 guose:{can:p=>p.hand.some(c=>c.s==='diamond')&&!opp(p).guose,need:1,filter:c=>c.s==='diamond',async run(p,cards){removeCard(p,cards[0]);opp(p).guose=true;log(`${opp(p).g.name}下回合需判定【国色】`);}},
 qingnang:{can:p=>p.hand.length>=1&&p.hp<p.maxHp,need:1,async run(p,cards){removeCard(p,cards[0]);await heal(p,1);}},
 lihun:{can:p=>p.hand.length>=1,need:1,async run(p,cards){removeCard(p,cards[0]);const t=opp(p);if(has(t,'qianxun')){log('【谦逊】：无效');return;}fxCard(p,cards[0],'dantiao',false);await duel(p,t);}},
 luanji:{times:2,can:p=>p.hand.filter(isRed).length>=2||p.hand.filter(x=>!isRed(x)).length>=2,need:2,valid:cs=>isRed(cs[0])===isRed(cs[1]),async run(p,cards){cards.forEach(c=>removeCard(p,c));log(`${p.g.name}将两张牌当【箭雨】`);fxCard(p,cards[0],'jianyu',false);const t=opp(p),h=t.hp;await aoe(p,t,'jianyu');if(!G.over&&t.hp<h){log(`${p.g.name}【乱击】命中，摸2张牌`);drawCards(p,2);}}},
 yandou:{can:p=>p.hand.some(c=>c.k==='zhan'),need:1,filter:c=>c.k==='zhan',async run(p,cards){removeCard(p,cards[0]);const t=opp(p);if(has(t,'qianxun')){log('【谦逊】：无效');return;}fxCard(p,cards[0],'dantiao',false);await duel(p,t);}},
 xionglie:{limited:true,can:p=>true,need:0,async run(p){drawCards(p,3);drawCards(opp(p),3);await heal(p,1);p.extraZhan=(p.extraZhan||0)+1;}},
};
const ACT_F={duanliang:c=>c.k==='yao'||['weapon','armor'].includes(CARD_DEFS[c.k].type),chifeng:c=>isRed(c)&&c.k!=='yao'&&c.k!=='zhan'};
const GONGXIN={n:'攻心',k:'gongxin',active:true,t:'出牌阶段限一次：观看对方手牌并弃置其中一张。'};
const ZHANXING={n:'占星',k:'zhanxing',t:'摸牌阶段开始时，观看牌堆顶3张牌，可以将其中任意1张置于牌堆底。'};
function activeOf(p){const s=skillsOf(p).find(s=>s.active);return s?{s,a:ACTIVES[s.k]}:null;}
function usedUp(p,act){if(act.a.limited)return !!(p.limitUsed||{})[act.s.k];return ((p.used||{})[act.s.k]||0)>=(act.a.times||1);}
function markUsed(p,act){if(G.tut&&!p.ai)G.tut.skill=true;p.used=p.used||{};p.used[act.s.k]=(p.used[act.s.k]||0)+1;if(act.a.limited){p.limitUsed=p.limitUsed||{};p.limitUsed[act.s.k]=true;}}
function validSel(act,cs){if(act.a.needAny?cs.length<1:cs.length!==act.a.need)return false;if(act.a.filter&&!cs.every(act.a.filter))return false;if(act.a.valid&&!act.a.valid(cs))return false;return true;}

// ---- 第二批武将钩子 ----
const SAFE_PASSIVE=[{n:'节命',k:'jieming'},{n:'遗算',k:'yisuan'},{n:'天机',k:'tianji'},{n:'闭月',k:'biyue'},{n:'挽月',k:'wanyue'},{n:'胡笳',k:'hujia'},{n:'英发',k:'yingfa'},{n:'坚城',k:'jiancheng'}];
function gainSafe(p){const pool=SAFE_PASSIVE.filter(s=>!has(p,s.k));if(!pool.length||(p.gained||[]).length>=3)return;const s=pool[Math.random()*pool.length|0];
 const full=GENERALS.flatMap(g=>g.skills).find(x=>x.k===s.k)||s;p.gained=(p.gained||[]).concat([{...full}]);log(`${p.g.name}【幻身】获得【${full.n}】`);render();}
const QIJING={n:'奇径',k:'qijing',active:true,t:'出牌阶段限两次：移去1枚田，获得对方一张随机手牌。'};
const PAIYI={n:'排异',k:'paiyi',active:true,t:'出牌阶段限一次：移去1枚权，对对方造成1点伤害。'};
const YINGFA={n:'英发',k:'yingfa',t:'摸牌阶段多摸1张牌。'},YINGSHI={n:'鹰视',k:'yingshi',t:'你受到伤害后，获得伤害来源一张随机手牌。'};
async function dmgMod(src,t,n,why,card){
 if(t.zhichiT===G.turnNo&&G.cur!==t){log(`${t.g.name}【${sk(t,'zhichi')}】：防止伤害`);return 0;}
 if(src&&src!==t&&has(t,'mingshi')&&src.hand.length<=t.hand.length&&n>0){log(`${t.g.name}【${sk(t,'mingshi')}】：伤害-1`);n--;}
 if(t.ying&&n>0){t.ying=0;n--;log(`${t.g.name}【${sk(t,'juying')}】：移去营，伤害-1`);}
 return n;}
async function afterDamaged(t,s,n,why,card){
 if(has(t,'zhichi')&&G.cur!==t)t.zhichiT=G.turnNo;
 if(has(t,'quanmou')){log(`${t.g.name}发动【${sk(t,'quanmou')}】`);drawCards(t,1);if(t.hand.length){const c=aiDiscardOrder(t)[0];t.hand=t.hand.filter(x=>x!==c);G.discard.push(c);t.quan=(t.quan||0)+1;log(`${t.g.name}将一张牌作为“权”（${t.quan}）`);render();}}
 if(has(t,'zhiyu')){drawCards(t,1);log(`${t.g.name}【${sk(t,'zhiyu')}】摸1张`);if(s&&t.hand.length&&t.hand.every(c=>isRed(c)===isRed(t.hand[0]))){log('手牌颜色相同');randDiscard(s);}}
 if(s&&has(t,'gangli')){const j=await judge(t,sk(t,'gangli'),x=>x.r>s.hand.length);if(j.r>s.hand.length){await damage(t,s,1,sk(t,'gangli'));if(G.over)return;}}
 if(has(t,'xiemu')&&why==='斩'){log(`${t.g.name}【${sk(t,'xiemu')}】`);drawCards(t,2);}
 if(s&&has(t,'yaowu')&&why==='斩'&&card&&isRed(card)){log(`${t.g.name}【${sk(t,'yaowu')}】：${s.g.name}摸1张`);drawCards(s,1);}
 if(has(t,'xinsheng')){const j=await judge(t,sk(t,'xinsheng'),isRed);if(isRed(j))gainSafe(t);}}
async function onDodge(p){if(G.over)return;const a=opp(p);
 if(has(p,'tunken')){p.tian=(p.tian||0)+1;log(`${p.g.name}【${sk(p,'tunken')}】获得田（${p.tian}）`);}
 if(has(p,'congjian')&&p.hand.length&&a.hand.length&&await yesno(p,`发动【${sk(p,'congjian')}】弃1张令对方弃1张？`,p.hand.length>=3)){const c=p.ai?aiDiscardOrder(p)[0]:await pickCard(p,'弃置哪张？',p.hand);removeCard(p,c);randDiscard(a,'因【从谏】');}}
async function zhanPre(p,t){
 if(has(t,'xiangle')){const bs=p.hand.filter(c=>CARD_DEFS[c.k].type==='basic');const ok=bs.length&&await yesno(p,`【${sk(t,'xiangle')}】弃置一张基本牌，否则此斩无效？`,true);
  if(!ok){log(`${t.g.name}【${sk(t,'xiangle')}】：斩无效`);return false;}const c=p.ai?[...bs].sort((a,b)=>VAL[a.k]-VAL[b.k])[0]:await pickCard(p,'弃置哪张基本牌？',bs);removeCard(p,c);log(`${p.g.name}弃置${cname(c)}`);}
 if(has(t,'zhenlie')&&t.hp>1&&await yesno(t,`发动【${sk(t,'zhenlie')}】失去1点体力令此斩无效？`,t.hp>=3&&!asCards(t,'bi').length)){log(`${t.g.name}发动【${sk(t,'zhenlie')}】`);await loseHp(t,1);if(G.over)return false;steal(t,p);return false;}
 return true;}
async function zhanMiss(p,t){
 if(has(p,'huangxu')&&!p.huangxuT){p.huangxuT=true;log(`${p.g.name}【${sk(p,'huangxu')}】摸1张`);drawCards(p,1);}
 if(has(p,'chongqi')){const j=await judge(p,sk(p,'chongqi'),x=>x.s==='diamond');if(j.s==='diamond')await damage(p,t,1,sk(p,'chongqi'));}}
async function zhanHit(p,t,card){
 if(has(p,'xiandeng')&&t.hand.length)randDiscard(t,'因【先登】');
 if(has(p,'longyin')&&card&&isRed(card)){p.zhanUsed=Math.max(0,p.zhanUsed-1);log(`${p.g.name}【${sk(p,'longyin')}】摸1张，此斩不计次数`);drawCards(p,1);}
 if(p.fupoOn){p.fupoOn=false;p.extraZhan=(p.extraZhan||0)+1;log(`${p.g.name}【${sk(p,'fupo')}】：斩次数+1`);}
 if(has(p,'lihuo')&&G.fire&&t.hp<p.hp){log(`${p.g.name}【${sk(p,'lihuo')}】失去1点体力`);await loseHp(p,1);if(G.over)return;}
 if(has(p,'lieren')&&p.hand.length&&t.hand.length&&await yesno(p,`发动【${sk(p,'lieren')}】与对方拼点？`,Math.max(...p.hand.map(c=>c.r))>=10)){const mine=p.ai?[...p.hand].sort((a,b)=>b.r-a.r)[0]:await pickCard(p,'拼点牌',p.hand);const r=await pindian(p,t,mine);if(r.win)steal(p,t);}}
async function turnStart(p,t){
 for(const o of [t]){ // 对方技能于你回合开始
  if(has(o,'wangzun')&&p.hp>o.hp){log(`${o.g.name}【${sk(o,'wangzun')}】`);drawCards(o,1);p.wzMinus=1;}
  if(has(o,'zhendu')&&o.hand.length&&await yesno(o,`发动【${sk(o,'zhendu')}】弃1张牌对${p.g.name}造成1点伤害？`,p.hp>=3&&o.hand.length>=2)){const c=o.ai?aiDiscardOrder(o)[0]:await pickCard(o,'弃置哪张？',o.hand);removeCard(o,c);log(`${o.g.name}发动【${sk(o,'zhendu')}】`);await damage(o,p,1,sk(o,'zhendu'));if(G.over)return;p.extraZhan=(p.extraZhan||0)+1;}}
 if(has(p,'zaoshan')&&!p.woke&&(p.tian||0)>=3){p.woke=true;p.maxHp--;p.hp=Math.min(p.hp,p.maxHp);log(`${p.g.name}觉醒【${sk(p,'zaoshan')}】，获得【奇径】`);p.gained=[QIJING];render();if(p.hp<=0){await dying(p);if(G.over)return;}}
 if(has(p,'zili')&&!p.woke&&(p.quan||0)>=3){p.woke=true;p.maxHp--;p.hp=Math.min(p.hp,p.maxHp);log(`${p.g.name}觉醒【${sk(p,'zili')}】，获得【排异】`);p.gained=[PAIYI];await heal(p,1);}
 if(has(p,'hunzi')&&!p.woke&&p.hp===1&&p.maxHp>1){p.woke=true;p.maxHp--;log(`${p.g.name}觉醒【${sk(p,'hunzi')}】，获得【英发】【鹰视】`);p.gained=[YINGFA,YINGSHI];render();}
 if(has(p,'anguo')&&p.hp<t.hp&&(p.anguoN||0)<2){p.anguoN=(p.anguoN||0)+1;log(`${p.g.name}【${sk(p,'anguo')}】`);await heal(p,1);}
 if(has(p,'chengwu')){const j=await judge(p,sk(p,'chengwu'),()=>true);if(isRed(j)){p.extraZhan=(p.extraZhan||0)+1;log(`${p.g.name}本回合可多出一张斩`);}else drawCards(p,1);}
 if(has(p,'qianxi')){const j=await judge(p,sk(p,'qianxi'),x=>!isRed(x));if(!isRed(j)){t.noBi=true;log(`${t.g.name}本回合不能打出【避】`);}}
 if(has(p,'yinghun')&&p.hp<p.maxHp){const x=p.maxHp-p.hp;const d=await choose(p,`【${sk(p,'yinghun')}】选择`,[{label:`摸${x}张`,val:'draw'},{label:`对方弃${x}张`,val:'dis'}],t.hand.length>=x+1?'dis':'draw');log(`${p.g.name}发动【${sk(p,'yinghun')}】`);if(d==='dis'){for(let i=0;i<x;i++)randDiscard(t,'因【英魂】');}else drawCards(p,x);}}
async function drawHooks(p,t,n){
 if(has(p,'yongsi'))n++;
 if(has(p,'zaiqi')&&p.hp<p.maxHp&&await yesno(p,`发动【${sk(p,'zaiqi')}】改为亮出牌堆顶${p.maxHp-p.hp+1}张？`,p.maxHp-p.hp>=1)){const x=p.maxHp-p.hp+1;let hearts=0;log(`${p.g.name}发动【${sk(p,'zaiqi')}】`);
  for(let i=0;i<x;i++){const c=topCard();if(!c)break;if(c.s==='heart'){hearts++;G.discard.push(c);}else p.hand.push(c);}if(hearts)await heal(p,hearts);render();return 0;}
 if(has(p,'zishou')&&await yesno(p,`发动【${sk(p,'zishou')}】多摸${p.maxHp-p.hp+1}张，本回合不能出斩？`,!p.hand.some(c=>c.k==='zhan')||p.hp<=2)){n+=p.maxHp-p.hp+1;p.noZhan=true;log(`${p.g.name}发动【${sk(p,'zishou')}】`);}
 if(has(p,'xiaorui')&&n>0&&await yesno(p,`发动【${sk(p,'xiaorui')}】少摸1张，本回合多出一张斩？`,p.hand.filter(c=>c.k==='zhan').length>=2)){n--;p.extraZhan=(p.extraZhan||0)+1;log(`${p.g.name}发动【${sk(p,'xiaorui')}】`);}
 if(has(p,'lirang')&&n>0&&p.hp<p.maxHp&&await yesno(p,`发动【${sk(p,'lirang')}】少摸1张、对方摸1张，你回复1点？`,p.hp<=2)){n--;log(`${p.g.name}发动【${sk(p,'lirang')}】`);drawCards(t,1);await heal(p,1);}
 if(has(p,'jixi')&&n>0&&await yesno(p,`发动【${sk(p,'jixi')}】只摸1张，视为对对方使用【斩】？`,t.hp>1&&!asCards(t,'bi').length?true:Math.random()<.5)){n=1;log(`${p.g.name}发动【${sk(p,'jixi')}】`);fxCard(p,null,'zhan',false);await doZhan(p,t,null);}
 return n;}
async function turnEnd(p,t){
 if(has(p,'luoying')&&p.trickUsed){log(`${p.g.name}【${sk(p,'luoying')}】`);drawCards(p,1);}
 if(has(p,'zhengjun')&&p.hand.length===p.hp){log(`${p.g.name}【${sk(p,'zhengjun')}】`);drawCards(p,2);}
 if(has(p,'mice')&&p.hp<p.maxHp){const x=Math.min(2,p.maxHp-p.hp);log(`${p.g.name}【${sk(p,'mice')}】`);drawCards(p,x);}
 if(has(p,'jingce')&&p.usedCnt>=p.hp){log(`${p.g.name}【${sk(p,'jingce')}】`);drawCards(p,2);}
 if(has(p,'shengxi')&&!p.dealt){log(`${p.g.name}【${sk(p,'shengxi')}】`);drawCards(p,2);}
 if(has(p,'juying')&&p.zhanUsed===0&&!p.ying){p.ying=1;log(`${p.g.name}【${sk(p,'juying')}】获得营`);}
 if(has(p,'chunlao')&&!p.hand.length){log(`${p.g.name}【${sk(p,'chunlao')}】`);drawCards(p,2);}
 if(p.fangquanOn){log(`${p.g.name}【${sk(p,'fangquan')}】`);randDiscard(t,'因【放权】');drawCards(p,2);}
 if(has(p,'danshou')){if(p.usedCnt>=3){log(`${p.g.name}【${sk(p,'danshou')}】`);await damage(p,t,1,sk(p,'danshou'));if(G.over)return;}else if(p.hand.length===t.hand.length){log(`${p.g.name}【${sk(p,'danshou')}】摸1张`);drawCards(p,1);}}
 if(has(p,'zhiyan')){const c=topCard();if(c){log(`${p.g.name}【${sk(p,'zhiyan')}】亮出${cname(c)}`);if(CARD_DEFS[c.k].type==='basic')p.hand.push(c);else{G.discard.push(c);randDiscard(t,'因【直言】');}render();}}}
const NEW_ACTIVES={
 qibu:{can:p=>p.hand.length>=1,need:1,async run(p,cs){removeCard(p,cs[0]);const j=await judge(p,sk(p,'qibu'),x=>x.r>=7);drawCards(p,j.r>=7?3:1);}},
 qice:{can:p=>p.hand.length>=2,need:0,async run(p){const n=p.hand.length;[...p.hand].forEach(c=>{p.hand=p.hand.filter(x=>x!==c);G.discard.push(c);});afterLose(p);log(`${p.g.name}弃置${n}张牌视为使用【箭雨】`);await aoe(p,opp(p),'jianyu');if(!G.over&&n>=3)drawCards(p,Math.floor(n/3));}},
 junfa:{can:p=>p.hand.length>=1,needAny:true,need:1,async run(p,cs){const x=cs.length,t=opp(p);cs.forEach(c=>removeCard(p,c));
  const d=t.hand.length>=x&&await yesno(t,`【峻法】弃置${x}张手牌？（否则跳过下个出牌阶段）`,t.hand.length>=x+2||x<=1);if(d){for(let i=0;i<x;i++)randDiscard(t,'因【峻法】');}else{t.skipPlay=true;log(`${t.g.name}将跳过下个出牌阶段`);}}},
 fupo:{times:99,can:p=>canZhan(p)&&p.hand.length>=2,need:2,silent:true,async run(p,cs){cs.forEach(c=>removeCard(p,c));p.zhanUsed++;p.usedCnt=(p.usedCnt||0)+1;log(`${p.g.name}【${sk(p,'fupo')}】将两张牌当【斩】`);fxCard(p,cs[0],'zhan',false);p.fupoOn=true;await doZhan(p,opp(p),cs[0]);p.fupoOn=false;}},
 feijun:{can:p=>p.hand.length>=1,need:1,async run(p,cs){removeCard(p,cs[0]);const t=opp(p);if(t.hand.length>=p.hand.length&&t.hand.length)randDiscard(t,'因【飞军】');else await pozhen(p,t);}},
 sanyao:{can:p=>p.hand.length>=1&&opp(p).hp>p.hp,need:1,async run(p,cs){removeCard(p,cs[0]);await damage(p,opp(p),1,sk(p,'sanyao'));}},
 tiaohe:{can:p=>p.hand.length>=1&&opp(p).hand.length>=1,need:0,async run(p){const t=opp(p);const a=p.hand[Math.random()*p.hand.length|0],b=t.hand[Math.random()*t.hand.length|0];removeCard(p,a);removeCard(t,b);log(`${p.g.name}弃置${cname(a)}，${t.g.name}弃置${cname(b)}`);drawCards(p,1);if(isRed(a)===isRed(b))await heal(p,1);}},
 gongqi:{can:p=>p.hand.some(c=>CARD_DEFS[c.k].type!=='basic')&&canZhan(p),need:1,filter:c=>CARD_DEFS[c.k].type!=='basic',async run(p,cs){removeCard(p,cs[0]);p.hardNext=true;log(`${p.g.name}下一张斩不能被避`);}},
 fenxun:{can:p=>p.hand.length>=1,need:1,async run(p,cs){const eq=['weapon','armor'].includes(CARD_DEFS[cs[0].k].type);removeCard(p,cs[0]);drawCards(p,1);if(eq){p.extraZhan=(p.extraZhan||0)+1;log(`${p.g.name}本回合斩次数+1`);}}},
 anxu:{can:p=>opp(p).hand.length>0,need:0,async run(p){const t=opp(p);const c=t.hand[Math.random()*t.hand.length|0];t.hand=t.hand.filter(x=>x!==c);p.hand.push(c);afterLose(t);log(`${p.g.name}获得${t.g.name}的一张牌`);drawCards(t,1);if(c.s!=='spade')drawCards(p,1);render();}},
 zhijian:{can:p=>p.hand.some(ACT_F.zhijian),need:1,filter:c=>ACT_F.zhijian(c),async run(p,cs){const eq=cs[0].k!=='yao';removeCard(p,cs[0]);drawCards(p,2);if(eq)randDiscard(opp(p),'因【直谏】');}},
 yangwei:{can:p=>p.hand.length>=2&&canZhan(p),need:2,async run(p,cs){cs.forEach(c=>removeCard(p,c));p.yangweiOn=true;}},
 xianzhen:{can:p=>p.hand.length>=1&&opp(p).hand.length>0,need:1,async run(p,cs){const r=await pindian(p,opp(p),cs[0]);if(r.win){p.xianzhenOn=true;p.extraZhan=(p.extraZhan||0)+2;log(`${p.g.name}【陷阵】成功`);}else{p.noZhan=true;log(`${p.g.name}本回合不能出斩`);}render();}},
 mingce:{can:p=>p.hand.length>=1,need:1,async run(p,cs){const t=opp(p),c=cs[0];p.hand=p.hand.filter(x=>x!==c);t.hand.push(c);afterLose(p);log(`${p.g.name}交给${t.g.name}一张牌`);
  const d=await choose(t,`【明策】选择`,[{label:`${p.g.name}摸2张`,val:'draw'},{label:'受到1点伤害',val:'dmg'}],t.hp>=3&&t.hp<t.maxHp?'dmg':'draw');if(d==='dmg')await damage(p,t,1,sk(p,'mingce'));else drawCards(p,2);}},
 xiongluan:{limited:true,can:p=>true,need:0,async run(p){p.extraZhan=(p.extraZhan||0)+3;p.xiongluanOn=true;}},
 fencheng:{limited:true,can:p=>true,need:0,async run(p){const t=opp(p);const d=t.hand.length>=2&&await yesno(t,'【焚城】弃置2张牌？（否则受到2点伤害）',true);if(d){randDiscard(t,'因【焚城】');randDiscard(t,'因【焚城】');}else await damage(p,t,2,sk(p,'fencheng'));}},
 guhuo:{can:p=>p.hand.length>=1&&canZhan(p),need:1,async run(p,cs){const c=cs[0],t=opp(p);p.hand=p.hand.filter(x=>x!==c);afterLose(p);p.zhanUsed++;p.usedCnt=(p.usedCnt||0)+1;log(`${p.g.name}扣置一张牌当【斩】`);fxCard(p,null,'zhan',true);
  const q=await yesno(t,'【蛊惑】质疑这张牌？',Math.random()<.4);G.discard.push(c);
  if(q){log(`${t.g.name}质疑，亮出${cname(c)}`);if(c.k!=='zhan'){log('质疑成功，斩无效');randDiscard(p);return;}log('质疑失败');await loseHp(t,1);if(G.over)return;}
  await doZhan(p,t,c);}},
 taoluan:{can:p=>p.hand.length>=1,need:1,async run(p,cs){const t=opp(p);const ks=['fengshou','tanma','jiezi','yexi','pozhen'];const ai=t.hand.length?(canTakeEquip(t)?'pozhen':'yexi'):'fengshou';
  const k=await choose(p,'【滔乱】当作哪张锦囊？',ks.map(x=>({label:cn(x),val:x})),ai);await playCard(p,cs[0],k);}},
 mouzhu:{can:p=>opp(p).hand.length>p.hand.length,need:0,async run(p){const t=opp(p);steal(p,t);if(p.hand.length>t.hand.length&&!G.over){log(`${p.g.name}视为使用【斩】`);fxCard(p,null,'zhan',false);await doZhan(p,t,null);}}},
 qijing:{times:2,can:p=>(p.tian||0)>0&&opp(p).hand.length>0,need:0,async run(p){p.tian--;steal(p,opp(p));}},
 paiyi:{can:p=>(p.quan||0)>0,need:0,async run(p){p.quan--;await damage(p,opp(p),1,sk(p,'paiyi'));}},
};
Object.assign(ACTIVES,NEW_ACTIVES);ACT_F.zhijian=c=>c.k==='yao'||['weapon','armor'].includes(CARD_DEFS[c.k].type);
function aiWant2(p,id){const t=opp(p);const zh=p.hand.filter(c=>c.k==='zhan').length;switch(id){
 case 'qibu':return p.hand.length>=3;case 'qice':return p.hand.length>=2&&p.hand.filter(c=>['bi','yao'].includes(c.k)).length<=1&&p.hand.length<=4;
 case 'junfa':return t.hand.length>=2;case 'fupo':return zh===0&&p.hand.filter(c=>!['bi','yao'].includes(c.k)).length>=2;
 case 'feijun':return p.hand.length>=2;case 'sanyao':return true;case 'tiaohe':return p.hand.length>=2;case 'gongqi':return zh>=1;
 case 'fenxun':return true;case 'anxu':return true;case 'zhijian':return true;case 'yangwei':return zh>=1&&p.hand.length>=3;
 case 'xianzhen':return zh>=1&&Math.max(...p.hand.map(c=>c.r))>=9;case 'mingce':return p.hand.length>=2;
 case 'xiongluan':return zh>=2||t.hp<=2;case 'fencheng':return t.hand.length<=2||G.turnNo>=6;case 'guhuo':return p.hand.length>=2;
 case 'taoluan':return p.hand.length>=2;case 'mouzhu':return true;case 'qijing':return true;case 'paiyi':return true;}return null;}
function aiSel2(p,act){const k=act.s.k;if(k==='fupo'){const cs=aiDiscardOrder(p).filter(c=>!['bi','yao'].includes(c.k));return cs.length>=2?cs.slice(0,2):null;}
 if(k==='xianzhen')return [[...p.hand].sort((a,b)=>b.r-a.r)[0]];
 if(k==='guhuo'){const z=p.hand.find(c=>c.k==='zhan');return [z&&Math.random()<.5?z:aiDiscardOrder(p)[0]];}
 if(k==='junfa'){const cs=aiDiscardOrder(p).filter(c=>VAL[c.k]<=5);return cs.length?cs.slice(0,2):null;}
 if(k==='mingce'){return [aiDiscardOrder(p)[0]];}
 return undefined;}

// ---- 回合 ----
const FATIGUE_T=20;// 第11轮起每回合开始失去1点体力，防止拖局
async function turn(p){if(G.over)return;G.cur=p;p.zyMode=null;Object.assign(p,{zhanUsed:0,used:{},extraZhan:0,yinxue:false,huxiaoUsed:false,luozhanOn:false,tianyiBonus:0,noZhan:false,zhaxiangOn:false,chifengFree:false,zhanguUsed:false,zhanguOn:false,usedCnt:0,trickUsed:false,dealt:false,hardNext:false,xianzhenOn:false,xiongluanOn:false,wzMinus:0,yangweiOn:false,fangquanOn:false,huangxuT:false});opp(p).noBi=false;G.turnNo++;G.guardT=opp(p).hp>=opp(p).maxHp?opp(p):null;if(window.HARNESS)window.__oppFull=opp(p).hp>=opp(p).maxHp;
 log(`—— 第${G.turnNo}回合：${p.g.name} ——`);render();const t=opp(p);
 if(G.turnNo>FATIGUE_T){log(`【兵疲】${p.g.name}失去1点体力`);await loseHp(p,1);if(G.over)return;}
 if(has(p,'zhiji')&&!p.woke&&!p.hand.length){p.woke=true;p.maxHp--;p.hp=Math.min(p.hp,p.maxHp);log(`${p.g.name}觉醒【${sk(p,'zhiji')}】`);await heal(p,1);drawCards(p,2);p.gained=[ZHANXING];}
 if(has(p,'qinxue')&&!p.woke&&(p.kejiN||0)>=2){p.woke=true;p.maxHp--;p.hp=Math.min(p.hp,p.maxHp);log(`${p.g.name}觉醒【${sk(p,'qinxue')}】，获得【攻心】`);drawCards(p,2);p.gained=[GONGXIN];if(p.hp<=0){await dying(p);if(G.over)return;}}
 await turnStart(p,t);if(G.over)return;
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
 n=await drawHooks(p,t,n);if(G.over)return;drawCards(p,Math.max(0,n));
 if(has(p,'haoshi')&&p.hand.length>5){const k=p.hand.length>>1;for(let i=0;i<k;i++){const c=p.hand[Math.random()*p.hand.length|0];p.hand=p.hand.filter(x=>x!==c);t.hand.push(c);}log(`${p.g.name}【${sk(p,'haoshi')}】交给对方${k}张牌`);render();}
 await sleep(300);
 if(!p.skipPlay&&has(p,'fangquan')&&await yesno(p,`发动【${sk(p,'fangquan')}】跳过出牌阶段？`,p.hand.length<=2&&t.hand.length>=2)){p.skipPlay=true;p.fangquanOn=true;}
 if(p.skipPlay){p.skipPlay=false;log(`${p.g.name}跳过出牌阶段`);}
 else if(p.ai)await aiPlay(p);else if(p.remote)await remotePlay(p);else await humanPlay(p);
 if(G.over)return;
 if(has(p,'keji')&&p.zhanUsed===0){p.kejiN=(p.kejiN||0)+1;log(`${p.g.name}【${sk(p,'keji')}】跳过弃牌阶段`);}else await discardPhase(p);
 await turnEnd(p,t);if(G.over)return;
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
async function discardPhase(p){const d0=G.discard.length;await discardPhase0(p);const got=G.discard.slice(d0);const t=opp(p);
 if(got.length>=2&&has(p,'xuanfeng')&&t.hand.length){log(`${p.g.name}【${sk(p,'xuanfeng')}】`);randDiscard(t);}
 if(got.length&&has(t,'guzheng')){const c=[...got].sort((a,b)=>VAL[b.k]-VAL[a.k])[0];G.discard=G.discard.filter(x=>x!==c);t.hand.push(c);log(`${t.g.name}【${sk(t,'guzheng')}】获得${cname(c)}`);render();}}
async function discardPhase0(p){let over=p.hand.length-handLimit(p);if(has(p,'yongsi')&&p.hand.length)over=Math.max(1,over);if(over<=0)return;
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
function aiSel(p,act){const a=act.a;{const r2=aiSel2(p,act);if(r2!==undefined)return r2;}if(act.s.k==='luanji'){const by={};for(const c of aiDiscardOrder(p))(by[isRed(c)]=by[isRed(c)]||[]).push(c);const g=Object.values(by).find(v=>v.length>=2);return g?g.slice(0,2):null;}if(act.s.k==='luanji'||act.s.k==='fanjian'){}
 if(act.s.k==='zhiheng'){const cs=p.hand.filter(c=>VAL[c.k]<=5||(c.k==='zhan'&&!canZhan(p)));return cs.length?cs:null;}
 if(act.s.k==='quce'||act.s.k==='tianyi'){const c=[...p.hand].sort((a,b)=>b.r-a.r)[0];return [c];}
 let pool=aiDiscardOrder(p).filter(a.filter||(()=>true));if(act.s.k==='qixi'){const zh=p.hand.filter(c=>c.k==='zhan').length;pool=pool.filter(c=>!['pozhen','bi','yao'].includes(c.k)&&(c.k!=='zhan'||zh>=2||!canZhan(p)));}if(pool.length<a.need)return null;return pool.slice(0,a.need);}
function aiWantSkill(p,id){const t=opp(p);const zh=p.hand.filter(c=>c.k==='zhan').length;{const w2=aiWant2(p,id);if(w2!==null)return w2;}switch(id){
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

const LIVELY_IDS=new Set([
 'caocao','zhangliao','xiahoudun','simayi','xuchu','dianwei','xunyu','guojia',
 'caoren','zhanghe','xuhuang','caopi','liubei','guanyu','zhangfei','zhugeliang',
 'zhaoyun','machao','huangzhong','weiyan','pangtong','jiangwei','huangyueying','fazheng',
 'sunquan','zhouyu','ganning','sunshangxiang','lusu','lvmeng','luxun','taishici',
 'huanggai','zhoutai','daqiao','xiaoqiao','lvbu','huatuo','diaochan','yuanshao',
 'dongzhuo','jiaxu','yanliang','wenchou','zhangjiao','gongsunzan','mateng','caiwenji',
 'caozhi','caozhang','xiahouyuan','yujin','yuejin','pangde','dengai','zhonghui',
 'xunyou','chengyu','manchong','wangyi','guanxing','zhangbao','guanping','madai',
 'wangping','maliang','masu','jiangwan','feiyi','liushan','zhurong','menghuo',
 'sunce','sunjian','chengpu','handang','lingtong','xusheng','dingfeng','zhuran',
 'zhugejin','bulianshi','yufan','zhangzhao','yuanshu','huaxiong','gaoshun','chengong',
 'zhangxiu','liru','zuoci','yuji','liubiao','zhangrang','kongrong','hejin']);
function portraitImg(id,alt){const lively=LIVELY_IDS.has(id);
 const src=lively?`assets/portraits/${id}.png`:`assets/portraits/${id}.svg`;
 const cls=lively?' class="portrait-illust"':'';
 const fb=lively?` onerror="this.onerror=null;this.classList.remove('portrait-illust');this.src='assets/portraits/${id}.svg'"`:'';
 return `<img${cls} alt="${alt}" src="${src}"${fb}>`;}

// ---- 渲染 ----
function shake(p){const el=$(p.i?'#ai':'#me');el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');}
function hpBar(p){let s='';for(let i=0;i<p.maxHp;i++)s+=`<i class="${i<p.hp?'on':''}"></i>`;return s;}
function markTexts(p){const a=[];if(p.az){const mine=p.i===0;a.push(p.azDone?`暗志·${AZ[p.az].n}✓`:mine?`暗志·${AZ[p.az].n}?`:'暗志');}if(G.zyOn&&!p.zyUsed&&p.i===0)a.push('抉择');if((p.tian||0)>0)a.push('田 '+(p.tian||0));if((p.quan||0)>0)a.push('权 '+(p.quan||0));if(p.ying)a.push('营');if(p.noZhan)a.push('不能出斩');if((p.extraZhan||0)>0)a.push('斩+'+(p.extraZhan||0));if(p.woke)a.push('已觉醒');if(p.zhanguOn)a.push('战鼓');if(p.tianyiBonus)a.push('天义');if(p.hardNext)a.push('不可避');if(p.xianzhenOn)a.push('陷阵');if(p.luozhanOn)a.push('裸战');if(p.yangweiOn)a.push('扬威');if(p.xiongluanOn)a.push('雄乱');if(p.skipPlay)a.push('跳过出牌');if(p.guose)a.push('国色');if((p.drawMinus||0)>0)a.push('少摸 '+(p.drawMinus||0));if((p.wzMinus||0)>0)a.push('上限-'+(p.wzMinus||0));if((p.zhichiT||0)===G.turnNo&&G.cur&&G.cur!==p)a.push('智迟');return a;}
function skillRow(p){const got=p.gained||[];return skillsOf(p).map(s=>`<span${got.indexOf(s)>=0?' class="gained"':''} title="${s.t||''}">${s.n}</span>`).join('')+markTexts(p).map(t=>`<span class="mark">${t}</span>`).join('');}
function skillSheetHtml(which){const p=G.P[which];const innate=p.g.skills.map(s=>`<p><b>【${s.n}】</b>${s.t}</p>`).join('');const gained=(p.gained||[]).length?p.gained.map(s=>`<p><b>【${s.n}】</b>获得。${s.t||''}</p>`).join(''):'';const marks=markTexts(p);return `<h3>${which===0?'己方技能':'对方技能'}</h3>${innate}${gained}${marks.length?`<p><b>状态</b> ${marks.join('、')}</p>`:''}<p><b>武器</b> ${equipText(p.weapon)}</p><p><b>防具</b> ${equipText(p.armor)}</p>`;}
function syncSkillSheet(){const sheet=$('#skillSheet');if(skillWho==null||!sheet||!sheet.classList||typeof sheet.classList.contains!=='function'||sheet.classList.contains('hide'))return;const body=$('#skillBody');if(body&&G.P&&G.P[skillWho])body.innerHTML=skillSheetHtml(skillWho);}
function skillBtnText(p,act){const used=(p.used||{})[act.s.k]||0,times=act.a.times||1;if(act.a.limited&&!usedUp(p,act))return `技能·${act.s.n} 限定`;if(act.a.limited&&usedUp(p,act))return '限定已发动';if(times>=99)return `技能·${act.s.n}`;return `技能·${act.s.n} ${used}/${times}`;}
function seat(p){const fc=FACTIONS[p.g.f];
 return `<div class="portrait f-${p.g.f}">${portraitImg(p.g.id,p.g.name)}<span class="fac">${fc.n}</span></div>
 <div class="info"><div class="name">${p.g.name}${G.cur===p&&!G.over?' <em>行动中</em>':''}</div><div class="hp">${hpBar(p)}<span class="hpnum">体力 ${p.hp}/${p.maxHp}</span></div>
 <div class="skills">${skillRow(p)}</div>
 <div class="equip">${['weapon','armor'].map(s=>p[s]?`<span title="${CARD_DEFS[p[s].k].t}">${s==='weapon'?'⚔':'🛡'}${cn(p[s].k)}</span>`:'').join('')}</div>
 <div class="cnt">手牌 ${p.hand.length}</div></div>`;}

// 焦点和属性在模拟器的假节点上不存在，调用前先看是不是函数。
function focusEl(el){if(el&&typeof el.focus==='function')el.focus();}
function setAttr(el,name,value){if(!el)return;if(value==null){if(typeof el.removeAttribute==='function')el.removeAttribute(name);}else if(typeof el.setAttribute==='function')el.setAttribute(name,value);}
function syncExit(){const exit=$('#exit');if(exit)exit.disabled=!!promptOpen;}
function showScrim(){const s=$('#scrim');if(s)s.classList.remove('hide');}
function hideScrim(){if(promptOpen)return;const s=$('#scrim');if(s)s.classList.add('hide');}
// #table 是特效层的定位包含块。展开的日志若留在里面，就会贴在中区而不是壳底，所以展开时挂回 #app。
function parkLog(){const sheet=$('#logSheet'),app=$('#app');if(!sheet||!app||sheet.parentNode===app||typeof app.appendChild!=='function')return;app.appendChild(sheet);}
function restoreLog(){const sheet=$('#logSheet'),exit=$('#exit'),home=exit&&exit.parentNode;if(!sheet||!home||sheet.parentNode===home||typeof home.insertBefore!=='function')return;home.insertBefore(sheet,exit);}
function collapseLog(){logExpanded=false;restoreLog();const sheet=$('#logSheet');if(sheet)sheet.classList.remove('is-open');setAttr($('#log'),'aria-hidden','true');const btn=$('#logOpen');if(btn){setAttr(btn,'aria-label','完整日志');btn.textContent='';btn.className='';}}
function closeSheets(){['skillSheet','ruleSheet','statsSheet','exitConfirm'].forEach(id=>{const el=$('#'+id);if(el)el.classList.add('hide');});const d=$('#detail');if(d){d.classList.add('hide');d.innerHTML='';}collapseLog();exitOpen=false;sheetOpener=null;skillWho=null;hideScrim();}
function openSheet(sheet,closeSel,opener){closeSheets();if(sheet)sheet.classList.remove('hide');showScrim();sheetOpener=opener||null;const btn=closeSel?$(closeSel):null;if(btn)btn.onclick=()=>dismissSheet();focusEl(btn);}
function dismissSheet(){const back=sheetOpener;closeSheets();focusEl(back);}
function toggleLog(){if(promptOpen)return;if(logExpanded){collapseLog();hideScrim();focusEl($('#logOpen'));return;}closeSheets();logExpanded=true;const sheet=$('#logSheet');if(sheet)sheet.classList.add('is-open');parkLog();const log=$('#log');if(log&&typeof log.removeAttribute==='function')log.removeAttribute('aria-hidden');const btn=$('#logOpen');if(btn){btn.textContent='关闭';btn.className='btn-on-paper';setAttr(btn,'aria-label','关闭');}showScrim();focusEl(btn);}
function onScrim(){if(promptOpen)return;if(exitOpen){closeExit();return;}const back=logExpanded?$('#logOpen'):sheetOpener;closeSheets();focusEl(back);}
function openExit(){if(promptOpen)return;const exit=$('#exit');if(exit&&exit.disabled)return;closeSheets();exitOpen=true;const box=$('#exitConfirm');if(box)box.classList.remove('hide');showScrim();focusEl($('#exitStay'));}
function closeExit(){exitOpen=false;const box=$('#exitConfirm');if(box)box.classList.add('hide');hideScrim();focusEl($('#exit'));}
function leaveMatch(){if(NET)location.href=location.pathname;else location.reload();}
function equipText(card){if(!card)return '无';const d=CARD_DEFS[card.k];return d?`${d.n}：${d.t}`:'无';}
function showSkill(which){if(promptOpen||!G.P)return;const p=G.P[which];if(!p||!p.g)return;const body=$('#skillBody');if(!body)return;body.innerHTML=skillSheetHtml(which);openSheet($('#skillSheet'),'#skillClose',$(which===0?'#me':'#ai'));skillWho=which;}
function showPrompt(msg,opts,onChoose){closeSheets();promptOpen=true;const box=$('#prompt');box.innerHTML='';const p=document.createElement('p');p.textContent=msg;box.appendChild(p);const wrap=document.createElement('div');wrap.className='prompt-opts'+(opts.length===2?' cols-2':'');for(const o of opts){const b=document.createElement('button');b.type='button';b.className='btn-secondary';b.textContent=o.label;b.onclick=()=>{box.classList.add('hide');promptOpen=false;syncExit();hideScrim();onChoose(o.val);};wrap.appendChild(b);}box.appendChild(wrap);box.classList.remove('hide');showScrim();syncExit();}
function commitPlay(c){if(playCommit||!c)return;playCommit=true;const bar=$('#actions');if(bar&&bar.children&&typeof bar.children.length==='number'){for(const b of bar.children)if(b&&b.tagName==='BUTTON')b.disabled=true;}const guest=!!(NET&&NET.role==='guest');const waiting=!!pending;resolveUser({t:'card',c});if(!guest&&!waiting)playCommit=false;}
function bindPlaySwipe(el,c){let sx=0,sy=0,scrolling=false,pid=null;el.onpointerdown=e=>{if(playCommit||e.isPrimary===false)return;if(typeof e.button==='number'&&e.button!==0)return;sx=e.clientX;sy=e.clientY;scrolling=false;pid=e.pointerId;if(typeof el.setPointerCapture==='function'&&e.pointerId!=null){try{el.setPointerCapture(e.pointerId);}catch(err){}}};el.onpointermove=e=>{if(pid==null||e.pointerId!==pid||playCommit)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy))scrolling=true;};el.onpointerup=e=>{if(pid==null||e.pointerId!==pid||playCommit)return;pid=null;const dx=e.clientX-sx,dy=e.clientY-sy;if(scrolling)return;if(Math.hypot(dx,dy)<10){playSel=null;render();return;}if(dy<=-48&&Math.abs(dx)<=24&&Math.abs(dy)>Math.abs(dx)){el.onpointerdown=el.onpointermove=el.onpointerup=el.onpointercancel=null;commitPlay(c);}};el.onpointercancel=e=>{if(pid==null||e.pointerId===pid)pid=null;};}
function copyRoomLink(){const input=$('#rl');const text=input&&input.value||'';const done=ok=>{const cp=$('#cp');if(!cp)return;if(ok){cp.textContent='已复制';return;}cp.textContent='复制失败，请长按链接';if(input&&typeof input.focus==='function')input.focus();if(input&&typeof input.select==='function')input.select();};const fallback=()=>{if(input&&typeof input.focus==='function')input.focus();if(input&&typeof input.select==='function')input.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){ok=false;}done(!!ok);};if(navigator.clipboard&&window.isSecureContext&&typeof navigator.clipboard.writeText==='function'){try{navigator.clipboard.writeText(text).then(()=>done(true),fallback);}catch(e){fallback();}return;}fallback();}
function layoutHand(hand){const n=hand.children.length;hand.classList.remove('hand-overlap');hand.style.setProperty('--cols',String(Math.max(4,Math.ceil(n/2))));}
function render(){if(!G.P)return;if(window.HARNESS){for(const p of G.P)if(p.hand.some(c=>!c))throw new Error('undef card '+p.g.id+' '+new Error().stack);}if(NET&&NET.role==='host'&&G.P[1].remote)send(snap());const [me,ai]=G.P;
 $('#ai').innerHTML=seat(ai);$('#me').innerHTML=seat(me);syncSkillSheet();
 $('#aihand').innerHTML=ai.hand.map(()=>'<div class="card back"></div>').join('');
 $('#deckinfo').textContent=`牌堆 ${G.deck.length}`;$('#discardinfo').textContent=`弃牌 ${G.discard.length}`;
 const localPlay=G.phase==='play'&&G.cur===me;
 if(!localPlay||!playSel||!me.hand.includes(playSel)||!canPlay(me,playSel)){playSel=null;playCommit=false;}
 const hand=$('#hand');hand.innerHTML='';
 for(const c of me.hand){const D=CARD_DEFS[c.k];const el=document.createElement('div');el.className=`card ${D.type} k-${c.k}`;el.innerHTML=`<b>${D.n}</b><i class="suit ${isRed(c)?'red':''}">${cs(c)}</i><small>${D.t}</small>`;el.title=D.t;
  if(localPlay&&canPlay(me,c)){el.classList.add('ok');
   if(playSel===c){el.classList.add('sel');if(el.style)el.style.touchAction='none';bindPlaySwipe(el,c);}
   else el.onclick=()=>{playSel=c;render();};}
  if(G.phase==='discard'||G.phase==='skill'){const okc=!G.selFilter||G.selFilter(c);if(okc)el.classList.add('ok');if(G.sel.includes(c))el.classList.add('sel');el.onclick=()=>{if(!okc)return;G.sel.includes(c)?G.sel=G.sel.filter(x=>x!==c):G.sel.length<G.needSel&&G.sel.push(c);render();};}
  hand.appendChild(el);}layoutHand(hand);
 const bar=$('#actions');bar.innerHTML='';tutTip(me);
 syncExit();
 if(G.over)return;
 const btn=(t,fn,dis,primary=true)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.disabled=!!dis;b.className=primary?'btn-primary':'btn-secondary';b.onclick=fn;bar.appendChild(b);};
 if(localPlay){if(playSel){btn('确认打出',()=>commitPlay(playSel),playCommit);btn('取消',()=>{if(playCommit)return;playSel=null;render();},playCommit,false);}
  else{const act=activeOf(me);if(act)btn(skillBtnText(me,act),()=>startSkill(me,act),usedUp(me,act)||!act.a.can(me));btn('结束出牌',()=>resolveUser({t:'end'}));}}
 if(G.phase==='discard')btn(`弃牌 ${G.sel.length}/${G.needSel}`,()=>resolveUser(true),G.sel.length!==G.needSel);
 if(G.phase==='skill'){btn(`确认 ${G.sel.length}${G.selAct&&G.selAct.a.needAny?'':'/'+G.needSel}`,()=>{const cards=G.sel;G.sel=[];G.selFilter=null;G.phase='busy';G.skillDone(cards);},!(G.selAct&&validSel(G.selAct,G.sel)));btn('取消',()=>{G.sel=[];G.selFilter=null;G.phase='play';render();},false,false);}
 if(!G.phase||G.cur!==me)bar.innerHTML='<span class="wait">'+(G.cur===me?'…':(NET?'对手思考中…':'AI 思考中…'))+'</span>';
}
function startSkill(p,act){const go=cards=>{if(NET&&NET.role==='guest'){resolveUser({t:'skill',cids:cards.map(c=>c.id)});return;}markUsed(p,act);if(!act.a.silent)log(`${p.g.name}发动【${act.s.n}】`);resolveUser({t:'skill',run:()=>act.a.run(p,cards)});};
 if(!act.a.need){go([]);return;}
 G.phase='skill';G.sel=[];G.selAct=act;G.needSel=act.a.needAny?p.hand.length:act.a.need;G.selFilter=act.a.filter||null;G.skillDone=go;render();}

// ---- 联机（PeerJS，房主权威） ----
let NET=null,rpending=null;
function send(m){if(NET&&NET.conn&&NET.conn.open)NET.conn.send(m);}
function waitRemote(f){return new Promise(r=>rpending={r,f});}
function snap(){const R=G.P[1];const v=p=>({i:p===R?0:1,id:p.g.id,hp:p.hp,maxHp:p.maxHp,hand:p===R?p.hand:p.hand.length,weapon:p.weapon,armor:p.armor,zhanUsed:p.zhanUsed,extraZhan:p.extraZhan,used:p.used,limitUsed:p.limitUsed,gained:p.gained,noZhan:p.noZhan,tian:p.tian,quan:p.quan,woke:p.woke,ying:p.ying,zhanguOn:p.zhanguOn,tianyiBonus:p.tianyiBonus,hardNext:p.hardNext,xianzhenOn:p.xianzhenOn,luozhanOn:p.luozhanOn,yangweiOn:p.yangweiOn,xiongluanOn:p.xiongluanOn,skipPlay:p.skipPlay,zhichiT:p.zhichiT,guose:p.guose,drawMinus:p.drawMinus,wzMinus:p.wzMinus,az:(p===R||p.azDone)?p.az:(p.az?'?':null),azDone:p.azDone,zyUsed:p.zyUsed});
 return {type:'state',P:[v(R),v(G.P[0])],cur:G.cur===R?0:G.cur?1:-1,phase:G.rphase||'',need:G.rneed||0,deck:G.deck.length,disc:G.discard.length,over:G.over,turnNo:G.turnNo};}
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
 if(m.type==='fx'){if(m.kind==='card'){const p=G.P&&G.P[m.w];if(p)paintFxCard(p,m.key,m.suit,!!m.red,!!m.faceDown);}else if(m.kind==='skill')paintSkill(m.name);else if(m.kind==='intro'){const a=GENERALS.find(g=>g.id===m.a),b=GENERALS.find(g=>g.id===m.b);if(a&&b)paintIntro(a,b,m.ta,m.tb);}else if(m.kind==='line'){const p=G.P&&G.P[m.w];if(p)paintLine(p,m.text,m.cls);}else{const p=G.P&&G.P[m.w];if(p)paintFloat(p,m.txt,m.cls);}}
 if(m.type==='state'){$('#select').classList.add('hide');$('#detail').classList.add('hide');$('#battle').classList.remove('hide');
  const P=m.P.map(v=>({...v,g:GENERALS.find(g=>g.id===v.id),hand:Array.isArray(v.hand)?v.hand:Array.from({length:v.hand},()=>({}))}));
  if(G.phase!==m.phase||m.phase==='play'){G.sel=G.phase===m.phase?G.sel||[]:[];}
  if(G.phase==='skill'&&m.phase==='play'){}else G.phase=m.phase;
  Object.assign(G,{P,cur:P[m.cur]||null,needSel:m.need,deck:{length:m.deck},discard:{length:m.disc},over:m.over,turnNo:m.turnNo||0});if(!G.sel)G.sel=[];render();}
 if(m.type==='ask')showPrompt(m.msg,m.opts,val=>send({type:'act',t:'ans',val}));
 if(m.type==='over'){G.over=true;render();promptOpen=false;$('#prompt').classList.add('hide');closeSheets();clearFx();const wg=GENERALS.find(g=>g.id===m.wid),lg=GENERALS.find(g=>g.id===m.lid);$('#over').innerHTML=(wg&&lg?overCard(m.win,wg,lg,m.seed,m.turn,''):`<h2>${m.win?'胜利！':'败北…'}</h2><p>${m.name} 获胜</p>`)+`<p>想再战请让房主新建房间</p><button class="btn-primary" type="button" onclick="location.href=location.pathname">返回首页</button>`;$('#over').classList.remove('hide');}
}
function setupConn(conn){NET.conn=conn;conn.on('data',onMsg);conn.on('close',()=>{if(!G.over)alert('对手已断开连接');});}
function newCode(){return Math.random().toString(36).slice(2,8).toUpperCase();}
function hostRoom(){if(typeof Peer==='undefined'){alert('联机组件加载失败，请检查网络后刷新');return;}
 const code=newCode();NET={role:'host',code};const peer=new Peer('sgduel-'+code);NET.peer=peer;
 const url=location.origin+location.pathname+'?room='+code;
 $('#lobby').innerHTML=`<p>房间 <b id="roomCode">${code}</b></p><input id="rl" readonly><button id="cp" class="btn-primary" type="button">复制房间链接</button><span id="ls">等待对手加入…</span>`;
 $('#rl').value=url;$('#rl').onclick=function(){if(typeof this.select==='function')this.select();};
 $('#cp').onclick=copyRoomLink;
 peer.on('error',e=>$('#ls').textContent='连接错误：'+e.type);
 peer.on('connection',conn=>{if(NET.conn){conn.close();return;}setupConn(conn);conn.on('open',()=>{
  const ids=shuffle(GENERALS.map(g=>g.id));NET.offers=[ids.slice(0,8),ids.slice(8,16)];
  send({type:'offer',ids:NET.offers[1]});$('#ls').textContent='对手已加入！请从 8 位武将中选择。';selectScreen(NET.offers[0]);});});}
function joinRoom(code){if(typeof Peer==='undefined'){alert('联机组件加载失败，请检查网络后刷新');return;}
 NET={role:'guest',code};$('#modes').classList.add('hide');$('#grid').innerHTML='';$('#lobby').innerHTML=`正在加入房间 <b>${code}</b>…`;
 const peer=new Peer();NET.peer=peer;peer.on('error',e=>$('#lobby').textContent='连接失败：'+e.type+'（房间可能已关闭）');
 peer.on('open',()=>{const conn=peer.connect('sgduel-'+code,{reliable:true});setupConn(conn);});}
function tryStartNet(){if(NET.myPick&&NET.guestPick)start(NET.myPick,NET.guestPick,true);else if(NET.myPick)$('#lobby').innerHTML='已选择，等待对手选将…';}

// ---- 首胜教程 ----
const TUT_ME='caocao',TUT_AI='xuchu';
function tutDone(){try{return localStorage.sgTutDone==='1';}catch(e){return true;}}
function tutDeal(){const [me,ai]=G.P;ai.hp=ai.maxHp=3;const take=k=>{const i=G.deck.findIndex(c=>c.k===k);return i<0?topCard():G.deck.splice(i,1)[0];};
 ['zhan','zhan','bi','yao'].forEach(k=>me.hand.push(take(k)));['zhan','zhan','yao'].forEach(k=>ai.hand.push(take(k)));
 for(let i=0;i<4;i++){const j=G.deck.findIndex(c=>c.k==='zhan');if(j>=0)G.deck.push(G.deck.splice(j,1)[0]);}
 log('【教程】跟着底部提示：出【斩】、用【避】、发动技能，再把许褚打到0体力即可通关。');render();}
function tutTip(me){const el=$('#tutTip');if(!el)return;const T=G.tut;if(!T||G.over){el.classList.add('hide');return;}el.classList.remove('hide');
 let t;if(G.cur===me&&G.phase==='play'){if(!T.zhan&&me.zhanUsed===0&&me.hand.some(c=>c.k==='zhan'))t='教程 ①：点选一张【斩】，再点「确认打出」（或上滑）攻击对方';
  else if(!T.skill)t='教程 ②：点底部「技能·挟令」发动曹操的技能';else if(!T.bi)t='教程：点「结束出牌」，等对方出【斩】时打出【避】';else t='教程：继续进攻，把许褚体力打到 0 即可通关';}
 else if(G.phase==='skill')t='教程：确认发动技能';else if(G.phase==='discard')t='教程：手牌超过上限，选牌弃掉';
 else t=T.bi?'教程：对方回合，稍候…':'教程 ③：对方出【斩】时，选择打出【避】抵消';
 el.textContent=t+`（斩${T.zhan?'✓':'·'} 避${T.bi?'✓':'·'} 技能${T.skill?'✓':'·'}）`;}
function startTutorial(){closeSheets();const g=GENERALS.find(x=>x.id===TUT_ME),a=GENERALS.find(x=>x.id===TUT_AI);start(g,a,false,true);}
// ---- 忠义 vs 权谋 ----
const ZY={wei:{a:'挟令立威',b:'屯田蓄锐'},shu:{a:'忠义斩将',b:'仁德养士'},wu:{a:'奇袭立威',b:'固守蓄锐'},qun:{a:'霸道立威',b:'权谋蓄锐'}};
async function zyChoice(p,t){if(!G.zyOn||p.zyUsed||G.over)return;p.zyUsed=true;const z=ZY[p.g.f]||ZY.qun;
 const ai=(t.hp<=2||p.hand.length>=3)?'wei':'xu';
 const v=await choose(p,`【忠义 vs 权谋】每局限一次，这张【斩】：`,[{label:`${z.a}：伤害+1，下回合少摸1`,val:'wei'},{label:`${z.b}：摸2张，伤害-1`,val:'xu'}],ai);
 p.zyMode=v==='xu'?'xu':'wei';log(`${p.g.name}抉择【${p.zyMode==='wei'?z.a:z.b}】`);paintSkill(p.zyMode==='wei'?z.a:z.b);
 if(p.zyMode==='wei')p.drawMinus=(p.drawMinus||0)+1;else drawCards(p,2);render();}
// ---- 暗志 ----
const AZ={toux:{n:'偷袭',t:'对满体力的对方造成伤害',r:'摸2张牌'},zhanshou:{n:'斩首',t:'令对方体力降至2或以下',r:'对方随机弃1张、你摸1张'},sishou:{n:'死守',t:'累计打出2张【避】',r:'回复1点体力'},yanghui:{n:'养晦',t:'自身体力降至2或以下',r:'摸1张并回复1点体力'}};
const AZ_KEYS=Object.keys(AZ);
function azCheck(p,k){if(!k||!p||p.az!==k||p.azDone||G.over)return;p.azDone=true;const a=AZ[k];log(`${p.g.name}翻开暗志【${a.n}】（${a.t}）：${a.r}`);paintSkill('暗志·'+a.n);
 if(k==='toux')drawCards(p,2);else if(k==='zhanshou'){randDiscard(opp(p),'因【斩首】');drawCards(p,1);}else if(k==='sishou'){if(p.hp<p.maxHp){p.hp++;float(p,'+1','good');}}else{drawCards(p,1);if(p.hp<p.maxHp){p.hp++;float(p,'+1','good');}}render();}
// ---- 残局挑战 ----
function pzProg(){return +(localStorage.sgPuzzle||0);}
function mkCard(spec){const [k,s]=spec.split(':');return {id:uid++,k,s:s||'spade',r:1+(Math.random()*13|0)};}
function puzzleDeal(pz){const [me,ai]=G.P;if(pz.meHp)me.hp=pz.meHp;ai.hp=pz.aiHp||ai.hp;me.hand=pz.hand.map(mkCard);ai.hand=pz.aiHand.map(mkCard);
 if(pz.weapon)me.weapon=mkCard(pz.weapon);if(pz.armor)me.armor=mkCard(pz.armor);if(pz.aiArmor)ai.armor=mkCard(pz.aiArmor);
 log(`【残局${pz.id}·${pz.name}】${pz.goal}`);render();}
function puzzleResult(me){const pz=G.mode.pz;const why=G.timeUp?`超过 ${pz.limit} 回合`:me?'':'你被击败';let t;
 if(me){if(pzProg()<pz.id)localStorage.sgPuzzle=pz.id;t=`<p class="tut-done">残局 ${pz.id}「${pz.name}」通关！${pz.id<PUZZLES.length?'已解锁下一关。':'全部 5 关已通关！'}</p>`;}
 else t=`<p>挑战失败：${why}。重开后初始局面完全相同。</p>`;
 return t+`<button class="btn-primary" type="button" onclick="startPuzzle(${me&&pz.id<PUZZLES.length?pz.id+1:pz.id})">${me&&pz.id<PUZZLES.length?'下一关':'重开本关'}</button><button class="btn-secondary" type="button" onclick="location.reload()">返回大厅</button>`;}
function openPuzzles(){const done=pzProg();const body=$('#puzzleBody');
 body.innerHTML='<h3>残局挑战</h3><p>预设场面，限定回合内取胜。通关解锁下一关。</p>'+PUZZLES.map(pz=>{const lock=pz.id>done+1;const me=GENERALS.find(g=>g.id===pz.me),ai=GENERALS.find(g=>g.id===pz.ai);
  return `<div class="pz-row${lock?' locked':''}"><p><b>${pz.id}. ${pz.name}</b> ${pz.id<=done?'✓':''}<br><small>${me.name} vs ${ai.name} · 限 ${pz.limit} 回合</small></p><button type="button" class="btn-primary" ${lock?'disabled':''} onclick="startPuzzle(${pz.id})">${lock?'未解锁':'挑战'}</button></div>`;}).join('');
 openSheet($('#puzzleSheet'),'#puzzleClose',$('#puzzleBtn'));}
function startPuzzle(id){const pz=PUZZLES.find(x=>x.id===id);if(!pz||id>pzProg()+1)return;
 if(G.P){location.href=location.pathname+'?pz='+id;return;}closeSheets();
 start(GENERALS.find(g=>g.id===pz.me),GENERALS.find(g=>g.id===pz.ai),false,false,{type:'puzzle',pz,seed:9000+id});}
// ---- 每日一战 ----
function dailyState(){try{return JSON.parse(localStorage.sgDaily||'{}');}catch(e){return {};}}
function dailyText(){const d=dailyState(),t=DAILY.today();return `连胜 ${d.streak||0} · 最佳 ${d.best||0} · 徽章 ${(d.wins||[]).length} 枚${d.last===t?' · 今日已获胜':''}`;}
function openDaily(){const seed=DAILY.today();const {pick,foe}=DAILY.pool(seed,GENERALS.map(g=>g.id));G.daily={seed,foe};
 selectScreen(pick);$('#selectTitle').textContent=`每日一战 ${seed} · 对手：${GENERALS.find(g=>g.id===foe).name}`;$('#lobby').textContent=dailyText();}
function dailyResult(me){const d=dailyState(),t=G.mode.seed;let msg;
 if(me){if(d.last!==t){d.streak=d.last===DAILY.yesterday()?(d.streak||0)+1:1;d.best=Math.max(d.best||0,d.streak);d.wins=(d.wins||[]).concat(t).slice(-366);d.last=t;localStorage.sgDaily=JSON.stringify(d);msg=`<p class="tut-done">获得今日徽章 🏅 ${t}！</p>`;}else msg='<p>今日徽章已领取，可明天再来。</p>';}
 else msg='<p>惜败。同一天重开局面一致，可再战。</p>';
 return msg+`<p>${dailyText()}</p><button class="btn-primary" type="button" onclick="location.href=location.pathname+'?daily=1'">再战今日</button><button class="btn-secondary" type="button" onclick="location.reload()">返回大厅</button>`;}
// ---- 选将 ----
let OFFER=[],PICK=null;
function fillSlot(g){PICK=g;const body=$('#picked-body'),btn=$('#confirm'),detail=$('#detailOpen');
 if(!g){body.innerHTML='<p class="slot-empty">点选一名武将</p>';btn.disabled=true;btn.textContent='出战';if(detail)detail.disabled=true;return;}
 const fc=FACTIONS[g.f];
 body.innerHTML=`${portraitImg(g.id,g.name)}<div class="slot-meta"><p class="slot-name"><span class="fac">${fc.n}</span>${g.name}</p><p class="slot-hp">体力 ${g.hp}</p></div>`;
 btn.disabled=false;btn.textContent='出战';if(detail)detail.disabled=false;
 if(typeof body.querySelector==='function'){const img=body.querySelector('img');if(img)img.onclick=()=>{if(PICK)showDetail(PICK);};}}
function confirmPick(){const g=PICK;if(!g)return;closeSheets();
 if(!NET&&G.daily){start(g,GENERALS.find(x=>x.id===G.daily.foe),false,false,{type:'daily',seed:G.daily.seed*100+GENERALS.indexOf(g)});return;}
 if(!NET){const pool=GENERALS.filter(x=>x!==g);start(g,pool[Math.random()*pool.length|0],false);return;}
 if(NET.role==='guest'){send({type:'pick',id:g.id});$('#grid').innerHTML='';$('#lobby').innerHTML=`你选择了${g.name}，等待房主选将…`;$('#confirm').disabled=true;$('#confirm').textContent='等待对手';return;}
 if(!NET.conn)return;NET.myPick=g;$('#grid').innerHTML='';$('#confirm').disabled=true;$('#confirm').textContent='等待对手';tryStartNet();}
function selectScreen(ids){closeSheets();const root=$('#select');root.classList.remove('screen-lobby');root.classList.add('screen-select');fillSlot(null);
 const grid=$('#grid');grid.innerHTML='';OFFER=ids||shuffle(GENERALS.map(g=>g.id)).slice(0,8);
 for(const id of OFFER){const g=GENERALS.find(x=>x.id===id);const fc=FACTIONS[g.f];const el=document.createElement('div');el.className=`gcard f-${g.f}`;
  const title=g.skills.map(s=>`【${s.n}】${s.t}`).join('\n');
  el.innerHTML=`${portraitImg(g.id,g.name)}<div class="faction-bar"></div><div class="gn"><span class="fac">${fc.n}</span>${g.name}<small>体力 ${g.hp}</small></div><div class="skill-line" title="${title}">${g.skills[0].t}</div>`;
  el.onclick=()=>{closeSheets();for(const n of grid.children)n.classList.remove('is-picked');if(PICK===g){fillSlot(null);return;}el.classList.add('is-picked');fillSlot(g);};
  grid.appendChild(el);}
 const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');$('#stats').textContent=`人机战绩 ${st.w} 胜 ${st.l} 负 · 武将池 ${GENERALS.length} 位，每局随机 8 位`;}
function showDetail(g){if(!g)return;const d=$('#detail');const fc=FACTIONS[g.f];
 openSheet(d,null,$('#detailOpen'));
 d.innerHTML=`<button id="cl" class="btn-on-paper" type="button">关闭</button>${portraitImg(g.id,g.name)}<h3>${fc.n}·${g.name}</h3><p>体力 ${g.hp}</p>${g.skills.map(s=>`<p><b>【${s.n}】</b>${s.t}</p>`).join('')}`;
 const btn=$('#cl');if(btn)btn.onclick=()=>dismissSheet();focusEl(btn);}
async function start(g,ag,net,tut,mode){if(mode&&mode.seed!=null)Math.random=SEEDRNG(mode.seed);
 $('#select').classList.add('hide');$('#battle').classList.remove('hide');
 const mk=(i,gg,ai)=>({i,g:gg,ai,hp:gg.hp,maxHp:gg.hp,hand:[],weapon:null,armor:null,zhanUsed:0,used:{},gained:[]});
 Object.assign(G,{deck:buildDeck(),discard:[],P:[mk(0,g,AUTO),mk(1,ag,!net)],over:false,turnNo:0,phase:'',sel:[],seed:Math.random()*1e6|0,zyOn:false,tut:tut?{zhan:false,bi:false,skill:false}:null,mode:mode||null,myTurns:0});
 if(net)G.P[1].remote=true;
 log(net?`房主选择了${g.name}，对手选择了${ag.name}`:`你选择了${g.name}，AI 选择了${ag.name}`);
 await showIntro(G.P[0],G.P[1]);
if(!tut&&!(mode&&mode.type==='puzzle')){G.zyOn=true;G.P.forEach(p=>{p.az=AZ_KEYS[Math.random()*AZ_KEYS.length|0];});}
 if(mode&&mode.type==='puzzle')puzzleDeal(mode.pz);else if(tut)tutDeal();else G.P.forEach(p=>{drawCards(p,4);if(has(p,'huanshen'))gainSafe(p);});
 let cur=tut||(mode&&mode.type==='puzzle')?0:Math.random()<.5?0:1;log(`${G.P[cur].g.name} 先手`);
 while(!G.over){if(cur===0&&G.mode&&G.mode.type==='puzzle'&&++G.myTurns>G.mode.pz.limit){log(`【残局】已超过 ${G.mode.pz.limit} 回合，挑战失败`);G.timeUp=true;endGame(G.P[1]);break;}await turn(G.P[cur]);cur=1-cur;}}
function initLobby(){const room=new URLSearchParams(location.search).get('room');
 $('#pve').onclick=()=>{closeSheets();selectScreen();};$('#host').onclick=()=>{$('#modes').classList.add('hide');hostRoom();};
 const st=JSON.parse(localStorage.sgStats||'{"w":0,"l":0}');$('#stats').textContent=`人机战绩 ${st.w} 胜 ${st.l} 负 · 武将池 ${GENERALS.length} 位，每局随机 8 位`;
 $('#confirm').onclick=confirmPick;
 $('#back').onclick=()=>location.reload();
 $('#statsOpen').onclick=()=>openSheet($('#statsSheet'),'#statsClose',$('#statsOpen'));
 $('#rules').onclick=()=>openSheet($('#ruleSheet'),'#ruleClose',$('#rules'));
 $('#detailOpen').onclick=()=>{if(PICK)showDetail(PICK);};
 $('#exit').onclick=openExit;$('#exitStay').onclick=closeExit;$('#exitLeave').onclick=leaveMatch;
 $('#me').onclick=()=>{if(!promptOpen&&G.P)showSkill(0);};
 $('#ai').onclick=()=>{if(!promptOpen&&G.P)showSkill(1);};
 $('#logOpen').onclick=toggleLog;$('#scrim').onclick=onScrim;
 $('#puzzleBtn').onclick=openPuzzles;$('#dailyBtn').onclick=()=>{closeSheets();openDaily();};
 if(room){joinRoom(room.toUpperCase());return;}
 if(!window.HARNESS&&!/auto/.test(location.search)&&!tutDone()){$('#pve').textContent='首胜教程（约 3 分钟）';$('#pve').onclick=startTutorial;$('#host').classList.add('hide');$('#puzzleBtn').classList.add('hide');$('#dailyBtn').classList.add('hide');$('#selectTitle').textContent='新手请先完成首胜教程';return;}
 const q=new URLSearchParams(location.search);setTimeout(()=>{if(q.get('pz'))startPuzzle(+q.get('pz'));else if(q.get('daily'))openDaily();},0);}
$('#ruleBox').innerHTML='<h3>规则</h3><p>回合：摸2张 → 出牌 → 弃牌至手牌上限（=当前体力）。把对方体力打到0即获胜。双方起手4张。</p><p><b>花色与判定</b>：每张牌有花色（♠♥♣♦）与点数（A–K），判定=亮出牌堆顶一张牌；拼点=双方各出一张手牌比点数。</p><p><b>护体</b>：回合开始时对方体力全满，则本回合无法将其击杀（至多打到1）。</p><p><b>兵疲</b>：第21回合起，每名角色回合开始时失去1点体力。</p>'+Object.values(CARD_DEFS).map(d=>`<p><b>【${d.n}】</b>×${d.cnt} ${d.t}</p>`).join('');
initLobby();
const AUTO=/auto/.test(location.search);if(AUTO&&!window.HARNESS){window.onerror=e=>document.title="ERR "+e;window.onunhandledrejection=e=>document.title="ERR "+(e.reason&&e.reason.stack||e.reason);window.onGameOver=w=>{if(!/^ERR/.test(document.title))document.title="OVER "+w.g.id+" T"+G.turnNo;};{const g=GENERALS[+(location.search.split("g=")[1]||0)];const pool=GENERALS.filter(x=>x!==g);start(g,pool[Math.random()*pool.length|0],false);}}
