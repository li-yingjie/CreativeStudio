import { useState, type ReactNode } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Gamepad2,
  HandHeart,
  Layers3,
  Save,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

type ComponentId = 'ranking' | 'boost' | 'collection' | 'minigame'

const COMPONENTS = [
  { id: 'ranking' as const, name: '内容榜单', package: 'gameplay.content-ranking@1.0.0', mount: '主流程 · 参与节点', status: '必填', icon: BarChart3 },
  { id: 'boost' as const, name: '双动作助力', package: 'gameplay.dual-action-boost@1.0.0', mount: '内容榜单 · 作品行', status: '必填', icon: HandHeart },
  { id: 'collection' as const, name: '集卡', package: 'gameplay.collection@0.9.4', mount: '主流程 · 阶段任务', status: '可选', icon: Layers3 },
  { id: 'minigame' as const, name: '跃马攀峰', package: 'gameplay.climb-lite@0.8.0', mount: '主会场 · 玩法卡', status: '可选', icon: Gamepad2 },
]

function Section({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#E4E5E7] bg-white">
      <div className="border-b border-[#ECEDEF] px-4 py-3.5">
        <h3 className="text-[11px] font-semibold text-[#161823]/78">{title}</h3>
        <p className="mt-0.5 text-[9px] text-[#161823]/34">{summary}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4">{children}</div>
    </section>
  )
}

function Field({ label, note, wide = false, children }: { label: string; note?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={wide ? 'col-span-2 block' : 'block'}>
      <span className="text-[9px] font-medium text-[#161823]/52">{label}</span>
      {children}
      {note ? <span className="mt-1 block text-[8px] leading-3 text-[#161823]/30">{note}</span> : null}
    </label>
  )
}

const inputClass = 'mt-1.5 h-8 w-full rounded-lg border border-[#DFE1E5] bg-white px-2.5 text-[10px] text-[#161823]/68 outline-none focus:border-blue-400'

function RankingFields() {
  return (
    <>
      <Section title="内容池与分榜" summary="先确定榜上有什么，再配排名口径。">
        <Field label="业务对象"><select className={inputClass} defaultValue="content"><option value="content">作品内容</option><option value="creator">创作者</option></select></Field>
        <Field label="会场分组"><input className={inputClass} defaultValue="游戏 / 二次元" /></Field>
        <Field label="榜单类型"><input className={inputClass} defaultValue="热门榜、新锐榜" /></Field>
        <Field label="内容准入"><input className={inputClass} defaultValue="已过审 + 活动话题命中" /></Field>
      </Section>
      <Section title="排名口径" summary="所有榜单值均从同一结算快照读取。">
        <Field label="核心分"><input className={inputClass} defaultValue="有效助力数 × 1.0" /></Field>
        <Field label="热度补正"><input className={inputClass} defaultValue="播放 0.15 + 互动 0.35" /></Field>
        <Field label="新锐门槛"><input className={inputClass} defaultValue="发布 ≤ 72h · 粉丝 < 10万" /></Field>
        <Field label="同分处理"><select className={inputClass} defaultValue="early"><option value="early">先达成者优先</option><option value="engagement">互动率优先</option></select></Field>
        <Field label="刷新与冻结" wide><input className={inputClass} defaultValue="60 秒刷新 · 每日 23:59 阶段冻结" /></Field>
      </Section>
      <Section title="状态与降级" summary="不把空榜、延迟和封禁当成临时异常。">
        <Field label="榜单状态"><input className={inputClass} defaultValue="正常 / 空态 / 延迟 / 已冻结" /></Field>
        <Field label="封禁处理"><select className={inputClass} defaultValue="remove"><option value="remove">立即移出并顺位补齐</option><option value="hide">保留名次但隐藏</option></select></Field>
      </Section>
    </>
  )
}

function BoostFields() {
  return (
    <>
      <Section title="助力动作" summary="两个动作共用一个作品对象，但配额与权重独立。">
        <Field label="普通动作文案"><input className={inputClass} defaultValue="放你一马" /></Field>
        <Field label="普通动作分值"><input className={inputClass} type="number" defaultValue="1" /></Field>
        <Field label="高价值动作文案"><input className={inputClass} defaultValue="好活加马" /></Field>
        <Field label="高价值动作分值"><input className={inputClass} type="number" defaultValue="5" /></Field>
      </Section>
      <Section title="频控与反刷" summary="先限用户，再限作品，最后做风险行为拦截。">
        <Field label="每日总额"><input className={inputClass} defaultValue="20 次 / 用户" /></Field>
        <Field label="单作品额度"><input className={inputClass} defaultValue="3 次 / 用户 / 日" /></Field>
        <Field label="冷却时间"><input className={inputClass} defaultValue="2 秒" /></Field>
        <Field label="风险策略"><select className={inputClass} defaultValue="strict"><option value="strict">异常设备不计榜单分</option><option value="review">先记录后复核</option></select></Field>
      </Section>
      <Section title="榜单联动" summary="助力成功后回写发起榜单，不自建排名数据。">
        <Field label="目标榜单"><input className={inputClass} defaultValue="当前会场 · 当前分榜" /></Field>
        <Field label="回流后反馈"><input className={inputClass} defaultValue="动效 + 得分 + 当前名次" /></Field>
      </Section>
    </>
  )
}

