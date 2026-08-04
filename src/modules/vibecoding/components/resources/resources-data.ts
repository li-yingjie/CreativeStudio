/* ─── 资源库数据 ───
 *
 * 从 AI 平台 (ai_design) 的 mocks/resourceMockData.ts 原样搬过来（类型、
 * 筛选项、导航分组、五个子页的条目数据）。图片仍用它们原本的 CDN 地址。 */

const douyinHotCoverBg = '/assets/workshop/resources/ai_douyin_hot_bg.webp'
const douyinHotCoverIcon = '/assets/workshop/resources/ai_douyin_hot_icon.webp'
const myImageCoverBg = '/assets/workshop/resources/ai_my_image_bg.webp'
const myLiveCoverBg = '/assets/workshop/resources/ai_my_live_bg.webp'
const myVideoCoverBg = '/assets/workshop/resources/ai_my_video_bg.webp'
const quanwangCoverBg = '/assets/workshop/resources/ai_quanwang_bg.webp'
const quanwangCoverIcon = '/assets/workshop/resources/ai_quanwang_icon.webp'
const spaceBgB1 = '/assets/workshop/resources/ai_space_bg_b1.webp'
const spaceBgB2 = '/assets/workshop/resources/ai_space_bg_b2.webp'
const spaceBgB3 = '/assets/workshop/resources/ai_space_bg_b3.webp'
const spaceBgB4 = '/assets/workshop/resources/ai_space_bg_b4.webp'
const spaceBgB5 = '/assets/workshop/resources/ai_space_bg_b5.webp'
const spaceBgB6 = '/assets/workshop/resources/ai_space_bg_b6.webp'
const spaceBgB7 = '/assets/workshop/resources/ai_space_bg_b7.webp'
const spaceBgB8 = '/assets/workshop/resources/ai_space_bg_b8.webp'
const spaceBgB9 = '/assets/workshop/resources/ai_space_bg_b9.webp'
const spaceBgB10 = '/assets/workshop/resources/ai_space_bg_b10.webp'
const spaceBgB11 = '/assets/workshop/resources/ai_space_bg_b11.webp'
const spaceBgMetrics = '/assets/workshop/resources/ai_space_bg_metrics.webp'
const spaceIconBook = '/assets/workshop/resources/ai_space_icon_book.webp'
const spaceIconDoc = '/assets/workshop/resources/ai_space_icon_doc.webp'
const spaceIconTable = '/assets/workshop/resources/ai_space_icon_table.webp'
const toolboxCategoryInteractive = '/assets/workshop/resources/toolbox-icons/Interactive Components.svg'
const toolboxCategoryData = '/assets/workshop/resources/toolbox-icons/data_analysis.webp'
const toolboxCategoryDev = '/assets/workshop/resources/toolbox-icons/dev_tools.webp'
const toolboxCategoryDouyin = '/assets/workshop/resources/toolbox-icons/douyin.webp'
const toolboxCategoryContent = '/assets/workshop/resources/toolbox-icons/inspiration_design.webp'
const toolboxCategoryOpenapi = '/assets/workshop/resources/toolbox-icons/openapi.svg'
const toolboxCategorySecurity = '/assets/workshop/resources/toolbox-icons/security_audit.webp'
const toolboxCategoryOffice = '/assets/workshop/resources/toolbox-icons/work_efficiency.webp'

export type ResourceTabKey =
  | 'toolbox'
  | 'knowledge'
  | 'model'
  | 'publisher'
  | 'trigger';

export type ToolboxSectionKey = 'official' | 'space';
export type ToolboxStatus = '已发布' | '未发布';
export type KnowledgeSectionKey = 'standard' | 'douyin' | 'customize';
export type ModelGroupKey = 'official' | 'space';
export type PublisherSceneKey = 'Feed' | '评论区' | '群聊' | '私信' | 'AI聊天';
export type TriggerMethodKey = '事件触发' | '定时触发';
export type TriggerAppKey = 'AI分身' | '小程序' | 'Lark' | '自定义';
export type ToolboxNavGroupKey =
  | 'douyin'
  | 'content_creation'
  | 'data_processing'
  | 'development'
  | 'security'
  | 'office'
  | 'openapi'
  | 'open_ability_interactive';

export interface ToolboxItem {
  id: string;
  title: string;
  summary: string;
  source: '官方' | '三方';
  status: ToolboxStatus;
  isMine: boolean;
  categoryKey: string;
  category: string;
  groupKey: ToolboxNavGroupKey;
  groupLabel: string;
  section: ToolboxSectionKey;
  updatedAt: string;
  useCount: number;
  owner: string;
}

export interface ToolboxNavChild {
  key: string;
  label: string;
}

export interface ToolboxNavGroup {
  key: ToolboxNavGroupKey;
  label: string;
  accentClassName: string;
  iconUrl?: string;
  children: ToolboxNavChild[];
}

export interface ToolboxNavStats {
  plazaTotal: number;
  groupTotals: Record<ToolboxNavGroupKey, number>;
  childTotals: Record<string, number>;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  section: KnowledgeSectionKey;
  type: '文档' | '表格' | '图片' | '混合';
  isMine: boolean;
  owner: string;
  documentCount: number;
  updatedAt: string;
  accessScope?: '官方' | '抖音' | '空间';
  useCount?: number;
  coverIconText?: string;
  coverIconUrl?: string;
  coverBackgroundUrl?: string;
  coverPrompt?: string;
  visualTotal?: number;
  platform?: string;
  bizline?: string;
  key?: string;
  status?: number;
  operator?: string;
  creator?: string;
  createTime?: string;
  category?: number;
  knowledgeBaseSchema?: {
    fields: Array<{
      key: string;
      type: number;
      desc: string;
      allowEmpty: boolean | null;
      isDsl: boolean;
      index: number;
      allowOps: string[] | null;
      isDisplay: boolean;
      name: string;
      candidateSet?: string[] | null;
      candidateSetValue?: string[] | null;
      displayType?: number | null;
      secretLevel?: number | null;
      availableChannels?: number[] | null;
      isRetrieval?: boolean | null;
      isDefault?: boolean | null;
    }>;
  } | null;
  tableName?: string;
  allDocumentTags?: string[] | null;
  dataConfig?: {
    source: number;
  };
  secondCategory?: number;
  contributors?: Array<{
    identityInfo: string;
    authType: number;
  }>;
  mode?: number;
  objectId?: string;
}

export interface ModelItem {
  id: string;
  title: string;
  summary: string;
  group: ModelGroupKey;
  series?: string;
  coverLabel?: string;
  coverUrl?: string;
  scenes: string[];
  abilities: string[];
  modal: string;
  contextLength: string;
  responseLength: string;
  updatedAt: string;
  provider?: string;
  creator?: string;
  useCount?: number;
  coverPrompt?: string;
  modelSource?: '官方' | '空间' | '三方';
  modelGenType?: '文本' | '图片生成' | '视频生成';
  status?: '已上线' | '待授权';
}

export interface PublisherItem {
  id: string;
  name: string;
  description: string;
  scene: PublisherSceneKey;
  sceneLabel: PublisherSceneKey;
  genre: string;
  entry: string;
  entryLabel: string;
  coverImage: string;
  tags: string[];
  canNavigate: boolean;
  available?: boolean;
}

export interface TriggerItem {
  id: string;
  title: string;
  summary: string;
  scenes: string[];
  method: string;
  apps: string[];
  updatedAt: string;
  available: boolean;
  eventType?: string;
  coverLabel?: string;
  coverText?: string;
  coverIcon?: string;
  coverUrl?: string;
  coverBackgroundUrl?: string;
  iconUrl?: string;
  detailImageUrl?: string;
  payloadSchema?: {
    fieldParams: Array<{
      name: string;
      fieldType: string;
      paramType: string;
      desc: string;
    }>;
  };
}

export const resourceTabOptions: Array<{
  key: ResourceTabKey;
  label: string;
  path: string;
}> = [
  { key: 'toolbox', label: '工具箱', path: '/resources/toolbox' },
  { key: 'knowledge', label: '知识库', path: '/resources/knowledge' },
  { key: 'model', label: '模型库', path: '/resources/model' },
  { key: 'publisher', label: '发布器', path: '/resources/publisher' },
  { key: 'trigger', label: '触发器', path: '/resources/trigger' },
];

