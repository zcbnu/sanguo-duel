# 活泼半写实插画立绘试点设计说明

状态：方向已锁定，出图管线采用方案 B。本文件是后续计划和实现的规格。本提交只新增本文件，不生成图片，不改页面、样式、脚本、`DESIGN.md`、`README.md` 或已有 SVG。

方向名称：活泼半写实插画立绘试点（lively semi-realistic illustration portrait pilot）。

技术栈保持静态 HTML / CSS / JS。不引入图像库、构建步骤或图床。

本方向替换已关闭、未合并的油画立绘试点（PR #2，分支上的 `docs/superpowers/specs/2026-10-25-oil-portrait-pilot-design.md`）。那份规格不在 `main` 上，也不再执行。不要实现阴郁油画、空黑底、禁止兵器入画、`OIL_IDS` 或 `portrait-oil`。不要把那次试点的 PNG 改名后当作本方向的立绘提交。

与 `docs/superpowers/specs/2026-10-25-opendesign-ui-design.md` 冲突时，只在下面两处以本文件为准：这 8 张试点立绘改为插画 PNG；这 8 张的 `image-rendering` 改为 `auto`。该文件里的布局、色条、手牌、联机和「不要重绘其余立绘」仍然有效。

## 1. 目标

用同一套活泼的半写实插画半身像，先画 8 名武将，把风格锁住。之后若要扩到全部 96 人，沿用本文件的画风、裁切和回退规则，不另起风格。

试点 id，顺序固定：

`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo`

对应 `data/generals.js` 里的曹操、关羽、周瑜、吕布、诸葛亮、貂蝉、典韦、华佗。

完成后：

- 这 8 人在选将卡、出战槽、对战座位和详情模态上显示 `assets/portraits/{id}.png`。
- PNG 加载失败时，同一位置改显示已有的 `assets/portraits/{id}.svg`。
- 其余 88 人继续只请求已有 SVG，不请求不存在的 PNG。
- 8 张图是同一套插画语言：柔光、高饱和、东亚成年人面孔。脸在选将卡和 799px 以下的 72px 座位立绘上仍能认出五官。

## 2. 非目标

- 不改 `data/generals.js`、`data/cards.js`、`tools/portraits.js`、`BALANCE.md`、`index.html`。
- 不重跑 `tools/portraits.js`，不覆盖、不删除任何 `assets/portraits/*.svg`。
- 不改武将技能、数值、AI、牌堆、胜负和 PeerJS 消息。
- 不改选将卡尺寸、座位立绘宽度、`object-fit` 或 `object-position`。
- 不把 `FACTIONS` 的颜色改成界面色条的颜色，也不把界面色条画进插画。
- 不新增图鉴页、批量出图脚本或 npm 依赖。
- 不把插画存成 JPEG、WebP、带 alpha 的 PNG 或 SVG。
- 不在本提交里接入立绘，也不把后续实现合并进 `main`。合并留给用户。

## 3. 本提交与后续实现

| 时机 | 内容 |
|---|---|
| 本提交 | 只有 `docs/superpowers/specs/2026-10-25-lively-portrait-pilot-design.md` |
| 后续实现 | 先只出关羽样张并等用户批准；批准后再出另外 7 张。然后按第 9 节改 `game.js`、`style.css`、`DESIGN.md`、`README.md`，并放入第 8 节的 8 个 PNG |

后续实现先写计划，再按第 6 节的门禁出图，按第 8 节落成 512×512，再按第 9 节接入。画面与第 5、7 节不一致时，以第 5、7 节为准，重做图片，不改规格来迁就成图。

后续实现的拉取请求保持打开，不合并到 `main`。本规格所在的拉取请求同样只供审阅，不由实现者合并。

## 4. 现状锚点

`tools/portraits.js` 为 `GENERALS` 里全部武将各写一张像素 SVG，路径 `assets/portraits/{id}.svg`。仓库里现有 96 张 SVG。试点的 8 张 SVG 保留，作为回退图。

`game.js` 有 4 处把立绘写死为 SVG：

- `seat()`：对战座位，`#ai` 与 `#me`
- `fillSlot()`：选将出战槽 `#picked-body`
- `selectScreen()`：选将卡 `.gcard`
- `showDetail()`：`#detail` 模态。当前没有调用方。这处仍要改，避免以后接上时绕过 PNG。

`style.css` 里这些图都是 `image-rendering: pixelated`。`object-fit: cover` 和 `object-position: center` 只写在 `.gcard img` 和 `.portrait img` 上。`#picked img` 与 `.modal img` 只定了宽度，正方形 PNG 按固有比例显示，不再裁切。全页 `box-sizing: border-box`，卡和座位的边框算在宽度里面：

