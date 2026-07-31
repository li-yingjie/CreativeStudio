export type AssetKind = 'image' | 'audio' | 'video'

export interface AssetPrompt {
  text: string
  skillLabel: string
  model: string
}

export interface AssetItem {
  id?: string
  src: string
  label: string
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
        '奔跑中的 3D 卡通白色小马吉祥物，橙红色鬃毛与大尾巴，红色缰绳，闭眼咧嘴笑，身体挂着同款小马挂件和金色星星。软胶玩具质感，圆润造型，透明背景，侧面完整动作，高细节。',
      ),
    ],
  },
]

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
