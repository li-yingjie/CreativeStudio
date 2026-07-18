import { useState } from 'react'
import { toast } from 'sonner'
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  FileText,
  Image,
  ImagePlus,
  Info,
  Sparkles,
  Upload,
  Video,
  type LucideIcon,
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

export type PublishContentKind = 'video' | 'image' | 'panorama' | 'article'

type PublishTab = {
  kind: PublishContentKind
  label: string
  icon: LucideIcon
  uploadTitle: string
  uploadDesc: string
  uploadButton: string
  specs: { title: string; desc: string; icon: LucideIcon }[]
  assistantTitle: string
}

const PUBLISH_TABS: PublishTab[] = [
  {
    kind: 'video',
    label: '发布视频',
    icon: Video,
    uploadTitle: '点击上传 或直接将视频文件拖入此区域',
    uploadDesc: '为了更好的观看体验和平台安全，平台将对上传的视频预审。超过40秒的视频建议上传横版视频',
    uploadButton: '上传视频',
    assistantTitle: '视频发布助手',
    specs: [
      { title: '视频大小和格式', desc: '视频时长60分钟以内，文件大小16G以内，推荐上传mp4、webm格式视频', icon: Upload },
      { title: '视频画质', desc: '分辨率最高支持4K，帧率最大支持60帧，智能识别HDR视频', icon: Sparkles },
      { title: '视频画幅', desc: '建议上传高宽比为16:9、9:16、3:4、4:3、9:19.5（5.8寸）的视频', icon: Video },
    ],
  },
  {
    kind: 'image',
    label: '发布图文',
    icon: Image,
    uploadTitle: '点击上传 或直接将图片拖入此区域',
    uploadDesc: '最多支持上传35张图片，图片格式不支持gif格式',
    uploadButton: '上传图文',
    assistantTitle: '图文发布助手',
    specs: [
      { title: '图片格式', desc: '推荐jpg、jpeg、png、webp格式，不支持gif格式', icon: ImagePlus },
      { title: '图片大小', desc: '图片文件大小不超过50MB', icon: Upload },
      { title: '图片比例', desc: '不建议宽高比例超过1:2，推荐3:4、4:3', icon: Image },
    ],
  },
  {
    kind: 'panorama',
    label: '发布全景视频',
    icon: Camera,
    uploadTitle: '点击上传 或直接将全景视频拖入此区域',
    uploadDesc: '为了更好的观看体验和平台安全，平台将对上传的视频预审',
    uploadButton: '上传全景视频',
    assistantTitle: '全景发布助手',
    specs: [
      { title: '视频格式', desc: '支持常用视频格式，推荐mp4、mov', icon: Camera },
      { title: '全景视频大小', desc: '大小不超过16G，时长在10分钟以内', icon: Upload },
      { title: '视频分辨率', desc: '推荐分辨率为4K（3840x1920）及以上', icon: Video },
    ],
  },
  {
    kind: 'article',
    label: '发布文章',
    icon: FileText,
    uploadTitle: '点击创建文章 或导入已有文稿',
    uploadDesc: '支持长文编辑、图片素材和话题配置，适合教程、复盘和活动说明',
    uploadButton: '新建文章',
    assistantTitle: '文章发布助手',
    specs: [
      { title: '正文容量', desc: '支持8000字以内长文，可插入最多30个图片素材', icon: FileText },
      { title: '封面和摘要', desc: '建议补充标题、摘要与首图封面，提升信息流点击率', icon: ImagePlus },
      { title: '排版能力', desc: '支持小标题、引用、图片说明与话题标签', icon: Sparkles },
    ],
  },
]