- `.gcard img`：宽 100%，高 148px。桌面卡宽 168px（`#grid` 列为 `minmax(168px, 168px)`）。`max-width: 799px` 时 `.gcard` 为 `width: auto`，列最小 140px。
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

界面色条是另一套：魏蓝、蜀绿、吴红、群金紫。插画不使用这套色条上色，也不用 `FACTIONS` 的色值给人物描边。衣服颜色按第 7 节，不按势力色重染。一张蜀卡可以同时有绿色色条和插画里的红脸或竹绿。

## 5. 视觉

8 张必须同时满足下面每一条。

### 5.1 画风

- 半写实插画。柔和光照，表情生动。缩到 168×148 时主色仍然鲜明，是高饱和的游戏卡面，不是灰褐的博物馆油画。
- 不是阴郁油画，不是厚涂写实油彩，不是照片，不是三维渲染。
- 不是动漫大眼，不是漫画线稿，不是 Q 版，不是赛璐璐，不是像素图。
- 五官是成年人的比例。眼睛、鼻子、嘴清楚。表情可以含笑、专注或傲然。不呆滞，不阴郁，不尖叫，不咧出血口。

### 5.2 面孔：东亚相貌是硬性要求

8 人的脸都必须一眼读作东亚人、东亚面部特征。这一条否决其他一切好看的理由。

必须同时满足：

- 脸型、眼型、鼻梁、唇形读作东亚成年人。
- 头发是黑发。只有华佗可以是灰白发。
- 虹膜是黑色或深褐色。

出现下面任一情况就整张作废，重画，不修到「差不多」就收：

- 读作欧洲人、白种人或笼统的西方肖像脸。
- 金发、棕发、红发、亚麻色发。
- 蓝眼、绿眼、灰眼。
- 深陷的圆眼配高窄鼻梁，使主读感变成西方面孔。

关羽可以画传统红脸（演义和戏曲里的红脸）。红脸仍然必须是东亚骨相，不是欧洲人晒红或涂红。不画红脸、改用常色东亚肤色，也可以。两种都算通过，不能画成西方红脸。

貂蝉是约二十岁的成年女子。姿态端丽、有神。不画成童颜，不画成暴露或挑逗的构图。

### 5.3 构图

- 半身。头顶靠近画面上方，腰部以下被底边切断。不画全身，不画只剩五官的大特写。
- 每张都有第 7 节点名的那一件戏剧局部，只露一角，不占满画面。兵器不刺向观众，不沾血。华佗的局部是药囊，不另画兵器。
- 背景是简单的环境暗示。关羽样张是两处：竹和旗角。其余 7 人各一处，见第 7 节。不许空底，也不许画成战场、人群或室内全景。
- 旗帜只画色块和布的边缘。不画可识读的汉字、拉丁字母、数字、印章文字或签名。

### 5.4 禁止项

不画血、喷血、开放性伤口、断肢。不画水印、标志、签名、画框、卡牌边框。画面里不出现可识读的中文或英文。不画发光的眼睛，不画霓虹，不画赛博盔甲。

## 6. 方案 B：样张门禁

出图分两步。第一步没有用户的书面批准，第二步不得开始。

### 6.1 只先做关羽样张

第一张、也是唯一先做的一张，是关羽 `guanyu`。它是风格参照板。

这一张必须是半身，并同时包含：

- 东亚成年人面孔，长髯。传统红脸可以，见第 5.2 节。
- 青龙偃月刀只露一角，贴在画面边缘。
- 竹的暗示，加上旗角。两样都要有，但都只是暗示，不铺成竹林或军阵。

样张先按第 8 节落成 `assets/portraits/guanyu.png`，并先过第 10 节里针对单张文件和单张画面的条款。然后把这一张交给用户。

用户只做整张批准或整张否决。否决后只重做关羽，替换这一个文件。不平行再出另外 7 张来「多给几个选择」。

用户书面批准之前：

- 不得生成曹操、周瑜、吕布、诸葛亮、貂蝉、典韦、华佗。
- 不得把这 7 个 id 的 PNG 写入仓库。
- 不得修改 `game.js`、`style.css`、`DESIGN.md`、`README.md`。

关羽样张可以单独放在分支上的 `assets/portraits/guanyu.png` 供用户看。同一提交不得包含另外 7 张，也不得包含第 9 节的代码。

### 6.2 批准后再出另外七张

用户批准关羽样张之后，才生成另外 7 张。生成时把已批准的 `assets/portraits/guanyu.png` 作为风格参照图送进生成器，并换上第 7 节里该人物的句子。

