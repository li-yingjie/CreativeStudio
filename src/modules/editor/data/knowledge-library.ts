import type { KnowledgeCard } from '../store/persona-store'

/** Platform-provided knowledge cards. Users pick from this library and insert
 *  them into their persona — they do not edit content directly.
 *
 *  Virtual cards describe generic agent capabilities any role-play character
 *  can install; real cards describe real-world domains for creator IPs. */
export const KNOWLEDGE_LIBRARY: KnowledgeCard[] = [
  /* ── Virtual · 平台知识库 ─────────── */
  {
    id: 'k-v-douyin-video',
    kind: 'virtual',
    title: '我的抖音视频',
    content:
      '提供了抖音视频相关数据，包含 2K 篇文档。涵盖粉丝画像、热门视频话题、评论区高频关键词、发布节奏与互动规律。',
    tags: ['平台', '抖音'],
  },
  {
    id: 'k-v-botany',
    kind: 'virtual',
    title: '植物学',
    content:
      '花卉植物百科知识，包含花语、养护方法、季节特征与文化寓意。让园丁角色在对话中自然引用植物知识，用花草比喻生活。',
    tags: ['知识', '植物'],
  },
  {
    id: 'k-v-douyin-b',
    kind: 'virtual',
    title: '抖音B号',
    content:
      '提供了抖音B号的相关数据，包含 403 篇文档。',
    tags: ['平台', '抖音'],
  },
  {
    id: 'k-v-douyin-c',
    kind: 'virtual',
    title: '抖音C号',
    content:
      '提供了抖音C号的相关数据，包含 363 篇文档。',
    tags: ['平台', '抖音'],
  },
  {
    id: 'k-v-douyin-live',
    kind: 'virtual',
    title: '抖音直播',
    content:
      '提供了抖音直播相关的数据，包含 376 篇文档。',
    tags: ['平台', '直播'],
  },
  {
    id: 'k-v-video-disposal',
    kind: 'virtual',
    title: '视频处置',
    content:
      '提供了视频处置相关的数据，包含 162 篇文档。',
    tags: ['运营', '处置'],
  },
  {
    id: 'k-v-account-disposal',
    kind: 'virtual',
    title: '账号处置',
    content:
      '提供了账号处置相关的数据，包含 89 篇文档。',
    tags: ['运营', '处置'],
  },
  {
    id: 'k-v-live-disposal',
    kind: 'virtual',
    title: '直播处置',
    content:
      '提供了直播处置相关的数据，包含 149 篇文档。',
    tags: ['运营', '处置'],
  },
  {
    id: 'k-v-mini-program',
    kind: 'virtual',
    title: '抖音小程序',
    content:
      '提供了小程序相关的数据，包含 114 篇文档。',
    tags: ['平台', '小程序'],
  },
  {
    id: 'k-v-group-chat',
    kind: 'virtual',
    title: '群聊',
    content:
      '提供了群聊相关的数据，包含 56 篇文档。',
    tags: ['平台', '社交'],
  },
  {
    id: 'k-v-hot-all',
    kind: 'virtual',
    title: '全网热点',
    content:
      '提供微博热榜、快手热榜、小红书热点、Bilibili热点等全网热点事件信息，包含 633 篇文档。',
    tags: ['热点', '全网'],
  },
  {
    id: 'k-v-hot-douyin',
    kind: 'virtual',
    title: '抖音热点',
    content:
      '提供抖音热榜、抖音上升榜的热点事件信息，包含 648 篇文档。',
    tags: ['热点', '抖音'],
  },
  {
    id: 'k-v-guild',
    kind: 'virtual',
    title: '公会',
    content:
      '提供公会相关的数据，包括经营地区、聚焦领域等信息，包含 19 篇文档。',
    tags: ['运营', '公会'],
  },
  {
    id: 'k-v-mcn',
    kind: 'virtual',
    title: 'MCN',
    content:
      '提供MCN相关的数据，包括机构主体名称等信息，包含 80 篇文档。',
    tags: ['运营', 'MCN'],
  },

  /* ── Real · 生活博主 · lifestyle ──────────────── */
  {
    id: 'k-r-routine',
    kind: 'real',
    title: '晨间仪式',
    content:
      '知道自己在清晨的 15 分钟里最该做什么——一杯冷萃、三个拉伸、一行今日清单。小习惯的复利比任何决心都稳。',
    tags: ['生活', '习惯'],
  },
  {
    id: 'k-r-home-style',
    kind: 'real',
    title: '家居审美',
    content:
      '熟悉北欧、侘寂、中古、New Modern 等几种家居风格。对"好看"的判断标准已经从"满"变成"留白"。',
    tags: ['生活', '美学'],
  },
  {
    id: 'k-r-self-care',
    kind: 'real',
    title: '自我照料清单',
    content:
      '清楚皮肤、睡眠、情绪这三条线是怎么串起来的。一张 A4 纸能写完一周的 self-care minimum。',
    tags: ['生活', '健康'],
  },
  {
    id: 'k-r-minimalism',
    kind: 'real',
    title: '极简主义',
    content:
      '明白极简不是空，而是每件东西都值得留下。衣柜里 30 件就够，真正会穿的只是其中 10 件。',
    tags: ['生活', '哲学'],
  },
  {
    id: 'k-r-seasonal',
    kind: 'real',
    title: '四季仪式',
    content:
      '春天插一枝樱花、夏天换杯子冰咖啡、秋天煮一锅牛肉汤、冬天换床品。一年的节拍由这些小动作撑住。',
    tags: ['生活', '节气'],
  },

  /* ── Real · 健身达人 · fitness ────────────────── */
  {
    id: 'k-r-anatomy',
    kind: 'real',
    title: '运动解剖',
    content:
      '熟悉肩、背、腿、核心的主要肌群和它们的协同关系。哪些动作是"借力"、哪些是"发力"，一看就知道。',
    tags: ['健身', '科学'],
  },
  {
    id: 'k-r-nutrition',
    kind: 'real',
    title: '运动营养',
    content:
      '蛋白质、碳水、脂肪的缺口怎么算、餐前餐后怎么吃。知道"饿"和"没吃够"不是一回事。',
    tags: ['健身', '营养'],
  },
  {
    id: 'k-r-training-cycle',
    kind: 'real',
    title: '周期化训练',
    content:
      '了解基础期、力量期、赛前期的节奏安排。一个普通人的身体需要 8–12 周才会看到真正的变化。',
    tags: ['健身', '计划'],
  },
  {
    id: 'k-r-recovery',
    kind: 'real',
    title: '恢复科学',
    content:
      '睡眠、筋膜放松、主动恢复的优先级。训练不是越多越好，是"能恢复得过来"才好。',
    tags: ['健身', '恢复'],
  },
  {
    id: 'k-r-sport-science',
    kind: 'real',
    title: '运动科学前沿',
    content:
      '关注运动科学期刊的新研究，知道哪些"网红动作"有证据，哪些只是好看。',
    tags: ['健身', '研究'],
  },

  /* ── Real · 科技评测 · tech ───────────────────── */
  {
    id: 'k-r-hardware',
    kind: 'real',
    title: '硬件参数',
    content:
      '看得懂 CPU / GPU / 内存 / 散热的关键参数和它们的瓶颈关系。知道哪些数字能看、哪些是营销。',
    tags: ['科技', '硬件'],
  },
  {
    id: 'k-r-software',
    kind: 'real',
    title: '操作系统生态',
    content:
      '熟悉 macOS / Windows / Linux / iOS / Android 的设计哲学与互操作性。了解它们各自的"代价"。',
    tags: ['科技', '软件'],
  },
  {
    id: 'k-r-benchmarks',
    kind: 'real',
    title: '性能跑分',
    content:
      '熟悉 Geekbench / 3DMark / Cinebench / AnTuTu 的测试方法与失真场景，不迷信单项分数。',
    tags: ['科技', '测试'],
  },
  {
    id: 'k-r-industry',
    kind: 'real',
    title: '产业新闻',
    content:
      '关注 Apple / NVIDIA / 高通 / 联发科的发布节奏，知道行业里哪些传闻值得当回事。',
    tags: ['科技', '行业'],
  },
  {
    id: 'k-r-privacy',
    kind: 'real',
    title: '隐私与安全',
    content:
      '了解基础的数据加密、DNS / VPN、权限模型。评测硬件时顺手看一眼这部分，而不只是跑分。',
    tags: ['科技', '安全'],
  },

  /* ── Real · 美食博主 · food ───────────────────── */
  {
    id: 'k-r-ingredients',
    kind: 'real',
    title: '食材地理',
    content:
      '知道哪一季的哪些食材最好吃：春天的竹笋、夏天的梅子、秋天的蟹、冬天的白萝卜。产地不同，味道差一截。',
    tags: ['美食', '食材'],
  },
  {
    id: 'k-r-seasoning',
    kind: 'real',
    title: '调味逻辑',
    content:
      '五味怎么搭：酸、甜、咸、鲜、香的层次关系，以及鱼露、柠檬皮屑、火葱油这类"隐藏调味"。',
    tags: ['美食', '调味'],
  },
  {
    id: 'k-r-kitchen-tools',
    kind: 'real',
    title: '厨房器械',
    content:
      '一把好刀、一个厚底锅、一个手动秤——超过三件的"料理神器"大多数是收智商税。',
    tags: ['美食', '工具'],
  },
  {
    id: 'k-r-recipe-structure',
    kind: 'real',
    title: '菜谱结构',
    content:
      '一份让人敢照做的菜谱长什么样：食材量化、步骤分组、关键 checkpoint 标清。',
    tags: ['美食', '写作'],
  },
  {
    id: 'k-r-food-culture',
    kind: 'real',
    title: '饮食文化',
    content:
      '粤川鲁淮扬四大菜系各自的气质、日料的季节感、法餐的酱汁逻辑——文化决定了味道的边界。',
    tags: ['美食', '文化'],
  },
]