const PUBLISH_TAB_BY_KIND = Object.fromEntries(PUBLISH_TABS.map((tab) => [tab.kind, tab])) as Record<PublishContentKind, PublishTab>

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
    <div className={`flex flex-col gap-2 sm:flex-row sm:gap-5 ${align === 'top' ? 'sm:items-start' : 'sm:items-center'}`}>
      <div
        className={`w-full shrink-0 text-[14px] font-medium text-[#1C1F23]/80 sm:w-[72px] ${
          align === 'top' ? 'sm:pt-2' : ''
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
function Radio({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-1.5">
      <input type="radio" name={name} value={label} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`flex size-4 items-center justify-center rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#4E83FD] ${
          checked ? 'border-[#FE2C55]' : 'border-black/20'
        }`}
      >
        {checked && <span className="size-2 rounded-full bg-[#FE2C55]" />}
      </span>
      <span className={`text-[13px] ${checked ? 'font-medium text-[#FE2C55]' : 'text-[#252632]/70'}`}>{label}</span>
    </label>
  )
}

/* ─── 主组件 ─── */

export default function PublishVideoPage({ initialKind = 'video' }: { initialKind?: PublishContentKind }) {
  const [activeKind, setActiveKind] = useState<PublishContentKind>(initialKind)
  const [stage, setStage] = useState<'gateway' | 'editor'>('gateway')
  const [entryMode, setEntryMode] = useState<'create' | 'upload'>('upload')
  const [visibility, setVisibility] = useState('公开')
  const [saveRight, setSaveRight] = useState('允许')
  const [publishTime, setPublishTime] = useState('立即发布')
  const activeTab = PUBLISH_TAB_BY_KIND[activeKind]

  const selectKind = (kind: PublishContentKind) => {
    setActiveKind(kind)
    setStage('gateway')
  }

  const enterEditor = (mode: 'create' | 'upload' = 'upload') => {
    setEntryMode(mode)
    setStage('editor')
  }

  return (
    <div className="min-w-0 flex-1 overflow-y-auto bg-[#F9F9FA]">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
        {stage === 'gateway' ? (
          <>
            <PublishTypePanel active={activeKind} onSelect={selectKind} />
            <div role="region" aria-label={`${activeTab.label}入口`}>
              {activeKind === 'article' ? (
                <ArticleGateway onCreate={() => enterEditor('create')} onImport={() => enterEditor('upload')} />
              ) : (
                <UploadGateway tab={activeTab} onStart={() => enterEditor('upload')} />
              )}
            </div>
          </>
        ) : (
          <>
            <EditorHeader tab={activeTab} mode={entryMode} onBack={() => setStage('gateway')} />

            {activeKind === 'video' ? (
        <div className="flex flex-col gap-4 xl:flex-row">
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
                      aria-label="作品标题"
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
                <div className="flex flex-col items-stretch gap-3 lg:flex-row">
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
                    className="grid min-h-11 w-full shrink-0 place-items-center rounded-lg border border-black/[0.06] text-[12px] text-[#252632]/45 hover:bg-black/[0.02] lg:w-11"
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
                <div className="flex flex-wrap items-start gap-3">
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
                      aria-label="地理位置"
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-[#252632] outline-none placeholder:text-[#252632]/30"
                      placeholder="输入地理位置"
                    />
                  </div>
                </div>
                {/* 为你推荐（横向可滑动占位） */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="shrink-0 text-[12px] text-[#252632]/40">为你推荐：</span>
                  <button type="button" aria-label="上一组推荐位置" onClick={demo('上一组推荐位置')} className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-black/5">
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
                  <button type="button" aria-label="下一组推荐位置" onClick={demo('下一组推荐位置')} className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-black/5">
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
                <div role="radiogroup" aria-label="谁可以看" className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  {['公开', '好友可见', '仅自己可见'].map((o) => (
                    <Radio key={o} name="visibility" label={o} checked={visibility === o} onChange={() => setVisibility(o)} />
                  ))}
                </div>
              </Field>
              <Field label="保存权限">
                <div role="radiogroup" aria-label="保存权限" className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  {['允许', '不允许'].map((o) => (
                    <Radio key={o} name="save-right" label={o} checked={saveRight === o} onChange={() => setSaveRight(o)} />
                  ))}
                </div>
              </Field>
              <Field label="发布时间">
                <div role="radiogroup" aria-label="发布时间" className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  {['立即发布', '定时发布'].map((o) => (
                    <Radio key={o} name="publish-time" label={o} checked={publishTime === o} onChange={() => setPublishTime(o)} />
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
        <div className="w-full shrink-0 space-y-3 xl:w-[232px]">
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
        ) : (
          <TypedPublishFlow tab={activeTab} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PublishTypePanel({
  active,
  onSelect,
}: {
  active: PublishContentKind
  onSelect: (kind: PublishContentKind) => void
}) {
  return (
    <section className="rounded-lg bg-white px-7 pb-4 pt-5">
      <div role="group" aria-label="发布类型" className="flex flex-wrap items-center gap-x-9 gap-y-2 border-b border-black/[0.06]">
        {PUBLISH_TABS.map((tab) => {
          const Icon = tab.icon
          const selected = active === tab.kind
          return (
            <button
              key={tab.kind}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(tab.kind)}
              className={`relative flex h-12 items-center gap-2 text-[16px] font-medium transition-colors ${
                selected ? 'text-[#161823]' : 'text-[#252632]/68 hover:text-[#161823]'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} className={selected ? 'text-[#FE2C55]' : 'text-[#252632]/42'} />
              {tab.label}
              {selected && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#FE2C55]" />}
            </button>
          )
        })}
        {active !== 'article' && (
          <button
            type="button"
            onClick={demo(active === 'panorama' ? '学习更多全景视频知识' : '了解上传规则详情')}
            className="ml-auto text-[13px] font-normal text-[#2C64E3] hover:opacity-80"
          >
            {active === 'panorama' ? '学习更多全景视频知识' : '了解上传规则详情'}
          </button>
        )}
      </div>
    </section>
  )
}

