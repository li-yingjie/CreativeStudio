import { useState } from 'react'
import {
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Monitor,
} from '@/shared/icons'
import { ACG_ACTIVITY_DELIVERABLE_LABELS } from './ActivityDeliverablesData'

const ACG_FIGMA_URL = 'https://www.figma.com/design/dATx52XsiA0xtpE2xpAeBC/2026-%E6%8A%96%E9%9F%B3ACG%E6%96%B0%E6%98%A5%E4%BC%9A-%E5%88%9B%E6%84%8F?node-id=1690-13237'

type DeliverableStatus = '已生成' | '人工编辑' | '待确认'

type Deliverable = {
  label: (typeof ACG_ACTIVITY_DELIVERABLE_LABELS)[number]
  id: string
  type: 'Lynx' | 'H5' | '资源位' | '玩法视觉' | '宣发物料' | '战报'
  phase: '预热' | '主推' | '结算'
  status: DeliverableStatus
  designSpec: string
  deliverySpec: string
  route: string
  summary: string
  states: readonly string[]
  modules: readonly string[]
  editableFields: readonly { label: string; value: string }[]
  bindings: readonly { label: string; value: string }[]
  checks: readonly string[]
  preview: 'page' | 'venue' | 'banner' | 'gameplay' | 'schedule' | 'report'
}

