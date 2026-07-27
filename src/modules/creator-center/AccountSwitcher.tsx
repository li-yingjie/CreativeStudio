import { toast } from 'sonner'
import { Check } from '@/shared/icons'
import { CREATOR_PROFILE } from './data'

/* 账号切换面板 — 设计稿 创作者中心26.7 788-20756。
 * 昵称下拉与右上角头像菜单的「切换账号」二级面板共用。 */

interface DemoAccount {
  name: string
  desc: string
  avatar: string
  tag?: string
  current?: boolean
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { name: CREATOR_PROFILE.name, desc: '3200 粉丝', avatar: CREATOR_PROFILE.avatar, current: true },
  { name: CREATOR_PROFILE.name, desc: '0 粉丝', avatar: '/assets/avatar/1.png', tag: '企业机构账号' },
  { name: CREATOR_PROFILE.name, desc: '6400 粉丝', avatar: '/assets/avatar/3.png' },
]

export default function AccountSwitcherPanel() {
  return (
    <div className="flex w-[267px] flex-col gap-2 rounded-[12px] bg-white p-2 shadow-[0_4px_7px_rgba(0,0,0,0.1),0_0_0.5px_rgba(0,0,0,0.3)]">
      {DEMO_ACCOUNTS.map((a) => (
        <button
          key={a.desc}
          type="button"
          aria-current={a.current ? 'true' : undefined}
          onClick={() => toast(a.current ? '当前已是该账号' : '已切换账号（演示）')}
          className={`flex w-full items-center rounded-lg p-1 text-left transition-colors ${
            a.current ? 'bg-[rgba(83,96,143,0.07)]' : 'hover:bg-[rgba(83,96,143,0.07)]'
          }`}
        >
          <img src={a.avatar} alt="" className="size-14 shrink-0 rounded-full object-cover" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 px-3">
            <span className="truncate text-[12px] font-semibold leading-[18px] text-[#1c1f23]">{a.name}</span>
            {a.tag && (
              <span className="w-fit rounded px-1 text-[11px] leading-4 text-[#168ef9] bg-[#ecf6fe]">{a.tag}</span>
            )}
            <span className="text-[12px] leading-[18px] text-[rgba(28,31,35,0.6)]">{a.desc}</span>
          </span>
          {a.current && (
            <span className="mr-3 flex shrink-0 items-center justify-center rounded-full bg-[#252632] p-0.5">
              <Check size={12} strokeWidth={3} className="text-white" />
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
