import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  ExternalLink,
  FileText,
  Gift,
  ShieldCheck,
  Target,
  Users,
} from '@/shared/icons'
import type { AssetCatalogItem } from '../../assets/assetCatalog'
import type { GameplayEvidenceStatus } from '../../assets/gameplayAssetProfiles'

type DetailTab = 'play' | 'contract' | 'release'

const STATUS_STYLE: Record<GameplayEvidenceStatus, string> = {
  源文档已确认: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  规范化建议: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  待接入核验: 'bg-amber-50 text-amber-700 ring-amber-600/15',
}

function CapabilityScene({ item }: { item: AssetCatalogItem }) {
  const profile = item.gameplayProfile!
  return (
    <div className="min-h-[340px] overflow-hidden bg-white">
      <div className="grid min-h-[340px] gap-px bg-[#E4E4E7] lg:grid-cols-[minmax(380px,0.78fr)_minmax(520px,1.22fr)]">
        <div className="flex flex-col">
          <div className="flex h-full flex-col bg-white p-6 min-[1180px]:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#F4F4F5] px-2 py-1 text-xs font-medium text-[#71717A]">玩法库</span>
              <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">{item.status}</span>
              <span className="text-xs text-[#A1A1AA]">v{profile.capability.version}</span>
            </div>
            <h1 className="mt-5 text-[28px] font-semibold leading-[36px] tracking-[-0.02em] text-[#1C1F23]">{item.name}</h1>
            <p className="mt-2 text-xl font-semibold text-[#C93553]">{profile.presentation.headline}</p>
            <p className="mt-3 max-w-[520px] text-sm leading-6 text-[#71717A]">{profile.presentation.description}</p>
            <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#E4E4E7]">
            {profile.preset.stages.length ? [
              ['关卡', `${profile.preset.stages.length} 关`],
              ['逐关合计', `${profile.preset.totalTargets} 个`],
              ['单关', `${profile.preset.roundSeconds} 秒`],
            ].map(([label, value]) => <div key={label} className="bg-white px-3 py-3"><p className="text-xs text-[#A1A1AA]">{label}</p><p className="mt-1 text-base font-semibold text-[#1C1F23]">{value}</p></div>) : null}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center bg-[#F5F7FA] p-6 min-[1180px]:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-[#1C1F23]">玩家流程</p>
              <p className="mt-1 text-xs text-[#71717A]">进入、挑战、结算、领奖与回流</p>
            </div>
            <span className="rounded-full border border-[#E4E4E7] bg-white px-2.5 py-1 text-xs text-[#71717A]">七夕预设</span>
          </div>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {profile.playerLoop.map((step, index) => (
              <div key={step.id} className="group relative min-w-0">
                <div className={`flex min-h-[128px] flex-col rounded-xl border bg-white p-3 ${index === 1 ? 'border-[#F4A9BA]' : 'border-[#E4E4E7]'}`}>
                  <span className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${index === 1 ? 'bg-[#FF5B76] text-white' : 'bg-[#F4F4F5] text-[#71717A]'}`}>{index + 1}</span>
                  <p className="mt-3 text-sm font-semibold text-[#1C1F23]">{step.label}</p>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-4 text-[#71717A]">{step.detail}</p>
                </div>
                {index < profile.playerLoop.length - 1 ? <span aria-hidden className="absolute -right-[6px] top-[22px] z-10 size-3 rounded-full border-2 border-[#F5F7FA] bg-[#FF7088]" /> : null}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E4E4E7] bg-white px-3 py-2.5 text-xs text-[#71717A]">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>失败不返还次数 · 奖励必须幂等 · 风控状态不展示任何利益模块</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerView({ item }: { item: AssetCatalogItem }) {
  const profile = item.gameplayProfile!
  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
          <div className="flex items-start justify-between gap-5">
            <div><h2 className="text-[16px] font-semibold text-[#161823]">七夕预设</h2><p className="mt-1 text-sm text-[#161823]/40">限时找物的关卡、时长、目标和奖励配置。</p></div>
            <span className="rounded-md bg-[#FFF0F4] px-2.5 py-1 text-xs font-medium text-[#C93553]">{profile.preset.activityName}</span>
          </div>
          <div className="mt-5 flex items-end gap-2">
            {profile.preset.stages.map((count, index) => (
              <div key={index} className="min-w-0 flex-1">
                <div className="flex items-end justify-center rounded-t-lg bg-[linear-gradient(180deg,#FFECF1,#FFE1E9)] px-1 pb-2" style={{ height: 48 + index * 7 }}>
                  <span className="text-sm font-semibold text-[#B82D4B]">{count}</span>
                </div>
                <div className={`h-1.5 ${index === 2 || index === 6 ? 'bg-[#F4A62A]' : 'bg-[#FF6680]'}`} />
                <p className="mt-1.5 text-center text-xs text-[#161823]/34">第 {index + 1} 关</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              [Clock, '90 秒', '单关倒计时'],
              [Target, `${profile.preset.totalTargets} 个`, '总目标数量'],
              [Gift, '3 / 7', '消费券里程碑'],
            ].map(([Icon, value, label]) => {
              const MetricIcon = Icon as typeof Clock
              return <div key={String(label)} className="rounded-xl bg-[#F7F7F9] p-3"><MetricIcon className="size-4 text-[#FF5B76]" /><p className="mt-2 text-[15px] font-semibold text-[#161823]">{String(value)}</p><p className="mt-1 text-xs text-[#161823]/36">{String(label)}</p></div>
            })}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
          <h2 className="text-[16px] font-semibold text-[#161823]">什么时候用</h2>
          <div className="mt-4 space-y-2.5">
            {profile.decision.useWhen.map((entry) => <div key={entry} className="flex items-start gap-2.5 text-sm leading-[17px] text-[#161823]/58"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />{entry}</div>)}
          </div>
          <div className="mt-5 border-t border-[#ECEDEF] pt-4">
            <p className="text-sm font-semibold text-[#161823]/62">不适用</p>
            <div className="mt-2.5 space-y-2">
              {profile.decision.avoidWhen.map((entry) => <div key={entry} className="flex items-start gap-2.5 text-xs leading-[16px] text-[#161823]/42"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />{entry}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
        <div className="flex items-end justify-between gap-6"><div><h2 className="text-[16px] font-semibold text-[#161823]">运行状态</h2><p className="mt-1 text-sm text-[#161823]/40">触发条件、页面反馈与下一步状态。</p></div><span className="text-xs text-[#161823]/32">{profile.states.length} 个状态</span></div>
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E7E8EA]">
          <div className="grid grid-cols-[110px_1fr_1.4fr_130px] bg-[#F5F5F7] px-4 py-2.5 text-xs font-semibold text-[#161823]/38"><span>状态</span><span>触发</span><span>用户看到什么</span><span>下一步</span></div>
          {profile.states.map((entry) => <div key={entry.state} className="grid grid-cols-[110px_1fr_1.4fr_130px] gap-3 border-t border-[#EFF0F1] px-4 py-3 text-sm leading-[16px]"><code className="font-medium text-[#C93553]">{entry.state}</code><span className="text-[#161823]/46">{entry.trigger}</span><span className="text-[#161823]/62">{entry.behavior}</span><code className="text-xs text-[#161823]/38">{entry.next}</code></div>)}
        </div>
      </section>

      <section className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
        <div className="flex items-center gap-2"><Users className="size-4 text-[#FF5B76]" /><h2 className="text-[16px] font-semibold text-[#161823]">任务切换与额度</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {profile.tasks.map((task) => <div key={`${task.phase}-${task.task}`} className="rounded-xl border border-[#E7E8EA] p-4"><span className={`rounded-md px-2 py-1 text-xs font-medium ${task.phase === '全通后' ? 'bg-violet-50 text-violet-700' : 'bg-[#FFF0F4] text-[#C93553]'}`}>{task.phase}</span><h3 className="mt-3 text-sm font-semibold text-[#161823]">{task.task}</h3><p className="mt-2 text-sm text-[#161823]/56">{task.reward}</p><p className="mt-3 border-t border-[#F0F1F2] pt-2.5 text-xs text-[#161823]/34">{task.quota} · {task.reset}</p></div>)}
        </div>
      </section>
    </div>
  )
}

function ContractView({ item }: { item: AssetCatalogItem }) {
  const profile = item.gameplayProfile!
  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
          <div className="flex items-center gap-2"><Code2 className="size-4 text-blue-600" /><h2 className="text-[16px] font-semibold text-[#161823]">调用参数</h2></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E4E4E7] bg-[#F5F7FA] p-4">
              <p className="text-sm font-medium text-[#1C1F23]">必填</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{profile.contract.requiredArguments.map((entry) => <code key={entry} className="rounded-md bg-white px-2 py-1 text-xs text-[#71717A] ring-1 ring-[#E4E4E7]">{entry}</code>)}</div>
            </div>
            <div className="rounded-xl border border-[#E4E4E7] bg-[#F5F7FA] p-4">
              <p className="text-sm font-medium text-[#1C1F23]">可选</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{profile.contract.optionalArguments.map((entry) => <code key={entry} className="rounded-md bg-white px-2 py-1 text-xs text-[#71717A] ring-1 ring-[#E4E4E7]">{entry}</code>)}</div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-4 text-[#161823]/38">场景、热点、奖励或风险引用缺失时，资产状态保持“待接入”。</p>
        </div>
        <div className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
          <div className="flex items-center gap-2"><Database className="size-4 text-violet-600" /><h2 className="text-[16px] font-semibold text-[#161823]">端口与事件</h2></div>
          {[['输入', profile.contract.inputs], ['输出', profile.contract.outputs], ['事件', profile.contract.events]].map(([label, entries]) => <div key={String(label)} className="mt-4"><p className="text-xs font-semibold text-[#161823]/38">{String(label)}</p><div className="mt-2 flex flex-wrap gap-1.5">{(entries as readonly string[]).map((entry) => <code key={entry} className="rounded-md bg-[#F2F3F5] px-2 py-1 text-xs text-[#161823]/58">{entry}</code>)}</div></div>)}
        </div>
      </section>

      {profile.configGroups.map((group) => (
        <section key={group.name} className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
          <div className="flex items-end justify-between gap-6"><div><h2 className="text-[16px] font-semibold text-[#161823]">{group.name}</h2><p className="mt-1 text-sm text-[#161823]/40">{group.summary}</p></div><span className="text-xs text-[#161823]/30">{group.fields.length} 个字段</span></div>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#E7E8EA]">
            {group.fields.map((field, index) => <div key={field.key} className={`grid gap-3 px-4 py-3 lg:grid-cols-[200px_130px_minmax(180px,0.7fr)_minmax(240px,1fr)] ${index ? 'border-t border-[#EFF0F1]' : ''}`}><div><p className="text-sm font-semibold text-[#161823]/68">{field.label}</p><code className="mt-1 block text-xs text-[#161823]/30">{field.key}</code></div><div><span className={`inline-flex rounded-md px-2 py-1 text-xs ring-1 ring-inset ${STATUS_STYLE[field.status]}`}>{field.status}</span><p className="mt-1.5 text-xs text-[#161823]/32">{field.ownership} · {field.type}</p></div><p className="text-sm leading-4 text-[#161823]/62">{field.value}</p><p className="text-xs leading-4 text-[#161823]/38">{field.constraint ?? '按字段类型和引用完整性校验'}</p></div>)}
          </div>
        </section>
      ))}

      <section className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
        <h2 className="text-[16px] font-semibold text-[#161823]">素材槽位</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{profile.assetSlots.map((entry) => <div key={entry.slot} className="rounded-xl border border-[#E7E8EA] p-4"><div className="flex items-center justify-between gap-3"><code className="text-xs font-semibold text-[#C93553]">{entry.slot}</code><span className="rounded bg-[#F2F3F5] px-1.5 py-0.5 text-xs text-[#161823]/38">{entry.count}</span></div><p className="mt-2 text-xs leading-4 text-[#161823]/48">{entry.requirement}</p></div>)}</div>
      </section>
    </div>
  )
}

function ReleaseView({ item }: { item: AssetCatalogItem }) {
  const profile = item.gameplayProfile!
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
      <div className="space-y-5">
        <section className="rounded-[18px] border border-[#E3E4E7] bg-white p-5">
          <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" /><h2 className="text-[16px] font-semibold text-[#161823]">发布验收</h2></div>
          <div className="mt-4 grid gap-2.5 md:grid-cols-2">{profile.acceptance.map((entry, index) => <div key={entry} className="flex items-start gap-2.5 rounded-xl border border-[#E8E9EB] px-3.5 py-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">{index + 1}</span><p className="text-xs leading-4 text-[#161823]/54">{entry}</p></div>)}</div>
        </section>
        <section className="rounded-[18px] border border-[#E3E4E7] bg-white p-5"><h2 className="text-[16px] font-semibold text-[#161823]">监测口径</h2><div className="mt-4 space-y-2.5">{profile.measurement.map((entry) => <div key={entry} className="flex items-start gap-2.5 text-sm leading-[17px] text-[#161823]/54"><Database className="mt-0.5 size-3.5 shrink-0 text-blue-600" />{entry}</div>)}</div></section>
      </div>
      <div className="space-y-5">
        <section className="rounded-[18px] border border-[#E3E4E7] bg-white p-5"><h2 className="text-[16px] font-semibold text-[#161823]">外部依赖</h2><div className="mt-4 divide-y divide-[#EFF0F1]">{profile.dependencies.map((entry) => <div key={entry.name} className="py-3 first:pt-0"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#161823]/68">{entry.name}</p><span className={`rounded-md px-2 py-1 text-xs ring-1 ring-inset ${STATUS_STYLE[entry.status]}`}>{entry.status}</span></div><p className="mt-1.5 text-xs leading-4 text-[#161823]/40">{entry.role}{entry.required ? ' · 必需' : ' · 可选'}</p></div>)}</div></section>
        <section className="rounded-[18px] border border-amber-200 bg-amber-50/60 p-5"><div className="flex items-center gap-2"><AlertTriangle className="size-4 text-amber-600" /><h2 className="text-[14px] font-semibold text-amber-950">发布前仍需补齐</h2></div><div className="mt-3 flex flex-wrap gap-1.5">{profile.source.openQuestions.map((entry) => <span key={entry} className="rounded-md bg-white px-2 py-1 text-xs text-amber-900/62 ring-1 ring-amber-700/10">{entry}</span>)}</div></section>
      </div>
    </div>
  )
}

export default function GameplayKitDetail({ item }: { item: AssetCatalogItem }) {
  const profile = item.gameplayProfile
  const [tab, setTab] = useState<DetailTab>('play')
  if (!profile) return null

  return (
    <div>
      <section className="overflow-hidden rounded-xl border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]"><CapabilityScene item={item} /></section>
      <section className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4 pt-4">
        <span className="text-xs text-[#A1A1AA]">版本 {profile.capability.version}</span>
        <div className="flex flex-wrap gap-2">{profile.source.artifacts.map((artifact) => <a key={artifact.href} href={artifact.href} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-2 rounded-lg border border-[#E4E4E7] bg-white px-3 text-sm font-medium text-[#71717A] hover:bg-[#F4F4F5]"><FileText className="size-4" />{artifact.label}<span className="text-xs text-[#A1A1AA]">{artifact.format}</span></a>)}</div>
      </section>

      <nav aria-label="玩法资产详情" className="mb-5 flex items-center gap-1 rounded-xl border border-[#E3E4E7] bg-white p-1">
        {([
          ['play', '玩法解读'],
          ['contract', '调用与参数'],
          ['release', '依赖与发布验收'],
        ] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors ${tab === id ? 'bg-[#211729] text-white shadow-sm' : 'text-[#161823]/46 hover:bg-[#F4F4F6] hover:text-[#161823]/72'}`}>{label}</button>)}
        <div className="ml-auto hidden items-center gap-2 px-3 text-xs min-[980px]:flex"><a href={profile.source.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">来源文档<ExternalLink className="size-3" /></a></div>
      </nav>

      {tab === 'play' ? <PlayerView item={item} /> : tab === 'contract' ? <ContractView item={item} /> : <ReleaseView item={item} />}

      <section className="mt-5 rounded-xl border border-[#E4E4E7] bg-white p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-base font-semibold text-[#1C1F23]">来源文件</h2><p className="mt-1 text-sm font-medium text-[#1C1F23]">{profile.source.documentTitle}</p><p className="mt-1 text-xs text-[#71717A]">已确认：{profile.source.verified.join('、')}</p></div><div className="flex flex-wrap gap-2"><a href={profile.source.documentUrl} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1.5 rounded-lg border border-[#E4E4E7] px-3 text-sm font-medium text-[#71717A] hover:bg-[#F4F4F5]">飞书 PRD<ExternalLink className="size-4" /></a><a href={profile.source.figmaUrl} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1.5 rounded-lg border border-[#E4E4E7] px-3 text-sm font-medium text-[#71717A] hover:bg-[#F4F4F5]">Figma 交互稿<ExternalLink className="size-4" /></a></div></div></section>
    </div>
  )
}