const DELIVERABLES: readonly Deliverable[] = [
  {
    label: 'Lynx · 主会场',
    id: 'DLV-ACG-001',
    type: 'Lynx',
    phase: '主推',
    status: '人工编辑',
    designSpec: '设计稿 1688 × 4237',
    deliverySpec: 'Lynx 自适应页 · 原生状态栏与 DuxTitleBar',
    route: 'aweme://lynxview/?channel=acg-new-year&bundle=main',
    summary: '承载活动主身份、游戏/二次元双会场入口、阶段内容、嘉宾主理人与年度榜单导流。',
    states: ['默认态', '预热态', '主推态'],
    modules: ['原生标题栏', '活动 Hero', '双会场入口', '阶段场景', '嘉宾主理人', '年度榜单入口'],
    editableFields: [
      { label: '阶段口号', value: '开年 · 高燃' },
      { label: '游戏会场入口', value: '游戏年度榜单' },
      { label: '二次元会场入口', value: '二次元年度榜单' },
    ],
    bindings: [
      { label: '活动模板', value: '新春会模板 v1.1.0' },
      { label: 'Brand Kit', value: '抖音 ACG 新春会应用版 v1.1.0' },
      { label: 'Style Bible', value: '新春热力 · ACG v1.0.0' },
      { label: '页面类型', value: 'Lynx 活动页 / DuxTitleBar v3' },
      { label: '素材引用', value: '主视觉 1 · 会场场景 2 · 主理人头像 6' },
    ],
    checks: ['原生返回/分享区安全距离通过', '双会场入口均已绑定有效路由', '人工调整的 Hero 构图已锁定'],
    preview: 'page',
  },
  {
    label: 'H5 · 双分会场',
    id: 'DLV-ACG-002',
    type: 'H5',
    phase: '主推',
    status: '已生成',
    designSpec: '750 × 9776 · 1 套结构 / 5 个展示状态',
    deliverySpec: '2 个内容路由 · 长页按模块懒加载',
    route: '/acg-2026/venue/:channel?tab=:ranking',
    summary: '游戏与二次元分会场共用内容结构，通过路由、榜单口径与 Tab 状态形成独立内容体验。',
    states: ['游戏 · 热门', '游戏 · 新锐', '二次元 · 热门', '二次元 · 新锐', '我的助力'],
    modules: ['会场 Hero', '分类 Tab', '内容榜单', '助力操作', '权益任务', '活动规则', '页尾合规信息'],
    editableFields: [
      { label: '榜单刷新频率', value: '每 10 分钟' },
      { label: '首屏默认榜单', value: '热门作品' },
      { label: '单页内容上限', value: '50 条' },
    ],
    bindings: [
      { label: '玩法能力', value: '内容榜单 v2.4 + 双动作助力 v1.3' },
      { label: '内容源', value: '游戏池 / 二次元池 · 各自独立审核' },
      { label: 'Brand Kit', value: '抖音 ACG 新春会应用版 v1.1.0' },
      { label: '素材引用', value: '内容封面 20 · 榜单标 5 · 权益图 2' },
    ],
    checks: ['5 个状态均复用同一页面合同', '榜单为空/延迟/封禁降级态已配置', '超长页性能预算 1.8 MB 内'],
    preview: 'venue',
  },
  {
    label: '资源位 · 话题 Banner',
    id: 'DLV-ACG-003',
    type: '资源位',
    phase: '预热',
    status: '待确认',
    designSpec: '设计稿 780 × 220 · 当前画框 1029 × 195',
    deliverySpec: '待资源位 Owner 确认真实投放尺寸与安全区',
    route: 'douyin://topic-banner/acg-new-year',
    summary: '用于话题入口的窄幅活动识别物料；当前设计画板与画框尺寸不一致，发布前不可自动放行。',
    states: ['开年高燃', '万象风华'],
    modules: ['活动短标题', '利益点文案', 'IP 群像', '入口箭头', '安全区'],
    editableFields: [
      { label: '短标题', value: '万象风华' },
      { label: '活动标识', value: '抖音 ACG 新春会' },
      { label: '右侧主体数量', value: '4 个 IP 角色' },
    ],
    bindings: [
      { label: 'Brand Kit', value: '抖音 ACG 新春会 · 窄资源位锁定件' },
      { label: '资源位规格', value: '话题 Banner · 尺寸待确认' },
      { label: '分层模板', value: '标题 / IP 群像 / 底景 / Logo' },
      { label: '素材引用', value: '主标题 1 · IP 角色 4 · 底景 1' },
    ],
    checks: ['标题与活动标识识别度通过', 'IP 授权会场匹配通过', '真实交付尺寸尚未确认'],
    preview: 'banner',
  },
  {
    label: '玩法视觉 · 卡片与主页',
    id: 'DLV-ACG-004',
    type: '玩法视觉',
    phase: '主推',
    status: '已生成',
    designSpec: '小卡 166 × 166 · 集卡大卡/小卡/任务卡 · 主页多状态',
    deliverySpec: 'PNG/WebP + 分层 Manifest · 按玩法实例版本锁定',
    route: 'asset://acg-2026/gameplay-visuals',
    summary: '同一玩法的运行逻辑来自能力包，本交付物只负责它在本活动里的卡片、主页与结果态视觉实例。',
    states: ['跃马攀峰 · 小卡', '集卡 · 大卡', '集卡 · 小卡', '集卡 · 任务卡', '乌骓 · 主页'],
    modules: ['入口小卡', '卡池视觉', '任务卡', '玩法主页', '完成/未完成状态'],
    editableFields: [
      { label: '小卡 CTA', value: '去参加' },
      { label: '集卡利益点', value: '集福气 赢 388 元' },
      { label: '卡池主题', value: '跃马 / 祥云' },
    ],
    bindings: [
      { label: '玩法能力', value: '集卡 v2.1 · 跃马攀峰 v1.0' },
      { label: 'IP Kit', value: '乌骓 / 小马角色资产 v1.2' },
      { label: '分层模板', value: '玩法入口卡 v3 · 任务卡 v2' },
      { label: '素材引用', value: '角色 4 · 卡面 8 · 道具 6' },
    ],
    checks: ['视觉状态与运行状态 5/5 对齐', '透明边缘与小尺寸可读性通过', '玩法包版本已锁定'],
    preview: 'gameplay',
  },
  {
    label: '节目单 · 长图与横卡',
    id: 'DLV-ACG-005',
    type: '宣发物料',
    phase: '预热',
    status: '人工编辑',
    designSpec: '长图 1080 × 11493 · 双列横卡 · 主题版 2 套',
    deliverySpec: 'JPEG 90% + PNG 分享首屏 · 人工排版锁定',
    route: 'asset://acg-2026/program-guide',
    summary: '承载纵马山河、策马奔腾等节目章节与嘉宾内容，长图作为完整节目单，横卡用于站内分发。',
    states: ['纵马山河', '策马奔腾', '完整节目单', '双列横卡'],
    modules: ['节目章节', '播出时间', '嘉宾/IP', '节目摘要', '二维码/入口', '活动标识'],
    editableFields: [
      { label: '首发时间', value: '2026-01-09 20:00' },
      { label: '章节数量', value: '2 章' },
      { label: '节目条目', value: '18 条' },
    ],
    bindings: [
      { label: '内容表', value: '节目单 CSV · 18 条 / 已校对' },
      { label: 'Brand Kit', value: '抖音 ACG 新春会 · 节目单锁定件' },
      { label: '分层模板', value: '节目单长图 v1.1 · 双列卡 v1.0' },
      { label: '素材引用', value: '嘉宾图 18 · 节目封面 18 · 章节底图 2' },
    ],
    checks: ['节目名称与时间已人工校对', '长图切片边界不截断文字', '人工调整排版已锁定'],
    preview: 'schedule',
  },
  {
    label: '活动战报 · 结算长图',
    id: 'DLV-ACG-006',
    type: '战报',
    phase: '结算',
    status: '已生成',
    designSpec: '1080 × 26668 超长版 · 多个渠道短版',
    deliverySpec: '数据快照 + 模板槽位 + 人工排版确认',
    route: 'asset://acg-2026/final-report',
    summary: '汇总会场访问、内容热度、互动与代表性作品；数据章节自动生成，超长版允许人工编排后锁定。',
    states: ['完整战报', '数据摘要', '作品榜单', '传播短版'],
    modules: ['核心数据', '会场表现', '内容榜单', '嘉宾与作品', '互动数据', '传播回顾', '结尾品牌'],
    editableFields: [
      { label: '数据截止', value: '2026-01-24 23:59' },
      { label: '核心指标', value: 'UV / 播放 / 互动 / 投稿' },
      { label: '入选作品', value: '24 条' },
    ],
    bindings: [
      { label: '数据快照', value: 'report_snapshot_20260124 · 已冻结' },
      { label: 'Brand Kit', value: '抖音 ACG 新春会 · 战报锁定件' },
      { label: '分层模板', value: '活动战报长图 v2.3' },
      { label: '素材引用', value: '作品封面 24 · 数据图表 8 · 嘉宾图 12' },
    ],
    checks: ['所有数字均绑定冻结快照', '外部参考战报未进入编译引用', '长图章节可切片且无孤行'],
    preview: 'report',
  },
] as const

