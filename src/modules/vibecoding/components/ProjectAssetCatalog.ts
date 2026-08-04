export type AssetKind = 'image' | 'audio' | 'video'

export interface AssetPrompt {
  text: string
  skillLabel: string
  model: string
}

export interface AssetItem {
  id?: string
  src: string
  /** Optional interactive 3D source; src remains the grid thumbnail/fallback. */
  modelSrc?: string
  /** Browser-cached source key used by imported project assets. */
  assetId?: string
  /** Poster shown while an imported video source is not available locally. */
  poster?: string
  label: string
  /** Optional generated alternatives; src is always version 1. */
  variants?: string[]
  /** One-based version when the item is opened from a version picker. */
  version?: number
  /** Frame count for animation folders — shown as a badge. */
  frames?: number
  kind?: AssetKind
  prompt?: AssetPrompt
}

export interface AssetGroup {
  title: string
  desc?: string
  items: AssetItem[]
}

const GARUDA_ART_DIRECTION =
  '末世机械神话题材的竖版弹幕射击 Roguelike 游戏素材，红金黑主色，高对比能量光，清晰硬边轮廓，2D 游戏美术，统一俯视透视和材质语言'

function gameImage(
  id: string,
  src: string,
  label: string,
  subject: string,
  frames?: number,
): AssetItem {
  return {
    id,
    src,
    label,
    frames,
    prompt: {
      text: `${GARUDA_ART_DIRECTION}。${subject}。${
        frames
          ? `输出 ${frames} 帧透明背景序列，动作首尾衔接，主体尺寸与锚点保持稳定，可直接用于 60fps 游戏循环。`
          : '透明背景，主体居中，边缘干净，无文字，无水印，可直接导入 HTML5 游戏。'
      }`,
      skillLabel: '游戏美术 skill',
      model: frames ? 'Seedance 2' : 'NanoBanana',
    },
  }
}

function gameScene(
  id: string,
  src: string,
  label: string,
  subject: string,
): AssetItem {
  return {
    id,
    src,
    label,
    prompt: {
      text: `${GARUDA_ART_DIRECTION}。${subject}。竖屏游戏构图，主体层级清楚，预留 HUD 与玩法区域，画面边缘可无缝延展，无水印。`,
      skillLabel: '游戏场景 skill',
      model: 'NanoBanana',
    },
  }
}

function gameAudio(
  id: string,
  src: string,
  label: string,
  subject: string,
): AssetItem {
  return {
    id,
    src,
    label,
    kind: 'audio',
    prompt: {
      text: `为末世机械神话题材的竖版弹幕射击 Roguelike 游戏制作${subject}。声音短促有冲击力，低频扎实、瞬态清晰，避免对白与环境底噪，适合高频触发并保持混音空间，44.1kHz 立体声。`,
      skillLabel: '游戏音效 skill',
      model: 'AudioGen',
    },
  }
}

function gameVideo(
  id: string,
  src: string,
  label: string,
  subject: string,
): AssetItem {
  return {
    id,
    src,
    label,
    kind: 'video',
    prompt: {
      text: `制作末世机械神话题材的游戏过场动画：${subject}。红金黑配色，能量粒子与金属反光，高张力镜头运动，动作连续，首尾可衔接，16:9，24fps，无文字水印。`,
      skillLabel: '视频生成 skill',
      model: 'Seedance 2',
    },
  }
}

