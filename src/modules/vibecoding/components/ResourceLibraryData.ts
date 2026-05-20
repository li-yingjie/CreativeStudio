export type CapabilityType = 'skill' | 'tool' | 'knowledge'

export interface Capability {
  type: CapabilityType
  name: string
  description?: string
  /** Optional sub-category within the type — e.g. aime skills are split
   *  into 飞书 / 研发 / 数据 / 信息检索 / 创作. Drives the sub-section
   *  grouping in ResourceDetailView. */
  category?: string
}

/** Helper: build a list of `type: 'skill'` capabilities from a record of
 *  category → skill names. Keeps long catalogs (iDA, mira, aime) readable
 *  while preserving the category metadata. */
function skillsByCategory(map: Record<string, string[]>): Capability[] {
  const out: Capability[] = []
  for (const [category, names] of Object.entries(map)) {
    for (const name of names) {
      out.push({ type: 'skill', name, category })
    }
  }
  return out
}

/** All first-level tree nodes. `官方` is a virtual aggregator — no
 *  resources sit under it directly; selecting it shows the union of
 *  resources from the four official domains. */
export type PrimaryCategory =
  | '官方'
  | '业务平台'
  | '舆情监控'
  | '内容理解与生成'
  | '数据分析和处理'
  | '开发和效率'
  | '官方引入'
  | '空间'

export interface Resource {
  id: string
  name: string
  description: string
  primaryCategory: PrimaryCategory
  secondaryCategory: string
  url?: string
  capabilities: Capability[]
}

export const PRIMARY_CATEGORIES: PrimaryCategory[] = [
  '官方',
  '业务平台',
  '舆情监控',
  '内容理解与生成',
  '数据分析和处理',
  '开发和效率',
  '官方引入',
  '空间',
]

/** Subset that `官方` virtually aggregates — selecting 官方 in the tree
 *  shows the union of resources whose primaryCategory is in this set. */
export const OFFICIAL_DOMAINS: PrimaryCategory[] = [
  '业务平台',
  '舆情监控',
  '内容理解与生成',
  '数据分析和处理',
  '开发和效率',
  '官方引入',
]

/* ─── Two orthogonal filter dimensions for capabilities:
 *    • SCENE_TAGS  — which surface the capability lives on (抖音 Feed /
 *      直播内容 …). Selecting one in the 场景 dropdown narrows the
 *      list. Capabilities whose name doesn't match a scene are simply
 *      excluded by that filter (no "其他" bucket here).
 *    • CAPABILITY_TAGS — what the capability *does* (灵感创作 / 开发工具
 *      …), driven by keyword rules. Falls back to "其他" when none
 *      match. This is the tag shown on every card. */

export const SCENE_TAGS = [
  '抖音 Feed',
  '抖音评论',
  '抖音群聊',
  '抖音搜索',
  '抖音热点',
  '视频内容',
  '直播内容',
] as const

export type SceneTag = (typeof SCENE_TAGS)[number]

export const CAPABILITY_TAGS = [
  '灵感创作',
  '账号信息',
  '内容处理',
  '视觉制作',
  '办公效率',
  '联网搜索',
  '开发工具',
  '系统工具',
  '行业工具',
  '娱乐互动',
  '治理服务',
  '其他',
] as const

export type CapabilityTag = (typeof CAPABILITY_TAGS)[number]

const SCENE_RULES: { tag: SceneTag; patterns: string[] }[] = [
  // Order matters — first match wins, so put more specific patterns first.
  { tag: '抖音 Feed', patterns: ['抖音 feed', '抖音feed', 'douyin feed', 'feed流', 'feed 流', '信息流'] },
  { tag: '抖音评论', patterns: ['抖音评论', '评论区', '评论'] },
  { tag: '抖音群聊', patterns: ['群聊', '抖音群', 'im-chat', 'lark-im', '飞书群'] },
  { tag: '抖音搜索', patterns: ['抖音搜索', '搜索抖音', 'douyin-search', '看后搜'] },
  { tag: '抖音热点', patterns: ['热点', '热搜', '热门', '热榜', 'hot', 'trending', '榜单', '舆情', '战报'] },
  { tag: '直播内容', patterns: ['直播', 'live', 'livestream'] },
  { tag: '视频内容', patterns: ['视频', 'video', '剪辑', 'videocut', '短剧', 'short-drama', 'drama', '妙记'] },
]

