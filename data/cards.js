// 原创卡牌：[key, 名称, 类型, 数量, 说明]
window.CARD_DEFS = {
 zhan:{n:'斩',type:'basic',cnt:24,t:'对对方造成1点伤害，对方可打出【避】抵消。每回合限1张。'},
 bi:{n:'避',type:'basic',cnt:14,t:'抵消一张【斩】或【箭雨】。'},
 yao:{n:'药',type:'basic',cnt:8,t:'回复1点体力；濒死时也可使用。'},
 yexi:{n:'夜袭',type:'trick',cnt:3,t:'获得对方1张随机手牌。'},
 liangcao:{n:'粮草',type:'trick',cnt:3,t:'摸2张牌。'},
 fenghuo:{n:'烽火',type:'trick',cnt:2,t:'对方须弃1张【斩】，否则受到1点伤害。'},
 jianyu:{n:'箭雨',type:'trick',cnt:2,t:'对方须打出【避】，否则受到1点伤害。'},
 pozhen:{n:'破阵',type:'trick',cnt:3,t:'弃掉对方一件装备，没有则随机弃1张手牌。'},
 dantiao:{n:'单挑',type:'trick',cnt:2,t:'双方从对方开始轮流打出【斩】，先不出者受到1点伤害。'},
 liannu:{n:'连珠弩',type:'weapon',cnt:1,t:'武器：【斩】不限次数。'},
 pojia:{n:'破甲刀',type:'weapon',cnt:1,t:'武器：你的【斩】无视对方防具。'},
 zhongchui:{n:'流星锤',type:'weapon',cnt:1,t:'武器：你的【斩】被抵消后，对方随机弃1张手牌。'},
 tengdun:{n:'藤盾',type:'armor',cnt:1,t:'防具：需要【避】时，有40%几率自动抵消。'},
 tiejia:{n:'玄铁甲',type:'armor',cnt:1,t:'防具：【烽火】【箭雨】对你无效。'},
};
