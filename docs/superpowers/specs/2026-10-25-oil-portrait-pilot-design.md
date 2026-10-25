# 写实油画立绘试点设计说明

状态：方案 A 已锁定。本文件是后续出图和接入的规格。本提交只新增本文件，不生成图片，不改页面、样式、脚本或已有 SVG。

技术栈保持静态 HTML / CSS / JS。不引入图像库、构建步骤或图床。

与 `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md` 冲突时，只在下面两处以本文件为准：这 8 张试点立绘改为油画 PNG；这 8 张的 `image-rendering` 改为 `auto`。该文件里的布局、色条、手牌、联机和「不要重绘其余立绘」仍然有效。

## 1. 目标

用同一套写实油画半身像，先画 8 名武将，把风格锁住。之后若要扩到全部 96 人，沿用本文件的骨架、裁切和回退规则，不另起风格。

试点 id，顺序固定：

`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo`

对应 `data/generals.js` 里的曹操、关羽、周瑜、吕布、诸葛亮、貂蝉、典韦、华佗。

完成后：

- 这 8 人在选将卡、出战槽、对战座位上显示 `assets/portraits/{id}.png`。
- PNG 加载失败时，同一位置改显示已有的 `assets/portraits/{id}.svg`。
- 其余 88 人继续只请求已有 SVG，不请求不存在的 PNG。
- 8 张图看上去是同一位画家的作品。脸在选将卡和 799px 以下的 72px 座位立绘上仍能认出五官。

## 2. 非目标

- 不改 `data/generals.js`、`data/cards.js`、`tools/portraits.js`、`BALANCE.md`、`index.html`。
- 不重跑 `tools/portraits.js`，不覆盖、不删除任何 `assets/portraits/*.svg`。
- 不改武将技能、数值、AI、牌堆、胜负和 PeerJS 消息。
- 不改选将卡尺寸、座位立绘宽度、`object-fit` 或 `object-position`。
- 不把 `FACTIONS` 的颜色改成界面色条的颜色，也不把界面色条画进油画。
- 不新增图鉴页、批量出图脚本或 npm 依赖。
- 不把油画存成 JPEG、WebP 或 SVG。

## 3. 本提交与后续实现

| 时机 | 内容 |
|---|---|
| 本提交 | 只有 `docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md` |
| 后续实现 | 第 8 节的 8 个 PNG，加上第 9 节列出的 `game.js`、`style.css`、`DESIGN.md`、`README.md` |

后续实现按第 6、7 节的英文逐字出图，按第 8 节裁成 512×512，再按第 9 节接入。提示词、关键词和装配结果三者不一致时，以第 7 节表格为准，先改正第 6.3 节的成品提示词，再出图。

## 4. 现状锚点

`tools/portraits.js` 为 `GENERALS` 里全部武将各写一张 16×16 像素 SVG，路径 `assets/portraits/{id}.svg`。仓库里现有 96 张 SVG。试点的 8 张 SVG 保留，作为回退图。

`game.js` 有 4 处把立绘写死为 SVG：

- `seat()`：对战座位，`#ai` 与 `#me`
- `fillSlot()`：选将出战槽 `#picked-body`
- `selectScreen()`：选将卡 `.gcard`
- `showDetail()`：`#detail` 模态。当前没有调用方。这处仍要改，避免以后接上时绕过 PNG。

`style.css` 里这些图都是 `image-rendering: pixelated`，并且 `object-fit: cover`、`object-position: center`：

- `.gcard img`：宽 100%，高 148px。桌面卡宽 168px。`max-width: 799px` 时卡宽随网格，列最小 140px。
- `#picked img`：宽 120px。
- `.portrait`：桌面宽 96px；`max-width: 799px` 时宽 72px。图宽 100%，高度随图片。正方形 PNG 会把座位立绘撑成 96×96 或 72×72。
- `.modal img`：宽 120px。
- `.portrait .fac`：`position: absolute; top: 4px; left: 4px`，只压在对战立绘左上角。选将卡的势力字在图下方，不压脸。

