import type { SkillCard } from '../store/persona-store'

export const SKILLS_LIBRARY: SkillCard[] = [
  /* ── 数据分析 ─────────── */
  { id: 's-comment-sentiment', kind: 'virtual', title: '情感分析', content: '分析评论区情感倾向与高频热词', tags: ['分析', '评论'] },
  { id: 's-comment-opinion', kind: 'virtual', title: '评论舆情分析', content: '分析评论区舆情走向、争议焦点和风险信号', tags: ['分析', '舆情'] },
  { id: 's-video-comment', kind: 'virtual', title: '抖音视频评论分析', content: '分析抖音视频评论区结构、热评和用户反馈', tags: ['分析', '评论'] },
  { id: 's-xhs-analysis', kind: 'virtual', title: '小红书内容分析', content: '查询小红书热门种草笔记，监控关键词并分析平台内容趋势', tags: ['分析', '小红书'] },

  /* ── 抖音工具 ─────────── */
  { id: 's-douyin-search', kind: 'virtual', title: '抖音内容搜索', content: '将用户的抖音内容搜索需求转化为标准化检索参数，调用对应搜索工具，并输出结构化结果与可读摘要', tags: ['抖音', '搜索'] },
  { id: 's-douyin-summary', kind: 'virtual', title: '抖音视频理解总结', content: '提取抖音视频文本并生成精简或详细总结', tags: ['抖音', '视频'] },
  { id: 's-douyin-comment-search', kind: 'virtual', title: '抖音评论搜索', content: '搜索抖音评论并整理热评、观点与关联视频', tags: ['抖音', '评论'] },
  { id: 's-douyin-hot', kind: 'virtual', title: '热点推荐', content: '获取抖音热点榜、种草榜、娱乐榜和挑战榜并做推荐', tags: ['抖音', '热点'] },
  { id: 's-douyin-music', kind: 'virtual', title: '抖音音乐搜索', content: '搜索抖音音乐并整理歌曲信息', tags: ['抖音', '音乐'] },
  { id: 's-douyin-query', kind: 'virtual', title: '抖音视频智能查询', content: '查询抖音视频基础信息、互动数据与抽帧结果', tags: ['抖音', '查询'] },
  { id: 's-douyin-user', kind: 'virtual', title: '抖音用户搜索', content: '搜索抖音用户并整理账号信息', tags: ['抖音', '搜索'] },
  { id: 's-douyin-feed', kind: 'virtual', title: '抖音Feed流异形卡生成', content: '根据用户输入生成小程序信息流推荐卡片', tags: ['抖音', '生成'] },

  /* ── 文案创作 ─────────── */
  { id: 's-comment-reply', kind: 'virtual', title: '评论智能回复文案', content: '基于评论内容生成智能回复文案', tags: ['文案', '评论'] },
  { id: 's-god-comment', kind: 'virtual', title: '神评/引导评论生成', content: '基于视频评论区语境生成神评或引导评论', tags: ['文案', '评论'] },
  { id: 's-hook-copy', kind: 'virtual', title: '视频钩子文案生成', content: '生成视频前三秒钩子文案，抓住用户注意力', tags: ['文案', '视频'] },
  { id: 's-promo-copy', kind: 'virtual', title: '推广文案精修', content: '通过多轮专业审读提升文案表现力', tags: ['文案', '营销'] },
  { id: 's-content-plan', kind: 'virtual', title: '内容创作规划', content: '帮你规划内容创作方向，挖掘选题攒创意', tags: ['文案', '规划'] },
  { id: 's-sell-copy', kind: 'virtual', title: '全场景带货文案', content: '帮你撰写有吸引力的带货文案', tags: ['文案', '带货'] },
  { id: 's-product-copy', kind: 'virtual', title: '产品文案撰写', content: '帮你撰写吸引人的产品界面文案内容', tags: ['文案', '产品'] },
  { id: 's-marketing-copy', kind: 'virtual', title: '专业营销文案创作', content: '专业营销文案创作，适配各类商业场景', tags: ['文案', '营销'] },
  { id: 's-poem', kind: 'virtual', title: '诗歌生成', content: '生成各类诗歌文案，用于视频配乐和字幕', tags: ['文案', '诗歌'] },
  { id: 's-story', kind: 'virtual', title: '完整故事创作', content: '完整故事创作流水线，从构思到成品一站式完成', tags: ['文案', '故事'] },
  { id: 's-story-prompt', kind: 'virtual', title: '故事分镜提示词生成', content: '将故事内容转换为 AI 绘画和视频的提示词', tags: ['文案', '分镜'] },

  /* ── 视觉生成 ─────────── */
  { id: 's-video-gen', kind: 'virtual', title: '视频生成', content: '根据文本和参考图生成 AI 视频', tags: ['生成', '视频'] },
  { id: 's-chart-gen', kind: 'virtual', title: '图表生成', content: '根据文字需求和数据生成图表', tags: ['生成', '图表'] },
  { id: 's-img-gen', kind: 'virtual', title: '智能生图助手', content: '执行文生图、改图和多图生成', tags: ['生成', '图片'] },
  { id: 's-poster', kind: 'virtual', title: '海报与静态设计', content: '精心打造海报与静态艺术设计', tags: ['生成', '海报'] },
  { id: 's-cny-poster', kind: 'virtual', title: '马年春节活动海报生成', content: '生成马年春节活动海报的工作流与提示词模板', tags: ['生成', '海报'] },
  { id: 's-social-poster', kind: 'virtual', title: '中文社交海报生成', content: '生成适合国内各社交平台的海报设计', tags: ['生成', '海报'] },
  { id: 's-algo-art', kind: 'virtual', title: '算法艺术创作', content: '帮你用代码创作生成算法艺术，实现可交互的个性化创意美学作品', tags: ['生成', '艺术'] },
  { id: 's-douyin-shop-video', kind: 'virtual', title: '抖店短视频生成', content: '输入抖店链接，通过聊天就能生成高质量营销短视频', tags: ['生成', '电商'] },

  /* ── 媒体处理 ─────────── */
  { id: 's-img-process', kind: 'virtual', title: '图片处理理解', content: '处理图片并提取图片文字，支持裁剪、翻转、压缩与 OCR 文本识别', tags: ['处理', '图片'] },
  { id: 's-av-process', kind: 'virtual', title: '音视频一站式处理', content: '一站式处理音视频剪辑、人声分离、画质增强等需求', tags: ['处理', '音视频'] },
  { id: 's-pdf-parse', kind: 'virtual', title: 'PDF 文档解析', content: '帮你解析PDF文档，提取内容转成Markdown或结构化格式', tags: ['处理', '文档'] },

  /* ── 搜索资讯 ─────────── */
  { id: 's-weibo-hot', kind: 'virtual', title: '微博热搜榜', content: '获取微博热搜榜和飙升榜并整理热点', tags: ['搜索', '微博'] },
  { id: 's-web-search', kind: 'virtual', title: '全网综合搜索', content: '进行全网公开信息搜索并做多源汇总', tags: ['搜索', '全网'] },
  { id: 's-precise-search', kind: 'virtual', title: '全网精准搜索', content: '帮你搜索全网获取最新信息，适合调研和事实核查', tags: ['搜索', '全网'] },
  { id: 's-wechat-search', kind: 'virtual', title: '微信公众号搜索', content: '微信公众号搜索利器，精准检索资讯并助力内容研究', tags: ['搜索', '微信'] },
  { id: 's-news-global', kind: 'virtual', title: '国内外新闻汇总', content: '国内外社会、科技、军事新闻汇总', tags: ['搜索', '新闻'] },
  { id: 's-news-mainstream', kind: 'virtual', title: '主流新闻聚合解析', content: '聚合八大主流平台的实时新闻并做深度解析', tags: ['搜索', '新闻'] },
  { id: 's-news-cctv', kind: 'virtual', title: '新闻联播内容提取', content: '帮你提取指定日期新闻联播的内容要点', tags: ['搜索', '新闻'] },
  { id: 's-hot-today', kind: 'virtual', title: '今日全网热点事件', content: '一站式查询微博、抖音、百度的今日实时热搜', tags: ['搜索', '热点'] },
  { id: 's-finance-news', kind: 'virtual', title: '财经资讯摘要', content: '自动搜索最新财经新闻与市场动态，总结核心内容', tags: ['搜索', '财经'] },

  /* ── 文本工具 ─────────── */
  { id: 's-deai-cn', kind: 'virtual', title: '去AI化神器中文版', content: '文本去 AI 化修饰工具，精准识别并修复夸大、排比等 AI 写作特征', tags: ['工具', '文本'] },
  { id: 's-ai-polish', kind: 'virtual', title: 'AI文本润色', content: '帮你改写AI生成的文本，去掉AI痕迹，让文字更自然', tags: ['工具', '文本'] },
  { id: 's-deai-content', kind: 'virtual', title: '内容去AI化', content: '去掉文本中的 AI 痕迹，使内容更自然真实', tags: ['工具', '文本'] },

  /* ── 研究 & 生活 ─────────── */
  { id: 's-deep-research', kind: 'virtual', title: '深度研究', content: '深度研究输出图文并茂的网页报告和飞书文档', tags: ['研究', '报告'] },
  { id: 's-meme-master', kind: 'virtual', title: '互联网玩梗大师', content: '帮你识别解读网络热梗的出处，也能创作、对接玩梗', tags: ['娱乐', '热梗'] },
  { id: 's-city-guide', kind: 'virtual', title: '网红城市查询', content: '整理网红城市推荐清单，规划打卡出行路线', tags: ['生活', '旅行'] },
  { id: 's-hotel-compare', kind: 'virtual', title: '国内酒店比价', content: '针对美团、去哪儿、携程、飞猪、途牛等平台的酒店搜索与价格比较', tags: ['生活', '酒店'] },
  { id: 's-travel-plan', kind: 'virtual', title: '旅行攻略规划', content: '帮你查询各类旅行相关信息，轻松搞定出行规划', tags: ['生活', '旅行'] },
  { id: 's-scenic-spot', kind: 'virtual', title: '国内热门景区介绍', content: '提供中国热门旅游景区 Top 100 的门票、攻略与行程规划建议', tags: ['生活', '旅行'] },
  { id: 's-recipe', kind: 'virtual', title: '中国菜谱生成大师', content: '查询各类中式菜谱，获取分步烹饪指导与食材清单', tags: ['生活', '美食'] },
  { id: 's-coupon', kind: 'virtual', title: '购买商品优惠信息查询', content: '实时汇总各类优惠，追踪神价、bug价与历史低价', tags: ['生活', '购物'] },
  { id: 's-law-search', kind: 'virtual', title: '国内法律检索专家', content: '精准检索法规、案例、学术文献等全品类法律资料', tags: ['研究', '法律'] },

  /* ── 真人创作者工具 ─────────── */
  { id: 's-r-douyin-hot', kind: 'real', title: '抖音热点榜', content: '每日汇总抖音热榜、飙升榜和挑战榜，提供选题方向', tags: ['抖音', '热点'] },
  { id: 's-r-xhs-analysis', kind: 'real', title: '小红书笔记分析', content: '查询小红书热门种草笔记，分析高赞结构与关键词', tags: ['小红书', '分析'] },
  { id: 's-r-comment-sentiment', kind: 'real', title: '评论区情感分析', content: '分析评论区情感倾向、高频词与粉丝反馈', tags: ['分析', '评论'] },
  { id: 's-r-comment-reply', kind: 'real', title: '评论回复文案', content: '基于评论语境生成符合个人语气的回复文案', tags: ['文案', '评论'] },
  { id: 's-r-hook-copy', kind: 'real', title: '视频钩子文案', content: '生成短视频前三秒钩子，抓住用户注意力', tags: ['文案', '视频'] },
  { id: 's-r-script', kind: 'real', title: '口播脚本生成', content: '将一句核心观点扩写成可直接口播的脚本', tags: ['文案', '脚本'] },
  { id: 's-r-content-plan', kind: 'real', title: '内容选题规划', content: '围绕人设与节奏，给出一周可执行的选题表', tags: ['文案', '规划'] },
  { id: 's-r-xhs-copy', kind: 'real', title: '小红书文案', content: '按小红书笔记结构生成标题 + 开头 + tag 的完整文案', tags: ['文案', '小红书'] },
  { id: 's-r-weekly-review', kind: 'real', title: '数据周复盘', content: '根据一周发布数据生成复盘报告和下一步建议', tags: ['分析', '复盘'] },
  { id: 's-r-audience', kind: 'real', title: '粉丝画像洞察', content: '基于互动数据还原粉丝画像，辅助商单和选题', tags: ['分析', '粉丝'] },
  { id: 's-r-brand-brief', kind: 'real', title: '品牌合作 brief 解读', content: '帮你解读品牌 brief，提炼必执行项与可谈判项', tags: ['商务', 'brief'] },
  { id: 's-r-outfit-advice', kind: 'real', title: '出镜穿搭建议', content: '按场景 / 主题推荐出镜穿搭并附关键词', tags: ['生活', '穿搭'] },
  { id: 's-r-thumb-gen', kind: 'real', title: '封面配图生成', content: '根据文案生成适配竖屏的封面图与构图建议', tags: ['生成', '封面'] },
  { id: 's-r-video-edit', kind: 'real', title: '剪辑节奏建议', content: '按口播时长给出卡点、切换与转场建议', tags: ['处理', '剪辑'] },
  { id: 's-r-voice-clone', kind: 'real', title: '口播音色克隆', content: '上传一段真人口播，克隆成可配其他脚本的音色', tags: ['处理', '音色'] },
  { id: 's-r-recipe', kind: 'real', title: '家常菜谱助手', content: '根据冰箱现有食材反推菜谱，给出克数与火候', tags: ['生活', '美食'] },
  { id: 's-r-travel-plan', kind: 'real', title: '出行行程规划', content: '按天生成机票酒店景点组合，支持城市比较', tags: ['生活', '旅行'] },
  { id: 's-r-wellness', kind: 'real', title: '每日作息建议', content: '根据作息目标生成一周可执行的休息 / 运动安排', tags: ['生活', '健康'] },
]
