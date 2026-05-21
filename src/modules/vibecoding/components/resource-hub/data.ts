// 资源库 (Resource Hub) — mock data for the rebuilt 5-tab library.
// All content is demo/脑补; no real backend. Banners use CSS gradients (no
// image assets) to keep the build light.

export type HubTab = 'tools' | 'knowledge' | 'models' | 'publishers' | 'triggers'

export const HUB_TABS: { id: HubTab; label: string }[] = [
  { id: 'tools', label: '工具箱' },
  { id: 'knowledge', label: '知识库' },
  { id: 'models', label: '模型库' },
  { id: 'publishers', label: '发布器' },
  { id: 'triggers', label: '触发器' },
]

/** Reusable gradient palette for card banners (no images). */
export const GRADIENTS = [
  'linear-gradient(135deg,#e8f0ff,#bcd3ff)',
  'linear-gradient(135deg,#dbeafe,#a5c8ff)',
  'linear-gradient(135deg,#ede9fe,#c4b5fd)',
  'linear-gradient(135deg,#ffe9ec,#ffc2cf)',
  'linear-gradient(135deg,#e0f7f4,#a8e6dd)',
  'linear-gradient(135deg,#fff1d6,#ffd98a)',
  'linear-gradient(135deg,#e7eefc,#b9c8ef)',
  'linear-gradient(135deg,#f2e8ff,#d6b8ff)',
]
export const gradientFor = (i: number) => GRADIENTS[i % GRADIENTS.length]

/* ─────────────────────── 工具箱 ─────────────────────── */

export const TOOL_CATEGORIES = [
  '全部', '抖音搜索', '视频内容', '系统工具', '热点运营', '内容生成', '图片处理',
] as const
export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export interface ToolItem {
  id: string
  name: string
  desc: string
  category: Exclude<ToolCategory, '全部'>
  /** Preview image shown on the card banner. */
  image: string
  source: string
  date: string
  usage: string
}

const TOOL_IMG = '/assets/resource-hub/tools'

// A curated slice of the 工具广场 (real platform tools); banners are preview
// screenshots exported from the design and downscaled into TOOL_IMG.
export const TOOLS: ToolItem[] = [
  { id: 't-datetime', name: '日期和时间', desc: '可获取当前时间信息或通过给定的时间点范围查询详细的日历数据以及进行阳历农历的转换', category: '系统工具', image: `${TOOL_IMG}/datetime.webp`, source: '抖音官方', date: '4-1', usage: '12K' },
  { id: 't-video-search', name: '抖音视频搜索', desc: '基于输入的关键词，获取相关的抖音视频内容结果', category: '抖音搜索', image: `${TOOL_IMG}/video-search.webp`, source: '抖音官方', date: '4-28', usage: '2K' },
  { id: 't-text2img', name: '文生图片', desc: '输入一段文本描述，实现文本到图片的生成（豆包seed模型提供服务）', category: '内容生成', image: `${TOOL_IMG}/text2img.webp`, source: '抖音官方', date: '2025-11-12', usage: '2K' },
  { id: 't-video-info', name: '获取视频信息', desc: '根据视频ID，获取视频标题、视频ASR、视频内容描述、视频抽帧描述信息', category: '视频内容', image: `${TOOL_IMG}/video-info.webp`, source: '抖音官方', date: '5-7', usage: '1K' },
  { id: 't-img-understand', name: '图片内容理解', desc: '根据用户上传的图片内容进行分析和理解', category: '图片处理', image: `${TOOL_IMG}/img-understand.webp`, source: '抖音官方', date: '11:09', usage: '1K' },
  { id: 't-img-edit', name: '文字+图片生图', desc: '支持用户通过提示词对已有的图片进行修改，并生成新的图片', category: '图片处理', image: `${TOOL_IMG}/img-edit.webp`, source: '抖音官方', date: '2025-11-12', usage: '1K' },
  { id: 't-multi-img', name: '文生多图', desc: '可以自主配置生成数量利用文本生成多张新图（豆包seed4.0模型提供服务）', category: '内容生成', image: `${TOOL_IMG}/multi-img.webp`, source: '抖音官方', date: '11:56', usage: '1K' },
  { id: 't-hot-board', name: '抖音热点榜', desc: '获取当前的实时抖音热点榜内容', category: '热点运营', image: `${TOOL_IMG}/hot-board.webp`, source: '抖音官方', date: '11:05', usage: '1K' },
]