势力数据在 `window.FACTIONS`：

| 键 | 字 | 色值 | 试点武将 |
|---|---|---|---|
| `wei` | 魏 | `#3b6fd8` | 曹操、典韦 |
| `shu` | 蜀 | `#d8463b` | 关羽、诸葛亮 |
| `wu` | 吴 | `#2fa35a` | 周瑜 |
| `qun` | 群 | `#8a8f9c` | 吕布、貂蝉、华佗 |

界面色条是另一套：魏蓝、蜀绿、吴红、群金紫。油画的环境光只用上表，不用界面色条。一张蜀卡可以同时有绿色色条和油画边缘的淡红环境光。

`#3b6fd8` 在像素 SVG 里被涂进披风。油画里这四种色只做边缘的一层淡光，不铺满衣服。

## 5. 风格圣经

8 张必须同时满足下面每一条。

- 写实油画，能看见厚涂笔触和画布纹理。不是照片，不是三维渲染，不是平涂矢量。
- 紧张、戏剧性的明暗：暖色主光从左上打下，脸的右侧落入深影。8 张的主光方向相同。
- 半身胸像。头顶靠近画面上方，肩膀被底边切断。不画全身，不画只剩五官的大特写，不画战场。
- 脖子、下颌、肩膀和布料绷紧。力量来自肌肉和衣褶，不来自伤口或兵器。
- 背景是接近纯黑的空底，没有风景、月亮、旗帜、人群或室内陈设。
- 势力色只作为很淡的轮廓光，贴在暗部一侧的外缘，不给衣服重新染色，不发光，不做霓虹。
- 五官是成年人的写实比例。眼睛、鼻子、嘴清楚，嘴闭上。不尖叫，不咧出血口。
- 可以有头盔、冠、头巾、药囊这些服饰。刃不入画。不画格斗，不画血，不画开放性伤口，不画扎进皮肤的针。
- 禁止动漫、漫画、Q 版、像素、赛璐璐、霓虹、赛博盔甲、发光眼睛、水印、文字、画框。
- 貂蝉是约二十岁的成年女子，高领暗色衣袍，姿态收着。不画成童颜，不画成暴露或挑逗的构图。
- 华佗是医师，不是手术场面。道具只有一只系着的药囊。

像素立绘里的饰色不要带进油画，除非第 7 节写明要留：

| id | 像素饰色 | 油画里的处理 |
|---|---|---|
| `caocao` | 金 `#f2c14e`，披风用魏蓝 | 只留冠上的一条细金边。披风是炭灰，不是整片蓝 |
| `guanyu` | 绿帽，披风用蜀红 | 只留深绿色头巾。衣服是铁灰，不是整片红或整片绿 |
| `zhouyu` | 红抹额 `#ff5a5a` | 只留一窄条暗绯红发带 |
| `lvbu` | 雉翎与红饰 `#ff3d3d` | 两根暗色雉翎。盔甲是暗色札甲，不涂亮红 |
| `zhugeliang` | 白冠 `#ffffff` | 米白布冠和灰羽氅。不画发光法球 |
| `diaochan` | 粉饰 `#ff9ad5` | 一枚灰玫瑰发簪。不铺粉色 |
| `dianwei` | 橙饰 `#ff8a3d` | 不用橙色。暗铁盔，炭灰甲 |
| `huatuo` | 绿饰 `#8bd17c` | 药囊上一条灰绿色绳子。不铺绿色袍 |

## 6. 提示词

### 6.1 骨架

出图时把 `{APPEARANCE}` 和 `{RIM}` 换成第 7 节同一行的两句英文。两句各带句号，中间空一格。除此之外不增词、不删词、不翻译、不改写。

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. {APPEARANCE} {RIM} Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

生成器若另有负面提示词栏，把下面这一句原样放进该栏，同时保留骨架末句。没有该栏时，只提交骨架成品。

