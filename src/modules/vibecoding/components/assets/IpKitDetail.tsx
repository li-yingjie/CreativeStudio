import {
  AlertTriangle,
  Check,
  ExternalLink,
  Eye,
  FileJson,
  FileText,
  Heart,
  Lock,
  Ruler,
  ShieldCheck,
  Sparkles,
} from '@/shared/icons'
import type { AssetCatalogItem, AssetVisualReference } from '../../assets/assetCatalog'
import type { IpKitEvidenceStatus } from '../../assets/ipKitProfiles'

function evidenceStatusStyle(status: IpKitEvidenceStatus) {
  if (status === '已核验') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === '待归档') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

function EvidenceStatus({ status }: { status: IpKitEvidenceStatus }) {
  return <span className={`inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 text-xs font-medium ${evidenceStatusStyle(status)}`}>{status}</span>
}

function SectionHeading({ title, description }: { eyebrow: string; title: string; description: string; accent: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold leading-7 text-[#1C1F23]">{title}</h2>
      <p className="mt-1 max-w-[820px] text-xs leading-4 text-[rgba(34,39,39,0.6)]">{description}</p>
    </div>
  )
}

function EvidenceImage({ reference, onPreview, className = '' }: { reference: AssetVisualReference; onPreview: (reference: AssetVisualReference) => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => onPreview(reference)}
      className={`group/image relative block overflow-hidden border border-[#E6E7E9] bg-[#F4F6F8] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#357EF8] ${className}`}
      aria-label={`查看完整图片：${reference.label}`}
    >
      <img src={reference.src} alt="" aria-hidden className="absolute inset-[-18px] size-[calc(100%+36px)] object-cover opacity-[0.13] blur-2xl" />
      <img src={reference.src} alt="" className="relative size-full object-contain p-3 transition duration-500 group-hover/image:scale-[1.012]" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#161823]/86 via-[#161823]/52 to-transparent px-3 pb-3 pt-10 text-white">
        <span className="block text-xs font-semibold">{reference.label}</span>
        <span className="mt-1 block truncate text-xs text-white/64">{reference.specification}</span>
      </span>
    </button>
  )
}

