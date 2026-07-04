# Worklog

每次改动的记录,最新在最上面。格式:`- 改了什么(为什么)` — 末尾可带 commit 短哈希;未提交标注「(未提交)」。

## 2026-07-05

- 新增发布视频表单页 PublishVideoPage.tsx(高保真还原抖音「发布视频」内容区:基础信息/
  设置封面/添加合集/自主声明/扩展信息/发布设置 + 右侧上传进度面板,纯占位数据、CSS 占位图),
  接入 CreatorCenterHome 左栏「发布」按钮与首页「发布高清视频」卡片(page='publish-video')。(未提交)

## 2026-07-04

- 【事故恢复】备份 commit de80b2b 之后的未提交改动被 21:23 的 git reset --hard +
  git clean 清空，已全部重建：直播管理折线图真实化（12点钟形+指标自洽）、首页
  home-overview 扩展（interaction/monetization/calendar/quickNav）+ HomeSections
  （互动管理/变现中心/活动中心日历/快速导航/页脚）+ 双栏布局、入口卡贴纸构图
  （EntryCard/StickerIcon/SmartCreateIcon/PublishTile，8 张分层 PNG 从 Figma 重下）、
  扇牌 hover（后卡自身左下角为圆心纯旋转 4°、spring 回弹）、左侧菜单 icon 颜色统一
  （svg 填充统一纯 #252632 无透明度，选中深/未选中 45% 灰）、TopNav/页签 nowrap、
  首页自适应断点。唯一无法恢复：用户放的 public/icons/直播.svg（用户素材，浏览器
  缓存无副本）——直播管理菜单暂回退 lucide Video 图标，待用户重新提供。

## 2026-07-03

- 左侧栏菜单文案四字化（除首页）：内容→内容管理、收入→收入变现、服务→创作服务
  （直播管理/数据中心已四字，首页保持）。并统一子页四周间距：去掉数据中心页多余的
  卡外裸标题「数据中心」——它使第一个卡片比其他页低一截；去掉后各子页第一个卡片
  top/left 完全对齐（实测 72/208 一致，标题改由各卡自带）。(未提交)
- 新增「数据中心」菜单 + 首页改版（Figma 904-67124）：左侧栏首项「数据」改名
  「首页」（home 图标），新增「数据中心」项（在内容下方/收入上方）。原首页底部的
  数据总览（雷达）/作品数据/粉丝数据三块整体移入数据中心；新首页底部换成「数据概览」
  板块——最新作品卡（封面+时长+标题+播放/点赞）、账号总览/直播数据 tab + 播放量
  面积趋势图 + 8 个概览指标（较前7日增减，涨红跌绿），右上「查看详情」跳数据中心。
  数据走新端点 `/api/creator/home-overview`（server 聚合近7 vs 前7日差值，三运行
  环境+Vercel 转发）；api.ts 增 useHomeOverview，HomeCharts 抽通用 SimpleAreaChart。(未提交)
- 创作服务三个子页 + 直播管理页 + 头像权限开关：
  · 活动管理（Figma 904-65050）`ActivityPage`：活动灵感招募卡（分页）+ 我的活动表格
    （待开始/审批中/进行中/被驳回/已结束多状态、虚拟/实物奖励、搜索）。
  · 原创保护（904-65582）`CopyrightPage`：蓝色横幅+原创度三步进度、原创权益 7 图标、
    视频讲解（分页）、原创消息公告。
  · 抖音指数（904-64366）`DouyinIndexPage`：顶部页签、同心圆背景+关键词气泡、
    关键词/达人/… tab+搜索、我的订阅空态、实时/飙升双热点榜（前三奖杯+升降箭头）。
  · 直播管理（904-69330）`LivePage`：权限菜单，由顶栏头像里的开关控制，开启时插在
    「内容」上方；封面+时长、火花线+四指标、直播回放/高光/下载/详情/删除操作。
  头像改为 radix Popover（账号信息+「直播管理」iOS 开关，live-store 内存态；关闭时
  若停在该页回落数据看板）。数据走 4 个新端点 activities/copyright/index-hot/lives
  （server 确定性生成，三运行环境+4 个 Vercel 转发接线）；api.ts 抽 makeResourceHook
  通用无参 GET hook。icons 补 Trophy/Gavel/ArrowsLeftRight。(未提交)
- 作品共创页（Figma 904-68923，创作服务→作品共创子项）：新增 `CollabPage.tsx`——
  蓝色渐变横幅（CO 标记+共同创作公约）、剩余次数/常见问题分页卡、共创作品列表
  （封面共创角标+时长、标题、日期、共创人头像叠加组、状态文案），四种状态：正常/
  关系已解除（灰）/整体被平台解除（橙警告条）/部分共创人被解除。数据走新端点
  `/api/creator/collab`（server 确定性生成 6 条，三运行环境接线+api/creator/collab.js）；
  api.ts 增 useCreatorCollab；侧栏 service:作品共创 路由到该页。(未提交)
