import { ExternalLink, FileJson, FileText } from '@/shared/icons'
import type { AssetCatalogItem, AssetVisualReference } from '../../assets/assetCatalog'
import type { BrandKitEvidenceStatus } from '../../assets/brandKitProfiles'
import type { ResourceSpecEvidenceStatus } from '../../assets/resourcePositionProfiles'

function statusStyle(status: AssetCatalogItem['status']) {
  if (status === '已发布') return 'bg-emerald-50 text-emerald-700'
  if (status === '待更新') return 'bg-amber-50 text-amber-700'
  if (status === '草稿') return 'bg-blue-50 text-blue-700'
  return 'bg-violet-50 text-violet-700'
}

function evidenceStyle(status: BrandKitEvidenceStatus | ResourceSpecEvidenceStatus) {
  if (status === '已核验') return 'bg-emerald-50 text-emerald-700'
  if (status === '待归档' || status === '参考') return 'bg-amber-50 text-amber-700'
  return 'bg-blue-50 text-blue-700'
}

function EvidenceStatus({ status }: { status: BrandKitEvidenceStatus | ResourceSpecEvidenceStatus }) {
  return <span className={`inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-xs font-medium ${evidenceStyle(status)}`}>{status}</span>
}

function SectionHeading({ title, description, aside }: { title: string; description?: string; aside?: string }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h2 className="text-xl font-semibold leading-7 text-[#1C1F23]">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-4 text-[rgba(34,39,39,0.6)]">{description}</p> : null}
      </div>
      {aside ? <span className="shrink-0 text-xs text-[#A1A1AA]">{aside}</span> : null}
    </div>
  )
}

function EvidenceImage({ reference, onPreview, className = '' }: { reference: AssetVisualReference; onPreview: (reference: AssetVisualReference) => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => onPreview(reference)}
      className={`group relative overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] text-left transition-shadow hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A1A1AA]/30 ${className}`}
      aria-label={`查看完整图片：${reference.label}`}
    >
      <img
        src={reference.src}
        alt={reference.label}
        className="size-full object-cover object-top transition duration-300 group-hover:scale-[1.008]"
        style={reference.objectPosition ? { objectPosition: reference.objectPosition } : undefined}
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pb-3 pt-10 text-white">
        <span className="block text-sm font-medium">{reference.label}</span>
        <span className="mt-0.5 block truncate text-xs text-white/75">{reference.specification}</span>
      </span>
    </button>
  )
}

function CanvasDiagram({ width, height, accent }: { width: number; height: number; accent: string }) {
  const ratio = width / height
  const diagramWidth = ratio >= 2.5 ? 224 : ratio >= 1.2 ? 184 : ratio >= 0.9 ? 118 : 82
  const diagramHeight = Math.max(58, Math.min(132, diagramWidth / ratio))
  return (
    <div className="flex h-[150px] items-center justify-center rounded-xl bg-[#F5F7FA] p-4">
      <div className="relative overflow-hidden rounded-lg border border-[#D4D4D8] bg-[linear-gradient(145deg,#3A547F_0%,#8B5E86_48%,#EE9B74_100%)] shadow-[0_1px_3px_rgba(0,0,0,.08)]" style={{ width: diagramWidth, height: diagramHeight }}>
        <span className="absolute bottom-2 left-2 rounded bg-black/45 px-1.5 py-0.5 text-xs font-medium text-white">{width} × {height}</span>
        <span className="absolute right-2 top-2 size-2.5 rounded-full border border-white/70" style={{ backgroundColor: accent }} />
      </div>
    </div>
  )
}