function CollectionFields() {
  return (
    <>
      <Section title="卡池与稀有度" summary="卡牌对象、掉落权重和保底策略独立版本化。">
        <Field label="卡池"><input className={inputClass} defaultValue="2026 新春会·马年卡池 v3" /></Field>
        <Field label="卡牌数"><input className={inputClass} defaultValue="8 张·普通 5 / 稀有 2 / 隐藏 1" /></Field>
        <Field label="稀有卡权重"><input className={inputClass} defaultValue="12%" /></Field>
        <Field label="保底"><input className={inputClass} defaultValue="8 次未出稀有则必出" /></Field>
      </Section>
      <Section title="获取任务" summary="任务事件来自 ActivitySpec 的共享任务对象。">
        <Field label="每日登录"><input className={inputClass} defaultValue="1 次抽卡" /></Field>
        <Field label="完成助力"><input className={inputClass} defaultValue="每 3 次助力获得 1 次" /></Field>
        <Field label="浏览双会场"><input className={inputClass} defaultValue="首次完成额外 1 次" /></Field>
        <Field label="每日上限"><input className={inputClass} defaultValue="5 次" /></Field>
      </Section>
      <Section title="奖励与素材绑定" summary="奖励引用 IncentiveScheme；卡面引用项目素材，都不直接内联。">
        <Field label="集齐奖励"><input className={inputClass} defaultValue="新春会限定称号 + 流量券" /></Field>
        <Field label="卡面素材"><input className={inputClass} defaultValue="素材库 / 玩法视觉 / 集卡 v5" /></Field>
      </Section>
    </>
  )
}

function MinigameFields() {
  return (
    <>
      <Section title="对局参数" summary="小游戏形成自己的运行时契约，不改写活动主流程。">
        <Field label="单局时长"><input className={inputClass} defaultValue="45 秒" /></Field>
        <Field label="每日局数"><input className={inputClass} defaultValue="3 局 / 用户" /></Field>
        <Field label="难度曲线"><select className={inputClass} defaultValue="progress"><option value="progress">逐段加速 · 3 档</option><option value="fixed">固定难度</option></select></Field>
        <Field label="结束条件"><input className={inputClass} defaultValue="时间耗尽 / 连续 3 次失误" /></Field>
      </Section>
      <Section title="积分与回流" summary="小游戏结果只回写任务和个人状态，不直接改榜。">
        <Field label="计分规则"><input className={inputClass} defaultValue="里程 + 连击 × 20" /></Field>
        <Field label="任务达成"><input className={inputClass} defaultValue="单局 ≥ 800 分" /></Field>
        <Field label="回流位置"><input className={inputClass} defaultValue="Lynx 主会场 · 玩法卡" /></Field>
        <Field label="回写事件"><input className={inputClass} defaultValue="minigame.completed" /></Field>
      </Section>
      <Section title="入口与视觉状态" summary="入口图和主页状态引用活动资产，参数修改不覆盖已锁定视觉。">
        <Field label="入口规格"><input className={inputClass} defaultValue="166×166 · 跃马攀峰小卡" /></Field>
        <Field label="页面状态"><input className={inputClass} defaultValue="未开始 / 游戏中 / 结算 / 达成" /></Field>
      </Section>
    </>
  )
}

export default function AcgGameplayComponentsWorkspace() {
  const [activeId, setActiveId] = useState<ComponentId>('ranking')
  const active = COMPONENTS.find((item) => item.id === activeId) ?? COMPONENTS[0]
  const ActiveIcon = active.icon

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#F7F7F8]">
      <aside className="w-[190px] shrink-0 border-r border-[#E4E5E7] bg-white px-3 py-4">
        <div className="px-2">
          <p className="text-[10px] font-semibold text-[#161823]/72">玩法组件</p>
          <p className="mt-1 text-[8px] leading-3 text-[#161823]/30">4 个实例挂载在活动主流程上</p>
        </div>
        <div className="mt-3 space-y-1">
          {COMPONENTS.map((item) => {
            const Icon = item.icon
            const activeItem = item.id === activeId
            return (
              <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left ${activeItem ? 'bg-[#F0F1F3]' : 'hover:bg-[#F7F7F8]'}`}>
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${activeItem ? 'bg-white text-blue-600' : 'bg-[#F4F4F5] text-[#161823]/42'}`}><Icon className="size-3.5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-medium text-[#161823]/70">{item.name}</span><span className="mt-0.5 block truncate text-[8px] text-[#161823]/30">{item.status} · 已接入</span></span>
                <ChevronRight className="size-3 text-[#161823]/22" />
              </button>
            )
          })}
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-3">
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-blue-700"><Sparkles className="size-3" />边界说明</div>
          <p className="mt-1.5 text-[8px] leading-3.5 text-blue-900/50">活动的入口、分流、回流和结算顺序在项目文档中管理，不在此重复配置。</p>
        </div>
      </aside>

      <main className="thin-scroll min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="mx-auto max-w-[860px]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"><ActiveIcon className="size-4" /></span>
              <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-[16px] font-semibold text-[#161823]">{active.name}</h1><span className="rounded bg-emerald-50 px-1.5 py-1 text-[8px] font-medium text-emerald-600">已启用</span></div><p className="mt-1 text-[9px] text-[#161823]/34">{active.package} · {active.mount}</p></div>
            </div>
            <button type="button" onClick={() => toast.success(`${active.name}已保存`, { description: '参数已写回 ActivitySpec rev.19，将只重编译受影响交付物。' })} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[9px] font-medium text-white"><Save className="size-3.5" />保存参数</button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-2.5 text-[9px] text-emerald-800/64">
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
            <span>契约已通过：挂载点、事件回写、素材引用和结算口径均可解析。</span>
          </div>

          <div className="mt-4 space-y-3">
            {activeId === 'ranking' ? <RankingFields /> : null}
            {activeId === 'boost' ? <BoostFields /> : null}
            {activeId === 'collection' ? <CollectionFields /> : null}
            {activeId === 'minigame' ? <MinigameFields /> : null}
          </div>
        </div>
      </main>
    </div>
  )
}