function EditorHeader({
  tab,
  mode,
  onBack,
}: {
  tab: PublishTab
  mode: 'create' | 'upload'
  onBack: () => void
}) {
  const status = tab.kind === 'article' ? (mode === 'create' ? '新建文章' : '导入文章') : '素材已选择'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[14px] font-medium text-[#252632]/70 hover:text-[#252632]"
      >
        <ChevronLeft size={17} />
        返回发布入口
      </button>
      <div className="flex items-center gap-2">
        <h2 className="text-balance text-[16px] font-semibold text-[#252632]">{tab.label}</h2>
        <span className="rounded bg-[#F2F3F5] px-2 py-1 text-[12px] text-[#252632]/50">{status}</span>
      </div>
    </div>
  )
}

function ArticleGateway({ onCreate, onImport }: { onCreate: () => void; onImport: () => void }) {
  return (
    <Card>
      <div className="flex min-h-[420px] flex-col items-center justify-center px-4 py-10 text-center">
        <span className="grid size-16 place-items-center rounded-lg bg-[#FFF0F3] text-[#FE2C55]">
          <FileText size={30} strokeWidth={1.7} />
        </span>
        <h2 className="mt-6 text-balance text-[24px] font-semibold text-[#252632]">抖音等你大作文章</h2>
        <p className="mt-3 max-w-[620px] text-pretty text-[14px] leading-7 text-[#252632]/55">
          把你的小故事变成大文章，解锁抖音内容新大陆。优质文章还可获得丰富流量奖励。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-11 min-w-[152px] items-center justify-center gap-2 rounded bg-[#FE2C55] px-6 text-[15px] font-semibold text-white hover:bg-[#F0244B]"
          >
            <FileText size={17} />
            我要发文
          </button>
          <button
            type="button"
            onClick={onImport}
            className="inline-flex h-11 min-w-[152px] items-center justify-center gap-2 rounded border border-black/[0.1] bg-white px-6 text-[15px] font-semibold text-[#252632]/75 hover:bg-[#F7F8FA]"
          >
            <Upload size={17} />
            一键导入
          </button>
        </div>
        <button type="button" onClick={demo('点击了解详情')} className="mt-5 text-[13px] text-[#2C64E3] hover:opacity-80">
          点击了解详情
        </button>
      </div>
    </Card>
  )
}

function UploadGateway({ tab, onStart }: { tab: PublishTab; onStart: () => void }) {
  return (
    <Card>
      <div className="grid gap-4 lg:grid-cols-3">
        {tab.specs.map((spec) => {
          const Icon = spec.icon
          return (
            <div key={spec.title} className="flex min-w-0 gap-3 border-black/[0.06] lg:border-r lg:pr-4 last:lg:border-r-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#F2F3F5] text-[#252632]/38">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-[#252632]">{spec.title}</div>
                <p className="mt-1 text-[12px] leading-5 text-[#252632]/48">{spec.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-5 flex min-h-[260px] w-full flex-col items-center justify-center rounded-lg bg-[#F7F8FA] px-6 text-center hover:bg-[#F3F4F7]"
      >
        <span className="grid size-12 place-items-center rounded-full bg-white text-[#252632]/28 shadow-sm">
          <Upload size={25} strokeWidth={1.8} />
        </span>
        <div className="mt-5 text-[18px] font-semibold text-[#252632]">{tab.uploadTitle}</div>
        <p className="mt-3 max-w-[720px] text-[13px] leading-6 text-[#252632]/42">{tab.uploadDesc}</p>
        <span className="relative mt-7 inline-flex h-11 min-w-[210px] items-center justify-center rounded bg-[#FE2C55] px-8 text-[15px] font-semibold text-white hover:bg-[#F0244B]">
          <ImagePlus size={18} className="mr-2" />
          {tab.uploadButton}
          {(tab.kind === 'video' || tab.kind === 'panorama') && (
            <span className="absolute -right-0.5 -top-3 rounded-full border border-[#FE2C55] bg-white px-2 py-0.5 text-[11px] font-medium text-[#FE2C55]">
              支持4k
            </span>
          )}
        </span>
      </button>

      {tab.kind === 'video' && (
        <button
          type="button"
          onClick={demo('立即体验剪映')}
          className="mt-4 flex min-h-[76px] w-full items-center justify-between overflow-hidden rounded-lg bg-[#073552] px-6 text-left text-white hover:bg-[#08415f]"
        >
          <span>
            <span className="block text-[15px] font-semibold">剪映｜抖音官方剪辑工具</span>
            <span className="mt-1 block text-[26px] font-bold leading-8">全能免费易用 AI剪辑更高效</span>
          </span>
          <span className="rounded-full bg-[#20E4F0] px-7 py-2.5 text-[15px] font-semibold text-[#061521]">立即体验</span>
        </button>
      )}
    </Card>
  )
}

function TypedPublishFlow({ tab }: { tab: PublishTab }) {
  const [visibility, setVisibility] = useState('公开')
  const [publishTime, setPublishTime] = useState('立即发布')
  const [saveRight, setSaveRight] = useState('允许')

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <div className="min-w-0 flex-1 space-y-3">
        <Card>
          <SectionTitle title="基础信息" extra={<button type="button" onClick={demo('AI 快速填写')} className="rounded-md bg-[#F2F2F4] px-3 py-1.5 text-[12px] font-medium text-[#404346] hover:bg-[#EAEAEE]">AI 快速填写</button>} />
          {tab.kind === 'image' && <ImagePublishFields />}
          {tab.kind === 'panorama' && <PanoramaPublishFields />}
          {tab.kind === 'article' && <ArticlePublishFields />}
        </Card>

        <Card>
          <SectionTitle title="发布设置" />
          <div className="space-y-5">
            <Field label="谁可以看">
              <div role="radiogroup" aria-label="谁可以看" className="flex flex-wrap items-center gap-x-8 gap-y-2">
                {['公开', '好友可见', '仅自己可见'].map((o) => (
                  <Radio key={o} name={`${tab.kind}-visibility`} label={o} checked={visibility === o} onChange={() => setVisibility(o)} />
                ))}
              </div>
            </Field>
            {tab.kind !== 'article' && (
              <Field label="保存权限">
                <div role="radiogroup" aria-label="保存权限" className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  {['允许', '不允许'].map((o) => (
                    <Radio key={o} name={`${tab.kind}-save-right`} label={o} checked={saveRight === o} onChange={() => setSaveRight(o)} />
                  ))}
                </div>
              </Field>
            )}
            <Field label="发布时间">
              <div role="radiogroup" aria-label="发布时间" className="flex flex-wrap items-center gap-x-8 gap-y-2">
                {['立即发布', '定时发布'].map((o) => (
                  <Radio key={o} name={`${tab.kind}-publish-time`} label={o} checked={publishTime === o} onChange={() => setPublishTime(o)} />
                ))}
              </div>
            </Field>
          </div>
        </Card>

        <div className="flex items-center gap-3 pt-1">
          <button type="button" onClick={demo(tab.label)} className="h-8 w-[120px] rounded bg-[#FE2C55] text-[14px] font-medium text-white hover:bg-[#F0244B]">
            发布
          </button>
          <button type="button" onClick={demo('暂存离开')} className="h-8 rounded bg-[#F2F2F4] px-5 text-[14px] font-medium text-[#404346] hover:bg-[#EAEAEE]">
            暂存离开
          </button>
        </div>
        <p className="pb-6 text-[12px] text-[#252632]/40">点击发布后，如素材仍在上传中，请勿关闭页面，等待上传发布完成。</p>
      </div>

      <PublishAssistantPanel tab={tab} />
    </div>
  )
}

function ImagePublishFields() {
  return (
    <div className="space-y-6">
      <Field label="图文描述" align="top">
        <DescriptionBox titlePlaceholder="填写图文标题，为作品获得更多流量" bodyPlaceholder="添加图文正文，支持话题、位置和商品组件" />
      </Field>
      <Field label="图片排序" align="top">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <button key={i} type="button" onClick={demo('调整图片排序')} className="aspect-[3/4] rounded-lg bg-[linear-gradient(135deg,#F0F4FF,#FFF1F4)] ring-1 ring-black/[0.06]">
              <span className="grid h-full place-items-center text-[12px] text-[#252632]/38">图片 {i + 1}</span>
            </button>
          ))}
          <button type="button" onClick={demo('继续添加图片')} className="aspect-[3/4] rounded-lg border border-dashed border-black/15 bg-[#F6F7F9] text-[#252632]/40 hover:border-[#FE2C55]/40 hover:text-[#FE2C55]">
            <span className="grid h-full place-items-center"><ImagePlus size={22} /></span>
          </button>
        </div>
      </Field>
      <Field label="添加标签">
        <Select placeholder="添加话题 / 位置 / 商品组件" onClick={demo('添加图文标签')} />
      </Field>
    </div>
  )
}

function PanoramaPublishFields() {
  return (
    <div className="space-y-6">
      <Field label="作品描述" align="top">
        <DescriptionBox titlePlaceholder="填写全景视频标题" bodyPlaceholder="介绍全景内容、拍摄地点或观看亮点" />
      </Field>
      <Field label="全景类型">
        <div className="flex flex-wrap gap-2">
          {['360° 全景', '180° 全景', 'VR 沉浸'].map((label, index) => (
            <button key={label} type="button" onClick={demo(label)} className={`rounded-md px-3 py-1.5 text-[13px] ${index === 0 ? 'bg-[#FE2C55]/10 font-medium text-[#FE2C55]' : 'bg-[#F6F7F9] text-[#252632]/65 hover:bg-[#EFF1F4]'}`}>
              {label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="初始视角">
        <div className="grid grid-cols-3 gap-2">
          {['正前方', '最佳看点', '自动漫游'].map((label) => (
            <button key={label} type="button" onClick={demo(label)} className="rounded-md bg-[#F6F7F9] px-3 py-2 text-[13px] text-[#252632]/65 hover:bg-[#EFF1F4]">
              {label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

function ArticlePublishFields() {
  return (
    <div className="space-y-6">
      <Field label="文章标题" required>
        <div className="flex h-10 items-center rounded-md border border-black/[0.08] px-3">
          <input aria-label="文章标题" className="min-w-0 flex-1 bg-transparent text-[14px] text-[#252632] outline-none placeholder:text-[#252632]/30" placeholder="请输入文章标题，最多不超过30个字" />
          <span className="text-[12px] text-[#252632]/30">0/30</span>
        </div>
      </Field>
      <Field label="文章摘要">
        <div className="flex h-10 items-center rounded-md border border-black/[0.08] px-3">
          <input aria-label="文章摘要" className="min-w-0 flex-1 bg-transparent text-[14px] text-[#252632] outline-none placeholder:text-[#252632]/30" placeholder="添加内容摘要或精彩部分吸引用户阅读" />
          <span className="text-[12px] text-[#252632]/30">0/30</span>
        </div>
      </Field>
      <Field label="文章正文" required align="top">
        <div className="rounded-lg border border-black/[0.08] focus-within:border-[#FE2C55]/40">
          <div className="flex flex-wrap items-center gap-1 border-b border-black/[0.06] px-3 py-2 text-[12px] text-[#252632]/55 sm:gap-2">
            {['正文', '小标题', '引用', '图片', '话题'].map((item) => (
              <button key={item} type="button" onClick={demo(item)} className="rounded px-2 py-1 hover:bg-black/[0.04]">
                {item}
              </button>
            ))}
          </div>
          <textarea aria-label="文章正文" className="min-h-[220px] w-full resize-none bg-transparent p-3 text-[14px] text-[#252632] outline-none placeholder:text-[#252632]/30" placeholder="请输入正文" />
          <div className="flex items-center justify-between border-t border-black/[0.06] px-3 py-2 text-[12px] text-[#252632]/35">
            <span>支持粘贴 Markdown 或从本地导入文稿</span>
            <span>0 / 8000</span>
          </div>
        </div>
      </Field>
      <Field label="文章头图" align="top">
        <button
          type="button"
          onClick={demo('上传文章头图')}
          className="flex aspect-[16/9] w-full max-w-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-black/15 bg-[#F6F7F9] text-[13px] text-[#252632]/45 hover:border-[#FE2C55]/40 hover:text-[#FE2C55]"
        >
          <ImagePlus size={22} />
          点击上传图片
        </button>
        <p className="mt-2 max-w-[560px] text-pretty text-[12px] leading-5 text-[#252632]/40">
          该内容会在推荐频道中展示，请上传与文章内容相关且清晰的图片。
        </p>
      </Field>
      <Field label="封面设置" required align="top">
        <CoverTile ratio="aspect-[4/3]" w="w-[152px]" caption="优质封面会吸引更多人浏览作品" />
      </Field>
      <Field label="添加话题">
        <Select placeholder="点击添加话题（最多5个）" onClick={demo('添加文章话题')} />
      </Field>
      <Field label="选择配乐">
        <Select placeholder="点击添加合适作品风格音乐" onClick={demo('选择文章配乐')} />
      </Field>
    </div>
  )
}

function DescriptionBox({ titlePlaceholder, bodyPlaceholder }: { titlePlaceholder: string; bodyPlaceholder: string }) {
  return (
    <div className="rounded-lg border border-black/[0.08] focus-within:border-[#FE2C55]/40">
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2.5">
        <input aria-label="作品标题" className="min-w-0 flex-1 bg-transparent text-[13px] text-[#252632] outline-none placeholder:text-[#252632]/30" placeholder={titlePlaceholder} />
        <span className="shrink-0 text-[12px] text-[#252632]/30">0/30</span>
      </div>
      <textarea aria-label="作品描述" className="min-h-[92px] w-full resize-none bg-transparent px-3 py-2.5 text-[13px] text-[#252632] outline-none placeholder:text-[#252632]/30" placeholder={bodyPlaceholder} />
      <div className="flex items-center justify-between px-3 pb-2.5 text-[12px]">
        <span className="text-[#2C64E3]">#添加话题 @好友</span>
        <span className="text-[#252632]/30">0 / 1000</span>
      </div>
    </div>
  )
}

function PublishAssistantPanel({ tab }: { tab: PublishTab }) {
  const Icon = tab.icon
  const isArticle = tab.kind === 'article'
  return (
    <div className="w-full shrink-0 space-y-3 xl:w-[232px]">
      <div className="rounded-lg bg-white p-3">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#EEF3FF,#FFF1F4)]">
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/80 text-[#FE2C55] shadow-sm">
              <Icon size={25} strokeWidth={1.8} />
            </span>
          </div>
          <span className="absolute left-2 top-2 rounded bg-white/80 px-2 py-0.5 text-[11px] font-medium text-[#252632]/60">
            {tab.label}
          </span>
        </div>
        <div className="mt-3 text-[13px] font-medium text-[#252632]">{isArticle ? '文章草稿' : '素材已选择'}</div>
        <div className="mt-1 text-[12px] text-[#FE2C55]">这是演示链路，不会真实发布</div>
        <div className="mt-3 rounded-md bg-[#F7F8FA] px-3 py-2 text-[12px] leading-5 text-[#252632]/48">
          {isArticle
            ? '完成标题、正文、头图和封面后，可继续配置发布时间与可见范围。'
            : '素材选择后可继续填写标题、封面、话题、发布时间与可见范围。'}
        </div>
      </div>
      <button type="button" onClick={demo(tab.assistantTitle)} className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3.5 hover:bg-black/[0.01]">
        <span className="flex items-center gap-2 text-[14px] font-medium text-[#252632]">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-[#F2F2F4]">
            <Sparkles size={14} className="text-[#6A54C9]" />
          </span>
          {tab.assistantTitle}
        </span>
        <ChevronDown size={16} className="rotate-180 text-[#252632]/40" />
      </button>
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
    <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-[#252632]/40" fill="none">
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
