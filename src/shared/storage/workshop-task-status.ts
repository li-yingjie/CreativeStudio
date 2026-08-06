import { create } from 'zustand'

export type WorkshopTaskStatus =
  | 'running'
  | 'completed'
  | 'waiting-confirmation'

const WORKSHOP_TASK_STATUS_LABEL: Record<WorkshopTaskStatus, string> = {
  running: '正在执行',
  completed: '已完成',
  'waiting-confirmation': '等待确认',
}

export function workshopTaskStatusLabel(status: WorkshopTaskStatus) {
  return WORKSHOP_TASK_STATUS_LABEL[status]
}

type ProjectTasks = Record<string, WorkshopTaskStatus>

interface WorkshopTaskStatusState {
  tasksByProject: Record<string, ProjectTasks>
  setTaskStatus: (
    projectId: string,
    taskId: string,
    status: WorkshopTaskStatus,
  ) => void
  clearTask: (projectId: string, taskId: string) => void
  clearProject: (projectId: string) => void
}

/** A new task supersedes old completed markers, while concurrent live work and
 * confirmation gates remain visible until their own lifecycle advances. */
export const useWorkshopTaskStatus = create<WorkshopTaskStatusState>((set) => ({
  tasksByProject: {},
  setTaskStatus: (projectId, taskId, status) => {
    if (!projectId || !taskId) return
    set((state) => {
      const current = state.tasksByProject[projectId] ?? {}
      const next = Object.fromEntries(
        Object.entries(current).filter(
          ([id, taskStatus]) =>
            id === taskId || taskStatus !== 'completed',
        ),
      ) as ProjectTasks
      next[taskId] = status
      return {
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: next,
        },
      }
    })
  },
  clearTask: (projectId, taskId) =>
    set((state) => {
      const current = state.tasksByProject[projectId]
      if (!current?.[taskId]) return state
      const { [taskId]: _removed, ...remaining } = current
      void _removed
      const tasksByProject = { ...state.tasksByProject }
      if (Object.keys(remaining).length > 0)
        tasksByProject[projectId] = remaining
      else delete tasksByProject[projectId]
      return { tasksByProject }
    }),
  clearProject: (projectId) =>
    set((state) => {
      if (!state.tasksByProject[projectId]) return state
      const tasksByProject = { ...state.tasksByProject }
      delete tasksByProject[projectId]
      return { tasksByProject }
    }),
}))

export function getProjectTaskStatus(
  tasks: ProjectTasks | undefined,
): WorkshopTaskStatus | null {
  if (!tasks) return null
  const statuses = Object.values(tasks)
  if (statuses.includes('waiting-confirmation')) return 'waiting-confirmation'
  if (statuses.includes('running')) return 'running'
  if (statuses.includes('completed')) return 'completed'
  return null
}

/** Running work stays in the project directory. The product tab only carries
 * outcomes that need noticing after the user has switched elsewhere. */
export function getWorkshopNavTaskStatus(
  tasksByProject: Record<string, ProjectTasks>,
): Extract<WorkshopTaskStatus, 'completed' | 'waiting-confirmation'> | null {
  const statuses = Object.values(tasksByProject).map(getProjectTaskStatus)
  if (statuses.includes('waiting-confirmation')) return 'waiting-confirmation'
  if (statuses.includes('completed')) return 'completed'
  return null
}
