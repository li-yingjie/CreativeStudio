import * as Popover from '@radix-ui/react-popover'
import { Check } from '@/shared/icons'
import { getWikiObject, WIKI_OBJECTS } from './wiki-object-data'

const OBJECT_NAME_FONT = {
  fontFamily: '"FZYanSongS-M-GB", "Source Han Serif CN", "Songti SC", serif',
}

export default function WikiObjectSwitcher({
  activeId,
  onChange,
  compact = false,
}: {
  activeId: string
  onChange: (id: string) => void
  /** 方案 4 顶部工具栏使用设计稿中的 128px 紧凑宽度。 */
  compact?: boolean
}) {
  const activeObject = getWikiObject(activeId)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`切换百科对象，当前为${activeObject.title}`}
          className={`flex h-8 items-center justify-between rounded-lg border border-[#e9e9eb] bg-white py-1 pl-1 pr-1.5 text-left transition-colors hover:bg-black/[0.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 ${
            compact ? 'w-32' : 'w-full'
          }`}
        >
          <span className="flex min-w-0 items-center gap-1">
            <img
              src={activeObject.cover}
              alt=""
              className="h-6 w-[18px] shrink-0 rounded object-cover"
            />
            <span
              className="truncate text-[13px] leading-normal text-black"
              style={OBJECT_NAME_FONT}
            >
              {activeObject.title}
            </span>
          </span>
          <span className="flex size-4 shrink-0 items-center justify-center rounded-[11px]">
            <img
              src="/icons/wiki-editor/object-switch.svg"
              alt=""
              aria-hidden
              className="h-[7.5px] w-[8.5px]"
            />
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          aria-label="切换百科对象"
          className="z-[80] w-[var(--radix-popover-trigger-width)] rounded-xl border border-black/5 bg-white p-1.5 shadow-lg"
        >
          {WIKI_OBJECTS.map((object) => {
            const selected = object.id === activeObject.id
            return (
              <Popover.Close asChild key={object.id}>
                <button
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => onChange(object.id)}
                  className={`flex h-10 w-full items-center gap-2 rounded-lg px-1.5 text-left transition-colors ${
                    selected
                      ? 'bg-[rgba(83,96,143,0.08)]'
                      : 'hover:bg-[rgba(83,96,143,0.06)]'
                  }`}
                >
                  <img
                    src={object.cover}
                    alt=""
                    className="h-8 w-6 shrink-0 rounded object-cover"
                  />
                  <span
                    className="min-w-0 flex-1 truncate text-[13px] text-[#252632]"
                    style={OBJECT_NAME_FONT}
                  >
                    {object.title}
                  </span>
                  {selected && (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#252632]">
                      <Check size={10} strokeWidth={3} className="text-white" />
                    </span>
                  )}
                </button>
              </Popover.Close>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
