import { create } from 'zustand'

export type PublishStep = 'idle' | 'select' | 'review' | 'confirmed'
/** Where to render the publish form. `chat` = inline assistant turn,
 *  `modal` = centered overlay over the editor canvas. */
export type PublishMode = 'chat' | 'modal'

/** Screen-space rect of the 发布 button that opened the flow, so the modal
 *  popover can float directly beneath it. */
export type PublishAnchor = { top: number; left: number; right: number; bottom: number }

type PublishFlow = {
  step: PublishStep
  mode: PublishMode
  scenes: string[]
  anchor: PublishAnchor | null
}

const EMPTY_FLOW: PublishFlow = {
  step: 'idle',
  mode: 'chat',
  scenes: [],
  anchor: null,
}

interface PublishFlowState extends PublishFlow {
  /** Project whose flow is currently exposed through the top-level fields. */
  projectId: string | null
  /** In-memory flow state keyed by stable project id. */
  flows: Record<string, PublishFlow>
  /** Projects with at least one confirmed publish, independent of open flow UI. */
  publishedProjectIds: string[]
  /** Switch the exposed flow without leaking the previous project's state. */
  activateProject: (projectId: string) => void
  /** Open the flow. Top-right 发布/更新 buttons pass `'modal'` (plus the
   *  button's rect so the popover floats below it); in-chat triggers pass
   *  `'chat'`. */
  start: (mode: PublishMode, anchor?: PublishAnchor | null) => void
  toggleScene: (scene: string) => void
  /** First-step submit: moves from 'select' → 'review'. */
  submit: () => void
  /** Final confirm in the review card: moves to 'confirmed'. */
  confirm: () => void
  /** Reset the active project's flow back to idle. */
  reset: () => void
  /** Close the active project's modal flow. */
  closeModal: () => void
}

const updateActiveFlow = (
  state: PublishFlowState,
  update: (flow: PublishFlow) => PublishFlow,
): Partial<PublishFlowState> => {
  const projectId = state.projectId
  if (!projectId) return {}
  const next = update(state.flows[projectId] ?? EMPTY_FLOW)
  return {
    ...next,
    flows: { ...state.flows, [projectId]: next },
  }
}

/** In-memory only, but isolated by project so navigation cannot reassign a
 * confirmed flow to the project that happens to render next. */
export const usePublishFlowStore = create<PublishFlowState>((set) => ({
  ...EMPTY_FLOW,
  projectId: null,
  flows: {},
  publishedProjectIds: [],
  activateProject: (projectId) =>
    set((state) => {
      const flow = state.flows[projectId] ?? EMPTY_FLOW
      return { projectId, ...flow }
    }),
  start: (mode, anchor = null) =>
    set((state) =>
      updateActiveFlow(state, (flow) => ({
        ...flow,
        step: 'select',
        mode,
        anchor,
      })),
    ),
  toggleScene: (scene) =>
    set((state) =>
      updateActiveFlow(state, (flow) => ({
        ...flow,
        scenes: flow.scenes.includes(scene)
          ? flow.scenes.filter((item) => item !== scene)
          : [...flow.scenes, scene],
      })),
    ),
  submit: () =>
    set((state) =>
      updateActiveFlow(state, (flow) =>
        flow.scenes.length === 0 ? flow : { ...flow, step: 'review' },
      ),
    ),
  confirm: () =>
    set((state) => {
      const flowUpdate = updateActiveFlow(state, (flow) => ({
        ...flow,
        step: 'confirmed',
      }))
      if (!state.projectId || state.publishedProjectIds.includes(state.projectId)) {
        return flowUpdate
      }
      return {
        ...flowUpdate,
        publishedProjectIds: [...state.publishedProjectIds, state.projectId],
      }
    }),
  reset: () => set((state) => updateActiveFlow(state, () => ({ ...EMPTY_FLOW }))),
  closeModal: () =>
    set((state) => updateActiveFlow(state, () => ({ ...EMPTY_FLOW }))),
}))

export const PUBLISH_SCENES = ['AI 聊天', '评论区', '群聊', '私信'] as const

/** Per-scene description shown inside the review card. */
export const PUBLISH_SCENE_DESCRIPTIONS: Record<string, string> = {
  'AI 聊天': '在个人页展示 AI 聊天入口，提供 1 对 1 互动',
  '评论区': 'AI 分身活跃评论区，助力粉丝互动',
  '群聊': 'AI 分身参与群聊互动，提升参与感',
  '私信': 'AI 分身自动回复私信，提升用户粘性',
}