const CAPABILITY_RULES: { tag: Exclude<CapabilityTag, '其他'>; patterns: string[] }[] = [
  // Order matters — first match wins, so put more specific patterns first.
  {
    tag: '账号信息',
    patterns: ['账号', '作者', 'author', '用户画像', '人设', 'profile', 'persona', '粉丝'],
  },
  {
    tag: '视觉制作',
    patterns: ['图片', 'image', '图像', '渲染图片', 'banner', 'screenshot', 'svg', 'logo', '设计', 'design', '原型', 'mockup', '海报', '视觉'],
  },
  {
    tag: '办公效率',
    patterns: [
      '会议', 'meeting', '邮件', 'mail', '日历', 'calendar', '日程', 'schedule',
      '文档', 'doc', 'pdf', 'ppt', 'docx', '一页纸', 'onepage', 'easy-read',
      'sheet', '表格', 'xlsx', '多维', 'table', '飞书', 'lark-', 'feishu',
      '审批', 'approval', '任务', '待办', 'todo',
    ],
  },
  {
    tag: '联网搜索',
    patterns: ['网络搜索', '全网搜索', '联网', 'web-search'],
  },
  {
    tag: '开发工具',
    patterns: ['code', '代码', 'codebase', 'meego', 'meegle', 'frontend', 'backend', '研发', 'api', 'dev', 'cli', 'devmind'],
  },
  {
    tag: '系统工具',
    patterns: ['sql', '数据库', 'database', '查询', 'query', 'monitor', '监控', '日志', 'log', 'service', '服务', '部署', 'deploy', 'kibana'],
  },
  {
    tag: '行业工具',
    patterns: ['行业', '财务', 'finance', '法务', 'legal', '采购', 'procurement', 'finai', '电商'],
  },
  {
    tag: '娱乐互动',
    patterns: ['互动', '游戏', 'game', '抽奖', '问答', 'quiz', '玩法', 'play', '活动', 'campaign', '娱乐'],
  },
  {
    tag: '治理服务',
    patterns: ['治理', '违规', '风险', '风控', '合规', '安全', 'security', 'risk', 'governance', '审核', '检测', 'detection', '反作弊', 'anti'],
  },
  {
    tag: '内容处理',
    patterns: ['改写', '润色', '总结', 'summary', '内容处理', '解读', '分析', '拆解'],
  },
  {
    tag: '灵感创作',
    patterns: ['灵感', '头脑风暴', 'brainstorm', '创意', '选题', '草稿', '撰写', '文案', 'creator', 'gen-', '创作', '创建', '生成', 'generate', 'write'],
  },
]

/** Map a capability name → scene tag. Returns `null` when no scene
 *  pattern matches; callers should treat that as "no scene" rather than
 *  bucketing into "其他". */
export function inferSceneTag(name: string): SceneTag | null {
  const lower = name.toLowerCase()
  for (const rule of SCENE_RULES) {
    if (rule.patterns.some((p) => lower.includes(p.toLowerCase()))) {
      return rule.tag
    }
  }
  return null
}

export function inferCapabilityTag(name: string): CapabilityTag {
  const lower = name.toLowerCase()
  for (const rule of CAPABILITY_RULES) {
    if (rule.patterns.some((p) => lower.includes(p.toLowerCase()))) {
      return rule.tag
    }
  }
  return '其他'
}

/* ─── Per-product skill catalogs (sourced from internal skill registry) ─── */

const AIME_SKILLS: Record<string, string[]> = {
  飞书: [
    '云文档',
    '多维表格',
    '单聊 / 群聊',
    '飞书卡片',
    '飞书日历',
    '飞书任务',
    '飞书会议 / 飞书妙记',
    '邮件',
    '代发消息',
  ],
  研发: [
    'Meego',
    'Codebase / 代码库',
    'Slardar',
    'Argos',
    'Bits / 发布单',
    'PSM 服务元信息',
    'Trae cli',
  ],
  数据: ['Libra', 'Coral', 'DevMind'],
  信息检索: ['ByteTech 内部知识库', '网络搜索'],
  创作: [
    '图片 / Banner 生成',
    '语音输入识别执行',
    'AI 多媒体分析',
    'PPT',
    'Artifacts',
  ],
}

const MIRA_SKILLS: Record<string, string[]> = {
  数据分析: [
    'aeolus-query',
    'consulting-charts',
    'data-comparison',
    'report-template',
    'sensight',
  ],
  设计: [
    'ai-design-guidelines',
    'frontend-design',
    'frontend-slides',
    'svg-chart-gen',
    'universe-design',
    'universe-design-dictionary',
    'vchart-development-assistant',
  ],
  效率协作: [
    'byte-approval',
    'consulting-charts',
    'daily-llm-demo-tracker',
    'depression-screening',
    'docx',
    'finai-statement-review',
    'frontend-design',
    'generate-mockup-html',
    'im-chat-manager',
    'interview-emergency-kit',
    'lark-docs',
    'lark-docs-skill',
    'legal-contract-review',
    'meegle-skill',
    'mira-remote-browser',
    'mira-scheduler',
    'okrs-by-bco',
    'pdf',
    'people-leave-expert',
    'prettydoc',
    'skill-creator',
    'slides',
    'xlsx',
  ],
  财务与法务: [
    'finai-budget-execution-forecast',
    'finai-finance-onboarding',
    'finai-statement-review',
    'finai-tech-focal-assistant',
    'finance-rule-qa',
    'legal-contract-compare-review',
    'legal-contract-review',
    'legal-paper-reviewer',
    'legal-patent-quality-check',
    'legal-review-info-completeness',
    'legal-review-info-summary',
    'payment-finance-compliance',
    'workstation-expenses-audit',
  ],
  生活方式: [
    'a-share-quant',
    'business-sparring',
    'chat-love-debugger',
    'daily-llm-demo-tracker',
    'depression-screening',
    'eden',
    'first-principles-thinker',
    'short-drama-original',
  ],
  企业采购: [
    'procurement-se',
    'procurement-shared',
    'procurement-sp',
    'procurement-sr',
    'sourcing-document-summary',
    'sourcing-document-title',
    'supplier-comprision-price',
  ],
  自动化工具: [
    'activity-onepage',
    'autopilot',
    'byte-approval',
    'docx',
    'easy-read-doc',
    'generate-mockup-html',
    'group-message-sync',
    'high-end-ppt-generator',
    'im-chat-manager',
    'interview-emergency-kit',
    'job-profile-optimizer',
    'lark-docs',
    'lark-docs-skill',
    'meegle-skill',
    'mira-memory',
    'mira-remote-browser',
    'mira-scheduler',
    'nl2data',
    'okrs-by-bco',
    'pdf',
    'people-leave-expert',
    'pm-all-in-one-assistant',
    'prettydoc',
    'skill-creator',
    'skill-guide-writer',
    'slides',
    'web-page-creator',
    'weekly-report-writer',
    'xlsx',
  ],
  销售和营销: ['brand-strategy-analyst', 'group-feedback-analysis'],
}

