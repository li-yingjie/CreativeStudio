import {
  JINGXIN_LIVESTREAM_ASSET_PROJECT,
  LIFE_SERVICE_RESOURCE_POSITION_PROJECT,
  MAGICX_HEADER_ASSET_PROJECT,
  XINZAI_IP_ASSET_PROJECT,
  type ProjectKind,
} from '../ProjectProductView'
import { QIXI_BRIDGE_PROJECT } from '../QixiBridgeData'
import { ACG_FROM_DOC_PROJECT } from '../AcgFromDocData'
import { ACG_REPLICA_PROJECT } from '../AcgReplicaData'

/** Rotating reply bank for plain (non-trigger) chat messages. Picked by
 *  index so repeated sends still feel varied without needing a real
 *  language model. */
export const GENERIC_AI_REPLIES = [
  '好的，我记下了这个需求。可以再告诉我具体的使用场景或期望结果，这样我可以帮你精准地搭建。',
  '收到。为了给出更贴合的方案，你能补充一下目标用户、触发时机和数据来源吗？',
  '好，我先整理下你的想法。建议把它拆成更小的步骤说给我听，我会按步骤接着往下做。',
  '明白了。如果方便，可以直接描述一下理想中的最终产出形态，比如一个页面、一段接口或一份内容。',
]

export const CHAT_EMPTY_SUGGESTIONS = [
  '换套更神秘的配色',
  '给卡片加上翻面动效',
  '再写两个塔罗牌面',
  '加一个每日签到提醒',
  '优化首页加载速度',
]

/** AI-avatar project suggestions — each phrase matches the trigger
 *  pattern-match in `sendChat` so clicking one immediately kicks off
 *  the recognition flow. */
export const AI_AVATAR_CHAT_SUGGESTIONS = [
  '当用户关注时发送"欢迎关注"',
  '用户评论后回复"谢谢留言"',
  '用户点赞后发送"感谢点赞"',
  '用户送礼物时答谢"感谢礼物"',
  '用户投稿时推荐"新作品上线"',
]

/** Quick-command chips shown in a project's empty chat — edit-oriented and
 *  tailored to the product kind. ai-avatar keeps the trigger-matching set so
 *  clicking a chip still fires the recognition flow. */
export const CHAT_SUGGESTIONS_BY_KIND: Record<ProjectKind, string[]> = {
  'mini-program': CHAT_EMPTY_SUGGESTIONS,
  'ai-avatar': AI_AVATAR_CHAT_SUGGESTIONS,
  'web-app': [
    '换个更简洁的主题色',
    '作品页加上分类筛选',
    '首页加一段自我介绍',
    '联系页加个留言表单',
    '适配一下移动端布局',
  ],
  'web-game': [
    '把敌人密度调高一点',
    '新增一个 Roguelike 流派',
    '换个更燃的 BOSS 战音乐',
    '加一个本地排行榜',
    '优化手机端触控手感',
  ],
  'marketing-h5': [
    '换一组主会场游戏',
    '调整开年高燃榜单',
    '给视频加自动播放',
    '增加游戏分类入口',
    '优化新春氛围动效',
  ],
  'ops-proposal': [
    '多找几个腰部达人',
    '调整种草投放节奏',
    '换个内容种草方向',
    '增加团购转化钩子',
    '补充人群诊断维度',
  ],
}

/** Per-project overrides — finer-grained chips for specific projects. */
export const CHAT_SUGGESTIONS_BY_PROJECT: Record<string, string[]> = {
  [ACG_REPLICA_PROJECT]: [
    '对照设计稿检查还原度',
    '把任务区文案换成正式版',
    '体验投票和关注反馈',
    '用 AI 生成版素材替换切片',
    '查看切片与坐标清单',
  ],
  [ACG_FROM_DOC_PROJECT]: [
    '回放从需求到页面的生成过程',
    '调整六篇章的顺序和文案',
    '体验夯 / 拉投票反馈',
    '编辑晚会许愿模块',
    '查看三张风格候选图',
  ],
  [QIXI_BRIDGE_PROJECT]: [
    '调整首页的信息层级',
    '修改找喜鹊的关卡反馈',
    '核对奖励与机会规则',
    '预览异常和活动结束状态',
    '进入视觉方向确认',
  ],
  '夯爆了 已上线': [
    '补齐卤味和螺蛳粉的彩色卡面',
    '换一版深夜食堂主视觉',
    '调整奖励档位和券面文案',
    '把接金豆玩法加上',
    '优化抽卡开卡动效',
  ],
  '塔罗兴趣卡': [
    '换套更神秘的配色',
    '给卡片加上翻面动效',
    '再写两个塔罗牌面',
    '牌意词典加个搜索',
    '加一个每日签到',
  ],
  '射击小游戏': CHAT_SUGGESTIONS_BY_KIND['web-game'],
  '2026 抖音 ACG 新春会': [
    '查看 ActivitySpec 与待确认项',
    '打开游戏分会场运行态',
    '检查 10 个资源位适配',
    '查看资产版本与来源节点',
    '运行发布前完整校验',
  ],
  '2026 抖音春晚': [
    '打开春晚主会场长页',
    '查看直播间包装矩阵',
    '检查横竖方三种节目封面',
    '定位活动 Banner 的 Figma 节点',
    '查看全部 17 项交付',
  ],
  '《永夜星河》独星河小卡': [
    '打开抽卡主会场运行态',
    '查看卡片图鉴与空态',
    '检查搜索 Banner 双尺寸',
    '查看不同稀有度卡框',
    '定位全部 16 项交付',
  ],
  [XINZAI_IP_ASSET_PROJECT]: [
    '检查心仔标准形象与比例',
    '筛选适合餐饮场景的动作',
    '核对线下物料品牌标识',
    '为城市生活季补一组动作',
    '导出供应商验收清单',
  ],
  [JINGXIN_LIVESTREAM_ASSET_PROJECT]: [
    '预览七层贴片组合效果',
    '检查透明 PNG 的边缘',
    '调整套餐权益的可读性',
    '锁定门店品牌贴片',
    '按 1374×2437 导出',
  ],
  [LIFE_SERVICE_RESOURCE_POSITION_PROJECT]: [
    '检查 8 张资源位文案',
    '按语义色路由分组',
    '验证 1170×330 尺寸',
    '检查 Logo 与固定装饰',
    '导出本周正式成图',
  ],
  [MAGICX_HEADER_ASSET_PROJECT]: [
    '比较四种头图构图方向',
    '筛选适合城市夜游的案例',
    '标记人物与 IP 授权风险',
    '整理头图评审说明',
    '基于选中方向生成新版本',
  ],
  '沪上火锅·五一种草提案': CHAT_SUGGESTIONS_BY_KIND['ops-proposal'],
}
