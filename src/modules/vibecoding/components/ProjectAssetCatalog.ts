export type AssetKind = 'image' | 'audio' | 'video'

export type AssetLayerType = 'raster' | 'text' | 'vector' | 'upload'

export type AssetLayerRenderer =
  | 'image-model'
  | 'raster-art'
  | 'true-text'
  | 'brand-asset'
  | 'source-asset'

export interface AssetLayer {
  id: string
  name: string
  type: AssetLayerType
  renderer: AssetLayerRenderer
  x: number
  y: number
  width: number
  height: number
  z: number
  visible: boolean
  locked: boolean
  opacity?: number
  src?: string
  text?: string
  fontRef?: { id: string; version: string; family: string }
  color?: string
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  letterSpacing?: number
  lineHeight?: number
  textAlign?: 'left' | 'center' | 'right'
}

export interface AssetLayerManifest {
  canvas: { width: number; height: number }
  templateRef?: { id: string; version: string; name: string }
  styleBibleRef?: { id: string; version: string; name: string }
  layers: AssetLayer[]
}

export interface AssetLayeringHint {
  recommendation: 'keep-flat' | 'consider-layering'
  reason: string
}

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
  /** Every image version resolves to a manifest. Legacy items without one
   *  are lazily represented as a single full-canvas raster layer. */
  layerManifest?: AssetLayerManifest
  /** Transient authoring advice, never a persisted lifecycle state. */
  layeringHint?: AssetLayeringHint
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