export const GARUDA_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '主角 · Garuda',
    desc: 'NanoBanana 单帧 + Seedance 2 帧动画',
    items: [
      gameImage('garuda-fly', '/garuda/assets/garuda_fly-webp/garuda_fly_00.webp', 'fly', '金翅神鸟机甲主角高速飞行，羽翼展开，推进尾焰明亮', 50),
      gameImage('garuda-shield', '/garuda/assets/garuda_shield-webp/garuda_shield_000.webp', 'shield', '金翅神鸟机甲展开环形能量护盾，护盾从点亮到稳定再消散', 101),
      gameImage('garuda-bomb', '/garuda/assets/garuda_bomb-webp/garuda_bomb_000.webp', 'bomb', '主角蓄力释放范围炸弹，红金能量由核心向外爆发', 152),
      gameImage('garuda-special', '/garuda/assets/garuda_special-webp/garuda_special_000.webp', 'special', '主角进入必杀状态，金色羽翼与符文能量逐级增强', 202),
      gameImage('garuda-killer', '/garuda/assets/garuda_killer_video-webp/garuda_special_video_000.webp', 'killer', '主角发动终结技，镜头前冲并形成贯穿画面的金色斩击', 80),
      gameImage('garuda-killermove', '/garuda/assets/garuda_killermove.webp', 'killermove', '主角终结技关键姿势，金色机甲羽翼完全展开'),
      gameImage('garuda-shell', '/garuda/assets/garuda_shell_gif-webp/garuda_shell_gif_00.webp', 'shell', '主角外层护甲壳旋转展开并重新闭合', 31),
      gameImage('garuda-bullet', '/garuda/assets/garuda_bullet.png', 'bullet', '主角发射的金色羽刃子弹，尖锐流线外形与高亮能量核心'),
    ],
  },
  {
    title: '敌人 · Enemies',
    desc: '5 种基础敌型 + Boss 帧动画',
    items: [
      gameImage('enemy-0', '/garuda/assets/enemy/enemy_0.png', 'enemy_0', '小型侦察敌机，黑红装甲，单核能量灯'),
      gameImage('enemy-1', '/garuda/assets/enemy/enemy_1-webp/enemy_1_00.webp', 'enemy_1', '双翼突击敌机俯冲并开火，机翼与炮口动作连贯', 47),
      gameImage('enemy-2', '/garuda/assets/enemy/enemy_2.png', 'enemy_2', '重装菱形敌机，厚重装甲与双侧炮口'),
      gameImage('enemy-3', '/garuda/assets/enemy/enemy_3_clean.webp', 'enemy_3', '高速切割型敌机，环形刀翼与红色警示灯'),
      gameImage('enemy-4', '/garuda/assets/enemy/enemy_4_clean.webp', 'enemy_4', '远程狙击型敌机，细长炮管与锁定传感器'),
      gameImage('enemy-boss', '/garuda/assets/enemy/enemy_boss-webp/enemy_boss_00.webp', 'boss', '巨型机械神鸟 Boss 展翼、蓄力并释放多阶段弹幕', 61),
      gameImage('enemy-rapid-fire', '/garuda/assets/enemy_RapidFire.webp', 'RapidFire', '敌人快速射击强化图标，多重炮口与速度线'),
      gameImage('enemy-shield-generator', '/garuda/assets/enemy_Shield Generator.webp', 'Shield Gen', '敌人护盾发生器强化图标，六边形能量场'),
      gameImage('enemy-physical-armor', '/garuda/assets/enemy_Physical Armor.webp', 'Phys Armor', '敌人物理装甲强化图标，层叠金属护板'),
      gameImage('enemy-energy-resist', '/garuda/assets/enemy_Energy Resist.webp', 'Energy Res', '敌人能量抗性强化图标，蓝色电磁屏障'),
      gameImage('enemy-vitality', '/garuda/assets/enemy_Vitality.webp', 'Vitality', '敌人生命强化图标，机械心脏与红色脉冲'),
      gameImage('enemy-bullet', '/garuda/assets/enemy/enemy_bullet.png', 'bullet', '敌方红色能量弹，危险感强、轮廓醒目'),
    ],
  },
  {
    title: '道具 · Items',
    items: [
      gameImage('item-blood', '/garuda/assets/item_blood.png', '回血', '生命恢复道具，红色医疗核心与柔和脉冲'),
      gameImage('item-bomb', '/garuda/assets/item_bomb.png', '炸弹', '范围炸弹道具，机械外壳与红色警示灯'),
      gameImage('item-energy', '/garuda/assets/item_enegy.png', '能量', '能量补充道具，金色晶体与旋转光环'),
      gameImage('item-laser', '/garuda/assets/item_laser.png', '激光', '激光武器升级道具，聚焦镜头与蓝色光束'),
      gameImage('item-shell', '/garuda/assets/item_shell.png', '护盾', '护盾道具，半透明六边形能量罩'),
      gameImage('item-speed', '/garuda/assets/item_speed.png', '加速', '速度强化道具，羽翼与连续速度线'),
      gameImage('item-self-destruct', '/garuda/assets/item_Self-Destruct.webp', '自爆', '自爆强化道具，过载核心与倒计时警示'),
      gameImage('item-coin', '/garuda/assets/coin.png', 'coin', '可收集金币，金翅神鸟浮雕与高亮倒角'),
    ],
  },
  {
    title: '场景 · UI / FX',
    items: [
      gameScene('scene-background', '/garuda/assets/background.jpg', 'background', '末世云海与机械遗迹组成的纵向战斗背景'),
      gameScene('scene-start', '/garuda/assets/Start.jpg', 'Start', '主菜单启动场景，巨型金翅神鸟雕像与远处风暴'),
      gameScene('scene-logo', '/garuda/assets/logo.jpg', 'logo', 'GARUDA 游戏标题标志，金属铭牌与金色羽翼'),
      gameScene('scene-mission-start', '/garuda/assets/mission_start.png', 'mission_start', '任务开始横幅，机械边框与红色警戒光'),
      gameImage('ui-button-start', '/garuda/assets/button_start.png', 'btn start', '开始游戏按钮，深色金属底与金色高亮边框'),
      gameImage('ui-button-rank', '/garuda/assets/button_rank.png', 'btn rank', '排行榜按钮，奖杯符号与金属机械边框'),
      gameImage('ui-killer', '/garuda/assets/killer.png', 'killer', '终结技按钮默认态，金色羽翼符号与能量槽'),
      gameImage('ui-killer-ready', '/garuda/assets/killer_R.png', 'killer_R', '终结技按钮可释放态，红金高亮与脉冲光环'),
      gameImage('fx-explosion', '/garuda/assets/explosion_clean_0.png', 'explosion', '机械敌机爆炸特效，橙红火焰、金属碎片与冲击波'),
      gameImage('hud-blood', '/garuda/assets/blood_full.png', 'blood', '满生命值 HUD 条，红色能量液体与机械边框'),
      gameImage('hud-shield', '/garuda/assets/shield_full.png', 'shield', '满护盾值 HUD 条，蓝色能量与六边形纹理'),
      gameImage('hud-special', '/garuda/assets/special_full.png', 'special', '满必杀能量 HUD 条，金色流光与羽翼纹样'),
    ],
  },
  {
    title: '音频 · Audio',
    items: [
      gameAudio('audio-bgm', '/garuda/assets/bgm.mp3', 'bgm.mp3', '主战斗背景音乐，电子交响与东方打击乐融合，节奏持续推进'),
      gameAudio('audio-trans', '/garuda/assets/trans.mp3', 'trans.mp3', '场景切换过渡音效，能量上升后快速收束'),
      gameAudio('audio-killer', '/garuda/assets/killer.mp3', 'killer.mp3', '终结技释放音效，蓄力、爆发与长尾冲击三段式结构'),
      gameAudio('audio-laser', '/garuda/assets/laser.wav', 'laser.wav', '高能激光发射音效，短促电子啸叫与清晰尾音'),
      gameAudio('audio-explosion', '/garuda/assets/explosion_.wav', 'explosion_.wav', '普通敌机爆炸音效，金属碎裂与中频冲击'),
      gameAudio('audio-bomb-blast', '/garuda/assets/sfx_bomb_blast.wav', 'sfx_bomb_blast.wav', '范围炸弹爆破音效，宽广冲击波与低频震动'),
      gameAudio('audio-explosion-big', '/garuda/assets/sfx_explosion_big.wav', 'sfx_explosion_big.wav', 'Boss 大型爆炸音效，多段爆破与厚重低频'),
      gameAudio('audio-explosion-small', '/garuda/assets/sfx_explosion_small.wav', 'sfx_explosion_small.wav', '小型敌机快速爆炸音效，清脆短尾'),
      gameAudio('audio-shield-on', '/garuda/assets/sfx_shield_on.wav', 'sfx_shield_on.wav', '护盾启动音效，数字扫描与透明能量罩成形'),
    ],
  },
  {
    title: '视频 · Cinematics',
    items: [
      gameVideo('video-menu', '/garuda/assets/garuda_menu.mp4', 'garuda_menu.mp4', '主角从云海中出现，机械羽翼逐层展开，镜头推近至主菜单定格'),
      gameVideo('video-start', '/garuda/assets/start_anime_compressed.mp4', 'start_anime.mp4', '主角冲出机库进入纵向战场，镜头从侧后方切换到俯视跟随'),
    ],
  },
]