const STATUS_STYLE: Record<DeliverableStatus, string> = {
  已生成: 'bg-emerald-50 text-emerald-700',
  人工编辑: 'bg-blue-50 text-blue-700',
  待确认: 'bg-amber-50 text-amber-700',
}

const TYPE_ICON = {
  Lynx: Monitor,
  H5: LayoutTemplate,
  资源位: ImageIcon,
  玩法视觉: Layers,
  宣发物料: ImageIcon,
  战报: LayoutTemplate,
} as const

const INFINITE_CANVAS_STYLE = {
  backgroundColor: '#EEF0F3',
  backgroundImage: 'radial-gradient(circle, rgba(22, 24, 35, 0.11) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
}

function AcgMainVenuePreview({ state }: { state: string }) {
  return (
    <div className="relative flex min-h-[520px] items-start justify-center px-8 py-10 sm:px-10 sm:py-12" style={INFINITE_CANVAS_STYLE}>
      <div className="relative w-full max-w-[420px] overflow-hidden bg-[#FFF3DF] shadow-[0_28px_72px_rgba(31,35,41,0.16)]">
        <div className="relative overflow-hidden bg-[#E82E2B]">
          <img src="/assets/acg-new-year/exact-hero-base.png" alt="抖音 ACG 游戏新春会主视觉" className="block h-auto w-full" />
          <img src="/assets/acg-new-year/exact-status-bar.png" alt="" className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full" />
          <img src="/assets/acg-new-year/exact-title-bar.png" alt="" className="pointer-events-none absolute inset-x-0 top-[42px] h-auto w-full" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/35 bg-black/28 px-3 py-1 text-[8px] font-medium text-white backdrop-blur-sm">{state}</span>
        </div>
        <div className="relative overflow-hidden bg-[#FFF3DF] pb-8">
          <img src="/assets/acg-new-year/exact-hero-transition.svg" alt="" className="block h-auto w-full" />
          <img src="/assets/acg-new-year/exact-game-switcher.png" alt="游戏会场切换" className="relative mx-auto -mt-20 block w-[97%]" />
          <img src="/assets/acg-new-year/exact-main-video.png" alt="焦点内容视频" className="relative mx-auto mt-5 block w-[94%] rounded-2xl" />
        </div>
        <img src="/assets/acg-new-year/exact-lower-top.png" alt="开年高燃榜单上半部分" className="block h-auto w-full" />
        <img src="/assets/acg-new-year/exact-lower-bottom.png" alt="开年高燃榜单下半部分" className="block h-auto w-full" />
      </div>
    </div>
  )
}

