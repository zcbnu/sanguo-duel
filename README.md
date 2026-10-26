# 三国对决 Sanguo Duel
原创三国主题 1v1 人机卡牌对战（浏览器）。16 位武将、原创技能与卡牌。caocao、guanyu、zhouyu、lvbu、zhugeliang、diaochan、dianwei、huatuo 使用活泼半写实插画 PNG，其余武将仍用 `tools/portraits.js` 生成的卡通像素 SVG。

## v2
- 武将池扩展到 48 位（新增 32 位原创技能武将，魏蜀吴群各 12），每局随机给 8 位候选。
- 人机对战保留；新增「创建联机房间」：房主生成链接，对手打开链接即加入（PeerJS 点对点，房主端运行规则，双方状态同步）。

## 平衡性
见 [BALANCE.md](BALANCE.md)。`node tools/sim.js 8` 运行全武将 AI 对战模拟。