const IDA_SKILLS: Record<string, string[]> = {
  数据分析: [
    'TEA 统一入口',
    'TEA 数据查询',
    'hotel-check-medal',
    'TEA 创建看板 & 图表',
    'TEA 资源解析',
    'TEA 根因分析',
    'TEA 报告生成',
    'TEA 行为细查',
    'TEA 会话回放 Oncall 分析',
    'Libra CLI',
    '指标归因分析',
    'Libra - 实验指标归因 & 核心数据总结',
    'Libra - 多实验分类总结',
    'Libra - 智能实验分析 & 写报告',
    '指标异常检测',
    'databp-life-data-analysis',
    'talent-live-settlement-gmv-analysis',
    'Libra - 兜底技能（beta 版）',
    '渠道经理拜访一页纸',
    'dau-attribution-videocut',
    'query_bd_morning_report',
    'stream-data-analysis',
    'videocut-analysis-report-local',
    'lark-sheets',
    'fibp_ecom_analysis_weekly_report',
    '商品外链路渲染图片',
    'oa-insight-session-lifecycle-summari…',
    'slardar-web',
    'extract-analysis-methodology',
    'Tea CLI',
    'oa-insight-cross-line-synthesizer',
    'TEA 会话回放 logid 提取',
    'customer-origin-attribution',
    'TeaCli',
    'Libra - 敏感维度洞察分析（JS 散度）',
    'kani-data-expert',
    'bdm-evening-report',
    'videocut-analysis-report',
    '数据分析',
    'voc-detective',
    'BIGDAY 战报 - 查询分析',
    '飞书【图表助手】',
    '【PPE】TEA 统一入口',
    'volcano-security-score-analyzer',
    'slardar-dashboard-fetcher',
    'dw-requirement-assistant-text',
    'jianying-wiki-query',
    'oa-insight-component-health-summa…',
  ],
  知识问答: [
    'hotel-check-medal',
    'Libra CLI',
    'Libra - 智能实验分析 & 写报告',
    '学术搜索',
    'databp-life-data-analysis',
    'query_bd_morning_report',
    'deep-research',
    'stream-data-analysis',
    'gvn-skill-data-req-aist-feishu',
    'A 股分析',
    'extract-analysis-methodology',
    'TEA 会话回放 logid 提取',
    'gvn-skill-data-req-ast-meego',
    'sensight',
    'kani-data-expert',
    'writeback-methodology-to-kb',
    '飞书【图表助手】',
    'volcano-security-score-analyzer',
    'dw-requirement-assistant-text',
    'slardar-dashboard-fetcher',
    'event-puttable-mapping',
    '智能接待收入渗透归因',
    'gvn-skill-data-req-ast-template-oth…',
    'gvn-skill-data-req-ast-template-sent…',
    'PDF 工具',
    'hotspot-poi-selection',
    'metric-group-latency-investigation',
    'ugc_target_message_tool',
    'ugc-data-query-router',
    'toil-skl-skill-bundle',
    '实验工具包',
    'databp-life-home-get-data',
    'voc-detective-v11',
    'data-security-score-analyzer',
    'risk_info_analyzer',
    'identify-external-tool-shops',
    'arena-sop',
    'hotel-check-medal-test',
    'home-ida',
    'personal-nutritionist',
    'lark-im',
    'humanizer',
    'databp-life-channel-performance-an…',
    'prd-requirement-rating',
    'shangtu-asset-search',
    'volcano-security-awareness-specialist',
    'video-ld-gaia-quick-query',
    'liujuanhui-test',
  ],
  方案策划: [
    '图片生成',
    'Libra CLI',
    'Libra - 智能实验分析 & 写报告',
    'PPT 生成',
    '视频生成',
    '头脑风暴',
    'kani-data-expert',
    '飞书【图表助手】',
    'PDF 工具',
    '月付筛推一体运营计划创建',
    'hotspot-poi-selection',
    '架构图绘制工具',
    'voc-detective-v11',
    'pop-lab-infographic',
    '文字去 AI 感',
    'theme-mario-platformer',
    'databp-life-channel-performance-an…',
    '产品经理技能包',
    '短视频脚本创作',
    'industry-trend-report',
    'pixel-platformer',
    'real-estate-video-diagnosis-skill',
    'liujuanhui-test',
    '三率查询',
    'paul-graham-perspective',
    'lark-card-generator',
    'search-restaurants',
    '原型图设计',
  ],
  数据处理类: ['风神 / Aeolus skill'],
  数据处理: [
    '数据网页绘制',
    'Libra CLI',
    'Libra - 多实验分类总结',
    'Libra - 智能实验分析 & 写报告',
    'Libra - 兜底技能（beta 版）',
    'lark-cli-fixed-app-installer',
    'lark-sheets-style-clone',
    'lark-sheets',
    '商品外链渲染图片',
    'slardar-web',
    'Tea CLI',
    'kani-data-expert',
    '飞书【图表助手】',
    '仲裁客服绩效气泡图',
    'slardar-dashboard-fetcher',
    '智能接待收入渗透归因',
    'LibraToSheet2.1',
    'vchart-development-assistant',
    'hotspot-poi-selection',
    'sql-date-clarifier',
    'vchart-to-png-screenshot',
    '抖音直播 - 语义驱动消费',
    'spc-monitor',
    'abtest-data-handler',
    'dongchedi-series-params',
    'prod-main-img-sheet',
    'metric-volatility-attribution-v0',
  ],
  报告撰写: [
    'Libra CLI',
    'Libra - 智能实验分析 & 写报告',
    'PPT 生成',
    '渠道经理拜访一页纸',
    'query_bd_morning_report',
    'deep-research',
    'libra-report-format & 引用',
    'gvn-skill-data-req-aist-feishu',
    'fibp_ecom_analysis_weekly_report',
    'slardar-web',
    'gvn-skill-data-req-ast-meego',
    'kani-data-expert',
    '飞书【图表助手】',
    '信息图生成',
    'slardar-dashboard-fetcher',
    'dw-requirement-assistant-text',
    'gvn-skill-data-req-ast-template-oth…',
    '报告生成专家',
    '图表助手 - 飞书文档数据报告生成',
    '智能接待收入渗透归因',
    'gvn-skill-data-req-ast-template-sent…',
    'LibraToSheet2.1',
    'PDF 工具',
    'syh-debug-experiment-analysis',
    'vchart-development-assistant',
    'vchart-to-png-screenshot',
    'feishu-cli-bitable',
    'risk_info_analyzer',
    'home-ida',
    'magibook',
    'pptx',
    'abtest-report',
    'databp-life-channel-performance-an…',
    'industry-trend-report',
    'real-estate-video-diagnosis-skill',
    'feishu-automation',
    'gen-version-report-ida',
    'liujuanhui-test',
    'docx',
    '三率查询',
    '财务预案分析',
    'easy-read-doc',
    'dataagent-trace',
    'search-flights',
    'T2T 逐步生成器',
    'data-visualization',
  ],
  字节数据工具: [
    '风神 / Aeolus skill',
    'TEA 会话回放 Oncall 分析',
    'Libra CLI',
    'Libra - 实验指标归因 & 核心数据总结',
    'Libra - 多实验分类总结',
    'Libra - 智能实验分析 & 写报告',
    'Libra - 实验与指标格式化导出 (beta 版)',
    'Libra - 兜底技能（beta 版）',
    'tea-oncall-troubleshooter',
    'query_bd_morning_report',
    'libra-report-format & 引用',
    'fibp_ecom_analysis_weekly_report',
    'slardar-web',
    'Tea CLI',
    'TeaCli',
    'APP 稳定性诊断',
    'Libra - 敏感维度洞察分析（JS 散度）',
    'kani-data-expert',
    'volcano-security-score-analyzer',
    'slardar-dashboard-fetcher',
    'dw-requirement-assistant-text',
    '图表助手 - 飞书文档数据报告生成',
    '智能接待收入渗透归因',
    'Libra 统一入口',
    'voc-detective-v9',
    'syh-debug-experiment-analysis',
    'sql-date-clarifier',
    '长周期查询',
    'aeolus-git',
    '数据瀑布图生成',
    'databp-life-home-get-data',
    'TEA 会话回放：基础分析',
    'risk_info_analyzer',
    'home-ida',
    'ab-experiment-analysis',
    '投放周报',
    'doubao-audio-tech-weekly-report',
    '指标趋势解读',
    'slardar-app',
    'magibook',
    'DE_caijing_business_skills',
    'aeolus-inspection-report',
    'abtest-report',
    'web-application-git',
    'qcpx-ab-report-skill',
    '旧版存档_财经_异常监测',
    '电商内容策略核心指标归因',
    'volcano-security-awareness-specialist',
    'cn-data-arch-cpu-memcore-analysis',
    'data-agent-intent-router',
    'search-restaurants',
    'search-flights',
    'sql-query-generation',
    'doubao-audio-weekly-report',
    'voc-detective-v10',
    'lark-push_skill',
    'ui-ux-pro-max',
    'bytedance-aeolus-opensource',
  ],
}