另外 7 张必须跟上样张的这四件事：光照的柔和程度、饱和度、东亚面部特征、插画语言。人物身份按第 7 节区分，不把关羽的红脸、长髯或青龙偃月刀复制到别人脸上。

生成器如果不能接收一张图片作为风格参照，就停下来问用户。不得改成纯文字批量出图，也不得改回油画试点的提示词。

### 6.3 每条提示词都要写上的句子

不指定绘图产品。提示词的其余措辞可以随生成器调整，但下面两句必须原文进入每一次提交，关羽样张和另外 7 张都一样。不得翻译、不得删词。

正文里要有：

```text
Semi-realistic illustration, soft lighting, high saturation, lively expression, half-body. East Asian facial features, East Asian adult, not a Western or European face.
```

负面提示词栏里要有；没有该栏时，把这一句接在正文末尾：

```text
western face, european face, caucasian, blonde hair, brown hair, red hair, blue eyes, green eyes, gray eyes, anime, large eyes, chibi, pixel art, gloomy oil painting, photograph, 3d render, gore, blood, blood spray, watermark, logo, signature, readable text, letters, chinese characters
```

第 7 节的人物句子用中文写进提示词即可。人物句子与上面两句冲突时，以上面两句和第 5.2 节为准。

## 7. 八将要点

衣服不按势力色重染。势力只用来核对人物身份。

| id | 姓名 | 势力 | 画面 |
|---|---|---|---|
| `guanyu` | 关羽 | 蜀 | 风格参照板。长髯。传统红脸可以。青龙偃月刀露一角。竹与旗角都要有。 |
| `caocao` | 曹操 | 魏 | 精悍、眼神算计。深色袍服，袍袖有转折。背景是一处火光：营火，或营帐边的火光。 |
| `zhouyu` | 周瑜 | 吴 | 英俊、沉着、带火气。折扇露一角。衣服是袍或轻甲，有折扇即通过。背景只取一样：旗角，或一小块江水反光。 |
| `lvbu` | 吕布 | 群 | 凶悍、自负。方天画戟露一角。背景只一处：戏剧性的天空，其中有一角旗。不另加第二种风景，不画军阵。 |
| `zhugeliang` | 诸葛亮 | 蜀 | 平静、聪慧。羽扇露一角。背景是竹。 |
| `diaochan` | 貂蝉 | 群 | 端丽、有神的成年女子。丝袖入画。背景只取一样：一盏灯笼，或一轮月亮。 |
| `dianwei` | 典韦 | 魏 | 魁梧的护卫气势。双戟露一角。背景是一支火把。 |
| `huatuo` | 华佗 | 群 | 医者。目光专注、和缓。胸前一只药囊，能看见药草。背景是一盏柔和的灯。不画手术、不画扎进皮肤的针、不画兵器。 |

曹操的火光有一处即通过，不要两堆火。周瑜、貂蝉的背景是二选一：两样都画算失败，一样都没有也算失败。有其中一样即通过。周瑜的衣服是袍还是轻甲，不单独判失败。

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

关羽按第 6.1 节先做。另外 7 张在样张获批后各做一遍。每张的步骤：

1. 提交第 6.3 节的两句英文，加上第 7 节该人物的中文要点。另外 7 张同时送入已批准的关羽 PNG 作为风格参照。源图短边必须大于或等于 512 像素。更小就重新生成，禁止放大。
2. 若不是正方形，先裁出一块正方形，再缩放到 512×512。以脸为准裁，不留白边，不加画框。
3. 缩放到 512×512。使用带锐度保持的下采样。最终文件里，双眼、鼻、嘴都完整落在 x 为 160–430、y 为 184–400 的矩形内。做不到就回到第 1 步。
4. 导出 8 位 sRGB 的 PNG。IHDR 宽 512、高 512、位深 8、颜色类型 2（真彩色，无 alpha）。不透明。生成器若给出颜色类型 6，先去掉 alpha 再写入，不把半透明文件提交进仓库。单文件不超过 1258291 字节（1.2×1024×1024 的整数部分）。超出就在不改变宽高、位深和颜色类型的前提下重新压缩。
5. 写到上面的路径。不提交接触表，不提交生成器的原图，不提交第二份「参照板」副本。获批的关羽样张就是 `assets/portraits/guanyu.png`。

### 8.1 裁切与安全矩形

`object-fit: cover` 配合 `object-position: center` 保持不动。下面的像素都按边框盒计算，不把边框算进图盒。

选将卡 `.gcard` 边框 4px。图高固定 148px，图宽是列宽减去 8px。

