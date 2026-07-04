import { useState } from 'react'
import { toast } from 'sonner'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  ImagePlus,
  Info,
  Sparkles,
} from '@/shared/icons'

/* ─── 发布视频表单页 —— 高保真还原抖音「发布视频」内容区 ───
 *
 * 纯静态 demo：所有数据为占位内容，无真实账号信息；封面/视频缩略用 CSS 占位块。
 * 套用创作者中心外壳（TopNav + SideNav），本页只负责右侧内容区（表单 + 上传面板）。
 * 设计值取自参考页：主色 #FE2C55、内容区 #F9F9FA、白卡 rounded-lg / px-8 py-6、
 * 区块标题 16/600 #252632、字段标签 14。
 */

const RECOMMEND_TOPICS = ['动漫混剪', '飞刀', '哈尔的移动城堡', '皮影戏', '非人哉', '剑']

const OFFICIAL_ACTIVITIES = [
  { title: '全民麦霸！随时随地开唱，赢千元奖励！', heat: 222, tint: '#FF6B6B' },
  { title: '参与打工人”吐槽大会”，赢千元奖励', heat: 166, tint: '#4D8BFF' },
  { title: '全民舞力全开，参与赢千元激励！', heat: 176, tint: '#9B6BFF' },
]

const LOCATION_TIPS = ['鹏程苑', '海军军医大学第一附属医院', '安答龙虾·海鲜·大排档', '民星公园', '西湖园']

const demo = (label: string) => () => toast(`${label}（演示）`)

/* ─── 通用零件 ─── */

/** 白卡容器：内容区各分组的承载块。 */
function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-lg bg-white px-8 py-6">{children}</section>
}

/** 区块标题（左）+ 可选右侧操作。 */
function SectionTitle({ title, extra }: { title: string; extra?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h3 className="text-[16px] font-semibold text-[#252632]">{title}</h3>
      {extra}
    </div>
  )
}

