/* ─── 抖音创作者中心 — UI 静态配置 ───
 *
 * 只放界面结构类配置（菜单、入口卡、身份信息）。
 * 统计数据一律来自 mock 后端 /api/creator/stats（见 api.ts + server/creator-data.mjs）。
 */
import { Album01LinearIcon } from 'master-icon/react/Album01LinearIcon'
import { Analytics01LinearIcon } from 'master-icon/react/Analytics01LinearIcon'
import { Home01LinearIcon } from 'master-icon/react/Home01LinearIcon'
import { LightningLinearIcon } from 'master-icon/react/LightningLinearIcon'
import { Wallet01LinearIcon } from 'master-icon/react/Wallet01LinearIcon'

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

/** 首页「智能创作」入口卡。homeIcon 是设计稿整组 4x 导出的合成图；front/back
 *  保留给产品占位页使用，避免首页素材更新波及其它页面。 */
export const SMART_CREATE_ENTRIES: {
  id: Exclude<ProductId, 'home'>
  label: string
  desc: string
  homeIcon: string
  front: string
  back?: string
}[] = [
  {
    id: 'ai-avatar',
    label: 'AI分身',
    desc: '创造陪伴用户的另一个“你”',
    homeIcon: '/icons/creator-center/smart-create-ai-avatar.png',
    front: '/icons/creator-center/entry-ai-avatar-front.png',
    back: '/icons/creator-center/entry-ai-avatar-back.png',
  },
  {
    id: 'wiki',
    label: '百科',
    desc: '汇聚创作构想搭建专属世界',
    homeIcon: '/icons/creator-center/smart-create-wiki.png',
    front: '/icons/creator-center/entry-wiki-front.png',
    back: '/icons/creator-center/entry-wiki-back.png',
  },
  {
    id: 'suibian',
    label: '随变',
    desc: '自由角色创作，专业 Agent 成片',
    homeIcon: '/icons/creator-center/smart-create-suibian.png',
    front: '/icons/creator-center/entry-suibian-front.png',
    back: '/icons/creator-center/entry-suibian-back.png',
  },
  {
    id: 'workshop',
    label: 'AI工坊',
    desc: '从需求到可发布活动',
    homeIcon: '/icons/creator-center/smart-create-workshop.png',
    front: '/icons/creator-center/entry-workshop.png',
  },
]

export type PublishEntryId = 'video' | 'image' | 'panorama' | 'article'

/** 首页「作品发布」入口卡 — 图标为设计稿导出的 4x 贴纸卡（浅底 + 高饱和图标块）。 */
export const PUBLISH_ENTRIES: { id: PublishEntryId; label: string; desc: string; img: string }[] = [
  { id: 'video', label: '发布高清视频', desc: '支持常用格式推荐mp4', img: '/icons/creator-center/publish-video.png' },
  { id: 'image', label: '发布图文', desc: '支持常用图片格式png/jpg', img: '/icons/creator-center/publish-image.png' },
  { id: 'panorama', label: '发布全景视频', desc: '推荐分辨率为4K 及以上', img: '/icons/creator-center/publish-panorama.png' },
  { id: 'article', label: '发布文章', desc: '支持上传8000字和30个图片素材', img: '/icons/creator-center/publish-article.png' },
]

/** 创作者身份信息（统计数字由接口返回）。 */
export const CREATOR_PROFILE = {
  avatar: '/assets/kingjaylee.PNG',
  name: '创作者用户昵称',
  badge: '抖音音乐人',
  authorize: '发起授权',
  mcn: '所属MCN机构: 纯初文化',
  douyinId: '抖音号: 3473824292',
  signature: '这个人很懒，没有留下任何签名，直接取签名的字段',
}

/** 左侧栏菜单（数据高亮为当前页），图标统一来自 MasterIcon。 */
export const SIDE_MENU = [
  { key: 'data', label: '首页', Icon: Home01LinearIcon },
  { key: 'content', label: '内容管理', Icon: Album01LinearIcon },
  { key: 'datacenter', label: '数据中心', Icon: Analytics01LinearIcon },
  { key: 'income', label: '收入变现', Icon: Wallet01LinearIcon },
  // 创作服务 = 一组创作便捷工具（不是客服），用闪电（统一导航稿 lightning-02）
  { key: 'service', label: '创作服务', Icon: LightningLinearIcon, children: ['作品共创', '活动管理', '原创保护', '抖音指数'] },
]
