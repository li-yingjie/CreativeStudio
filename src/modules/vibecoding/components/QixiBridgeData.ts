export const QIXI_BRIDGE_PROJECT = '七夕搭鹊桥 · 找喜鹊'

const QIXI_LEVEL_ONE_SOURCE_SIZE = { width: 1024, height: 1536 } as const

// Target centers measured on the original level-01-v1.webp source. Keep the
// pixel coordinates as the fact source, then normalize them for the responsive
// scene. The previous x values were scaled to roughly 80%, shifting every hit
// area left and making the two right-side magpies unreachable.
export const QIXI_LEVEL_ONE_TARGETS = [
  { sourceX: 145, sourceY: 160 },
  { sourceX: 405, sourceY: 555 },
  { sourceX: 842, sourceY: 580 },
  { sourceX: 390, sourceY: 940 },
  { sourceX: 908, sourceY: 965 },
].map(({ sourceX, sourceY }) => ({
  x: (sourceX / QIXI_LEVEL_ONE_SOURCE_SIZE.width) * 100,
  y: (sourceY / QIXI_LEVEL_ONE_SOURCE_SIZE.height) * 100,
}))

export const QIXI_BRIDGE_PLAN_MD = `# 七夕搭鹊桥 · 找喜鹊

## 一、当前阶段

可点击灰模已搭建，但不再把“能点通”写成“玩法通过”。试玩审查已修复 0 次机会主按钮、目标热区与误点反馈；“现代东方月夜剪纸”的主 KV 和第 1 关联合样张已落位。当前只完成 1 / 7 关视觉验证，其余正式素材尚未生成，后端接口继续使用本地 mock。

## 二、已确认方案

1. **本期边界**：单人完整闭环；组队与一键生成分享作品后置。
2. **玩法节奏**：每关 90 秒，喜鹊数量从 5 只逐步增加到 8 只。
3. **设计风格**：现代东方月夜剪纸；黛蓝月夜、米白月盘、朱砂奖励节点，以鹊羽叠桥表达通关进度。

页面灰模、未确认金额隔离、试玩修复和最小样张范围由 Agent 自动完成，不增加用户确认负担。

## 三、本期范围

- 单人模式，共 7 关；每关复用同一套页面模板并加载不同场景
- 每关限时 90 秒，目标喜鹊数依次为 5 / 6 / 6 / 7 / 7 / 8 / 8
- 完成第 3、7 关分别解锁消费券；每次通关获得 1 次抽奖机会
- 每日签到获得 2 次闯关机会；好友助力每人获得 2 次，每日上限 10 人
- 包含活动首页、关卡、结果状态、任务与分享、抽奖、活动明细、活动规则和边际状态

## 四、本期不做

- 组队闯关：正文已明确七夕不做，留待中秋迭代
- 一键生成分享作品：需求表列为后续优先级，不进入本期主链路
- 后端、风控、埋点和真实商品接口：本轮仅保留对应前端展示状态

## 五、当前视觉产物与下一阶段

- 已生成并落位 1 张主 KV 与第 1 关场景；第 1 关包含 5 只融入背景的喜鹊，命中区由前端单独控制
- 待第 1 关试玩验收后，再生成其余 6 张关卡场景、鹊桥进度组件、奖励/抽奖弹窗和分享图
- 消费券面额、抽奖奖品图和商品榜单素材仍需业务提供真实内容

## 六、本轮验收

1. 用户能从首页进入第 1 关并在真实场景中找到 5 只喜鹊。
2. 主动退出关卡会出现“消耗机会”的二次确认。
3. 通关后抽奖次数、首页进度和活动明细同步变化。
4. 签到、分享、抽奖、规则与边际状态均可点击；好友真实回流只由工作台调试状态模拟。
5. 0 次机会时主按钮明确引导去做任务；目标热区不少于 44px，误点反馈出现在实际触点。
6. 当前版本不得标记为“活动完成”；只有其余 6 关及奖励、抽奖、分享素材落位并通过前端回归后才可完成。
`
