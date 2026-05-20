import type { ReactNode } from 'react'
import type { ProjectKind } from './ProjectProductView'

/**
 * 每个项目「产物对象」的真实化 mock 内容。
 *
 * 之前许多对象（基础信息 / 页面 / 玩法 / 技能 / 知识库 / 数据库 / 素材）都复用
 * 通用的代码编辑器或文档视图，内容与项目并不匹配。这里按项目类型给每个对象
 * 准备贴合的静态内容，并在 renderTab 里优先命中。命中不到时返回 null，让调用方
 * 走原有的兜底视图（文档 / 代码文件等）。
 */

type InfoContent = {
  type: 'info'
  summary?: string
  tags?: string[]
  groups: { title: string; rows: [string, string][] }[]
}
type DbColumn = { name: string; type: string; desc: string }
type DbTable = { name: string; desc: string; columns: DbColumn[]; rows?: string[][] }
type DbContent = { type: 'database'; tables: DbTable[] }
type CardItem = { icon: string; title: string; desc: string; meta?: string }
type CardsContent = { type: 'cards'; columns?: number; note?: string; items: CardItem[] }

type ObjectContent = InfoContent | DbContent | CardsContent

/* ─────────────────────────── 数据 ─────────────────────────── */

const CONTENT: Record<string, Record<string, ObjectContent>> = {
  /* ── 塔罗小程序（mini-program）。技能为类目，复用 分身 的能力详情视图 ── */
  '塔罗小程序': {
    数据库: {
      type: 'database',
      tables: [
        {
          name: 'tarot_cards',
          desc: '塔罗牌牌库（韦特体系 78 张）',
          columns: [
            { name: 'id', type: 'int', desc: '主键' },
            { name: 'name', type: 'varchar(32)', desc: '牌名' },
            { name: 'arcana', type: "enum('major','minor')", desc: '大/小阿尔卡那' },
            { name: 'upright', type: 'text', desc: '正位牌意' },
            { name: 'reversed', type: 'text', desc: '逆位牌意' },
            { name: 'image_url', type: 'varchar(128)', desc: '牌面图' },
          ],
          rows: [
            ['0', '愚人 The Fool', 'major', '新的开始 · 冒险', '鲁莽 · 逃避'],
            ['1', '魔术师 The Magician', 'major', '创造力 · 行动', '欺骗 · 犹豫'],
            ['2', '女祭司 High Priestess', 'major', '直觉 · 潜意识', '隐瞒 · 压抑'],
          ],
        },
        {
          name: 'daily_draw',
          desc: '每日抽牌记录',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'user_id', type: 'bigint', desc: '用户' },
            { name: 'card_id', type: 'int', desc: '抽到的牌' },
            { name: 'is_reversed', type: 'tinyint', desc: '是否逆位' },
            { name: 'created_at', type: 'datetime', desc: '抽牌时间' },
          ],
        },
        {
          name: 'users',
          desc: '小程序用户',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'openid', type: 'varchar(64)', desc: '微信 openid' },
            { name: 'nickname', type: 'varchar(32)', desc: '昵称' },
            { name: 'draw_streak', type: 'int', desc: '连续抽牌天数' },
          ],
        },
      ],
    },
  },

  /* ── 六一儿童节活动（marketing-h5）── */
  '六一儿童节活动': {
    基础信息: {
      type: 'info',
      summary: '面向亲子人群的六一节日营销 H5，主打抽奖 + 签到 + 亲子合拍。',
      tags: ['节日营销', 'H5 活动', '亲子'],
      groups: [
        {
          title: '活动信息',
          rows: [
            ['活动名称', '六一儿童节亲子活动'],
            ['活动类型', '节日营销 H5'],
            ['关联品牌', '抖音亲子'],
            ['状态', '待发布'],
          ],
        },
        {
          title: '投放',
          rows: [
            ['投放端', '抖音'],
            ['场景', '非直播 / 直播'],
            ['活动时间', '2026-05-25 ~ 2026-06-02'],
          ],
        },
        {
          title: '数据目标',
          rows: [
            ['目标 UV', '50 万'],
            ['目标参与率', '18%'],
            ['分享率', '6%'],
          ],
        },
      ],
    },
    玩法: {
      type: 'cards',
      note: '活动内的互动玩法与奖励规则。',
      items: [
        { icon: '🎡', title: '抽奖转盘', desc: '完成任务获得抽奖机会，奖品含品牌周边、优惠券、虚拟礼物。', meta: '每日 3 次' },
        { icon: '📅', title: '每日签到', desc: '连续签到 3 天解锁隐藏奖励，断签重置。', meta: '7 天周期' },
        { icon: '🤝', title: '邀请助力', desc: '邀请好友助力可提升中奖概率，助力越多概率越高。', meta: '裂变' },
        { icon: '📸', title: '亲子合拍', desc: '上传亲子合照一键生成节日海报，可保存分享。', meta: 'AI 合成' },
      ],
    },
  },

  /* ── 抖音 AI 工坊设计探索（web-app）── */
  '抖音 AI 工坊设计探索': {
    基础信息: {
      type: 'info',
      summary: '智能体广场设计探索站点 —— React + Vite 前端，自适应布局。',
      tags: ['前端站点', 'React', 'Vite'],
      groups: [
        {
          title: '站点信息',
          rows: [
            ['名称', '抖音 AI 工坊设计探索'],
            ['类型', 'React + Vite 前端站点'],
            ['部署', 'Vercel'],
            ['状态', '已发布'],
          ],
        },
        {
          title: '技术栈',
          rows: [
            ['框架', 'React 18'],
            ['构建', 'Vite'],
            ['样式', 'Tailwind CSS'],
            ['组件', 'shadcn/ui'],
          ],
        },
        {
          title: '页面',
          rows: [
            ['页面数', '4（首页 / 作品 / 关于 / 联系）'],
            ['自适应', '是（容器查询）'],
          ],
        },
      ],
    },
    数据库: {
      type: 'database',
      tables: [
        {
          name: 'agents',
          desc: '广场展示的智能体',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'slug', type: 'varchar(64)', desc: '路由标识' },
            { name: 'title', type: 'varchar(64)', desc: '名称' },
            { name: 'author', type: 'varchar(32)', desc: '作者' },
            { name: 'category', type: 'varchar(16)', desc: '分类' },
            { name: 'uses', type: 'int', desc: '使用量' },
          ],
          rows: [
            ['1', 'luo-yonghao', '罗永浩', '李英杰', '数字员工', '2600'],
            ['2', 'lazy-goat', '懒羊羊', '梁媛媛', '角色互动', '3300'],
          ],
        },
        {
          name: 'favorites',
          desc: '用户收藏',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'user_id', type: 'bigint', desc: '用户' },
            { name: 'agent_id', type: 'bigint', desc: '智能体' },
            { name: 'created_at', type: 'datetime', desc: '收藏时间' },
          ],
        },
      ],
    },
  },

  /* ── 射击小游戏（web-game）── */
  '射击小游戏': {
    基础信息: {
      type: 'info',
      summary: '竖版弹幕射击 + Roguelike 的网页小游戏，自研 Canvas 引擎。',
      tags: ['网页游戏', '弹幕射击', 'Roguelike'],
      groups: [
        {
          title: '游戏信息',
          rows: [
            ['名称', '射击小游戏'],
            ['类型', '竖版弹幕射击 + Roguelike'],
            ['引擎', '自研 Canvas（garuda.js）'],
            ['状态', '开发中'],
          ],
        },
        {
          title: '运行',
          rows: [
            ['平台', '抖音小游戏 / H5'],
            ['分辨率', '720 × 1280'],
            ['帧率', '60 fps'],
            ['操作', '触控拖动飞机，自动开火'],
          ],
        },
        {
          title: '版本',
          rows: [
            ['当前版本', 'v0.4.0'],
            ['关卡数', '12'],
            ['武器数', '8'],
          ],
        },
      ],
    },
    开始界面: {
      type: 'info',
      summary: '玩家进入游戏的第一屏：展示标题、最高分与开始入口。',
      tags: ['场景', '入口'],
      groups: [
        {
          title: '界面元素',
          rows: [
            ['主标题', '游戏 LOGO 与副标题'],
            ['开始按钮', '点击进入对局'],
            ['最高分', '展示历史最佳成绩'],
            ['设置入口', '音效 / 操作说明'],
          ],
        },
        {
          title: '交互',
          rows: [
            ['开始游戏', '点击「开始」→ 进入游戏进行中'],
            ['查看排行', '点击榜单图标 → 排行榜'],
          ],
        },
      ],
    },
    游戏进行中: {
      type: 'info',
      summary: '核心对局画面：操控飞机躲弹幕、击毁敌机、拾取增益。',
      tags: ['场景', '核心'],
      groups: [
        {
          title: 'HUD',
          rows: [
            ['得分', '实时累计本局得分'],
            ['波次', '当前关卡 / 波次进度'],
            ['血量 / 护盾', '剩余生命与护盾状态'],
          ],
        },
        {
          title: '操作',
          rows: [
            ['移动', '触控拖动飞机'],
            ['开火', '自动持续开火'],
            ['炸弹', '点击释放清屏炸弹'],
          ],
        },
        {
          title: '元素',
          rows: [
            ['敌机波次', '12 关递增阵型与弹幕'],
            ['增益掉落', '每波三选一 Roguelike 增益'],
            ['Boss 战', '每 4 关一个多阶段 Boss'],
          ],
        },
      ],
    },
    结算界面: {
      type: 'info',
      summary: '单局结束后的结算页：展示成绩并引导再来一局。',
      tags: ['场景', '结算'],
      groups: [
        {
          title: '本局数据',
          rows: [
            ['本局得分', '累计击毁与拾取得分'],
            ['到达波次', '最远通关波次'],
            ['存活时长', '本局存活秒数'],
            ['获得金币', '可用于商店解锁'],
          ],
        },
        {
          title: '操作',
          rows: [
            ['再来一局', '重开新对局'],
            ['返回首页', '回到开始界面'],
            ['分享成绩', '生成战绩卡片分享'],
          ],
        },
      ],
    },
    玩法: {
      type: 'cards',
      note: '核心玩法与系统设计。',
      items: [
        { icon: '🔁', title: '核心循环', desc: '躲弹幕 → 击毁敌机 → 拾取增益 → 挑战 Boss → 进入下一波。' },
        { icon: '🔫', title: '武器系统', desc: '8 种主武器（散射 / 激光 / 追踪等），可叠加升级。', meta: '8 种' },
        { icon: '👾', title: '敌人波次', desc: '12 关，每关递增的敌机阵型与弹幕模式。', meta: '12 关' },
        { icon: '🎲', title: 'Roguelike 增益', desc: '每波随机三选一增益，构筑差异化流派。' },
        { icon: '🐉', title: 'Boss 战', desc: '每 4 关一个 Boss，多阶段弹幕与弱点机制。' },
        { icon: '💎', title: '道具掉落', desc: '护盾 / 炸弹 / 金币，限时拾取。' },
      ],
    },
    数据库: {
      type: 'database',
      tables: [
        {
          name: 'players',
          desc: '玩家',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'openid', type: 'varchar(64)', desc: '抖音 openid' },
            { name: 'nickname', type: 'varchar(32)', desc: '昵称' },
            { name: 'best_score', type: 'int', desc: '历史最高分' },
            { name: 'total_runs', type: 'int', desc: '总局数' },
          ],
        },
        {
          name: 'scores',
          desc: '对局得分',
          columns: [
            { name: 'id', type: 'bigint', desc: '主键' },
            { name: 'player_id', type: 'bigint', desc: '玩家' },
            { name: 'score', type: 'int', desc: '本局得分' },
            { name: 'wave', type: 'int', desc: '到达波次' },
            { name: 'duration_sec', type: 'int', desc: '存活时长（秒）' },
          ],
          rows: [
            ['1', '1001', '128450', '12', '614'],
            ['2', '1002', '96320', '9', '472'],
          ],
        },
        {
          name: 'items',
          desc: '道具 / 增益',
          columns: [
            { name: 'id', type: 'int', desc: '主键' },
            { name: 'name', type: 'varchar(32)', desc: '名称' },
            { name: 'type', type: "enum('weapon','buff','consumable')", desc: '类型' },
            { name: 'rarity', type: "enum('N','R','SR','SSR')", desc: '稀有度' },
          ],
        },
      ],
    },
  },
}

