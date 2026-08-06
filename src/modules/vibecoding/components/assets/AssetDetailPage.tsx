import type { ReactNode } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  History,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Upload,
} from '@/shared/icons'
import {
  ASSET_CLASS_LABEL,
  type AssetCatalogItem,
  type AssetParameterMode,
} from '../../assets/assetCatalog'

interface AssetDetailPageProps {
  item: AssetCatalogItem
  preview: ReactNode
  registryLabel: string
  onBack: () => void
  onCreateVersion: () => void
  onCreateVariant: () => void
  onUse: () => void
  useLabel?: string
}

const MODE_STYLE: Record<AssetParameterMode, string> = {
  可配置: 'bg-blue-50 text-blue-700',
  'Agent 推断': 'bg-violet-50 text-violet-700',
  引用资产: 'bg-amber-50 text-amber-700',
  固定规则: 'bg-[#F1F2F4] text-[#161823]/50',
}

function statusStyle(status: AssetCatalogItem['status']) {
  if (status === '草稿') return 'bg-blue-50 text-blue-700'
  if (status === '待更新') return 'bg-amber-50 text-amber-700'
  if (status === '内测中') return 'bg-violet-50 text-violet-700'
  return 'bg-emerald-50 text-emerald-700'
}

export default function AssetDetailPage({
  item,
  preview,
  registryLabel,
  onBack,
  onCreateVersion,
  onCreateVariant,
  onUse,
  useLabel,
}: AssetDetailPageProps) {
  const editableCount = item.parameterGroups.flatMap((group) => group.parameters).filter((parameter) => parameter.mode !== '固定规则').length
  const fixedCount = item.parameterGroups.flatMap((group) => group.parameters).filter((parameter) => parameter.mode === '固定规则').length

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F7F8]">
      <header className="flex h-[52px] shrink-0 items-center border-b border-[#E5E6E8] bg-white px-6">
        <button type="button" onClick={onBack} className="mr-3 flex size-8 items-center justify-center rounded-lg text-[#161823]/58 hover:bg-[#F3F4F5]" aria-label="返回资产中心">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex min-w-0 items-center gap-2 text-[11px]">
          <button type="button" onClick={onBack} className="text-[#161823]/42 hover:text-[#161823]/72">资产中心</button>
          <span className="text-[#161823]/20">/</span>
          <span className="truncate font-medium text-[#161823]/66">{item.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {item.status !== '草稿' ? (
            <button type="button" onClick={onCreateVariant} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#E0E1E3] bg-white px-3 text-[11px] font-medium text-[#161823]/64 hover:bg-[#F7F7F8]">
              <Copy className="size-3.5" /> 创建变体
            </button>
          ) : null}
          <button type="button" onClick={onCreateVersion} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#E0E1E3] bg-white px-3 text-[11px] font-medium text-[#161823]/64 hover:bg-[#F7F7F8]">
            <Pencil className="size-3.5" /> {item.status === '草稿' ? '继续编辑草稿' : '创建新版本'}
          </button>
          <button type="button" onClick={onUse} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-3.5 text-[11px] font-medium text-white hover:opacity-90">
            <Plus className="size-3.5" /> {useLabel ?? '用于当前项目'}
          </button>
        </div>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-[1280px]">
          <section className="grid grid-cols-[minmax(0,1fr)_360px] gap-6 rounded-2xl border border-[#E5E6E8] bg-white p-6">
            <div className="min-w-0 py-1">
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${statusStyle(item.status)}`}>{item.status}</span>
                <span className="rounded-md bg-[#F1F2F4] px-2 py-1 text-[9px] text-[#161823]/48">{ASSET_CLASS_LABEL[item.assetClass]}</span>
                <span className="text-[10px] text-[#161823]/34">v{item.version}</span>
              </div>
              <h1 className="mt-4 text-[24px] font-semibold tracking-[-0.02em] text-[#161823]">{item.name}</h1>
              <p className="mt-2 max-w-[720px] text-[12px] leading-5 text-[#161823]/50">{item.summary}</p>
              <div className="mt-5 grid max-w-[680px] grid-cols-4 gap-px overflow-hidden rounded-xl border border-[#E8E9EC] bg-[#E8E9EC]">
                {[
                  ...item.metrics.slice(0, 3),
                  { label: '可调整参数', value: `${editableCount} 项` },
                ].map((metric) => (
                  <div key={metric.label} className="min-w-0 bg-[#FAFAFB] px-3 py-3">
                    <p className="truncate text-[9px] text-[#161823]/34">{metric.label}</p>
                    <p className="mt-1 text-[12px] font-semibold text-[#161823]/72">{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => <span key={tag} className="rounded-full bg-[#F1F2F4] px-2.5 py-1 text-[9px] text-[#161823]/46">{tag}</span>)}
              </div>
            </div>
            <div>{preview}</div>
          </section>

          <div className="mt-5 grid grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] items-start gap-5">
            <main className="min-w-0 space-y-4">
              <section className="rounded-2xl border border-[#E5E6E8] bg-white">
                <div className="flex items-end justify-between border-b border-[#ECEDEF] px-5 py-4">
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#161823]">资产内容与交付</h2>
                    <p className="mt-1 text-[9px] text-[#161823]/36">下游生成、导出和验收共同读取这份清单。</p>
                  </div>
                  <span className="text-[9px] text-[#161823]/34">{item.deliverables.filter((deliverable) => deliverable.required).length} 项必需 · {item.deliverables.length} 项合计</span>
                </div>
                <div className="overflow-hidden">
                  <div className="grid grid-cols-[32px_180px_minmax(0,1fr)_72px] gap-3 bg-[#FAFAFB] px-5 py-2 text-[9px] text-[#161823]/34">
                    <span /> <span>交付内容</span><span>规格</span><span>要求</span>
                  </div>
                  {item.deliverables.map((deliverable, index) => (
                    <div key={deliverable.name} className={`grid grid-cols-[32px_180px_minmax(0,1fr)_72px] items-center gap-3 px-5 py-3 ${index ? 'border-t border-[#F0F0F2]' : ''}`}>
                      <CheckCircle2 className={`size-4 ${deliverable.required ? 'text-emerald-600' : 'text-[#161823]/20'}`} />
                      <span className="text-[10px] font-medium text-[#161823]/66">{deliverable.name}</span>
                      <span className="text-[10px] leading-4 text-[#161823]/46">{deliverable.specification}</span>
                      <span className={`text-[9px] ${deliverable.required ? 'text-[#161823]/58' : 'text-[#161823]/32'}`}>{deliverable.required ? '必须交付' : '按需交付'}</span>
                    </div>
                  ))}
                </div>
                {item.sourceFiles?.length ? (
                  <div className="border-t border-[#ECEDEF] bg-[#FAFAFB] px-5 py-3.5">
                    <p className="text-[9px] font-medium text-[#161823]/46">本版本内容文件</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.sourceFiles.map((file) => (
                        <div key={file.name} className="flex items-center gap-2 rounded-lg border border-[#E5E6E8] bg-white px-2.5 py-2">
                          <Upload className="size-3 text-[#161823]/34" />
                          <span className="max-w-[180px] truncate text-[9px] font-medium text-[#161823]/56">{file.name}</span>
                          <span className="rounded bg-[#F1F2F4] px-1.5 py-0.5 text-[7px] text-[#161823]/38">{file.format}</span>
                          <span className={`text-[8px] ${file.status === '已归档' ? 'text-emerald-700' : 'text-amber-700'}`}>{file.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-[#E5E6E8] bg-white p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#161823]">参数定义</h2>
                    <p className="mt-1 text-[9px] text-[#161823]/36">当前版本共 {editableCount + fixedCount} 项参数；编辑权限是资产契约的一部分。</p>
                  </div>
                  <div className="flex items-center gap-3 text-[8px] text-[#161823]/34"><span>{editableCount} 项可调整</span><span>{fixedCount} 项固定</span></div>
                </div>
                <div className="mt-4 space-y-3">
                  {item.parameterGroups.map((group) => (
                    <div key={group.name} className="overflow-hidden rounded-xl border border-[#E5E6E8]">
                      <div className="border-b border-[#ECEDEF] bg-[#FAFAFB] px-4 py-3">
                        <h3 className="text-[11px] font-semibold text-[#161823]/70">{group.name}</h3>
                        <p className="mt-0.5 text-[9px] text-[#161823]/34">{group.summary}</p>
                      </div>
                      <div className="divide-y divide-[#F0F0F2]">
                        {group.parameters.map((parameter) => (
                          <div key={parameter.label} className="grid grid-cols-[150px_84px_minmax(0,1fr)] items-start gap-3 px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#161823]/58">{parameter.mode === '固定规则' ? <Lock className="size-3 text-[#161823]/28" /> : null}{parameter.label}</div>
                            <span className={`inline-flex h-5 items-center justify-center rounded px-1.5 text-[8px] ${MODE_STYLE[parameter.mode]}`}>{parameter.mode}</span>
                            <div className="min-w-0"><p className="text-[10px] leading-4 text-[#161823]/62">{parameter.value}</p>{parameter.note ? <p className="mt-1 text-[8px] leading-3 text-[#161823]/30">{parameter.note}</p> : null}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E5E6E8] bg-white p-5">
                <div className="flex items-center gap-2"><History className="size-4 text-[#161823]/44" /><h2 className="text-[14px] font-semibold text-[#161823]">版本与变更</h2></div>
                <div className="mt-4 grid grid-cols-[100px_1fr_auto] items-start gap-3 rounded-xl border border-[#E5E6E8] px-4 py-3">
                  <div><span className="text-[11px] font-semibold text-[#161823]/68">v{item.version}</span><span className={`ml-2 rounded px-1.5 py-0.5 text-[8px] ${statusStyle(item.status)}`}>{item.status}</span></div>
                  <div><p className="text-[10px] font-medium text-[#161823]/58">当前查看版本</p><p className="mt-1 text-[9px] text-[#161823]/34">参数、交付物、授权和质量门槛作为一个整体冻结。</p></div>
                  <span className="text-[9px] text-[#161823]/34">{item.updatedAt}</span>
                </div>
                {item.basedOn ? (
                  <div className="mt-2 grid grid-cols-[100px_1fr_auto] items-start gap-3 rounded-xl border border-[#E5E6E8] px-4 py-3">
                    <span className="text-[10px] font-semibold text-[#161823]/50">v{item.basedOn.version}</span>
                    <div><p className="text-[10px] font-medium text-[#161823]/52">来源版本 · {item.basedOn.name}</p><p className="mt-1 text-[9px] text-[#161823]/32">新草稿从该版本复制，后续变更不会回写来源版本。</p></div>
                    <span className="text-[8px] text-[#161823]/28">只读基线</span>
                  </div>
                ) : null}
                <div className="mt-2 rounded-xl bg-[#F5F5F6] px-4 py-3 text-[9px] leading-4 text-[#161823]/42">
                  {item.status === '草稿' ? '该版本尚未发布，可以继续补充；它不会影响正在被项目引用的发布版本。' : '当前没有并行草稿。需要调整时请创建新版本，避免线上项目被静默改写。'}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E5E6E8] bg-white p-5">
                <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#161823]/44" /><h2 className="text-[14px] font-semibold text-[#161823]">质量门槛与使用边界</h2></div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#E5E6E8] p-3.5">
                    <p className="text-[10px] font-semibold text-[#161823]/62">自动质量门槛</p>
                    <p className="mt-1.5 text-[9px] leading-4 text-[#161823]/42">{item.governance.qualityGate}</p>
                  </div>
                  <div className="rounded-xl border border-[#E5E6E8] p-3.5">
                    <p className="text-[10px] font-semibold text-[#161823]/62">授权范围</p>
                    <p className="mt-1.5 text-[9px] leading-4 text-[#161823]/42">{item.governance.rights}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 rounded-xl bg-[#FAFAFB] px-4 py-3">
                  {item.constraints.map((constraint) => <li key={constraint} className="flex gap-2 text-[9px] leading-4 text-[#161823]/44"><CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-600" />{constraint}</li>)}
                </ul>
              </section>
            </main>

            <aside className="sticky top-0 space-y-3">
              <section className="rounded-2xl border border-[#E5E6E8] bg-white p-4">
                <h2 className="text-[12px] font-semibold text-[#161823]">资产信息</h2>
                <dl className="mt-3 divide-y divide-[#F0F0F2] text-[9px]">
                  {[
                    ['负责人', item.owner],
                    ['资产类型', ASSET_CLASS_LABEL[item.assetClass]],
                    ['存储域', registryLabel],
                    ['最后更新', item.updatedAt],
                  ].map(([label, value]) => <div key={label} className="grid grid-cols-[70px_1fr] gap-2 py-2.5"><dt className="text-[#161823]/34">{label}</dt><dd className="text-right font-medium text-[#161823]/58">{value}</dd></div>)}
                </dl>
              </section>

              <section className="rounded-2xl border border-[#E5E6E8] bg-white p-4">
                <h2 className="text-[12px] font-semibold text-[#161823]">适用与导入</h2>
                <p className="mt-3 text-[9px] font-medium text-[#161823]/46">适用端</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{item.coverage.map((entry) => <span key={entry} className="rounded-md bg-[#F1F2F4] px-2 py-1 text-[8px] text-[#161823]/46">{entry}</span>)}</div>
                <p className="mt-4 text-[9px] font-medium text-[#161823]/46">允许导入</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{item.governance.importFormats.map((format) => <span key={format} className="rounded-md bg-blue-50 px-2 py-1 text-[8px] text-blue-700">{format}</span>)}</div>
                <button type="button" onClick={onCreateVersion} className="mt-4 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-[#E0E1E3] text-[10px] font-medium text-[#161823]/56 hover:bg-[#F7F7F8]"><Upload className="size-3.5" /> 导入内容到新版本</button>
              </section>

              <section className="rounded-2xl border border-[#E5E6E8] bg-white p-4">
                <h2 className="text-[12px] font-semibold text-[#161823]">来源与证据</h2>
                <dl className="mt-3 space-y-3 text-[9px] leading-4">
                  <div><dt className="text-[#161823]/34">沉淀来源</dt><dd className="mt-1 text-[#161823]/52">{item.governance.source}</dd></div>
                  <div><dt className="text-[#161823]/34">可信证据</dt><dd className="mt-1 text-[#161823]/52">{item.governance.evidence}</dd></div>
                </dl>
                <div className="mt-3 flex items-center gap-1.5 border-t border-[#F0F0F2] pt-3 text-[8px] text-emerald-700"><CheckCircle2 className="size-3" /> 来源记录已归档，可随版本追溯</div>
              </section>

              <section className="rounded-2xl border border-[#E5E6E8] bg-white p-4">
                <h2 className="text-[12px] font-semibold text-[#161823]">项目引用</h2>
                <p className="mt-2 text-[9px] leading-4 text-[#161823]/44">{item.usage}</p>
                <p className="mt-3 border-t border-[#F0F0F2] pt-3 text-[8px] leading-3 text-[#161823]/28">项目引用锁定具体版本；新版本发布后不会自动替换现有引用。</p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
