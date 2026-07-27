# Worklog

每次改动的记录,最新在最上面。格式:`- 改了什么(为什么)` — 末尾可带 commit 短哈希;未提交标注「(未提交)」。

- Vercel 增加 `/sidebar` → `/index.html` 的精确 SPA rewrite，修复生产环境规范页直链 404，同时保持 `/api/*` Serverless Functions 不受影响（未提交）
- 发布前修复完整 CI 的 4 个 Lint 阻断：组件文件移除非组件导出、作品日期格式化抽到独立模块、渲染期时间改为模块级稳定值、百科标题移除全角空格并保持视觉间距（未提交）
- 所有共享侧栏下拉 / 展开图标统一为设计稿指定的 `chevron-down-small (Arrows)`，覆盖菜单、项目树、百科、随变与发布入口，并移除百科的实心三角特殊分支（未提交）
- 百科世界书目录的展开箭头改为尖角实心三角形，保留共享 Disclosure 的 24px 点击热区、位置配置与展开旋转（未提交）
- 百科 WikiSideNav 接入共享 SideNav 外壳与配色变量，统一底色、分隔线、宽度配置及目录行选中/悬停色，同时保留世界书多分组树和拖拽交互（未提交）
- /sidebar 全局布局样式二改用真实百科世界书目录导航，并让顶部产品导航默认选中「百科」（未提交）
- /sidebar「全局整体布局」新增左侧内容、右侧 440px 对话样式，复用现有侧栏/对话/内容蓝图，并按统一导航参考稿默认省略第二层对象工具条（未提交）
- Sidebar「发布作品」前置图标由 Add01 换成指定的 slide-wide-add（SlideWideAddLinearIcon），规范 Demo、收起态与真实创作者中心同步（未提交）
- 侧栏展开/收起箭头统一为共享 MasterIcon ChevronDown 16px：覆盖 SideNav 子菜单、项目/FileTree、百科、随变及发布作品下拉，保留各场景原点击热区与方向语义（未提交）
- /sidebar「查看 Diff」入口按反馈由文件形 Diff 图标改为方框内加减号的 Changes 图标（未提交）
- /sidebar 全局整体布局的「对象 1」工具栏右侧补充版本记录、查看 Diff、编辑三个图标按钮示范，并完善悬停提示与无障碍名称（未提交）
- SideNav 菜单行间距默认值由 4px 调为 0，并自动迁移旧的 4px 本地存档，使规范页与真实侧栏同步紧凑排列（未提交）
- /sidebar 各组合 Demo 改为独立且互斥的菜单/树选中态，移除项目父行常驻灰底；将两个 13px 字号标注收进主组件并恢复示例卡统一 32px 间距（未提交）
- 展开箭头配置收窄并更名为「树展开箭头位置」，仅控制 FileTree/项目树/世界书等树披露；创作服务等 SideNav 一级菜单固定在右侧，并兼容迁移旧配置字段（未提交）
- 项目列表/我的AI分身到上方菜单间距由 12px 调为 0；我的AI分身由 section Header 改为与塔罗小程序同级的 13px 一级可展开菜单，规范页与真实侧栏同步（未提交）
- /sidebar 组件配置新增「展开箭头位置」左/右切换并支持保存，统一驱动 SideNav 子菜单、项目/FileTree、世界书目录和我的AI分身分组；补枚举清洗与回归测试（未提交）
- 世界书目录标题字号由 14px 统一为与目录条目相同的 13px，并实测项目列表/我的AI分身到上方菜单间距均为 12px（未提交）
- /sidebar 右侧组件配置支持收起，收起后画布铺满并在页面右侧保留悬浮「组件配置」按钮用于恢复（未提交）
- AI 分身左侧栏名称改为读取陶白白分身配置，并将「资源库」到「我的AI分身」间距从 16px 对齐统一 SideNav 规范的 12px（未提交）
- SideNav review 收尾：修复子菜单深链同步、短视口滚动、收起焦点隔离与无障碍标签，统一全局宽度/主题/内边距，文件树补目录选中、24px 披露热区及完整路径去重；配置新增边界清洗、保存错误反馈、键盘编辑与回归测试（未提交）
- /sidebar 右侧组件配置输入框去掉与自身边框叠加的全局 2px 焦点环，数字、透明度与取色输入统一为单层 Semi focus 蓝色边框（未提交）
- SideNav 收起态总宽 61→60px，不再为右侧 1px 分隔线额外增宽；旧版默认 61 存档自动迁移，分隔线计入总宽（未提交）
- FileTreeView 文件夹图标按确认名称调整为收起 Folder2LinearIcon、展开 FolderOpenFrontLinearIcon，均不带附加箭头（未提交）
- FileTreeView 文件夹两态换成 MasterIcon 无附加箭头版本：收起 Folder2LinearIcon、展开 Folder02LinearIcon；左侧披露箭头继续只负责树展开（未提交）
- /sidebar 去掉主组件 Skills 前方的绿色 12px 左右内边距标注，保留真实内边距与右侧配置项，减少标注遮挡（未提交）
- 导航默认底色统一为 `background: var(--semi-color-nav-bg, #F2F2F7)`：共享 SideNav、世界书、随变及智能体广场导航全部接入，并迁移旧版默认白色存档（未提交）
- /sidebar 主组件宽度标尺从顶部移到组件下方，使其上沿与右侧场景卡对齐；移除独立的底部规格、选中状态与四级分类说明，只保留组件内标注（修改前已创建本地备份，未提交）
- /sidebar 配置区由悬浮抽屉改为参与横向布局的常驻右栏，固定占用 384px 并挤压主画布；暂时移除展开收起入口与动画（未提交）
- /sidebar 将顶部组件配置改为右侧可收起抽屉：默认仅露出 44px 配置标签，展开后双列滚动编辑，保存/重置固定底栏且不改变画布几何（未提交）
- 修复 /sidebar 规范画布因全局布局示例缺少导航常量与状态而运行时空白，补齐蓝图菜单、收藏项及受控选中态（未提交）
- 模块图标语义对齐:基础信息 File01→InformationCircle、能力配置/技能/技能库/能力技能 FolderCode→MagicWand01、智能体 BubbleChat→Bot(文件夹已是 Folder02/FolderOpen);画布卡片标题下说明小字全部移除(标尺补 mt-10 头顶空间);/sidebar 新增「全局整体布局」蓝图(按统一导航 321-41651,1440×900:顶栏 48/侧栏 220/对话列 440(Header 40·Composer 120·气泡 42/字 14)/右侧自适应(双工具栏 40·内边距 16),0.6 缩放标真实值);修 HMeasure 高度为 0 时两条虚线 key 冲突(未提交)
- 配置新增「侧栏底色」(bg,默认 #ffffff,注入 --sidenav-bg),配色组置顶,同样走取色器+透明度(未提交)
- 树箭头槽默认 14→16(与图标同宽),每级缩进随之 18→20(=槽 16+间距 4,子级箭头仍对齐父级图标);面板「列间距」改名「元素间距」(即行内 箭头槽↔图标↔文字 之间的 4px);修随变「我的世界」分组图标拉伸(earth.svg 16×12 被 size-4 拉成 16×16,加 object-contain 保比例)(未提交)
- 侧栏四周间距统一 12:上内边距默认 16→12,主按钮外壳去掉 pt-1(按钮距顶正好 12),底部收起导航 pb-4→pb-3(距底 12),左右本就 12;首页/工坊/随变挂载处同步,标注几何推导跟随更新(实测上/左/右/下全为 12,标注仍对齐)(未提交)
- 标注与配置联动:标注位置全部改由配置推导(g.menuRow/treeRow/图标列等,不再写死坐标),改配置时标注跟着组件一起动(实测行高 36→44 后标注仍与真实行对齐);所有读数(chip/字号框/顶部宽度标尺)带 editKey 可点击就地输入直改配置;lab 项目行的行高/左边距/字号也接入配置(未提交)
- 配置面板迭代:配色改原生取色器+透明度%(hex⇄rgba 双向解析),数值项改单列不再截断 label;画布卡片里组件自身右描边关掉(与卡片 ring 叠成两层);默认值统一:主按钮圆角 10→8(同菜单行)、字号 14→13(全组件 13);百科世界书卡挪到随变前(未提交)
- SideNav/树的属性抽成运行时配置(新增 side-nav-config.ts:zustand store,24 项尺寸+5 项配色):SideNav 把配置注入为 --sn-* 变量、FileTreeView/主按钮/图标直接读 store;/sidebar 右侧新增配置面板,修改实时同步所有挂载点,「保存」写 localStorage 全应用生效(验证:改行高 44→保存→首页真实菜单行 44),「重置」回默认;画布规格表读数跟随配置实时变(未提交)
- 标注去掉长引线(间距 chip 直接压在被量的那段上)、字号统一 13px(树行 12.5→13、项目行 12→13,与菜单行一致);文件夹图标换 Folder02/FolderOpen;工坊菜单「创意广场」改名「项目库」(icon 换 FolderLibrary);世界书目录抽成 WikiSideNav 导出并加进规范画布,树几何改走 FileTreeView 共享原语(箭头槽 14/缩进 18/行高 28)(未提交)
- 树图标 14→16(彩色底板 h-4 w-4 内芯 10、文件夹 16、文件 14 装 16 格),文字列相应 74/92→76/94;规范画布高度标注加竖向尺寸线(上下虚线一眼配对),间距/缩进 chip 全部移到组件底部空白区、虚线从色带引下(未提交)
- 树缩进按设计稿 249-18701 重定:每级缩进 18=箭头槽 14+间距 4,图标 14+间距 4 到文字,树基础左边距 8;项目行=箭头+名称(箭头列 20/文字列 44),实测三级列坐标 20/44→38/56/74→56/74/92 与设计稿逐像素一致;规范画布标注改参考稿画法(黑 chip+贯穿虚线量高度、绿/粉色带量间距与缩进、虚线框量图标、白框+引线标字号)(未提交)
- 规范画布标注只留数字,去掉「菜单行/图标/缩进」等说明文字(量的是什么由色块指出,说明留在下方规格表);路由 /sidenav-lab 改为 /sidebar(未提交)
- 修树的层级缩进:项目行去掉文件夹图标后没保留图标那一列,导致项目→模块的文字一次跳 36px(其余层级 16px),看起来第二层缩进过多;补回 20px 的空图标列(置顶项目正好放 pin),现在箭头列 24/40/56、文字列 60/76/92 每级都是 +16;顺带把文件图标装进 14px 的定宽格,同级文件与文件夹的文字不再差 2px
- 规范画布:展示高度 768→600;标注去掉底色胶囊改纯文字,并按量的位置就近摆放(图标/间距/缩进的读数跟在该行文字后面,不再全甩到右边),新增「图标 16」「图标→文字 8」两项(未提交)
- 规范画布展示高度统一 572→768,收敛成一个 CANVAS_H 常量(主组件与场景卡都走它,不再各写一处);随变侧栏抽成 SuibianSideNav 导出并加进画布(自带展开态与拖拽,页面与画布同一份,避免复制后漂移);顺带清掉 VibeCodingPage 里失效的 Folder01LinearIcon 引入(未提交)
- 目录树对齐 macOS Finder 收尾:箭头槽与每级缩进合并为同一个常量 16(此前 14/20 不等值,子级箭头永远落不到父级图标上,这才是错位的根因);项目行去掉文件夹图标只留箭头+名称;「项目文件」不再用分类图标+彩色底板,回落成文件夹图标(展开/收起两态),与内部目录一致;规范画布标注胶囊改贴组件右缘(不再占用右侧标注栏),主组件列宽收到 248px,与场景卡的间距 174→60(未提交)
- 目录树完全对齐 macOS Finder:行高 26→28;项目行也加披露箭头;规范页主组件标注从 9 个精简到 6 个(去掉重复的行高/项目行高)+ 规格表 7 行并为 5 行(未提交)

## 2026-07-26

- 收起态改 36×36 正方形(SIDE_NAV_COLLAPSED_WIDTH=61=36+12*2+1px描边),主按钮收起时也收成方形;「项目文件」由 file 改为 dir 携带真实源码树,FileTreeView 新增 canExpandDir 逐节点区分「模块(只选中)/文件夹(只展开)」,点文件夹只展开不再开页签(对齐 macOS Finder),规范页同步(未提交)

- 规范页标注单位统一:原来混着 Tailwind 简写(pt 16/px 12/gap 4/h 26/pl 12)容易被误读成 pt·px 单位,全改为中文全称+px(上内边距 16px / 左右内边距 12px / 行间距 4px / 行高 26px / 每级缩进 16px 等),规格表同步;导航组件展示高度 430→572px(未提交)

- 收起导航图标改用设计稿指定的 layout-left(LayoutLeftLinearIcon,原 PanelLeftClose 不对),首页/工坊/随变/规范页四处统一;规范页项目行补上展开收起(与线上工坊一致,图标随开合切换),两棵文件夹树的 expanded 初值 key 修正(parentPath 不同导致默认没展开)(未提交)

- /sidenav-lab 规范画布重做:标注改 F12 风格(元素上铺高亮盒 content蓝/padding绿/gap橙 + 右侧窄槽尺寸胶囊,坐标实测自组件),主组件换成 AI 工坊(菜单+树俱全),工坊与分身场景卡内嵌真实产物树,四个场景与主组件并排;新增 FileTreeView 画布(文件夹树标注 + 模块/文件夹对照 + 四级分类说明)(未提交)

## 2026-07-25

- 收敛 SideNav 各产品间的不一致:①SideNavActionButton 两个变体几何统一(h40/r10/14px-600/px16),原 light 是 h36+全圆角+13px;②工坊不再覆写 --sidenav-*(此前未选中项 60% 比首页 80% 淡一档);③工坊补上底部「收起导航」(新增 onCollapseSidebar prop,此前 sidebarCollapsed 只有展开没有收起入口);④/sidenav-lab 重做为单画布:左侧主组件带尺寸标注(宽度标尺+量度括号+引出线)与色值表,右侧平铺创作者中心/AI 工坊/AI 分身/收起态四个场景(未提交)

- 修随变两个问题:①对话栏底色由 #fbfbfc 改为设计稿取样的 #f0f0f1(白输入框/白气泡原本在近白底上看不出边界,输入框像坏了),画布底同步改 #f3f3f4,输入框高度补到 114px;②侧栏滚动条不可见 — .thin-scroll 的 thumb 是为暗色工坊设计的白色,新增 .thin-scroll-light(深色 thumb)供浅色面板使用,随变侧栏与消息区改用它(未提交)

- 随变侧栏按新稿 259-32949 与统一导航对齐:去掉 logo 头与面板按钮、三组(我的项目/我的角色/我的世界)间加分隔线、新增「我的世界」分组(星禾渡·余华《兄弟》,带风格标签+地球/世界图标)、底部头像与星光胶囊换成与首页·工坊同款的「收起导航」(未提交)

- 侧栏宽度统一到 SIDE_NAV_WIDTH(220px):随变由 300px 收窄;随变与百科编辑页补上右边缘拖拽把手(200~360px,与 AI 工坊同一套 pointer 交互)(未提交)

- 随变页三栏去掉外间距与圆角:外层 gap-3px/p-3px 移除、三栏 rounded-2xl 去掉,改为细分隔线贴边铺满(未提交)

- 随变页按设计稿 统一导航 244-19030 实现(替换占位页):新建 SuibianPage 三栏 — 左侧我的项目/我的角色(可折叠)+星光余额、中间创作总监对话(设计稿全部消息+橙色高亮词+工具回执 chip+黄色发送键)、右侧点阵画布(设计导出整图+缩放 HUD+画布模式);素材存 public/assets/suibian,已 sips 降采样+TinyPNG 压缩(49M→996K)(未提交)

- 创作服务图标由客服耳机换成闪电 LightningLinearIcon(语义是创作便捷工具,与统一导航稿 lightning-02 一致);AI 工坊左侧图标全部换 MasterIcon:产物树模块图标 18 个、项目行文件夹/置顶、工具条搜索/展开全部、FileTreeView 默认文件夹、分身侧栏五项(未提交)

- 按四级分类(项目/模块/文件夹/文件)收敛目录:工坊产物树 showDirChildren=false — 模块(能力配置/页面配置/知识库…)只「选中查看」不再左侧展开,子对象走右侧目录下拉;资源库分类树改常驻披露箭头(原 hover 才出现)并去掉子级左侧连接线;左侧导航 AI 创作恢复白底(发布作品保持黑底)(未提交)

- 分身模块名与侧栏入口对齐:新增 AVATAR_SKILL_LABEL「技能库」/AVATAR_TRIGGER_LABEL「触发器」(原复用小程序的 能力配置/触发器配置),产物树·默认页签·分类路由·右栏工具条同步;「代码文件」全局改名为「项目文件」(四级分类里的 文件夹 层)(未提交)

- AI 分身侧栏按截图精简:顶部菜单去掉评测库;「我的AI分身」下改为平铺五项 Ailee(圆头像,进分身预览)/技能库→能力配置/工具库(占位)/知识库/触发器→触发器配置,彩色角标沿用产品树配色,不再渲染项目行与产物树(未提交)

- 目录树统一改 macOS Finder 风格:移除左侧连接线(FileTreeView renderRails/railStartDepth 删除),改为披露箭头(点箭头只展开/收起)+16px 缩进+叶子留空槽保持图标对齐;工坊/分身项目树与百科目录树同步(未提交)
- 百科新增世界书编辑页 WikiEditorPage(设计稿 统一导航 259-32672):左目录树/中文档编辑区(页签+撤销重做历史+宋体标题+来源+面包屑+正文)/右世界书智能体(空态+快速开始三选项+输入框含冲突检测·素材提炼);图标取设计稿导出存 public/icons/wiki-editor;首页「创建世界书」与世界书卡片进入,目录「主页」返回(未提交)

- AI 工坊/分身侧栏样式与创作者中心首页统一:chrome 改 panel(#f2f2f7 灰底+右描边),AI 创作按钮换黑底 dark 变体(彩虹光晕移除)(未提交)

- 内容管理/数据中心/收入变现 三页去卡片圆角、整页白底铺满;内容管理按统一导航稿 275-22737 重构:页面 8px 内边距+头部 16px、页签灰块样式、筛选行 14px 控件+底描边、作品卡 p-4 rounded-lg(审核中灰底)、封面角标/指标/状态色(#3eb346/#ff851d/#fe3824)按稿(未提交)

- 头像下拉菜单图标换成设计稿导出 SVG(public/icons/account-menu,新组件 FigmaGlyph 按设计 inset 精确摆放 + mask 着色);创作主页顶部信息字段按 788-20834 重排:昵称+灰底三角chip、同行 抖音号|签名,数据行 16px 加粗数值 + 12px 右箭头,移除 发起授权/MCN/音乐人徽章(未提交)

## 2026-07-24

- 按设计稿(创作者中心26.7 788-22480/788-20755)新增两处下拉:昵称旁三角出账号切换面板(新组件 AccountSwitcher.tsx,选中黑勾/企业账号Tag);顶栏头像菜单重做为 身份认证/通知中心(红标12)/切换账号(hover 出二级账号面板)/退出登录,直播管理权限开关保留在底部(未提交)

- 按 Figma 统一导航稿(275-22603)重做创作者中心:SideNav 统一 220px/#f2f2f7 底/16px 图标/新 active 色,SideNavActionButton 新增 dark 变体(黑底发布作品),首项改「首页」;创作主页恢复 16px 留白 + rounded-[20px] 白卡(0.5px black/10 描边 + 浅投影),右栏 292px;其余内容页恢复原留白与圆角(未提交)

- 创作者中心右侧内容 section 圆角全部去掉;创作主页改白底、上下两区左右对齐(下区 px-4/lg:pr-2 移除)、section 用 border-black/5 描边区分(HomeSections/数据中心各卡片同步)(未提交)

- 创作者中心首页各页面右侧内容区去掉外层留白贴边铺满:创作主页/数据中心(CreatorCenterHome)、内容管理/收入变现/直播管理/作品共创/活动管理/原创保护/抖音指数/发布作品页外层 px/py 均移除(未提交)

- 新增 SideNav 组件独立调试页 /sidenav-lab(src/dev/SideNavLab.tsx):精简为创作者中心/AI 工坊/AI 分身 3 个真实场景,App.tsx 按 pathname 直出(未提交)

- 右侧全部页面去掉四周留白与圆角改为贴边铺满:首页、资源库、Skills、创意广场、评测库占位页、数据运营、项目工作区(卡片背景框/聊天栏/预览面板同步调整)(未提交)
- 首页对齐 AI 工坊轮廓框架（设计稿 统一导航 250-37291）：侧栏改透明无边框、顶部「发布作品」下拉（四种发布入口）、底部「收起导航」手动收起为 icon rail（SideNav 新增 collapsed/footer 能力）；首页创作助手默认收起为悬浮球（AiAssistantPanel 新增 defaultOpen）(未提交)
- 导航 icon 去透明度：SideNav 图标改走 --sidenav-icon 实色变量（不再跟随行文字的半透明色），TopNav 未激活产品图标固定 #161823 实色(未提交)
- 引入 MasterIcon 图标库（npm install github:li-yingjie/MasterIcon），左侧导航菜单图标统一改为该库 linear 风格；因库 dist/react/index.js 残留 `export type` 导致 Vite 预构建报错，改走 `master-icon/react/<Icon>` 按文件子路径引入绕过(未提交)
- 去掉页面切换的自下而上位移动画：外壳 ProductSurface、创作者中心内容区、百科/占位页/分身落地页、工坊根框架与 Skills/资源库切换全部改为纯淡入(未提交)
- 左侧导航抽象为共享组件 shared/components/SideNav（统一宽度 SIDE_NAV_WIDTH=200 与菜单视觉，--sidenav-* 变量可主题化；支持子菜单/窄屏 icon rail/header+children 插槽）；创作者中心 SideNav 与 AI 工坊 PlatformSidebar（含分身变体）接入，各自菜单内容不变，工坊侧栏默认宽度 176→200(未提交)
- AI 工坊首页按 Figma「统一导航」229:15581 重写 PlatformHome：ASCII 地图纹理底、新版输入框（+/兴趣卡/图片/视频/调研/扩展/Auto 工具条）、兴趣卡介绍 banner（CREATE/SEARCH 双栏）、4 张玻璃手机兴趣卡（hover 预填 prompt、点击直接发送）、精选项目 12 卡网格；素材转 webp 至 public/assets/workshop，保留 draft/onSubmit 交互契约(未提交)
- 百科首页按 Figma「创中版本-世界书」实现：Hero 虹彩背景+宋体标题、世界书/角色档案入口卡（书封扇形贴片、黑胶囊 CTA）、社区权益四栏、发现精彩世界分类筛选+世界书/角色档案切换+12 张世界书卡片；素材导出为 webp/svg 至 public/assets/wiki 与 public/icons/wiki，路由从占位页换成 WikiHomePage(未提交)

## 2026-07-20
- 统一创作者中心右侧助手与 AI 工坊项目 Chat 输入区：相同边距/无 focus 视觉态/工具按钮/占位文案/空内容发送状态，并补中文输入法防误发(未提交)
- 按反馈移除 AI 工坊首页输入框的 focus 视觉态，聚焦前后保持同一张圆角卡片样式(未提交)
- 修复 AI 工坊首页输入框聚焦态：移除 textarea 的方形原生描边，将柔和焦点环迁移到整张圆角输入卡片并保留键盘可见性(未提交)
- 首页、AI 工坊与创作者中心的聊天空态欢迎标题统一为「嗨，我是你的创作助手」，并移除默认副文案里的重复自我介绍(未提交)
- AI 工坊目录按“配置对象/资源产物”重构：小程序统一为基础信息→能力配置→页面配置→数据配置→代码文件，分身补人设/能力/代码，游戏补玩法/数据，H5补页面配置(未提交)
- AI 工坊产物目录术语统一为「基础信息 / 页面配置 / 触发器配置」，并同步图标、标签路由、游戏页面联动与触发器直达逻辑(未提交)
- 首页创作助手产品路由升级为服务端 Kimi 语义分类，按最终创作目标识别 AI 分身/百科/随变/AI 工坊/普通对话，不再依赖字符命中；新增受限枚举接口、等待反馈与安全回归测试(未提交)
- 首页创作助手路由收窄为仅 AI 分身，按实体、操作诉求和间接语义识别并排除资讯/否定/应用分身等误触；分身「去开通」状态写入 localStorage，刷新和再次进入仍保持已开通(未提交)
- 首页右侧创作助手新增产品意图路由：创建 AI 分身跳转 AI 分身，提及小程序/网站/网页游戏/H5 等产物跳转 AI 工坊；产品页用 180ms 淡入位移过渡、尊重减少动态效果设置，隐藏首页同步暂停背景视频(未提交)
- AI 分身侧栏移除「团队空间/我的空间」，并在分身首屏默认展开「我的AI分身」下的项目产物目录(未提交)
- 创作者中心首页左侧栏移除「发布」按钮，并将导航「首页」更名为「创作主页」(未提交)
- AI 工坊项目树合并「基础信息 / 文档」为「项目信息」单入口，右侧用基础信息与文档双视图切换，减少重复层级并保留原有编辑能力(未提交)

## 2026-07-18
- 创作助手展开即聚焦输入框:open 变 true 后 focus inputRef,composer 卡片 focus-within 显示 1.5px 柔和深灰(rgba(22,24,35,0.35))描边(未提交)
- 创作助手悬浮球改白底:蓝渐变→纯白+中性阴影+细边框,logo 去 white 反色用原色(未提交)
- 首页 ASCII 视频顶部遮罩加大:顶部遮罩段从 0-30% 扩到 0-42%、初始不透明度 0.4→0.5,与顶栏过渡更明显(未提交)
- 创作助手悬浮球接入 Lottie 旋转圆圈动画:从 DYAI 仓库取 public/assets/logo2.json(rotating_circles_lottie_loop)+logo2.svg,装 lottie-react/lottie-web(npmmirror),新建 Logo2Lottie(用 lottie-web loadAnimation+dynamic import 绕开 lottie-react 在 vite 下的 default 导出 interop 报错),悬浮球 hover 播放旋转、移开 goToAndStop,white 反色(未提交)
- 百科/随变即将上线占位页图标统一:PlaceholderPage 图标外加统一圆角浅底框(ring+渐变底),消除插画/照片调性差异,两页视觉一致(未提交)
- 内容管理作品类型从标题前 chip 改为封面左上角蓝色 Tag(列表 WorkRow + 详情 WorkDetailPage 头卡一致,标题恢复顶格);首页内容顶部 pt-12→pt-4,四周间距统一 16(未提交)
- 创作助手改名(AI 助手→创作助手,头部/空态/aria 全改);展开收起加动效(AnimatePresence+宽度动画,悬浮球 scale 淡入,拖拽时抑制过渡);配色去紫改纯蓝(悬浮球 #5B9DFF→#3370FF,拖拽高亮 #3370FF)(未提交)
- AI 助手面板左边缘可拖拽调宽(300~560px);首页 ASCII 视频改固定高度裁剪容器+遮罩内置,修复缩放后底部彩色边漏出,顶部加淡入过渡遮罩、整体加深(未提交)

## 2026-07-17
- AI 助手输入框去掉附件/Figma 按钮,左侧新增圆形 + 号;首页内容四周间距 px-6/pb-6 收到 px-4/pb-4(16px)(未提交)
- 内容管理接入 AI 工坊作品:WorkItem 加 workshopKind,ContentPage 注入工坊作品(小程序/AI分身/网页游戏/营销H5)并混入列表、体裁筛选扩展、作品计数含工坊数;WorkRow 工坊口径指标+类型角标/chip;WorkDetailPage 工坊作品头卡改「来源/类型」、隐藏播放键、总览 tile 换访问/访客/转化口径(未提交)
- AI 助手头部去掉 logo,收起 icon 改 double-arrow-right(ChevronsRight);收起态从窄 icon 栏改为右下角渐变悬浮球,球内图标由 Sparkles 换成与空态一致的 LogoIcon 圆环点阵(未提交)
- 内容管理作品行整行可点进详情(hover 整行浅底+标题下划线,键盘可达);行内操作/评论格 stopPropagation 避免误触(未提交)
- 内容管理页对齐设计稿 26.7(20-8421/20-9666):工具栏重排(页签+状态文字筛选+时间/体裁/搜索/导出/创建合集),作品行去迷你图换设计稿指标条,新增作品合集列表;新增 WorkDetailPage(1-38221/1-38571)总览双卡图表+评论管理,列表点封面/标题/评论进详情,支持前后作品切换(未提交)
- 首页外层移除靠 AI 助手一侧的滚动条占位，让两栏无缝相接；恢复首页卡片右侧 24px 内边距以保留内容呼吸感(未提交)
- 首页 ASCII 背景视频底部遮罩取消跟随视频缩放，并拉长淡出区至页面底色，消除与数据概览之间的硬分隔(未提交)
- 小游戏「页面」接入与小程序一致的可视化路由：开始/对局/结算三项改用游戏画面与结算视觉稿，不再展示纯文字信息视图(未提交)
- 删除 AI 工坊项目预览右上角「运营数据」入口及其抽屉挂载，保留独立运营数据页面能力(未提交)
- 分身侧栏对齐设计稿 661-99150:去掉 AI 创作按钮,导航换为技能库/资源库/评测库/团队空间/我的空间(后三者为占位页),项目分组改可折叠「我的AI分身」,分身项目行用圆形头像;去开通 toast 移除(未提交)
- 目录树关键节点上彩色图标底板(参考 Figma WoW-26 661-99330):FileTreeView 新增 badgeFor,PRODUCT_CATEGORY_BADGES 色板,产品树一级节点彩色/子级单色,行样式微调(12.5px/圆角8),AI 分身与工坊共用(未提交)
- AI 分身开通后进入分身版工坊:VibeCodingPage 新增 variant(workshop 隐藏陶白白/avatar 只保留并直进该项目),落地页「去开通」切换,外壳双实例 keep-alive(未提交)
- 创作服务菜单默认收起(serviceOpen 默认 false)(未提交)
- 直播管理菜单默认隐藏(live-store enabled 默认改 false,头像菜单开关仍可开启)(未提交)
- AI 助手去掉界面上的机制自述:头部页面标签 chip 移除、占位符改通用、欢迎语改自然文案(Tab 联动只体现在建议内容里)(未提交)
- AI 助手面板与工坊聊天栏统一视觉件:ChatEmptyState 抽到 shared 双端共用,composer 复刻工坊同款(圆角24白卡+彩虹光晕+扩展/附件/Figma/Auto/发送),index.css 新增 .light-scope 让浅色变量可作用于子树(未提交)

## 2026-07-16
- 新增系统级 AI 助手:LiveAiReply 抽到 shared(VibeCodingPage 改为引用),新建 AiAssistantPanel 常驻创作者中心首页右侧,语境/建议/对话线程随左侧导航 Tab 切换(assistant-contexts.ts)(未提交)
- 修复 AI 工坊聊天栏与预览区重叠:chat aside 从带 margin-left 的 body 容器移出为根容器直接子元素(fixed→absolute 批量改造时定位父级选错,left 被双重偏移)(未提交)
- launch.json 通过 VITE_DEV_PORT=5180 固定 dev 端口(5173 被其他项目占用,vite 只落到 IPv6 导致预览黑屏)(未提交)

- 修正创作者中心作品发布层级：四类入口先展示上传/新建网关，点击后再下钻到对应编辑与发布设置页，文章补齐新建/导入双入口。(未提交)
- 创作者中心作品发布入口补齐四类链路：发布视频/图文/全景视频/文章均进入统一发布页，顶部对齐抖音上传页 tab 与拖拽上传卡，并为非视频类型补充对应表单和发布设置。(未提交)

## 2026-07-14

- 拆分首屏/二级页面与图表按需 chunk，Garuda 动画改为核心帧启动+技能/敌机按需加载；移除头像第三方人设泄露，修复 AI 工坊会话栏覆盖顶导航，并新增 7 项安全回归测试与 GitHub Actions CI。(未提交)
- 修复 AI 工坊新项目批处理串线，按项目/会话保存完整对话快照并使用稳定消息 ID 隔离 AI 缓存；发布流改为按项目存储，SSE 缺少 `[DONE]` 时失败且不缓存。(未提交)
- 加固 Kimi 代理（同源/消息/模型白名单校验、请求与输出上限、超时、并发和频率限制），统一 API 的 JSON 404/405，增加生产静态缓存与压缩并按上海时区跨日刷新数据；排行榜改为服务端 ID、不可覆盖写入、成绩边界与可配置 CORS，同时移除生产 Figma capture 脚本。(未提交)
- 修复创作者中心构建阻断、窄屏顶栏/侧栏子菜单/首页卡片溢出，并补齐筛选、删除撤销、发布对话框、单选/开关/页签的键盘与焦点语义；背景视频按可见性和减少动态效果偏好暂停。(未提交)

## 2026-07-06

- 创作者用户头像替换为现有 `/assets/kingjaylee.PNG`，首页资料区、顶栏头像和账号弹层通过 `CREATOR_PROFILE` 同步更新。(未提交)
- 首页背景视频切换为完整 `ascii-animation2.mp4`，采用 `object-bottom` 保留 ASCII 天空与山丘内容；移除覆盖全画面的重遮罩，仅在底部 55% 区域渐进过渡到 `#F5F6F8`。(未提交)
- 修正入口后卡 hover 轴心/方向：默认 10°+斜切保留在内层，hover 外层改为以后卡左下角为圆心向右增加 4°，并用 180ms ease-out 反馈，避免绕左上角继续下坠。(未提交)
- 按 Figma 节点 1:24030 精确还原入口叠卡默认几何：容器 77×84，前卡 60×75@`(0,5.1)`，后卡 60×75@`(17.94,0)`、旋转 10°并横向斜切 -1.54°；容器上移 5.1px 保持前卡与 75px 入口卡上下对齐。(未提交)
- 入口后方第二张卡按确认值改为默认旋转 10°、hover 13°，保持当前左移位置。(未提交)
- 入口后方第二张卡默认旋转角 3°→5°、hover 9°→10°，同时左偏移 10%→6%，呈现更明显的斜置并更靠左。(未提交)
- 智能创作/作品发布入口左侧正卡改为 75px 高并按高度缩放，与入口卡整体高度严格一致，不再向上悬出。(未提交)
- 入口后卡继续收敛：默认/hover 旋转角降至 3°/9°，左偏移 14%→10%、宽度 83%→82%，减少右下角露出。(未提交)
- 智能创作/作品发布入口的共用后卡默认旋转角由 9° 降至 6°，减弱静止态倾斜，保留 hover 扇开角度。(未提交)
- 首页布局调整为数据概览整行置顶，下方双栏让活动中心与互动管理顶端同排（收入变现/快速导航分别续接左右栏）；`lg` 右栏 300px、`xl` 恢复 336px，互动管理内部横排延后到 `xl` 防止窄主栏溢出。(未提交)
- 首页板块改名/跳转/自适应修复:**① 变现中心→收入变现**(标题与注释同步);**② 查看更多跳转** —
  给 HomeSections 各板块加 `onMore` 回调,首页所有「查看更多/查看详情」接上对应页:数据概览→数据中心、
  互动管理→内容管理、收入变现→收入变现(income)、活动中心→活动管理(service:活动管理)、
  快速导航→创作服务(service,暂为占位页,无独立工具页,待确认目标);**③ 收入变现内容溢出** — 视口
  ~1280px 时正好越过 `xl` 断点,金额+两张任务卡强行并排(201+630 > 左栏 638)横向溢出;把外层
  `xl:flex-row` 提到 `2xl:`,并给卡片容器/任务卡补 `min-w-0`,窄栏改为竖排(金额在上、两卡并排),不再溢出。
  预览实测:5 个入口跳转正确、收入变现无溢出、无报错。(未提交)
- 按设计稿(947-41110)补齐首页图标后卡 + 修顶部视频黑边:**① 后卡** — 上一版只有百科/随变有后卡,
  其余(AI分身/工坊/4 个作品发布)丢了后卡;改为 `CardImageIcon` 里**每张卡都有与正卡等大的斜置后卡**
  (右后方探出、hover 再扇开):有图的铺图(AI分身橙色人像 / 百科耳机盒 / 随变情侣,统一用未旋转原图由
  CSS 做圆角+9°旋转),没图的用中性浅色底板(工坊 + 4 个作品发布,对应设计的白底后卡)。**② 顶部黑边** —
  ASCII 视频四周本身有暗角(vignette),透过遮罩在顶部/两侧显出黑影;用 ffmpeg 把视频裁成干净的天空带
  (`crop=1220:320`,去掉暗角与草地),CSS 回退为普通 object-cover。视频 54KB→20KB;新后卡图 TinyPNG 压缩。
  预览实测:8 张卡均有等大后卡、顶部无黑边、视频自动播放。(未提交)

## 2026-07-05

- 首页图标改用设计师导出的 4x 贴纸图 + 顶部加 ASCII 天空视频:**① 换图** — 用户在 `public/bg`
  导出了 8 张 4x 卡片(4 作品发布贴纸 + 4 智能创作正卡)及百科/随变的斜置后卡;统一为
  `CardImageIcon`(正卡在左、可选后卡右后方探出 + hover 扇开),删掉上一版 CSS 重建的图标块与
  raw 图层合成件;图片重命名为 ASCII 并入 `icons/creator-center/`(publish-*、entry-*),
  TinyPNG 压缩 766K→223K,清掉 `bg` 里的中文名重复件。**② 顶部视频** — 顶部天空底色其实是
  `bg/ascii-animation.mp4`,改为 `<video>` 背景(object-top、300px)+ 淡蓝渐变遮罩向下淡出到
  页面底色(文字可读);视频用 ffmpeg 降到 1280 宽重编码 **8MB→54KB**。改 data.ts +
  CreatorCenterHome。预览实测视频自动播放、图标清晰无 404。(未提交)
- 首页「智能创作 / 作品发布」图标对齐设计稿(Figma node 947-41205):**① 修复图标发虚** —
  原 8 张前/后卡 PNG 均为 1x(60×75),2x 屏必糊;改用 Figma 高清原图层重建,前卡=话题正图、
  后卡=潮流单品叠放贴纸(AI工坊特殊:手持手机 hand 叠加应用截图 screen)。**② 作品发布图标改样式** —
  由原「纯色饱和方块+白描边字形」改为设计稿的分层贴纸:浅色渐变底卡 + 居中高饱和圆角图标块
  (含内阴影/白色字形)+ 背后中性叠层;全景视频用同构 VR 眼镜 SVG。新增 8 张 entry-*-front/back/
  hand/screen 图(TinyPNG 压缩 1188K→340K),删除旧的 entry-*.png/-front/-back;改 data.ts
  条目结构 + CreatorCenterHome 的 SmartCreateIcon/PublishTile。预览实测无报错、图标清晰。(未提交)
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
- 首页 ASCII 背景视频画面下移至 95% 取景，并整体放大 5% 做左右过扫描裁切，消除素材两侧暗边，底部柔化遮罩保持不变。(未提交)
- 首页视频底部渐变遮罩同步放大 5%，并整体下移渐变区间，确保过扫描后的画面边缘与遮罩柔化位置一致。(未提交)
- 首页整体按 Figma 节点 20:7226 校准：侧栏 200px、内容 24px 边距、资料区坐标、264px 快捷入口、430px 视频遮罩、400px 数据概览与下方固定高度卡片，并保留 kingjaylee 头像及活动/互动同排布局。(未提交)