const H5_IP_SKILL = '抖音 IP skill'

function h5Asset(
  id: string,
  file: string,
  label: string,
  text: string,
  model = 'NanoBanana',
): AssetItem {
  return {
    id,
    src: `/assets/acg-new-year/materials/${file}`,
    label,
    prompt: {
      text,
      skillLabel: H5_IP_SKILL,
      model,
    },
  }
}

export const ACG_NEW_YEAR_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '活动素材',
    desc: '抖音 ACG 游戏新春会 · 12 项独立生成素材',
    items: [
      h5Asset(
        'acg-01-hero',
        '01-activity-hero.png',
        '01 / 活动主视觉',
        '春节游戏主题活动主视觉，红色新春舞台背景，悬挂灯笼、中国结与烟花，集合多款热门游戏角色形成热闹群像。画面中心下方预留“抖音 ACG 游戏新春会”主标题，红金高亮、节庆氛围浓郁，16:9 横版商业活动 KV，高细节。',
      ),
      h5Asset(
        'acg-02-corgi',
        '02-party-corgi.png',
        '02 / 派对动物角色',
        '一只可爱的 3D 卡通柯基吉祥物，橙白柔软短毛，大耳朵、圆眼睛、黑色鼻头，佩戴红色项圈与金色圆牌，正面略微侧身站立。玩具级角色设计，毛绒与软胶结合，柔和棚拍光，透明背景，完整全身，高细节。',
      ),
      h5Asset(
        'acg-03-dungeon',
        '03-dungeon-character.png',
        '03 / 地下城角色立绘',
        '地下城冒险主题的 Q 版男性角色立绘，白色兜帽与红棕描边，手持巨大木槌，另一只手做出制止姿势。日系游戏角色比例，清晰赛璐璐上色，表情坚定，正面三分之二视角，透明背景，完整角色。',
      ),
      h5Asset(
        'acg-04-king',
        '04-king-character.png',
        '04 / 王者角色素材',
        '东方幻想竞技游戏的青年男性英雄，青黑长发，裸露上身搭配金色与青色机械饰甲，右手凝聚金蓝双色能量。写实游戏宣传立绘，动态姿态，边缘带速度残影，透明背景，横向构图，高细节。',
      ),
      h5Asset(
        'acg-05-egg',
        '05-egg-party-keyboard.png',
        '05 / 蛋仔角色素材',
        '一个可爱的 3D 卡通机器人角色，拟人化电子乐器造型，一个蓝色小钢琴/电子琴角色，拥有圆润的白色身体和黄色圆形头部，头顶两个黄色小天线。角色正面朝向镜头，身体漂浮在空中，姿态轻松可爱。\n\n巨大的圆形黄色脸部位于后方，脸上有两个星星形状的闪亮眼睛，黑色小嘴，带有害羞可爱的表情。前方是一台倾斜放置的蓝色电子键盘乐器，圆角矩形设计，表面光滑，带有白色和黑色琴键，左右两侧有黄色圆形机械手臂握住键盘。\n\n整体采用玩具级工业设计，软胶材质，磨砂塑料质感，圆润边角，高级产品渲染效果，简洁几何造型，轻微反射，高光柔和，Octane Render 风格，3D icon design，儿童玩具风格。\n\n纯浅灰色背景，居中构图，漂浮展示，无阴影或柔和接触阴影，干净商业产品展示图，高细节。',
      ),
      h5Asset(
        'acg-06-cannon',
        '06-title-cannon.png',
        '06 / 标题炮筒装饰',
        '两个红橙色玩具炮筒组成的新春装饰图标，圆润软胶材质，金黄色金属包边，绿色点火环与红色引线，顶部绽放小型金色烟花。3D icon design，透明背景，居中构图，柔和高光，高细节。',
      ),
      h5Asset(
        'acg-07-video-cover',
        '07-focus-video-cover.png',
        '07 / 焦点视频封面',
        '梦幻派对游戏的横版焦点视频封面，粉蓝天空、彩虹道路、糖果城堡和漂浮星球，前景是戴黄色安全帽的可爱角色，远处多个角色飞跃拱门。明亮 3D 卡通渲染，童趣、轻盈、高饱和，16:9 宣传海报构图。',
      ),
      h5Asset(
        'acg-08-content-party',
        '08-content-cover-party.png',
        '08 / 内容封面素材 01',
        '都市潮流动作游戏的横版内容封面，粉发少女在前景伸手指向镜头，多名未来街头角色与机器人分布在黄色几何分镜中。动漫赛璐璐风格，黑黄主色，高动势漫画排版，16:9，高细节。',
      ),
      h5Asset(
        'acg-09-content-action',
        '09-content-cover-action.png',
        '09 / 内容封面素材 02',
        '极简电影感竖版风景，橙粉色落日天空与海面，中间以细长黑色落地窗框形成节奏，一个微小人物沿地平线行走。大面积留白、宁静孤独、低饱和胶片色调，9:16。',
      ),
      h5Asset(
        'acg-10-content-sunset',
        '10-content-cover-sunset.png',
        '10 / 内容封面素材 03',
        '超现实极简竖版风景，深蓝天空、白色沙丘、橙红色花田与一棵孤树，天空悬挂细小月牙，远处只有一个人物。强烈色块分层，安静梦境感，9:16，杂志摄影质感。',
      ),
      h5Asset(
        'acg-11-content-field',
        '11-content-cover-field.png',
        '11 / 内容封面素材 04',
        '极简梦幻竖版风景，浅粉天空中悬浮巨大淡粉月亮，绿色田野延伸至地平线，一个微小人物站在月下。柔和粉绿配色、低对比、宁静超现实氛围，9:16，高级海报感。',
      ),
      h5Asset(
        'acg-12-mascot',
        '12-event-mascot-horse.png',
        '12 / 活动入口吉祥物',
        '站立的 3D 卡通红色小马吉祥物，深棕色蓬松鬃毛与尾巴，米色大口鼻、手脚，半睁眼和简单弧线笑脸。圆润软胶玩具质感，透明背景，三分之四正面，高细节。',
      ),
    ],
  },
]

