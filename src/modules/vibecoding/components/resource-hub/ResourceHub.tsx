import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Plus, Search } from '@/shared/icons'
import {
  HUB_TABS,
  TOOLS,
  TOOL_CATEGORIES,
  KNOWLEDGE_BASES,
  KNOWLEDGE_FILTERS,
  MODEL_SERIES,
  MODEL_FILTERS,
  PUBLISHERS,
  PUBLISHER_FILTERS,
  TRIGGERS,
  gradientFor,
  type HubTab,
} from './data'
import {
  CardBody,
  CardShell,
  Chips,
  FilterGroup,
  GlyphBanner,
  ImageBanner,
  KnowledgeBanner,
  SectionTitle,
  ToolFooter,
  UsageCount,
  WordmarkBanner,
} from './cards'

/** 资源库 — rebuilt 5-tab library (工具箱 / 知识库 / 模型库 / 发布器 / 触发器).
 *  Self-contained mock UI; reuses the small card primitives in ./cards. */
export default function ResourceHub() {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState<HubTab>('tools')
  const [search, setSearch] = useState('')
  const [toolCat, setToolCat] = useState<string>('全部')
  const [kbFilter, setKbFilter] = useState<string>('全部')
  const [modelFilter, setModelFilter] = useState<Record<string, string>>({})
  const [pubFilter, setPubFilter] = useState<Record<string, string>>({})

  const q = search.trim().toLowerCase()
  const match = (...fields: string[]) =>
    !q || fields.some((f) => f.toLowerCase().includes(q))

  const grid = 'grid grid-cols-2 gap-4 @[620px]:grid-cols-3 @[960px]:grid-cols-4'

  return (
    <div className="@container flex h-full min-h-0 w-full flex-col bg-[var(--color-surface-0)]">
      {/* Header: title + tabs */}
      <div className="flex shrink-0 items-baseline gap-6 border-b border-[var(--divider-soft)] px-6 pt-5">
        <h1 className="shrink-0 pb-3 text-[20px] font-semibold leading-[1.2] text-[var(--color-ink)]">
          资源库
        </h1>
        <div className="flex items-baseline gap-6">
          {HUB_TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative pb-3 text-[14px] leading-[1.2] transition-colors ${
                  active
                    ? 'font-semibold text-[var(--color-ink)]'
                    : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]/85'
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-t bg-[var(--color-ink)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Toolbar: search + primary action */}
      <div className="flex shrink-0 items-center justify-between gap-3 px-6 pt-4">
        <label className="flex h-9 w-[280px] items-center gap-2 rounded-full border border-[var(--divider)] bg-[var(--color-surface-0)] px-4 text-[14px] text-[var(--color-ink)]/55">
          <Search size={16} strokeWidth={2} className="shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索"
            className="min-w-0 flex-1 bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/45"
          />
        </label>
        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--divider)] bg-[var(--color-surface-0)] px-4 text-[13px] font-medium text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)]"
        >
          <Plus size={15} strokeWidth={2} />
          {tab === 'tools' ? '创建工具' : tab === 'knowledge' ? '创建知识库' : tab === 'models' ? '接入模型' : tab === 'publishers' ? '创建发布器' : '创建触发器'}
        </button>
      </div>

      {/* Body — fades + rises in on load and on each tab switch (keyed by tab). */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <motion.div
          key={tab}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
        {tab === 'tools' && (
          <>
            <Chips options={TOOL_CATEGORIES} value={toolCat} onChange={setToolCat} />
            <div className="mt-4">
              <SectionTitle title="工具广场" count={TOOLS.length} />
            </div>
            <div className={`mt-4 ${grid}`}>
              {TOOLS.filter((t) => (toolCat === '全部' || t.category === toolCat) && match(t.name, t.desc)).map((t) => (
                <CardShell key={t.id}>
                  <ImageBanner src={t.image} />
                  <div className="flex min-w-0 flex-col gap-2 p-3">
                    <h3 className="truncate text-[15px] font-semibold text-[var(--color-ink)]">{t.name}</h3>
                    <p className="truncate text-[12px] text-[var(--color-ink)]/55">{t.desc}</p>
                    <ToolFooter source={t.source} date={t.date} usage={t.usage} />
                  </div>
                </CardShell>
              ))}
            </div>
          </>
        )}

        {tab === 'knowledge' && (
          <>
            <Chips options={KNOWLEDGE_FILTERS} value={kbFilter} onChange={setKbFilter} />
            <div className="mt-4">
              <SectionTitle title="标准知识库" count={KNOWLEDGE_BASES.length} />
            </div>
            <div className={`mt-4 ${grid}`}>
              {KNOWLEDGE_BASES.filter((k) => (kbFilter === '全部' || k.kind === kbFilter) && match(k.name, k.desc)).map((k) => (
                <CardShell key={k.id}>
                  <KnowledgeBanner image={k.image} icon={k.icon} />
                  <div className="flex min-w-0 flex-col px-4 pb-4 pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[var(--color-ink)]">{k.name}</h3>
                      <UsageCount value={k.count} />
                    </div>
                    <p className="mt-1.5 truncate text-[12px] text-[var(--color-ink)]/55">{k.desc}</p>
                  </div>
                </CardShell>
              ))}
            </div>
          </>
        )}

        {tab === 'models' && (
          <>
            <div className="space-y-2">
              {MODEL_FILTERS.map((f) => (
                <FilterGroup
                  key={f.label}
                  label={f.label}
                  options={f.options}
                  value={modelFilter[f.label] ?? '全部'}
                  onChange={(v) => setModelFilter((p) => ({ ...p, [f.label]: v }))}
                />
              ))}
            </div>
            <div className="mt-4">
              <SectionTitle title="通识模型" count={MODEL_SERIES.reduce((s, m) => s + m.count, 0)} />
            </div>
            <div className={`mt-4 ${grid}`}>
              {MODEL_SERIES.filter((m) => match(m.name, m.desc, m.wordmark)).map((m, i) => (
                <CardShell key={m.id}>
                  <WordmarkBanner gradient={gradientFor(i)} wordmark={m.wordmark} dark={m.id === 'm-kimi'} />
                  <CardBody
                    title={m.name}
                    desc={m.desc}
                    trailing={
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[var(--fill-subtle)] px-1.5 text-[11px] font-medium text-[var(--color-ink)]/55">
                        {m.count}
                      </span>
                    }
                  />
                </CardShell>
              ))}
            </div>
          </>
        )}

        {tab === 'publishers' && (
          <>
            <div className="space-y-2">
              {PUBLISHER_FILTERS.map((f) => (
                <FilterGroup
                  key={f.label}
                  label={f.label}
                  options={f.options}
                  value={pubFilter[f.label] ?? '全部'}
                  onChange={(v) => setPubFilter((p) => ({ ...p, [f.label]: v }))}
                />
              ))}
            </div>
            <div className="mt-4">
              <SectionTitle title="Feed" count={PUBLISHERS.length} />
            </div>
            <div className={`mt-4 ${grid}`}>
              {PUBLISHERS.filter((p) => match(p.name, p.title)).map((p, i) => (
                <CardShell key={p.id}>
                  <div className="flex aspect-[3/4] flex-col overflow-hidden p-3" style={{ background: gradientFor(i) }}>
                    <div className="flex items-center gap-2 text-[10px] text-[#1c1f23]/55">
                      <span>经验</span><span>同城</span><span>关注</span><span className="font-medium text-[#1c1f23]">推荐</span>
                    </div>
                    <div className="mt-3 rounded-lg bg-white/92 p-2.5 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.2)]">
                      <div className="truncate text-[12px] font-semibold text-[#1c1f23]">{p.title}</div>
                      <div className="mt-1 line-clamp-2 text-[10.5px] leading-[1.5] text-[#1c1f23]/60">{p.sub}</div>
                    </div>
                  </div>
                  <CardBody title={p.name} desc={`组件形式 · ${p.app}`} trailing={
                    <span className="rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10.5px] text-[var(--color-ink)]/55">{p.app}</span>
                  } />
                </CardShell>
              ))}
            </div>
          </>
        )}

        {tab === 'triggers' && (
          <>
            <div className="flex items-center gap-2">
              {['适用场景', '触发方式', '支持应用'].map((f) => (
                <span key={f} className="inline-flex h-8 items-center gap-1 rounded-full border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 text-[13px] text-[var(--color-ink)]/65">
                  {f} <span className="text-[var(--color-ink)]/35">⌄</span>
                </span>
              ))}
            </div>
            <div className="mt-4">
              <SectionTitle title="开放触发器" count={TRIGGERS.length} />
            </div>
            <div className={`mt-4 ${grid}`}>
              {TRIGGERS.filter((t) => match(t.name, t.desc)).map((t, i) => (
                <CardShell key={t.id}>
                  <GlyphBanner gradient={gradientFor(i + 4)} glyph={t.glyph} badge={t.status} />
                  <CardBody title={t.name} desc={t.desc} />
                </CardShell>
              ))}
            </div>
          </>
        )}
        </motion.div>
      </div>
    </div>
  )
}
