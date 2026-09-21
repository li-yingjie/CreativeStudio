import { type ReactNode } from 'react'
import type { H5LabCase, H5LabDesign } from './h5-lab-cases'
import H5LabGeneratedScreen from './H5LabGeneratedScreen'
import type { H5LabScreen } from './h5-lab-prototype'

/* 画布和手机框都按「帧」来消费内容：registry 里定义的交互态，加上补交互时
   现生成的界面。两者渲染方式不同，但对覆盖机制、图层树、连接关系是一回事。 */

export interface H5LabFrame {
  id: string
  label: string
  note?: string
  /** 生成出来的界面，画布上要标出来源。 */
  generated?: H5LabScreen
  render: (previewKey: number) => ReactNode
}

export function buildH5LabFrames(
  labCase: H5LabCase,
  screens: H5LabScreen[],
  /** 面板里换过风格时传合并后的设计系统，生成屏跟着换。 */
  design: H5LabDesign = labCase.design,
): H5LabFrame[] {
  const stateFrames: H5LabFrame[] = labCase.states.map((state) => ({
    id: state.id,
    label: state.label,
    note: state.note,
    render: (previewKey) => (
      <state.Component
        key={`${state.id}-${previewKey}`}
        embedded
        state={state.state as never}
      />
    ),
  }))

  const generated: H5LabFrame[] = screens
    .filter((screen) => screen.caseId === labCase.id)
    .map((screen) => ({
      id: screen.id,
      label: screen.label,
      note: `补自「${screen.fromLabel}」`,
      generated: screen,
      render: (previewKey) => (
        <H5LabGeneratedScreen
          key={`${screen.id}-${previewKey}`}
          screen={screen}
          design={design}
        />
      ),
    }))

  return [...stateFrames, ...generated]
}
