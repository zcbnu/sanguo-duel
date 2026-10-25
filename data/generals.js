// 原创技能设计；武将名取自公共领域的三国历史人物
window.GENERALS = [
 {id:'caocao',name:'曹操',f:'wei',hp:4,skills:[{n:'挟令',t:'出牌阶段限一次：弃1张手牌，摸2张牌。',active:'xieling'}]},
 {id:'zhangliao',name:'张辽',f:'wei',hp:4,skills:[{n:'奔袭',t:'你的【斩】被【避】抵消后，摸1张牌。'}]},
 {id:'xiahoudun',name:'夏侯惇',f:'wei',hp:4,skills:[{n:'烈目',t:'你受到伤害后，伤害来源随机弃1张手牌。'}]},
 {id:'simayi',name:'司马懿',f:'wei',hp:3,skills:[{n:'深谋',t:'摸牌阶段多摸1张牌。'},{n:'隐忍',t:'你的手牌上限+2。'}]},
 {id:'liubei',name:'刘备',f:'shu',hp:4,skills:[{n:'仁望',t:'出牌阶段限一次：弃2张手牌，回复1点体力。',active:'renwang'}]},
 {id:'guanyu',name:'关羽',f:'shu',hp:4,skills:[{n:'傲刃',t:'你的【斩】造成伤害时，若对方手牌多于你，伤害+1。'}]},
 {id:'zhangfei',name:'张飞',f:'shu',hp:4,skills:[{n:'暴喝',t:'出牌阶段你可以使用两张【斩】。'}]},
 {id:'zhugeliang',name:'诸葛亮',f:'shu',hp:3,skills:[{n:'观天',t:'摸牌阶段多摸1张牌。'},{n:'空营',t:'你没有手牌时，【斩】对你无效。'}]},
 {id:'sunquan',name:'孙权',f:'wu',hp:4,skills:[{n:'权衡',t:'出牌阶段限一次：弃掉所有手牌，摸等量的牌+1。',active:'quanheng'}]},
 {id:'zhouyu',name:'周瑜',f:'wu',hp:3,skills:[{n:'雅量',t:'摸牌阶段多摸1张牌。'},{n:'焚江',t:'你的【烽火】【箭雨】造成的伤害+1。'}]},
 {id:'ganning',name:'甘宁',f:'wu',hp:4,skills:[{n:'劫营',t:'出牌阶段限一次：弃1张【避】，获得对方1张随机手牌。',active:'jieying'}]},
 {id:'sunshangxiang',name:'孙尚香',f:'wu',hp:3,skills:[{n:'弓腰',t:'你装备武器或防具时，摸2张牌。'},{n:'英姿',t:'你使用【药】回复2点体力。'}]},
 {id:'lvbu',name:'吕布',f:'qun',hp:4,skills:[{n:'裂天',t:'对方需连续打出两张【避】才能抵消你的【斩】。'}]},
 {id:'huatuo',name:'华佗',f:'qun',hp:3,skills:[{n:'妙手',t:'出牌阶段限一次：弃1张手牌，回复1点体力。',active:'miaoshou'},{n:'济世',t:'濒死时，你的【避】可当【药】使用。'}]},
 {id:'diaochan',name:'貂蝉',f:'qun',hp:3,skills:[{n:'月影',t:'回合结束时，摸1张牌。'},{n:'离间',t:'出牌阶段限一次：令对方随机弃1张手牌。',active:'lijian'}]},
 {id:'yuanshao',name:'袁绍',f:'qun',hp:4,skills:[{n:'乱矢',t:'出牌阶段限一次：弃2张手牌，视为使用一张【箭雨】。',active:'luanshi'}]},
];
window.FACTIONS={wei:{n:'魏',c:'#3b6fd8'},shu:{n:'蜀',c:'#d8463b'},wu:{n:'吴',c:'#2fa35a'},qun:{n:'群',c:'#8a8f9c'}};