export const ACG_NEW_YEAR_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '主视觉与传播适配',
    desc: '直接来自 2026 抖音 ACG 新春会 Figma 的真实画板；保留 node 来源，不混入脑暴或生成占位图',
    items: [
      documentedLayeredCaseAsset('acg-discovery-banner', '/assets/figma-deliverables/acg/discovery-banner-1372x512.png', '游戏中心发现页 Banner', 'node 2229:63622，活动主身份、群像与轨道场景的完整横向交付', { width: 1372, height: 512 }),
      documentedCaseAsset('acg-kv-landscape', '/assets/figma-deliverables/acg/key-visual-landscape.png', '主会场 KV 横版', 'node 2253:13642，主会场 1920×1080 KV', { width: 1920, height: 1080 }),
      documentedCaseAsset('acg-kv-portrait', '/assets/figma-deliverables/acg/key-visual-portrait.png', '主会场 KV 竖版', 'node 2253:13707，主会场 1080×1920 KV', { width: 1080, height: 1920 }),
      documentedCaseAsset('acg-splash', '/assets/figma-deliverables/acg/splash-screen.png', 'ACG 新春会开屏', 'node 2229:67795，1242×2208 开屏画板', { width: 1242, height: 2208 }),
      documentedCaseAsset('acg-partner-honor', '/assets/figma-deliverables/acg/partner-poster-honor.png', '王者合作海报', 'node 2017:7470，合作 IP 竖版传播海报', { width: 1080, height: 1920 }),
    ],
  },
  {
    title: '站内资源位矩阵',
    desc: '搜索、话题、活动中心、游戏中心与创作广场的真实尺寸适配',
    items: [
      documentedCaseAsset('acg-search', '/assets/figma-deliverables/acg/search-banner.png', '精选搜索 Banner', 'node 2181:42603，搜索承接资源位', { width: 1029, height: 360 }),
      documentedCaseAsset('acg-topic-header', '/assets/figma-deliverables/acg/topic-header-banner.png', '话题头图与 Banner', 'node 2229:64229，话题页活动身份组合', { width: 1125, height: 450 }),
      documentedCaseAsset('acg-activity-center', '/assets/figma-deliverables/acg/activity-center-banner.png', '活动中心 Banner', 'node 2229:64459，活动中心入口', { width: 1029, height: 420 }),
      documentedCaseAsset('acg-creative-plaza', '/assets/figma-deliverables/acg/creative-plaza-banner.png', '创作广场 Banner', 'node 2229:65564，游戏中心创作广场入口', { width: 1029, height: 384 }),
      documentedCaseAsset('acg-topic-narrow', '/assets/figma-deliverables/acg/topic-banner.png', '话题窄 Banner', 'node 2276:18124，开年高燃话题 Banner', { width: 1029, height: 195 }),
      documentedCaseAsset('acg-cny-banner', '/assets/figma-deliverables/acg/cny-page-banner.png', '精选 CNY 页 Banner', 'node 2181:42598，精选活动页入口', { width: 747, height: 420 }),
    ],
  },
  {
    title: '页面、节目单与战报',
    desc: '活动长页与结算内容只作为项目实例沉淀，提炼结构时保留 IP 与数据授权边界',
    items: [
      documentedCaseAsset('acg-game-venue', '/assets/figma-deliverables/acg/game-venue-long.png', '游戏分会场长页', 'node 1470:25605，游戏会场完整长页', { width: 750, height: 9776 }),
      documentedCaseAsset('acg-anime-venue', '/assets/figma-deliverables/acg/anime-venue-long.png', '二次元分会场长页', 'node 1529:29607，二次元会场完整长页', { width: 375, height: 3383 }),
      documentedCaseAsset('acg-program', '/assets/figma-deliverables/acg/program-guide-long.png', '节目单长图', 'node 2895:67559，完整节目单传播长图', { width: 1080, height: 11493 }),
      documentedCaseAsset('acg-report', '/assets/figma-deliverables/acg/final-report-long.png', '活动战报长图', 'node 2911:6506，数据与内容结算战报', { width: 1080, height: 26668 }),
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
    title: 'Figma 真实交付基线',
    desc: '暑期 UI 最终页中的玩水与夜食页面、收集状态和原生入口；用于同项目派生与资产提炼，不把交互过程板当成成品',
    items: [
      documentedCaseAsset('xh-figma-water', '/assets/figma-deliverables/xiahua/water-venue-full.png', '玩水完整长页', '暑期UI - 玩水 / node 7976:42929，玩水主题主会场', { width: 375, height: 2989 }),
      documentedCaseAsset('xh-figma-food', '/assets/figma-deliverables/xiahua/food-venue-full.png', '夜食完整长页', '暑期UI - 美食 / node 9553:15006，夜食主题主会场', { width: 375, height: 1898 }),
      documentedCaseAsset('xh-figma-outfits', '/assets/figma-deliverables/xiahua/my-summer-outfits.png', '我的夏装', '暑期UI - 玩水 / node 8091:73128，收集与交换状态', { width: 375, height: 812 }),
      documentedCaseAsset('xh-figma-night-food', '/assets/figma-deliverables/xiahua/my-night-food.png', '我的夜食', '暑期UI - 美食 / node 9834:33984，夜食卡图鉴状态', { width: 375, height: 812 }),
      documentedCaseAsset('xh-figma-native', '/assets/figma-deliverables/xiahua/native-activity-home.png', '原生活动首页', '暑期UI - 玩水 / node 8214:64702，活动原生承接', { width: 390, height: 845 }),
    ],
  },
  {
    title: '资源位规范',
    desc: '活动中心、搜索、话题、评价、团购、POI 等站内入口位型规范；画面为同文件「年度足迹」活动真实图例，夏日版输出待设计',
    items: [
      documentedCaseAsset('xh-slot-activity-center', '/assets/figma-deliverables/xiahua/resource-activity-center-banner.png', '活动中心 Banner 343×140', '暑期交互 / node 6917:89837，活动中心入口位型', { width: 343, height: 140 }),
      documentedCaseAsset('xh-slot-search-bg', '/assets/figma-deliverables/xiahua/resource-search-card-bg.png', '搜索卡背景 390×110', '暑期交互 / node 6917:90312，搜索承接背景位型', { width: 390, height: 110 }),
      documentedCaseAsset('xh-slot-search-cover', '/assets/figma-deliverables/xiahua/resource-search-card-cover.png', '搜索卡活动封面 144×144', '暑期交互 / node 6917:89977，搜索卡活动识别位型', { width: 144, height: 144 }),
      documentedCaseAsset('xh-slot-topic', '/assets/figma-deliverables/xiahua/resource-topic-banner.png', '话题页 Banner 343×65', '暑期交互 / node 6917:90868，话题页导流位型', { width: 343, height: 65 }),
      documentedCaseAsset('xh-slot-review', '/assets/figma-deliverables/xiahua/resource-review-banner.png', '评价页 Banner 343×80', '暑期交互 / node 6917:91237，评价场景位型', { width: 343, height: 80 }),
      documentedCaseAsset('xh-slot-groupbuy', '/assets/figma-deliverables/xiahua/resource-groupbuy-banner.png', '团购 Banner 351×64', '暑期交互 / node 6917:91530，团购频道位型', { width: 351, height: 64 }),
      documentedCaseAsset('xh-slot-poi', '/assets/figma-deliverables/xiahua/resource-poi-banner.png', '城市 POI Banner 343×88', '暑期交互 / node 6917:92381，城市 POI 位型', { width: 343, height: 88 }),
      documentedCaseAsset('xh-slot-creator', '/assets/figma-deliverables/xiahua/resource-creator-zone-cover.png', '创作者专区封面 549×549', '暑期交互 / node 6917:92374，创作者活动专区位型', { width: 183, height: 183 }),
    ],
  },
  {
    title: 'IP 立绘与动作',
    desc: '选马页三款小马真实立绘与玩水线游泳动作图，全部透明底，供会场、资源位与传播复用',
    items: [
      documentedCaseAsset('xh-ip-macaron', '/assets/figma-deliverables/xiahua/ip-horse-macaron.png', '小马「马卡龙」立绘', '暑期UI - 美食 / node 9683:26529，选马角色立绘', { width: 93, height: 150 }),
      documentedCaseAsset('xh-ip-yizima', '/assets/figma-deliverables/xiahua/ip-horse-yizima.png', '小马「一字马」立绘', '暑期UI - 美食 / node 9683:26535，选马角色立绘', { width: 115, height: 153 }),
      documentedCaseAsset('xh-ip-mashangdao', '/assets/figma-deliverables/xiahua/ip-horse-mashangdao.png', '小马「马上到」立绘', '暑期UI - 美食 / node 9683:26542，选马角色立绘', { width: 173, height: 253 }),
      documentedCaseAsset('xh-ip-swim', '/assets/figma-deliverables/xiahua/ip-horse-swim.png', '游泳马动作图', '暑期UI - 玩水 / node 7955:6684，玩水线动作素材', { width: 332, height: 215 }),
    ],
  },
  {
    title: '主视觉与品牌',
    desc: '活动头图、标题字与 IP —— 定调深夜食堂 × 小马的整体气质',
    items: [
      documentedCaseAsset('xh-hero-beach', '/assets/figma-deliverables/xiahua/hero-beach-scene.png', '头图 · 玩水氛围场景', '暑期UI - 玩水 / node 7955:6647，沙滩海面氛围场景，小马入水画面', { width: 390, height: 533 }),
      {
        ...xiahuaAsset(
          'xh-kv-head',
          'head-kv.png',
          '主视觉 / 深夜食堂 KV',
          `${XIAHUA_ART_DIRECTION}。深夜居酒屋俯视场景：戴白色小鸡帽的红色小马 IP 坐在木桌前，桌上摆满小龙虾、烤串、火锅、卤味等夜宵，窗外是紫蓝色霓虹街景，暖黄吊灯打光，右侧一只红色小龙虾角色挥手互动。竖版活动头图，顶部预留标题区，高细节 3D 渲染。`,
        ),
        layerManifest: {
          canvas: { width: 375, height: 494 },
          templateRef: {
            id: 'template.campaign-kv-layered',
            version: '1.2.0',
            name: '活动主视觉分层模板',
          },
          styleBibleRef: {
            id: 'style.night-food-3d',
            version: '2.3.1',
            name: '夜食 3D 烟火感',
          },
          layers: [
            { id: 'kv-base', name: '底景 · 深夜食堂', type: 'raster', renderer: 'image-model', src: '/assets/xiahua/kv/base.png', x: 0, y: 0, width: 375, height: 494, z: 0, visible: true, locked: true },
            { id: 'kv-mascot', name: '主角 · 小马 IP', type: 'upload', renderer: 'source-asset', src: '/assets/xiahua/kv/mascot.png', x: 17, y: 131, width: 285, height: 283, z: 1, visible: true, locked: false },
            { id: 'kv-food', name: '前景 · 火锅', type: 'upload', renderer: 'source-asset', src: '/assets/xiahua/kv/huoguo.png', x: 216, y: 230, width: 93, height: 126, z: 2, visible: true, locked: false },
            { id: 'kv-accent', name: '装饰 · 小龙虾', type: 'upload', renderer: 'source-asset', src: '/assets/xiahua/kv/longxia.png', x: 268, y: 122, width: 67, height: 80, z: 3, visible: true, locked: false },
            { id: 'kv-title', name: '艺术字 · 这夏夯爆了', type: 'raster', renderer: 'raster-art', src: '/assets/xiahua/title.png', x: 64, y: 24, width: 247, height: 68, z: 4, visible: true, locked: false },
            { id: 'kv-logo', name: '品牌 · 抖音生活服务', type: 'vector', renderer: 'brand-asset', src: '/assets/xiahua/footer-logo.png', x: 127, y: 452, width: 121, height: 32, z: 5, visible: true, locked: true },
          ],
        } satisfies AssetLayerManifest,
      },
      {
        ...xiahuaAsset(
          'xh-title',
          'title.png',
          '活动标题字 / 这夏夯爆了',
          '中文书法涂鸦字「这夏夯爆了」，白色主字 + 荧光绿高亮「夏」「夯」，笔锋带喷漆滴落与飞白，右上角小字档期「7.20-8.31」，副标题「集夏夜美食 赢黄金汉堡喵喵！」。透明背景，横版排布，潮流手绘字体设计。',
        ),
        layeringHint: {
          recommendation: 'keep-flat',
          reason: '艺术字的笔触、飞白和多色叠加是整体视觉，默认保持单图。',
        } satisfies AssetLayeringHint,
      },
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
      {
        ...xiahuaAsset('xh-bean-bar', 'bean-bar.png', '金豆入口条', `${XIAHUA_ART_DIRECTION}。横条形入口：左侧端着托盘的厨师小马 IP，中间白色文案「烹饪得金豆，好礼兑不停」与金豆计数，右侧红色圆形「冲！」按钮带角标。深棕底圆角长条，横版 UI 切图。`),
        layeringHint: {
          recommendation: 'consider-layering',
          reason: '金豆数字、行动文案和按钮需经常更新，适合保留真文字层。',
        } satisfies AssetLayeringHint,
      },
    ],
  },
  {
    title: '页面分区',
    desc: '主会场下半屏的成段视觉 —— 任务区 / 话题流 / 活动 banner',
    items: [
      xiahuaAsset('xh-sec-tasks', 'sec-tasks.png', '任务区 / 玩一夏 赚更多', `${XIAHUA_ART_DIRECTION}。任务列表区块：顶部橙色标题「（玩一夏 赚更多。）」带「每天0点刷新」角标，下方「抽夜食!!／攒体力」双页签与多张米色任务卡（带定位投稿、赠送美食卡、浏览活动页），每张右侧红色行动按钮。竖版整段 UI 长图。`),
      xiahuaAsset('xh-sec-topics', 'sec-topics.png', '话题区 / 暑期灵感话题', `${XIAHUA_ART_DIRECTION}。内容话题区块：标题「暑期（灵感话题）」，下方两行胶囊话题标签，再下方横向滑动的美食内容卡片（配图 + 话题名 + 箭头）。深棕底，竖版整段 UI 长图。`),
      {
        ...xiahuaAsset('xh-sec-banner', 'sec-banner.png', '底部 banner / 更多精彩活动', `${XIAHUA_ART_DIRECTION}。底部推广区块：居中胶囊按钮「更多精彩活动」，下方一张浅色活动 banner 占位卡。深棕底，横版整段 UI 切图。`),
        layeringHint: {
          recommendation: 'consider-layering',
          reason: 'Banner 主题、按钮文案和品牌标识可复用，其余区域可保持整图背景。',
        } satisfies AssetLayeringHint,
      },
    ],
  },
].map((group) => ({
  ...group,
  items: group.items.map((item) => {
    const variants = XIAHUA_ASSET_VARIANTS[item.id ?? '']
    return variants ? { ...item, variants } : item
  }),
}))

