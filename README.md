# 抖音 AI 工坊 · CreativeStudio

一个 AI 辅助创作平台的**前端原型**:用户通过对话快速搭建各种产品 —— AI 分身、
小程序、网站、网页游戏、营销 H5、运营提案。所见即所得,左侧对话、右侧实时预览。

> 说明:这是一个产品原型/Demo,绝大部分数据为 mock。唯一接入的真实能力是对话 ——
> 通过服务端代理调用 Kimi(Moonshot)大模型,流式返回回复。

## 功能概览

- **对话式创作**:在对话里描述需求,触发对应的搭建流程(需求收集 / 触发器配置 /
  游戏生成 / 发布等),或与 AI 自由对话(真实流式)。
- **多形态产物预览**:AI 分身、小程序、智能体广场网站、网页游戏、营销 H5、运营提案,
  每种形态有专属的右侧预览与编辑面板。
- **项目对象树**:每个项目按「基础信息 / 页面 / 技能 / 知识库 / 数据库 …」等业务语言
  组织,而非原始代码目录。
- **发布流程**:选择抖音投放场景(AI 聊天 / 评论区 / 群聊 / 私信 等)后一键发布。
- **资源库 / 运营数据 / 创意广场** 等平台级页面。

## 技术栈

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · zustand · framer-motion ·
Node 22 (Express) · Kimi (Moonshot) Chat API

## 本地运行

需要 Node 22+。

```bash
npm install
cp .env.example .env   # 填入你的 Kimi key
npm run dev            # http://localhost:5173 (已内置 /api 代理)
```

`.env` 配置:

```
KIMI_API_KEY=sk-...                      # 在 https://platform.kimi.com 获取
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=moonshot-v1-8k
PORT=8787
```

> 开发模式下 `/api/chat` 由 Vite 插件在本进程内提供,key 只读于服务端,不会进入前端
> 产物。访问 `/api/health` 可检查 key 是否配置成功。

## 构建与部署

**自托管(Express 同时托管前端 + API):**

```bash
npm run build
npm run start          # Express 服务 dist/ 与 /api,key 走环境变量
```

**Vercel:** `api/` 目录下的 Serverless Functions 提供 `/api/*`,前端走 Vite 静态构建。
在项目 Settings → Environment Variables 配置 `KIMI_API_KEY` / `KIMI_BASE_URL` /
`KIMI_MODEL`,改完需重新部署。

## 目录结构

```
src/
  app/                      # 应用入口
  modules/
    vibecoding/components/  # 主产品 UI(VibeCodingPage.tsx 为核心)
    editor/                 # 对话预览、发布/人设 store、静态数据
  shared/                   # 图标、API 客户端、通用组件/hooks/storage
server/                     # Kimi 代理(kimi.mjs 共享逻辑 + index.mjs Express)
api/                        # Vercel Serverless Functions
public/                     # 静态资源(含内嵌 garuda 网页游戏)
```

## 安全

API key 仅存在于服务端(`.env` 已 gitignore;Vercel 走平台环境变量)。浏览器只访问
同源 `/api/chat`,任何时候都不要把 key 暴露到前端。