export const toolboxOrderOptions = [
  { label: '使用量排序', value: 'use_count' },
  { label: '更新时间排序', value: 'publish_time' },
] as const;

export const toolboxSourceOptions = [
  { label: '抖音官方', value: '官方' },
  { label: '三方提供', value: '三方' },
];

export const toolboxStatusOptions = [
  { label: '已发布', value: '已发布' },
  { label: '未发布', value: '未发布' },
];

export const knowledgeTypeOptions = [
  { label: '文件知识库', value: '文档' },
  { label: '结构化知识库', value: '表格' },
  { label: '数据知识库', value: '混合' },
];

export const modelSceneOptions = [
  '文本理解',
  '图片理解',
  '视频理解',
  '角色模拟',
];
export const modelAbilityOptions = [
  '工具调用',
  '深度思考',
  '结构化输出',
  '上下文缓存',
  'GUI任务处理',
];
export const modelModalOptions = ['文本', '图片', '视频', '音频'];
export const modelContextLengthOptions = ['32k', '128k', '256k'];
export const modelResponseLengthOptions = ['12k', '16k', '32k'];

export const publisherSceneOptions: PublisherSceneKey[] = [
  'Feed',
  '评论区',
  '群聊',
  '私信',
  'AI聊天',
];
export const publisherGenreOptions = [
  'Feed卡',
  '评论',
  '群聊消息',
  '私信消息',
  '账号头像',
];
export const publisherEntryOptions = ['小程序', 'AI分身'];

export const triggerSceneOptions = ['群聊', '评论区', '个人页', 'Lark机器人'];
export const triggerMethodOptions = ['事件触发', '定时触发'];
export const triggerAppOptions = ['AI分身', '小程序', 'Lark', '自定义'];

const TRIGGER_SCENE_MAP: Record<number, string> = {
  2: '群聊',
  3: '评论区',
  4: '个人页',
  5: 'Lark机器人',
};

const TRIGGER_APP_MAP: Record<number, string> = {
  1: 'AI分身',
  2: '小程序',
  3: 'Lark',
  4: '自定义',
};

const TRIGGER_METHOD_MAP: Record<number, string> = {
  1: '事件触发',
  2: '定时触发',
};

export const toolboxSectionMeta: Record<ToolboxSectionKey, string> = {
  official: '官方广场',
  space: '我的空间',
};

/**
 * 把秒级时间戳格式化为知识库列表使用的 yyyy-mm-dd 字符串。
 */
const formatKnowledgeDate = (value: string) => {
  const time = Number(value);
  if (!Number.isFinite(time) || time <= 0) {
    return value;
  }

  return new Date(time * 1000).toISOString().slice(0, 10);
};

const standardKnowledgeCoverInfoMap: Record<
  string,
  { coverIconUrl: string; coverBackgroundUrl: string }
> = {
  aicore_全网热点_1758526033: {
    coverIconUrl: quanwangCoverIcon,
    coverBackgroundUrl: quanwangCoverBg,
  },
  aicore_抖音热点_1758537889: {
    coverIconUrl: douyinHotCoverIcon,
    coverBackgroundUrl: douyinHotCoverBg,
  },
};

