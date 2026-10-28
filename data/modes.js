// 残局挑战包 + 每日一战 配置
window.PUZZLES = [
 {id:1,name:'燕人怒吼',me:'zhangfei',ai:'huatuo',aiHp:1,limit:1,hand:['zhan:spade','zhan:club'],aiHand:['bi:spade'],
  goal:'1 回合内击败华佗。提示：张飞可连出两张【斩】，第二张需两张【避】才能抵消。'},
 {id:2,name:'百步穿杨',me:'huangzhong',ai:'simayi',meHp:3,aiHp:1,limit:1,hand:['zhan:club'],aiHand:['bi:spade','bi:club','bi:spade'],
  goal:'1 回合内击败司马懿。提示：【烈弓】——对方手牌数不小于你的体力时，你的【斩】不能被【避】抵消。'},
 {id:3,name:'辕门连弩',me:'lvbu',ai:'caoren',aiHp:1,limit:1,weapon:'liannu',hand:['zhan:spade','zhan:club'],aiHand:['bi:club','yao:heart'],
  goal:'1 回合内击败曹仁。提示：连珠弩让【斩】不限次数；【裂天】要两张【避】才能抵消。对方还藏着一张【药】。'},
 {id:4,name:'破阵赤锋',me:'guanyu',ai:'xiahoudun',aiHp:2,limit:1,hand:['pozhen:spade','zhan:heart','zhan:diamond'],aiHand:['bi:club'],
  goal:'1 回合内击败夏侯惇。提示：先【破阵】拆掉对方手里的【避】；【赤锋】每回合第一张红【斩】不计次数。'},
 {id:5,name:'枭姬长枪',me:'sunshangxiang',ai:'lvbu',meHp:3,aiHp:2,limit:2,hand:['changqiang:diamond','jianyu:heart','zhan:heart','bi:diamond','yao:heart'],aiHand:['zhan:spade','zhan:club','bi:spade'],
  deckTop:['zhan:heart','bi:heart','zhan:diamond','yao:diamond','bi:club','zhan:club','zhan:spade','zhan:heart','zhan:spade','bi:heart','zhan:diamond','bi:club'],
  goal:'2 回合内击败吕布，且自己存活。提示：装上【长枪】触发【枭姬】摸 2 张；先用【箭雨】逼出吕布的【避】，再出【斩】。吕布的【斩】需要两张【避】。'},
];
window.SEEDRNG = function(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
// 每日：本地日期 YYYYMMDD 为种子（用户时区），同日同池同对手同牌序
window.DAILY = {
 today(d){d=d||new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();},
 yesterday(){const d=new Date();d.setDate(d.getDate()-1);return DAILY.today(d);},
 pool(seed,ids){const r=SEEDRNG(seed*7+13),a=ids.slice();for(let i=a.length-1;i>0;i--){const j=r()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return {pick:a.slice(0,6),foe:a[6]};},
};