/* ─────────────────────── 知识库 ─────────────────────── */

export const KNOWLEDGE_FILTERS = ['全部', '数据知识库', '结构化知识库'] as const
export type KnowledgeFilter = (typeof KNOWLEDGE_FILTERS)[number]

export interface KnowledgeBase {
  id: string
  name: string
  desc: string
  kind: Exclude<KnowledgeFilter, '全部'>
  count: string
  /** Photo banner + the small rounded glyph rendered centered on it. */
  image: string
  icon: string
}

const KB_IMG = '/assets/resource-hub/knowledge'

// A curated slice of the 标准知识库; banners + glyphs are exported from the
// design and downscaled into KB_IMG.
export const KNOWLEDGE_BASES: KnowledgeBase[] = [
  { id: 'k-video', name: '抖音视频', kind: '数据知识库', count: '2K', image: `${KB_IMG}/video.webp`, icon: `${KB_IMG}/video-i.webp`, desc: '本知识库提供了抖音视频相关数据，可以查询视频投稿信息、视频标签、视频互动数据、视频作者信息等多方面的信息。本知识库内的数据为T+1更新。' },
  { id: 'k-b', name: '抖音B号', kind: '数据知识库', count: '422', image: `${KB_IMG}/b.webp`, icon: `${KB_IMG}/b-i.webp`, desc: '本知识库提供了抖音B号的相关数据，可以查询抖音账号信息、抖音账号的互动数据、抖音B号认证信息等多方面的信息。本知识库内的数据为T+1更新。' },
  { id: 'k-c', name: '抖音C号', kind: '数据知识库', count: '423', image: `${KB_IMG}/c.webp`, icon: `${KB_IMG}/c-i.webp`, desc: '本知识库提供了抖音C号的相关数据，可以查询抖音账号信息、抖音账号的互动数据、抖音C号认证身份等多方面的信息。本知识库内的数据为T+1更新。' },
  { id: 'k-live', name: '抖音直播', kind: '数据知识库', count: '385', image: `${KB_IMG}/live.webp`, icon: `${KB_IMG}/live-i.webp`, desc: '本知识库提供了抖音直播相关的数据，可以查询直播间信息、主播信息等多方面的信息，同时提供关播后生成的直播回放。本知识库内的数据为T+1更新。' },
  { id: 'k-video-gov', name: '视频处置', kind: '结构化知识库', count: '165', image: `${KB_IMG}/video-gov.webp`, icon: `${KB_IMG}/video-gov-i.webp`, desc: '本知识库提供了视频处置相关的数据，可以查询处置单信息、处置状态等多方面的信息。本知识库内的数据为T+1更新。' },
  { id: 'k-acct-gov', name: '账号处置', kind: '结构化知识库', count: '91', image: `${KB_IMG}/acct-gov.webp`, icon: `${KB_IMG}/acct-gov-i.webp`, desc: '本知识库提供了账号处置相关的数据，可以查询处置单信息、处置状态等多方面的信息。本知识库内的数据为T+1更新。' },
  { id: 'k-allhot', name: '全网热点', kind: '数据知识库', count: '755', image: `${KB_IMG}/allhot.webp`, icon: `${KB_IMG}/allhot-i.webp`, desc: '提供微博热榜、快手热榜、小红书热点、Bilibili热搜、知乎热榜等的热点事件信息，包括事件标题和在榜排名。' },
  { id: 'k-douyinhot', name: '抖音热点', kind: '数据知识库', count: '749', image: `${KB_IMG}/douyinhot.webp`, icon: `${KB_IMG}/douyinhot-i.webp`, desc: '提供抖音热榜、抖音上升榜的热点事件信息，包括事件标题和在榜排名。' },
]