- AI分身落地页（Figma 891-22823）：新增 `AvatarLandingPage.tsx` 替换占位页——
  ASCII 世界地图纹理打底 + CSS 模糊光斑 + 3D 分身主视觉（素材白底烘死在像素里，
  用 mix-blend-multiply 让白色视同透明）、标题「创所未见 · AI分身」、Ailee 账号
  开通卡（去开通→toast）、AI 聊天/互动空间两张场景卡。5 张素材从 Figma 截取到
  public/icons/creator-center/（hero 初次误截模糊装饰层，改取 891:22894 头像
  节点）。注：preview 截图通道中途故障，视觉部分以计算样式+canvas 像素采样验证。(未提交)
- 首页左侧栏图标换用 public/icons 新素材：发布.svg（黑底按钮内反白）、数据.svg、
  icon.svg（内容）、收入.svg、创作服务.svg；MaskIcon 从 TopNav 抽为独立共享组件
  （CSS mask + currentColor），SIDE_MENU 配置改为 icon URL，删除 lucide 的
  TrendingUp/Coins/Zap 引用。(未提交)
- AI 工坊侧栏删除「运营数据」tab（数据看板已由创作者中心首页承载）：nav 数组
  移除条目，PlatformSidebar 的 onOpenDataOps 属性清理；发布 drawer 里的运营
  数据入口保留。(未提交)
- 载入动画从整页下沉到内容区：外壳（CreatorCenterShell）不再包 motion 整页
  淡入，改为 CreatorCenterHome 内容区（SideNav 右侧）按 page 键控淡入——切
  数据/内容/收入时左侧栏与顶栏完全静止，只有 main 内容动。实测切换动画中
  侧栏/头像漂移均为 0px，内容区透明度过渡可见。(未提交)
- 修切 tab 时顶栏右侧头像晃动：切页淡入动画（y 8→0）会让内容瞬时溢出视口
  底部、文档滚动条闪现→视口宽度抖动→右对齐头像左右跳。外壳内容区加
  overflow-hidden 裁掉瞬时溢出。实测两段切换动画 117 帧采样头像漂移 0px。(未提交)
- 再修顶栏切 tab 晃动：胶囊动画由欠阻尼 spring（会过冲回弹）改为 250ms tween
  ease-out；borderRadius 移入 style 让 framer 在缩放插值时实时校正圆角变形。
  实测动画全程 48 帧采样，按钮最大漂移 0.03px。(未提交)
- AI 工坊侧栏融入大产品：删掉顶部 logo 遗留空块与「收起侧栏」按钮（侧栏常驻，
  PlatformSidebar 移除 onCollapse/themeMode/onChangeThemeMode 死属性）；删掉
  底部账号区（张俊/通知/客服/外观设置，账号统一走创作者中心顶栏）；侧栏默认
  宽度 232→176px，与创作者中心首页/内容/收入页左栏一致。(未提交)
- 修顶栏切 tab 整体晃动：激活态字重从 normal→medium 的宽度变化会让绝对居中的
  菜单条整体重排，全部 tab 统一 font-medium 后按钮宽度恒定（实测切换前后
  各 tab x 坐标位移为 0）。(未提交)
- 顶部 tab 切换过渡动画：激活胶囊用 framer-motion 共享 layoutId 在按钮间
  弹性滑动（spring 420/34），文字/图标颜色 300ms 过渡；非工坊页面切换时
  内容轻微淡入上移（工坊 keep-alive 用 display 切换不参与动画）。(未提交)
- 顶栏换用 public/icons 新 SVG 素材：logo.svg 整体替换音符+文字组合；五个产品
  菜单图标换为 ic-nav-Home/分身/book-open-02/Creation/terminal-square（TopNav
  以 CSS mask + currentColor 着色，激活态自动反白）；右上角由「通知铃铛+角标」
  改为「星光余额」（AI.svg 四角星 + 数量，创作激励计量单位，STARLIGHT=276）。
  另：项目目录由 vibecoding-editor-main-jf 改名为 CreativeStudio。(未提交)
- 创作者中心「收入」页（Figma 904-81576）：新增 `IncomePage.tsx`——我的变现
  （昨日/近7日/近30日/可提现四个金额页签，点击真实切档；趋势图 tooltip 按
  星图任务/小程序推广/音乐推广三来源拆分；昨日档按小时 24 点）、商单任务
  进行中（精选商单行）、变现广场（页签+高收益/保底收入/合作过筛选+搜索均
  可用，卡片为静态营销配置）。数据走新端点 `/api/creator/income`
  （server/creator-data.mjs 从播放表按 RPM 推导收入并按来源确定性拆分，
  三运行环境接线 + api/creator/income.js）。api.ts 增 useCreatorIncome +
  fmtYuan。(未提交)
- 内容管理页「所有时间」改为真实时间筛选：FilterSelect 支持图标态，预设
  所有时间/近7天/近30天/近90天，按作品 publishedAt 与当日回推的下限过滤。(未提交)
- AI 工坊侧栏适配外壳：移除左上角「抖音AI工坊」品牌 logo（与创作者中心顶栏
  重复），「+ AI 创作」按钮从黑底改为白底黑字 + 描边（保留彩虹 hover 光晕）。(未提交)