function ResourcePositionKitDetail({ item }: { item: AssetCatalogItem }) {
  const profile = item.resourcePositionProfile
  if (!profile) return null
  const topicBackground = profile.canvases.find((canvas) => canvas.id === 'topic-background')
  const topicBanner = profile.canvases.find((canvas) => canvas.id === 'topic-banner')
  const activityCard = profile.canvases.find((canvas) => canvas.id === 'creator-activity-card')

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="grid min-h-[340px] lg:grid-cols-[minmax(420px,0.85fr)_minmax(520px,1.15fr)]">
          <div className="flex flex-col p-6 min-[1180px]:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#F4F4F5] px-2 py-1 text-xs font-medium text-[#71717A]">Brand Kit</span>
              <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyle(item.status)}`}>{item.status}</span>
              <span className="text-xs text-[#A1A1AA]">v{item.version}</span>
            </div>
            <h1 className="mt-5 max-w-[560px] text-[28px] font-semibold leading-[36px] tracking-[-0.02em] text-[#1C1F23]">{item.name}</h1>
            <p className="mt-3 max-w-[600px] text-sm leading-6 text-[#71717A]">话题页与创作者活动中心的画布尺寸、导出倍率、遮挡区、文字和配图规范。</p>
            <dl className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#E4E4E7]">
              {item.metrics.map((metric) => (
                <div key={metric.label} className="bg-white px-4 py-3">
                  <dt className="text-xs text-[#A1A1AA]">{metric.label}</dt>
                  <dd className="mt-1 text-base font-semibold text-[#1C1F23]">{metric.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-auto pt-5 text-xs leading-4 text-[#A1A1AA]">适用范围：话题页、创作者活动中心移动端与网页端资源位</p>
          </div>

          <div className="flex items-center bg-[#F5F7FA] p-6 lg:border-l lg:border-[#E4E4E7] min-[1180px]:p-8">
            <div className="w-full rounded-2xl border border-[#E4E4E7] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <div className="flex items-center justify-between text-xs text-[#71717A]"><span>话题页三件套</span><span>@3x</span></div>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_86px] items-end gap-3">
                <div>
                  <div className="relative aspect-[375/210] overflow-hidden rounded-lg border border-[#D4D4D8] bg-[linear-gradient(145deg,#3A547F_0%,#8B5E86_48%,#EE9B74_100%)]">
                    <div className="absolute inset-x-0 top-0 h-[9.52%] bg-[#FE2C55]/65" />
                    <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-b from-transparent to-[#FE2C55]/38" />
                    <span className="absolute bottom-2 left-2 rounded bg-black/45 px-1.5 py-0.5 text-xs font-medium text-white">{topicBackground?.logicalSize.width} × {topicBackground?.logicalSize.height}</span>
                  </div>
                  <div className="mt-3 flex h-9 items-center justify-between rounded-lg border border-[#D4D4D8] bg-[linear-gradient(100deg,#F9E5D0,#6BD13C)] px-3 text-xs font-medium text-[#1C1F23]">
                    <span>Banner</span><span>{topicBanner?.logicalSize.width} × {topicBanner?.logicalSize.height}</span>
                  </div>
                </div>
                <div className="relative aspect-[183/244] overflow-hidden rounded-lg border border-[#D4D4D8] bg-[linear-gradient(150deg,#2F2A5C,#D85D66)]">
                  <span className="absolute left-2 top-2 text-xs font-medium text-white">{activityCard?.logicalSize.width} × {activityCard?.logicalSize.height}</span>
                  <span className="absolute inset-x-2 bottom-2 rounded-md bg-white/92 px-1.5 py-2 text-center text-xs font-medium text-[#1C1F23]">活动卡片</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#E4E4E7] bg-white p-5">
        <SectionHeading title="资源位尺寸" description="画布为逻辑尺寸；有倍率要求的资源按导出尺寸交付。" aside={`${profile.canvases.length} 类`} />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {profile.canvases.map((canvas) => (
            <article key={canvas.id} className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-white">
              <CanvasDiagram width={canvas.logicalSize.width} height={canvas.logicalSize.height} accent={profile.presentation.accent} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs text-[#A1A1AA]">{canvas.family}</p><h3 className="mt-1 text-base font-semibold leading-[22px] text-[#222727]">{canvas.name}</h3></div>
                  <EvidenceStatus status={canvas.status} />
                </div>
                <p className="mt-2 text-xs leading-4 text-[rgba(34,39,39,0.6)]">{canvas.role}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-[#F5F7FA] p-3 text-xs">
                  <div><dt className="text-[#A1A1AA]">画布</dt><dd className="mt-1 font-medium text-[#1C1F23]">{canvas.logicalSize.width} × {canvas.logicalSize.height}</dd></div>
                  <div><dt className="text-[#A1A1AA]">导出</dt><dd className="mt-1 font-medium text-[#1C1F23]">{canvas.exportSize ? `${canvas.exportSize.width} × ${canvas.exportSize.height}` : '原尺寸'}</dd></div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
          <SectionHeading title="话题页背景遮挡区" description="关键信息需要避开系统控件与前景内容。" />
          <div className="mt-5 rounded-xl bg-[#F5F7FA] p-4">
            <div className="relative mx-auto aspect-[375/210] max-w-[520px] overflow-hidden rounded-lg border border-[#D4D4D8] bg-[linear-gradient(145deg,#3A547F_0%,#8B5E86_48%,#EE9B74_100%)]">
              <div className="absolute inset-x-0 top-0 h-[9.52%] bg-[#FF004F]/45"><span className="absolute right-2 top-1 text-xs font-medium text-white">顶部 20px</span></div>
              <div className="absolute inset-x-0 bottom-[9.52%] h-[90.48%] bg-gradient-to-b from-transparent to-[#FF004F]/40"><span className="absolute bottom-2 right-2 text-xs font-medium text-white">渐变遮挡 190px</span></div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {profile.occlusion.map((entry) => <div key={entry.name} className="flex items-start justify-between gap-4 rounded-lg border border-[#F4F4F5] px-3 py-2.5"><div><p className="text-sm font-medium text-[#1C1F23]">{entry.name}</p><p className="mt-1 text-xs leading-4 text-[#71717A]">{entry.purpose}</p></div><span className="shrink-0 text-xs text-[#71717A]">{entry.width} × {entry.height}</span></div>)}
          </div>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
          <SectionHeading title="内容规范" description="适用于含文字和配图的活动入口。" />
          <div className="mt-5 divide-y divide-[#F4F4F5]">
            {profile.contentRules.map((rule) => (
              <article key={rule.title} className="grid gap-2 py-3 first:pt-0 sm:grid-cols-[132px_minmax(0,1fr)]">
                <div><h3 className="text-sm font-medium text-[#1C1F23]">{rule.title}</h3><p className="mt-1 text-xs text-[#A1A1AA]">{rule.appliesTo}</p></div>
                <p className="text-xs leading-5 text-[#71717A]">{rule.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#E4E4E7] bg-white p-5">
        <SectionHeading title="主题变量" description="颜色随目标端主题解析，资源图中不重复写死。" aside={`${profile.tokens.length} 项`} />
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E4E4E7]">
          {profile.tokens.map((token, index) => (
            <div key={token.name} className={`grid gap-3 px-4 py-3 text-xs sm:grid-cols-[220px_90px_minmax(0,1fr)_64px] ${index ? 'border-t border-[#F4F4F5]' : ''}`}>
              <code className="break-all font-medium text-[#1C1F23]">{token.name}</code>
              <span className="text-[#71717A]">{token.type}</span>
              <span className="leading-4 text-[#71717A]">{token.value ?? token.usage}</span>
              <EvidenceStatus status={token.status} />
            </div>
          ))}
        </div>
      </section>

      <details className="group overflow-hidden rounded-xl border border-[#E4E4E7] bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 hover:bg-[#FAFAFA]">
          <div><h2 className="text-base font-semibold text-[#1C1F23]">文件与交付检查</h2><p className="mt-1 text-xs text-[#71717A]">来源文件、机器清单和待补信息</p></div>
          <span className="rounded-full border border-[#E4E4E7] px-3 py-1 text-xs text-[#71717A] group-open:hidden">展开</span>
          <span className="hidden rounded-full border border-[#E4E4E7] px-3 py-1 text-xs text-[#71717A] group-open:inline">收起</span>
        </summary>
        <div className="grid gap-5 border-t border-[#E4E4E7] p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
          <div className="space-y-2">
            {profile.validation.map((rule) => <div key={rule.code} className="flex items-start justify-between gap-4 rounded-lg bg-[#F5F7FA] px-3 py-2.5"><p className="text-xs leading-4 text-[#71717A]">{rule.message}</p><span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${rule.level === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{rule.level === 'error' ? '阻止交付' : '提醒'}</span></div>)}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1C1F23]">待补信息</p>
            <ul className="mt-2 space-y-2 text-xs leading-4 text-[#71717A]">{profile.pending.map((entry) => <li key={entry}>• {entry}</li>)}</ul>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a href={profile.markdownPath} target="_blank" rel="noreferrer" className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-white px-2 text-sm font-medium text-[#71717A] hover:bg-[#F4F4F5]"><FileText className="size-4" />说明</a>
              <a href={profile.manifestPath} target="_blank" rel="noreferrer" className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-white px-2 text-sm font-medium text-[#71717A] hover:bg-[#F4F4F5]"><FileJson className="size-4" />清单</a>
              <a href={profile.source.url} target="_blank" rel="noreferrer" className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,#323232_0%,#222222_100%)] px-2 text-sm font-medium text-white hover:opacity-90">Figma<ExternalLink className="size-4" /></a>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}

export default function BrandKitDetail({ item, onPreview }: { item: AssetCatalogItem; onPreview: (reference: AssetVisualReference) => void }) {
  if (item.resourcePositionProfile) return <ResourcePositionKitDetail item={item} />
  const profile = item.brandKitProfile
  if (!profile) return null
  const { presentation } = profile
  const references = item.visualReferences ?? []
  const heroReference = references[presentation.heroReferenceIndex] ?? references[0]
  const coreColors = profile.colors.filter((token) => token.group === '核心身份色')
  const applicationColors = profile.colors.filter((token) => token.group === '活动应用色')

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="grid min-h-[340px] lg:grid-cols-[minmax(520px,1.15fr)_minmax(420px,.85fr)]">
          {heroReference ? (
            <button type="button" onClick={() => onPreview(heroReference)} className="group relative min-h-[300px] overflow-hidden bg-[#F4F4F5] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#A1A1AA]/30" aria-label={`查看${heroReference.label}`}>
              <img src={heroReference.src} alt={heroReference.label} className="size-full object-cover object-center transition duration-300 group-hover:scale-[1.006]" />
              <span className="absolute bottom-4 left-4 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-medium text-[#1C1F23] shadow-[0_1px_4px_rgba(0,0,0,.08)] backdrop-blur-sm">{heroReference.label}</span>
            </button>
          ) : <div className="min-h-[300px] bg-[#F4F4F5]" />}
          <div className="flex flex-col border-t border-[#E4E4E7] p-6 lg:border-l lg:border-t-0 min-[1180px]:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#F4F4F5] px-2 py-1 text-xs font-medium text-[#71717A]">Brand Kit</span>
              <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyle(item.status)}`}>{item.status}</span>
              <span className="text-xs text-[#A1A1AA]">v{item.version}</span>
            </div>
            <h1 className="mt-5 text-[28px] font-semibold leading-[36px] tracking-[-0.02em] text-[#1C1F23]">{item.name}</h1>
            <p className="mt-3 text-sm leading-6 text-[#71717A]">{item.summary}</p>
            <dl className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#E4E4E7]">
              {item.metrics.map((metric) => <div key={metric.label} className="bg-white px-3 py-3"><dt className="text-xs text-[#A1A1AA]">{metric.label}</dt><dd className="mt-1 text-sm font-semibold text-[#1C1F23]">{metric.value}</dd></div>)}
            </dl>
            <div className="mt-auto flex items-end justify-between gap-4 pt-5">
              <p className="min-w-0 truncate text-xs text-[#A1A1AA]">{profile.source.fileName}</p>
              <div className="flex shrink-0 gap-1">{profile.colors.slice(0, 7).map((token) => <span key={`${token.name}-${token.value}`} className="size-5 rounded-full border border-black/10" style={{ backgroundColor: token.value }} title={`${token.name} ${token.value}`} />)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#E4E4E7] bg-white p-5">
        <SectionHeading title="品牌标识" description="平台、活动和会场身份的组合关系。" aside={`${profile.identityLevels.length} 级`} />
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E4E4E7]">
          {profile.identityLevels.map((level, index) => (
            <article key={level.order} className={`grid gap-3 px-4 py-4 md:grid-cols-[48px_190px_minmax(0,1fr)_64px] ${index ? 'border-t border-[#F4F4F5]' : ''}`}>
              <span className="text-sm font-semibold" style={{ color: presentation.accent }}>{level.order}</span>
              <div><h3 className="text-sm font-semibold text-[#1C1F23]">{level.name}</h3><p className="mt-1 text-xs leading-4 text-[#A1A1AA]">{level.role}</p></div>
              <p className="text-xs leading-5 text-[#71717A]">{level.rule}</p>
              <EvidenceStatus status={level.status} />
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#E4E4E7] bg-white p-5">
        <SectionHeading title="颜色" description="核心身份色保持稳定；活动应用色仅用于对应节目或活动节点。" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[.65fr_1.35fr]">
          {[['核心身份色', coreColors], [presentation.applicationColorTitle, applicationColors]].map(([title, colors]) => (
            <div key={String(title)} className="overflow-hidden rounded-xl border border-[#E4E4E7]">
              <h3 className="border-b border-[#F4F4F5] px-4 py-3 text-sm font-medium text-[#1C1F23]">{String(title)}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3">
                {(colors as typeof profile.colors).map((token) => (
                  <div key={`${token.name}-${token.value}`} className="min-w-0 border-b border-r border-[#F4F4F5] p-3">
                    <div className="h-16 rounded-lg border border-black/10" style={{ backgroundColor: token.value }} />
                    <div className="mt-2 flex items-center justify-between gap-2"><span className="truncate text-xs font-medium text-[#1C1F23]">{token.name}</span><code className="text-xs text-[#71717A]">{token.value}</code></div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-4 text-[#A1A1AA]">{token.role}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#E4E4E7] bg-white p-5">
        <SectionHeading title="字体与排版" description="按信息角色使用已确认的字形和层级。" />
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E4E4E7]">
          {profile.typography.map((role, index) => (
            <article key={role.role} className={`grid gap-3 px-4 py-4 md:grid-cols-[170px_1fr_1fr_70px] ${index ? 'border-t border-[#F4F4F5]' : ''}`}>
              <div><h3 className="text-sm font-semibold text-[#1C1F23]">{role.role}</h3>{index === 0 ? <p className="mt-1 text-lg font-medium italic" style={{ color: presentation.accent }}>{presentation.typographySample}</p> : null}</div>
              <div><p className="text-xs leading-5 text-[#71717A]">{role.treatment}</p><p className="mt-1 text-xs leading-4 text-[#A1A1AA]">{role.usage}</p></div>
              <p className="text-xs leading-5 text-[#A1A1AA]">{role.source}</p>
              <EvidenceStatus status={role.status} />
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#E4E4E7] bg-white p-5">
        <SectionHeading title="组件" description="可直接引用的品牌组合件及其可调整范围。" aside={`${profile.components.length} 组`} />
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {profile.components.map((component) => (
            <article key={component.name} className="rounded-xl border border-[#E4E4E7] p-4">
              <div className="flex items-start justify-between gap-4"><div><h3 className="text-base font-semibold leading-[22px] text-[#222727]">{component.name}</h3><p className="mt-1 text-xs leading-4 text-[#71717A]">{component.purpose}</p></div><EvidenceStatus status={component.status} /></div>
              <div className="mt-3 flex flex-wrap gap-1.5">{component.anatomy.map((part) => <span key={part} className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2 py-1 text-xs text-[#71717A]">{part}</span>)}</div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[#F5F7FA] p-3"><dt className="text-xs font-medium text-[#1C1F23]">固定</dt><dd className="mt-1.5 text-xs leading-4 text-[#71717A]">{component.fixed}</dd></div>
                <div className="rounded-lg bg-[#F5F7FA] p-3"><dt className="text-xs font-medium text-[#1C1F23]">可调整</dt><dd className="mt-1.5 text-xs leading-4 text-[#71717A]">{component.configurable}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-[#A1A1AA]">适用画面：{component.evidence}</p>
            </article>
          ))}
        </div>
      </section>

      {profile.experienceSystem ? (
        <section className="rounded-xl border border-[#E4E4E7] bg-white p-5">
          <SectionHeading
            title="页面体验语法"
            description="从正式长页提炼的构图、玩法皮肤、素材分工与复杂度门槛；生成页面时必须真实调用。"
            aside={`v${profile.experienceSystem.version}`}
          />
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {profile.experienceSystem.compositionRules.map((rule, index) => (
              <article key={rule.name} className="rounded-xl border border-[#E4E4E7] bg-[#FFF9F2] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#FE2C55] text-xs font-semibold text-white">{index + 1}</span>
                  <div><h3 className="text-sm font-semibold text-[#601619]">{rule.name}</h3><p className="mt-1 text-xs leading-5 text-[#8B5D5F]">{rule.intent}</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{rule.recipe.map((part) => <span key={part} className="rounded-md border border-[#FFD7C3] bg-white px-2 py-1 text-xs text-[#7B3034]">{part}</span>)}</div>
              </article>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[.8fr_1.2fr]">
            <div className="rounded-xl border border-[#E4E4E7] p-4"><h3 className="text-sm font-semibold text-[#1C1F23]">七类素材槽位</h3><div className="mt-3 flex flex-wrap gap-1.5">{profile.experienceSystem.assetFamilies.map((family) => <span key={family} className="rounded-full bg-[#FFF2DE] px-2.5 py-1 text-xs text-[#601619]">{family}</span>)}</div></div>
            <div className="rounded-xl border border-[#E4E4E7] p-4"><h3 className="text-sm font-semibold text-[#1C1F23]">高保真门槛</h3><ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#71717A]">{profile.experienceSystem.complexityGate.map((rule) => <li key={rule}>• {rule}</li>)}</ul></div>
          </div>
        </section>
      ) : null}

      {references.length ? (
        <section className="rounded-xl border border-[#E4E4E7] bg-white p-5">
          <SectionHeading title="参考图" description="来自正式交付的品牌应用画面。" aside={`${references.length} 张`} />
          <div className="mt-4 grid auto-rows-[176px] grid-cols-2 gap-3 lg:grid-cols-4">
            {references.map((reference, index) => <EvidenceImage key={reference.src} reference={reference} onPreview={onPreview} className={`${index < 2 ? 'col-span-2' : ''} ${index >= 3 ? 'row-span-2' : ''}`} />)}
          </div>
        </section>
      ) : null}

      <details className="group overflow-hidden rounded-xl border border-[#E4E4E7] bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 hover:bg-[#FAFAFA]">
          <div><h2 className="text-base font-semibold text-[#1C1F23]">使用规范与文件</h2><p className="mt-1 text-xs text-[#71717A]">使用限制、来源文件和待归档内容</p></div>
          <span className="rounded-full border border-[#E4E4E7] px-3 py-1 text-xs text-[#71717A] group-open:hidden">展开</span><span className="hidden rounded-full border border-[#E4E4E7] px-3 py-1 text-xs text-[#71717A] group-open:inline">收起</span>
        </summary>
        <div className="grid gap-5 border-t border-[#E4E4E7] p-5 lg:grid-cols-3">
          <div><h3 className="text-sm font-medium text-[#1C1F23]">使用要求</h3><ul className="mt-3 space-y-2 text-xs leading-4 text-[#71717A]">{profile.doList.map((rule) => <li key={rule}>• {rule}</li>)}</ul></div>
          <div><h3 className="text-sm font-medium text-[#1C1F23]">使用限制</h3><ul className="mt-3 space-y-2 text-xs leading-4 text-[#71717A]">{profile.dontList.map((rule) => <li key={rule}>• {rule}</li>)}</ul></div>
          <div><h3 className="text-sm font-medium text-[#1C1F23]">待归档</h3><ul className="mt-3 space-y-2 text-xs leading-4 text-[#71717A]">{profile.pending.map((entry) => <li key={entry}>• {entry}</li>)}</ul><div className="mt-4 grid grid-cols-3 gap-2"><a href={profile.markdownPath} target="_blank" rel="noreferrer" className="flex h-9 items-center justify-center gap-1 rounded-lg border border-[#E4E4E7] text-sm text-[#71717A] hover:bg-[#F4F4F5]"><FileText className="size-4" />说明</a><a href={profile.markdownPath.replace(/brand-kit\.md$/, 'image-group.json')} target="_blank" rel="noreferrer" className="flex h-9 items-center justify-center gap-1 rounded-lg border border-[#E4E4E7] text-sm text-[#71717A] hover:bg-[#F4F4F5]"><FileJson className="size-4" />图片</a><a href={profile.source.url} target="_blank" rel="noreferrer" className="flex h-9 items-center justify-center gap-1 rounded-lg bg-[linear-gradient(180deg,#323232_0%,#222222_100%)] text-sm text-white hover:opacity-90">Figma<ExternalLink className="size-4" /></a></div></div>
        </div>
      </details>
    </div>
  )
}
