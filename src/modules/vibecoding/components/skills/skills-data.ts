/* ─── 技能库数据 ───
 *
 * 从 AI 平台 (ai_design) 的 mocks/mockData.ts 原样搬过来：类型、分类树、
 * 分组卡片全部保持一致，封面用它们原本的 CDN 地址。 */

export interface SkillCategoryNode {
  key: string;
  label: string;
  count: number;
  iconKind?: 'puzzle';
  iconTone?:
    | 'blue'
    | 'violet'
    | 'green'
    | 'orange'
    | 'cyan'
    | 'purple'
    | 'gray';
  iconUrl?: string;
  children?: SkillCategoryNode[];
}

export interface SkillCategoryGroup extends SkillCategoryNode {
  iconTone: 'blue' | 'violet' | 'green' | 'orange' | 'cyan' | 'purple' | 'gray';
  children: SkillCategoryNode[];
}

export interface SkillCardItem {
  id: string;
  name: string;
  description: string;
  source: '抖音官方' | '三方提供' | '空间';
  updatedAt: string;
  useCount: number;
  categoryKey: string;
  coverUrl: string;
  coverIcon?: string;
}

export interface SkillSection {
  key: string;
  label: string;
  count: number;
  items: SkillCardItem[];
}

export const skillCategorySummary = {
  squareTotal: 481,
  teamTotal: 220,
  personalTotal: 0,
};

export const skillCategories: SkillCategoryGroup[] = [
  {
    key: 'xiaohua',
    label: '小花',
    count: 13,
    iconKind: 'puzzle',
    iconTone: 'cyan',
    children: [
      {
        key: 'xiaohua-scenes',
        label: '应用场景',
        count: 13,
        iconTone: 'gray',
        iconUrl:
          'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/douyin.png',
        children: [
          { key: 'xiaohua-search', label: '小花搜索', count: 1 },
          { key: 'xiaohua-comment', label: '小花评论', count: 2 },
          { key: 'xiaohua-bottom-bar', label: '小花底bar', count: 2 },
          { key: 'xiaohua-im', label: '小花im', count: 8 },
        ],
      },
    ],
  },
  {
    key: 'douyin',
    label: '抖音',
    count: 285,
    iconTone: 'gray',
    iconUrl:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/douyin.png',
    children: [
      { key: 'douyin-feed', label: '抖音Feed', count: 5 },
      { key: 'douyin-comment', label: '抖音评论', count: 22 },
      { key: 'douyin-group', label: '抖音群聊', count: 1 },
      { key: 'douyin-search', label: '抖音搜索', count: 6 },
      { key: 'douyin-hot', label: '抖音热点', count: 1 },
      { key: 'video-content', label: '视频内容', count: 15 },
      { key: 'account-info', label: '账号信息', count: 15 },
      { key: 'interaction-widget', label: '互动组件', count: 9 },
      { key: 'audit-governance', label: '治理与审核', count: 7 },
      { key: 'customer-service', label: '客服能力', count: 204 },
    ],
  },
  {
    key: 'content-creation',
    label: '内容创作',
    count: 30,
    iconTone: 'blue',
    iconUrl:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/inspiration_design.png',
    children: [
      { key: 'content-generation', label: '内容生成', count: 15 },
      { key: 'text-processing', label: '文本处理', count: 5 },
      { key: 'image-editing', label: '图片编辑', count: 4 },
      { key: 'video-production', label: '视频制作', count: 6 },
    ],
  },
  {
    key: 'idea-design',
    label: '灵感设计',
    count: 19,
    iconTone: 'violet',
    iconUrl:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/content_creation.png',
    children: [
      { key: 'figma', label: 'figma', count: 1 },
      { key: 'visual-production', label: '视觉制作', count: 9 },
      { key: 'design-tools', label: '设计工具', count: 3 },
      { key: 'idea-mining', label: '灵感挖掘', count: 6 },
    ],
  },
  {
    key: 'data-analysis',
    label: '数据分析和处理',
    count: 19,
    iconTone: 'cyan',
    iconUrl:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/data_analysis.png',
    children: [
      { key: 'libra', label: 'Libra', count: 2 },
      { key: 'tea', label: 'TEA', count: 1 },
      { key: 'aeolus', label: 'Aeolus', count: 2 },
      { key: 'data-insight', label: '数据分析', count: 7 },
      { key: 'data-processing', label: '数据处理', count: 7 },
    ],
  },
  {
    key: 'dev-tools',
    label: '开发工具',
    count: 49,
    iconTone: 'green',
    iconUrl:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/dev_tools.png',
    children: [
      { key: 'code-writing', label: '代码编写', count: 11 },
      { key: 'interface-dev', label: '界面开发', count: 6 },
      { key: 'engineering-auto', label: '工程自动化', count: 10 },
      { key: 'integration', label: '集成协作', count: 16 },
      { key: 'ops', label: '系统运维', count: 6 },
    ],
  },
  {
    key: 'security-audit',
    label: '安全审核',
    count: 4,
    iconTone: 'orange',
    iconUrl:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/security_audit.png',
    children: [
      { key: 'monitoring', label: '监控', count: 3 },
      { key: 'security', label: '安全', count: 1 },
    ],
  },
  {
    key: 'office-efficiency',
    label: '办公效率',
    count: 48,
    iconTone: 'purple',
    iconUrl:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/work_efficiency.png',
    children: [
      { key: 'office-collab', label: '协作办公', count: 11 },
      { key: 'web-search', label: '全网检索', count: 14 },
      { key: 'public-service', label: '便民服务', count: 12 },
      { key: 'industry-service', label: '行业服务', count: 2 },
      { key: 'sales-marketing', label: '销售与营销', count: 3 },
      { key: 'file-processing', label: '文件处理', count: 6 },
    ],
  },
  {
    key: 'other',
    label: '其他',
    count: 14,
    iconTone: 'gray',
    iconUrl:
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/resource-category-tree/other_category.png',
    children: [{ key: 'others', label: '其他', count: 14 }],
  },
];