- 创作者中心「内容管理」页（Figma 904-96111）：作品行提取为独立组件
  `WorkRow.tsx`（封面+置顶/张数/时长角标、标题+行内操作、活动标签、日期状态、
  近14天火花线+指标条——图文/视频指标集不同、流量升降通知条），`ContentPage.tsx`
  铺列表+工具栏（作品/合集页签、体裁/发布状态筛选、搜索均可用；置顶切换/删除为
  内存态演示）。数据来自新端点 `/api/creator/works`（works 表推导累计指标+火花线；
  通知条按「近7日实际衰减 ÷ exp 预期衰减」真实判定，修正了朴素环比人人流量减少的
  问题）；左侧栏状态提升，数据/内容页可切换，其余菜单为建设中占位。修复 spark
  数组误 reverse 导致火花线时间轴翻转的 bug；icons 补 Lock 导出。(未提交)
- 数据总览雷达图五个指标浮签可点击：选中态跟随点击，右侧切换为该指标的
  「{指标}分析」（数值/同类中位数/百分位由接口按维度返回）+「{指标}贡献TOP3」
  （播放量/涨粉按播放贡献、完播率/互动率按作品率值排序、作品数列出本期发布，
  server/creator-data.mjs 为每个维度生成 topWorks + peerMedian + valueKind）。(未提交)
- 创作者中心首页数据改为 mock 后端驱动：新增 `server/creator-data.mjs`
  （确定性生成的 daily_stats 60 天表 + works 作品表 + peer_benchmarks 同类基准表，
  按日期字符串做种子，重启/多环境数据一致），暴露 `GET /api/creator/stats?range=
  yesterday|week|month`——聚合、正态 CDF 百分位（「超过 xx% 同类作者」）、渠道拆分、
  逐日 Top3、昨天档按小时拆 24 点都在服务端算；dev(Vite 中间件)/prod(Express)/
  Vercel(api/creator/stats.js) 三处接线。前端删掉全部硬编码数字：新增 api.ts
  （类型 + useCreatorStats hook，含缓存 + 并发去重），三个数据面板独立 range
  真实重查、指标页签切真实序列、雷达图/分析文案/TOP3/资料头数字全部来自接口，
  加载骨架 + 错误占位。(未提交)
- 产品升级为「抖音创作者中心」外壳：新增 `src/modules/creator-center/`
  （TopNav 顶部产品菜单 + CreatorCenterHome 数据首页 + PlaceholderPage 占位页 +
  CreatorCenterShell 路由外壳），按 Figma「抖音AI创作工具盘点/数据」稿实现——
  资料头、智能创作/作品发布入口卡、数据总览（recharts 雷达图 + 指标浮签）、
  作品数据/粉丝数据（面积趋势图 + 富 tooltip）。现有抖音 AI 工坊挂在顶栏
  「AI工坊」入口下（fixed 根元素/侧栏改读 `--cc-top` 让位 48px 顶栏，首次进入后
  keep-alive 保持工作状态）；AI分身/百科/随变 为「即将上线」占位页。新增
  recharts 依赖、`Coins` 图标导出、入口卡图取自 Figma（public/icons/creator-center/，
  均 <15KB）。顺带 compress-images 全量跑了一遍，27 张存量图压小 631K。(未提交)
- dev server 支持端口自动切换：vite.config.ts 读取 `PORT` 环境变量，launch.json 开启
  `autoPort`（5173 被其他会话占用时预览能自动换端口启动）。(未提交)

## 2026-05-22

- H5 编辑面板改成可拖动浮层（默认右侧 → 跟随选中对象）：新建 `H5FloatingEditPanel.tsx`
  （`position:fixed` 卡片 z-50，宽 300、高 min(72vh,540)；useLayoutEffect 在 selection
  变化时定位——有 `data-h5-active` 节点就放到它右侧+16px 间隙、否则默认右侧 24px；
  header pointerdown 起拖、window 监听 move/up，全程 clamp 进视口；窗口 resize 也 clamp）。
  `H5LayerEditPanel` 加 `floating` + `onHeaderPointerDown`：header 变 cursor-move 拖拽手柄
  并加 Move 图标，关闭按钮 stopPropagation 防误拖。`MarketingH5Preview` 给当前选中的
  El/Selectable 打 `data-h5-active` 供浮层定位。VibeCodingPage 把 marketing-h5 从右侧
  停靠列排除、改渲染浮层（预览因此满宽）。实测：默认右侧→点主标题/抽奖按钮浮层跟到
  元素旁(gap16)、拖 header 精确位移(-300=±300)、拖后再选新对象会重新跟随。tsc 通过。(未提交)