function documentedCaseAsset(
  id: string,
  src: string,
  label: string,
  purpose: string,
  canvas: { width: number; height: number } = { width: 750, height: 1624 },
): AssetItem {
  return {
    id,
    src,
    label,
    prompt: {
      text: `${purpose}。这是从真实 Figma 案例归档的项目交付实例；只允许在保持活动身份、版式职责和授权边界的前提下派生同项目变体，不得作为跨项目通用品牌素材直接复用。`,
      skillLabel: '活动交付适配 skill',
      model: 'Design Compiler',
    },
    layerManifest: {
      canvas,
      layers: [
        { id: `${id}-source`, name: '真实交付画面', type: 'raster', renderer: 'source-asset', x: 0, y: 0, width: canvas.width, height: canvas.height, z: 0, visible: true, locked: true, src },
      ],
    },
    layeringHint: {
      recommendation: 'consider-layering',
      reason: '项目实例保留原稿；后续只拆分需要独立替换的标题、角色、数据和行动按钮。',
    },
  }
}

/**
 * Demo 中的智能分层结果：真实交付图仍作为不可变像素基线，标题、行动区和
 * 品牌区只记录可选中的语义区域，不伪造原 Figma 文件已经导出了独立图层。
 */
function documentedLayeredCaseAsset(
  id: string,
  src: string,
  label: string,
  purpose: string,
  canvas: { width: number; height: number },
): AssetItem {
  const item = documentedCaseAsset(id, src, label, purpose, canvas)
  return {
    ...item,
    layerManifest: {
      canvas,
      templateRef: {
        id: 'analysis.smart-layer.v1',
        version: '1.0.0',
        name: '智能分层编辑源',
      },
      layers: [
        {
          id: `${id}-source`,
          name: '真实交付画面 · 像素保护基线',
          type: 'raster',
          renderer: 'source-asset',
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
          z: 0,
          visible: true,
          locked: true,
          src,
        },
        {
          id: `${id}-title-region`,
          name: '智能识别 · 标题区域',
          type: 'text',
          renderer: 'true-text',
          text: '',
          fontRef: { id: 'font.douyin-sans', version: '2.0', family: '抖音 Sans' },
          x: Math.round(canvas.width * 0.07),
          y: Math.round(canvas.height * 0.12),
          width: Math.round(canvas.width * 0.56),
          height: Math.round(canvas.height * 0.24),
          z: 1,
          visible: true,
          locked: false,
        },
        {
          id: `${id}-action-region`,
          name: '智能识别 · 行动区域',
          type: 'text',
          renderer: 'true-text',
          text: '',
          fontRef: { id: 'font.douyin-sans', version: '2.0', family: '抖音 Sans' },
          x: Math.round(canvas.width * 0.68),
          y: Math.round(canvas.height * 0.7),
          width: Math.round(canvas.width * 0.24),
          height: Math.round(canvas.height * 0.14),
          z: 2,
          visible: true,
          locked: false,
        },
        {
          id: `${id}-brand-region`,
          name: '智能识别 · 品牌保护区',
          type: 'vector',
          renderer: 'brand-asset',
          x: Math.round(canvas.width * 0.74),
          y: Math.round(canvas.height * 0.08),
          width: Math.round(canvas.width * 0.18),
          height: Math.round(canvas.height * 0.1),
          z: 3,
          visible: true,
          locked: true,
        },
      ],
    },
    layeringHint: {
      recommendation: 'consider-layering',
      reason: 'Demo 已记录智能识别区域；真实交付图继续作为受保护像素基线，避免把推断区域冒充原生设计图层。',
    },
  }
}