export default function IpKitDetail({ item, onPreview }: { item: AssetCatalogItem; onPreview: (reference: AssetVisualReference) => void }) {
  const profile = item.ipKitProfile
  if (!profile) return null
  const { presentation } = profile
  const references = item.visualReferences ?? []
  const reference = (index: number) => references[index]
  const actionCount = profile.actionCategories.reduce((total, category) => total + category.count, 0)

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="grid min-h-[360px] lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]">
          <div className="flex flex-col px-6 py-6 min-[1180px]:px-8 min-[1180px]:py-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#F4F4F5] px-2 py-1 text-xs font-medium text-[#71717A]">IP 资产</span>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{item.status}</span>
              <span className="text-xs text-[#A1A1AA]">v{item.version}</span>
            </div>

            <h1 className="mt-5 max-w-[650px] text-balance text-[28px] font-semibold leading-[36px] tracking-[-0.02em] text-[#1C1F23]">{presentation.cardTitle}</h1>
            <p className="mt-3 max-w-[700px] text-sm leading-6 text-[#71717A]">{item.summary}</p>

            <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-[#E4E5E7] bg-[#E4E5E7] sm:grid-cols-4">
              {[
                ['标准形象', '2D / 3D'],
                ['标准表情', `${profile.expressions.count} 种`],
                ['动作资产', `${actionCount} 个`],
                ['源文件', 'AI / PSD / STL'],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#FAFAFB] px-3.5 py-3">
                  <p className="text-xs text-[#A1A1AA]">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#1C1F23]">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-auto pt-5 text-xs leading-4 text-[#A1A1AA]">标准形象、表情、动作与源文件均按当前版本管理</p>
          </div>

          <div className="relative min-h-[340px] overflow-hidden border-t border-[#E4E4E7] bg-[#F5F7FA] lg:border-l lg:border-t-0">
            <div className="absolute left-5 top-5 flex flex-wrap gap-1.5">
              {presentation.heroTags.map((tag) => <span key={tag} className="rounded-full border border-[#E4E4E7] bg-white px-2.5 py-1 text-xs font-medium text-[#71717A] shadow-[0_1px_3px_rgba(0,0,0,.05)]">{tag}</span>)}
            </div>
            <button type="button" onClick={() => reference(2) && onPreview(reference(2))} className="group/hero absolute inset-x-[8%] bottom-0 top-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#357EF8]" aria-label="查看心仔 3D 标准形象">
              <img src={presentation.heroImage} alt="心仔 3D 标准形象" className="size-full object-contain object-bottom drop-shadow-[0_24px_24px_rgba(170,44,40,0.16)] transition duration-700 group-hover/hero:scale-[1.012]" />
            </button>
            <div className="absolute bottom-4 right-4 rounded-lg border border-white/65 bg-white/78 px-3 py-2 text-right shadow-sm backdrop-blur-md">
              <p className="text-xs text-[#A1A1AA]">核心定位</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: presentation.accentDeep }}>吃喝玩乐好搭子</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[18px] border border-[#E0E2E5] bg-white lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <div className="p-6">
          <SectionHeading eyebrow="Character identity" title="角色档案" description="心仔的身份、性格和角色能力。" accent={presentation.accent} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {profile.identityFacts.map((fact) => (
              <article key={fact.label} className="rounded-xl border border-[#E6E7E9] bg-[#FAFAFB] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#161823]/32">{fact.label}</p>
                <h3 className="mt-1.5 text-base font-semibold text-[#161823]">{fact.value}</h3>
                <p className="mt-1.5 text-xs leading-[15px] text-[#161823]/44">{fact.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {profile.abilities.map((ability, index) => (
              <article key={ability.name} className="relative overflow-hidden rounded-xl p-4 text-white" style={{ backgroundColor: index ? presentation.accentDeep : presentation.accent }}>
                <div className="flex items-center gap-2">{index ? <Heart className="size-4" /> : <Eye className="size-4" />}<h3 className="text-sm font-semibold">{ability.name}</h3></div>
                <p className="mt-2 text-xs leading-[15px] text-white/68">{ability.detail}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="border-t border-[#E0E2E5] bg-[#FAFAFB] p-5 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2"><FileText className="size-4" style={{ color: presentation.accent }} /><h3 className="text-sm font-semibold text-[#1C1F23]">资产文件</h3></div>
          <dl className="mt-4 space-y-3 text-xs">
            {[
              ['形象规范', '角色结构、比例、标准色与使用要求'],
              ['动作资产库', '15 种表情、30 个动作与源文件'],
              ['包含内容', profile.source.evidence],
            ].map(([label, value]) => <div key={label} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3"><dt className="text-[#161823]/34">{label}</dt><dd className="font-medium leading-4 text-[#161823]/58">{value}</dd></div>)}
          </dl>
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-[14px] text-amber-800">{profile.source.excluded}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={profile.markdownPath} target="_blank" rel="noreferrer" className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DCDDDF] bg-white text-xs font-medium text-[#161823]/64 hover:bg-[#F4F5F7]"><FileText className="size-3.5" />使用说明</a>
            <a href={profile.markdownPath.replace(/ip-kit\.md$/, 'image-group.json')} target="_blank" rel="noreferrer" className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DCDDDF] bg-white text-xs font-medium text-[#161823]/64 hover:bg-[#F4F5F7]"><FileJson className="size-3.5" />图片组</a>
          </div>
          <a href={profile.source.specificationUrl} target="_blank" rel="noreferrer" className="mt-2 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#161823] text-xs font-medium text-white hover:bg-[#272933]">打开形象规范<ExternalLink className="size-3.5" /></a>
          <a href={profile.source.libraryUrl} target="_blank" rel="noreferrer" className="mt-2 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DCDDDF] bg-white text-xs font-medium text-[#161823]/64 hover:bg-[#F4F5F7]">打开动作资产库<ExternalLink className="size-3.5" /></a>
        </aside>
      </section>

      <section className="overflow-hidden rounded-[18px] border border-[#E0E2E5] bg-white">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
          <div className="p-6">
            <SectionHeading eyebrow="Anatomy rules" title="角色结构" description="爱心脑袋、雷达眼、云朵腮红、百宝挎包、手部和服装的使用规则。" accent={presentation.accent} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {profile.anatomy.map((rule, index) => (
                <article key={rule.name} className="rounded-xl border border-[#E5E6E8] bg-[#FAFAFB] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><span className="font-mono text-xs font-semibold" style={{ color: presentation.accent }}>{String(index + 1).padStart(2, '0')}</span><h3 className="mt-1 text-sm font-semibold text-[#161823]">{rule.name}</h3></div>
                    <EvidenceStatus status={rule.status} />
                  </div>
                  <p className="mt-1.5 text-xs leading-[13px] text-[#161823]/36">{rule.role}</p>
                  <div className="mt-3 border-l-2 border-[#161823] pl-2.5"><div className="flex items-center gap-1 text-xs font-semibold text-[#161823]/58"><Lock className="size-3" />不可变</div><p className="mt-1 text-xs leading-[14px] text-[#161823]/44">{rule.fixed}</p></div>
                  <div className="mt-2 border-l-2 pl-2.5" style={{ borderColor: presentation.accent }}><p className="text-xs font-semibold" style={{ color: presentation.accent }}>可配置</p><p className="mt-1 text-xs leading-[14px] text-[#161823]/44">{rule.configurable}</p></div>
                </article>
              ))}
            </div>
          </div>
          {reference(1) ? <EvidenceImage reference={reference(1)} onPreview={onPreview} className="min-h-[520px] border-0 border-t lg:border-l lg:border-t-0" /> : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-[18px] border border-[#E0E2E5] bg-white p-6">
        <SectionHeading eyebrow="Color & proportion" title="标准色与比例" description="官方标准色与以爱心脑袋为基准的角色比例。" accent={presentation.accent} />
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E3E4E6] bg-[#E3E4E6] sm:grid-cols-3">
            {profile.colors.map((token) => (
              <article key={token.value} className="bg-white p-3.5">
                <div className="h-16 rounded-lg border border-black/10" style={{ backgroundColor: token.value }} />
                <div className="mt-2.5 flex items-center justify-between gap-2"><h3 className="truncate text-xs font-semibold text-[#161823]/70">{token.name}</h3><code className="text-xs text-[#161823]/38">{token.value}</code></div>
                <p className="mt-1 text-xs font-medium text-[#161823]/40">{token.pantone ? `Pantone ${token.pantone}` : '屏幕黑'}</p>
                <p className="mt-1.5 text-xs leading-[13px] text-[#161823]/36">{token.role}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {profile.proportions.map((rule) => (
              <article key={rule.label} className="flex items-center gap-4 rounded-xl border border-[#E5E6E8] bg-[#FAFAFB] px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white font-mono text-xs font-semibold shadow-sm" style={{ color: presentation.accent }}>{rule.value}</span>
                <div><h3 className="text-xs font-semibold text-[#161823]/68">{rule.label}</h3><p className="mt-1 text-xs leading-[13px] text-[#161823]/38">{rule.detail}</p></div>
              </article>
            ))}
            {reference(4) ? <button type="button" onClick={() => onPreview(reference(4))} className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DCDDDF] text-xs font-medium text-[#161823]/58 hover:bg-[#F4F5F7]"><Ruler className="size-3.5" />查看完整比例图</button> : null}
          </div>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[18px] border border-[#E0E2E5] bg-white lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="p-6">
          <SectionHeading eyebrow="Expression system" title="标准表情" description={`${profile.expressions.count} 种已归档表情。`} accent={presentation.accent} />
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {profile.expressions.names.map((name, index) => <span key={name} className="rounded-lg border border-[#E3E4E6] bg-[#FAFAFB] px-2 py-2.5 text-center text-xs font-medium text-[#161823]/56"><i className="mr-1 font-mono text-[7px]" style={{ color: presentation.accent }}>{String(index + 1).padStart(2, '0')}</i>{name}</span>)}
          </div>
        </div>
        <div className="grid min-h-[340px] grid-cols-2 gap-px border-t border-[#E0E2E5] bg-[#E0E2E5] lg:border-l lg:border-t-0">
          {[reference(5), reference(6)].filter(Boolean).map((entry) => entry ? <EvidenceImage key={entry.src} reference={entry} onPreview={onPreview} className="border-0 rounded-none" /> : null)}
        </div>
      </section>

      <section className="overflow-hidden rounded-[18px] border border-[#E0E2E5] bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Action library" title="动作库" description="按场景、朝向、服装和道具筛选独立动作源文件。" accent={presentation.accent} />
          <span className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium" style={{ backgroundColor: presentation.accentSoft, color: presentation.accentDeep }}>{actionCount} 个正式动作</span>
        </div>
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[#E3E4E6] bg-[#E3E4E6] sm:grid-cols-2 lg:grid-cols-4">
          {profile.actionCategories.map((category) => (
            <article key={category.name} className="bg-[#FAFAFB] p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[#161823]">{category.name}</h3><span className="font-mono text-xs font-semibold" style={{ color: presentation.accent }}>{String(category.count).padStart(2, '0')}</span></div>
              <p className="mt-2 min-h-[30px] text-xs leading-[14px] text-[#161823]/38">{category.examples.join(' · ')}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 grid auto-rows-[210px] grid-cols-2 gap-3 lg:grid-cols-6">
          {references.slice(7).map((entry, index) => <EvidenceImage key={entry.src} reference={entry} onPreview={onPreview} className={`rounded-xl ${index < 2 ? 'lg:col-span-2' : 'lg:col-span-1'} ${index === 0 ? 'row-span-2' : ''}`} />)}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[18px] border border-[#E0E2E5] bg-white lg:grid-cols-2">
        <div className="p-6">
          <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" /><h2 className="text-xl font-semibold text-[#1C1F23]">使用要求</h2></div>
          <ul className="mt-4 space-y-3">
            {profile.usageRules.map((rule) => <li key={rule} className="flex items-start gap-2.5 text-xs leading-[17px] text-[#161823]/54"><span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="size-2.5" /></span>{rule}</li>)}
          </ul>
        </div>
        <div className="border-t border-[#E0E2E5] p-6 lg:border-l lg:border-t-0" style={{ backgroundColor: presentation.accentSoft }}>
          <div className="flex items-center gap-2"><AlertTriangle className="size-4" style={{ color: presentation.accent }} /><h2 className="text-xl font-semibold text-[#1C1F23]">限制与文件状态</h2></div>
          <ul className="mt-4 space-y-3">
            {profile.dontList.map((rule) => <li key={rule} className="flex items-start gap-2.5 text-xs leading-[17px] text-[#161823]/54"><span className="mt-[7px] size-1.5 shrink-0 rounded-full" style={{ backgroundColor: presentation.accent }} />{rule}</li>)}
          </ul>
          <div className="mt-5 border-t border-black/[0.08] pt-4">
            <div className="flex items-center gap-2"><Sparkles className="size-3.5" style={{ color: presentation.accent }} /><p className="text-xs font-semibold" style={{ color: presentation.accentDeep }}>待归档文件</p></div>
            <ol className="mt-2 space-y-1.5 text-xs leading-[15px] text-[#161823]/46">{profile.pending.map((entry, index) => <li key={entry}>{index + 1}. {entry}</li>)}</ol>
          </div>
        </div>
      </section>
    </div>
  )
}
