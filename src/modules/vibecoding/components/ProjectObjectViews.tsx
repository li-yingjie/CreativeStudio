import type { ReactNode } from 'react'
import {
  DATA_CONFIG_LABEL,
  DATABASE_LABEL,
  GAME_GAMEPLAY_CONFIG_LABEL,
  GAMEPLAY_CONFIG_LABEL,
  H5_GAMEPLAY_CONFIG_LABEL,
  INTEREST_CARD_CONFIG_LABEL,
  PROJECT_MEMORY_LABEL,
  type ProjectKind,
} from './ProjectProductView'

/**
 * 每个项目「产物对象」的真实化 mock 内容。
 *
 * 之前许多对象（基础信息 / 页面 / 玩法 / 技能 / 知识库 / 数据库 / 素材）都复用
 * 通用的代码编辑器或文档视图，内容与项目并不匹配。这里按项目类型给每个对象
 * 准备贴合的静态内容，并在 renderTab 里优先命中。命中不到时返回 null，让调用方
 * 走原有的兜底视图（文档 / 项目文件等）。
 */

type InfoContent = {
  type: 'info'
  summary?: string
  tags?: string[]
  groups: { title: string; rows: [string, string][] }[]
}
type DbColumn = { name: string; type: string; desc: string }
type DbTable = { name: string; desc: string; columns: DbColumn[]; rows?: string[][] }
export type DbContent = { type: 'database'; tables: DbTable[] }
type CardItem = { icon: string; title: string; desc: string; meta?: string }
type CardsContent = { type: 'cards'; columns?: number; note?: string; items: CardItem[] }

type ObjectContent = InfoContent | DbContent | CardsContent

/* ─────────────────────────── 数据 ─────────────────────────── */

