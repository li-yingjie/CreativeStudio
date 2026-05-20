import { create } from 'zustand'

export type PublishStep = 'idle' | 'select' | 'review' | 'confirmed'
/** Where to render the publish form. `chat` = inline assistant turn,
 *  `modal` = centered overlay over the editor canvas. */
export type PublishMode = 'chat' | 'modal'

/** Screen-space rect of the 发布 button that opened the flow, so the modal
 *  popover can float directly beneath it. */
export type PublishAnchor = { top: number; left: number; right: number; bottom: number }

interface PublishFlowState {
  /** Current step in the publish-to-douyin flow. */
  step: PublishStep
  /** Whether the form is rendered as a chat turn or a centered modal. */
  mode: PublishMode
  /** Selected Douyin scenes the user wants to publish to. */
  scenes: string[]
  /** Anchor rect of the triggering 发布 button (modal mode only). */
  anchor: PublishAnchor | null
  /** Open the flow. Top-right 发布/更新 buttons pass `'modal'` (plus the
   *  button's rect so the popover floats below it); in-chat triggers pass
   *  `'chat'`. */
  start: (mode: PublishMode, anchor?: PublishAnchor | null) => void
  toggleScene: (s: string) => void
  /** First-step submit: moves from 'select' → 'review'. */
  submit: () => void
  /** Final confirm in the review card: moves to 'confirmed'. */
  confirm: () => void
  /** Reset back to idle. */
  reset: () => void
  /** Close the modal but keep the chat-embedded turn visible (modal-only
   *  dismiss). The store falls back to whatever the chat is showing. */
  closeModal: () => void
}

/** In-memory only — the flow is per-session, no need to persist. */
export const usePublishFlowStore = create<PublishFlowState>((set, get) => ({
  step: 'idle',
  mode: 'chat',
  scenes: [],
  anchor: null,
  start: (mode, anchor = null) => set({ step: 'select', mode, anchor }),
  toggleScene: (s) => {
    const cur = get().scenes
    set({
      scenes: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    })
  },
  submit: () => {
    if (get().scenes.length === 0) return
    set({ step: 'review' })
  },
  confirm: () => set({ step: 'confirmed' }),
  reset: () => set({ step: 'idle', scenes: [], mode: 'chat', anchor: null }),
  closeModal: () => set({ step: 'idle', scenes: [], mode: 'chat', anchor: null }),
}))

export const PUBLISH_SCENES = ['AI 聊天', '评论区', '群聊', '私信'] as const

/** Per-scene description shown inside the review card. */
export const PUBLISH_SCENE_DESCRIPTIONS: Record<string, string> = {
  'AI 聊天': '在个人页展示 AI 聊天入口，提供 1 对 1 互动',
  '评论区': 'AI 分身活跃评论区，助力粉丝互动',
  '群聊': 'AI 分身参与群聊互动，提升参与感',
  '私信': 'AI 分身自动回复私信，提升用户粘性',
}