export const SPRING_GALA_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '站内页面与直播封面',
    desc: '来自 Figma UI / 直播间物料页的真实最终画板',
    items: [
      documentedCaseAsset('gala-lynx', '/assets/figma-deliverables/spring-gala/main-venue-full.png', 'Lynx 春晚完整长页', 'UI / node 773:119100，直播、节目与互动内容中枢', { width: 375, height: 5925 }),
      documentedCaseAsset('gala-archive', '/assets/figma-deliverables/spring-gala/past-gala-archive.png', '历年春晚回放', 'UI / node 361:32601，年份与回放内容', { width: 375, height: 812 }),
      documentedCaseAsset('gala-live-main', '/assets/figma-deliverables/spring-gala/live-main-camera.png', '直播主机位封面', '直播间物料 / node 739:121303', { width: 1116, height: 630 }),
      documentedCaseAsset('gala-live-captions', '/assets/figma-deliverables/spring-gala/live-captions-cover.png', '无障碍字幕封面', '直播间物料 / node 739:120836', { width: 1116, height: 630 }),
      documentedCaseAsset('gala-live-sign', '/assets/figma-deliverables/spring-gala/live-sign-language-cover.png', '无障碍手语封面', '直播间物料 / node 739:121021', { width: 1116, height: 630 }),
    ],
  },
  {
    title: '资源位与传播物料',
    desc: '同一活动身份在 Banner、头图、节目封面与行政屏中的真实画幅适配',
    items: [
      documentedLayeredCaseAsset('gala-banner', '/assets/figma-deliverables/spring-gala/activity-banner.png', '活动 Banner', '资源位延展 / node 439:12044', { width: 1074, height: 192 }),
      documentedCaseAsset('gala-header', '/assets/figma-deliverables/spring-gala/activity-header.png', '活动头图', '资源位延展 / node 439:12072', { width: 738, height: 1032 }),
      documentedCaseAsset('gala-program-landscape', '/assets/figma-deliverables/spring-gala/program-cover-landscape.png', '节目封面横版', '资源位延展 / node 423:13605', { width: 1125, height: 633 }),
      documentedCaseAsset('gala-program-portrait', '/assets/figma-deliverables/spring-gala/program-cover-portrait.png', '节目封面竖版', '资源位延展 / node 423:13656', { width: 1125, height: 1600 }),
      documentedCaseAsset('gala-admin-p', '/assets/figma-deliverables/spring-gala/admin-screen-portrait.png', '行政竖屏', '资源位延展 / node 686:120040', { width: 1079, height: 1920 }),
      documentedCaseAsset('gala-admin-l', '/assets/figma-deliverables/spring-gala/admin-screen-landscape.png', '行政横屏', '资源位延展 / node 686:120050', { width: 1920, height: 1079 }),
    ],
  },
]