const CONTENT: Record<string, Record<string, ObjectContent>> = {
  /* ── 塔罗兴趣卡（mini-program）。技能为类目，复用 分身 的能力详情视图 ── */
  '塔罗兴趣卡': {
    [DATA_CONFIG_LABEL]: {
      type: 'database',
      tables: [
        {
          name: 'tarot_cards',
          desc: '塔罗牌牌库（韦特体系 78 张）',
          columns: [
            { name: 'id', type: 'int', desc: '主键' },
            { name: 'name', type: 'varchar(32)', desc: '牌名' },
            { name: 'arcana', type: "enum('major','minor')", desc: '大/小阿尔卡那' },
            { name: 'upright', type: 'text', desc: '正位牌意' },
            { name: 'reversed', type: 'text', desc: '逆位牌意' },
            { name: 'image_url', type: 'varchar(128)', desc: '牌面图' },
          ],
          rows: [
            ['0', '愚人 The Fool', 'major', '新的开始 · 冒险', '鲁莽 · 逃避'],
            ['1', '魔术师 The Magician', 'major', '创造力 · 行动', '欺骗 · 犹豫'],
            ['2', '女祭司 High Priestess', 'major', '直觉 · 潜意识', '隐瞒 · 压抑'],
          ],
        },
        {
          name: 'daily_draw',
          desc: '每日抽牌记录',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'user_id', type: 'bigint', desc: '用户' },
            { name: 'card_id', type: 'int', desc: '抽到的牌' },
            { name: 'is_reversed', type: 'tinyint', desc: '是否逆位' },
            { name: 'created_at', type: 'datetime', desc: '抽牌时间' },
          ],
        },
        {
          name: 'users',
          desc: '小程序用户',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'openid', type: 'varchar(64)', desc: '微信 openid' },
            { name: 'nickname', type: 'varchar(32)', desc: '昵称' },
            { name: 'draw_streak', type: 'int', desc: '连续抽牌天数' },
          ],
        },
      ],
    },
    [PROJECT_MEMORY_LABEL]: {
      type: 'cards',
      note: '兴趣卡在生成与解读过程中持续使用的项目记忆。',
      items: [
        { icon: '♎', title: '星座资料', desc: '十二星座日期区间、性格关键词与今日主题基线。', meta: '12 组' },
        { icon: '🃏', title: '牌意上下文', desc: '韦特牌意、正逆位解释与适合兴趣卡展示的短文案。', meta: '78 张' },
        { icon: '✨', title: '生成偏好', desc: '记录卡片语气、关键词长度、视觉风格与常用生成约束。' },
        { icon: '🕘', title: '历史生成', desc: '保留近期兴趣卡主题，减少连续日期的关键词重复。' },
      ],
    },
  },

  /* ── 这夏夯爆了 · 夏日夜食指南（marketing-h5）── */
  '夯爆了 已上线': {
    基础信息: {
      type: 'info',
      summary:
        '抖音生活服务夏季大促 H5，深夜食堂 × 小马 IP，核心玩法为「集美食卡 兑红包」：做任务抽卡，集齐 2 / 4 / 7 种兑换三档夜食券。',
      tags: ['生活服务', '夏日促销', '集卡兑奖'],
      groups: [
        {
          title: '活动信息',
          rows: [
            ['活动名称', '这夏夯爆了 · 夏日夜食指南'],
            ['活动类型', '生活服务促投稿 H5'],
            ['业务方', '抖音生活服务'],
            ['当前阶段', '第二阶段 · 夏日夜食指南'],
            ['状态', '已上线'],
          ],
        },
        {
          title: '投放',
          rows: [
            ['投放端', '抖音 / 抖音极速版'],
            ['入口', '搜索词卡片 / 活动中心 / 话题页'],
            ['活动时间', '2026-06-30 10:00 ~ 2026-08-31 23:59'],
            ['分阶段', '夏天马上顺 → 夏日夜食指南 → 待揭晓'],
          ],
        },
        {
          title: '数据目标',
          rows: [
            ['目标 UV', '800 万'],
            ['带定位投稿量', '120 万'],
            ['集卡完成率（≥2 种）', '45%'],
            ['券核销率', '18%'],
          ],
        },
      ],
    },
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      note: '以下配置与已上线生成终态一致：9 种卡、3 档奖励、12 次初始机会与 0.88 新卡倾斜；金豆仅保留视觉入口。',
      items: [
        { icon: '🎴', title: '抽夜食卡', desc: '初始 12 次机会；存在未获得卡片时，88% 概率优先抽取新卡，并进入开卡结算。', meta: '12 次 / 0.88' },
        { icon: '🍲', title: '集卡点亮', desc: '9 种夜食卡，未获得为石膏灰态，获得后点亮并累计张数。', meta: '9 种' },
        { icon: '🧧', title: '档位兑奖', desc: '集齐 2 / 4 / 7 种分别解锁 2 元券、5 元券和 43 元券包，奖励可叠加。', meta: '3 档' },
        { icon: '🤝', title: '赠送好友', desc: '同种卡持有 ≥2 张可赠送；送出后保留一张，好友领取后生效。', meta: '社交' },
        { icon: '📝', title: '任务得机会', desc: '带定位投稿 +2 次/条（日上限 5）、赠卡 +1 次（日上限 3）、每日首次浏览 +1 次。', meta: '3 类' },
        { icon: '🫘', title: '金豆入口', desc: '当前仅展示活动视觉入口，小游戏链路、次数补充与奖励兑换尚未接入。', meta: '视觉占位' },
      ],
    },
    // 「数据库」不再写死在这里 —— 夯爆了一族的表结构在 VibeCodingPage 里
    // 从当前玩法配置（卡池 / 档位 / 任务）实时推导，回放中改玩法表跟着变。
  },

  /* ── 夏日冲浪 · 顺风顺水（Marketing King / marketing-h5）── */
  '夏日冲浪 · 顺风顺水': {
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      columns: 2,
      note: '右侧活动预览和这里读取同一份夏日冲浪配置：7 种装备、4 个收集档位、5 类任务，以及主会场到奖品页的页面流转。',
      items: [
        { icon: '🌊', title: '活动主页', desc: '夏日 KV、地图顶栏、主题切换、分享/规则入口与「抽装备 一顺到底」主按钮。', meta: 'campaign-main' },
        { icon: '🎲', title: '抽装备', desc: '消耗抽装备机会随机获得 7 种装备之一；抽中后更新装备册与主视觉层。', meta: 'draw' },
        { icon: '📖', title: '顺风装备册', desc: '展示鲨鲨水枪、冰镇西瓜、顺风冲浪板等装备的收集进度，集齐后解锁奖励档位。', meta: '7 种装备' },
        { icon: '🎁', title: '奖励档位', desc: '集齐 1 / 4 / 6 / 7 种分别领取 3 元券、12 元券、23 元券和足金顺顺马抽签码。', meta: '4 档' },
        { icon: '✅', title: '任务与抽取机会', desc: '投稿、发布玩水灵感、点亮商户、赠送装备和浏览活动页，分别获得 1–2 次抽取机会。', meta: '5 类任务' },
        { icon: '🫘', title: '冲浪得金豆', desc: '任务区的副玩法入口，保留“冲浪得金豆，好礼兑不停”文案和活动视觉，可继续接入金豆系统。', meta: '副玩法' },
        { icon: '📍', title: '灵感话题与地点', desc: '承接暑期话题、清凉美食、晚霞和湖边玩水内容，以及上海动物园、世博文化公园等地点卡。', meta: '内容区' },
        { icon: '🧭', title: '页面流转', desc: 'Loading → 角色选择 → 活动主页；主页可进入我的奖品，规则以浮层打开。', meta: '5 个页面' },
      ],
    },
    [DATA_CONFIG_LABEL]: {
      type: 'database',
      tables: [
        {
          name: 'equipment_cards',
          desc: '顺风装备册的 7 种装备定义',
          columns: [
            { name: 'id', type: 'varchar(32)', desc: '装备标识' },
            { name: 'name', type: 'varchar(32)', desc: '装备名称' },
            { name: 'rarity', type: "enum('普通','稀有')", desc: '稀有度' },
            { name: 'asset_path', type: 'varchar(160)', desc: '卡面素材路径' },
            { name: 'drop_weight', type: 'decimal(4,2)', desc: '抽取权重' },
          ],
          rows: [
            ['watergun', '鲨鲨水枪', '普通', 'figma/equipment-water-gun.webp', '1.00'],
            ['watermelon', '冰镇西瓜', '普通', 'figma/equipment-watermelon-bucket.webp', '1.00'],
            ['sunhat', '遮阳幸运帽', '稀有', '待补素材态', '0.55'],
          ],
        },
        {
          name: 'reward_tiers',
          desc: '装备收集档位与奖励',
          columns: [
            { name: 'threshold', type: 'tinyint', desc: '需点亮装备数' },
            { name: 'title', type: 'varchar(64)', desc: '档位标题' },
            { name: 'reward', type: 'varchar(64)', desc: '实际奖励' },
            { name: 'kind', type: "enum('coupon','grand')", desc: '奖励类型' },
          ],
          rows: [
            ['1', '清凉开运券', '¥3 清凉开运券', 'coupon'],
            ['4', '玩水装备券', '¥12 玩水装备券', 'coupon'],
            ['6', '一顺到底券', '¥23 一顺到底券', 'coupon'],
            ['7', '足金顺顺马抽签码', '足金顺顺马抽签码', 'grand'],
          ],
        },
        {
          name: 'draw_chances',
          desc: '用户抽装备机会流水',
          columns: [
            { name: 'user_id', type: 'bigint', desc: '用户标识' },
            { name: 'source', type: 'varchar(32)', desc: '机会来源' },
            { name: 'delta', type: 'smallint', desc: '机会变化量' },
            { name: 'created_at', type: 'datetime', desc: '发生时间' },
          ],
          rows: [
            ['10001', 'post', '+2', '2026-07-18 14:32'],
            ['10001', 'store', '+1', '2026-07-18 15:06'],
            ['10001', 'draw', '-1', '2026-07-18 15:08'],
          ],
        },
        {
          name: 'user_equipment',
          desc: '用户装备册持有与点亮状态',
          columns: [
            { name: 'user_id', type: 'bigint', desc: '用户标识' },
            { name: 'card_id', type: 'varchar(32)', desc: '装备标识' },
            { name: 'owned_count', type: 'tinyint', desc: '持有数量' },
            { name: 'first_received_at', type: 'datetime', desc: '首次获得时间' },
          ],
          rows: [
            ['10001', 'watergun', '1', '2026-07-18 15:08'],
            ['10001', 'surfboard', '2', '2026-07-18 15:10'],
          ],
        },
        {
          name: 'gold_points',
          desc: '冲浪得金豆副玩法余额与来源',
          columns: [
            { name: 'user_id', type: 'bigint', desc: '用户标识' },
            { name: 'balance', type: 'int', desc: '当前金豆余额' },
            { name: 'source', type: 'varchar(32)', desc: '获得来源' },
            { name: 'updated_at', type: 'datetime', desc: '更新时间' },
          ],
          rows: [
            ['10001', '260', '冲浪任务', '2026-07-18 15:06'],
            ['10002', '500', '首次参与', '2026-07-18 12:20'],
          ],
        },
      ],
    },
  },

  /* ── 抖音 ACG 游戏新春会（marketing-h5）── */
  '抖音 ACG 游戏新春会': {
    基础信息: {
      type: 'info',
      summary: '聚合热门游戏与高燃创作的抖音 ACG 新春活动 H5，主打视频会场、内容榜单与助力互动。',
      tags: ['游戏营销', 'ACG', '新春会'],
      groups: [
        {
          title: '活动信息',
          rows: [
            ['活动名称', '抖音 ACG 游戏新春会'],
            ['活动类型', '游戏内容营销 H5'],
            ['关联品牌', '抖音游戏'],
            ['状态', '待发布'],
          ],
        },
        {
          title: '投放',
          rows: [
            ['投放端', '抖音'],
            ['场景', '非直播 / 直播'],
            ['活动时间', '2026-02-01 ~ 2026-02-24'],
          ],
        },
        {
          title: '数据目标',
          rows: [
            ['目标 UV', '300 万'],
            ['目标互动率', '22%'],
            ['视频播放量', '1,000 万'],
          ],
        },
      ],
    },
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      note: '新春会主会场的内容分发与互动玩法。',
      items: [
        { icon: '🎮', title: '游戏会场', desc: '按地下城与勇士、蛋仔派对、王者荣耀等游戏切换专题内容。', meta: '多游戏' },
        { icon: '▶️', title: '主会场视频', desc: '承载新春特别节目与游戏厂商高燃内容，支持播放和静音控制。', meta: '视频' },
        { icon: '🔥', title: '开年高燃', desc: '以马力值聚合热门作品，展示创作者、封面和实时互动热度。', meta: '内容榜单' },
        { icon: '🐴', title: '加马互动', desc: '用户可选择「放你一马」或「好活加马」为喜欢的作品助力。', meta: '轻互动' },
      ],
    },
    [DATA_CONFIG_LABEL]: {
      type: 'database',
      tables: [
        {
          name: 'event_games',
          desc: '新春会游戏会场配置',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'game_name', type: 'varchar(64)', desc: '游戏名称' },
            { name: 'cover_url', type: 'varchar(128)', desc: '会场封面' },
            { name: 'sort_order', type: 'int', desc: '展示顺序' },
          ],
          rows: [
            ['1', '地下城与勇士', '/assets/dnf.png', '1'],
            ['2', '蛋仔派对', '/assets/egg-party.png', '2'],
          ],
        },
        {
          name: 'boost_records',
          desc: '开年高燃作品助力记录',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'content_id', type: 'bigint', desc: '作品' },
            { name: 'action', type: "enum('free','boost')", desc: '助力类型' },
            { name: 'created_at', type: 'datetime', desc: '操作时间' },
          ],
        },
      ],
    },
  },

  /* ── 抖音 AI 工坊设计探索（web-app）── */
  '抖音 AI 工坊设计探索': {
    基础信息: {
      type: 'info',
      summary: '智能体广场设计探索站点 —— React + Vite 前端，自适应布局。',
      tags: ['前端站点', 'React', 'Vite'],
      groups: [
        {
          title: '站点信息',
          rows: [
            ['名称', '抖音 AI 工坊设计探索'],
            ['类型', 'React + Vite 前端站点'],
            ['部署', 'Vercel'],
            ['状态', '已发布'],
          ],
        },
        {
          title: '技术栈',
          rows: [
            ['框架', 'React 18'],
            ['构建', 'Vite'],
            ['样式', 'Tailwind CSS'],
            ['组件', 'shadcn/ui'],
          ],
        },
        {
          title: '页面',
          rows: [
            ['页面数', '4（首页 / 作品 / 关于 / 联系）'],
            ['自适应', '是（容器查询）'],
          ],
        },
      ],
    },
    [DATA_CONFIG_LABEL]: {
      type: 'database',
      tables: [
        {
          name: 'agents',
          desc: '广场展示的智能体',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'slug', type: 'varchar(64)', desc: '路由标识' },
            { name: 'title', type: 'varchar(64)', desc: '名称' },
            { name: 'author', type: 'varchar(32)', desc: '作者' },
            { name: 'category', type: 'varchar(16)', desc: '分类' },
            { name: 'uses', type: 'int', desc: '使用量' },
          ],
          rows: [
            ['1', 'luo-yonghao', '罗永浩', '李英杰', '数字员工', '2600'],
            ['2', 'lazy-goat', '懒羊羊', '梁媛媛', '角色互动', '3300'],
          ],
        },
        {
          name: 'favorites',
          desc: '用户收藏',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'user_id', type: 'bigint', desc: '用户' },
            { name: 'agent_id', type: 'bigint', desc: '智能体' },
            { name: 'created_at', type: 'datetime', desc: '收藏时间' },
          ],
        },
      ],
    },
  },

  /* ── 射击小游戏（web-game）── */
  '射击小游戏': {
    基础信息: {
      type: 'info',
      summary: '竖版弹幕射击 + Roguelike 的网页小游戏，自研 Canvas 引擎。',
      tags: ['网页游戏', '弹幕射击', 'Roguelike'],
      groups: [
        {
          title: '游戏信息',
          rows: [
            ['名称', '射击小游戏'],
            ['类型', '竖版弹幕射击 + Roguelike'],
            ['引擎', '自研 Canvas（garuda.js）'],
            ['状态', '开发中'],
          ],
        },
        {
          title: '运行',
          rows: [
            ['平台', '抖音小游戏 / H5'],
            ['分辨率', '720 × 1280'],
            ['帧率', '60 fps'],
            ['操作', '触控拖动飞机，自动开火'],
          ],
        },
        {
          title: '版本',
          rows: [
            ['当前版本', 'v0.4.0'],
            ['关卡数', '12'],
            ['武器数', '8'],
          ],
        },
      ],
    },
    开始界面: {
      type: 'info',
      summary: '玩家进入游戏的第一屏：展示标题、最高分与开始入口。',
      tags: ['场景', '入口'],
      groups: [
        {
          title: '界面元素',
          rows: [
            ['主标题', '游戏 LOGO 与副标题'],
            ['开始按钮', '点击进入对局'],
            ['最高分', '展示历史最佳成绩'],
            ['设置入口', '音效 / 操作说明'],
          ],
        },
        {
          title: '交互',
          rows: [
            ['开始游戏', '点击「开始」→ 进入游戏进行中'],
            ['查看排行', '点击榜单图标 → 排行榜'],
          ],
        },
      ],
    },
    游戏进行中: {
      type: 'info',
      summary: '核心对局画面：操控飞机躲弹幕、击毁敌机、拾取增益。',
      tags: ['场景', '核心'],
      groups: [
        {
          title: 'HUD',
          rows: [
            ['得分', '实时累计本局得分'],
            ['波次', '当前关卡 / 波次进度'],
            ['血量 / 护盾', '剩余生命与护盾状态'],
          ],
        },
        {
          title: '操作',
          rows: [
            ['移动', '触控拖动飞机'],
            ['开火', '自动持续开火'],
            ['炸弹', '点击释放清屏炸弹'],
          ],
        },
        {
          title: '元素',
          rows: [
            ['敌机波次', '12 关递增阵型与弹幕'],
            ['增益掉落', '每波三选一 Roguelike 增益'],
            ['Boss 战', '每 4 关一个多阶段 Boss'],
          ],
        },
      ],
    },
    结算界面: {
      type: 'info',
      summary: '单局结束后的结算页：展示成绩并引导再来一局。',
      tags: ['场景', '结算'],
      groups: [
        {
          title: '本局数据',
          rows: [
            ['本局得分', '累计击毁与拾取得分'],
            ['到达波次', '最远通关波次'],
            ['存活时长', '本局存活秒数'],
            ['获得金币', '可用于商店解锁'],
          ],
        },
        {
          title: '操作',
          rows: [
            ['再来一局', '重开新对局'],
            ['返回首页', '回到开始界面'],
            ['分享成绩', '生成战绩卡片分享'],
          ],
        },
      ],
    },
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      note: '核心玩法与系统设计。',
      items: [
        { icon: '🔁', title: '核心循环', desc: '躲弹幕 → 击毁敌机 → 拾取增益 → 挑战 Boss → 进入下一波。' },
        { icon: '🔫', title: '武器系统', desc: '8 种主武器（散射 / 激光 / 追踪等），可叠加升级。', meta: '8 种' },
        { icon: '👾', title: '敌人波次', desc: '12 关，每关递增的敌机阵型与弹幕模式。', meta: '12 关' },
        { icon: '🎲', title: 'Roguelike 增益', desc: '每波随机三选一增益，构筑差异化流派。' },
        { icon: '🐉', title: 'Boss 战', desc: '每 4 关一个 Boss，多阶段弹幕与弱点机制。' },
        { icon: '💎', title: '道具掉落', desc: '护盾 / 炸弹 / 金币，限时拾取。' },
      ],
    },
    [DATA_CONFIG_LABEL]: {
      type: 'database',
      tables: [
        {
          name: 'players',
          desc: '玩家',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'openid', type: 'varchar(64)', desc: '抖音 openid' },
            { name: 'nickname', type: 'varchar(32)', desc: '昵称' },
            { name: 'best_score', type: 'int', desc: '历史最高分' },
            { name: 'total_runs', type: 'int', desc: '总局数' },
          ],
        },
        {
          name: 'scores',
          desc: '对局得分',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'player_id', type: 'bigint', desc: '玩家' },
            { name: 'score', type: 'int', desc: '本局得分' },
            { name: 'wave', type: 'int', desc: '到达波次' },
            { name: 'duration_sec', type: 'int', desc: '存活时长（秒）' },
          ],
          rows: [
            ['1', '1001', '128450', '12', '614'],
            ['2', '1002', '96320', '9', '472'],
          ],
        },
        {
          name: 'items',
          desc: '道具 / 增益',
          columns: [
            { name: 'id', type: 'int', desc: '主键' },
            { name: 'name', type: 'varchar(32)', desc: '名称' },
            { name: 'type', type: "enum('weapon','buff','consumable')", desc: '类型' },
            { name: 'rarity', type: "enum('N','R','SR','SSR')", desc: '稀有度' },
          ],
        },
      ],
    },
  },
}

