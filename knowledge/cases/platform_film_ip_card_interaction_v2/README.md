# 影视IP抽卡活动 2.0 交互规范包

这是一个 `platform_spec`，不是单一业务的上线案例。源 Figma 页为“2.0优化交互详述（待开发）”，四轮迭代分别覆盖公告/新手引导、换卡/批量赠卡、翻卡奖励和完整交互。

## Agent 使用边界

- 可以回答平台规范支持哪些抽卡、集卡、赠卡、换卡、翻卡、记录和奖品承接能力，以及对应状态分支。
- 可以读取 `assets/boards/` 的四张本地整板截图，回答页面结构和交互大致长什么样。
- 不得把《永夜星河》、DYR/SF/SP/SSR 等标签、任务列表、数值或文案回答为某个真实活动已确认的最终配置。
- 不得把画板称为已上线效果页。页面标题含“待开发”，当前没有上线地址、录屏、指标或产品发布证明。
- 用户追问某个业务活动的主KV、资源位或数据表现时，应回到对应业务配置包或上线案例包；本包只能提供平台结构参考。

## 本地视觉证据

- `assets/boards/iteration-1-announcement-onboarding.png`
- `assets/boards/iteration-2-exchange-gifting.png`
- `assets/boards/iteration-3-flip-card.png`
- `assets/boards/iteration-4-complete-interaction-spec.png`

整板图用于 Agent 理解流程。由于原始画板非常宽，缩略图适合识别分区；需要阅读小字时，应使用 `file_key + node_id` 再向 Figma 请求局部截图。