/* ─── 夏日冲浪 · 顺风顺水（Marketing King / marketing-h5）─── */

const SUMMER_SURF_ART_DIRECTION =
  '夏日冲浪 · 顺风顺水营销 H5，清爽海岛蓝与阳光黄配色，3D 软胶玩具质感，轻松、明亮、有风感，适配抖音生活服务活动页'

function summerSurfAsset(
  id: string,
  file: string,
  label: string,
  subject: string,
  model = 'NanoBanana',
): AssetItem {
  return {
    id,
    src: `/assets/marketing-king/${file}`,
    label,
    prompt: {
      text: `${SUMMER_SURF_ART_DIRECTION}。${subject}。保持透明背景或原始画布比例，主体完整、边缘干净、无水印，直接对应“夏日冲浪 · 顺风顺水”的页面模块。`,
      skillLabel: 'H5 活动视觉 skill',
      model,
    },
  }
}

function summerSurfVideo(
  id: string,
  assetId: string,
  posterFile: string,
  label: string,
  subject: string,
): AssetItem {
  return {
    id,
    src: '',
    assetId,
    poster: `/assets/marketing-king/${posterFile}`,
    label,
    kind: 'video',
    prompt: {
      text: `${SUMMER_SURF_ART_DIRECTION}。${subject}。这是原始 Marketing King 活动中的 Hero 视频资源，保持 3:4 竖版构图、首尾帧与夏日装备叠加层对齐，无文字水印。`,
      skillLabel: 'H5 活动视频 skill',
      model: 'Seedance 2',
    },
  }
}