export const EVERNIGHT_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '抽卡页面与图鉴',
    desc: 'Figma 正式页面中的主会场、任务页、图鉴与搜索入口',
    items: [
      documentedCaseAsset('evernight-main', '/assets/figma-deliverables/evernight/main-venue.png', '抽卡主会场', '页面 / node 40:27228，卡池、抽卡、图鉴与任务', { width: 750, height: 3652 }),
      documentedCaseAsset('evernight-tasks', '/assets/figma-deliverables/evernight/task-page.png', '抽卡任务页', '页面 / node 747:9409，任务与次数领取', { width: 750, height: 1603 }),
      documentedCaseAsset('evernight-atlas', '/assets/figma-deliverables/evernight/collection-page.png', '卡片图鉴', '页面 / node 110:81917，已收集与未解锁状态', { width: 750, height: 2687 }),
      documentedLayeredCaseAsset('evernight-banner', '/assets/figma-deliverables/evernight/search-banner-1029x420.png', '搜索 Banner', '页面 / node 1220:54942，搜索承接', { width: 1029, height: 420 }),
    ],
  },
  {
    title: '卡框与结果视觉',
    desc: 'SP / SSR / SR / R / DYR 稀有度卡框和抽卡结果舞台',
    items: [
      documentedCaseAsset('evernight-frame-sp', '/assets/figma-deliverables/evernight/card-frame-sp.png', 'SP 卡框', '页面 / node 1608:11633', { width: 492, height: 676 }),
      documentedCaseAsset('evernight-frame-ssr', '/assets/figma-deliverables/evernight/card-frame-ssr.png', 'SSR 卡框', '页面 / node 1608:11662', { width: 492, height: 676 }),
      documentedCaseAsset('evernight-frame-sr', '/assets/figma-deliverables/evernight/card-frame-sr.png', 'SR 卡框', '页面 / node 1608:11695', { width: 492, height: 676 }),
      documentedCaseAsset('evernight-frame-r', '/assets/figma-deliverables/evernight/card-frame-r.png', 'R 卡框', '页面 / node 1608:11724', { width: 492, height: 676 }),
      documentedCaseAsset('evernight-frame-dyr', '/assets/figma-deliverables/evernight/card-frame-dyr.png', 'DYR 独占卡框', '页面 / node 1608:11777', { width: 492, height: 676 }),
      documentedCaseAsset('evernight-result', '/assets/figma-deliverables/evernight/draw-result-stage.png', '抽卡结果舞台', '页面 / node 1601:11382', { width: 672, height: 924 }),
    ],
  },
]

/* ─── 只交付设计素材的项目（无页面、无玩法配置） ─── */

function sourcedAsset(
  id: string,
  src: string,
  label: string,
  sourceNote: string,
  skillLabel: string,
  model = '来源素材引用',
): AssetItem {
  return {
    id,
    src,
    label,
    prompt: {
      text: `${sourceNote}。该条目是有来源的项目资产，不把引用素材伪装成重新生成结果；后续变体必须保留来源、授权边界与品牌保护区。`,
      skillLabel,
      model,
    },
  }
}