- H5 编辑改两级选择（楼层 + 楼层内元素，原来只能选整楼层颗粒度太粗）：
  `H5LayerEditPanel` 把选择从 `H5LayerId | null` 升级为 `H5Selection`（layer /
  element 两态，null=整体配置），新增元素级编辑器——文本(文案·字号·文字颜色·
  对齐·加粗) / 按钮(文案·底色·文字颜色·圆角) / 图片(缩略图 + 上传·再次生成·画布
  编辑 + 适配方式)，header 面包屑「楼层 / 元素」、footer 跟着变。`MarketingH5Preview`
  把原来全覆盖 overlay 的 `Selectable` 改成不挡内部点击的楼层环（楼层选中=实线环+
  四角手柄+标签，楼层内有元素选中=淡环），并加 `El` 元素拾取器包住各楼层关键原子
  （头图图片/主标题、介绍标题/正文、抽奖标题/名单/抽奖机图/抽奖按钮/我的奖品按钮、
  任务标题/任务名/CTA、规则标题/正文），非编辑态 `El` 原样透传保证像素不变。
  VibeCodingPage 状态 `h5SelectedLayer→h5Selected` 并改 props（selected/onSelect、
  selection）。实测：点主标题→元素文本编辑器(预填文案+字号20+对齐居中)、点抽奖按钮→
  按钮编辑器(预填「立即抽奖」)、点头图→图片编辑器(缩略图+三动作+适配)、点倒计时空白
  →楼层编辑器、点背景→整体配置；tsc 通过。(未提交)

- AvatarPicker 加 `showUrlInput` 开关：右侧「编辑」面板隐藏「图片地址」输入行
  （传 `showUrlInput={false}`，无 URL 行时按钮与缩略图垂直居中），只留上传/生成；
  「基础信息」表单仍保留地址行。(未提交)

- 分身头像支持本地上传 + AI 生成：新增共用组件 `AvatarPicker.tsx`（缩略图 +
  图片地址输入 + 「本地上传」+「AI 生成」），接入 `ProductEditPanel`（编辑面板）
  与 `AvatarBasicInfoForm`（基础信息表单）两处。本地上传走真实 `<input type=file>`
  → FileReader 读成 data URL；Kimi 无文生图能力（仅 Chat + Vision 输入），故 AI 生成
  改用免费头像服务 DiceBear（adventurer 风格）按「分身名称+描述」当 seed 出图，
  自增计数让每次点击换一张。实测：AI 生成 seed 0→1→2 各出一张并成功加载、本地上传
  注入 PNG 即时渲染 data URL。(未提交)