/* ─────────────────────── 模型库 ─────────────────────── */

export interface ModelSeries {
  id: string
  name: string
  desc: string
  /** Brand wordmark shown on the banner. */
  wordmark: string
  count: number
}

export const MODEL_SERIES: ModelSeries[] = [
  { id: 'm-doubao', name: '豆包系列', desc: '多模态均衡实用，中文原生理解优异', wordmark: 'doubao', count: 7 },
  { id: 'm-deepseek', name: 'DeepSeek 系列', desc: '高效轻量化基座，数理推理与开源领先', wordmark: 'deepseek', count: 2 },
  { id: 'm-kimi', name: '月之暗面 系列', desc: '超长上下文专注，文档精读与深度思考', wordmark: 'Moonshot AI', count: 1 },
  { id: 'm-gpt', name: 'GPT 系列', desc: '通用大模型标杆，多任务推理与生成能力领先', wordmark: 'ChatGPT', count: 5 },
  { id: 'm-gemini', name: 'Gemini 系列', desc: '原生多模态，长上下文与图文混合理解强', wordmark: 'Gemini', count: 4 },
  { id: 'm-zhipu', name: '智谱 系列', desc: '国产通用模型，工具调用与结构化输出稳定', wordmark: 'zhipu', count: 3 },
  { id: 'm-minimax', name: 'MINIMAX 系列', desc: '语音 / 角色对话见长，互动娱乐场景适配', wordmark: 'MINIMAX', count: 4 },
  { id: 'm-qwen', name: 'Qwen 系列', desc: '通义千问，多尺寸覆盖，中文与代码均衡', wordmark: 'Qwen', count: 5 },
]

export const MODEL_FILTERS: { label: string; options: string[] }[] = [
  { label: '任务场景', options: ['全部', '文本理解', '图片理解', '视频理解', '角色模拟'] },
  { label: '模型能力', options: ['全部', '工具调用', '深度思考', '结构化输出', '上下文缓存', 'GUI任务处理'] },
  { label: '模型模态', options: ['全部', '文本', '图片', '视频', '音频'] },
  { label: '上下文长度', options: ['全部', '32k', '128k', '256k'] },
  { label: '回复长度', options: ['全部', '12k', '16k', '32k'] },
]

/* ─────────────────────── 发布器 ─────────────────────── */

export const PUBLISHER_FILTERS: { label: string; options: string[] }[] = [
  { label: '场景入口', options: ['全部', 'Feed', '评论区', '群聊', '私信', 'AI 聊天'] },
  { label: '组件形式', options: ['全部', 'Feed卡', '群聊消息', '私信消息', '账号头像', '评论'] },
  { label: '应用类型', options: ['全部', '小程序', 'AI分身'] },
]

export interface Publisher {
  id: string
  name: string
  app: string
  /** Phone-mock headline + sub. */
  title: string
  sub: string
}

export const PUBLISHERS: Publisher[] = [
  { id: 'p-single', name: '单结果卡', app: '小程序', title: '海龟汤又有新谜题啦！', sub: '剧情反转，海量角色等你解锁' },
  { id: 'p-multi', name: '多结果卡', app: '小程序', title: '热门 AI 创意玩法', sub: 'AI 奇幻冒险 / 温暖情感 / 炫酷特效' },
  { id: 'p-immersive', name: '沉浸卡', app: '小程序', title: '爆款热门动画推荐', sub: '剑来 · 仙侠 · 热血番剧' },
  { id: 'p-image', name: '图片内容卡', app: '小程序', title: '精选热点速览', sub: '傲娇痞痞兔重磅上线！合拍挑战' },
  { id: 'p-personal', name: '个性化服务卡', app: 'AI分身', title: '天秤座 · 今日运势', sub: '今日建议 / 宜忌 / 爱情事业财富' },
]