/** 字段行：左侧固定宽度标签 + 右侧内容。 */
function Field({
  label,
  required,
  children,
  align = 'center',
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  align?: 'center' | 'top'
}) {
  return (
    <div className={`flex gap-5 ${align === 'top' ? 'items-start' : 'items-center'}`}>
      <div
        className={`w-[72px] shrink-0 text-[14px] font-medium text-[#1C1F23]/80 ${
          align === 'top' ? 'pt-2' : ''
        }`}
      >
        {required && <span className="mr-0.5 text-[#FE2C55]">*</span>}
        {label}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

/** 假下拉选择框（点击仅演示）。 */
function Select({ placeholder, width, onClick }: { placeholder: string; width?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 items-center justify-between rounded-md bg-[#F6F7F9] px-3 text-[13px] text-[#252632]/35 hover:bg-[#EFF1F4] ${
        width ?? 'w-full'
      }`}
    >
      <span>{placeholder}</span>
      <ChevronDown size={15} className="text-[#252632]/30" />
    </button>
  )
}

/** 单选项：选中为红点 + 红字，未选为灰圈 + 灰字。 */
function Radio({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          checked ? 'border-[#FE2C55]' : 'border-black/20'
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-[#FE2C55]" />}
      </span>
      <span className={`text-[13px] ${checked ? 'font-medium text-[#FE2C55]' : 'text-[#252632]/70'}`}>{label}</span>
    </button>
  )
}

/* ─── 主组件 ─── */

export default function PublishVideoPage() {
  const [visibility, setVisibility] = useState('公开')
  const [saveRight, setSaveRight] = useState('允许')
  const [publishTime, setPublishTime] = useState('立即发布')

  return (
    <div className="min-w-0 flex-1 overflow-y-auto bg-[#F9F9FA]">
      <div className="mx-auto flex max-w-[1040px] gap-4 px-6 py-6">
        {/* ── 左：表单主列 ── */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* 基础信息 */}
          <Card>
            <SectionTitle
              title="基础信息"
              extra={
                <button
                  type="button"
                  onClick={demo('快速填写')}
                  className="rounded-md bg-[#F2F2F4] px-3 py-1.5 text-[12px] font-medium text-[#404346] hover:bg-[#EAEAEE]"
                >
                  快速填写
                </button>
              }
            />

            <div className="space-y-6">
              <Field label="作品描述" align="top">
                {/* 标题 + 简介 + 正文 编辑框 */}
                <div className="rounded-lg border border-black/[0.08] focus-within:border-[#FE2C55]/40">
                  <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2.5">
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-[#252632] outline-none placeholder:text-[#252632]/30"
                      placeholder="填写作品标题，为作品获得更多流量"
                    />
                    <span className="shrink-0 text-[12px] text-[#252632]/30">0/30</span>
                  </div>
                  <div className="px-3 pt-2.5 text-[13px] text-[#252632]/30">添加作品简介</div>
                  <div className="flex items-end justify-between px-3 pb-2.5 pt-6">
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="text-[#2C64E3]">#添加话题</span>
                      <span className="text-[#2C64E3]">@好友</span>
                    </div>
                    <span className="text-[12px] text-[#252632]/30">0 / 1000</span>
                  </div>
                </div>

                {/* 推荐话题 */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="text-[12px] text-[#252632]/40">推荐</span>
                  {RECOMMEND_TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={demo(`添加话题 #${t}`)}
                      className="text-[13px] text-[#252632]/60 hover:text-[#2C64E3]"
                    >
                      #{t}
                    </button>
                  ))}
                  <button type="button" onClick={demo('展开更多话题')} className="text-[13px] text-[#252632]/40">
                    +14
                  </button>
                </div>
              </Field>

              {/* 官方活动 */}
              <Field label="官方活动" align="top">
                <div className="flex items-stretch gap-3">
                  {OFFICIAL_ACTIVITIES.map((a) => (
                    <button
                      key={a.title}
                      type="button"
                      onClick={demo('参与活动')}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-black/[0.06] p-2 text-left hover:border-[#FE2C55]/30"
                    >
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-white"
                        style={{ background: `linear-gradient(135deg, ${a.tint}, ${a.tint}cc)` }}
                      >
                        <Sparkles size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-medium text-[#252632]">{a.title}</span>
                        <span className="mt-0.5 flex items-center gap-0.5 text-[11px] text-[#252632]/45">
                          <Flame size={11} className="text-[#FE7A45]" />
                          热度：{a.heat}
                        </span>
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={demo('查看更多活动')}
                    className="grid w-11 shrink-0 place-items-center rounded-lg border border-black/[0.06] text-[12px] text-[#252632]/45 hover:bg-black/[0.02]"
                  >
                    +90
                  </button>
                </div>
              </Field>
            </div>
          </Card>

          {/* 设置封面 + 添加合集 + 自主声明 */}
          <Card>
            <div className="space-y-6">
              <Field label="设置封面" align="top">
                <div className="flex items-start gap-3">
                  {/* 横封面 4:3 */}
                  <CoverTile ratio="aspect-[4/3]" w="w-[132px]" caption="横封面4:3" />
                  {/* 竖封面 3:4 */}
                  <CoverTile ratio="aspect-[3/4]" w="w-[99px]" caption="竖封面3:4" />
                  {/* AI 智能推荐封面 */}
                  <div className="min-w-0 flex-1 rounded-lg bg-[linear-gradient(135deg,#EEF3FF,#F7F1FF)] p-3">
                    <div className="mb-2 flex items-center gap-1 text-[12px] font-medium text-[#6A54C9]">
                      <Sparkles size={13} />
                      AI智能推荐封面
                    </div>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[3/4] w-[52px] shrink-0 rounded-md bg-white/70 ring-1 ring-black/[0.04]" />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-[#252632]/45">好封面会吸引更多人浏览作品</span>
                      <button type="button" onClick={demo('优质封面示例')} className="text-[#2C64E3]">
                        优质封面示例
                      </button>
                    </div>
                  </div>
                </div>
              </Field>

              <Field label="添加合集">
                <div className="flex items-center gap-3">
                  <Select placeholder="合集" width="w-[96px]" onClick={demo('选择合集类型')} />
                  <Select placeholder="请选择合集" onClick={demo('选择合集')} />
                </div>
              </Field>

              <Field label="自主声明">
                <button
                  type="button"
                  onClick={demo('自主声明')}
                  className="flex h-9 w-full items-center justify-between rounded-md bg-[#F6F7F9] px-3 text-[13px] text-[#252632]/35 hover:bg-[#EFF1F4]"
                >
                  请选择自主声明
                  <ChevronRight size={15} className="text-[#252632]/30" />
                </button>
              </Field>
            </div>
          </Card>

          {/* 扩展信息 */}
          <Card>
            <SectionTitle title="扩展信息" />
            <div className="space-y-6">
              <Field label="视频章节" align="top">
                <button
                  type="button"
                  onClick={demo('添加视频章节')}
                  className="flex w-full items-center gap-3 rounded-lg bg-[#F6F7F9] px-4 py-3 text-left hover:bg-[#EFF1F4]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-[#252632]/50 ring-1 ring-black/[0.05]">
                    ≡
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] text-[#252632]/70">为进度条增加章节信息，让视频结构更清晰</span>
                    <span className="mt-0.5 block text-[12px] text-[#252632]/35">已添加的章节数量会在这里显示</span>
                  </span>
                </button>
                <p className="mt-2 flex items-center gap-1 text-[12px] text-[#252632]/40">
                  <Info size={12} />
                  如上传视频属于中插植入类型，请您按照标准添加章节信息，具体详见
                  <button type="button" onClick={demo('查看详情')} className="text-[#2C64E3]">
                    查看详情
                  </button>
                </p>
              </Field>

              <Field label="添加标签" align="top">
                <div className="flex items-center gap-2">
                  <Select placeholder="位置" width="w-[92px]" onClick={demo('选择位置类型')} />
                  <div className="flex h-9 min-w-0 flex-1 items-center rounded-md border border-black/[0.08] px-3">
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-[#252632] outline-none placeholder:text-[#252632]/30"
                      placeholder="输入地理位置"
                    />
                  </div>
                </div>
                {/* 为你推荐（横向可滑动占位） */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="shrink-0 text-[12px] text-[#252632]/40">为你推荐：</span>
                  <button type="button" className="grid h-5 w-5 shrink-0 place-items-center rounded-full hover:bg-black/5">
                    <ChevronLeft size={13} className="text-[#252632]/40" />
                  </button>
                  <div className="flex min-w-0 flex-1 gap-2 overflow-hidden">
                    {LOCATION_TIPS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={demo(`添加位置 ${l}`)}
                        className="flex shrink-0 items-center gap-1 rounded-md bg-[#F6F7F9] px-2.5 py-1 text-[12px] text-[#252632]/65 hover:bg-[#EFF1F4]"
                      >
                        <LocationDot />
                        <span className="max-w-[130px] truncate">{l}</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="grid h-5 w-5 shrink-0 place-items-center rounded-full hover:bg-black/5">
                    <ChevronRight size={13} className="text-[#252632]/40" />
                  </button>
                </div>
              </Field>

              <Field label="关联热点">
                <Select placeholder="点击输入热点词" onClick={demo('关联热点')} />
              </Field>
            </div>
          </Card>

          {/* 发布设置 */}
          <Card>
            <SectionTitle title="发布设置" />
            <div className="space-y-5">
              <Field label="谁可以看">
                <div className="flex items-center gap-8">
                  {['公开', '好友可见', '仅自己可见'].map((o) => (
                    <Radio key={o} label={o} checked={visibility === o} onClick={() => setVisibility(o)} />
                  ))}
                </div>
              </Field>
              <Field label="保存权限">
                <div className="flex items-center gap-8">
                  {['允许', '不允许'].map((o) => (
                    <Radio key={o} label={o} checked={saveRight === o} onClick={() => setSaveRight(o)} />
                  ))}
                </div>
              </Field>
              <Field label="发布时间">
                <div className="flex items-center gap-8">
                  {['立即发布', '定时发布'].map((o) => (
                    <Radio key={o} label={o} checked={publishTime === o} onClick={() => setPublishTime(o)} />
                  ))}
                </div>
              </Field>
            </div>
          </Card>

          {/* 底部操作 */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={demo('发布')}
              className="h-8 w-[120px] rounded bg-[#FE2C55] text-[14px] font-medium text-white hover:bg-[#F0244B]"
            >
              发布
            </button>
            <button
              type="button"
              onClick={demo('暂存离开')}
              className="h-8 rounded bg-[#F2F2F4] px-5 text-[14px] font-medium text-[#404346] hover:bg-[#EAEAEE]"
            >
              暂存离开
            </button>
          </div>
          <p className="pb-6 text-[12px] text-[#252632]/40">
            点击发布后，如作品还在上传中，请勿关闭页面，等待上传发布完成。
          </p>
        </div>

        {/* ── 右：上传进度 + 发文助手 ── */}
        <div className="w-[232px] shrink-0 space-y-3">
          <div className="rounded-lg bg-white p-3">
            {/* 视频缩略占位 */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#2b2b33,#4a4a55)]">
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <ImagePlus size={18} className="text-white/70" />
                </span>
              </div>
              <span className="absolute bottom-2 right-2 rounded bg-black/45 px-1.5 py-0.5 text-[11px] text-white">
                00:42
              </span>
            </div>

            <div className="mt-3 truncate text-[13px] font-medium text-[#252632]">示例视频.mp4</div>
            <div className="mt-1 text-[12px] text-[#FE2C55]">上传过程中不要删除或移动文件</div>

            {/* 进度条 42% */}
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#F0F1F3]">
                <div className="h-full rounded-full bg-[#FE2C55]" style={{ width: '42%' }} />
              </div>
              <span className="shrink-0 text-[12px] text-[#252632]/60">42%</span>
            </div>

            <dl className="mt-3 space-y-1.5 text-[12px]">
              {[
                ['已上传', '2.2MB/5.1MB'],
                ['当前速度', '88.3KB/s'],
                ['剩余时间', '35秒'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-[#252632]/40">{k}</dt>
                  <dd className="text-[#252632]/70">{v}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={demo('取消上传')}
              className="mt-3 w-full rounded-md border border-black/[0.08] py-1.5 text-[13px] text-[#252632]/70 hover:bg-black/[0.02]"
            >
              取消上传
            </button>
          </div>

          {/* 发文助手 */}
          <button
            type="button"
            onClick={demo('发文助手')}
            className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3.5 hover:bg-black/[0.01]"
          >
            <span className="flex items-center gap-2 text-[14px] font-medium text-[#252632]">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-[#F2F2F4]">
                <Sparkles size={14} className="text-[#6A54C9]" />
              </span>
              发文助手
            </span>
            <ChevronDown size={16} className="rotate-180 text-[#252632]/40" />
          </button>
        </div>
      </div>
    </div>
  )
}

/** 封面上传瓦片（虚线框 + 「选择封面」+ 比例说明）。 */
function CoverTile({ ratio, w, caption }: { ratio: string; w: string; caption: string }) {
  return (
    <div className={`${w} shrink-0`}>
      <button
        type="button"
        onClick={demo('选择封面')}
        className={`${ratio} flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/15 bg-[#F6F7F9] text-[#252632]/45 hover:border-[#FE2C55]/40 hover:text-[#FE2C55]`}
      >
        <ImagePlus size={20} />
        <span className="text-[12px]">选择封面</span>
      </button>
      <div className="mt-1.5 text-center text-[12px] text-[#252632]/45">{caption}</div>
    </div>
  )
}

/** 位置小图钉（图标集无 map-pin，内联绘制）。 */
function LocationDot() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" className="shrink-0 text-[#252632]/40" fill="none">
      <path
        d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