export const SUMMER_SURF_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '主视觉与地图',
    desc: '活动主页的夏日 KV、地图背景、首尾帧与原始 Hero 视频',
    items: [
      summerSurfVideo(
        'surf-hero-video-start',
        'builtin:summer:hero:start:video-native-v1',
        'theme-assets/summer/hero-layer-base.png',
        'Hero 视频 / 开场首焦',
        '从夏日海岛首焦开始，承接活动入口与首个装备点亮前的开场动作。',
      ),
      summerSurfVideo(
        'surf-hero-video-end',
        'builtin:summer:hero:end:video-native-v1',
        'theme-assets/summer/hero-scene-v2.png',
        'Hero 视频 / 集卡完成尾帧',
        '从装备逐步集齐过渡到顺风顺水完整合成画面，作为 Hero 的完成态视频。',
      ),
      summerSurfAsset(
        'surf-hero-base',
        'theme-assets/summer/hero-layer-base.png',
        '主视觉底图 / 夏日海岛',
        '海岛地图与蓝色海水的活动主视觉底图，预留装备叠加层与顶部导航区域。',
      ),
      summerSurfAsset(
        'surf-hero-scene',
        'theme-assets/summer/hero-scene-v2.png',
        '主视觉合成 / 顺风顺水',
        '已经合成装备与角色的最终活动 KV，对应预览中的首屏 hero composition。',
      ),
      summerSurfAsset(
        'surf-map-cap',
        'figma/map-cap.png',
        '地图顶栏 / 活动入口',
        '地图页顶部装饰与活动导航背景，承接“夏日冲浪 · 顺风顺水”标题和主题切换。',
      ),
    ],
  },
  {
    title: '装备卡面',
    desc: '顺风装备册的 7 种装备；其中 6 张已有真实图片，幸运帽按配置保留待补素材态',
    items: [
      summerSurfAsset('surf-card-watergun', 'figma/equipment-water-gun.webp', '装备卡 / 鲨鲨水枪', '蓝色鲨鱼造型水枪，装备册普通卡。'),
      summerSurfAsset('surf-card-watermelon', 'figma/equipment-watermelon-bucket.webp', '装备卡 / 冰镇西瓜', '西瓜造型玩水桶，装备册普通卡。'),
      summerSurfAsset('surf-card-surfboard', 'figma/equipment-paddle-board.webp', '装备卡 / 顺风冲浪板', '黄色冲浪板，装备册普通卡。'),
      summerSurfAsset('surf-card-palmtree', 'figma/equipment-palm-tree.webp', '装备卡 / 海岛椰树', '海岛椰树装饰，装备册普通卡。'),
      summerSurfAsset('surf-card-floatie', 'figma/equipment-pineapple-float.webp', '装备卡 / 好运泳圈', '菠萝造型泳圈，装备册普通卡。'),
      summerSurfAsset('surf-card-deckchair', 'figma/equipment-sun-chair.webp', '装备卡 / 躺赢沙滩椅', '阳光沙滩椅，装备册普通卡。'),
    ],
  },
  {
    title: '角色与奖励',
    desc: '活动 IP、足金顺顺马奖品与品牌标识',
    items: [
      summerSurfAsset('surf-mascot', 'figma/mascot-side-horse.webp', '活动角色 / 顺顺马', '侧身出现的红色小马 IP，作为活动主页的角色陪伴和引导。'),
      summerSurfAsset('surf-grand-reward', 'figma/reward-gold-horse.webp', '大奖 / 足金顺顺马', '足金顺顺马实物奖励，出现在 7 件装备集齐档位。'),
      summerSurfAsset('surf-brand-logo', 'figma/brand-logo.png', '页脚品牌 / 抖音生活服务', '抖音生活服务品牌字标，用于活动页底部品牌信息。'),
    ],
  },
  {
    title: '话题与内容区',
    desc: '暑期灵感话题、玩水地点投稿与下半屏内容卡片',
    items: [
      summerSurfAsset('surf-topic-hotpot', 'figma/topic-hotpot-card.webp', '灵感卡 / 清凉美食指南', '清凉美食内容卡，承接“把夏天吃进这一口”灵感话题。'),
      summerSurfAsset('surf-topic-sunset', 'figma/topic-sunset-card.webp', '灵感卡 / 晚霞打卡指南', '晚霞打卡内容卡，承接“晚霞就是天空的诗”灵感话题。'),
      summerSurfAsset('surf-topic-lake', 'figma/topic-lake-card.webp', '灵感卡 / 扎进水里夏天', '湖边玩水内容卡，承接“把清凉值拉满”灵感话题。'),
      summerSurfAsset('surf-content-lions', 'figma/content-card-lions.webp', '地点内容 / 上海动物园', '带定位的玩水地点内容卡，示例地点为上海动物园。'),
      summerSurfAsset('surf-content-cabin', 'figma/content-card-cabin.webp', '地点内容 / 世博文化公园', '带定位的玩水地点内容卡，示例地点为世博文化公园。'),
      summerSurfAsset('surf-content-avatar', 'figma/content-avatar.png', '内容头像 / 活动用户', '活动内容流中的用户头像，占位真实素材。'),
    ],
  },
]

