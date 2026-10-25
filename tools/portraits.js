const fs=require('fs');eval(fs.readFileSync(__dirname+'/../data/generals.js','utf8').replace(/window\./g,'global.'));
const base=[
'................','................','.....HHHHHH.....','....HHHHHHHH....','...HHHHHHHHHH...','...HSSSSSSSSH...',
'...SSESSSSESS...','...SSSSSSSSSS...','...SSSSMMSSSS...','....SBBBBBBS....','.....BBBBBB.....',
'...AAATTTTAAA...','..AAAATTTTAAAA..','.AAAAAATTAAAAAA.','.AAAAAATTAAAAAA.','.AAAAAAAAAAAAAA.'];
// 每个武将：发色/帽色，胡子(0无1短2长)，帽子样式，饰色
const look={caocao:['#2b2b3a',1,'crown','#f2c14e'],zhangliao:['#3a3a4a',1,'helm','#c0c6d0'],xiahoudun:['#1f1f28',2,'patch','#7c5cff'],
simayi:['#4a3a5a',2,'tall','#b48cff'],liubei:['#3a2a1a',1,'crown','#f2c14e'],guanyu:['#1a1a1a',2,'green','#2fa35a'],
zhangfei:['#141414',2,'band','#ff8a3d'],zhugeliang:['#2a2a2a',0,'scholar','#ffffff'],sunquan:['#7a3a1a',1,'crown','#f2c14e'],
zhouyu:['#2a1a1a',0,'band','#ff5a5a'],ganning:['#5a3a1a',1,'feather','#ffd23d'],sunshangxiang:['#3a1a1a',0,'bun','#ff7ab6'],
lvbu:['#2a1a1a',0,'pheasant','#ff3d3d'],huatuo:['#dcdcdc',2,'scholar','#8bd17c'],diaochan:['#1a1020',0,'bun','#ff9ad5'],yuanshao:['#3a2a1a',1,'helm','#f2c14e']};
Object.assign(look,{xuchu:['#1a1a1a',1,'band','#c0c6d0'],dianwei:['#2a1a10',2,'helm','#ff8a3d'],xunyu:['#2a2a3a',1,'scholar','#9ad0ff'],guojia:['#3a2a3a',0,'tall','#7c5cff'],
caoren:['#2b2b3a',2,'helm','#3b6fd8'],zhanghe:['#3a3a3a',0,'feather','#9ad0ff'],xuhuang:['#2a2016',1,'band','#c0c6d0'],caopi:['#1a1a2a',0,'crown','#b48cff'],
zhaoyun:['#1a1a2a',0,'helm','#ffffff'],machao:['#4a2a1a',0,'pheasant','#ffffff'],huangzhong:['#e0e0e0',2,'helm','#f2c14e'],weiyan:['#1a1010',1,'patch','#d8463b'],
pangtong:['#3a2a1a',1,'tall','#8bd17c'],jiangwei:['#2a1a1a',0,'band','#2fa35a'],huangyueying:['#5a3a1a',0,'bun','#f2c14e'],fazheng:['#2a2a2a',1,'scholar','#d8463b'],
lusu:['#2a1a1a',1,'scholar','#2fa35a'],lvmeng:['#1a1a1a',1,'helm','#2fa35a'],luxun:['#3a2a1a',0,'tall','#ff5a5a'],taishici:['#2a1a10',1,'feather','#ff3d3d'],
huanggai:['#cfcfcf',2,'band','#ff8a3d'],zhoutai:['#1a1a1a',1,'patch','#2fa35a'],daqiao:['#1a1020',0,'bun','#9ad0ff'],xiaoqiao:['#2a1020',0,'bun','#ffd23d'],
dongzhuo:['#1a1a1a',2,'crown','#8a8f9c'],jiaxu:['#555566',2,'tall','#444'],yanliang:['#2a1a1a',2,'helm','#d8463b'],wenchou:['#1a1a1a',1,'pheasant','#8a8f9c'],
zhangjiao:['#cfcf9a',2,'scholar','#ffd23d'],gongsunzan:['#e8e8e8',1,'helm','#ffffff'],mateng:['#4a3a2a',2,'feather','#c0c6d0'],caiwenji:['#1a1020',0,'bun','#b48cff']});
Object.assign(look,{caozhi:['#7a3a1a',1,'patch','#9ad0ff'],caozhang:['#1a1a1a',1,'helm','#d8463b'],xiahouyuan:['#7a3a1a',1,'crown','#ffffff'],yujin:['#5a3a1a',0,'patch','#ff5a5a'],yuejin:['#3a2a1a',1,'patch','#ff7ab6'],pangde:['#1a1020',2,'crown','#ffd23d'],dengai:['#4a3a2a',1,'feather','#d8463b'],zhonghui:['#1a1a1a',1,'patch','#ff8a3d'],xunyou:['#cfcfcf',0,'crown','#ff7ab6'],chengyu:['#2a1a10',1,'green','#ff8a3d'],manchong:['#3a1a1a',1,'helm','#ffffff'],wangyi:['#5a3a1a',0,'bun','#2fa35a'],guanxing:['#7a3a1a',2,'green','#8bd17c'],zhangbao:['#1a1020',1,'crown','#ff5a5a'],guanping:['#2a1a10',2,'scholar','#d8463b'],madai:['#2b2b3a',2,'green','#9ad0ff'],wangping:['#3a2a1a',1,'crown','#9ad0ff'],maliang:['#7a3a1a',1,'tall','#f2c14e'],masu:['#3a2a1a',1,'feather','#c0c6d0'],jiangwan:['#5a3a1a',2,'crown','#ffffff'],feiyi:['#1a1a1a',1,'crown','#ff5a5a'],liushan:['#1a1020',0,'tall','#2fa35a'],zhurong:['#4a3a2a',0,'bun','#ff8a3d'],menghuo:['#2a1a10',0,'tall','#9ad0ff'],sunce:['#2a1a10',1,'patch','#ff7ab6'],sunjian:['#2a1a10',1,'patch','#9ad0ff'],chengpu:['#5a3a1a',2,'tall','#ff8a3d'],handang:['#1a1a1a',1,'patch','#c0c6d0'],lingtong:['#2b2b3a',2,'pheasant','#b48cff'],xusheng:['#4a3a2a',0,'tall','#f2c14e'],dingfeng:['#2a1a10',2,'scholar','#2fa35a'],zhuran:['#1a1020',2,'pheasant','#f2c14e'],zhugejin:['#3a2a1a',0,'crown','#8bd17c'],bulianshi:['#4a3a2a',0,'bun','#b48cff'],yufan:['#3a2a1a',1,'pheasant','#2fa35a'],zhangzhao:['#4a3a2a',1,'crown','#9ad0ff'],yuanshu:['#2b2b3a',1,'pheasant','#b48cff'],huaxiong:['#3a2a1a',2,'scholar','#c0c6d0'],gaoshun:['#2b2b3a',1,'pheasant','#ff7ab6'],chengong:['#3a2a1a',0,'feather','#ffd23d'],zhangxiu:['#3a2a1a',0,'scholar','#ffd23d'],liru:['#2a1a10',1,'green','#ff5a5a'],zuoci:['#e0e0e0',2,'scholar','#ffffff'],yuji:['#e0e0e0',2,'scholar','#9ad0ff'],liubiao:['#1a1020',2,'pheasant','#8bd17c'],zhangrang:['#3a2a1a',0,'tall','#ffffff'],kongrong:['#3a1a1a',1,'band','#9ad0ff'],hejin:['#3a2a1a',1,'green','#9ad0ff']});
for(const g of GENERALS){const [hair,beard,hat,acc]=look[g.id];const fc=FACTIONS[g.f].c;
 const grid=base.map(r=>r.split(''));
 if(beard==0){grid[9]='....SSSSSSSS....'.split('');grid[10]='......SSSS......'.split('');}
 if(beard==2){grid[10]='.....BBBBBB.....'.split('');grid[11][6]='B';grid[11][7]='B';grid[11][8]='B';grid[11][9]='B';}
 const put=(y,s)=>{for(let x=0;x<16;x++)if(s[x]!='.')grid[y][x]=s[x];};
 if(hat=='crown'){put(0,'......TTTT......');put(1,'.....TTTTTT.....');}
 if(hat=='helm'){put(1,'....CCCCCCCC....');put(2,'...CCCCCCCCCC...');put(0,'.......TT.......');}
 if(hat=='tall'){put(0,'.....HHHHHH.....');put(1,'.....HHHHHH.....');}
 if(hat=='green'){put(1,'....TTTTTTTT....');put(2,'...TTTTTTTTTT...');}
 if(hat=='band'){put(4,'...TTTTTTTTTT...');}
 if(hat=='patch'){grid[6][5]='K';grid[5][4]='K';}
 if(hat=='scholar'){put(0,'......TTTT......');put(1,'.....TTTTTT.....');put(2,'.....TTTTTT.....');}
 if(hat=='feather'){put(0,'.........TT.....');put(1,'........TT......');}
 if(hat=='bun'){put(0,'......HHHH......');put(1,'......HHHH......');put(3,'..T.........T...');}
 if(hat=='pheasant'){put(0,'..T.........T...');put(1,'...T.......T....');put(2,'....TCCCCCCT....');}
 const col={H:hair,S:'#f5c99b',E:'#1a1a1a',B:hair,M:'#b5504a',A:fc,T:acc,C:'#c0c6d0',K:'#111'};
 let px='';const filled=(x,y)=>x>=0&&y>=0&&x<16&&y<16&&grid[y][x]!='.';
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=grid[y][x];
  if(c!='.')px+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${col[c]}"/>`;
  else if(filled(x-1,y)||filled(x+1,y)||filled(x,y-1)||filled(x,y+1))px+=`<rect x="${x}" y="${y}" width="1" height="1" fill="#1b1424"/>`;}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="256" height="256" shape-rendering="crispEdges"><rect width="16" height="16" fill="${fc}" opacity=".25"/><rect y="13" width="16" height="3" fill="${fc}" opacity=".35"/>${px}<rect x="6" y="6" width="1" height="1" fill="#fff" opacity="0"/></svg>`;
 fs.writeFileSync(`${__dirname}/../assets/portraits/${g.id}.svg`,svg);}
console.log('ok');