export const XINZAI_IP_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '心仔规范与标准形象',
    desc: '来自心仔官方 IP 手册；用于城市生活季物料前的角色一致性与供应商校验',
    items: [
      sourcedAsset('xinzai-color-standard', '/assets/ip-kits/xinzai-2026/01-color-standard.png', '标准色与辅助色', '心仔官方 IP 手册中的色彩规范', '心仔 IP Kit'),
      sourcedAsset('xinzai-anatomy', '/assets/ip-kits/xinzai-2026/02-character-anatomy.png', '角色结构与保护特征', '心仔官方 IP 手册中的角色结构页', '心仔 IP Kit'),
      sourcedAsset('xinzai-3d-front', '/assets/ip-kits/xinzai-2026/03-3d-front.png', '3D 标准正面', '心仔官方 IP 手册中的 3D 标准形象', '心仔 IP Kit'),
      sourcedAsset('xinzai-2d-front', '/assets/ip-kits/xinzai-2026/04-2d-front.png', '2D 标准正面', '心仔官方 IP 手册中的 2D 标准形象', '心仔 IP Kit'),
      sourcedAsset('xinzai-height-ratio', '/assets/ip-kits/xinzai-2026/05-height-ratio.png', '角色高度与比例', '心仔官方 IP 手册中的比例规范', '心仔 IP Kit'),
      sourcedAsset('xinzai-emotion-expect', '/assets/ip-kits/xinzai-2026/06-emotion-expect.png', '表情 · 期待', '心仔官方 IP 手册中的表情示例', '心仔 IP Kit'),
      sourcedAsset('xinzai-emotion-angry', '/assets/ip-kits/xinzai-2026/07-emotion-angry.png', '表情 · 生气', '心仔官方 IP 手册中的表情示例', '心仔 IP Kit'),
    ],
  },
  {
    title: '吃喝玩乐动作资产',
    desc: '围绕“靠谱的吃喝玩乐好搭子”定位沉淀的项目动作，可直接进入同 IP 物料适配',
    items: [
      sourcedAsset('xinzai-action-greeting', '/assets/ip-kits/xinzai-2026/08-action-greeting.jpg', '动作 · 打招呼', '心仔官方动作资产', '心仔 IP Kit'),
      sourcedAsset('xinzai-action-hotpot', '/assets/ip-kits/xinzai-2026/09-action-hotpot.png', '动作 · 吃火锅', '心仔官方动作资产', '心仔 IP Kit'),
      sourcedAsset('xinzai-action-karaoke', '/assets/ip-kits/xinzai-2026/10-action-karaoke.png', '动作 · 唱歌', '心仔官方动作资产', '心仔 IP Kit'),
      sourcedAsset('xinzai-action-skateboard', '/assets/ip-kits/xinzai-2026/11-action-skateboard.png', '动作 · 滑板', '心仔官方动作资产', '心仔 IP Kit'),
      sourcedAsset('xinzai-action-plane', '/assets/ip-kits/xinzai-2026/12-action-plane.png', '动作 · 出行', '心仔官方动作资产', '心仔 IP Kit'),
      sourcedAsset('xinzai-action-spring', '/assets/ip-kits/xinzai-2026/13-action-spring.png', '动作 · 春日出游', '心仔官方动作资产', '心仔 IP Kit'),
    ],
  },
]

const JINGXIN_CANVAS = { width: 1536, height: 2752 }
const JINGXIN_PREFIX = '/assets/mock-projects/livestream'