export const skillSections: SkillSection[] = [
  {
    key: 'douyin-feed',
    label: '抖音Feed',
    count: 5,
    items: [
      {
        id: 'douyin-video-summary',
        name: '抖音视频理解总结',
        description:
          '提取抖音视频文本并生成精简或详细总结。用户要快速读懂视频、提炼观点或输出摘要时调用。',
        source: '抖音官方',
        updatedAt: '1 月前',
        useCount: 46,
        categoryKey: 'douyin-feed',
        coverUrl:
          'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1777521164208/10-%E6%8A%96%E9%9F%B3%E8%A7%86%E9%A2%91%E7%90%86%E8%A7%A3%E6%80%BB%E7%BB%93.png?x-expires=4931121164&x-signature=2buA1HgQV4TNwAojoTbI3n%2BRbuE%3D',
      },
      {
        id: 'douyin-video-query',
        name: '抖音视频智能查询',
        description:
          '查询抖音视频基础信息、互动数据与抽帧结果。用户要按视频 ID 做详情分析、数据查看或辅助理解时调用。',
        source: '抖音官方',
        updatedAt: '1 月前',
        useCount: 23,
        categoryKey: 'douyin-feed',
        coverUrl:
          'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1777537188251/09-%E6%8A%96%E9%9F%B3%E8%A7%86%E9%A2%91%E6%99%BA%E8%83%BD%E6%9F%A5%E8%AF%A2.png?x-expires=4931137188&x-signature=vNqMFxXcmRVzjibxItIBQi8Oaas%3D',
      },
      {
        id: 'douyin-short-link',
        name: '抖音视频短链接识别',
        description:
          '从抖音链接中提取视频作品 ID。当用户提供抖音网址并需要获取视频 ID 时，启用本技能。',
        source: '抖音官方',
        updatedAt: '2 周前',
        useCount: 3,
        categoryKey: 'douyin-feed',
        coverUrl:
          'https://p6-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778750708217/05-%E6%8A%96%E9%9F%B3%E8%A7%86%E9%A2%91%E7%9F%AD%E9%93%BE%E6%8E%A5%E8%AF%86%E5%88%AB.png?x-expires=4932350708&x-signature=Z09IY63aE2kJgrzHLdPf8LoGRfI%3D',
      },
      {
        id: 'miniapp-feed-card',
        name: 'miniapp-feed-card-skill-v4',
        description:
          '根据用户输入生成小程序信息流推荐卡片，包含单结果卡、内容卡、动态内容卡等生成',
        source: '抖音官方',
        updatedAt: '1 天前',
        useCount: 2,
        categoryKey: 'douyin-feed',
        coverUrl:
          'https://lf3-static.bytednsdoc.com/obj/eden-cn/kuLauvyM-tyvmahsWulwV-upfbvK/ljhwZthlaukjlkulzlp/ai/toolbox/cover-bg-webp/bg-6.webp',
        coverIcon: '✅',
      },
      {
        id: 'douyin-feed-shape-card',
        name: '抖音Feed流异形卡生成',
        description:
          '根据用户输入生成小程序信息流推荐卡片，包含单结果卡和内容卡等生成。',
        source: '抖音官方',
        updatedAt: '2 周前',
        useCount: 0,
        categoryKey: 'douyin-feed',
        coverUrl:
          'https://p3-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778751179305/%E5%B0%8F%E7%A8%8B%E5%BA%8Ffeed%E5%8D%A1%E5%8F%91%E5%B8%83.png?x-expires=4932351181&x-signature=f0tkhm5%2BfzIJIQFArVskuT7UV2g%3D',
      },
    ],
  },
  {
    key: 'douyin-comment',
    label: '抖音评论',
    count: 22,
    items: [
      {
        id: 'poi-widget',
        name: 'POI组件',
        description:
          '在评论区回评场景，当用户艾特AI分身咨询相关地址、景点、位置、地点名称等时调用。',
        source: '抖音官方',
        updatedAt: '2 周前',
        useCount: 133,
        categoryKey: 'douyin-comment',
        coverUrl:
          'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778739441707/34-AI%E5%88%86%E8%BA%AB%E8%AF%84%E8%AE%BA%E5%8C%BA%E5%9C%B0%E5%9D%80%E7%BB%84%E4%BB%B6.png?x-expires=4932339441&x-signature=Ycp3rseXSLR%2ByAJObYKyC7GEeWQ%3D',
      },
      {
        id: 'comment-sentiment',
        name: '评论情感/热词分析',
        description:
          '分析评论区情感倾向与高频热词。用户要识别评论情绪、热词、槽点或用户反馈方向时调用。',
        source: '抖音官方',
        updatedAt: '1 月前',
        useCount: 85,
        categoryKey: 'douyin-comment',
        coverUrl:
          'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1777521728284/%E7%83%AD%E8%AF%8D%E5%88%86%E6%9E%90.png?x-expires=4931121728&x-signature=OhxBxo6Z0LFwnDoInWlx2kAjqCA%3D',
      },
      {
        id: 'group-link',
        name: '群聊链接',
        description:
          '在评论区回复场景中，根据用户引导入群的意图，判断是否为作者本人操作，并调用群聊组件生成引导评论。',
        source: '抖音官方',
        updatedAt: '2 周前',
        useCount: 71,
        categoryKey: 'douyin-comment',
        coverUrl:
          'https://p3-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1778739102535/33-AI%E5%88%86%E8%BA%AB%E8%AF%84%E8%AE%BA%E5%8C%BA%E7%BE%A4%E8%81%8A%E7%BB%84%E4%BB%B6.png?x-expires=4932339102&x-signature=YXEva002rxmFEdpCaOZV2RTVyGE%3D',
      },
      {
        id: 'video-comment-analysis',
        name: '抖音视频评论分析',
        description:
          '分析抖音视频评论区结构、热评和用户反馈。用户要基于视频评论做内容复盘、用户洞察或评论区研究时调用。',
        source: '抖音官方',
        updatedAt: '1 月前',
        useCount: 55,
        categoryKey: 'douyin-comment',
        coverUrl:
          'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1777521484956/11-%E6%8A%96%E9%9F%B3%E8%A7%86%E9%A2%91%E8%AF%84%E8%AE%BA%E5%88%86%E6%9E%90.png?x-expires=4931121485&x-signature=O29OjWq8HuSjalLVSWdBcQqeZ9Y%3D',
      },
      {
        id: 'comment-public-opinion',
        name: '评论舆情分析',
        description:
          '分析评论区舆情走向、争议焦点和风险信号。用户要做评论舆论研判、风险预警或热点复盘时调用。',
        source: '抖音官方',
        updatedAt: '1 月前',
        useCount: 48,
        categoryKey: 'douyin-comment',
        coverUrl:
          'https://p3-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1777521767936/15-%E8%AF%84%E8%AE%BA%E8%88%86%E6%83%85%E5%88%86%E6%9E%90.png?x-expires=4931121768&x-signature=L6U36I7zYniIXC44IGB4vhbtYPE%3D',
      },
      {
        id: 'smart-comment-reply',
        name: '评论智能回复文案',
        description:
          '基于评论内容生成智能回复文案。用户要给评论区做作者回复、品牌互动或运营回复时调用。',
        source: '抖音官方',
        updatedAt: '1 月前',
        useCount: 41,
        categoryKey: 'douyin-comment',
        coverUrl:
          'https://p6-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1777526625210/16-%E8%AF%84%E8%AE%BA%E6%99%BA%E8%83%BD%E5%9B%9E%E5%A4%8D%E6%96%87%E6%A1%88.png?x-expires=4931126625&x-signature=b2y5cbDhIkITP7MyAcuf4BdXqu0%3D',
      },
      {
        id: 'comment-search',
        name: '抖音评论搜索',
        description:
          '搜索抖音评论并整理热评、观点与关联视频。用户要按关键词找评论、挖掘评论观点或定位热评时调用。',
        source: '抖音官方',
        updatedAt: '1 月前',
        useCount: 27,
        categoryKey: 'douyin-comment',
        coverUrl:
          'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1777521532355/12-%E6%8A%96%E9%9F%B3%E8%AF%84%E8%AE%BA%E6%90%9C%E7%B4%A2.png?x-expires=4931121532&x-signature=NKOcF3pyXjpxAjQGELEOWbzCXv4%3D',
      },
      {
        id: 'hot-comment-generate',
        name: '神评/引导评论生成',
        description:
          '基于视频评论区语境生成神评或引导评论。用户要写高互动评论、引导讨论或评论区运营话术时调用。',
        source: '抖音官方',
        updatedAt: '1 月前',
        useCount: 16,
        categoryKey: 'douyin-comment',
        coverUrl:
          'https://p9-developer-sign.bytemaimg.com/obj/developer-inner/open_admin/1777537208594/13-%E7%A5%9E%E8%AF%84_%E5%BC%95%E5%AF%BC%E8%AF%84%E8%AE%BA%E7%94%9F%E6%88%90.png?x-expires=4931137208&x-signature=PhK6KA4TWSShRYMJBWvYLrmd1Lg%3D',
      },
    ],
  },
];