function DeliverablePreview({ item, state }: { item: Deliverable; state: string }) {
  if (item.preview === 'page') return <AcgMainVenuePreview state={state} />

  if (item.preview === 'banner') {
    return (
      <div className="flex min-h-[520px] items-start justify-center px-8 py-12" style={INFINITE_CANVAS_STYLE}>
        <div className="relative aspect-[1029/195] w-full max-w-[1029px] overflow-hidden rounded-lg border border-white/70 bg-gradient-to-r from-[#EA5B35] via-[#F48354] to-[#FFD2B2] shadow-[0_14px_30px_rgba(31,35,41,0.14)]">
          <img src="/assets/acg-new-year/materials/01-activity-hero.png" alt="话题 Banner 视觉素材" className="absolute inset-y-0 right-0 h-full w-[62%] object-contain object-right opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E95A35] via-[#EE7245]/90 to-transparent" />
          <div className="absolute inset-y-0 left-[7%] flex flex-col justify-center text-white">
            <span className="text-[10px] font-medium">抖音 ACG 新春会</span>
            <strong className="mt-1 text-[24px] tracking-[-0.03em]">{state}</strong>
          </div>
        </div>
      </div>
    )
  }

  if (item.preview === 'gameplay') {
    return (
      <div className="flex min-h-[520px] items-start justify-center px-10 py-12" style={INFINITE_CANVAS_STYLE}>
        <div className="grid w-full max-w-[1029px] grid-cols-3 items-center gap-4">
          {[
            ['集福气 赢 388 元', '/assets/acg-new-year/materials/12-event-mascot-horse.png'],
            ['集祥马卡 分 3 亿', '/assets/acg-new-year/materials/12-event-mascot-horse.png'],
            ['跃马攀峰', '/assets/acg-new-year/materials/02-party-corgi.png'],
          ].map(([title, src], index) => (
            <div key={title} className={`relative aspect-square overflow-hidden rounded-2xl border bg-white p-3 shadow-sm ${index === 0 ? 'border-[#EA5B34]/40' : 'border-black/[0.06]'}`}>
              <p className="relative z-10 max-w-[94px] text-[11px] font-semibold leading-4 text-[#5B2A1D]">{title}</p>
              <img src={src} alt="" className="absolute bottom-[-8%] right-[-2%] h-[78%] object-contain" />
              <span className="absolute bottom-2 left-3 rounded-full bg-[#EE5D5D] px-2 py-1 text-[8px] text-white">去参加</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (item.preview === 'schedule' || item.preview === 'report') {
    const contentImages = item.preview === 'report'
      ? ['/assets/acg-new-year/exact-lower-top.png', '/assets/acg-new-year/exact-lower-bottom.png']
      : ['/assets/acg-new-year/materials/08-content-cover-party.png', '/assets/acg-new-year/materials/09-content-cover-action.png', '/assets/acg-new-year/materials/10-content-cover-sunset.png']
    return (
      <div className="flex min-h-[520px] items-start justify-center px-8 py-12" style={INFINITE_CANVAS_STYLE}>
        <div className="w-full max-w-[420px] overflow-hidden bg-[#FFF3DF] shadow-[0_18px_42px_rgba(70,45,27,0.14)]">
          <div className="relative bg-[#E95F3B]">
            <img src="/assets/acg-new-year/materials/01-activity-hero.png" alt="抖音 ACG 新春会主视觉" className="block h-auto w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#C83D25]/88 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-7 text-white"><p className="text-[11px] font-medium text-white/74">抖音 ACG 新春会</p><h3 className="mt-1 text-[26px] font-semibold">{state}</h3></div>
          </div>
          {contentImages.map((src) => <img key={src} src={src} alt="ACG Figma 交付内容" className="block h-auto w-full object-contain" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[520px] items-start justify-center px-8 py-12" style={INFINITE_CANVAS_STYLE}>
      <div className="relative w-full max-w-[420px] overflow-hidden bg-[#FFF1D9] shadow-[0_18px_38px_rgba(31,35,41,0.16)]">
        <img src="/assets/acg-new-year/exact-hero-base.png" alt="活动页面预览" className="block h-auto w-full" />
        <img src="/assets/acg-new-year/exact-game-switcher.png" alt="双会场切换" className="block h-auto w-full" />
        <img src="/assets/acg-new-year/exact-lower-top.png" alt="榜单与助力模块" className="block h-auto w-full" />
        <img src="/assets/acg-new-year/exact-lower-bottom.png" alt="榜单与助力模块下半部分" className="block h-auto w-full" />
      </div>
    </div>
  )
}

function Overview({ onOpen }: { onOpen?: (label: string) => void }) {
  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-[#F7F7F8] px-7 py-6">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2"><span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700">6 项交付物</span><span className="text-[10px] text-[#161823]/34">活动配置 rev.18</span></div>
            <h1 className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-[#161823]">2026 抖音 ACG 新春会 · 交付物</h1>
            <p className="mt-1.5 text-[11px] text-[#161823]/44">这里仅展示需要验收和发布的页面与物料；脑暴、方向稿和外部参考留在项目文档与素材库。</p>
          </div>
          <a href={ACG_FIGMA_URL} target="_blank" rel="noreferrer" className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#DFE0E3] bg-white px-3 text-[9px] font-medium text-[#161823]/58 hover:border-[#C9CBCF] hover:text-[#161823]">查看源文件<ExternalLink className="size-3" /></a>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            ['活动模板', '新春会模板 v1.1.0'],
            ['主 Brand Kit', '抖音 ACG 新春会应用版 v1.1.0'],
            ['主流程内核', '双会场分流 · 榜单参与'],
            ['交付进度', '5 已就绪 · 1 待确认'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#E5E6E8] bg-white px-3.5 py-3"><p className="text-[9px] text-[#161823]/34">{label}</p><p className="mt-1.5 truncate text-[11px] font-semibold text-[#161823]/68">{value}</p></div>
          ))}
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#E4E5E7] bg-white">
          <div className="flex items-end justify-between border-b border-[#ECEDEF] px-5 py-4"><div><h2 className="text-[14px] font-semibold text-[#161823]">交付清单</h2><p className="mt-1 text-[9px] text-[#161823]/34">页面数、状态数与渠道变体分别核算，避免把设计稿数量当成研发页面数。</p></div><span className="text-[9px] text-[#161823]/34">按阶段与类型整理</span></div>
          <div className="grid grid-cols-[minmax(210px,1.25fr)_100px_120px_100px_90px_24px] gap-3 bg-[#FAFAFB] px-5 py-2 text-[9px] text-[#161823]/32"><span>交付物</span><span>阶段</span><span>设计规格</span><span>状态</span><span>完成度</span><span /></div>
          {DELIVERABLES.map((item) => {
            const Icon = TYPE_ICON[item.type]
            return (
              <button key={item.id} type="button" onClick={() => onOpen?.(item.label)} className="grid w-full grid-cols-[minmax(210px,1.25fr)_100px_120px_100px_90px_24px] items-center gap-3 border-t border-[#F0F0F2] px-5 py-3 text-left hover:bg-[#FAFAFB]">
                <div className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F2F3F5] text-[#161823]/54"><Icon className="size-4" /></span><div className="min-w-0"><p className="truncate text-[11px] font-medium text-[#161823]/72">{item.label}</p><p className="mt-0.5 truncate text-[9px] text-[#161823]/32">{item.id} · {item.type}</p></div></div>
                <span className="text-[10px] text-[#161823]/48">{item.phase}</span>
                <span className="truncate text-[9px] text-[#161823]/42" title={item.designSpec}>{item.designSpec.split(' · ')[0]}</span>
                <span className="text-[9px] text-[#161823]/46">{item.states.length} 个</span>
                <span className={`w-fit rounded px-1.5 py-1 text-[8px] font-medium ${STATUS_STYLE[item.status]}`}>{item.status}</span>
                <ChevronRight className="size-3.5 text-[#161823]/20" />
              </button>
            )
          })}
        </section>

      </div>
    </div>
  )
}

function DeliverableDetail({ item }: { item: Deliverable }) {
  const [state, setState] = useState(item.states[0])
  const Icon = TYPE_ICON[item.type]

  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-[#F7F7F8]">
      <div className="mx-auto flex min-h-12 max-w-[1120px] flex-wrap items-center justify-between gap-3 px-7 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Icon className="mr-1 size-3.5 text-[#161823]/36" />
          {item.states.map((option) => <button key={option} type="button" onClick={() => setState(option)} className={`rounded-lg border px-2.5 py-1.5 text-[9px] ${option === state ? 'border-[#161823]/24 bg-[#161823] text-white' : 'border-[#E4E5E7] bg-white text-[#161823]/46 hover:bg-[#F7F7F8]'}`}>{option}</button>)}
          <span className="ml-2 text-[8px] text-[#161823]/28">{item.id} · {item.designSpec}</span>
          {item.modules.map((module) => <span key={module} className="rounded-md bg-[#EDEEF0] px-2 py-1 text-[8px] font-medium text-[#161823]/54">{module}</span>)}
        </div>
        <a href={ACG_FIGMA_URL} target="_blank" rel="noreferrer" className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#DFE0E3] bg-white px-3 text-[9px] font-medium text-[#161823]/58 hover:border-[#C9CBCF] hover:text-[#161823]">查看 Figma<ExternalLink className="size-3" /></a>
      </div>
      <DeliverablePreview item={item} state={state} />
    </div>
  )
}

export default function ActivityDeliverablesWorkspace({ activeLabel, onOpen }: { activeLabel: string; onOpen?: (label: string) => void }) {
  const item = DELIVERABLES.find((candidate) => candidate.label === activeLabel)
  if (!item) return <Overview onOpen={onOpen} />
  return <DeliverableDetail key={item.id} item={item} />
}