/* ─────────────────────────── 渲染 ─────────────────────────── */

const OBJECT_LABEL_ALIASES: Record<string, string> = {
  [DATABASE_LABEL]: DATA_CONFIG_LABEL,
  [H5_GAMEPLAY_CONFIG_LABEL]: GAMEPLAY_CONFIG_LABEL,
  [GAME_GAMEPLAY_CONFIG_LABEL]: GAMEPLAY_CONFIG_LABEL,
  [INTEREST_CARD_CONFIG_LABEL]: DATA_CONFIG_LABEL,
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[860px] flex-col px-8 py-7">{children}</div>
    </div>
  )
}

function InfoView({ c }: { c: InfoContent }) {
  return (
    <Shell>
      {c.tags && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {c.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[var(--fill-subtle)] px-2.5 py-0.5 text-[11.5px] text-[var(--color-ink)]/65"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {c.summary && (
        <p className="mb-6 text-[13px] leading-[1.7] text-[var(--color-ink)]/60">{c.summary}</p>
      )}
      <div className="flex flex-col gap-6">
        {c.groups.map((g) => (
          <div key={g.title}>
            <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink)]/40">
              {g.title}
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)]">
              {g.rows.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex items-center gap-4 px-4 py-2.5 text-[13px] ${
                    i > 0 ? 'border-t border-[var(--divider-soft)]' : ''
                  }`}
                >
                  <span className="w-24 shrink-0 text-[var(--color-ink)]/45">{k}</span>
                  <span className="min-w-0 flex-1 text-[var(--color-ink)]/85">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

export function DatabaseView({ c }: { c: DbContent }) {
  return (
    <Shell>
      <div className="flex flex-col gap-7">
        {c.tables.map((t) => (
          <div key={t.name}>
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-mono text-[14px] font-semibold text-[var(--color-ink)]">{t.name}</span>
              <span className="text-[12px] text-[var(--color-ink)]/45">{t.desc}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)]">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-[var(--fill-subtle)] text-[var(--color-ink)]/55">
                    <th className="px-3 py-2 font-medium">字段</th>
                    <th className="px-3 py-2 font-medium">类型</th>
                    <th className="px-3 py-2 font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {t.columns.map((col, i) => (
                    <tr key={col.name} className={i > 0 ? 'border-t border-[var(--divider-soft)]' : ''}>
                      <td className="px-3 py-1.5 font-mono text-[var(--color-ink)]/85">{col.name}</td>
                      <td className="px-3 py-1.5 font-mono text-[var(--color-ink)]/55">{col.type}</td>
                      <td className="px-3 py-1.5 text-[var(--color-ink)]/65">{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {t.rows && t.rows.length > 0 && (
              <div className="mt-2 overflow-x-auto">
                <div className="mb-1 text-[11px] text-[var(--color-ink)]/40">示例数据</div>
                <table className="min-w-full text-left text-[12px]">
                  <tbody>
                    {t.rows.map((row, ri) => (
                      <tr key={ri} className={ri > 0 ? 'border-t border-[var(--divider-soft)]' : ''}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="whitespace-nowrap px-3 py-1.5 text-[var(--color-ink)]/70">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </Shell>
  )
}

function CardsView({ c }: { c: CardsContent }) {
  const cols = c.columns ?? 2
  return (
    <Shell>
      {c.note && <p className="mb-4 text-[13px] text-[var(--color-ink)]/55">{c.note}</p>}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {c.items.map((it) => (
          <div
            key={it.title}
            className="flex gap-3 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-3.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fill-subtle)] text-[18px]">
              {it.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[13.5px] font-medium text-[var(--color-ink)]">{it.title}</span>
                {it.meta && (
                  <span className="shrink-0 rounded-full bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10.5px] text-[var(--color-ink)]/55">
                    {it.meta}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[12px] leading-[1.55] text-[var(--color-ink)]/55">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/** Render a project's object content, or null when there's no tailored mock
 *  (caller then falls back to the doc / code views). `kind` is accepted for
 *  future per-kind defaults but content is currently keyed by project. */
export function ProjectObjectView({
  projectTitle,
  label,
}: {
  projectTitle: string
  kind: ProjectKind
  label: string
}): ReactNode | null {
  const normalizedLabel = OBJECT_LABEL_ALIASES[label] ?? label
  const c = CONTENT[projectTitle]?.[normalizedLabel]
  if (!c) return null
  switch (c.type) {
    case 'info':
      return <InfoView c={c} />
    case 'database':
      return <DatabaseView c={c} />
    case 'cards':
      return <CardsView c={c} />
    default:
      return null
  }
}