```text
anime, manga, cartoon, chibi, pixel art, 8-bit, sprite, cel shading, 3d render, photograph, neon, cyberpunk, sci-fi armor, glowing eyes, gore, blood, open wound, blade, combat, text, watermark, logo, frame, border, full body, scenery, crowd
```

不指定绘图产品。任何生成器都可以，只要送入的正文包含第 6.3 节的对应成品，且导出的文件满足第 8、10 节。

### 6.2 装配

`{APPEARANCE}` 取表格的「外貌与服饰」列。`{RIM}` 取「环境光」列。成品等于骨架整段替换这两个记号，记号本身不留下。

### 6.3 八条成品

下面每条已经按第 7 节装好。出图复制对应整段。

曹操 `caocao`：

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. A man of about forty-five with a lean face, narrow calculating eyes, a short neat black beard and mustache, and black hair under a matte black court crown with one thin gold fillet. He wears a layered charcoal court robe with a high collar, shoulders squared, mouth closed in a cold half-smile. A very faint cool blue rim light, color #3b6fd8, touches only the shadow edge. Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

关羽 `guanyu`：

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. A man of about forty with a broad face, thick brows, a long black beard reaching the chest, and a dark green silk headcloth. He wears a dark iron-gray robe, not a bright green costume. His mouth is closed and his brow is tense. A very faint warm red rim light, color #d8463b, touches only the shadow edge. Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

周瑜 `zhouyu`：

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. A man of about thirty, clean-shaven, with a sharp jaw, calm proud eyes, and black hair tied in a topknot held by a narrow dark crimson silk band. He wears an elegant charcoal robe with a pale inner collar, shoulders held square, mouth closed. A very faint green rim light, color #2fa35a, touches only the shadow edge. Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

吕布 `lvbu`：

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. A heavily built man of about thirty, clean-shaven, with a hard jaw and a fierce steady gaze, black hair, and two dark pheasant plumes rising from a matte helmet. He wears dark lamellar armor over a charcoal tunic. His jaw is clenched and his mouth is closed. A very faint cool gray rim light, color #8a8f9c, touches only the shadow edge. Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

诸葛亮 `zhugeliang`：

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. A man of about thirty-five, clean-shaven, with a pale narrow face, calm alert eyes, and black hair under an off-white cloth scholar cap. He wears a dark robe and a textured gray feathered cloak. A closed feather fan is cropped at the lower edge. His mouth is closed. A very faint warm red rim light, color #d8463b, touches only the shadow edge. Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

貂蝉 `diaochan`：

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. A woman of about twenty, with a composed oval face, dark eyes looking slightly aside, and black hair in a high bun fastened by one muted rose hairpin. She wears a modest high-collared dark robe with a twisted drape across the shoulders. Her mouth is closed. A very faint cool gray rim light, color #8a8f9c, touches only the shadow edge. Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

典韦 `dianwei`：

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. A heavily built man of about thirty-five with a thick neck, a short dense black beard, intense eyes, and a dark iron helm. He wears heavy charcoal armor. His jaw is clenched, his mouth is closed, and both hands stay below the frame. A very faint cool blue rim light, color #3b6fd8, touches only the shadow edge. Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

华佗 `huatuo`：

```text
A tense, dramatic, realistic oil painting on canvas, half-body bust, square composition. Thick impasto brushstrokes remain visible at thumbnail size. Chiaroscuro with a warm key light from the upper left and deep shadow across the right side of the face. Strong tension in the neck, jaw, shoulders, and cloth. The face is large. Both eyes, the nose, and the mouth are sharp and unobstructed. Both eyes sit below the top third of the canvas and outside the top-left corner. The background is a dark, empty, near-black field with no scenery. A man of about sixty with deep wrinkles, a concerned focused gaze, long gray-white hair and a long gray-white beard, and an off-white scholar cap. He wears a dark physician robe. A closed cloth herb pouch with a muted green cord rests at his chest. His mouth is closed. A very faint cool gray rim light, color #8a8f9c, touches only the shadow edge. Do not depict anime, manga, cartoon, chibi, pixel art, cel shading, a 3D render, a photograph, neon light, cyberpunk, glowing eyes, gore, blood, open wounds, blades, combat, text, a watermark, a logo, a frame, a full body, or a crowd.
```

