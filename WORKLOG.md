# Worklog

每次改动的记录,最新在最上面。格式:`- 改了什么(为什么)` — 末尾可带 commit 短哈希;未提交标注「(未提交)」。

## 2026-05-21

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
