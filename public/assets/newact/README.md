# 新活动素材目录

把按下列文件名命名的图片丢进这个目录，就能变成一个新活动（版式 / 热区 / 编辑能力
沿用「集卡兑奖 H5」模板）。**缺哪张都不影响运行**，缺的位置会显示带名字的占位框。

## 必需（页面骨架）

| 文件名 | 用途 | 建议尺寸 |
|---|---|---|
| `head-kv.png` | 主视觉 | 375×494 |
| `title.png` | 活动标题字（透明底） | 247×99 |
| `btn-draw.png` | 主按钮（透明底） | 207×50 |
| `btn-my-cards.png` | 左侧入口 | 56×42 |
| `btn-my-prizes.png` | 右侧入口 | 56×42 |
| `panel-bg.png` | 集卡面板底 | 355×150 |
| `sec-tasks.png` | 任务区整段 | 375×449 |
| `sec-topics.png` | 话题区整段 | 375×317 |
| `sec-banner.png` | 底部 banner | 375×158 |
| `footer-logo.png` | 页脚字标 | 121×32 |

## 奖励与开卡

| 文件名 | 用途 |
|---|---|
| `tier-1.png` ~ `tier-4.png` | 四档奖励图标（按档位顺序取，多出的档位复用最后一枚） |
| `bigcard.png` | 开卡大图（可选，缺省时放大中卡） |
| `result-title.png` | 开卡标题「恭喜你获得」 |
| `envelope.png` | 兑奖礼物 |
| `mascot.png` | IP 形象（我的奖品空态用） |
| `bean-bar.png` | 底部金豆条（可选） |

## 卡面（按玩法里的卡 id）

- `card-<卡id>.png` — 已获得（彩色）
- `card-<卡id>-grey.png` — 未获得（石膏灰）

卡 id 在 preset 的 `gameplay.cards[].id` 里定义。例如卡 id 是 `c1`，就放
`card-c1.png` 和 `card-c1-grey.png`。只有彩色版时，未获得态自动灰化；只有灰版时，
已获得态自动暖化——所以可以先补一半。

## 接入方式

在 `src/modules/vibecoding/components/ActivityPreset.ts` 里加一个 preset：

```ts
export const MY_PRESET: ActivityPreset = {
  id: 'myact',
  name: '我的活动',
  assetRoot: '/assets/myact',
  stages: [{ id: 's1', label: '第一期', w: 81 }],
  theme: { bg: '#141c2e', bgLower: '#26365a', ... },
  gameplay: { cards: [...], tiers: [...], draw: {...}, gift: {...}, tasks: [...], copy: {...} },
  copy: { docName, request, brief, assetBatches, screens, cardsTabs, prizesEmpty },
}
```

然后加进 `ACTIVITY_PRESETS`，在项目的「活动玩法配置」页顶部就能切换。
文件名不想按约定走时，用 `assetOverrides` 单独覆盖。