/* ─── 这夏夯爆了 · 夏日夜食指南（marketing-h5）─── */

const XIAHUA_ART_DIRECTION =
  '抖音生活服务「这夏夯爆了」夏日夜食活动素材，深夜食堂夜市氛围，暖棕木质 + 霓虹夜景底色，红橙主色配荧光绿点缀，3D 软胶玩具质感，圆润造型，柔和高光'

export const XIAHUA_MASCOT_MODEL_SRC = '/cartoon pony 3d model.glb'

function xiahuaAsset(
  id: string,
  file: string,
  label: string,
  text: string,
  model = 'NanoBanana',
): AssetItem {
  return {
    id,
    src: `/assets/xiahua/${file}`,
    label,
    prompt: { text, skillLabel: 'H5 活动视觉 skill', model },
  }
}

/** 一张夜食卡的两种形态共用同一句描述，只切换「已获得 / 未获得」。 */
function foodCard(
  id: string,
  file: string,
  label: string,
  dish: string,
  grey = false,
): AssetItem {
  return xiahuaAsset(
    id,
    file,
    label,
    `${XIAHUA_ART_DIRECTION}。不锈钢餐盘俯视摆放${dish}，盘面左下压一张米色纸质贴纸标签，${
      grey
        ? '整卡为未获得态：统一米棕石膏材质，无彩色，仅保留浮雕体积与轮廓，标签文字同色下沉。'
        : '标签上是红色手写体菜名与一句风味短句，菜品色彩饱满、油光水润。'
    }竖版 109:145 卡面，透明背景，居中构图，无水印。`,
  )
}

/** 已实际产出的候选版本；素材库只把存在的版本展示出来。 */
const XIAHUA_ASSET_VARIANTS: Record<string, string[]> = {
  'xh-kv-head': [
    '/assets/xiahua/variants/head-kv-v2.png',
    '/assets/xiahua/variants/head-kv-v3.png',
    '/assets/xiahua/variants/head-kv-v4.png',
  ],
  'xh-title': ['/assets/xiahua/variants/title-v2.png'],
  'xh-panel-bg': ['/assets/xiahua/variants/panel-bg-v2.png'],
  'xh-btn-draw': ['/assets/xiahua/variants/btn-draw-v2.png'],
  'xh-card-big': ['/assets/xiahua/variants/bigcard-v2.png'],
  'xh-tier-43': ['/assets/xiahua/variants/tier-43-v2.png'],
  'xh-card-huoguo': ['/assets/xiahua/variants/food-huoguo-v2.png'],
}

