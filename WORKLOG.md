# Worklog

每次改动的记录,最新在最上面。格式:`- 改了什么(为什么)` — 末尾可带 commit 短哈希;未提交标注「(未提交)」。

## 2026-05-21

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