- 从 0 生成分身（端到端）+ 运行时配置 store：新增 `artifact/runtime-config-store.ts`
  （zustand，按项目名存放 AI 生成的配置，覆盖静态 mock；默认空 ⇒ 5 个 demo 仍走静态）
  与 `artifact/generate.ts`（`generateAvatarConfig` 用 Kimi 流式产出 JSON 配置，
  extractJsonObject 去 ``` 围栏 + 取最外层 {}，asString/asStringArray 归一化，缺字段
  回退 DEFAULT_AVATAR_PREVIEW，输出完整 AvatarAppConfig 含 preview 块）。VibeCodingPage
  订阅 runtimeConfigs，分身/小程序/H5 三处渲染改成 `runtimeConfigs[projectTitle] ?? 静态`；
  submitFromHome 在 kind==='ai-avatar' 时调 generateAvatarConfig→setRuntimeConfig，
  若仍在该项目则打开预览。补 projectTitleRef 解决闭包陈旧。实测：首页输入「会聊星座
  情感的分身·小星」→ 右侧实时渲染生成的「小星情感师」(bio/欢迎语均来自 Kimi)，
  且陶白白等 demo 仍渲染各自静态配置、无串味、像素不变。(未提交)

## 2026-05-21

- 配置驱动产物（第三刀·H5）：新建 `MarketingH5ConfigData.ts`(MarketingH5PreviewConfig +
  DEFAULT_MARKETING_H5_PREVIEW + 按项目名注册表 + getMarketingH5Preview)；
  MarketingH5Preview 各区块(头图/倒计时/介绍/抽奖/任务/规则/footer)改成读 preview
  渲染，布局/装饰/图层选择仍是框架；六一活动配置=默认值，渲染处传 preview。
  实测六一 H5 与改前像素一致、无报错。至此 内容型(分身/小程序/H5)均配置驱动，
  网站/游戏归 embed 不动，提案本就数据驱动。
- 配置驱动产物（第二刀·小程序）：MiniAppPreview 4 个页面（首页/塔罗/聊天/个人）
  改成读 `MiniProgramConfig.preview` 渲染——新增 `MiniProgramPreviewConfig` +
  `DEFAULT_MINIPROGRAM_PREVIEW`(场景图/头像/卡池/导航标题/首页/塔罗文案/聊天/个人)；
  塔罗小程序配置带上 preview=默认值；渲染处传 config。金色主题 + 翻牌机制 + 布局
  仍留在渲染器作框架。内容(文本/图/数据)走 config，便于按场景拆模块各自维护。
  实测塔罗 4 屏与改前像素一致、无报错。
- 配置驱动产物（第一刀·分身）：把 AI 分身预览从写死改成读配置——AvatarConfig 新增
  `preview`(displayName/avatar/bio/timestamp/seed对话/评论thread) + `DEFAULT_AVATAR_PREVIEW`
  兜底；`AiPersonaChatPreview` 接 `config` 渲染（私信+评论两屏全部读 config，无 config
  时回退默认）；陶白白配置带上 preview=默认值。VibeCodingPage 渲染处传
  `config={getAvatarConfig(projectTitle)}`。目标：框架真、配置当 mock，换 config=换产物。
  实测陶白白两屏与改前像素一致、无报错。(未提交)
- 首页进入对话流时右侧预览默认不打开（Artifacts 语义）：home 创建的项目延迟打开
  右侧（initProjectDefaults 加 deferProduct → openTabs=[]），仅在产生可预览产物时
  打开——任何后续 sendChat（追问/点修改建议）或脚本流程产出（formSubmitted /
  触发器确认 / 提案 / 游戏已有的延迟）触发 seedProductTabs。初始 home prompt 用
  `sendChat(text,{fromHomeEntry:true})` 排除。侧边栏打开的既有项目不受影响、照常
  立即显示。实测：提交后右侧关、首次交互后打开、既有项目立即打开。(未提交)
- VibeCodingPage 瘦身（god 组件拆分 阶段0 切片）：抽出 `proposal-docs.ts`(7 个提案
  markdown 生成器 + PROPOSAL_FILE_SUMMARY)、`FigmaIcon.tsx`(共享图标)、
  `PlatformHome.tsx`(PlatformHome + SceneGlyph + HOME_SCENES + 类型)；清理随之
  失效的 import(PROPOSAL_* / Bot)。VibeCodingPage 9914→9231 行(−683)。tsc 通过、
  预览实测首页/场景 flyout/提案文档均正常。PlatformSidebar(640 行,prop 较重)留作
  下一步。(未提交)
- 工程优化（建议 1-4）：
  · 健壮性：新增 `shared/components/ErrorBoundary`，包住 App 根 + 右侧预览
    (resetKey 跟 项目/tab 走)，单个预览崩溃不再白屏整个壳。
  · 交互反馈：`ToolbarAction` 无 onClick 时默认弹 toast「「X」功能演示中…」，
    避免 demo 动作点了没反应。
  · 性能：给重的预览/页面组件加 `memo`(AgentHubPreview / GarudaGamePreview /
    MiniAppPreview / AiPersonaChatPreview / ResourceHub / DataOpsView),顶层
    状态(缩放/控制台等)变化时这些子树不再全量重渲染(props 均为稳定值)。
  · 缩放拖拽：确认缩放已限定在 previewSurface(预览 tab),画布编辑/分隔条/控制台
    等坐标型拖拽都在缩放区域外,预览本体内无坐标型拖拽 → 无需改动。
  预览实测:toolbar 动作弹 toast、资源库/运营数据正常渲染、无报错。(未提交)
- 分身「技能」工具栏加上「跳转」操作(原来只有知识库有):技能/知识库分支统一渲染
  添加 + jumpToSourceAction;跳转 toast 文案泛化为「正在跳转到来源…」以适配技能。
  预览实测技能 tab 出现 添加 + 跳转。(未提交)
- 预览缩放居中修复 + 按钮手型:① 缩放改为以视口中心为锚——给预览画布加 ref,
  previewZoom 变化时把 scrollLeft/Top 居中(溢出时 m-auto 会退化成左对齐导致内容
  偏移)。② 修复 Tailwind v4 preflight 去掉的 button 手型:index.css 加全局规则,
  让 enabled 的 button/[role=button]/label[for]/summary 显示 cursor:pointer;并把
  该约定写进 CLAUDE.md。(未提交)
- 预览缩放范围收窄:只缩放「手机预览/产物画布」本体,不再缩放上方 toolbar 和点阵
  背景。把缩放容器从「整个 IIFE 外层」移到 phoneView 里只包 previewSurface
  (画布区改 overflow-auto + sizer m-auto 居中);缩放控件只在「预览」tab 显示。
  实测 toolbar 尺寸不变、手机随缩放变化并居中。(未提交)
- 预览缩放微调:① 改为以画布中央为锚点(缩放视口 flex + sizer m-auto,缩小居中、
  放大从中间扩展且可滚动);② 缩放控件与左侧 terminal 切换的阴影减轻
  (0_6px_18px/0.5 → 0_2px_8px/0.1)、底色统一改成白色 + 极淡边框。(未提交)
- 首页输入框 placeholder 改为「请描述你的需求，我来帮你完成～」。(未提交)
- 右侧预览右下角新增缩放控件(− / 百分比 / +,点百分比重置):整体按比例缩放
  预览内容,50%–200%、步进 10%。实现用「百分比 sizer + transform scale」——内容
  按自然尺寸渲染再整体缩放,>100% 可滚动、<100% 在面板内缩到左上;外层标签/发布
  等 chrome 不缩放。新增 previewZoom 状态、icons 补 Minus。预览实测 100/120/60%。(未提交)
- 分身代码文件里的 persona.yaml(陶白白 Sensei)从 28 行简版扩成 80 行丰富版:
  新增 meta / identity(role·background·audience·goal·greeting) / persona
  (tone·style·pace·traits·values) / voice(口头禅·emoji·禁用词) / principles /
  examples(few-shot) / guardrails / knowledge_refs·skill_refs。预览实测代码视图
  正常渲染高亮。(未提交)
- 游戏「玩法」对象加回到标签页的「+ 添加」菜单(不放回左侧产品列表):gameView
  仍隐藏 玩法,但 VibeCodingPage 的 + 菜单对 web-game 额外插入「玩法」行(排在
  代码文件前)。点开即打开 玩法 标签页(ProjectObjectViews 已有的核心循环/武器
  系统/敌人波次/Roguelike/Boss/道具掉落卡片视图)。预览实测 + 菜单出现玩法、左侧
  无玩法、点开渲染正常。(未提交)
- 修复游戏画布编辑(ImageCanvasEditor)选中图片的浮动工具条不跟随的问题:原来
  工具条固定在画布顶部居中(`left-1/2 top-3`)。改为按选中图片定位——浮在图片
  上方(空间不足时翻到下方)、随拖动与画布滚动跟随,并在视口内夹取(条比画布宽
  时居中)。新增 scroll 状态 + onScroll,工具条用 useLayoutEffect 量自身宽度做
  夹取。预览实测拖动时工具条跟随。(未提交)
- 资源库「知识库」按设计稿落地图片卡:照片 banner + 居中 48px 圆角图标浮层 +
  标题/数量(同行)/描述。从标准知识库取 8 张(数据 6 + 结构化 2),照片缩到
  584px、图标缩到 96px 存 `public/assets/resource-hub/knowledge/`;KnowledgeBase
  数据加 `image`/`icon` 字段,KNOWLEDGE_FILTERS 裁剪为 全部/数据知识库/结构化
  知识库;cards.tsx 新增 `KnowledgeBanner`、抽出复用的 `UsageCount`,删除弃用的
  `CountPill`。预览实测卡片渲染与分类筛选正常。(未提交)
- 统一右侧面板底色为 `--color-surface-0`(#fafbfc):创意广场 AgentHubPreview
  去掉白→#f8f9fb 渐变 + 创意广场 wrapper `bg-white`→surface-0;Skills
  ResourceLibraryView 根容器与两处 sticky 头由 `bg-white`→surface-0(资源库/
  运营数据本就是 surface-0)。
- 右侧面板加载入动效(参考创意广场的淡入上浮):ResourceHub body 按 tab
  keyed `motion.div` 淡入上浮(切 tab 也重播);Skills/运营数据在
  VibeCodingPage 的 wrapper 包成 `motion.div` mount 淡入上浮(创意广场本就有
  分段 stagger)。预览实测四个面板底色一致、载入有动效。(未提交)
- 资源库「工具箱」卡片改为设计稿的图片版:卡片顶部用真实预览图 banner
  (替换原渐变+气泡 mock),底部 footer 改为 抖音icon+来源｜日期｜使用量。
  从设计稿取 8 个真实工具(覆盖 6 个分类),预览图下载并用 tinify 缩放到
  584px 宽 + 压缩(5–24KB)存到 `public/assets/resource-hub/tools/`;TOOLS
  数据精简为这 8 条并加 `image` 字段,TOOL_CATEGORIES 裁剪到现有分类;
  cards.tsx 新增 `ImageBanner`/`ToolFooter`,删除弃用的 `BubbleBanner`/
  `MetaFooter`。资源库预览实测正常。(未提交)
- AgentHubPreview 在「精品推荐」和「发现更多」之间新增「业务产品」模块:从 Paper
  设计稿落地 11 张产品卡(图标/标题/标签/描述),图标下载到
  `public/assets/agent-hub/business/`(7 个唯一 webp,均 ≤2KB);新增
  `BUSINESS_IMG` 常量、`businessProducts` 数据与 `BusinessProductCard` 组件,
  网格 `grid-cols-1 @[560px]:grid-cols-2 @[900px]:grid-cols-3`。创意广场预览实测
  正常渲染。(未提交)
- AgentHubPreview 精品推荐从一排 3 个改成一排 5 个:`slice(0,3)`→`slice(0,5)`、
  网格 `@[460px]:grid-cols-3 @[720px]:grid-cols-5`(展示全部 5 个 featured)。
  预览实测创意广场精品推荐一排 5 个。(未提交)
- 创意广场里隐藏 AgentHubPreview 自带的二级左侧导航:`AgentHubPreview` 新增
  `hideSidebar` prop(默认 false,web-app 项目预览不受影响),为 true 时不渲染左侧
  `<aside>` 栏;创意广场处传 `<AgentHubPreview hideSidebar />`。tsc 通过,预览实测
  创意广场内容铺满、无二级侧栏,项目预览侧栏仍正常。(未提交)
- 创意广场菜单直接复用「抖音 AI 工坊设计探索」页面:`platformCreativeSquareOpen`
  从 `PlatformPlaceholderView` 占位改成渲染 `<AgentHubPreview />`(同 web-app 项目
  预览,容器加 `@container bg-white`)。`PlatformPlaceholderView` 已无引用,删掉
  其 import。tsc 通过,预览实测创意广场显示智能体广场(Hero/精品推荐/发现更多)。(未提交)
- Skills 菜单页精简:页面标题从「资源库」改成「Skills」,去掉顶部 type tabs
  (Skills/工具、知识库、模型、发布器)整行——Skills 下不再出现知识库/模型/发布器。
  `ResourceLibraryView` 内删除 `TYPE_TABS` 渲染+常量、`onTypeFilterChange` prop、
  `CAPABILITY_LABEL` import;父组件 `typeFilter` 直接传 `"skill-tool"` 字面量,
  删掉 `resourceLibraryTypeFilter` state 与 `ResourceLibraryTypeFilter` import。
  tsc 通过,预览实测标题为 Skills、无 type tabs、来源树/卡片正常。(未提交)
- Skills 菜单改回「原封不动」搬原资源-Skills 页:左侧 Skills 菜单不再渲染脑补的
  `SkillsHub`,而是直接挂回原 `ResourceLibraryView`(默认 `typeFilter='skill-tool'`,
  保留来源树/内场外场/真实 RESOURCES 卡片)。恢复被删的 `resourceLibrary*` state、
  `toggleResourceLibraryExpanded`、`useCapabilityInChat`、`ResourceLibraryView`/
  `TypeFilter`/`PrimaryCategory` import;删除不再使用的 `resource-hub/SkillsHub.tsx`。
  资源库菜单仍是新的 5-tab `ResourceHub`。tsc 通过,预览实测 Skills 菜单显示原页、
  资源库显示 5 tab,无报错。(未提交)
- 资源库照图整体重建(抽象组件 + 脑补数据):新建 `resource-hub/`(`data.ts` 脑补
  工具/知识库/模型/发布器/触发器/Skills 数据;`cards.tsx` 可复用卡片原语:Chips/
  FilterGroup/SectionTitle/CardShell/各类 Banner/CardBody/MetaFooter;`ResourceHub.tsx`
  5 tab 页;`SkillsHub.tsx` Skills 菜单页)。资源库改为 工具箱/知识库/模型库/发布器/
  触发器 5 tab;Skills 从资源库移到左侧 Skills 菜单。替换并清理了旧 ResourceLibraryView
  的渲染 + 相关 state(resourceLibrary*/useCapabilityInChat 等)。tsc 通过,预览实测
  5 tab 内容、Skills 菜单、即将上线徽标均正常,无报错。(未提交)
- 分身项目隐藏「人设」对象(产物视图 + 默认 tab 都去掉),把人设落成真实文件
  `avatar-agent/persona.yaml`(加进 aiPersonaFileTree + codeFiles,YAML 含
  `# 人设`/`# 知识库`/`# 技能` 映射注释),在「代码文件」里可查看。tsc 通过,
  预览实测:人设 tab/对象消失、代码文件显示 persona.yaml 及注释。(未提交)
  ⚠ 审计发现:各项目「代码文件」用的是同一份按文件名匹配的全局 codeFiles,导致
  web-app(设计探索)的 index.tsx/api.ts 错配成了小程序(Taro)代码;avatar 除
  persona.yaml 外其余配置文件无代码内容。待后续按项目重构 codeFiles。