export const XIAHUA_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '主视觉与品牌',
    desc: '活动头图、标题字与 IP —— 定调深夜食堂 × 小马的整体气质',
    items: [
      xiahuaAsset(
        'xh-kv-head',
        'head-kv.png',
        '主视觉 / 深夜食堂 KV',
        `${XIAHUA_ART_DIRECTION}。深夜居酒屋俯视场景：戴白色小鸡帽的红色小马 IP 坐在木桌前，桌上摆满小龙虾、烤串、火锅、卤味等夜宵，窗外是紫蓝色霓虹街景，暖黄吊灯打光，右侧一只红色小龙虾角色挥手互动。竖版活动头图，顶部预留标题区，高细节 3D 渲染。`,
      ),
      xiahuaAsset(
        'xh-title',
        'title.png',
        '活动标题字 / 这夏夯爆了',
        '中文书法涂鸦字「这夏夯爆了」，白色主字 + 荧光绿高亮「夏」「夯」，笔锋带喷漆滴落与飞白，右上角小字档期「7.20-8.31」，副标题「集夏夜美食 赢黄金汉堡喵喵！」。透明背景，横版排布，潮流手绘字体设计。',
      ),
      xiahuaAsset(
        'xh-result-title',
        'result-title.png',
        '开卡标题 / 恭喜你获得',
        '中文涂鸦字「恭喜你获得」，「恭喜」为荧光绿手写笔刷、「你获得」为白色粗黑体，上方点缀橙色小字 wow 与下划线，周围散落荧光绿菱形与橙色小圆点。透明背景，横版，适配深色开卡弹层。',
      ),
      {
        ...xiahuaAsset(
          'xh-mascot',
          'mascot-horse-v3.png',
          'IP 形象 / 小马 3D 对象',
          '参考新版 IP 的 3D 卡通红色小马，深棕色蓬松鬃毛与尾巴，米色大口鼻、手脚，半睁眼和简单弧线笑脸，圆润软胶玩具质感，透明背景，三分之四视角，全身产品级渲染。可进入小马 3D 工作台调整视角、灯光与截图背景。',
        ),
        modelSrc: XIAHUA_MASCOT_MODEL_SRC,
      },
      xiahuaAsset(
        'xh-footer-logo',
        'footer-logo.png',
        '页脚字标 / 抖音生活服务',
        '抖音生活服务品牌字标：音符 logo + 「抖音生活服务」白色字样，下方一行细字 slogan「让每次心动都值得」。透明背景，横版居中，简洁 UI 切图。',
      ),
    ],
  },
  {
    title: '夜食卡面',
    desc: '9 种虚拟夜食卡 · 已获得（彩色）/ 未获得（石膏）两态 + 开卡大图',
    items: [
      foodCard('xh-card-huoguo', 'food-huoguo.png', '沸腾火锅 / 已获得', '一口陶土砂锅盛红汤火锅，配青菜、番茄与五花肉片，底下小灶火焰'),
      foodCard('xh-card-huoguo-grey', 'food-huoguo-grey.png', '沸腾火锅 / 未获得', '一口陶土砂锅盛火锅', true),
      foodCard('xh-card-longxia', 'food-longxia.png', '红火小龙虾 / 已获得', '一盆麻辣小龙虾，虾壳通红油亮，撒葱花与辣椒'),
      foodCard('xh-card-kaorou', 'food-kaorou.png', '滋滋烤肉 / 已获得', '三串炭烤肉串，肉块焦边油亮，夹青椒与葱段'),
      foodCard('xh-card-huangyu', 'food-huangyu.png', '鲜烧黄鱼 / 已获得', '一条红烧黄鱼卧在浓褐酱汁椭圆盘中，鱼身撒葱丝，鱼眼是 X 形卡通符号'),
      foodCard('xh-card-pisa', 'food-pisa.png', '浓香披萨 / 已获得', '一整块芝士拉丝披萨，边缘焦脆，铺满意式香肠'),
      foodCard('xh-card-zhaji', 'food-zhaji.png', '香脆炸鸡 / 已获得', '一篮金黄炸鸡块，表皮酥脆颗粒分明，配柠檬角'),
      foodCard('xh-card-ningcha', 'food-ningcha.png', '冰爽柠檬茶 / 已获得', '一杯冰镇柠檬茶，杯壁凝水珠，插柠檬片与吸管'),
      foodCard('xh-card-luwei-grey', 'food-luwei-grey.png', '解馋卤味 / 未获得', '一盘卤味拼盘', true),
      foodCard('xh-card-luosifen-grey', 'food-luosifen-grey.png', '上头螺蛳粉 / 未获得', '一碗螺蛳粉', true),
      xiahuaAsset(
        'xh-card-big',
        'bigcard.png',
        '开卡大图 / 沸腾火锅',
        `${XIAHUA_ART_DIRECTION}。抽中卡片的全屏展示版：不锈钢餐盘盛陶土砂锅红汤火锅，配青菜番茄与五花肉，盘面左下压米色纸贴，红色手写「沸腾火锅」与竖排小字「热辣下肚，烦恼止步」。竖版 260:357 大卡，透明背景，正面微俯视，材质细节拉满。`,
      ),
    ],
  },
  {
    title: '奖励与档位',
    desc: '上线使用 2 / 4 / 7 三档券奖励；实物奖素材保留为未启用候选',
    items: [
      xiahuaAsset('xh-tier-2', 'tier-2.png', '档位 01 / 2 元夜食券', `${XIAHUA_ART_DIRECTION}。3D 立体优惠券图标，红色券身带齿孔边，正面居中白色粗体「¥2」，微微倾斜带投影。透明背景，产品级渲染。`),
      xiahuaAsset('xh-tier-5', 'tier-5.png', '档位 02 / 5 元夜食券', `${XIAHUA_ART_DIRECTION}。3D 立体优惠券图标，红色券身带齿孔边，正面居中白色粗体「¥5」，比 2 元券更大更亮。透明背景，产品级渲染。`),
      xiahuaAsset('xh-tier-43', 'tier-43.png', '档位 03 / 43 元券包', `${XIAHUA_ART_DIRECTION}。3D 立体优惠券包图标，多张红色券叠放，最上层白色粗体「¥43」，右上角露出叠层厚度。透明背景，产品级渲染。`),
      xiahuaAsset('xh-tier-gold', 'tier-gold.png', '未启用候选 / 黄金转运珠', `${XIAHUA_ART_DIRECTION}。3D 黄金小马转运珠实物奖品图标，足金材质高反光，圆润小马造型，底部标注「足金」小牌。透明背景，珠宝级渲染。`),
      xiahuaAsset('xh-envelope', 'envelope.png', '兑换红包', `${XIAHUA_ART_DIRECTION}。3D 立体红包图标，粉红色软胶质感封套，中间一枚米金色圆形封印，边缘圆润带柔和高光。透明背景，正面居中。`),
    ],
  },
  {
    title: '交互组件',
    desc: '按钮、面板底与浮层入口 —— 直接对应页面上的可点区域（阶段 Tab、分享/规则栏为代码实现，不占素材）',
    items: [
      xiahuaAsset('xh-btn-draw', 'btn-draw.png', '主按钮 / 抽夏日夜食', `${XIAHUA_ART_DIRECTION}。红色胶囊主行动按钮，白色粗体文案「抽夏日夜食」，表面带高光与厚度投影，微微上凸。透明背景，横版 UI 切图。`),
      xiahuaAsset('xh-btn-my-cards', 'btn-my-cards.png', '侧入口 / 我的夜食', `${XIAHUA_ART_DIRECTION}。左侧半圆浮层入口，棕红色底衬白色两行小字「我的夜食」，右半贴合屏幕边缘。透明背景，UI 切图。`),
      xiahuaAsset('xh-btn-my-prizes', 'btn-my-prizes.png', '侧入口 / 我的奖品', `${XIAHUA_ART_DIRECTION}。右侧半圆浮层入口，棕红色底衬白色两行小字「我的奖品」，左半贴合屏幕边缘。透明背景，UI 切图。`),
      xiahuaAsset('xh-panel-bg', 'panel-bg.png', '集卡面板底', `${XIAHUA_ART_DIRECTION}。集卡进度面板底衬：深棕渐变圆角矩形，左上角内凹形成标题区，边缘带一圈浅棕描边。纯色 UI 底图，无文字。`),
      xiahuaAsset('xh-bean-bar', 'bean-bar.png', '金豆入口条', `${XIAHUA_ART_DIRECTION}。横条形入口：左侧端着托盘的厨师小马 IP，中间白色文案「烹饪得金豆，好礼兑不停」与金豆计数，右侧红色圆形「冲！」按钮带角标。深棕底圆角长条，横版 UI 切图。`),
    ],
  },
  {
    title: '页面分区',
    desc: '主会场下半屏的成段视觉 —— 任务区 / 话题流 / 活动 banner',
    items: [
      xiahuaAsset('xh-sec-tasks', 'sec-tasks.png', '任务区 / 玩一夏 赚更多', `${XIAHUA_ART_DIRECTION}。任务列表区块：顶部橙色标题「（玩一夏 赚更多。）」带「每天0点刷新」角标，下方「抽夜食!!／攒体力」双页签与多张米色任务卡（带定位投稿、赠送美食卡、浏览活动页），每张右侧红色行动按钮。竖版整段 UI 长图。`),
      xiahuaAsset('xh-sec-topics', 'sec-topics.png', '话题区 / 暑期灵感话题', `${XIAHUA_ART_DIRECTION}。内容话题区块：标题「暑期（灵感话题）」，下方两行胶囊话题标签，再下方横向滑动的美食内容卡片（配图 + 话题名 + 箭头）。深棕底，竖版整段 UI 长图。`),
      xiahuaAsset('xh-sec-banner', 'sec-banner.png', '底部 banner / 更多精彩活动', `${XIAHUA_ART_DIRECTION}。底部推广区块：居中胶囊按钮「更多精彩活动」，下方一张浅色活动 banner 占位卡。深棕底，横版整段 UI 切图。`),
    ],
  },
].map((group) => ({
  ...group,
  items: group.items.map((item) => {
    const variants = XIAHUA_ASSET_VARIANTS[item.id ?? '']
    return variants ? { ...item, variants } : item
  }),
}))

export function resolveAssetPrompt(item: AssetItem): AssetPrompt {
  if (item.prompt) return item.prompt
  const kind = item.kind ?? 'image'
  if (kind === 'audio') {
    return {
      text: `为当前项目生成与“${item.label}”用途匹配的音频素材。保持声音干净、层次清楚、可循环或可高频触发，并保留足够混音空间。`,
      skillLabel: '音频生成 skill',
      model: 'AudioGen',
    }
  }
  if (kind === 'video') {
    return {
      text: `为当前项目生成“${item.label}”视频素材。保持主体一致、动作连续、镜头稳定，首尾衔接自然，无文字水印。`,
      skillLabel: '视频生成 skill',
      model: 'Seedance 2',
    }
  }
  return {
    text: `为当前项目生成“${item.label}”图像素材。保持项目既有美术风格，主体清晰、构图完整、边缘干净，无文字水印。`,
    skillLabel: '图像生成 skill',
    model: 'NanoBanana',
  }
}