const spaceKnowledgeBases = [
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_bec8d34397249fafd89c66d23fe3c1a7_我的抖音视频作品_23d144907bcba77baf4df112aa4fe550_1770271705',
    name: '@草莓咻咻咻 的抖音视频作品',
    desc: '抖音用户公开视频作品相关的知识',
    type: 2,
    status: 0,
    operator: 'shaohanyao@bytedance.com',
    updateTime: '1770271707',
    id: '7603257789728784905',
    creator: 'shaohanyao@bytedance.com',
    createTime: '1770271707',
    indexConfigs: null,
    category: 1,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 1,
    coverInfo: {
      iconUrl: '',
      backgroundUrl: myVideoCoverBg,
    },
    contributors: [{ identityInfo: 'shaohanyao@bytedance.com', authType: 1 }],
    mode: 1,
    objectId: '2049932035110876',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_bec8d34397249fafd89c66d23fe3c1a7_我的抖音图文作品_1852b7c6f1df52b6a89532c5054ab5c4_1770271705',
    name: '@草莓咻咻咻 的抖音图文作品',
    desc: '抖音用户公开图文作品相关的知识',
    type: 2,
    status: 0,
    operator: 'shaohanyao@bytedance.com',
    updateTime: '1770271742',
    id: '7603257789728719369',
    creator: 'shaohanyao@bytedance.com',
    createTime: '1770271706',
    indexConfigs: null,
    category: 1,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 2,
    coverInfo: {
      iconUrl: '',
      backgroundUrl: myImageCoverBg,
    },
    contributors: [
      { identityInfo: 'liusuyao.susu@bytedance.com', authType: 4 },
      { identityInfo: 'shaohanyao@bytedance.com', authType: 1 },
    ],
    mode: 1,
    objectId: '2049932035110876',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_bec8d34397249fafd89c66d23fe3c1a7_我的抖音直播回放_b67eee0e7cc9bcaf7afecc151a615b34_1770271705',
    name: '@草莓咻咻咻 的抖音直播回放',
    desc: '抖音用户直播回放相关的知识',
    type: 2,
    status: 0,
    operator: 'shaohanyao@bytedance.com',
    updateTime: '1781107203',
    id: '7603254390534832686',
    creator: 'shaohanyao@bytedance.com',
    createTime: '1770271706',
    indexConfigs: null,
    category: 1,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 3,
    coverInfo: {
      iconUrl: '',
      backgroundUrl: myLiveCoverBg,
    },
    contributors: [{ identityInfo: 'shaohanyao@bytedance.com', authType: 1 }],
    mode: 1,
    objectId: '2049932035110876',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_系统/业务metrics相关知识_1779032193',
    name: '系统/业务metrics相关知识',
    desc: '该知识库可以用于查询当前用户需要查询的metrics指标以及相关查询参数',
    type: 2,
    status: 0,
    operator: 'wangzhiyuan.0814@bytedance.com',
    updateTime: '1779276651',
    id: '7640862786809004559',
    creator: 'wangzhiyuan.0814@bytedance.com',
    createTime: '1779032194',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '1',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconBook,
      backgroundUrl: spaceBgMetrics,
    },
    contributors: [
      { identityInfo: 'wangzhiyuan.0814@bytedance.com', authType: 1 },
    ],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_111_1778212852',
    name: '111',
    desc: '222',
    type: 3,
    status: 0,
    operator: 'hexudan@bytedance.com',
    updateTime: '1778212853',
    id: '7637356528458138122',
    creator: 'hexudan@bytedance.com',
    createTime: '1778212853',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: 'open_ai_data_sync.aeolus_super_market_demo',
    allDocumentTags: null,
    useCount: '0',
    dataConfig: { source: 0 },
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconTable,
      backgroundUrl: spaceBgB1,
    },
    contributors: [{ identityInfo: 'hexudan@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_粉丝地方_1778212685',
    name: '粉丝地方',
    desc: '多少啊',
    type: 3,
    status: 0,
    operator: 'nyl@bytedance.com',
    updateTime: '1778212685',
    id: '7637355515089125926',
    creator: 'nyl@bytedance.com',
    createTime: '1778212685',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: 'dm_ai_knowl_user_try_df',
    allDocumentTags: null,
    useCount: '0',
    dataConfig: { source: 0 },
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconTable,
      backgroundUrl: spaceBgB2,
    },
    contributors: [{ identityInfo: 'nyl@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_2222_1778212509',
    name: '2222',
    desc: '22222',
    type: 3,
    status: 0,
    operator: 'hexudan@bytedance.com',
    updateTime: '1778212511',
    id: '7637355515089076774',
    creator: 'hexudan@bytedance.com',
    createTime: '1778212511',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: 'open_ai_data_upload.knowledgedata_1778212494637',
    allDocumentTags: null,
    useCount: '0',
    dataConfig: { source: 1 },
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconTable,
      backgroundUrl: spaceBgB3,
    },
    contributors: [{ identityInfo: 'hexudan@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_222_1778211471',
    name: '222',
    desc: '22222',
    type: 2,
    status: 0,
    operator: 'hexudan@bytedance.com',
    updateTime: '1778211472',
    id: '7637347784378663450',
    creator: 'hexudan@bytedance.com',
    createTime: '1778211472',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconBook,
      backgroundUrl: spaceBgB3,
    },
    contributors: [{ identityInfo: 'hexudan@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_2222_1778211418',
    name: '2222',
    desc: '3333',
    type: 1,
    status: 0,
    operator: 'hexudan@bytedance.com',
    updateTime: '1778211428',
    id: '7637356528458023434',
    creator: 'hexudan@bytedance.com',
    createTime: '1778211418',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB4,
    },
    contributors: [{ identityInfo: 'hexudan@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_1111_1778210667',
    name: '1111',
    desc: '1111',
    type: 3,
    status: 0,
    operator: 'hexudan@bytedance.com',
    updateTime: '1778210667',
    id: '7637347784378565146',
    creator: 'hexudan@bytedance.com',
    createTime: '1778210667',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: 'open_ai_data_sync.aeolus_super_market_demo',
    allDocumentTags: null,
    useCount: '0',
    dataConfig: { source: 0 },
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconTable,
      backgroundUrl: spaceBgB3,
    },
    contributors: [{ identityInfo: 'hexudan@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_111_1778210514',
    name: '111',
    desc: '111',
    type: 1,
    status: 0,
    operator: 'hexudan@bytedance.com',
    updateTime: '1778210536',
    id: '7637342630443041330',
    creator: 'hexudan@bytedance.com',
    createTime: '1778210514',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB5,
    },
    contributors: [{ identityInfo: 'hexudan@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_测试2_1778161940',
    name: '测试2',
    desc: '测试2',
    type: 1,
    status: 0,
    operator: 'wangxing.qs@bytedance.com',
    updateTime: '1778161952',
    id: '7637136472650433070',
    creator: 'wangxing.qs@bytedance.com',
    createTime: '1778161940',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB6,
    },
    contributors: [{ identityInfo: 'wangxing.qs@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_测试1_1778161877',
    name: '测试1',
    desc: '测试1',
    type: 2,
    status: 0,
    operator: 'wangxing.qs@bytedance.com',
    updateTime: '1778161878',
    id: '7637102971272118784',
    creator: 'wangxing.qs@bytedance.com',
    createTime: '1778161878',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconBook,
      backgroundUrl: spaceBgB7,
    },
    contributors: [{ identityInfo: 'wangxing.qs@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_111_1778146762',
    name: '111',
    desc: '111',
    type: 2,
    status: 0,
    operator: 'hexudan@bytedance.com',
    updateTime: '1778146762',
    id: '7637073359699739174',
    creator: 'hexudan@bytedance.com',
    createTime: '1778146762',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '0',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconBook,
      backgroundUrl: spaceBgB8,
    },
    contributors: [{ identityInfo: 'hexudan@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_数据库表信息_1777539207',
    name: '数据库表信息',
    desc: '数据库表信息',
    type: 1,
    status: 0,
    operator: 'wangzhiyuan.0814@bytedance.com',
    updateTime: '1778407525',
    id: '7634451259130446355',
    creator: 'wangzhiyuan.0814@bytedance.com',
    createTime: '1777539208',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '2',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB3,
    },
    contributors: [
      { identityInfo: 'wangzhiyuan.0814@bytedance.com', authType: 1 },
    ],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_问答纠正记录_未命名_1777466019',
    name: '问答纠正记录_未命名',
    desc: '智能体将优先参考问答纠正记录来生成回答，本知识库首次创建时将自动添加到智能体',
    type: 2,
    status: 0,
    operator: 'wangzihao.1023',
    updateTime: '1778829070',
    id: '7634143709293969983',
    creator: 'wangzihao.1023@bytedance.com',
    createTime: '1777466019',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '1',
    dataConfig: null,
    secondCategory: 4,
    coverInfo: {
      iconUrl: spaceIconBook,
      backgroundUrl: spaceBgB4,
    },
    contributors: [
      { identityInfo: 'wangzihao.1023@bytedance.com', authType: 1 },
    ],
    mode: 0,
    objectId: 'app_7625992325168171782',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_问答纠正记录_test_0426_1777194049',
    name: '问答纠正记录_test_0426',
    desc: '智能体将优先参考问答纠正记录来生成回答，本知识库首次创建时将自动添加到智能体',
    type: 2,
    status: 0,
    operator: 'wangmiao.wfzh',
    updateTime: '1777200283',
    id: '7632980461630898734',
    creator: 'wangmiao.wfzh@bytedance.com',
    createTime: '1777194050',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '1',
    dataConfig: null,
    secondCategory: 4,
    coverInfo: {
      iconUrl: spaceIconBook,
      backgroundUrl: spaceBgB11,
    },
    contributors: [
      { identityInfo: 'wangmiao.wfzh@bytedance.com', authType: 1 },
    ],
    mode: 0,
    objectId: 'app_7609302783780293385',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_结算运营平台_1776839316',
    name: '结算运营平台',
    desc: '结算运营平台-业务知识库',
    type: 2,
    status: 0,
    operator: 'yanqiming@bytedance.com',
    updateTime: '1778752100',
    id: '7631456964869882383',
    creator: 'yanqiming@bytedance.com',
    createTime: '1776839316',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '10',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconBook,
      backgroundUrl: spaceBgB9,
    },
    contributors: [
      { identityInfo: 'jiamengchan.16@bytedance.com', authType: 2 },
      { identityInfo: 'yanqiming@bytedance.com', authType: 1 },
    ],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_国风2d训练素材预处理_1776332912',
    name: '国风2d训练素材预处理',
    desc: '用于国风素材去文字、超分批量处理',
    type: 1,
    status: 0,
    operator: 'mayunqi.2025@bytedance.com',
    updateTime: '1776332912',
    id: '7629286465993753124',
    creator: 'mayunqi.2025@bytedance.com',
    createTime: '1776332912',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '4',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB10,
    },
    contributors: [{ identityInfo: 'mayunqi.2025@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_抖音小红书画风_1775042484',
    name: '抖音小红书画风',
    desc: '抖音小红书画风',
    type: 1,
    status: 0,
    operator: 'wangluchen.257@bytedance.com',
    updateTime: '1775200440',
    id: '7623739419828257318',
    creator: 'wangluchen.257@bytedance.com',
    createTime: '1775042484',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '38',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB1,
    },
    contributors: [
      { identityInfo: 'wangluchen.257@bytedance.com', authType: 1 },
    ],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_抖音AI平台社群小助手知识库-文本_1774958207',
    name: '抖音AI平台社群小助手知识库-文本',
    desc: '仅检索文本的知识库',
    type: 1,
    status: 0,
    operator: 'songqi.1008@bytedance.com',
    updateTime: '1774958242',
    id: '7623372820176781830',
    creator: 'songqi.1008@bytedance.com',
    createTime: '1774958207',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '22',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB11,
    },
    contributors: [{ identityInfo: 'songqi.1008@bytedance.com', authType: 1 }],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_抖小内容类型 case_1774871711',
    name: '抖小内容类型 case',
    desc: '抖小内容类型 case',
    type: 1,
    status: 0,
    operator: 'wangluchen.257@bytedance.com',
    updateTime: '1774882114',
    id: '7623009632168034854',
    creator: 'wangluchen.257@bytedance.com',
    createTime: '1774871712',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '6',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB4,
    },
    contributors: [
      { identityInfo: 'wangluchen.257@bytedance.com', authType: 1 },
    ],
    mode: 0,
    objectId: '',
  },
  {
    platform: 'aicore',
    bizline: 'douyin_frontier_lab',
    key: 'aicore_douyin_frontier_lab_抖小质量标签 case_1774871458',
    name: '抖小质量标签 case',
    desc: '抖小质量标签 case',
    type: 1,
    status: 0,
    operator: 'wangluchen.257@bytedance.com',
    updateTime: '1774882162',
    id: '7623009567055626803',
    creator: 'wangluchen.257@bytedance.com',
    createTime: '1774871459',
    indexConfigs: null,
    category: 0,
    knowledgeBaseSchema: null,
    tableName: null,
    allDocumentTags: null,
    useCount: '3',
    dataConfig: null,
    secondCategory: 0,
    coverInfo: {
      iconUrl: spaceIconDoc,
      backgroundUrl: spaceBgB3,
    },
    contributors: [
      { identityInfo: 'wangluchen.257@bytedance.com', authType: 1 },
    ],
    mode: 0,
    objectId: '',
  },
] as const;

const spaceKnowledgeCoverConfigs = [
  {
    name: '@草莓咻咻咻 的抖音视频作品',
    key: 'aicore_douyin_frontier_lab_bec8d34397249fafd89c66d23fe3c1a7_我的抖音视频作品_23d144907bcba77baf4df112aa4fe550_1770271705',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: myVideoCoverBg,
  },
  {
    name: '@草莓咻咻咻 的抖音图文作品',
    key: 'aicore_douyin_frontier_lab_bec8d34397249fafd89c66d23fe3c1a7_我的抖音图文作品_1852b7c6f1df52b6a89532c5054ab5c4_1770271705',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: myImageCoverBg,
  },
  {
    name: '@草莓咻咻咻 的抖音直播回放',
    key: 'aicore_douyin_frontier_lab_bec8d34397249fafd89c66d23fe3c1a7_我的抖音直播回放_b67eee0e7cc9bcaf7afecc151a615b34_1770271705',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: myLiveCoverBg,
  },
  {
    name: '系统/业务metrics相关知识',
    key: 'aicore_douyin_frontier_lab_系统/业务metrics相关知识_1779032193',
    coverIconUrl: spaceIconBook,
    coverBackgroundUrl: spaceBgMetrics,
  },
  {
    name: '111',
    key: 'aicore_douyin_frontier_lab_111_1778212852',
    coverIconUrl: spaceIconTable,
    coverBackgroundUrl: spaceBgB1,
  },
  {
    name: '粉丝地方',
    key: 'aicore_douyin_frontier_lab_粉丝地方_1778212685',
    coverIconUrl: spaceIconTable,
    coverBackgroundUrl: spaceBgB2,
  },
  {
    name: '2222',
    key: 'aicore_douyin_frontier_lab_2222_1778212509',
    coverIconUrl: spaceIconTable,
    coverBackgroundUrl: spaceBgB3,
  },
  {
    name: '222',
    key: 'aicore_douyin_frontier_lab_222_1778211471',
    coverIconUrl: spaceIconBook,
    coverBackgroundUrl: spaceBgB3,
  },
  {
    name: '2222',
    key: 'aicore_douyin_frontier_lab_2222_1778211418',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB4,
  },
  {
    name: '1111',
    key: 'aicore_douyin_frontier_lab_1111_1778210667',
    coverIconUrl: spaceIconTable,
    coverBackgroundUrl: spaceBgB3,
  },
  {
    name: '111',
    key: 'aicore_douyin_frontier_lab_111_1778210514',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB5,
  },
  {
    name: '测试2',
    key: 'aicore_douyin_frontier_lab_测试2_1778161940',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB6,
  },
  {
    name: '测试1',
    key: 'aicore_douyin_frontier_lab_测试1_1778161877',
    coverIconUrl: spaceIconBook,
    coverBackgroundUrl: spaceBgB7,
  },
  {
    name: '111',
    key: 'aicore_douyin_frontier_lab_111_1778146762',
    coverIconUrl: spaceIconBook,
    coverBackgroundUrl: spaceBgB8,
  },
  {
    name: '数据库表信息',
    key: 'aicore_douyin_frontier_lab_数据库表信息_1777539207',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB3,
  },
  {
    name: '问答纠正记录_未命名',
    key: 'aicore_douyin_frontier_lab_问答纠正记录_未命名_1777466019',
    coverIconUrl: spaceIconBook,
    coverBackgroundUrl: spaceBgB4,
  },
  {
    name: '问答纠正记录_test_0426',
    key: 'aicore_douyin_frontier_lab_问答纠正记录_test_0426_1777194049',
    coverIconUrl: spaceIconBook,
    coverBackgroundUrl: spaceBgB11,
  },
  {
    name: '结算运营平台',
    key: 'aicore_douyin_frontier_lab_结算运营平台_1776839316',
    coverIconUrl: spaceIconBook,
    coverBackgroundUrl: spaceBgB9,
  },
  {
    name: '国风2d训练素材预处理',
    key: 'aicore_douyin_frontier_lab_国风2d训练素材预处理_1776332912',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB10,
  },
  {
    name: '抖音小红书画风',
    key: 'aicore_douyin_frontier_lab_抖音小红书画风_1775042484',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB1,
  },
  {
    name: '抖音AI平台社群小助手知识库-文本',
    key: 'aicore_douyin_frontier_lab_抖音AI平台社群小助手知识库-文本_1774958207',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB11,
  },
  {
    name: '抖小内容类型 case',
    key: 'aicore_douyin_frontier_lab_抖小内容类型 case_1774871711',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB4,
  },
  {
    name: '抖小质量标签 case',
    key: 'aicore_douyin_frontier_lab_抖小质量标签 case_1774871458',
    coverIconUrl: spaceIconDoc,
    coverBackgroundUrl: spaceBgB3,
  },
] as const;

/**
 * 从邮箱或身份信息中提取空间知识库卡片展示用的 owner。
 */
const getKnowledgeOwnerName = (identityInfo?: string) => {
  if (!identityInfo) {
    return '未知';
  }

  return identityInfo.split('@')[0] || identityInfo;
};

/**
 * 从空间知识库 key 中提取秒级时间戳，作为轻量 mock 的更新时间兜底。
 */
const getKnowledgeTimestampFromKey = (key: string) => {
  const match = key.match(/_(\d{10})$/);
  return match?.[1];
};

const spaceKnowledgeBaseDetailMap = Object.fromEntries(
  spaceKnowledgeBases.map(item => [item.key, item]),
) as Record<string, (typeof spaceKnowledgeBases)[number]>;
type KnowledgeSchemaInput =
  | {
      fields: ReadonlyArray<{
        key: string;
        type: number;
        desc: string;
        allowEmpty: boolean | null;
        isDsl: boolean;
        index: number;
        allowOps: readonly string[] | null;
        isDisplay: boolean;
        name: string;
        candidateSet?: readonly string[] | null;
        candidateSetValue?: readonly string[] | null;
        displayType?: number | null;
        secretLevel?: number | null;
        availableChannels?: readonly number[] | null;
        isRetrieval?: boolean | null;
        isDefault?: boolean | null;
      }>;
    }
  | null
  | undefined;
type ContributorInput =
  | ReadonlyArray<NonNullable<KnowledgeItem['contributors']>[number]>
  | undefined;

/**
 * 把只读 schema 转成页面侧可消费的可写结构，避免 mock 常量的 readonly 限制。
 */
const cloneKnowledgeSchema = (schema?: KnowledgeSchemaInput) =>
  schema
    ? {
        fields: schema.fields.map(field => ({
          ...field,
          allowOps: field.allowOps ? [...field.allowOps] : null,
          candidateSet: field.candidateSet ? [...field.candidateSet] : null,
          candidateSetValue: field.candidateSetValue
            ? [...field.candidateSetValue]
            : null,
          availableChannels: field.availableChannels
            ? [...field.availableChannels]
            : null,
        })),
      }
    : null;

/**
 * 把只读协作者数组转成页面侧可消费的可写结构。
 */
const cloneContributors = (contributors?: ContributorInput) =>
  contributors ? contributors.map(item => ({ ...item })) : undefined;

/**
 * 把空间知识库配置和已有原始详情合并为当前页面消费的 KnowledgeItem。
 */
const mapSpaceKnowledgeItem = (
  item: (typeof spaceKnowledgeCoverConfigs)[number],
  index: number,
): KnowledgeItem => {
  const detail = spaceKnowledgeBaseDetailMap[item.key];
  const updatedAt =
    detail?.updateTime ||
    getKnowledgeTimestampFromKey(item.key) ||
    '1779871802';
  // 「我的抖音视频/图文/直播回放」类卡片归入抖音知识库 Tab，其余仍属于自定义空间。
  const isDouyinUserKnowledge = /我的抖音(视频|图文|直播)/.test(item.key);
  const section: KnowledgeSectionKey = isDouyinUserKnowledge
    ? 'douyin'
    : 'customize';
  const accessScope: KnowledgeItem['accessScope'] = isDouyinUserKnowledge
    ? '抖音'
    : '空间';

  return {
    id: detail?.id ?? item.key,
    title: item.name,
    summary: detail?.desc ?? item.name,
    section,
    type: '混合',
    isMine: !!detail,
    owner: getKnowledgeOwnerName(detail?.creator),
    documentCount:
      (detail?.knowledgeBaseSchema as KnowledgeSchemaInput)?.fields.length ?? 0,
    updatedAt: formatKnowledgeDate(updatedAt),
    accessScope,
    useCount: detail ? Number(detail.useCount ?? 0) : 0,
    coverIconText: '▮',
    coverIconUrl: item.coverIconUrl,
    coverBackgroundUrl: item.coverBackgroundUrl,
    visualTotal: index === 0 ? 2394 : undefined,
    platform: detail?.platform ?? 'aicore',
    bizline: detail?.bizline ?? 'aicore_internal',
    key: item.key,
    status: detail?.status ?? 0,
    operator: detail?.operator,
    creator: detail?.creator,
    createTime: detail?.createTime,
    category: detail?.category ?? 0,
    knowledgeBaseSchema: cloneKnowledgeSchema(detail?.knowledgeBaseSchema),
    tableName: detail?.tableName ?? undefined,
    allDocumentTags: detail?.allDocumentTags
      ? [...detail.allDocumentTags]
      : null,
    dataConfig: detail?.dataConfig ?? undefined,
    secondCategory: detail?.secondCategory,
    contributors: cloneContributors(detail?.contributors),
    mode: detail?.mode,
    objectId: detail?.objectId,
  };
};

export const toolboxNavGroups: ToolboxNavGroup[] = [
  {
    key: 'douyin',
    label: '抖音',
    accentClassName: 'bg-[var(--semi-color-text-0)]',
    iconUrl: toolboxCategoryDouyin,
    children: [
      { key: 'douyin_feed', label: '抖音Feed' },
      { key: 'douyin_comment', label: '抖音评论' },
      { key: 'douyin_group_chat', label: '抖音群聊' },
      { key: 'douyin_search', label: '抖音搜索' },
      { key: 'douyin_hotspot', label: '抖音热点' },
      { key: 'video_content', label: '视频内容' },
      { key: 'live_content', label: '直播内容' },
      { key: 'account_info', label: '账号信息' },
      { key: 'public_opinion', label: '舆情监控' },
      { key: 'interactive_widget', label: '互动组件' },
      { key: 'governance_review', label: '治理与审核' },
      { key: 'customer_service', label: '客服能力' },
    ],
  },
  {
    key: 'content_creation',
    label: '内容创作',
    accentClassName: 'bg-[var(--semi-color-primary)]',
    iconUrl: toolboxCategoryContent,
    children: [
      { key: 'content_generate', label: '内容生成' },
      { key: 'copy_optimize', label: '文本处理' },
      { key: 'image_edit', label: '图片编辑' },
      { key: 'video_make', label: '视频制作' },
    ],
  },
  {
    key: 'data_processing',
    label: '数据分析和处理',
    accentClassName: 'bg-[var(--semi-color-info)]',
    iconUrl: toolboxCategoryData,
    children: [
      { key: 'libra', label: 'Libra' },
      { key: 'aeolus', label: 'Aeolus' },
      { key: 'data_analysis', label: '数据分析' },
      { key: 'data_process', label: '数据处理' },
    ],
  },
  {
    key: 'development',
    label: '开发工具',
    accentClassName: 'bg-[var(--semi-color-success)]',
    iconUrl: toolboxCategoryDev,
    children: [
      { key: 'coding', label: '代码编写' },
      { key: 'engineering_auto', label: '工程自动化' },
      { key: 'teamwork', label: '集成协作' },
    ],
  },
  {
    key: 'security',
    label: '安全审核',
    accentClassName: 'bg-[var(--semi-color-warning)]',
    iconUrl: toolboxCategorySecurity,
    children: [
      { key: 'monitor', label: '监控' },
      { key: 'security', label: '安全' },
      { key: 'security_review', label: '审核' },
    ],
  },
  {
    key: 'office',
    label: '办公效率',
    accentClassName: 'bg-[var(--semi-color-tertiary)]',
    iconUrl: toolboxCategoryOffice,
    children: [
      { key: 'collaboration', label: '协作办公' },
      { key: 'search', label: '全网检索' },
      { key: 'convenience', label: '便民服务' },
    ],
  },
];

export const openAbilityNavGroups: ToolboxNavGroup[] = [
  {
    key: 'openapi',
    label: 'OpenAPI',
    accentClassName: 'bg-[var(--semi-color-primary)]',
    iconUrl: toolboxCategoryOpenapi,
    children: [
      { key: 'openapi_api_manage', label: '接口管理' },
      { key: 'openapi_auth', label: '授权鉴权' },
      { key: 'openapi_data_service', label: '数据服务' },
      { key: 'openapi_message_push', label: '消息推送' },
      { key: 'openapi_debug_tool', label: '调试工具' },
    ],
  },
  {
    key: 'open_ability_interactive',
    label: '互动组件',
    accentClassName: 'bg-[var(--semi-color-primary)]',
    iconUrl: toolboxCategoryInteractive,
    children: [
      { key: 'open_ability_form', label: '表单组件' },
      { key: 'open_ability_card', label: '卡片组件' },
      { key: 'open_ability_picker', label: '选择组件' },
      { key: 'open_ability_media', label: '媒体组件' },
      { key: 'open_ability_action', label: '动作组件' },
    ],
  },
];

export const toolboxNavStats: ToolboxNavStats = {
  plazaTotal: 3847,
  groupTotals: {
    douyin: 3347,
    content_creation: 25,
    data_processing: 220,
    development: 17,
    security: 36,
    office: 38,
    openapi: 16,
    open_ability_interactive: 16,
  },
  childTotals: {
    openapi_api_manage: 4,
    openapi_auth: 4,
    openapi_data_service: 4,
    openapi_message_push: 2,
    openapi_debug_tool: 2,
    open_ability_form: 4,
    open_ability_card: 4,
    open_ability_picker: 4,
    open_ability_media: 2,
    open_ability_action: 2,
    douyin_feed: 1,
    douyin_comment: 47,
    douyin_group_chat: 125,
    douyin_search: 25,
    douyin_hotspot: 71,
    video_content: 201,
    live_content: 304,
    account_info: 1127,
    public_opinion: 2,
    interactive_widget: 35,
    governance_review: 452,
    customer_service: 957,
    content_generate: 7,
    copy_optimize: 6,
    image_edit: 3,
    video_make: 9,
    libra: 18,
    aeolus: 1,
    data_analysis: 24,
    data_process: 177,
    coding: 14,
    engineering_auto: 1,
    teamwork: 2,
    monitor: 2,
    security: 20,
    security_review: 14,
    collaboration: 13,
    search: 2,
    convenience: 13,
  },
};

export const knowledgeSectionMeta: Record<KnowledgeSectionKey, string> = {
  standard: '标准知识库',
  douyin: '抖音知识库',
  customize: '自定义知识库',
};

export const modelGroupMeta: Record<ModelGroupKey, string> = {
  official: '官方模型',
  space: '空间模型',
};

export const toolboxItems: ToolboxItem[] = [
  {
    id: 'tool_1',
    title: '文案灵感工坊',
    summary: '输入主题后快速生成标题、卖点和发布文案。',
    source: '官方',
    status: '已发布',
    isMine: false,
    categoryKey: 'content_generate',
    category: '内容生成',
    groupKey: 'content_creation',
    groupLabel: '内容创作',
    section: 'official',
    updatedAt: '2026-05-28',
    useCount: 18234,
    owner: '抖音AI团队',
  },
  {
    id: 'tool_2',
    title: '图片扩写助手',
    summary: '根据一句描述批量生成适合图生图的高质量提示词。',
    source: '官方',
    status: '已发布',
    isMine: false,
    categoryKey: 'image_edit',
    category: '图片编辑',
    groupKey: 'content_creation',
    groupLabel: '内容创作',
    section: 'official',
    updatedAt: '2026-05-30',
    useCount: 15220,
    owner: '视觉算法组',
  },
  {
    id: 'tool_3',
    title: '素材标签整理',
    summary: '自动识别图片和视频素材标签，适合内容资产沉淀。',
    source: '三方',
    status: '未发布',
    isMine: true,
    categoryKey: 'data_process',
    category: '数据处理',
    groupKey: 'data_processing',
    groupLabel: '数据分析和处理',
    section: 'space',
    updatedAt: '2026-05-24',
    useCount: 623,
    owner: '黄雪炎',
  },
  {
    id: 'tool_4',
    title: '评论质检流程',
    summary: '按规则扫描评论区高风险内容并生成复核清单。',
    source: '官方',
    status: '已发布',
    isMine: false,
    categoryKey: 'security_review',
    category: '审核',
    groupKey: 'security',
    groupLabel: '安全审核',
    section: 'official',
    updatedAt: '2026-05-26',
    useCount: 9842,
    owner: '安全平台',
  },
  {
    id: 'tool_8',
    title: '监控能力看板',
    summary: '用于查看高风险内容命中趋势、告警概览和处置进度。',
    source: '官方',
    status: '已发布',
    isMine: false,
    categoryKey: 'monitor',
    category: '监控',
    groupKey: 'security',
    groupLabel: '安全审核',
    section: 'official',
    updatedAt: '2026-05-27',
    useCount: 12654,
    owner: '安全中台',
  },
  {
    id: 'tool_9',
    title: '安全能力大盘',
    summary: '统一查看账号、评论和投稿链路的安全诊断与风险分层。',
    source: '官方',
    status: '已发布',
    isMine: false,
    categoryKey: 'security',
    category: '安全',
    groupKey: 'security',
    groupLabel: '安全审核',
    section: 'official',
    updatedAt: '2026-05-29',
    useCount: 15321,
    owner: '安全平台',
  },
  {
    id: 'tool_10',
    title: '投稿风控体检',
    summary: '识别投稿内容中的潜在风险点，并输出分级处置建议。',
    source: '官方',
    status: '已发布',
    isMine: false,
    categoryKey: 'security',
    category: '安全',
    groupKey: 'security',
    groupLabel: '安全审核',
    section: 'official',
    updatedAt: '2026-05-30',
    useCount: 11892,
    owner: '安全平台',
  },
  {
    id: 'tool_11',
    title: '评论审核助手',
    summary: '按规则扫描评论文本并生成审核建议，辅助运营快速复核。',
    source: '官方',
    status: '已发布',
    isMine: false,
    categoryKey: 'security_review',
    category: '审核',
    groupKey: 'security',
    groupLabel: '安全审核',
    section: 'official',
    updatedAt: '2026-05-28',
    useCount: 10243,
    owner: '安全平台',
  },
  {
    id: 'tool_5',
    title: '直播脚本润色',
    summary: '对直播脚本做节奏优化和口语化改写。',
    source: '三方',
    status: '已发布',
    isMine: true,
    categoryKey: 'douyin_feed',
    category: '抖音Feed',
    groupKey: 'douyin',
    groupLabel: '抖音',
    section: 'space',
    updatedAt: '2026-05-29',
    useCount: 1534,
    owner: '黄雪炎',
  },
  {
    id: 'tool_6',
    title: '智能封面评分',
    summary: '对封面图吸引力进行评分并给出改进建议。',
    source: '官方',
    status: '已发布',
    isMine: false,
    categoryKey: 'image_edit',
    category: '图片编辑',
    groupKey: 'content_creation',
    groupLabel: '内容创作',
    section: 'official',
    updatedAt: '2026-05-18',
    useCount: 7211,
    owner: '增长设计组',
  },
  {
    id: 'tool_7',
    title: '日报生成器',
    summary: '读取项目进展摘要后自动产出日报和周报模版。',
    source: '三方',
    status: '未发布',
    isMine: true,
    categoryKey: 'engineering_auto',
    category: '工程自动化',
    groupKey: 'development',
    groupLabel: '开发工具',
    section: 'space',
    updatedAt: '2026-05-31',
    useCount: 403,
    owner: '黄雪炎',
  },
];

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'kb_10',
    title: '全网热点',
    summary: '提供微博热搜、快手热榜、小红书热点等趋势数据。',
    section: 'standard',
    type: '混合',
    isMine: false,
    owner: '热点平台',
    documentCount: 797,
    updatedAt: '2026-05-27',
    accessScope: '官方',
    useCount: 797,
    key: 'aicore_全网热点_1758526033',
    coverIconText: '●',
    coverIconUrl:
      standardKnowledgeCoverInfoMap.aicore_全网热点_1758526033.coverIconUrl,
    coverBackgroundUrl:
      standardKnowledgeCoverInfoMap.aicore_全网热点_1758526033
        .coverBackgroundUrl,
    coverPrompt:
      'orange abstract light flare and diagonal shadows, realistic website card cover, no text',
  },
  {
    id: 'kb_11',
    title: '抖音热点',
    summary: '提供抖音热榜、抖音上升榜的热点事件数据。',
    section: 'standard',
    type: '混合',
    isMine: false,
    owner: '热点平台',
    documentCount: 783,
    updatedAt: '2026-05-27',
    accessScope: '官方',
    useCount: 783,
    key: 'aicore_抖音热点_1758537889',
    coverIconText: '♪',
    coverIconUrl:
      standardKnowledgeCoverInfoMap.aicore_抖音热点_1758537889.coverIconUrl,
    coverBackgroundUrl:
      standardKnowledgeCoverInfoMap.aicore_抖音热点_1758537889
        .coverBackgroundUrl,
    coverPrompt:
      'silhouette holding sparkler in dark warm light, realistic website card cover, no text',
  },
  ...spaceKnowledgeCoverConfigs.map(mapSpaceKnowledgeItem),
];

export const modelItems: ModelItem[] = [
  {
    id: 'model_1',
    title: 'Doubao-Seed-1.6-pro',
    summary: '面向复杂推理、工具调用和长文本编排的旗舰通识模型。',
    group: 'official',
    series: 'doubao',
    scenes: ['文本理解', '图片理解'],
    abilities: ['工具调用', '深度思考', '结构化输出'],
    modal: '文本',
    contextLength: '256k',
    responseLength: '32k',
    updatedAt: '2026-06-02',
    provider: '字节模型平台',
    useCount: 18260,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_2',
    title: 'DeepSeek-R1',
    summary: '推理能力突出，适合数学、代码和复杂逻辑分析场景。',
    group: 'official',
    series: 'deepseek',
    scenes: ['文本理解'],
    abilities: ['深度思考', '结构化输出'],
    modal: '文本',
    contextLength: '128k',
    responseLength: '16k',
    updatedAt: '2026-05-30',
    provider: '字节模型平台',
    useCount: 12840,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_3',
    title: 'Kimi-K2',
    summary: '超长上下文理解稳定，长文档问答和信息整理能力突出。',
    group: 'official',
    series: 'yuezhianmian',
    scenes: ['文本理解'],
    abilities: ['上下文缓存', '结构化输出'],
    modal: '文本',
    contextLength: '256k',
    responseLength: '16k',
    updatedAt: '2026-05-29',
    provider: '字节模型平台',
    useCount: 6240,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_4',
    title: 'GPT-4.1',
    summary: '多任务理解与生成能力成熟，适合高质量复杂任务处理。',
    group: 'official',
    series: 'gpt',
    scenes: ['文本理解', '角色模拟'],
    abilities: ['工具调用', '结构化输出'],
    modal: '文本',
    contextLength: '128k',
    responseLength: '16k',
    updatedAt: '2026-05-31',
    provider: 'OpenAI 接入',
    useCount: 5930,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_5',
    title: 'Gemini 2.5 Pro',
    summary: '原生多模态融合，长上下文理解和复杂分析表现稳定。',
    group: 'official',
    series: 'gemini',
    scenes: ['文本理解', '图片理解', '视频理解'],
    abilities: ['深度思考', '结构化输出'],
    modal: '文本',
    contextLength: '256k',
    responseLength: '32k',
    updatedAt: '2026-05-31',
    provider: 'Google 接入',
    useCount: 4870,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_6',
    title: 'Claude 3.7 Sonnet',
    summary: '长文本理解和审阅能力优异，适合复杂知识处理。',
    group: 'official',
    series: 'claude',
    scenes: ['文本理解'],
    abilities: ['深度思考', '上下文缓存'],
    modal: '文本',
    contextLength: '256k',
    responseLength: '32k',
    updatedAt: '2026-05-28',
    provider: 'Anthropic 接入',
    useCount: 3960,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_7',
    title: 'GLM-4.5',
    summary: '国产自研基座，中文理解和 Agent 工具链适配稳定。',
    group: 'official',
    series: 'zhipu',
    scenes: ['文本理解', '角色模拟'],
    abilities: ['工具调用', '结构化输出'],
    modal: '文本',
    contextLength: '128k',
    responseLength: '16k',
    updatedAt: '2026-05-27',
    provider: '智谱接入',
    useCount: 3520,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_8',
    title: 'MiniMax-M1',
    summary: '多模态协同与智能体交互均衡，适合复杂协作任务。',
    group: 'official',
    series: 'minimax',
    scenes: ['文本理解', '图片理解'],
    abilities: ['工具调用', '深度思考'],
    modal: '文本',
    contextLength: '128k',
    responseLength: '16k',
    updatedAt: '2026-05-27',
    provider: 'MiniMax 接入',
    useCount: 3380,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_9',
    title: 'Qwen3-32B',
    summary: '工具链稳定、场景适配广泛，适合业务落地与插件编排。',
    group: 'official',
    series: 'qianwen',
    scenes: ['文本理解'],
    abilities: ['工具调用', '结构化输出'],
    modal: '文本',
    contextLength: '128k',
    responseLength: '16k',
    updatedAt: '2026-05-20',
    provider: '阿里云接入',
    useCount: 3110,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_10',
    title: 'Step-2',
    summary: '推理与生成兼顾，适合复杂工作流任务编排与协作。',
    group: 'official',
    series: 'stepfun',
    scenes: ['文本理解', '角色模拟'],
    abilities: ['深度思考', '结构化输出'],
    modal: '文本',
    contextLength: '128k',
    responseLength: '16k',
    updatedAt: '2026-05-26',
    provider: '阶跃星辰接入',
    useCount: 2870,
    modelSource: '官方',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_11',
    title: 'Seedream 4.0',
    summary: '高质量图像生成模型，适合海报、封面和创意视觉场景。',
    group: 'official',
    series: 'generate',
    scenes: ['图片理解'],
    abilities: ['结构化输出'],
    modal: '图片',
    contextLength: '128k',
    responseLength: '16k',
    updatedAt: '2026-05-30',
    provider: '视觉算法组',
    useCount: 5410,
    modelSource: '官方',
    modelGenType: '图片生成',
    status: '已上线',
  },
  {
    id: 'model_12',
    title: 'DeepSeek-R1-Distill-Qwen-7B',
    summary:
      'DeepSeek-R1-Distill 模型在开源模型基础上通过 DeepSeek-R1 生成样本微调，适合数理推理与代码分析。',
    group: 'space',
    series: 'deepseek',
    coverLabel: 'DeepSeek',
    scenes: ['文本理解'],
    abilities: ['深度思考'],
    modal: '文本',
    contextLength: '32k',
    responseLength: '12k',
    updatedAt: '2025-07-03',
    provider: '方舟',
    creator: 'panzhixiong',
    useCount: 42,
    coverUrl:
      'https://lf3-developer-sign.bytemastatic.com/developer/ai_platform_tool/1761045813395821880_7561031794209065779.png?lk3s=ff76ccc3&x-expires=2707125813&x-signature=ToFbDIyncgThWIe6h1Yq3Iuw76M%3D',
    modelSource: '空间',
    modelGenType: '文本',
    status: '已上线',
  },
  {
    id: 'model_13',
    title: 'xue的公共模型',
    summary: 'xue 的公共模型，面向空间内图像相关生成与调用场景。',
    group: 'space',
    series: 'doubao',
    coverLabel: 'Doubao',
    scenes: ['图片理解'],
    abilities: ['工具调用'],
    modal: '图片',
    contextLength: '32k',
    responseLength: '12k',
    updatedAt: '2025-12-08',
    provider: '空间共享',
    creator: 'wanghexue.123',
    useCount: 39,
    coverUrl:
      'https://lf6-developer-sign.bytemastatic.com/developer/ai_platform_tool/1761046069796418117_7561425195123084059.png?lk3s=ff76ccc3&x-expires=2707126069&x-signature=vB7a6t2hUINmeAJQNqEp8%2BqUc9I%3D',
    modelSource: '空间',
    modelGenType: '图片生成',
    status: '已上线',
  },
  {
    id: 'model_14',
    title: 'Doubao-Seed-1.6-flash-250715',
    summary:
      '极致速度、支持多模态与 256K 长上下文，适合延迟敏感场景与高频调用。',
    group: 'space',
    series: 'doubao',
    coverLabel: 'Doubao',
    scenes: ['文本理解', '图片理解'],
    abilities: ['工具调用', '深度思考', '结构化输出'],
    modal: '文本',
    contextLength: '256k',
    responseLength: '32k',
    updatedAt: '2025-10-20',
    provider: '空间共享',
    creator: 'wudongyang.2022',
    useCount: 128,
    coverUrl:
      'https://lf6-developer-sign.bytemastatic.com/developer/ai_platform_tool/1761046069450522990_7561031794209114931.png?lk3s=ff76ccc3&x-expires=2707126069&x-signature=PBxNJy%2FtMYvxK7Y5JvcrTiA5mdQ%3D',
    modelSource: '空间',
    modelGenType: '文本',
    status: '已上线',
  },
];

export const publisherItems: PublisherItem[] = [
  {
    id: 'feed-single-result',
    name: '单结果卡',
    description: '推荐优质服务，一键直达应用',
    scene: 'Feed',
    sceneLabel: 'Feed',
    genre: 'Feed卡',
    entry: 'mini_program',
    entryLabel: '小程序',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/11-7.png',
    tags: ['抖音Feed', '小程序'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'feed-multi-result',
    name: '多结果卡',
    description: '一次推荐多个优质服务应用',
    scene: 'Feed',
    sceneLabel: 'Feed',
    genre: 'Feed卡',
    entry: 'mini_program',
    entryLabel: '小程序',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/11-8.png',
    tags: ['抖音Feed', '小程序'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'feed-immersive',
    name: '沉浸卡',
    description: '推荐优质视频，预览观看',
    scene: 'Feed',
    sceneLabel: 'Feed',
    genre: 'Feed卡',
    entry: 'mini_program',
    entryLabel: '小程序',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/11-9.png',
    tags: ['抖音Feed', '小程序'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'feed-content',
    name: '图片内容卡',
    description: '一次推荐多个优质图片内容',
    scene: 'Feed',
    sceneLabel: 'Feed',
    genre: 'Feed卡',
    entry: 'mini_program',
    entryLabel: '小程序',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/11-10.png',
    tags: ['抖音Feed', '小程序'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'feed-dynamic-content',
    name: '个性化服务卡',
    description: '为用户展示专属个性化内容',
    scene: 'Feed',
    sceneLabel: 'Feed',
    genre: 'Feed卡',
    entry: 'mini_program',
    entryLabel: '小程序',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/11-6.png',
    tags: ['抖音Feed', '小程序'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'comment-group-link',
    name: '群聊链接',
    description: '支持分身直推群聊链接',
    scene: '评论区',
    sceneLabel: '评论区',
    genre: '评论',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/22-1.png',
    tags: ['评论区', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'comment-card-poi',
    name: 'POI组件',
    description: '支持分身直推生服链接',
    scene: '评论区',
    sceneLabel: '评论区',
    genre: '评论',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/22-3.png',
    tags: ['评论区', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'group-chat-activity-list',
    name: 'AIGC图片卡',
    description: '直接展示图片内容',
    scene: '群聊',
    sceneLabel: '群聊',
    genre: '群聊消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/15-1.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'group-chat-single-activity',
    name: '通用链接',
    description: '承载各类抖音端内外页面跳转的内容',
    scene: '群聊',
    sceneLabel: '群聊',
    genre: '群聊消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/15-2.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'group-chat-mini-program',
    name: '小程序卡',
    description: '展示抖音端小程序，引导用户跳转',
    scene: '群聊',
    sceneLabel: '群聊',
    genre: '群聊消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/15-3.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'group-chat-video-card',
    name: '视频卡',
    description: '承载抖音内视频或图文内容',
    scene: '群聊',
    sceneLabel: '群聊',
    genre: '群聊消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/15-4_1.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'private-message-image-card',
    name: 'AIGC图片卡',
    description: '直接展示图片内容',
    scene: '私信',
    sceneLabel: '私信',
    genre: '私信消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/14-1.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'private-message-link-card',
    name: '通用链接',
    description: '承载各类抖音端内外页面跳转的内容',
    scene: '私信',
    sceneLabel: '私信',
    genre: '私信消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/14-2.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'private-message-mini-program',
    name: '小程序卡',
    description: '展示抖音端小程序，引导用户跳转',
    scene: '私信',
    sceneLabel: '私信',
    genre: '私信消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/14-3.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'private-message-video-card',
    name: '视频卡',
    description: '承载抖音内视频或图文内容',
    scene: '私信',
    sceneLabel: '私信',
    genre: '私信消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/14-4_1.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'private-message-list-card',
    name: '列表卡',
    description: '聚合展示同类内容或服务列表',
    scene: '私信',
    sceneLabel: '私信',
    genre: '私信消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/14-5.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'private-message-rank-card',
    name: '榜单列表',
    description: '聚合展示同类型榜单内容',
    scene: '私信',
    sceneLabel: '私信',
    genre: '私信消息',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/14-6.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'ai-chat-image-card',
    name: 'AIGC图片卡',
    description: '直接展示图片内容',
    scene: 'AI聊天',
    sceneLabel: 'AI聊天',
    genre: '账号头像',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/13-1.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'ai-chat-link-card',
    name: '通用链接',
    description: '承载各类抖音端内外页面跳转的内容',
    scene: 'AI聊天',
    sceneLabel: 'AI聊天',
    genre: '账号头像',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/13-2.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'ai-chat-mini-program',
    name: '小程序卡',
    description: '展示抖音端小程序，引导用户跳转',
    scene: 'AI聊天',
    sceneLabel: 'AI聊天',
    genre: '账号头像',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/13-3.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'ai-chat-video-card',
    name: '视频卡',
    description: '承载抖音内视频或图文内容',
    scene: 'AI聊天',
    sceneLabel: 'AI聊天',
    genre: '账号头像',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/13-4_1.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'ai-chat-list-card',
    name: '列表卡',
    description: '聚合展示同类内容或服务列表',
    scene: 'AI聊天',
    sceneLabel: 'AI聊天',
    genre: '账号头像',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/13-5.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
  {
    id: 'ai-chat-rank-card',
    name: '榜单列表',
    description: '聚合展示同类型榜单内容',
    scene: 'AI聊天',
    sceneLabel: 'AI聊天',
    genre: '账号头像',
    entry: 'ai_avatar',
    entryLabel: 'AI分身',
    coverImage:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/publisher/list/13-6.png',
    tags: ['动态内容', 'AI分身'],
    canNavigate: true,
    available: true,
  },
];

export const triggerItems: TriggerItem[] = [
  {
    id: '1',
    title: '关注抖音账号',
    summary: '当用户关注抖音账号时，触发事件',
    scenes: [TRIGGER_SCENE_MAP[4]],
    method: TRIGGER_METHOD_MAP[1],
    apps: [TRIGGER_APP_MAP[1]],
    updatedAt: '2026-05-07',
    available: true,
    eventType: 'USER_FOLLOW',
    iconUrl:
      'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778123841272/user_follow_event_icon_20260507.png?x-expires=4931723841&x-signature=wwu2qtwxAXPuzczEBp7ilKChzU4%3D',
    payloadSchema: {
      fieldParams: [
        {
          name: 'event_time',
          fieldType: 'string',
          paramType: '事件类型',
          desc: '事件发生时间',
        },
        {
          name: 'to_user_id',
          fieldType: 'int',
          paramType: '被关注人的用户uid',
          desc: '被关注人的用户uid',
        },
        {
          name: 'from_user_id',
          fieldType: 'int',
          paramType: '关注人的用户uid',
          desc: '关注人的用户uid',
        },
        {
          name: 'to_user_nickname',
          fieldType: 'string',
          paramType: '被关注人的用户昵称',
          desc: '被关注人的用户昵称',
        },
        {
          name: 'from_user_nickname',
          fieldType: 'string',
          paramType: '关注人的用户昵称',
          desc: '关注人的用户昵称',
        },
      ],
    },
    coverUrl:
      'https://p3-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778134758218/trigger_0507_follow_1.png?x-expires=4931734758&x-signature=DPVwUe%2FXZqrpKjFTQ%2BTXoE1Rgrk%3D',
    coverBackgroundUrl: '',
    coverIcon: '',
    coverText: '',
    detailImageUrl:
      'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778123961360/user_follow_detail_20260507.png?x-expires=4931723961&x-signature=imGQUMoEDoEUf%2FJZk7jcqME5W%2F4%3D',
  },
  {
    id: '8',
    title: '用户入群',
    summary: '当用户加入群聊时，触发事件',
    scenes: [TRIGGER_SCENE_MAP[2]],
    method: TRIGGER_METHOD_MAP[1],
    apps: [TRIGGER_APP_MAP[1]],
    updatedAt: '2026-05-28',
    available: true,
    eventType: 'JOIN_GROUP',
    iconUrl:
      'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778123841272/user_follow_event_icon_20260507.png?x-expires=4931723841&x-signature=wwu2qtwxAXPuzczEBp7ilKChzU4%3D',
    payloadSchema: {
      fieldParams: [
        {
          name: 'event_time',
          fieldType: 'string',
          paramType: '事件类型',
          desc: '事件发生时间',
        },
        {
          name: 'join_group_uid',
          fieldType: 'string',
          paramType: '事件信息',
          desc: '入群用户id',
        },
        {
          name: 'join_group_user_name',
          fieldType: 'string',
          paramType: '事件信息',
          desc: '入群用户昵称',
        },
        {
          name: 'group_id',
          fieldType: 'string',
          paramType: '场景信息',
          desc: '群聊id',
        },
        {
          name: 'group_name',
          fieldType: 'string',
          paramType: '场景信息',
          desc: '群聊名称',
        },
      ],
    },
    coverUrl: '',
    coverBackgroundUrl: '',
    coverIcon: '👋',
    coverText: '欢迎新成员进群～',
    detailImageUrl:
      'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1780023711097/join_group_trigger_0528.png?x-expires=4933623711&x-signature=xemu4WeI2784Ouy46Qdk7pw9glo%3D',
  },
  {
    id: '7',
    title: '定时触发器',
    summary: '时间到达预设值时，触发事件',
    scenes: [TRIGGER_SCENE_MAP[2], TRIGGER_SCENE_MAP[5]],
    method: TRIGGER_METHOD_MAP[2],
    apps: [TRIGGER_APP_MAP[1], TRIGGER_APP_MAP[3]],
    updatedAt: '2026-05-28',
    available: false,
    eventType: 'CRON',
    iconUrl:
      'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778123841272/user_follow_event_icon_20260507.png?x-expires=4931723841&x-signature=wwu2qtwxAXPuzczEBp7ilKChzU4%3D',
    payloadSchema: {
      fieldParams: [
        {
          name: 'event_time',
          fieldType: 'string',
          paramType: '事件信息',
          desc: '事件发生时间',
        },
      ],
    },
    coverUrl: '',
    coverBackgroundUrl: '',
    coverIcon: '⏱️',
    coverText: '每天8点推送消息',
    detailImageUrl:
      'https://p3-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1780023640282/cron_trigger_0528.png?x-expires=4933623640&x-signature=jTwcT7ty%2BzZUWNFyFGVmc9QvEuw%3D',
  },
  {
    id: '9',
    title: '外部事件',
    summary: '支持外部事件信号传输进抖音',
    scenes: [TRIGGER_SCENE_MAP[2]],
    method: TRIGGER_METHOD_MAP[1],
    apps: [TRIGGER_APP_MAP[1]],
    updatedAt: '2026-05-28',
    available: false,
    eventType: 'EXT_EVENT',
    iconUrl:
      'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778123841272/user_follow_event_icon_20260507.png?x-expires=4931723841&x-signature=wwu2qtwxAXPuzczEBp7ilKChzU4%3D',
    payloadSchema: {
      fieldParams: [
        {
          name: 'event_time',
          fieldType: 'string',
          paramType: '事件类型',
          desc: '事件发生时间',
        },
      ],
    },
    coverUrl: '',
    coverBackgroundUrl: '',
    coverIcon: '⚽️',
    coverText: '欧冠巅峰夜，皇马3:1曼城',
    detailImageUrl:
      'https://p3-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1780023752885/out_event_trigger_0528.jpg?x-expires=4933623752&x-signature=ch3JW%2F35aelenRKUWWH6ETpgvrI%3D',
  },
];