export const RESOURCES: Resource[] = [
  /* ─── 官方 → 业务平台 ─── */
  {
    id: 'live-ops',
    name: '直播运营平台',
    description: '抖音直播管理后台，支持活动配置、数据监控等功能',
    primaryCategory: '业务平台',
    secondaryCategory: '直播',
    capabilities: [
      { type: 'skill', name: '查询主播开播时长' },
      { type: 'skill', name: '直播间观众画像分析' },
      { type: 'skill', name: '直播热度趋势分析' },
      { type: 'skill', name: '主播带货 GMV 拆解' },
      { type: 'tool', name: '调整直播间排序权重' },
      { type: 'tool', name: '直播流量加热配置' },
      { type: 'knowledge', name: '直播运营 SOP' },
    ],
  },
  {
    id: 'music-ops',
    name: '音乐人运营平台',
    description: '汽水音乐创作者管理平台，支持音乐上传、数据统计等功能',
    primaryCategory: '业务平台',
    secondaryCategory: '音乐',
    capabilities: [],
  },
  {
    id: 'kesong-ops',
    name: '可颂运营平台',
    description: '可颂业务运营管理平台，支持商品管理、活动配置等功能',
    primaryCategory: '业务平台',
    secondaryCategory: '可颂',
    capabilities: [],
  },
  {
    id: 'gaia',
    name: '盖亚',
    description: '抖音运营项目管理平台，支持项目立项、资源申请、活动搭建等功能',
    primaryCategory: '业务平台',
    secondaryCategory: '作者运营',
    capabilities: [
      { type: 'skill', name: '查询作者激励状态' },
      { type: 'tool', name: '提交资源申请单' },
      { type: 'knowledge', name: '作者分层运营手册' },
    ],
  },
  {
    id: 'hotspot-ops',
    name: '热点运营平台',
    description: '抖音热点、榜单、热点事件、热点活动管理平台',
    primaryCategory: '业务平台',
    secondaryCategory: '内容运营',
    capabilities: [
      { type: 'skill', name: '查询热点榜单实时数据' },
      { type: 'tool', name: '热点话题加权配置' },
      { type: 'knowledge', name: '热点运营策略库' },
    ],
  },
  {
    id: 'wenyu-ops',
    name: '文娱运营平台',
    description: '抖音文娱运营管理平台，支持影视、综艺、明星等内容运营',
    primaryCategory: '业务平台',
    secondaryCategory: '文娱',
    capabilities: [
      { type: 'skill', name: '查询明星阵地数据' },
      { type: 'tool', name: '内容专题搭建' },
      { type: 'knowledge', name: '文娱内容标签词表' },
    ],
  },
  {
    id: 'ip-mid',
    name: '世界观',
    description: 'IP 中台 — 抖音 IP 资源管理、授权流转、内容引入与活动绑定',
    primaryCategory: '业务平台',
    secondaryCategory: 'IP 中台（世界观）',
    capabilities: [],
  },
  {
    id: 'douyin-select',
    name: '抖音精选',
    description: '抖音精选内容运营后台，支持选品、活动配置、流量调度',
    primaryCategory: '业务平台',
    secondaryCategory: '抖音精选',
    capabilities: [],
  },
  {
    id: 'role-fx',
    name: '角色',
    description: '创作与特效平台 — 虚拟形象 / 滤镜 / 特效 / 道具管理',
    primaryCategory: '业务平台',
    secondaryCategory: '创作与特效（角色）',
    capabilities: [],
  },
  {
    id: 'search-ops',
    name: '搜索运营平台',
    description: '抖音搜索榜单、流量分发、SEO 关键词运营后台',
    primaryCategory: '业务平台',
    secondaryCategory: '搜索',
    capabilities: [],
  },
  {
    id: 'comment-ops',
    name: '评论运营平台',
    description: '评论区策略、置顶、风险评论检测与处置',
    primaryCategory: '业务平台',
    secondaryCategory: '评论',
    capabilities: [],
  },
  {
    id: 'ug-ops',
    name: 'UG 运营平台',
    description: '用户增长侧：拉新、激活、留存策略配置 + 数据看板',
    primaryCategory: '业务平台',
    secondaryCategory: 'UG',
    capabilities: [],
  },
  {
    id: 'qianxun',
    name: '千寻',
    description: '抖音全业务安全搜索查询、实体画像分析、AI 智能风险研判、多维度风控平台',
    primaryCategory: '业务平台',
    secondaryCategory: '平台 & 社区治理',
    capabilities: [
      { type: 'skill', name: '实体安全画像查询' },
      { type: 'skill', name: '风险事件溯源' },
      { type: 'knowledge', name: '风控规则库' },
    ],
  },
  {
    id: 'ola',
    name: 'Ola 平台',
    description: '抖音 AI 智能客服搭建平台，支持对话流配置、知识管理等功能',
    primaryCategory: '业务平台',
    secondaryCategory: '体验与服务',
    capabilities: [
      { type: 'tool', name: '对话流编排' },
      { type: 'tool', name: '知识库挂载' },
      { type: 'knowledge', name: '客服话术规范' },
    ],
  },

  /* ─── 舆情监控 ─── */
  {
    id: 'owls',
    name: 'OWLS 猫头鹰',
    description: '抖音一站式信息洞察 Agent 平台，支持风险预警、行业监测等功能',
    primaryCategory: '舆情监控',
    secondaryCategory: 'OWLS 猫头鹰',
    capabilities: [
      { type: 'skill', name: '舆情实时监测' },
      { type: 'skill', name: '行业事件追踪' },
      { type: 'tool', name: '预警订阅配置' },
      { type: 'knowledge', name: '舆情处置 SOP' },
    ],
  },

  /* ─── 内容理解与生成 ─── */
  {
    id: 'holmes',
    name: '福尔摩斯 Holmes',
    description: '推荐系统架构下的研发工具平台，包含 Code Review 质检、灰度指标看板',
    primaryCategory: '内容理解与生成',
    secondaryCategory: '福尔摩斯（Holmes）',
    capabilities: [
      { type: 'skill', name: '推荐效果归因' },
      { type: 'tool', name: '灰度指标对比' },
      { type: 'knowledge', name: '推荐策略基线' },
    ],
  },
  {
    id: 'lucy',
    name: '内容理解中台',
    description: '原 Lucy — 抖音内容理解中台，覆盖结构化标签、内容向量检索、内容审核策略',
    primaryCategory: '内容理解与生成',
    secondaryCategory: '内容理解中台（原Lucy）',
    capabilities: [],
  },

  /* ─── 数据分析和处理 ─── */
  {
    id: 'tea',
    name: 'TEA',
    description: '字节跳动统一数据分析平台，提供事件、漏斗、留存、热图等行为分析能力',
    primaryCategory: '数据分析和处理',
    secondaryCategory: 'TEA',
    capabilities: [],
  },
  {
    id: 'libra',
    name: 'Libra',
    description: '字节跳动 A/B 实验平台，覆盖实验设计、分流、指标核算与归因分析',
    primaryCategory: '数据分析和处理',
    secondaryCategory: 'Libra',
    capabilities: [],
  },
  {
    id: 'aeolus',
    name: '风神 Aeolus',
    description: '字节跳动内部自研的敏捷 BI（商业智能）平台，提供灵活易用的数据查询能力',
    primaryCategory: '数据分析和处理',
    secondaryCategory: 'Aeolus（风神）',
    capabilities: [
      { type: 'skill', name: '即席 SQL 查询' },
      { type: 'tool', name: '看板搭建' },
      { type: 'knowledge', name: '常用指标口径' },
    ],
  },
  {
    id: 'zidian',
    name: '资典平台',
    description: '统一指标 / 词表 / 资产管理平台，沉淀业务对齐口径与数据资产元信息',
    primaryCategory: '数据分析和处理',
    secondaryCategory: '资典平台',
    capabilities: [],
  },

  /* ─── 开发和效率 ─── */
  {
    id: 'aime',
    name: 'Aime（国内版）',
    description: '面向字节内部的复杂任务异步自动化智能体，支持多步任务自主规划、长任务执行',
    primaryCategory: '开发和效率',
    secondaryCategory: 'Aime',
    capabilities: skillsByCategory(AIME_SKILLS),
  },
  {
    id: 'mira',
    name: 'Mira',
    description: '企业级可信赖的办公 AI 平台，集成多种业界顶尖的 SOTA 大模型',
    primaryCategory: '开发和效率',
    secondaryCategory: 'Mira',
    capabilities: skillsByCategory(MIRA_SKILLS),
  },
  {
    id: 'ida',
    name: 'iDA',
    description: '数据平台官方为全体字节同学打造的 AI Agent 产品，支持知识检索、数据分析',
    primaryCategory: '开发和效率',
    secondaryCategory: 'iDA',
    capabilities: skillsByCategory(IDA_SKILLS),
  },
  {
    id: 'meego',
    name: 'Meego',
    description: '字节内部项目协作平台，支持需求 / 缺陷 / 迭代管理',
    primaryCategory: '开发和效率',
    secondaryCategory: 'Meego',
    capabilities: [],
  },
  {
    id: 'lark',
    name: 'Lark',
    description: '飞书办公套件 — 云文档、多维表格、IM、日历、会议',
    primaryCategory: '开发和效率',
    secondaryCategory: 'Lark',
    capabilities: [],
  },
  {
    id: 'slardar',
    name: 'Slardar',
    description: '前端 / 移动端性能与异常监控平台，提供线上 RUM 数据洞察',
    primaryCategory: '开发和效率',
    secondaryCategory: 'Slardar',
    capabilities: [],
  },

  /* ─── 官方 → 官方引入 (vetted third-party ecosystems we bridge into
   *     vibecoding via official adapters) ─── */
  {
    id: 'notion',
    name: 'Notion',
    description: '团队知识库 / 文档同步，支持页面拉取和写回',
    primaryCategory: '官方引入',
    secondaryCategory: 'Notion',
    capabilities: [
      { type: 'tool', name: '读取 Notion 页面' },
      { type: 'tool', name: '写入 Notion 数据库' },
      { type: 'knowledge', name: '团队 wiki 索引' },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: '开源代码托管平台，可拉取仓库、Issue、PR、Workflow 状态',
    primaryCategory: '官方引入',
    secondaryCategory: 'GitHub',
    capabilities: [
      { type: 'tool', name: '拉取仓库代码' },
      { type: 'tool', name: '查询 Issue 列表' },
      { type: 'tool', name: '查询 PR 状态' },
      { type: 'skill', name: '代码 Review 总结' },
      { type: 'knowledge', name: '仓库 README 索引' },
    ],
  },
  {
    id: 'tencent',
    name: '腾讯',
    description: '腾讯生态接入：企业微信、腾讯文档、腾讯会议',
    primaryCategory: '官方引入',
    secondaryCategory: '腾讯',
    capabilities: [
      { type: 'tool', name: '企业微信群通知' },
      { type: 'tool', name: '腾讯文档读写' },
      { type: 'tool', name: '腾讯会议日程' },
      { type: 'skill', name: '会议纪要生成' },
    ],
  },
  {
    id: 'alibaba',
    name: '阿里',
    description: '阿里生态接入：钉钉、阿里云 OSS、阿里云日志服务',
    primaryCategory: '官方引入',
    secondaryCategory: '阿里',
    capabilities: [
      { type: 'tool', name: '钉钉机器人推送' },
      { type: 'tool', name: 'OSS 文件读写' },
      { type: 'tool', name: 'SLS 日志查询' },
    ],
  },
  {
    id: 'figma',
    name: 'Figma',
    description: '设计稿读取、组件库导出，支持把 Frame 作为上下文喂给 AI',
    primaryCategory: '官方引入',
    secondaryCategory: 'Figma',
    capabilities: [
      { type: 'tool', name: '读取 Figma 文件' },
      { type: 'tool', name: '导出 Frame 截图' },
      { type: 'skill', name: '设计稿组件抽取' },
    ],
  },

  /* ─── 空间 — 用户 / 团队自建的资源空间，沉淀草稿、知识、项目记忆、
   *     人设。与 官方 / 官方引入 互补：这里是「我自己 / 我们团队」的
   *     资产，全部归到单个「空间」一级节点下展示。 ─── */
  {
    id: 'space',
    name: '空间',
    description: '团队 / 个人自建的资源沉淀：草稿 · 知识 · 项目档案 · 人设',
    primaryCategory: '空间',
    secondaryCategory: '空间',
    capabilities: [
      { type: 'skill', name: '召回最近草稿' },
      { type: 'tool', name: '保存当前对话片段' },
      { type: 'knowledge', name: '提示词收藏夹' },
      { type: 'skill', name: '团队 wiki 检索' },
      { type: 'knowledge', name: '行业 SOP 库' },
      { type: 'knowledge', name: '会议纪要档案' },
      { type: 'tool', name: '上传新文档' },
      { type: 'skill', name: '相似项目检索' },
      { type: 'knowledge', name: '历史提案库' },
      { type: 'tool', name: '复用项目模板' },
      { type: 'skill', name: '匹配相近人设' },
      { type: 'knowledge', name: '人设设定档' },
    ],
  },
]

export interface CategoryTreeNode {
  primary: PrimaryCategory
  secondaries: string[]
}

/** Build the 2-level hierarchy used by the category tree. 官方 is a
 *  virtual aggregator with no direct children; it relies on a row-level
 *  selector in the UI instead of any nested secondaries. */
export function buildCategoryTree(
  resources: Resource[] = RESOURCES,
): CategoryTreeNode[] {
  const buckets = new Map<PrimaryCategory, string[]>()
  const seen = new Map<PrimaryCategory, Set<string>>()
  for (const cat of PRIMARY_CATEGORIES) {
    buckets.set(cat, [])
    seen.set(cat, new Set())
  }
  for (const r of resources) {
    const list = buckets.get(r.primaryCategory)!
    const sset = seen.get(r.primaryCategory)!
    if (!sset.has(r.secondaryCategory)) {
      sset.add(r.secondaryCategory)
      list.push(r.secondaryCategory)
    }
  }
  return PRIMARY_CATEGORIES.map((primary) => ({
    primary,
    secondaries: buckets.get(primary) ?? [],
  }))
}

export function filterResources(
  primary: PrimaryCategory | null,
  secondary: string | null,
  resources: Resource[] = RESOURCES,
): Resource[] {
  return resources.filter((r) => {
    if (primary && r.primaryCategory !== primary) return false
    if (secondary && r.secondaryCategory !== secondary) return false
    return true
  })
}

export function findResource(
  id: string | null,
  resources: Resource[] = RESOURCES,
): Resource | null {
  if (!id) return null
  return resources.find((r) => r.id === id) ?? null
}

export const CAPABILITY_LABEL: Record<CapabilityType, string> = {
  skill: 'Skill',
  tool: 'MCP',
  knowledge: '知识库',
}

/* ─── Project usage / lineage ───
 * Maps each project (matches PROJECT_KINDS keys in VibeCodingPage) to
 * the resources / capabilities it depends on. Used by the detail views
 * to surface "项目血缘" — which projects pull from this capability or
 * platform — and to count its reach.
 */

export interface ProjectCapabilityRef {
  platformId: string
  /** Optional — when omitted, the project is using the platform broadly
   *  (any capability) and the dependency rolls up to the platform level
   *  rather than a single capability row. */
  name?: string
  category?: string | null
}

export interface ProjectUsage {
  project: string
  uses: ProjectCapabilityRef[]
}

export const PROJECT_USAGE: ProjectUsage[] = [
  {
    project: '陶白白 Sensei 分身',
    uses: [
      { platformId: 'aime', name: '单聊 / 群聊', category: '飞书' },
      { platformId: 'aime', name: '飞书会议 / 飞书妙记', category: '飞书' },
      { platformId: 'aime', name: '网络搜索', category: '信息检索' },
      { platformId: 'mira', name: 'lark-docs', category: '效率协作' },
      { platformId: 'mira', name: 'short-drama-original', category: '生活方式' },
      { platformId: 'ida', name: 'TEA 数据查询', category: '数据分析' },
      { platformId: 'mirror', name: '用户标签查询' },
      { platformId: 'holmes', name: '推荐效果归因' },
    ],
  },
  {
    project: '粉丝互动机器人',
    uses: [
      { platformId: 'aime', name: '单聊 / 群聊', category: '飞书' },
      { platformId: 'aime', name: '代发消息', category: '飞书' },
      { platformId: 'aime', name: 'AI 多媒体分析', category: '创作' },
      { platformId: 'mira', name: 'im-chat-manager', category: '效率协作' },
      { platformId: 'mirror', name: '用户标签查询' },
      { platformId: 'mirror', name: '人群圈选' },
      { platformId: 'owls', name: '舆情实时监测' },
    ],
  },
  {
    project: '塔罗小程序',
    uses: [
      { platformId: 'aime', name: '图片 / Banner 生成', category: '创作' },
      { platformId: 'mira', name: 'svg-chart-gen', category: '设计' },
      { platformId: 'mira', name: 'frontend-design', category: '设计' },
      { platformId: 'ida', name: '指标归因分析', category: '数据分析' },
      { platformId: 'live-ops', name: '直播间观众画像分析' },
      { platformId: 'gaia', name: '提交资源申请单' },
    ],
  },
  {
    project: '每日打卡小程序',
    uses: [
      { platformId: 'aime', name: '飞书任务', category: '飞书' },
      { platformId: 'aime', name: '飞书日历', category: '飞书' },
      { platformId: 'aime', name: '云文档', category: '飞书' },
      { platformId: 'mira', name: 'okrs-by-bco', category: '效率协作' },
      { platformId: 'ida', name: 'TEA 数据查询', category: '数据分析' },
      { platformId: 'hotspot-ops', name: '查询热点榜单实时数据' },
    ],
  },
  {
    project: '探店视频创作助手',
    uses: [
      { platformId: 'aime', name: '图片 / Banner 生成', category: '创作' },
      { platformId: 'aime', name: 'AI 多媒体分析', category: '创作' },
      { platformId: 'aime', name: 'PPT', category: '创作' },
      { platformId: 'ida', name: 'dau-attribution-videocut', category: '数据分析' },
      { platformId: 'ida', name: 'videocut-analysis-report', category: '数据分析' },
      { platformId: 'wenyu-ops', name: '查询明星阵地数据' },
      { platformId: 'mirror', name: '人群圈选' },
    ],
  },
]

/** Find the projects using a specific capability. A capability match
 *  requires platformId + name + category equality. */
export function projectsUsingCapability(
  platformId: string,
  name: string,
  category: string | null,
): string[] {
  const out: string[] = []
  for (const u of PROJECT_USAGE) {
    if (
      u.uses.some(
        (c) =>
          c.platformId === platformId &&
          c.name === name &&
          (c.category ?? null) === category,
      )
    ) {
      out.push(u.project)
    }
  }
  return out
}

/** Find the projects using ANY capability of a given platform — surfaces
 *  the platform's overall reach in the platform detail view. */
export function projectsUsingPlatform(platformId: string): string[] {
  const out: string[] = []
  for (const u of PROJECT_USAGE) {
    if (u.uses.some((c) => c.platformId === platformId)) {
      out.push(u.project)
    }
  }
  return out
}
