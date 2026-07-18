import type { LucideIcon } from '@/shared/icons'
import type { ProjectKind } from './ProjectProductView'
import { getAvatarConfig } from './AvatarConfigData'
import { getMiniProgramConfig } from './MiniProgramConfigData'

export type PublishObjectVisual =
  | {
      type: 'image'
      src: string
      alt: string
      rounded: 'full' | 'lg'
      fit?: 'cover' | 'contain'
    }
  | {
      type: 'text'
      text: string
      alt: string
      rounded: 'full' | 'lg'
      className: string
    }
  | {
      type: 'icon'
      icon: LucideIcon
      alt: string
      rounded: 'full' | 'lg'
      className?: string
    }

export function getPublishObjectVisual(
  projectKind: ProjectKind,
  projectKey: string,
  fallbackIcon: LucideIcon,
): PublishObjectVisual {
  if (projectKind === 'ai-avatar') {
    const avatarConfig = getAvatarConfig(projectKey)
    if (avatarConfig?.iconURL) {
      return {
        type: 'image',
        src: avatarConfig.iconURL,
        alt: avatarConfig.name,
        rounded: 'full',
      }
    }
  }

  if (projectKind === 'mini-program') {
    const miniProgramConfig = getMiniProgramConfig(projectKey)
    const logoAsset =
      miniProgramConfig?.assets.find((asset) => /(logo|icon)/i.test(asset.name)) ??
      miniProgramConfig?.assets[0]
    if (logoAsset?.url) {
      return {
        type: 'image',
        src: logoAsset.url,
        alt: logoAsset.name,
        rounded: 'lg',
      }
    }
  }

  if (projectKind === 'web-game') {
    return {
      type: 'image',
      src: '/garuda/assets/Start.jpg',
      alt: 'Garuda 游戏封面',
      rounded: 'lg',
    }
  }

  if (projectKind === 'marketing-h5') {
    return {
      type: 'image',
      src: '/h5/children-day/hero-gifts.png',
      alt: '六一儿童节活动头图',
      rounded: 'lg',
    }
  }

  if (projectKind === 'web-app') {
    return {
      type: 'text',
      text: 'S°',
      alt: 'STUDIO°',
      rounded: 'lg',
      className: 'bg-[#16161a] text-white',
    }
  }

  if (projectKind === 'ops-proposal') {
    return {
      type: 'text',
      text: '提',
      alt: '提案',
      rounded: 'lg',
      className: 'bg-[#fff2cc] text-[#9a6700]',
    }
  }

  return { type: 'icon', icon: fallbackIcon, alt: '产物', rounded: 'lg' }
}
