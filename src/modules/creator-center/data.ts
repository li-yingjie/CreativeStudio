/* ─── 抖音创作者中心 — UI 静态配置 ───
 *
 * 只放界面结构类配置（菜单、入口卡、身份信息）。
 * 统计数据一律来自 mock 后端 /api/creator/stats（见 api.ts + server/creator-data.mjs）。
 */
/** 顶部菜单里的产品入口。workshop 挂现有的抖音 AI 工坊。 */
export type ProductId = 'home' | 'ai-avatar' | 'wiki' | 'suibian' | 'workshop'

export interface ProductEntry {
  id: ProductId
  label: string
  /** public/icons 下的单色 SVG，TopNav 以 mask 方式着色渲染 */
  icon: string
}

export const PRODUCTS: ProductEntry[] = [
  { id: 'home', label: '首页', icon: '/icons/Nav 菜单/ic-nav-Home.svg' },
  { id: 'ai-avatar', label: 'AI分身', icon: '/icons/分身.svg' },
  { id: 'wiki', label: '百科', icon: '/icons/book-open-02-stroked.svg' },
  { id: 'suibian', label: '随变', icon: '/icons/Creation_stroked.svg' },
  { id: 'workshop', label: 'AI工坊', icon: '/icons/terminal-square-stroked.svg' },
]

/** 星光余额（创作激励计量单位，顶栏右侧展示）。 */
export const STARLIGHT = 276

/** 首页「智能创作」入口卡（图取自设计稿，见 public/icons/creator-center/）。 */
export const SMART_CREATE_ENTRIES: {
  id: Exclude<ProductId, 'home'>
  label: string
  desc: string
  img: string
}[] = [
  { id: 'ai-avatar', label: 'AI分身', desc: '全天候代你处理粉丝互动', img: '/icons/creator-center/entry-ai-avatar.png' },
  { id: 'wiki', label: '百科', desc: '轻松构建书写你的奇思妙想', img: '/icons/creator-center/entry-wiki.png' },
  { id: 'suibian', label: '随变', desc: '一键生成百变创意短片', img: '/icons/creator-center/entry-suibian.png' },
  { id: 'workshop', label: 'AI工坊', desc: '零代码搭建互动应用', img: '/icons/creator-center/entry-workshop.png' },
]

/** 首页「作品发布」入口卡 — 彩色圆角图标块 + 文案。 */
export const PUBLISH_ENTRIES: { label: string; desc: string; tint: string; glyph: 'video' | 'image' | 'panorama' | 'article' }[] = [
  { label: '发布高清视频', desc: '支持常用格式推荐mp4', tint: '#FE2C55', glyph: 'video' },
  { label: '发布图文', desc: '支持常用图片格式png/jpg', tint: '#3B8DFF', glyph: 'image' },
  { label: '发布全景视频', desc: '推荐分辨率为4K 及以上', tint: '#8A5CF6', glyph: 'panorama' },
  { label: '发布文章', desc: '支持上传8000字和30个图片素材', tint: '#F5B60D', glyph: 'article' },
]

/** 创作者身份信息（统计数字由接口返回）。 */
export const CREATOR_PROFILE = {
  avatar: '/icons/creator-center/creator-avatar.png',
  name: '创作者用户昵称',
  badge: '抖音音乐人',
  authorize: '发起授权',
  mcn: '所属MCN机构: 纯初文化',
  douyinId: '抖音号: 3473824292',
  signature: '这个人很懒，没有留下任何签名，直接取签名的字段',
}

/** 首页左侧栏「发布」按钮图标。 */
export const PUBLISH_ICON = '/icons/发布.svg'

/** 左侧栏菜单（数据高亮为当前页），icon 为 public/icons 单色 SVG。 */
export const SIDE_MENU = [
  { key: 'data', label: '首页', icon: '/icons/Nav 菜单/ic-nav-Home.svg' },
  { key: 'content', label: '内容管理', icon: '/icons/icon.svg' },
  { key: 'datacenter', label: '数据中心', icon: '/icons/数据.svg' },
  { key: 'income', label: '收入变现', icon: '/icons/收入.svg' },
  { key: 'service', label: '创作服务', icon: '/icons/创作服务.svg', children: ['作品共创', '活动管理', '原创保护', '抖音指数'] },
]