export const JINGXIN_LIVESTREAM_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '直播间组合预览',
    desc: '静心采耳馆整套效果；源稿 1536×2752，按 1374×2437 直播间目标规格导出',
    items: [
      {
        ...sourcedAsset(
          'jingxin-live-preview',
          `${JINGXIN_PREFIX}/jingxin-preview.png`,
          '静心采耳馆 · 组合预览',
          '直播间贴片生成案例的完整组合预览，主题为素雅古风静养空间',
          'livestream-sticker skill',
          'Seedream 4.5 + 确定性排版',
        ),
        layerManifest: {
          canvas: JINGXIN_CANVAS,
          templateRef: {
            id: 'livestream.sticker.magicx.v1',
            version: '1.0.0',
            name: '直播间贴片五件套',
          },
          layers: [
            { id: 'jingxin-background', name: '直播背景 · 素雅古风空间', type: 'raster', renderer: 'source-asset', x: 0, y: 0, width: 1536, height: 2752, z: 0, visible: true, locked: true, src: `${JINGXIN_PREFIX}/jingxin-background.jpg` },
            { id: 'jingxin-top-gradient', name: '上贴片 · 米黄竹纹淡雾', type: 'raster', renderer: 'source-asset', x: 0, y: 0, width: 1536, height: 2752, z: 1, visible: true, locked: false, src: `${JINGXIN_PREFIX}/jingxin-top-gradient.png` },
            { id: 'jingxin-bottom-gradient', name: '下贴片 · 素色国风地贴', type: 'raster', renderer: 'source-asset', x: 0, y: 0, width: 1536, height: 2752, z: 2, visible: true, locked: false, src: `${JINGXIN_PREFIX}/jingxin-bottom-gradient.png` },
            { id: 'jingxin-title', name: '主题标题', type: 'raster', renderer: 'source-asset', x: 0, y: 0, width: 1536, height: 2752, z: 3, visible: true, locked: false, src: `${JINGXIN_PREFIX}/jingxin-title.png` },
            { id: 'jingxin-brand', name: '门店品牌区', type: 'raster', renderer: 'brand-asset', x: 0, y: 0, width: 1536, height: 2752, z: 4, visible: true, locked: true, src: `${JINGXIN_PREFIX}/jingxin-brand.png` },
            { id: 'jingxin-benefits', name: '优惠信息', type: 'raster', renderer: 'source-asset', x: 0, y: 0, width: 1536, height: 2752, z: 5, visible: true, locked: false, src: `${JINGXIN_PREFIX}/jingxin-benefits.png` },
            { id: 'jingxin-side-offer', name: '侧贴片 · 到店优惠', type: 'raster', renderer: 'source-asset', x: 0, y: 0, width: 1536, height: 2752, z: 6, visible: true, locked: false, src: `${JINGXIN_PREFIX}/jingxin-side-offer.png` },
          ],
        },
      },
    ],
  },
  {
    title: '可独立交付贴片',
    desc: '背景、标题、品牌、上下渐变、权益和侧贴片可单独下载与替换',
    items: [
      sourcedAsset('jingxin-live-background', `${JINGXIN_PREFIX}/jingxin-background.jpg`, '直播背景', '静心采耳馆直播间背景成图', 'livestream-sticker skill'),
      sourcedAsset('jingxin-live-title', `${JINGXIN_PREFIX}/jingxin-title.png`, '标题贴片', '静心采耳馆透明标题贴片', 'livestream-sticker skill'),
      sourcedAsset('jingxin-live-brand', `${JINGXIN_PREFIX}/jingxin-brand.png`, '品牌贴片', '静心采耳馆品牌标识贴片', 'livestream-sticker skill'),
      sourcedAsset('jingxin-live-top', `${JINGXIN_PREFIX}/jingxin-top-gradient.png`, '上贴片', '米黄色竹纹淡雾上贴片', 'livestream-sticker skill'),
      sourcedAsset('jingxin-live-bottom', `${JINGXIN_PREFIX}/jingxin-bottom-gradient.png`, '下贴片', '素色国风地贴下贴片', 'livestream-sticker skill'),
      sourcedAsset('jingxin-live-benefits', `${JINGXIN_PREFIX}/jingxin-benefits.png`, '套餐权益贴片', '经典采耳 45 分钟 ¥68、城市专享套餐 ¥55', 'livestream-sticker skill'),
      sourcedAsset('jingxin-live-side', `${JINGXIN_PREFIX}/jingxin-side-offer.png`, '侧贴片', '静心采耳馆直播间到店优惠侧贴片', 'livestream-sticker skill'),
    ],
  },
]

const RESOURCE_POSITION_PREFIX = '/assets/mock-projects/resource-position'
const resourcePositionAsset = (
  id: string,
  file: string,
  label: string,
  route: string,
) =>
  sourcedAsset(
    id,
    `${RESOURCE_POSITION_PREFIX}/${file}`,
    label,
    `生活服务热点资源位 V6.7.8 正式成图，1170×330，${route}`,
    '热点资源位 Banner skill',
    'Seedream 4.5 + 程序合成',
  )

export const LIFE_SERVICE_RESOURCE_POSITION_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '清凉、出行与城市体验',
    desc: '按语义路由使用蓝色或绿色模板；标题、Logo 和右侧固定件已通过最终回归',
    items: [
      resourcePositionAsset('resource-ice-camp', 'ice-camp.png', '夏日冰饮｜全城冰饮清凉指南', '蓝色清凉路由'),
      resourcePositionAsset('resource-heat-escape', 'heat-escape.png', '高温预警下的｜快乐避暑姿势', '蓝色清凉路由'),
      resourcePositionAsset('resource-zibo-photo', 'zibo-photo.png', '在淄博拍到了人生照片', '绿色旅行路由'),
    ],
  },
  {
    title: '餐饮、节点与行业热点',
    desc: '保留文档给定标题与固定品牌件，只收录正式成图，不混入生成过程稿',
    items: [
      resourcePositionAsset('resource-duck-camp', 'duck-camp.png', '吃鸭创“燥”营', '黄色活动路由'),
      resourcePositionAsset('resource-autumn-milk-tea', 'autumn-milk-tea.png', '秋天第一杯奶茶来了', '黄色节点路由'),
      resourcePositionAsset('resource-chaoshan-beef', 'chaoshan-beef.png', '潮汕牛肉你涮几秒', '灰色餐饮路由'),
      resourcePositionAsset('resource-bread-brain', 'bread-brain.png', '面包脑袋集合', '灰色餐饮路由'),
      resourcePositionAsset('resource-industry-showcase', 'industry-showcase.png', '行业热点 Showcase 专项', '黄色兜底路由'),
    ],
  },
]