## 7. 八将关键词

环境光色值等于第 4 节的 `FACTIONS`，不是界面色条。

| id | 姓名 | 势力 | 外貌与服饰 | 环境光 |
|---|---|---|---|---|
| `caocao` | 曹操 | 魏 | A man of about forty-five with a lean face, narrow calculating eyes, a short neat black beard and mustache, and black hair under a matte black court crown with one thin gold fillet. He wears a layered charcoal court robe with a high collar, shoulders squared, mouth closed in a cold half-smile. | A very faint cool blue rim light, color #3b6fd8, touches only the shadow edge. |
| `guanyu` | 关羽 | 蜀 | A man of about forty with a broad face, thick brows, a long black beard reaching the chest, and a dark green silk headcloth. He wears a dark iron-gray robe, not a bright green costume. His mouth is closed and his brow is tense. | A very faint warm red rim light, color #d8463b, touches only the shadow edge. |
| `zhouyu` | 周瑜 | 吴 | A man of about thirty, clean-shaven, with a sharp jaw, calm proud eyes, and black hair tied in a topknot held by a narrow dark crimson silk band. He wears an elegant charcoal robe with a pale inner collar, shoulders held square, mouth closed. | A very faint green rim light, color #2fa35a, touches only the shadow edge. |
| `lvbu` | 吕布 | 群 | A heavily built man of about thirty, clean-shaven, with a hard jaw and a fierce steady gaze, black hair, and two dark pheasant plumes rising from a matte helmet. He wears dark lamellar armor over a charcoal tunic. His jaw is clenched and his mouth is closed. | A very faint cool gray rim light, color #8a8f9c, touches only the shadow edge. |
| `zhugeliang` | 诸葛亮 | 蜀 | A man of about thirty-five, clean-shaven, with a pale narrow face, calm alert eyes, and black hair under an off-white cloth scholar cap. He wears a dark robe and a textured gray feathered cloak. A closed feather fan is cropped at the lower edge. His mouth is closed. | A very faint warm red rim light, color #d8463b, touches only the shadow edge. |
| `diaochan` | 貂蝉 | 群 | A woman of about twenty, with a composed oval face, dark eyes looking slightly aside, and black hair in a high bun fastened by one muted rose hairpin. She wears a modest high-collared dark robe with a twisted drape across the shoulders. Her mouth is closed. | A very faint cool gray rim light, color #8a8f9c, touches only the shadow edge. |
| `dianwei` | 典韦 | 魏 | A heavily built man of about thirty-five with a thick neck, a short dense black beard, intense eyes, and a dark iron helm. He wears heavy charcoal armor. His jaw is clenched, his mouth is closed, and both hands stay below the frame. | A very faint cool blue rim light, color #3b6fd8, touches only the shadow edge. |
| `huatuo` | 华佗 | 群 | A man of about sixty with deep wrinkles, a concerned focused gaze, long gray-white hair and a long gray-white beard, and an off-white scholar cap. He wears a dark physician robe. A closed cloth herb pouch with a muted green cord rests at his chest. His mouth is closed. | A very faint cool gray rim light, color #8a8f9c, touches only the shadow edge. |

关羽的头巾是人物标识，蜀的环境光仍是 `#d8463b`。周瑜的发带是暗绯红，吴的环境光仍是 `#2fa35a`。两套颜色同时存在，不互相替换。

## 8. 文件与出图

每名试点武将只新增这一张图：

`assets/portraits/{id}.png`

8 个文件名：

