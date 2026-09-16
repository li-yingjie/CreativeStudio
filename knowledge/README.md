# MagicX 本地活动知识库

第一版采用“可读 JSON + 原始来源索引 + 自动校验”的文件型知识库，先验证 Agent 能否稳定找对事实、说明证据和对缺失信息拒答，再决定是否接入向量库。

## 目录

- `schemas/`：案例包数据契约。
- `cases/<case_id>/case-package.json`：Agent 检索的结构化事实。
- `cases/<case_id>/README.md`：给人看的案例说明和录入边界。
- `eval/`：用于回归验证知识调用效果的查询集。

案例包允许区分四种对象：制作配置、已上线案例、普通参考案例和平台规范。Figma 交互规范必须使用 `platform_spec`，其中出现的 IP、任务、卡级与文案默认只是演示内容，除非另有业务配置或上线证据。

## 校验

```bash
npm run knowledge:validate
```

## 从飞书文档采集图片

九门案例可以直接运行：

```bash
npm run knowledge:collect:jiu-men
```

采集器会读取主文档及同步区块，自动发现图片、下载选定目标素材，并生成：

- `asset-manifest.json`：图片路径、尺寸、原文区块、权限和初步分类。
- `review-queue.json`：归属或最终性无法自动判断的图片。
- `assets/originals/`：原图。
- `assets/optimized/`：最长边 1600px 的 Agent 查看版本。
- `assets/thumbnails/`：最长边 480px 的检索缩略图。

清单只保留文档和 block 定位，不保存临时鉴权链接或网盘提取码。当前九门快捷命令只下载主视觉素材区块；要扩展到卡面或资源位图片，应先通过复核规则确定目标分类。

案例包中的 `confirmation` 必须区分已确认、待确认、推断、冲突和未知。参考案例素材不能标记为目标活动的最终设计；无来源的业务目标、效果数据和上线状态必须进入 `gaps`，不能由 Agent 补写。

Figma 来源案例需保存关键节点的本地截图，并在素材记录中保留 `file_key + node_id`。整板截图用于理解流程与视觉状态，不等同于某个业务活动的最终上线页面。