- 桌面列宽 168px，图盒 160×148。按宽对齐，上下各裁掉 `(160 - 148) / 2 × 512 / 160`，即 19.2 个源像素。
- 窄屏双列最宽：视口 467px 时，`.select-layout` 左右各 16px 内边距，内容宽 435px，列间距 8px，列宽 213.5px，图盒 205.5×148。上下各裁掉 `(205.5 - 148) / 2 × 512 / 205.5`，即 71.6 个源像素。安全的 y 是 72–440。视口 468px 起改为三列，列宽回到 140px，竖向裁切变小。
- 验收宽度 320px：内容宽 288px，两列各 140px，图盒 132×148。按高对齐，左右各裁掉 `(148 - 132) / 2 × 512 / 148`，即 27.7 个源像素。安全的 x 是 28–484。

对战座位显示整张正方形，`cover` 不再裁掉边缘。窄屏 `.portrait` 宽 72px、边框 3px，内容盒 66×66。`.fac` 按一个 12px 汉字加左右各 6px 内边距、行盒高 18px 计算，占 24×18 CSS 像素，离内边距盒 4px。映射到 512 源图：x 为 `4 / 66 × 512` 至 `28 / 66 × 512`，即 31.0–217.2；y 为 `4 / 66 × 512` 至 `22 / 66 × 512`，即 31.0–170.7。

x 160–430、y 184–400 落在上面三次卡面裁切里面，并且整段在这块芯片的下方。眼睛不得进入芯片矩形 x 0–218、y 0–171。

兵器、袖袍和背景暗示可以放在这个矩形之外，也允许被卡面裁掉。脸不可以。

验收用 Node 读取 PNG，不新增依赖。IHDR 从第 16 字节起：宽、高各 4 字节大端，接着是位深 1 字节、颜色类型 1 字节。8 个文件都要是 `512 / 512 / 8 / 2`。

## 9. 代码触点

客户端不能列目录。PNG 优先的名单就是这一个集合，不写第二份配置，也不对 88 人先请求 PNG。

常量名用 `LIVELY_IDS`。类名用 `portrait-illust`。不用 `OIL_IDS`，不用 `portrait-oil`：那是已关闭的油画试点。不用 `portrait-png`：类名表示插画渲染，不表示文件格式。

在 `game.js` 渲染函数之前加入：

```javascript
const LIVELY_IDS=new Set(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo']);
function portraitImg(id,alt){const lively=LIVELY_IDS.has(id);
 const src=lively?`assets/portraits/${id}.png`:`assets/portraits/${id}.svg`;
 const cls=lively?' class="portrait-illust"':'';
 const fb=lively?` onerror="this.onerror=null;this.classList.remove('portrait-illust');this.src='assets/portraits/${id}.svg'"`:'';
 return `<img${cls} alt="${alt}" src="${src}"${fb}>`;}
```

行为是：

- 集合内的 8 个 id 优先请求 `assets/portraits/{id}.png`，`img` 带 `portrait-illust`。
- PNG 失败时 `onerror` 先清掉自己，再去掉 `portrait-illust`，再换成同 id 的 `assets/portraits/{id}.svg`，避免来回失败。
- 集合外的 id 只请求同 id 的 SVG，没有 `onerror`，没有 `portrait-illust`，不发起 PNG 请求。

四处模板改为调用它，`alt` 用 `g.name` 或 `p.g.name`：

- `seat()` 里肖像 `<img>`
- `fillSlot()` 里 `#picked-body` 的 `<img>`
- `selectScreen()` 里 `.gcard` 的 `<img>`
- `showDetail()` 里 `#detail` 的 `<img>`

`style.css` 在现有 `pixelated` 规则之后加上。选择器权重高于单独的 `.gcard img`，因此必须写全四条：

```css
.gcard img.portrait-illust,
#picked img.portrait-illust,
.portrait img.portrait-illust,
.modal img.portrait-illust{image-rendering:auto}
```

不带 `portrait-illust` 的图保持 `pixelated`。`object-fit: cover` 和 `object-position: center` 不改。卡宽、148px 图高、96px 与 72px 肖像宽都不改。

`DESIGN.md` 只改两处，用来跟上这条例外。这两处属于后续实现，不属于本提交：

- 在「像素立绘继续 `image-rendering: pixelated`」那条后面加一句：`caocao`、`guanyu`、`zhouyu`、`lvbu`、`zhugeliang`、`diaochan`、`dianwei`、`huatuo` 的 `img` 带 `portrait-illust`，`image-rendering` 为 `auto`。其余立绘仍是 `pixelated`。
- 第 8.2 节示例里曹操的图改为 `<img alt="曹操" class="portrait-illust" src="assets/portraits/caocao.png">`。