export const HOT_TOPIC_BANNER_ASSET_GROUPS: AssetGroup[] = [
  {
    title: '热点 Banner 正式交付',
    desc: '1170×330 标准资源位；首张保留真实文字图层，可直接改字并拖动未锁定元素',
    items: [
      {
        ...sourcedAsset(
          'hot-topic-industry-layered',
          '/assets/hot-topic-banner/industry-showcase-1170x330.png',
          '行业热点专项 Banner',
          '生活服务热点话题 Banner V6.7.8 正式成图，1170×330',
          '生服热点话题 Banner Skill',
          'Seedream 4.5 + 确定性分层排版',
        ),
        layerManifest: {
          canvas: { width: 1170, height: 330 },
          templateRef: {
            id: 'template.hot-topic-banner',
            version: '6.7.8',
            name: '无 IP 热点话题 Banner',
          },
          styleBibleRef: {
            id: 'brand.douyin-life-service-resource-spec',
            version: '1.0.0',
            name: '生活服务资源位规范',
          },
          layers: [
            { id: 'hot-topic-scene', name: '主题画面与固定件', type: 'raster', renderer: 'image-model', src: '/assets/hot-topic-banner/industry-showcase-base-1170x330.png', x: 0, y: 0, width: 1170, height: 330, z: 0, visible: true, locked: true },
            { id: 'hot-topic-logo', name: '抖音生活服务 Logo', type: 'raster', renderer: 'brand-asset', src: '/assets/hot-topic-banner/douyin-life-service-logo.png', x: 27, y: 25, width: 192, height: 33, z: 1, visible: true, locked: true },
            { id: 'hot-topic-title', name: '主标题', type: 'text', renderer: 'true-text', text: '行业热点专项', color: '#FF5239', fontSize: 105, fontWeight: 400, fontFamily: 'FangFang XianFeng, PingFang SC, sans-serif', letterSpacing: -7.35, lineHeight: 1, textAlign: 'left', x: 67, y: 106, width: 585, height: 99, z: 2, visible: true, locked: false },
            { id: 'hot-topic-subtitle', name: '副标题', type: 'text', renderer: 'true-text', text: '今天又拿捏“热点”了', color: '#FF5239', fontSize: 36, fontWeight: 400, fontFamily: 'FangFang XianFeng, PingFang SC, sans-serif', letterSpacing: -1.8, lineHeight: 1, textAlign: 'center', x: 200, y: 225, width: 309, height: 34, z: 3, visible: true, locked: false },
          ],
        } satisfies AssetLayerManifest,
      },
      sourcedAsset('hot-topic-template-blue', '/assets/hot-topic-banner/template-blue.png', '蓝色模板 Banner', '生活服务热点资源位蓝色语义路由模板，1170×330', '生服热点话题 Banner Skill'),
      sourcedAsset('hot-topic-template-green', '/assets/hot-topic-banner/template-green.png', '绿色模板 Banner', '生活服务热点资源位绿色语义路由模板，1170×330', '生服热点话题 Banner Skill'),
      sourcedAsset('hot-topic-template-yellow', '/assets/hot-topic-banner/template-yellow.png', '黄色模板 Banner', '生活服务热点资源位黄色语义路由模板，1170×330', '生服热点话题 Banner Skill'),
      sourcedAsset('hot-topic-template-gray', '/assets/hot-topic-banner/template-gray.png', '灰色模板 Banner', '生活服务热点资源位灰色语义路由模板，1170×330', '生服热点话题 Banner Skill'),
    ],
  },
  {
    title: '案例战报长图',
    desc: '同一项目的案例结算物料；保持单图层，按原始长图比例进入单图画布',
    items: [
      sourcedAsset('hot-topic-hotel-report', '/assets/hot-topic-banner/hotel-case-poster-1620x6900.png', '成都世园酒店案例战报', '生活服务行业案例战报正式长图，1620×6900', '案例战报海报 Skill'),
    ],
  },
]

const HEADER_PREFIX = '/assets/mock-projects/headers'
export const MAGICX_HEADER_ASSET_GROUPS: AssetGroup[] = [
  {
    title: 'MagicX 首页案例方向',
    desc: '2026-08-18 首页案例快照；作为活动头图提案的构图参考，不冒充本项目新生成资产',
    items: [
      sourcedAsset('header-wunvzhou', `${HEADER_PREFIX}/wunvzhou-romance-banner.png`, '婺女洲中式浪漫 Banner', 'MagicX 首页案例“婺女洲中式浪漫 banner”', '活动头图参考 skill'),
      sourcedAsset('header-jiangnan', `${HEADER_PREFIX}/dou-says-jiangnan.png`, 'Dou 说江南好', 'MagicX 首页案例“Dou 说江南好直播活动”', '活动头图参考 skill'),
      sourcedAsset('header-travel-guide', `${HEADER_PREFIX}/travel-guide-banner.png`, '去班味旅行指南 Banner', 'MagicX 首页案例“去班味旅行指南 banner”', '活动头图参考 skill'),
      sourcedAsset('header-ice-contest', `${HEADER_PREFIX}/national-ice-contest.png`, '全国省冰大赛海报', 'MagicX 首页案例“全国省冰大赛海报”', '活动头图参考 skill'),
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
