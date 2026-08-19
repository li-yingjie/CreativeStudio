import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { RotateCcw, Save } from '@/shared/icons'
import {
  DATA_CONFIG_LABEL,
  DATABASE_LABEL,
  GAME_GAMEPLAY_CONFIG_LABEL,
  GAMEPLAY_CONFIG_LABEL,
  INTEREST_CARD_CONFIG_LABEL,
  PROJECT_MEMORY_LABEL,
  type ProjectKind,
} from './ProjectProductView'
import { QIXI_BRIDGE_PROJECT } from './QixiBridgeData'
import { ACG_REPLICA_PROJECT } from './AcgReplicaData'

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
  visuals?: { src: string; label: string; detail: string }[]
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

  /* ── ACG 新春会 · 一比一复刻（切片装配 + 交互热区）── */
  [ACG_REPLICA_PROJECT]: {
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      columns: 2,
      note: '页面画面来自设计稿原始分辨率切片；下列交互全部为切片之上的前端热区，本地状态，不接后端。',
      items: [
        { icon: '🗳️', title: '抓马投票', desc: '抓马榜 TOP3 与赛场 5 张作品卡均可投票：好活加马 +3 马力、放你一马 -1 马力，点击有浮标反馈。', meta: '8 张卡 × 2 键' },
        { icon: '⭐', title: '任务关注', desc: '做任务领抽奖机会共 6 项，点击去关注切换为已关注态并提示获得抽奖机会。', meta: '6 项任务' },
        { icon: '🎰', title: '点击抽奖', desc: '扭蛋机主按钮触发抽奖演示反馈；查看奖池信息与我的奖品为独立热区。', meta: '演示态' },
        { icon: '🌠', title: '许愿互动', desc: '许愿卡去点赞、我也要许愿、预约春晚直播均有反馈；倒计时数字为切片内容。', meta: '4 类操作' },
        { icon: '🧭', title: '导航与入口', desc: '返回 / 分享 / 规则、档期轴切换、双会场入口、榜单入口与页脚搜索都可点击。', meta: '10+ 热区' },
        { icon: '📐', title: '坐标系', desc: '全部热区按设计稿 750 宽像素定义，渲染时折半到 375 显示宽度，与切片逐像素对齐。', meta: '750 → 375' },
      ],
    },
  },

  /* ── 七夕搭鹊桥 · 找喜鹊（交互框架阶段）── */
  [QIXI_BRIDGE_PROJECT]: {
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      columns: 2,
      note: '当前配置只服务于前端灰模验证：主链路可完整点击，数据均为本地状态，不接后端接口。',
      items: [
        { icon: '🌉', title: '七关搭桥进度', desc: '7 个关卡复用同一套找喜鹊模板，目标数依次为 5 / 6 / 6 / 7 / 7 / 8 / 8。', meta: '7 关' },
        { icon: '⏱️', title: '限时找喜鹊', desc: '每关默认 90 秒，点击场景内喜鹊累计进度；误点提供反馈，倒计时结束进入失败态。', meta: '90 秒 / 关' },
        { icon: '🎟️', title: '阶段奖励', desc: '完成第 3、7 关分别解锁消费券；每次通关同步增加 1 次抽奖机会。', meta: '2 个券节点' },
        { icon: '✅', title: '签到得机会', desc: '每日签到增加 2 次闯关机会；重复签到显示已完成反馈。', meta: '+2 次' },
        { icon: '🤝', title: '好友助力', desc: '发起邀请并模拟好友回流，单个好友增加 2 次机会，每日最多 10 人。', meta: '2 次 / 人' },
        { icon: '🎁', title: '通关抽奖', desc: '消耗通关获得的抽奖次数，展示中奖与未中奖结果，并同步我的奖品。', meta: '本地状态' },
        { icon: '🧾', title: '活动明细', desc: '闯关、签到、助力和抽奖行为进入统一记录，首页进度与余额同步。', meta: '状态联动' },
        { icon: '🛡️', title: '边际状态', desc: '提供加载中、网络异常、活动结束、风控兜底和主动退出二次确认。', meta: '5 类状态' },
      ],
    },
  },

  /* ── 2026 抖音 ACG 新春会（marketing-h5）── */
  '2026 抖音 ACG 新春会': {
    基础信息: {
      type: 'info',
      summary: '以游戏/二次元双会场组织内容榜单与助力互动，并覆盖 H5 分会场、站内资源位、节目单和结算战报。',
      tags: ['节点大会场', '双会场', 'ACG', '多端交付'],
      visuals: [
        { src: '/assets/acg-new-year/exact-hero-base.png', label: '游戏会场主视觉', detail: 'Lynx 主会场 Hero · Figma 已锁定' },
        { src: '/assets/acg-new-year/materials/01-activity-hero.png', label: '横向资源位', detail: '游戏新春会 · 1600×1035' },
        { src: '/assets/acg-new-year/exact-game-switcher.png', label: '双会场切换组件', detail: '游戏 / 二次元状态组件' },
        { src: '/assets/acg-new-year/exact-lower-top.png', label: '榜单与助力模块', detail: '开年高燃 · 内容组件' },
      ],
      groups: [
        {
          title: '活动信息',
          rows: [
            ['活动名称', '2026 抖音 ACG 新春会'],
            ['活动模板', '新春会模板 v1.1.0'],
            ['主 Brand Kit', '抖音 ACG 新春会应用版 v1.1.0'],
            ['Style Bible', '新春热力 · ACG v1.0.0'],
            ['状态', '交付完善中'],
          ],
        },
        {
          title: '投放',
          rows: [
            ['投放端', '抖音'],
            ['交付端', 'H5 / 站内资源位 / 图片'],
            ['活动时间', '2026-01-09 ~ 2026-02-28 · Banner 证据'],
          ],
        },
        {
          title: '交付范围',
          rows: [
            ['页面', '2 个 H5 内容路由'],
            ['状态', '分会场 5 个展示状态'],
            ['传播物料', '资源位 / 节目单 / 宣发图 / 战报'],
          ],
        },
      ],
    },
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      note: '这里只配置挂载在活动主流程上的玩法组件实例。入口、分流、参与、回流与结算顺序，请在「项目文档 · 活动主流程」查看。',
      items: [
        { icon: '🔥', title: '内容榜单', desc: '游戏与二次元内容池分别计算热门/新锐榜单，并提供空态、延迟和封禁降级。', meta: '必填槽位' },
        { icon: '🐴', title: '双动作助力', desc: '用户通过「放你一马 / 好活加马」为作品助力，行为与榜单口径实时关联。', meta: '已启用' },
        { icon: '🃏', title: '集卡', desc: '提供大卡、小卡、任务卡与玩法主页视觉；卡池、任务和奖励仍由玩法包配置。', meta: '可选槽位' },
        { icon: '🎮', title: '跃马攀峰', desc: '轻量场景玩法，以 166×166 入口小卡和多状态主页接入主会场。', meta: '可选槽位' },
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

  /* ── 2026 抖音春晚（marketing-h5）── */
  '2026 抖音春晚': {
    基础信息: {
      type: 'info',
      summary: '节目盛典型全渠道活动，以 Lynx 主会场为核心，同时组织原生话题入口、H5 抽奖与祝福卡、开屏、直播 Tab 和线下屏延展。',
      tags: ['节目盛典', '直播', '抽奖', '全渠道交付'],
      visuals: [
        { src: '/assets/spring-gala/lynx-main.webp', label: 'Lynx 春晚主会场', detail: '750 × 4696 · 直播、节目单、抽奖与投稿' },
        { src: '/assets/spring-gala/h5-lottery.webp', label: 'H5 抽奖', detail: '奖品池、次数与结果承接' },
        { src: '/assets/spring-gala/blessing-card.webp', label: '祝福分享卡', detail: '祝福结果、分享与继续抽奖' },
        { src: '/assets/spring-gala/business-poster.webp', label: '商业中心横版海报', detail: '横版大屏独立构图' },
      ],
      groups: [
        {
          title: '活动信息',
          rows: [
            ['活动名称', '2026 抖音春晚'],
            ['活动母型', '全渠道节目盛典'],
            ['核心 Surface', 'Lynx 春晚主会场'],
            ['来源状态', '真实案例已关联 · 项目资产化中'],
          ],
        },
        {
          title: '交付矩阵',
          rows: [
            ['站内页面', '原生话题页 / Lynx / H5 抽奖 / H5 祝福卡'],
            ['站内资源位', '开屏 / 直播间 Tab'],
            ['线下与内宣', '行政电子竖屏 / 商业中心横版海报'],
            ['Figma 延展', '会议室广告 / 海报 / 易拉宝 / 艺术装置屏'],
          ],
        },
      ],
    },
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      note: '分别维护直播状态、奖池与次数、祝福卡和节目单参数。',
      items: [
        { icon: '📺', title: '直播承接', desc: '主会场首屏展示直播状态、直播画面与节目单入口；未开播、直播中和结束态分别配置。', meta: '主流程节点' },
        { icon: '🎁', title: '任务抽奖', desc: '展示奖品池、剩余次数与中奖播报，抽取结果进入统一履约记录。', meta: 'H5 组件' },
        { icon: '🧧', title: '祝福结果卡', desc: '依据抽奖结果生成祝福视觉，提供分享与继续抽奖动作。', meta: '结果组件' },
        { icon: '🗓️', title: '节目单', desc: '节目名称、时间与直播状态由内容表驱动，主会场和资源位读取同一来源。', meta: '内容组件' },
      ],
    },
  },

  /* ── 《永夜星河》独星河小卡（marketing-h5）── */
  '《永夜星河》独星河小卡': {
    基础信息: {
      type: 'info',
      summary: '影视 IP 宣发型任务抽卡活动，使用站内行为任务换取抽卡次数，以 7 张独占卡图鉴和个性化分享卡形成传播回流。',
      tags: ['影视宣发', '任务抽卡', '卡牌图鉴', '分享回流'],
      visuals: [
        { src: '/assets/evernight/main-venue.webp', label: '抽卡主会场', detail: '750 × 3652 · Figma 主组件' },
        { src: '/assets/evernight/card-collection.webp', label: '7 卡图鉴', detail: '已收集、锁定与重复持有状态' },
        { src: '/assets/evernight/share-card.webp', label: '个性化分享卡', detail: '卡面、To 文案、保存与分享' },
      ],
      groups: [
        {
          title: '活动信息',
          rows: [
            ['活动名称', '《永夜星河》独星河小卡'],
            ['活动母型', '影视 IP · 任务抽卡'],
            ['卡池规模', '7 张抖音独占卡'],
            ['设计规模', '181 个 Figma 画框'],
          ],
        },
        {
          title: '页面与状态',
          rows: [
            ['主页面', 'Lynx 抽卡主会场 · 750 × 3652'],
            ['抽取动作', '单次抽卡 / 十次连抽'],
            ['图鉴状态', '已获得 / 未解锁 / 重复持有'],
            ['分享结果', '卡面选择 / To 文案 / 保存 / 去分享'],
          ],
        },
      ],
    },
    [GAMEPLAY_CONFIG_LABEL]: {
      type: 'cards',
      note: '任务、次数账本、抽卡策略、卡池与分享结果是五个可独立演进的对象；页面只编排它们，不保存另一份重复配置。',
      items: [
        { icon: '✅', title: '任务得次数', desc: '签到、想看、关注、观看、点赞、角色投票与相关页面浏览统一发放抽卡次数。', meta: '多任务源' },
        { icon: '🎟️', title: '次数账本', desc: '所有获得与消耗写入同一流水，单抽扣 1 次，十连扣 10 次，并处理并发与幂等。', meta: '统一口径' },
        { icon: '🎴', title: '独占卡池', desc: '7 张卡分别配置权重、保底参与、重复补偿和上下架状态；演员卡面是项目 IP 实例。', meta: '7 张' },
        { icon: '📚', title: '图鉴收集', desc: '展示收集进度、重复持有数量和锁定槽位，并为分享卡提供已获得卡面。', meta: '3 类状态' },
        { icon: '💌', title: '个性化分享', desc: '选择已获得卡面、填写最多 6 个字的 To 文案，生成保存与站内分享结果。', meta: '回流节点' },
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
      {c.visuals?.length ? (
        <section className="mb-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">项目视觉与交付快照</h2>
              <p className="mt-1 text-[10px] text-[var(--color-ink)]/38">真实 Figma 交付切片 · 按项目对象归档</p>
            </div>
            <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700">{c.visuals.length} 项已关联</span>
          </div>
          <div className="grid h-[286px] grid-cols-[1.55fr_0.95fr] grid-rows-3 gap-2 overflow-hidden rounded-2xl border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-2">
            {c.visuals.slice(0, 4).map((visual, index) => (
              <figure key={visual.src} className={`${index === 0 ? 'row-span-3' : ''} group relative min-h-0 overflow-hidden rounded-xl bg-white`}>
                <img src={visual.src} alt={visual.label} className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.015]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-black/5" />
                <figcaption className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-5 text-white">
                  <p className={`${index === 0 ? 'text-[12px]' : 'text-[9px]'} font-medium`}>{visual.label}</p>
                  <p className={`${index === 0 ? 'mt-1 text-[9px]' : 'mt-0.5 text-[7px]'} text-white/68`}>{visual.detail}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
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

type GameplayDraft = Record<
  string,
  { enabled: boolean; description: string; parameter: string }
>

function gameplayDefaults(c: CardsContent): GameplayDraft {
  return Object.fromEntries(
    c.items.map((item) => [
      item.title,
      {
        enabled: true,
        description: item.desc,
        parameter: item.meta ?? '',
      },
    ]),
  )
}

function GameplayCardsEditor({
  c,
  projectTitle,
}: {
  c: CardsContent
  projectTitle: string
}) {
  const storageKey = `creative-studio:gameplay-config:${projectTitle}`
  const [initial] = useState<GameplayDraft>(() => {
    const defaults = gameplayDefaults(c)
    if (typeof window === 'undefined') return defaults
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null') as
        | GameplayDraft
        | null
      if (!saved) return defaults
      const valid = c.items.every((item) => {
        const entry = saved[item.title]
        return (
          entry &&
          typeof entry.enabled === 'boolean' &&
          typeof entry.description === 'string' &&
          typeof entry.parameter === 'string'
        )
      })
      return valid ? saved : defaults
    } catch {
      return defaults
    }
  })
  const [saved, setSaved] = useState<GameplayDraft>(initial)
  const [draft, setDraft] = useState<GameplayDraft>(initial)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const enabledCount = c.items.filter((item) => draft[item.title]?.enabled).length

  const update = (
    title: string,
    patch: Partial<GameplayDraft[string]>,
  ) => {
    setDraft((current) => ({
      ...current,
      [title]: { ...current[title], ...patch },
    }))
  }

  const save = () => {
    if (!enabledCount) {
      toast.error('至少保留一个启用的玩法实例')
      return
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft))
      setSaved(draft)
      toast.success('玩法配置已保存', {
        description: `${enabledCount} 个实例已启用。`,
      })
    } catch {
      toast.error('浏览器存储不可用，修改仍保留在当前会话')
    }
  }

  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b border-[var(--divider-soft)] bg-white/95 px-5 backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[var(--color-ink)]">玩法实例</p>
          <p className="mt-0.5 text-[8px] text-[var(--color-ink)]/38">{enabledCount} / {c.items.length} 已启用{dirty ? ' · 有未保存修改' : ' · 已保存'}</p>
        </div>
        <button
          type="button"
          onClick={() => setDraft(gameplayDefaults(c))}
          className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[8px] text-[var(--color-ink)]/52 hover:bg-[var(--fill-subtle)]"
        >
          <RotateCcw className="size-3" />恢复默认
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!dirty}
          className="flex h-7 items-center gap-1.5 rounded-lg bg-[var(--color-ink)] px-3 text-[8px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Save className="size-3" />保存玩法配置
        </button>
      </header>
      <div className="mx-auto flex w-full max-w-[900px] flex-col px-8 py-7">
        {c.note ? <p className="mb-4 text-[12px] leading-[1.65] text-[var(--color-ink)]/52">{c.note}</p> : null}
        <div className="grid grid-cols-2 gap-3">
          {c.items.map((item) => {
            const entry = draft[item.title]
            return (
              <section
                key={item.title}
                className={`rounded-xl border p-3.5 transition-colors ${entry.enabled ? 'border-[var(--divider-soft)] bg-white' : 'border-transparent bg-[var(--fill-subtle)] opacity-65'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--fill-subtle)] text-[18px]">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">{item.title}</p>
                    <p className="mt-0.5 text-[8px] text-[var(--color-ink)]/36">项目级玩法实例</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={entry.enabled}
                    aria-label={`${entry.enabled ? '停用' : '启用'}${item.title}`}
                    onClick={() => update(item.title, { enabled: !entry.enabled })}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${entry.enabled ? 'bg-[#3370FF]' : 'bg-black/15'}`}
                  >
                    <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${entry.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <label className="mt-3 block">
                  <span className="text-[8px] font-medium text-[var(--color-ink)]/45">规则说明</span>
                  <textarea
                    value={entry.description}
                    disabled={!entry.enabled}
                    onChange={(event) => update(item.title, { description: event.target.value })}
                    rows={3}
                    className="mt-1.5 w-full resize-none rounded-lg border border-black/[0.08] bg-white px-2.5 py-2 text-[9px] leading-[14px] text-[var(--color-ink)] outline-none focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10 disabled:bg-transparent"
                  />
                </label>
                <label className="mt-2.5 block">
                  <span className="text-[8px] font-medium text-[var(--color-ink)]/45">实例参数</span>
                  <input
                    value={entry.parameter}
                    disabled={!entry.enabled}
                    onChange={(event) => update(item.title, { parameter: event.target.value })}
                    placeholder="例如：直播中 / 每日 3 次 / 7 张卡"
                    className="mt-1.5 h-8 w-full rounded-lg border border-black/[0.08] bg-white px-2.5 text-[9px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/22 focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10 disabled:bg-transparent"
                  />
                </label>
              </section>
            )
          })}
        </div>
        <p className="mt-4 rounded-lg bg-[var(--fill-subtle)] px-3 py-2.5 text-[8px] leading-[14px] text-[var(--color-ink)]/38">这里维护项目级玩法参数；页面内是否展示某个模块，继续由对应页面编辑器控制。</p>
      </div>
    </div>
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
      return normalizedLabel === GAMEPLAY_CONFIG_LABEL ? (
        <GameplayCardsEditor key={projectTitle} c={c} projectTitle={projectTitle} />
      ) : (
        <CardsView c={c} />
      )
    default:
      return null
  }
}