- 侧栏顶部按钮「新建项目」改为「AI 创作」并左对齐(icon size16 + px-2,与下方
  Skills/资源库等菜单图标对齐,实测都在 left:20);Tooltip 高度调为 24px(`h-6`,黑底)。
  tsc 通过,预览实测对齐 + tooltip 24px 黑色。(未提交)
- 项目列表头部:新增「查看全部项目」icon button(folders 图标,点击展开全部项目);
  三个图标加大(`h-5 w-5`/size12 → `h-6 w-6`/size15);原生 `title` 全部改用新建的
  黑色 Tooltip 组件 `Tooltip.tsx`(基于 `@radix-ui/react-tooltip`,黑底白字+箭头、
  portal 不裁切)。tsc 通过,预览实测:3 按钮无原生 title、展开全部生效、hover 出
  role=tooltip。(未提交)
- 左侧 chat 对话流内容左右 padding 加大:消息容器 `px-2.5`→`px-5`、输入框
  `mx-2.5`→`mx-5`(保持对齐),内容不再贴边。实测左右各 20px。(未提交)
- 运营数据页「已发布项目」左侧图标改用项目对应图片(复用发布抽屉的
  `getPublishObjectVisual`/`PublishObjectVisualThumb`,从 PublishDrawer 导出),
  与发布下拉保持一致;原来是按 kind 的通用 lucide 图标。tsc 通过,预览实测各 kind
  图标正确(分身/小程序/H5/游戏=图片,web-app=`S°`角标)。(未提交)
