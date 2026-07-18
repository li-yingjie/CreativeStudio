// AUTO-GENERATED icon shim — re-exports Tabler icons under the lucide
// names the codebase uses, translating lucide's `strokeWidth` prop to
// Tabler's `stroke`. Lets us swap the icon set without touching every
// call site. Regenerate via scripts if the icon set changes.
import { forwardRef, createElement } from 'react'
import type { ComponentType } from 'react'
import {
  IconActivity,
  IconAlertCircle,
  IconAlertTriangle,
  IconAlignBoxLeftStretch,
  IconAlignBoxRightStretch,
  IconAppWindow,
  IconArchive,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconArrowUpRight,
  IconArrowsDiagonal,
  IconArrowsSort,
  IconFolderPlus,
  IconArrowsLeftRight,
  IconArrowsMove,
  IconBan,
  IconBell,
  IconBolt,
  IconBook,
  IconBook2,
  IconBooks,
  IconBox,
  IconBoxMultiple,
  IconBriefcase,
  IconBrush,
  IconBulb,
  IconCalendar,
  IconCamera,
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconChevronUp,
  IconCircleCheck,
  IconClock,
  IconCode,
  IconCoins,
  IconColumns,
  IconCopy,
  IconCpu,
  IconCrop,
  IconCurrencyDollar,
  IconDatabase,
  IconDeviceDesktop,
  IconDeviceFloppy,
  IconDeviceGamepad2,
  IconDeviceMobile,
  IconDeviceTv,
  IconDots,
  IconDownload,
  IconEraser,
  IconExternalLink,
  IconEye,
  IconFile,
  IconFileCode,
  IconFileDescription,
  IconFileInfo,
  IconFileSearch,
  IconFileSettings,
  IconFileText,
  IconFileTypeJs,
  IconFlag,
  IconFlame,
  IconFlask,
  IconFolder,
  IconFolderCode,
  IconFolderOpen,
  IconFolders,
  IconGauge,
  IconGavel,
  IconGift,
  IconGitBranch,
  IconHeadphones,
  IconHeadset,
  IconHeart,
  IconHelpCircle,
  IconHistory,
  IconHome,
  IconInbox,
  IconInfoCircle,
  IconLayout,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLayoutSidebar,
  IconLayoutSidebarRight,
  IconLayoutSidebarRightExpand,
  IconListCheck,
  IconListTree,
  IconLoader2,
  IconLock,
  IconLogout,
  IconMail,
  IconMenu2,
  IconMenu4,
  IconMessage,
  IconMessageCircle,
  IconMessageExclamation,
  IconMessageHeart,
  IconMessagePlus,
  IconMessages,
  IconMinus,
  IconMoodSmile,
  IconMoon,
  IconMovie,
  IconMusic,
  IconNotebook,
  IconPalette,
  IconPaperclip,
  IconPencil,
  IconPhoto,
  IconPhotoPlus,
  IconPin,
  IconPinnedOff,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconPresentation,
  IconRefresh,
  IconRobot,
  IconRocket,
  IconRosetteDiscountCheck,
  IconRotate,
  IconRuler2,
  IconScale,
  IconScissors,
  IconSearch,
  IconServer,
  IconSettings,
  IconShare,
  IconShieldCheck,
  IconShieldExclamation,
  IconShoppingBag,
  IconShoppingCart,
  IconSparkles,
  IconSpeakerphone,
  IconSquareCheck,
  IconStack2,
  IconStar,
  IconSun,
  IconTable,
  IconTag,
  IconTarget,
  IconTelescope,
  IconTerminal2,
  IconThumbDown,
  IconThumbUp,
  IconTool,
  IconTrash,
  IconTrendingDown,
  IconTrendingUp,
  IconTrophy,
  IconTypography,
  IconUpload,
  IconUser,
  IconUserCircle,
  IconUserSquareRounded,
  IconUsers,
  IconUsersGroup,
  IconVideo,
  IconVolume,
  IconWand,
  IconWaveSine,
  IconWorld,
  IconX,
} from '@tabler/icons-react'

export interface IconProps {
  size?: number | string
  strokeWidth?: number | string
  color?: string
  className?: string
  fill?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  [key: string]: unknown
}
export type LucideIcon = ComponentType<IconProps>

function wrap(Comp: unknown): LucideIcon {
  const Wrapped = forwardRef<SVGSVGElement, IconProps>(function Icon(
    { strokeWidth, ...rest }: IconProps,
    ref,
  ) {
    if (!Comp) return null
    return createElement(Comp as ComponentType<Record<string, unknown>>, {
      ref,
      ...(strokeWidth != null ? { stroke: strokeWidth } : {}),
      ...rest,
    })
  })
  return Wrapped as unknown as LucideIcon
}