`README.md` 第 2 行整行改为下面这一行。武将人数从句原样保留，本试点不纠正人数。这一行也属于后续实现，不属于本提交：

```markdown
原创三国主题 1v1 人机卡牌对战（浏览器）。16 位武将、原创技能与卡牌。caocao、guanyu、zhouyu、lvbu、zhugeliang、diaochan、dianwei、huatuo 使用活泼半写实插画 PNG，其余武将仍用 `tools/portraits.js` 生成的卡通像素 SVG。
```

`tools/portraits.js` 的路径仍是 `` `${__dirname}/../assets/portraits/${g.id}.svg` ``。后续实现不要让它写出 PNG。

## 10. 验收

本规格本身：

- 本文件是下一份实现计划的依据。
- 第 5.2 节写明全部试点武将必须是东亚面孔，并写明哪些脸必须整张作废。
- 第 6 节写明方案 B：关羽样张获批之前，不得批量出另外 7 张。
- 第 8、9 节写明文件路径、`LIVELY_IDS` 的允许名单，以及 PNG 失败时回退同 id SVG、其余 id 不请求 PNG。

文件（后续实现）：

- 8 个 PNG 都在第 8 节的路径上。IHDR 为 512×512、位深 8、颜色类型 2。每个文件不超过 1258291 字节。
- `git diff` 不修改 `tools/portraits.js` 和任何 `.svg`。
- 实现提交允许改动的路径只有：这 8 个 PNG、`game.js`、`style.css`、`DESIGN.md`、`README.md`。关羽样张那一次提交除外，那次只有 `assets/portraits/guanyu.png`。
- 实现的拉取请求不合并到 `main`。

画面，8 张放在一起看：

- 都是柔光、高饱和、半写实插画、半身、东亚成年人脸。
- 没有阴郁油画、动漫大眼、像素块、照片感、三维渲染感。
- 没有血、喷血、水印、可识读的中文或英文。
- 每张都能认出第 7 节的那一件局部道具，以及该节写明的背景。关羽同时有竹和旗角。其余 7 人各自只有一处背景。周瑜、貂蝉的那一处是该节允许的两样里的一样。
- 关羽若是红脸，骨相仍读作东亚人。
- 在 1280px 宽和 360px 宽各看一次。每张选将卡上都能分开两眼、鼻子和嘴。
- 360px 宽时座位立绘为 72px。势力芯片不盖住任何一只眼睛。

页面（后续实现，8 张都入库之后）：

- 静态打开页面。控制台执行 `selectScreen(['caocao','guanyu','zhouyu','lvbu','zhugeliang','diaochan','dianwei','huatuo'])`。8 张卡的 `src` 都以 `.png` 结尾，网络面板没有这 8 个 PNG 的 404。
- 再执行 `selectScreen(['zhangliao','liubei','sunquan','zhangfei','simayi','xiahoudun','ganning','yuanshao'])`。8 张卡的 `src` 都以 `.svg` 结尾，且没有发出 `.png` 请求。
- 执行 `start(GENERALS.find(g=>g.id==='caocao'), GENERALS.find(g=>g.id==='lvbu'), false)`。双方座位立绘都是 PNG，并带 `portrait-illust`。
- 在开发者工具里把一张试点图的 `src` 改成不存在的 `assets/portraits/caocao.png.bak`，确认它换成 `caocao.svg` 并失去 `portrait-illust`。刷新后恢复 PNG。不要把改坏的地址提交进仓库。

规则回归（后续实现）：

- `node tools/sim.js 1` 结束时输出里 `errors=0`。若该命令改写了 `tools/sim-result.json`，实现提交里还原它。

## 11. 范围外

- 其余 88 名武将的插画，以及任何「一次画满 96 人」的批次。
- 删掉 SVG，或让 `tools/portraits.js` 改画插画。
- 为插画改选将人数、卡面尺寸、色条或 `FACTIONS`。
- 图鉴、大厅入口、或把 96 人同时摆上选将墙。选将墙仍然每次 8 人。
- 纠正 `README.md` 里已经过时的武将人数。
- 接触表、生成器工程文件、原图备份、第二份样张副本进仓库。
- 血、喷血、伤口、兵器特写、手术场面。
- 阴郁油画，以及已关闭的油画试点里的提示词、空黑底和 `portrait-oil`。
- 在关羽样张获批之前批量出图。
- 把后续实现合并进 `main`。
- 本提交里的 PNG、`game.js`、`style.css`、`DESIGN.md`、`README.md`。它们属于后续实现。