/* ─────────────────────────── 渲染 ─────────────────────────── */

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[860px] flex-col px-8 py-7">{children}</div>
    </div>
  )
}

function InfoView({ c }: { c: InfoContent }) {
  return (
    <Shell>
      {c.tags && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {c.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[var(--fill-subtle)] px-2.5 py-0.5 text-[11.5px] text-[var(--color-ink)]/65"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {c.summary && (
        <p className="mb-6 text-[13px] leading-[1.7] text-[var(--color-ink)]/60">{c.summary}</p>
      )}
      <div className="flex flex-col gap-6">
        {c.groups.map((g) => (
          <div key={g.title}>
            <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink)]/40">
              {g.title}
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)]">
              {g.rows.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex items-center gap-4 px-4 py-2.5 text-[13px] ${
                    i > 0 ? 'border-t border-[var(--divider-soft)]' : ''
                  }`}
                >
                  <span className="w-24 shrink-0 text-[var(--color-ink)]/45">{k}</span>
                  <span className="min-w-0 flex-1 text-[var(--color-ink)]/85">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

function DatabaseView({ c }: { c: DbContent }) {
  return (
    <Shell>
      <div className="flex flex-col gap-7">
        {c.tables.map((t) => (
          <div key={t.name}>
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-mono text-[14px] font-semibold text-[var(--color-ink)]">{t.name}</span>
              <span className="text-[12px] text-[var(--color-ink)]/45">{t.desc}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)]">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-[var(--fill-subtle)] text-[var(--color-ink)]/55">
                    <th className="px-3 py-2 font-medium">字段</th>
                    <th className="px-3 py-2 font-medium">类型</th>
                    <th className="px-3 py-2 font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {t.columns.map((col, i) => (
                    <tr key={col.name} className={i > 0 ? 'border-t border-[var(--divider-soft)]' : ''}>
                      <td className="px-3 py-1.5 font-mono text-[var(--color-ink)]/85">{col.name}</td>
                      <td className="px-3 py-1.5 font-mono text-[var(--color-ink)]/55">{col.type}</td>
                      <td className="px-3 py-1.5 text-[var(--color-ink)]/65">{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {t.rows && t.rows.length > 0 && (
              <div className="mt-2 overflow-x-auto">
                <div className="mb-1 text-[11px] text-[var(--color-ink)]/40">示例数据</div>
                <table className="min-w-full text-left text-[12px]">
                  <tbody>
                    {t.rows.map((row, ri) => (
                      <tr key={ri} className={ri > 0 ? 'border-t border-[var(--divider-soft)]' : ''}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="whitespace-nowrap px-3 py-1.5 text-[var(--color-ink)]/70">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </Shell>
  )
}

function CardsView({ c }: { c: CardsContent }) {
  const cols = c.columns ?? 2
  return (
    <Shell>
      {c.note && <p className="mb-4 text-[13px] text-[var(--color-ink)]/55">{c.note}</p>}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {c.items.map((it) => (
          <div
            key={it.title}
            className="flex gap-3 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-3.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--fill-subtle)] text-[18px]">
              {it.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[13.5px] font-medium text-[var(--color-ink)]">{it.title}</span>
                {it.meta && (
                  <span className="shrink-0 rounded-full bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10.5px] text-[var(--color-ink)]/55">
                    {it.meta}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[12px] leading-[1.55] text-[var(--color-ink)]/55">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/** Render a project's object content, or null when there's no tailored mock
 *  (caller then falls back to the doc / code views). `kind` is accepted for
 *  future per-kind defaults but content is currently keyed by project. */
export function ProjectObjectView({
  projectTitle,
  label,
}: {
  projectTitle: string
  kind: ProjectKind
  label: string
}): ReactNode | null {
  const c = CONTENT[projectTitle]?.[label]
  if (!c) return null
  switch (c.type) {
    case 'info':
      return <InfoView c={c} />
    case 'database':
      return <DatabaseView c={c} />
    case 'cards':
      return <CardsView c={c} />
    default:
      return null
  }
}