/* ─────────────────────── 触发器 ─────────────────────── */

export interface TriggerDef {
  id: string
  name: string
  desc: string
  /** undefined = live; string = 即将上线 badge. */
  status?: '即将上线'
  /** small label rendered as the banner glyph. */
  glyph: string
}

export const TRIGGERS: TriggerDef[] = [
  { id: 'tr-follow', name: '关注抖音账号', desc: '当用户关注抖音账号时，触发事件', glyph: '🎵' },
  { id: 'tr-at', name: '评论 @', desc: '当用户 @ 分身时，触发分身回复评论', status: '即将上线', glyph: '💬' },
  { id: 'tr-group-push', name: '群聊消息定时推送', desc: '自定义时间，按时调度分身推送群聊消息', status: '即将上线', glyph: '⏰' },
  { id: 'tr-group-event', name: '群活动开始', desc: '群内活动开始时，调度分身发送消息', status: '即将上线', glyph: '🎉' },
  { id: 'tr-feishu', name: '飞书定时推送', desc: '自定义时间，调度飞书机器人推送消息', status: '即将上线', glyph: '🟢' },
  { id: 'tr-table', name: '数据表定时写入', desc: '自定义事件，按时调度智能体写入数据表', status: '即将上线', glyph: '📊' },
]

/* ─────────────────────── Skills (moved to the Skills menu) ─────────────────────── */

export const SKILL_FILTERS = ['全部', '官方 Skills', '三方 Skills', '空间 Skills'] as const
export type SkillFilter = (typeof SKILL_FILTERS)[number]

export interface SkillItem {
  id: string
  name: string
  desc: string
  origin: Exclude<SkillFilter, '全部'>
  source: string
  usage: string
}

export const SKILLS: SkillItem[] = [
  { id: 's-bind-avatar', name: '绑定 AI 分身组件', desc: '把分身能力绑定到抖音端组件，供评论 / 私信调用。', origin: '官方 Skills', source: '抖音官方', usage: '3.1K' },
  { id: 's-astro-read', name: '星座运势解读', desc: '基于星座知识库输出每日 / 本周运势解读。', origin: '空间 Skills', source: '陶白白 Sensei', usage: '2.6K' },
  { id: 's-emotion-chat', name: '情感陪伴对话', desc: '温柔治愈的情感陪伴式对话能力。', origin: '空间 Skills', source: '陶白白 Sensei', usage: '1.9K' },
  { id: 's-hot-query', name: '抖音热点查询', desc: '实时拉取抖音热点榜并结合上下文推荐选题。', origin: '官方 Skills', source: '抖音官方', usage: '1.4K' },
  { id: 's-multimodal', name: '多模态内容分析', desc: '对图文 / 视频做综合理解与要点提取。', origin: '官方 Skills', source: '抖音官方', usage: '1.1K' },
  { id: 's-auto-reply', name: '评论自动回复', desc: '按人设语气自动回复评论区高频问题。', origin: '空间 Skills', source: '粉丝互动机器人', usage: '880' },
  { id: 's-poster', name: '运营海报助手', desc: '3D / 插画 / 平面多风格运营海报生成。', origin: '三方 Skills', source: '卢艳华', usage: '402' },
  { id: 's-report', name: '舆情研报生成', desc: '事件脉络梳理 + 飞书文档沉淀一条龙。', origin: '三方 Skills', source: '黄红钰', usage: '802' },
  { id: 's-tarot', name: '每日塔罗抽牌', desc: '塔罗抽牌 + 牌意解读的趣味互动技能。', origin: '空间 Skills', source: '塔罗小程序', usage: '1.4K' },
]
