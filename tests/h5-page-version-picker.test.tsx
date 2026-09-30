import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/icons', () => {
  const Icon = () => null
  return { Check: Icon, ChevronDown: Icon }
})

import H5LabPageVersionPicker from '@/modules/vibecoding/components/h5-lab/H5LabPageVersionPicker'

const frames = [
  { id: 'default', label: '默认态' },
  { id: 'unlocked', label: '已解锁人格' },
  { id: 'task', label: '已领取任务', generated: true },
]

afterEach(cleanup)

describe('H5LabPageVersionPicker', () => {
  it('uses the page name as the trigger and switches frames', async () => {
    const user = userEvent.setup()
    const onFrameChange = vi.fn()

    render(
      <H5LabPageVersionPicker
        pageName="冬日召集令 H5"
        frames={frames}
        activeFrameId="default"
        versions={[]}
        activeVersion="current"
        onFrameChange={onFrameChange}
        onVersionChange={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: '选择页面、状态帧和版本' }),
    )
    await user.click(
      screen.getByRole('menuitemradio', { name: /已解锁人格/ }),
    )

    expect(onFrameChange).toHaveBeenCalledWith('unlocked')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows version numbers in the same menu and switches snapshots', async () => {
    const user = userEvent.setup()
    const onVersionChange = vi.fn()

    render(
      <H5LabPageVersionPicker
        pageName="冬日召集令 H5"
        frames={frames}
        activeFrameId="default"
        activeVersion="current"
        versions={[
          {
            value: 'current',
            number: 10,
            label: '当前版本',
            detail: '调整任务入口',
          },
          {
            value: 'before',
            number: 9,
            label: '改前版本',
            detail: '优化首屏布局',
          },
        ]}
        onFrameChange={vi.fn()}
        onVersionChange={onVersionChange}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: '选择页面、状态帧和版本' }),
    )

    expect(screen.getAllByText(/^V\d+$/).map((node) => node.textContent)).toEqual(
      ['V9', 'V10'],
    )
    await user.click(
      screen.getByRole('menuitemradio', {
        name: /V9 改前版本 优化首屏布局/,
      }),
    )

    expect(onVersionChange).toHaveBeenCalledWith('before')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('omits version choices while editing', async () => {
    const user = userEvent.setup()

    render(
      <H5LabPageVersionPicker
        pageName="冬日召集令 H5"
        frames={frames}
        activeFrameId="default"
        versions={[]}
        activeVersion="current"
        onFrameChange={vi.fn()}
        onVersionChange={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: '选择页面、状态帧和版本' }),
    )

    expect(screen.getByText('状态帧')).toBeInTheDocument()
    expect(screen.queryByText('版本')).not.toBeInTheDocument()
  })
})
