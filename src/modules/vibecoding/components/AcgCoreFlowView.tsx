import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Layers3,
  Route,
} from 'lucide-react'

const FLOW_STEPS = [
  {
    order: '01',
    role: '触达',
    title: '进入活动',
    action: '话题 Banner、站内资源位或分享链接将用户带入 Lynx 主会场。',
    outcome: '统一归因入口与活动阶段',
  },
  {
    order: '02',
    role: '理解',
    title: '认知主题与当前阶段',
    action: '通过 Hero、阶段口号、嘉宾主理人与规则摘要说清活动当前在做什么。',
    outcome: '建立新春会参与预期',
  },
  {
    order: '03',
    role: '分流',
    title: '选择内容会场',
    action: '用户根据兴趣进入“游戏”或“二次元” H5 分会场，保留跨会场切换。',
    outcome: '确定内容池与榜单口径',
  },
  {
    order: '04',
    role: '参与',
    title: '浏览榜单并产生行为',
    action: '浏览热门/新锐内容，通过助力、集卡或轻量小游戏完成阶段任务。',
    outcome: '产生榜单、任务与个人状态事件',
  },
  {
    order: '05',
    role: '回流',
    title: '返回榜单或主会场',
    action: '组件完成后回到发起节点，即时刷新作品助力、卡牌收集和任务进度。',
    outcome: '继续参与或跨会场浏览',
  },
  {
    order: '06',
    role: '结算',
    title: '阶段冻结与传播',
    action: '按阶段截止时间冻结榜单与内容快照，驱动节目单、宣发图和活动战报。',
    outcome: '形成可复核的结算批次',
  },
] as const

const COMPONENT_SLOTS = [
  { name: '内容榜单', bind: '参与节点', state: '必填 · 已启用' },
  { name: '双动作助力', bind: '榜单内容行', state: '必填 · 已启用' },
  { name: '集卡', bind: '阶段任务入口', state: '可选 · 已接入' },
  { name: '跃马攀峰', bind: '主会场玩法卡', state: '可选 · 已接入' },
] as const

export default function AcgCoreFlowView({
  onOpenGameplay,
}: {
  onOpenGameplay?: () => void
}) {
  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-[#F7F7F8] px-7 py-6">
      <div className="mx-auto max-w-[1040px]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[9px] text-[#161823]/38">
              <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">活动配置 rev.13</span>
              <span>来自新春会模板 v1.1.0</span>
            </div>
            <h1 className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-[#161823]">活动主流程内核</h1>
            <p className="mt-1.5 max-w-[680px] text-[11px] leading-5 text-[#161823]/46">
              这里说明整场活动怎么运作；榜单、助力、集卡和小游戏只是挂载在流程节点上的可执行组件。
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenGameplay}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#E1E2E5] bg-white px-3 text-[10px] font-medium text-[#161823]/68 hover:bg-[#F7F7F8]"
          >
            <Layers3 className="size-3.5" />
            打开玩法组件配置
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            ['参与模型', '双会场内容分流'],
            ['主行为', '榜单浏览 · 助力'],
            ['回流点', '发起榜单 / 主会场'],
            ['完成条件', '阶段快照冻结'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#E5E6E8] bg-white px-3.5 py-3">
              <p className="text-[9px] text-[#161823]/34">{label}</p>
              <p className="mt-1.5 truncate text-[11px] font-semibold text-[#161823]/68">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)] gap-4">
          <section className="overflow-hidden rounded-2xl border border-[#E4E5E7] bg-white">
            <div className="flex items-center gap-2 border-b border-[#ECEDEF] px-5 py-4">
              <Route className="size-4 text-[#161823]/46" />
              <div>
                <h2 className="text-[13px] font-semibold text-[#161823]">生效中的参与顺序</h2>
                <p className="mt-0.5 text-[9px] text-[#161823]/34">顺序由模板声明，项目可显式覆写入口、分支和回流点。</p>
              </div>
            </div>
            <div>
              {FLOW_STEPS.map((step, index) => (
                <div key={step.order} className={`grid grid-cols-[34px_minmax(0,1fr)] gap-3 px-5 py-3.5 ${index > 0 ? 'border-t border-[#F0F0F2]' : ''}`}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#F2F3F5] text-[9px] font-semibold text-[#161823]/46">{step.order}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-medium text-blue-600">{step.role}</span>
                      <h3 className="text-[11px] font-semibold text-[#161823]/76">{step.title}</h3>
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-[#161823]/48">{step.action}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] text-[#161823]/32">
                      <ArrowRight className="size-3" />
                      <span>{step.outcome}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <section className="overflow-hidden rounded-2xl border border-[#E4E5E7] bg-white">
              <div className="flex items-center gap-2 border-b border-[#ECEDEF] px-4 py-3.5">
                <GitBranch className="size-4 text-[#161823]/46" />
                <div>
                  <h2 className="text-[12px] font-semibold text-[#161823]">组件挂载点</h2>
                  <p className="mt-0.5 text-[9px] text-[#161823]/34">这里看关系，具体参数在玩法配置中编辑。</p>
                </div>
              </div>
              {COMPONENT_SLOTS.map((item, index) => (
                <div key={item.name} className={`px-4 py-3 ${index > 0 ? 'border-t border-[#F0F0F2]' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-medium text-[#161823]/72">{item.name}</span>
                    <span className="shrink-0 text-[8px] text-emerald-600">{item.state}</span>
                  </div>
                  <p className="mt-1 text-[9px] text-[#161823]/36">挂载于 {item.bind}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-[#E4E5E7] bg-white px-4 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <h2 className="text-[12px] font-semibold text-[#161823]">主流程合同</h2>
              </div>
              <dl className="mt-3 space-y-2.5 text-[9px]">
                <div className="flex justify-between gap-4"><dt className="text-[#161823]/34">分支互斥</dt><dd className="text-right text-[#161823]/58">同一榜单口径仅属于一个会场</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#161823]/34">事件回写</dt><dd className="text-right text-[#161823]/58">榜单 / 任务 / 个人状态</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#161823]/34">结算来源</dt><dd className="text-right text-[#161823]/58">已冻结的阶段数据快照</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#161823]/34">变更影响</dt><dd className="text-right text-[#161823]/58">重编译受影响页面与埋点</dd></div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