- 首页 slogan 改为「所见即所得，链接抖音生态」(原「所见即所得，一站式满足需求」)。(未提交)
- Radix Popover 样例:把侧栏底部「设置(外观)」浮层改成 `@radix-ui/react-popover`
  (portal 到 body → 不再被侧栏 overflow 截断;side=top align=end 往左上弹出 +
  collisionPadding 防溢出;`Popover.Close` 选完即关;沿用现有 token 样式)。删掉了
  原来的手写 `layoutMenuOpen`/`layoutMenuRef`/outside-click effect。tsc + vite build
  通过,预览实测:内容完整不截断、在视口内、切主题/关闭正常。 — `349e9b4`
- 设置弹层精简:两处设置/更多弹层(侧栏底部齿轮 + 顶部「更多」)去掉「布局」整段,
  只保留「外观」(亮/暗)。底部齿轮弹层从 `right-0` 改 `left-0`+缩窄,修复超出屏幕
  (实测无四向溢出)。顺带清理因此空出的 `setLayout`/`onChangeLayout`/`layout` props
  与 `Code2/Columns2/LayoutDashboard` 图标 import;layout 暂固定为 platform。
  tsc 通过,预览实测弹层只剩外观、在视口内。 — `349e9b4`
- 侧栏项目展开/收起加动画:用 framer-motion `AnimatePresence` + `motion.div`
  (height 0↔auto + opacity, overflow-hidden)包裹项目子对象树,展开收起平滑过渡。
  tsc 通过,预览实测展开/收起正常、有动画容器、无报错。 — `349e9b4`
