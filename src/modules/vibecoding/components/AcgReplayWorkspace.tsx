import {
  Check,
  FileText,
  Image as ImageIcon,
  Layers,
  Palette,
  Sparkles,
} from '@/shared/icons'
import type { AcgReplayTarget } from './AcgGenerationReplayScript'

const SOURCE_STEPS = [
  {
    id: 'plan',
    name: '2026 抖音 ACG 新春会 · 活动策划.docx',
    detail: '活动目标、组织方式、玩法诉求、交付范围与设计参考链接',
    icon: FileText,
  },
] as const

function SectionTitle({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string
  title: string
  detail?: string
}) {
  return (
    <div>
      <div className="text-[8px] font-semibold tracking-[0.08em] text-[#357EF8] uppercase">
        {eyebrow}
      </div>
      <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#161823]">
        {title}
      </h2>
      {detail ? (
        <p className="mt-1 max-w-[760px] text-[10px] leading-[17px] text-[#161823]/44">
          {detail}
        </p>
      ) : null}
    </div>
  )
}

function SourceUnderstanding({ stepId }: { stepId: string }) {
  const sourceLoaded = stepId !== 'acg-request'
  const scanningEvidence = stepId === 'acg-evidence-scan'
  const briefReady = [
    'acg-brief-ready',
    'acg-brief-gaps-request',
    'acg-brief-gaps',
    'acg-brief-confirmed',
  ].includes(stepId)
  const pendingQuestions = [
    {
      title: '奖励与库存',
      question: '奖品类型、数量、发放方式与缺货兜底',
      handling: '当前按“无奖励”生成，补齐后再开启履约',
      options: ['保持无奖励', '虚拟奖励', '实物奖励'],
    },
    {
      title: '助力上限与反刷',
      question: '单用户、单作品日上限，以及账号 / 设备风控口径',
      handling: '只建立可配置槽位，不预填次数',
      options: ['采用平台建议', '沿用业务口径', '自定义规则'],
    },
    {
      title: '榜单冻结与异常处理',
      question: '冻结时点、同分规则、异常内容剔除与降级策略',
      handling: '榜单可试玩，正式结算保持禁用',
      options: ['提交口径表', '采用标准规则', '稍后配置'],
    },
    {
      title: '结算战报数据',
      question: '曝光、投稿、互动、回流指标及对应数据源',
      handling: '先生成视觉结构，不填写演示数字',
      options: ['接入埋点口径', '上传数据表', '仅生成模板'],
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1180px] px-6 py-7">
      <SectionTitle
        eyebrow={briefReady ? 'Activity brief · rev.1' : 'Source bundle'}
        title={briefReady ? '先确认我对活动的理解' : '正在读取原始策划材料'}
        detail={
          briefReady
            ? '这些结论决定后续推荐什么活动模板、生成多少交付物。未在材料中出现的奖励和业务数据保持待确认。'
            : 'Agent 先建立来源清单并区分事实、推断与缺失项；不会在读完前直接套模板。'
        }
      />

      <div className="mt-5 max-w-[720px]">
        {SOURCE_STEPS.map((source) => {
          const loaded = sourceLoaded
          const Icon = source.icon
          return (
            <div
              key={source.id}
              className={`rounded-xl border p-3.5 ${
                loaded
                  ? 'border-black/[0.08] bg-white'
                  : 'border-dashed border-black/[0.08] bg-white/45'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                    loaded
                      ? 'bg-[#EEF4FF] text-[#357EF8]'
                      : 'bg-black/[0.035] text-[#161823]/22'
                  }`}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[9px] font-semibold text-[#161823]/78">
                    {source.name}
                  </span>
                  <span className="mt-1 block text-[8px] leading-[13px] text-[#161823]/36">
                    {loaded ? source.detail : '等待读取'}
                  </span>
                </span>
                {loaded ? <Check className="size-3.5 shrink-0 text-emerald-500" /> : null}
              </div>
            </div>
          )
        })}
      </div>

      {briefReady ? (
        <div className="mt-4 grid items-start gap-4 min-[1500px]:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-xl border border-black/[0.08] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[12px] font-semibold text-[#161823]">Agent 归类结果 · 待你确认</h3>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-[8px] font-medium text-blue-700">
                依据策划文档与引用证据整理
              </span>
            </div>
            <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-black/[0.06] bg-black/[0.06] sm:grid-cols-2">
              {[
                ['活动目的', '用春节节点聚合游戏与二次元内容，形成站内参与和传播回流。'],
                ['组织形式', 'Figma 中存在游戏、二次元两条内容路由；Agent 建议组织成双分会场。'],
                ['核心参与', '浏览内容、切换榜单、为作品助力并分享回流。'],
                ['交付范围', '2 个互动页面 + 16 个资源位、玩法视觉和传播物料。'],
              ].map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-4">
                  <div className="text-[9px] font-medium text-[#161823]/38">{label}</div>
                  <p className="mt-1.5 text-[10px] leading-[17px] text-[#161823]/70">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-xl border border-[#F0C06C] bg-[#FFF9EF] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[12px] font-semibold text-[#5B3B0A]">待业务确认</h3>
                <p className="mt-1 text-[8px] text-[#5B3B0A]/48">这些不能由 Agent 代替业务决定</p>
              </div>
              <span className="rounded-md bg-[#F9E8C8] px-2 py-1 text-[8px] font-medium text-[#8A5A13]">4 项</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {pendingQuestions.map((item, index) => (
                <div key={item.title} className="rounded-lg border border-[#E9C47D]/45 bg-white/65 px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#8A5A13] text-[7px] font-semibold text-white">{index + 1}</span>
                    <h4 className="text-[9px] font-semibold text-[#5B3B0A]">{item.title}</h4>
                  </div>
                  <p className="mt-2 text-[8px] leading-[13px] text-[#5B3B0A]/66">{item.question}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {item.options.map((option, optionIndex) => (
                      <span
                        key={option}
                        className={`rounded-md border px-2 py-1 text-[7px] font-medium ${
                          optionIndex === 0
                            ? 'border-[#DDA84F]/45 bg-[#FFF3D9] text-[#795016]'
                            : 'border-[#E6D5B4]/70 bg-white text-[#5B3B0A]/55'
                        }`}
                      >
                        {option}{optionIndex === 0 ? ' · 建议' : ''}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-[#DDA84F]/18 pt-2">
                    <span className="text-[7px] font-medium text-[#8A5A13]/55">当前处理</span>
                    <p className="mt-0.5 text-[8px] leading-[13px] text-[#5B3B0A]/78">{item.handling}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#DDA84F]/20 pt-4 text-[8px]">
              <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-emerald-700"><span className="block font-semibold">可继续生成</span><span className="mt-1 block opacity-65">会场骨架与无奖励交付</span></div>
              <div className="rounded-lg bg-amber-100/70 px-3 py-2.5 text-[#8A5A13]"><span className="block font-semibold">暂不可发布</span><span className="mt-1 block opacity-65">4 项全部补齐后放行</span></div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-black/[0.09] bg-white/52 px-5 py-8 text-center">
          <div className="text-[10px] font-medium text-[#161823]/56">
            {scanningEvidence
              ? '已读取策划文档，正在沿文档中的参考链接核验设计证据…'
              : sourceLoaded
                ? '已读取活动策划文档'
                : '等待读取活动策划文档'}
          </div>
          <div className="mx-auto mt-3 h-1.5 max-w-[360px] overflow-hidden rounded-full bg-black/[0.05]">
            <div
              className="h-full rounded-full bg-[#357EF8] transition-[width] duration-500"
              style={{ width: sourceLoaded ? (scanningEvidence ? '88%' : '100%') : '0%' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ActivityStrategy({ stepId, pathIds }: { stepId: string; pathIds: string[] }) {
  const noTemplate = pathIds.includes('acg-no-template-applied')
  const decided = stepId.includes('applied')
  return (
    <div className="mx-auto w-full max-w-[1180px] px-6 py-7">
      <SectionTitle
        eyebrow="Activity organization"
        title={decided ? '活动组织方式已确定' : '选择活动如何被组织'}
        detail="活动模板只提供组织形式、玩法骨架、规模基线与交付结构，不包含具体品牌、IP 或视觉成片。"
      />
      <div className="mt-5 grid gap-4 min-[1500px]:grid-cols-[minmax(0,1fr)_320px]">
        <section
          className={`overflow-hidden rounded-xl border bg-white ${
            noTemplate ? 'border-black/[0.08]' : 'border-[#9CBFFF]'
          }`}
        >
          <div className="grid min-h-[150px] md:grid-cols-[190px_minmax(0,1fr)]">
            <img
              src="/assets/figma-deliverables/acg/discovery-banner-1372x512.png"
              alt="抖音 ACG 新春会真实资源位"
              className={`h-full min-h-[150px] w-full object-cover ${noTemplate ? 'grayscale opacity-45' : ''}`}
            />
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-[#161823]">新春会模板</span>
                <span className="rounded bg-[#EEF4FF] px-1.5 py-0.5 text-[8px] font-medium text-[#357EF8]">Agent 推荐</span>
                {!noTemplate && decided ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-medium text-emerald-700">已采用</span> : null}
              </div>
              <p className="mt-2 text-[9px] leading-[15px] text-[#161823]/54">
                适合春节、周年庆等节点型内容盛典：用一个总主题聚合内容，以多个分会场承接品类或合作方，通过榜单、助力和阶段运营持续拉回用户。
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] sm:grid-cols-4">
                {[
                  ['组织', '1 主 + 1–5 分会场'],
                  ['玩法', '榜单 / 助力 / 分享'],
                  ['规模', '4 阶段'],
                  ['交付', '12–30 项'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-[#F6F7F8] px-2.5 py-2">
                    <div className="text-[#161823]/30">{label}</div>
                    <div className="mt-1 font-medium text-[#161823]/70">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className={`rounded-xl border p-4 ${noTemplate ? 'border-[#9CBFFF] bg-[#F7FAFF]' : 'border-black/[0.08] bg-white'}`}>
          <div className="flex items-center gap-2">
            <Layers className="size-3.5 text-[#161823]/42" />
            <h3 className="text-[11px] font-semibold text-[#161823]">无模板创建</h3>
            {noTemplate ? <span className="rounded bg-[#E8F1FF] px-1.5 py-0.5 text-[8px] font-medium text-[#357EF8]">已选择</span> : null}
          </div>
          <p className="mt-2 text-[9px] leading-[15px] text-[#161823]/48">
            从空白 ActivitySpec 开始，不继承会场数量、玩法组合或交付矩阵。适合首次出现的新活动形态。
          </p>
          <div className="mt-3 border-t border-black/[0.06] pt-3 text-[8px] leading-[14px] text-[#161823]/40">
            代价：需要额外确认组织规模、参与闭环和交付范围，不能隐式套用推荐模板。
          </div>
        </aside>
      </div>

      <div className="mt-4 rounded-xl border border-black/[0.08] bg-white p-4">
        <h3 className="text-[10px] font-semibold text-[#161823]">本项目可调整项</h3>
        <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-black/[0.06] bg-black/[0.06] sm:grid-cols-3">
          {[
            ['会场结构', '保留游戏、二次元两个分会场；后续可增减内容路由。'],
            ['玩法组合', '榜单与双动作助力为主；集卡、跃马攀峰作为可选组件。'],
            ['交付范围', '采用 Figma 已核验的 18 项，不把页面状态误算为独立交付。'],
          ].map(([label, value]) => (
            <div key={label} className="bg-white px-3.5 py-3">
              <div className="text-[8px] font-medium text-[#161823]/34">{label}</div>
              <p className="mt-1 text-[9px] leading-[15px] text-[#161823]/68">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AssetBinding({ pathIds }: { pathIds: string[] }) {
  const noTemplate = pathIds.includes('acg-no-template-applied')
  const noBrand = pathIds.includes('acg-creative-no-brand-applied')
  const brandDecided = pathIds.includes('acg-creative-applied') || noBrand
  const extensionsProposed = brandDecided || pathIds.includes('acg-bind-assets')
  const rows = [
    {
      icon: Layers,
      title: noTemplate ? '项目专属 ActivitySpec' : '新春会模板 @1.1.0',
      role: '活动组织',
      detail: noTemplate ? '不继承公共模板，由当前策划材料生成组织结构' : '主/分会场关系、阶段、玩法槽位和交付规模',
      status: noTemplate ? '无模板' : '已绑定',
    },
    {
      icon: Palette,
      title: noBrand ? '项目级品牌槽位' : '抖音 ACG Brand Kit @1.1.0',
      role: '品牌身份',
      detail: noBrand ? 'Logo、字体授权和联名规则待发布前补齐' : 'Logo、安全区、标题层级和平台联名顺序',
      status: noBrand ? '待补齐' : brandDecided ? '已绑定' : '待选择',
    },
    {
      icon: Sparkles,
      title: '新春热力 Style Bible @1.0.0',
      role: '视觉语法',
      detail: '天空纵深、轨道动势、橙红信息面与跨画幅重排',
      status: extensionsProposed ? '已绑定' : '待确认',
    },
    {
      icon: ImageIcon,
      title: '马年吉祥物与授权素材包 @1.0.0',
      role: '项目素材',
      detail: '12 个真实 PNG，仅限当前项目与授权会场',
      status: extensionsProposed ? '项目限定' : '待确认',
    },
  ].filter((_, index) => index < 2 || extensionsProposed)
  return (
    <div className="mx-auto w-full max-w-[1180px] px-6 py-7">
      <SectionTitle
        eyebrow="Asset binding"
        title={extensionsProposed ? '项目资产绑定清单' : '先确定品牌身份'}
        detail={extensionsProposed ? '组织、品牌、视觉语法和项目素材分别版本化；任何一层为空都会显式记录。' : '活动组织已经确定。Brand Kit 只控制 Logo、字体、标题层级和联名规则，不改变玩法与规模。'}
      />
      <div className="mt-5 grid gap-4 min-[1500px]:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-xl border border-black/[0.08] bg-white">
          {rows.map((row, index) => {
            const Icon = row.icon
            const pending = row.status.startsWith('待')
            return (
              <div key={row.role} className={`grid grid-cols-[34px_92px_minmax(0,1fr)_56px] items-center gap-3 px-4 py-3.5 ${index ? 'border-t border-black/[0.06]' : ''}`}>
                <span className="grid size-8 place-items-center rounded-lg bg-[#F3F4F6] text-[#161823]/44"><Icon className="size-3.5" /></span>
                <div>
                  <div className="text-[8px] font-medium text-[#161823]/34">{row.role}</div>
                  <div className="mt-1 text-[8px] text-[#161823]/52">独立版本槽位</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[10px] font-semibold text-[#161823]/78">{row.title}</div>
                  <div className="mt-1 truncate text-[8px] text-[#161823]/38">{row.detail}</div>
                </div>
                <span className={`justify-self-end rounded-md px-1.5 py-1 text-[7px] font-medium ${pending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{row.status}</span>
              </div>
            )
          })}
        </section>
        <aside className="overflow-hidden rounded-xl border border-black/[0.08] bg-white">
          <img src="/assets/figma-deliverables/acg/topic-header-banner.png" alt="ACG 新春会品牌视觉" className="aspect-[4/1.55] w-full object-cover" />
          <div className="p-4">
            <h3 className="text-[10px] font-semibold text-[#161823]">职责边界</h3>
            <ul className="mt-2.5 space-y-2 text-[8px] leading-[13px] text-[#161823]/46">
              <li>模板不携带 ACG 品牌或具体 IP。</li>
              <li>Brand Kit 不改变会场数量和玩法。</li>
              <li>Style Bible 不覆盖 Logo 与标题层级。</li>
              <li>项目 IP 素材不自动进入平台资产库。</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ActivityBlueprint() {
  const revision = 'rev.12'
  return (
    <div className="mx-auto w-full max-w-[1180px] px-6 py-7">
      <SectionTitle
        eyebrow={`ActivitySpec · ${revision}`}
        title="活动骨架与交付范围"
        detail="先确认活动如何运作，再生成代表性会场；视觉成稿不会替代业务结构确认。"
      />
      <div className="mt-5 rounded-xl border border-black/[0.08] bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[11px] font-semibold text-[#161823]">四阶段运营结构</h3>
          <span className="text-[8px] text-[#161823]/32">2026-01-09 — 2026-02-28</span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {[
            ['预热', '资源位曝光、内容征集与会场预约'],
            ['开启', '主主题上线，游戏/二次元双会场分流'],
            ['主推', '热门/新锐榜单与双动作助力持续参与'],
            ['结算', '榜单冻结、战报与传播素材回收'],
          ].map(([title, detail], index) => (
            <div key={title} className="relative rounded-lg bg-[#F6F7F8] px-3 py-3">
              <div className="flex items-center gap-2"><span className="grid size-4 place-items-center rounded-full bg-[#161823] text-[7px] font-semibold text-white">{index + 1}</span><span className="text-[9px] font-semibold text-[#161823]/76">{title}</span></div>
              <p className="mt-2 text-[8px] leading-[13px] text-[#161823]/42">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 min-[1500px]:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-black/[0.08] bg-white p-4">
          <h3 className="text-[11px] font-semibold text-[#161823]">核心参与闭环</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[8px] font-medium text-[#161823]/64">
            {['资源位触达', '主会场理解', '双会场分流', '榜单与助力', '分享回流', '结算传播'].map((item, index) => (
              <span key={item} className="flex items-center gap-2"><span className="rounded-md border border-black/[0.08] bg-white px-2.5 py-2">{item}</span>{index < 5 ? <span className="text-[#161823]/18">›</span> : null}</span>
            ))}
          </div>
          <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-black/[0.06] bg-black/[0.06] sm:grid-cols-3">
            {[
              ['页面', '2 个', '游戏 / 二次元可交互 H5'],
              ['资源与玩法视觉', '11 项', '10 个资源位 + 1 组玩法视觉'],
              ['传播与结算', '5 项', '4 组传播物料 + 1 张战报'],
            ].map(([label, count, detail]) => (
              <div key={label} className="bg-white px-3.5 py-3"><div className="text-[8px] text-[#161823]/32">{label}</div><div className="mt-1 text-[14px] font-semibold text-[#161823]">{count}</div><div className="mt-1 text-[8px] text-[#161823]/38">{detail}</div></div>
            ))}
          </div>
        </section>
        <aside className="rounded-xl border border-[#F3C684] bg-[#FFF9EF] p-4">
          <h3 className="text-[11px] font-semibold text-[#5B3B0A]">发布前置条件</h3>
          <div className="mt-3 space-y-2.5 text-[8px] leading-[13px] text-[#5B3B0A]/68">
            <div className="flex justify-between gap-3"><span>奖励与库存</span><span className="font-medium">待业务确认</span></div>
            <div className="flex justify-between gap-3"><span>透明 Logo / 标题字源文件</span><span className="font-medium">待素材确认</span></div>
            <div className="flex justify-between gap-3"><span>结算战报数据</span><span className="font-medium">待数据接入</span></div>
          </div>
          <p className="mt-3 border-t border-[#DDA84F]/20 pt-3 text-[8px] leading-[13px] text-[#5B3B0A]/48">不会阻塞第一批代表性会场生成，但最终发布检查不会放行。</p>
        </aside>
      </div>
    </div>
  )
}

export default function AcgReplayWorkspace({
  target,
  stepId,
  pathIds,
}: {
  target: AcgReplayTarget
  stepId: string
  pathIds: string[]
}) {
  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-white">
        {target === 'source-understanding' ? <SourceUnderstanding stepId={stepId} /> : null}
        {target === 'activity-strategy' ? <ActivityStrategy stepId={stepId} pathIds={pathIds} /> : null}
        {target === 'asset-binding' ? <AssetBinding pathIds={pathIds} /> : null}
        {target === 'activity-blueprint' ? <ActivityBlueprint /> : null}
    </div>
  )
}