export const Activity = wrap(IconActivity)
export const AlignBoxLeftStretch = wrap(IconAlignBoxLeftStretch)
export const AlignBoxRightStretch = wrap(IconAlignBoxRightStretch)
export const AlertTriangle = wrap(IconAlertTriangle)
export const ArrowUpDown = wrap(IconArrowsSort)
export const FolderPlus = wrap(IconFolderPlus)
export const AppWindow = wrap(IconAppWindow)
export const Archive = wrap(IconArchive)
export const ArrowDown = wrap(IconArrowDown)
export const ArrowLeft = wrap(IconArrowLeft)
export const ArrowRight = wrap(IconArrowRight)
export const ArrowUp = wrap(IconArrowUp)
export const ArrowUpRight = wrap(IconArrowUpRight)
export const AudioLines = wrap(IconWaveSine)
export const BadgeCheck = wrap(IconRosetteDiscountCheck)
export const BadgeDollarSign = wrap(IconCurrencyDollar)
export const Ban = wrap(IconBan)
export const BarChart3 = wrap(IconChartBar)
export const Beaker = wrap(IconFlask)
export const Bell = wrap(IconBell)
export const Box = wrap(IconBox)
export const Blocks = wrap(IconStack2)
export const BookOpen = wrap(IconBook)
export const BookText = wrap(IconBook2)
export const Bot = wrap(IconRobot)
export const Boxes = wrap(IconBoxMultiple)
export const BriefcaseBusiness = wrap(IconBriefcase)
export const Brush = wrap(IconBrush)
export const Calendar = wrap(IconCalendar)
export const Camera = wrap(IconCamera)
export const Check = wrap(IconCheck)
export const CheckCircle2 = wrap(IconCircleCheck)
export const CheckSquare = wrap(IconSquareCheck)
export const ChevronDown = wrap(IconChevronDown)
export const ChevronLeft = wrap(IconChevronLeft)
export const ChevronRight = wrap(IconChevronRight)
export const ChevronsRight = wrap(IconChevronsRight)
export const ChevronUp = wrap(IconChevronUp)
export const CircleAlert = wrap(IconAlertCircle)
export const CircleHelp = wrap(IconHelpCircle)
export const Clapperboard = wrap(IconMovie)
export const Clock = wrap(IconClock)
export const Code2 = wrap(IconCode)
export const Coins = wrap(IconCoins)
export const Columns2 = wrap(IconColumns)
export const Copy = wrap(IconCopy)
export const Cpu = wrap(IconCpu)
export const Database = wrap(IconDatabase)
export const Download = wrap(IconDownload)
export const Eraser = wrap(IconEraser)
export const DollarSign = wrap(IconCurrencyDollar)
export const ExternalLink = wrap(IconExternalLink)
export const Eye = wrap(IconEye)
export const File = wrap(IconFile)
export const FileCode2 = wrap(IconFileCode)
export const FileCog = wrap(IconFileSettings)
export const FileInfo = wrap(IconFileInfo)
export const FileJson = wrap(IconFileTypeJs)
export const FileSearch = wrap(IconFileSearch)
export const FileText = wrap(IconFileText)
export const Film = wrap(IconMovie)
export const Flag = wrap(IconFlag)
export const Flame = wrap(IconFlame)
export const Flashlight = wrap(IconBulb)
export const FolderClosed = wrap(IconFolder)
export const FolderCode = wrap(IconFolderCode)
export const FolderOpen = wrap(IconFolderOpen)
export const FolderTree = wrap(IconFolders)
export const Gamepad2 = wrap(IconDeviceGamepad2)
export const Gauge = wrap(IconGauge)
export const Gift = wrap(IconGift)
export const GitBranch = wrap(IconGitBranch)
export const Globe = wrap(IconWorld)
export const Headphones = wrap(IconHeadphones)
export const Headset = wrap(IconHeadset)
export const Heart = wrap(IconHeart)
export const Home = wrap(IconHome)
export const History = wrap(IconHistory)
export const Image = wrap(IconPhoto)
export const ImagePlus = wrap(IconPhotoPlus)
export const Inbox = wrap(IconInbox)
export const Info = wrap(IconInfoCircle)
export const Layers = wrap(IconStack2)
export const LayoutDashboard = wrap(IconLayoutDashboard)
export const LayoutGrid = wrap(IconLayoutGrid)
export const Lock = wrap(IconLock)
export const LayoutTemplate = wrap(IconLayout)
export const Library = wrap(IconBooks)
export const Lightbulb = wrap(IconBulb)
export const Maximize2 = wrap(IconArrowsDiagonal)
export const ListCollapse = wrap(IconListTree)
export const ListChecks = wrap(IconListCheck)
export const Loader2 = wrap(IconLoader2)
export const Mail = wrap(IconMail)
export const Menu = wrap(IconMenu2)
export const Minus = wrap(IconMinus)
export const Megaphone = wrap(IconSpeakerphone)
export const MessageCircle = wrap(IconMessageCircle)
export const MessageCircleHeart = wrap(IconMessageHeart)
export const MessageSquare = wrap(IconMessage)
export const MessageSquarePlus = wrap(IconMessagePlus)
export const MessageSquareText = wrap(IconMessage)
export const MessageSquareWarning = wrap(IconMessageExclamation)
export const MessagesSquare = wrap(IconMessages)
export const Monitor = wrap(IconDeviceDesktop)
export const MonitorPlay = wrap(IconDeviceTv)
export const Moon = wrap(IconMoon)
export const MoreHorizontal = wrap(IconDots)
export const Move = wrap(IconArrowsMove)
export const Music = wrap(IconMusic)
export const Music2 = wrap(IconMusic)
export const Notebook = wrap(IconNotebook)
export const Palette = wrap(IconPalette)
export const PanelLeft = wrap(IconLayoutSidebar)
export const PanelRight = wrap(IconLayoutSidebarRight)
export const PanelRightOpen = wrap(IconLayoutSidebarRightExpand)
export const Paperclip = wrap(IconPaperclip)
export const Pencil = wrap(IconPencil)
export const PencilLine = wrap(IconPencil)
export const Pin = wrap(IconPin)
export const PinOff = wrap(IconPinnedOff)
export const Star = wrap(IconStar)
export const LogOut = wrap(IconLogout)
export const Menu4 = wrap(IconMenu4)
export const Play = wrap(IconPlayerPlay)
export const Pause = wrap(IconPlayerPause)
export const Scissors = wrap(IconScissors)
export const Crop = wrap(IconCrop)
export const Ruler = wrap(IconRuler2)
export const Plus = wrap(IconPlus)
export const Presentation = wrap(IconPresentation)
export const RefreshCw = wrap(IconRefresh)
export const Rocket = wrap(IconRocket)
export const RotateCcw = wrap(IconRotate)
export const Save = wrap(IconDeviceFloppy)
export const Scale = wrap(IconScale)
export const ScrollText = wrap(IconFileDescription)
export const Search = wrap(IconSearch)
export const Server = wrap(IconServer)
export const Settings = wrap(IconSettings)
export const Share2 = wrap(IconShare)
export const ShieldAlert = wrap(IconShieldExclamation)
export const ShieldCheck = wrap(IconShieldCheck)
export const ShoppingBag = wrap(IconShoppingBag)
export const ShoppingCart = wrap(IconShoppingCart)
export const Smartphone = wrap(IconDeviceMobile)
export const Smile = wrap(IconMoodSmile)
export const Sparkles = wrap(IconSparkles)
export const SquareUser = wrap(IconUserSquareRounded)
export const Sun = wrap(IconSun)
export const Table = wrap(IconTable)
export const Tag = wrap(IconTag)
export const Target = wrap(IconTarget)
export const Telescope = wrap(IconTelescope)
export const Terminal = wrap(IconTerminal2)
export const ThumbsDown = wrap(IconThumbDown)
export const ThumbsUp = wrap(IconThumbUp)
export const Trash2 = wrap(IconTrash)
export const Trophy = wrap(IconTrophy)
export const Gavel = wrap(IconGavel)
export const ArrowsLeftRight = wrap(IconArrowsLeftRight)
export const TrendingUp = wrap(IconTrendingUp)
export const TrendingDown = wrap(IconTrendingDown)
export const Type = wrap(IconTypography)
export const Upload = wrap(IconUpload)
export const User = wrap(IconUser)
export const UserRound = wrap(IconUserCircle)
export const Users = wrap(IconUsers)
export const UsersRound = wrap(IconUsersGroup)
export const Video = wrap(IconVideo)
export const Volume2 = wrap(IconVolume)
export const Wand2 = wrap(IconWand)
export const WandSparkles = wrap(IconWand)
export const Wrench = wrap(IconTool)
export const X = wrap(IconX)
export const Zap = wrap(IconBolt)