- 侧栏置顶项目:把左侧 folder 图标替换成 pin 图标(`Pin`/`ti ti-pin`),并去掉
  原来跟在项目名后面的那个 pin。未置顶项目仍显示 folder。tsc 通过,预览实测置顶项
  左侧为 pin、未置顶为 folder、名称后无 pin。 — `349e9b4`
- 首页输入指令改为「新建项目」逻辑:`submitFromHome` 不再把 prompt 丢进现有
  小程序,而是按 prompt 分类(`classifyProjectKind`)生成一个全新项目(名字取自
  prompt),登记进侧栏(`createdProjects` + 新增 `createdProjectKinds` 动态 kind
  映射 + `kindOf()` 统一查询,替换主组件内所有 `PROJECT_KINDS[...]` 读取),切到
  该空项目并把 prompt 送入其对话(走需求收集等新建流程)。tsc 通过,预览实测:
  首页提交 → 侧栏出现新项目、面包屑切到新项目、右侧空态、需求流启动,无报错。 — `349e9b4`
- 重构 Step 2(抽离无状态组件,纯移动):抽出 `Toolbar.tsx`(`FlexAlignGlyph` /
  `ProductToolbar` / `ToolbarAction`)、`FileTreeView.tsx`(`getFileIcon` + `FileTreeView`),
  并清掉主文件因此空出的图标 import。主文件 10,079 → 9,820 行。tsc 通过,预览实测
  toolbar(知识库 跳转/添加)、侧栏树、代码视图均正常,无报错。 — `349e9b4`
- 重构 Step 1(瘦身 `VibeCodingPage.tsx`,纯数据外移、零逻辑改动):抽出
  `data/project-docs.ts`(项目文档 MD + `PROJECT_DOCS`)、`data/chat-suggestions.ts`
  (`GENERIC_AI_REPLIES` / 各 `CHAT_SUGGESTIONS_*`)、`data/project-kinds.ts`
  (`OutputShape` + `PROJECT_KINDS` / `SHAPE_BY_KIND` / `PROJECT_KIND_LABELS`)。
  主文件 10,497 → 10,079 行。tsc 通过,预览实测项目可正常打开、无报错。 — `349e9b4`
- 用 TinyPNG 批量压缩 `public/bg`、`public/assets` 下 59 张在用图片(头像≤512px、其余≤1600px,
  原地覆盖、文件名不变):**77MB → 12.6MB,省约 64.8MB**;`public` 295M→232M。
  新增 `scripts/compress-images.mjs`、`tinify` devDep、`.env` 的 `TINYPNG_API_KEY`。
  并把「图片必须压缩、保持小体积」写进 CLAUDE.md 规则。 — `349e9b4`
- 新增 `WORKLOG.md`(本文件)— 用于持续记录每次改动。 — `349e9b4`
- 新增 `CLAUDE.md` / `README.md` — 项目导航(给 AI)与项目介绍(给人)。 — `349e9b4`
- 删除 `public/` 下 62 个未引用的孤儿资源(约 51.5M,含 `models/character.glb` 19M、
  `bg/` 一批概念图/视频、`bg/presets|library|voice/` 等);保留动态引用的 `flex-align-*.svg`。 — `349e9b4`
- 对话内输入「我要发布」改为开关式「选择发布场景」卡片(对齐发布弹窗样式);
  `知识库 / 数据库`(三方引用数据)toolbar 新增「跳转」入口。 — `1e8090a`
- 接入真实 Kimi 流式对话:新增服务端代理 `server/kimi.mjs`(共享)、`server/index.mjs`(Express)、
  `api/chat.js` `api/health.js`(Vercel Functions)、`src/shared/api/chat.ts`(SSE 客户端);
  key 仅存服务端(`.env` / 平台环境变量),浏览器只访问同源 `/api/chat`。 — `7507aaf`
- 左侧项目树恢复内联展开「多子对象」(默认展开,3 级带竖线);
  游戏项目去掉 `知识库 / 数据库`;游戏预览去掉「新窗口打开」跳转按钮。 — `7507aaf`
- AgentHub 设计探索:精品推荐由 5 改 3 + 网格上限 3 列;Hero 标题字号调小;
  修复「+」下拉里重复的「代码文件」行。 — `7507aaf`
- 「+」标签下拉过滤掉已经打开为 tab 的对象。 — `040d0e3`