- `assets/portraits/caocao.png`
- `assets/portraits/guanyu.png`
- `assets/portraits/zhouyu.png`
- `assets/portraits/lvbu.png`
- `assets/portraits/zhugeliang.png`
- `assets/portraits/diaochan.png`
- `assets/portraits/dianwei.png`
- `assets/portraits/huatuo.png`

同名 SVG 留在原路径，字节不变。

出图步骤，8 人各做一遍：

1. 提交第 6.3 节里该 id 的整段英文。源图短边必须大于或等于 512 像素。更小就重新生成，禁止放大。
2. 若不是正方形，先裁出一块正方形，再缩放到 512×512。以脸为准裁，不留白边，不加画框。
3. 缩放到 512×512。使用带锐度保持的下采样。最终文件里，双眼都落在 x 为 180–430、y 为 172–280 的矩形内，嘴落在 y 为 250–360 内。做不到就回到第 1 步，不靠把五官画进不安全区域再交稿。
4. 导出 8 位 sRGB 的 PNG。IHDR 宽 512、高 512、位深 8、颜色类型 2（真彩色，无 alpha）。不透明。单文件不超过 1258291 字节。超出就在不改变宽高和颜色类型的前提下重新压缩。
5. 写到上面的路径。不提交接触表，不提交生成器的原图。

`object-fit: cover` 在 168×148 的卡图上按宽对齐，上下各裁掉 `10 × 512 / 168`，即 30.48 个源像素。列宽正好 140px、图高仍是 148px 时按高对齐，左右各裁掉 `4 × 512 / 148`，即 13.84 个源像素。安全矩形 x 180–430、y 172–360 落在这两次裁切里面。对战座位显示整张正方形。`.fac` 按一个 12px 汉字加左右各 6px 内边距、行盒高 18px 计算，占 24×18 CSS 像素，离边 4px。72px 宽时它覆盖源图 x 28.4–199.1、y 28.4–156.4。眼睛的 y 从 172 起，在这块芯片下面。

验收用 Node 读取 PNG，不新增依赖。IHDR 从第 16 字节起：宽、高各 4 字节大端，接着是位深 1 字节、颜色类型 1 字节。8 个文件都要是 `512 / 512 / 8 / 2`。

## 9. 代码触点

客户端不能列目录。PNG 优先的名单就是这一个集合，不写第二份配置，也不对 88 人先请求 PNG。

在 `game.js` 渲染函数之前加入：

```javascript
const OIL_IDS=new Set(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo']);
function portraitImg(id,alt){const oil=OIL_IDS.has(id);
 const src=oil?`assets/portraits/${id}.png`:`assets/portraits/${id}.svg`;
 const cls=oil?' class="portrait-oil"':'';
 const fb=oil?` onerror="this.onerror=null;this.classList.remove('portrait-oil');this.src='assets/portraits/${id}.svg'"`:'';
 return `<img${cls} alt="${alt}" src="${src}"${fb}>`;}
```

四处模板改为调用它，`alt` 用 `g.name` 或 `p.g.name`：

- `seat()` 里肖像 `<img>`
- `fillSlot()` 里 `#picked-body` 的 `<img>`
- `selectScreen()` 里 `.gcard` 的 `<img>`
- `showDetail()` 里 `#detail` 的 `<img>`

集合内：`src` 指向 PNG，带 `portrait-oil`。PNG 失败时 `onerror` 先清掉自己，再去掉 `portrait-oil`，再换成同 id 的 SVG，避免来回失败。集合外：只有 SVG，没有 `onerror`，没有 `portrait-oil`。

`style.css` 在现有 `pixelated` 规则之后加上。选择器权重高于单独的 `.gcard img`，因此必须写全四条：

```css
.gcard img.portrait-oil,
#picked img.portrait-oil,
.portrait img.portrait-oil,
.modal img.portrait-oil{image-rendering:auto}
```

不带 `portrait-oil` 的图保持 `pixelated`。`object-fit: cover` 和 `object-position: center` 不改。卡宽、148px 图高、96px 与 72px 肖像宽都不改。

