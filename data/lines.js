// 叙事文案表：恩怨开场白 / 绝境台词 / 败北遗言 / 战报地名。纯文本，零新资产。
window.LINES = {
 // 恩怨对局：key 为两将 id 按字母序以 | 连接；值为 {id: 该将对另一方说的话}
 rivals: {
  'caocao|xuchu':{xuchu:'主公且看，虎痴今日只练不杀！',caocao:'仲康，教教这新人如何出斩。'},
  'caocao|guanyu':{guanyu:'降汉不降曹，此番只论刀下高低。',caocao:'云长，挂印封金之恩，今日可还？'},
  'caocao|liubei':{caocao:'天下英雄，唯使君与操耳。',liubei:'青梅煮酒之言，今日以刀兵作答。'},
  'caocao|lvbu':{lvbu:'白门楼之恨，今日加倍奉还！',caocao:'缚虎不得不急，这次不会再松绳。'},
  'caocao|zhouyu':{zhouyu:'八十万大军？一把火足矣。',caocao:'赤壁之风，不会每次都替你吹。'},
  'caocao|yuanshao':{yuanshao:'四世三公，岂惧阉宦之后！',caocao:'本初，官渡的粮草烧得可还旺？'},
  'caocao|machao':{machao:'曹贼！还我父亲命来！',caocao:'马儿不死，吾无葬地矣……'},
  'caocao|sunquan':{caocao:'生子当如孙仲谋。',sunquan:'孟德，江东不是你能吞下的。'},
  'caocao|zhugeliang':{zhugeliang:'汉贼不两立，王业不偏安。',caocao:'卧龙出山，也挡不住天命所归。'},
  'guanyu|lvmeng':{lvmeng:'白衣渡江，荆州归东吴了。',guanyu:'鼠辈偷袭，可敢正面一战！'},
  'guanyu|huangzhong':{huangzhong:'长沙一别，老将箭未老。',guanyu:'汉升，当日你箭下留情，今日关某也不相让。'},
  'guanyu|luxun':{luxun:'书生一纸书信，将军可曾在意？',guanyu:'孺子小儿，也敢犯我荆州！'},
  'guanyu|xuhuang':{xuhuang:'今日乃国家之事，不敢以私废公。',guanyu:'公明，故人相见，便刀兵为礼。'},
  'guanyu|zhangliao':{zhangliao:'云长兄，土山之约，弟尚记得。',guanyu:'文远，各为其主，莫要留手。'},
  'liubei|lvbu':{lvbu:'大耳贼，辕门射戟之情你也忘了？',liubei:'丁原、董卓之鉴，我岂敢忘。'},
  'liubei|sunshangxiang':{sunshangxiang:'夫君，今日刀剑可不讲情面。',liubei:'夫人手下……还请轻些。'},
  'liubei|luxun':{luxun:'连营七百里，火起即败。',liubei:'二弟之仇，今日必报！'},
  'lvbu|zhangfei':{zhangfei:'三姓家奴，吃俺一矛！',lvbu:'环眼贼，虎牢关还没打够？'},
  'lvbu|guanyu':{guanyu:'虎牢关前未分胜负，今日了结。',lvbu:'人中吕布，马中赤兔，你也配？'},
  'diaochan|lvbu':{diaochan:'将军，连环之计，可曾悔过？',lvbu:'貂蝉……原来一切都是局。'},
  'zhangfei|zhaoyun':{zhangfei:'子龙，比比谁的枪快！',zhaoyun:'翼德，长坂坡下见真章。'},
  'zhouyu|zhugeliang':{zhouyu:'既生瑜，何生亮！',zhugeliang:'公瑾，东风借你，胜负却不借。'},
  'simayi|zhugeliang':{simayi:'空城一曲，这次我偏要进城。',zhugeliang:'仲达，巾帼之赠还合身否？'},
  'jiangwei|zhugeliang':{jiangwei:'丞相，弟子请试北伐之志。',zhugeliang:'伯约，让我看看你学了几分。'},
  'ganning|lingtong':{},
  'huanggai|zhouyu':{huanggai:'苦肉一计，老夫皮肉为你开路。',zhouyu:'公覆，这一棒，我只打真的。'},
  'machao|zhangfei':{zhangfei:'锦马超，葭萌关再战三百合！',machao:'燕人张翼德，挑灯夜战也奉陪！'},
  'sunquan|zhouyu':{zhouyu:'主公，内事不决问张昭，外事不决问瑜。',sunquan:'公瑾，今日便试试你的兵法。'},
  'guojia|caocao':{guojia:'主公，十胜十败之论，可要我当面讲？',caocao:'奉孝若在，何至于此……先过招吧。'},
  'xiahoudun|lvbu':{xiahoudun:'父精母血，不可弃也！拿命来！',lvbu:'独眼将军，还剩一只眼可要护好。'},
  'taishici|sunquan':{taishici:'大丈夫生于乱世，当带三尺剑立不世之功！',sunquan:'子义，这一回为我而战。'},
  'huatuo|guanyu':{huatuo:'刮骨疗毒尚且谈笑，将军可还忍得？',guanyu:'先生之恩，刀下留三分。'},
  'pangtong|zhugeliang':{pangtong:'卧龙凤雏，得一可安天下，今日比比？',zhugeliang:'士元，落凤坡前多加小心。'},
  'xiaoqiao|zhouyu':{xiaoqiao:'夫君，琴音错了，我可要回头看你。',zhouyu:'曲有误，周郎顾——今日不让。'},
 },
 // 势力关系兜底：{我方势力: {对方势力: [台词...]}}，同势力用 same
 faction: {
  wei:{shu:['织席贩履之辈，也敢称汉室宗亲？'],wu:['江东鼠辈，可知天下大势？'],qun:['乱世群雄，终归一统。'],same:['同殿为臣，今日只论高下。','魏营切磋，点到为止？不必！']},
  shu:{wei:['汉贼不两立，今日讨贼！'],wu:['孙刘之盟，就此作罢？'],qun:['匡扶汉室，先平你这一路！'],same:['桃园之义在心，刀下却不留情。','同为汉臣，今日各凭本事。']},
  wu:{wei:['长江天堑，岂容北人渡！'],shu:['荆州之账，今日一并清算。'],qun:['江东子弟，多才俊！'],same:['江东一家，切磋而已。','江东儿郎，先让我看看你的本事。']},
  qun:{wei:['挟天子以令诸侯？我偏不服！'],shu:['汉室已衰，何必苦撑？'],wu:['碧眼小儿，也想割据一方？'],same:['乱世之中，谁也不必让谁。','群雄并起，此路只容一人。']},
 },
 generic:['来者何人，报上名来！','今日一战，决出高下。'],
 // 绝境台词（体力首次跌破 1/3）
 despair:{
  caocao:'宁教我负天下人，休教天下人负我！',liubei:'二弟三弟，备……还撑得住。',guanyu:'玉可碎而不可改其白！',zhangfei:'燕人张翼德在此，谁敢决一死战！',
  zhugeliang:'鞠躬尽瘁，死而后已。',zhaoyun:'吾乃常山赵子龙，岂会退！',machao:'西凉铁骑，再冲一阵！',huangzhong:'老夫尚能开三石弓！',
  sunquan:'孤坐镇江东，岂能言败！',zhouyu:'大火将起，再撑片刻……',lvmeng:'士别三日，当刮目相看！',luxun:'忍得一时，方能一击！',
  ganning:'百骑劫营，再来一次！',taishici:'丈夫当带三尺剑……',huanggai:'这一身伤，便是苦肉！',zhoutai:'十二处伤疤，不差这一道。',
  lvbu:'吾乃吕奉先，谁能挡我！',diaochan:'妾身……还有一舞未尽。',simayi:'韬光养晦，等的就是此刻。',guojia:'咳……此计若成，胜负犹未可知。',
  xiahoudun:'父精母血，岂可轻弃！',dianwei:'古之恶来在此，主公先走！',zhangliao:'八百破十万，今日也一样！',jiangwei:'臣欲使社稷危而复安！',
 },
 // 败北遗言（被击杀时）
 defeat:{
  caocao:'吾一生纵横，终于此地……',liubei:'惟贤惟德，能服于人……',guanyu:'玉碎之时，亦是忠义……',zhangfei:'实在是……憋屈！',
  zhugeliang:'悠悠苍天，曷此其极……',zhaoyun:'子龙……尽力了。',machao:'西凉……再也回不去了。',huangzhong:'不服老……终究是老了。',
  sunquan:'父兄基业，孤……愧对。',zhouyu:'既生瑜……何生亮……',lvmeng:'荆州……归吴了吗……',luxun:'书生……终究还是书生。',
  ganning:'铃声……停了。',taishici:'未能立不世之功……',huanggai:'这一次，是真的痛……',zhoutai:'伤疤……终于不用再添了。',
  lvbu:'大丈夫……岂能久居人下……',diaochan:'这乱世，终究容不下一支舞。',simayi:'百忍成空……',guojia:'可惜……天不假年。',
  xiahoudun:'眼……看不清了。',dianwei:'主公……快走……',zhangliao:'辽来辽来……来不了了。',jiangwei:'吾计不成，乃天命也！',
 },
 despairFb:{wei:'魏武之风，岂会就此折断！',shu:'汉室未兴，岂能倒下！',wu:'江东儿郎，宁死不退！',qun:'乱世浮沉，我还没认输！'},
 defeatFb:{wei:'霸业……未竟……',shu:'愧对……先帝……',wu:'江东……再会了……',qun:'这乱世……我认了……'},
 places:['官渡','赤壁','长坂','虎牢关','夷陵','合肥','街亭','定军山','汉中','樊城','下邳','濡须口','五丈原','襄阳','许昌','建业','成都','白帝城'],
 verbs:['击溃','大破','斩落','力克','智取'],
};
window.LINE = {
 pick(a){return a[Math.random()*a.length|0];},
 intro(me,foe){const L=LINES,k=[me.id,foe.id].sort().join('|'),r=L.rivals[k];if(r&&r[me.id])return r[me.id];
  const f=L.faction[me.f];const arr=f&&(me.f===foe.f?f.same:f[foe.f]);return LINE.pick(arr||L.generic);},
 despair(g){return LINES.despair[g.id]||LINES.despairFb[g.f]||'还没结束！';},
 defeat(g){return LINES.defeat[g.id]||LINES.defeatFb[g.f]||'……';},
 report(w,l,seed){const s=Math.abs(seed|0);const P=LINES.places,V=LINES.verbs;return `${w.name}于${P[s%P.length]}之战${V[(s>>3)%V.length]}${l.name}`;},
};
(function(){const r={};for(const k in LINES.rivals)r[k.split('|').sort().join('|')]=LINES.rivals[k];LINES.rivals=r;})();