`DESIGN.md` 只改两处，用来跟上这条例外：

- 在「像素立绘继续 `image-rendering: pixelated`」那条后面加一句：`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 的 `img` 带 `portrait-oil`，`image-rendering` 为 `auto`。其余立绘仍是 `pixelated`。
- 第 8.2 节示例里曹操的图改为 `<img alt="曹操" class="portrait-oil" src="assets/portraits/caocao.png">`。

`README.md` 第 2 行整行改为下面这一行。武将人数从句原样保留，本试点不纠正人数：

```markdown
原创三国主题 1v1 人机卡牌对战（浏览器）。16 位武将、原创技能与卡牌。caocao、guanyu、zhouyu、lvbu、zhugeliang、diaochan、dianwei、huatuo 使用写实油画 PNG，其余武将仍用 `tools/portraits.js` 生成的卡通像素 SVG。
```

`tools/portraits.js` 的路径仍是 `` `${__dirname}/../assets/portraits/${g.id}.svg` ``。后续实现不要让它写出 PNG。

## 10. 验收

文件：

- 8 个 PNG 都在第 8 节的路径上。IHDR 为 512×512、位深 8、颜色类型 2。每个文件不超过 1258291 字节。
- `git diff` 不修改 `tools/portraits.js` 和任何 `.svg`。
- 实现提交允许改动的路径只有：这 8 个 PNG、`game.js`、`style.css`、`DESIGN.md`、`README.md`。

画面，8 张放在一起看：

- 都是暗底、左上暖主光、厚涂、半身、写实成年人脸。
- 笔触在 168×148 的选将卡上仍然看得见，不只在 512 原图上看得见。
- 没有动漫线稿、像素块、霓虹、血、敞开的伤口、刃、文字或水印。
- 势力色只出现在暗部边缘的淡光里。关羽的衣服不是整片绿，也不是整片蜀红。曹操的衣服不是整片魏蓝。
- 在 1280px 宽和 360px 宽各看一次。每张选将卡上都能分开两眼、鼻子和嘴。
- 360px 宽时座位立绘为 72px。势力芯片不盖住任何一只眼睛。

页面：

- 静态打开页面。控制台执行 `selectScreen(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'])`。8 张卡的 `src` 都以 `.png` 结尾，网络面板没有这 8 个 PNG 的 404。
- 再执行 `selectScreen(['zhangliao','liubei','sunquan','zhangfei','simayi','xiahoudun','ganning','yuanshao'])`。8 张卡的 `src` 都以 `.svg` 结尾，且没有发出 `.png` 请求。
- 执行 `start(GENERALS.find(g=>g.id==='caocao'), GENERALS.find(g=>g.id==='lvbu'), false)`。双方座位立绘都是 PNG。
- 在开发者工具里把一张试点图的 `src` 改成不存在的 `assets/portraits/caocao.png.bak`，确认它换成 `caocao.svg` 并失去 `portrait-oil`。刷新后恢复 PNG。不要把改坏的地址提交进仓库。

规则回归：

- `node tools/sim.js 1` 结束时输出里 `errors=0`。若该命令改写了 `tools/sim-result.json`，实现提交里还原它。

## 11. 范围外

- 其余 88 名武将的油画，以及任何「一次画满 96 人」的批次。
- 删掉 SVG，或让 `tools/portraits.js` 改画油画。
- 为油画改选将人数、卡面尺寸、色条或 `FACTIONS`。
- 图鉴、大厅入口、或把 96 人同时摆上选将墙。选将墙仍然每次 8 人。
- 纠正 `README.md` 里已经过时的武将人数。
- 接触表、生成器工程文件、原图备份进仓库。
- 血、伤口、兵器特写、手术场面。
- 本提交里的 PNG、`game.js`、`style.css`、`DESIGN.md`、`README.md`。它们属于后续实现。
