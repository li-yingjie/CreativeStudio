import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/icons', () => {
  const Icon = () => null
  return {
    Calendar: Icon,
    CheckCircle2: Icon,
    Copy: Icon,
    FileText: Icon,
    GitBranch: Icon,
    History: Icon,
    MoreHorizontal: Icon,
    Palette: Icon,
    Pencil: Icon,
    RotateCcw: Icon,
    Search: Icon,
    Trash2: Icon,
    X: Icon,
  }
})

vi.mock('@douyinfe/semi-ui', () => {
  const Dropdown = (props: {
    children: React.ReactNode
    render: React.ReactNode
  }) => {
    const [visible, setVisible] = React.useState(false)
    return (
      <div>
        <span onClick={() => setVisible((current) => !current)}>
          {props.children}
        </span>
        {visible ? <div onClick={() => setVisible(false)}>{props.render}</div> : null}
      </div>
    )
  }
  Dropdown.Menu = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
  Dropdown.Item = ({
    children,
    disabled,
    icon,
    onClick,
  }: {
    children: React.ReactNode
    disabled?: boolean
    icon?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {icon}
      {children}
    </button>
  )

  const Timeline = ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  )
  Timeline.Item = ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  )

  return {
    Button: ({
      children,
      onClick,
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    Card: ({
      children,
      bodyStyle,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      bodyStyle?: React.CSSProperties
    }) => {
      void bodyStyle
      return <div {...props}>{children}</div>
    },
    DatePicker: () => <div aria-label="日期范围" />,
    Dropdown,
    Input: (props: {
      value: string
      onChange: (value: string) => void
      placeholder?: string
      'aria-label'?: string
    }) => (
      <input
        aria-label={props['aria-label']}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    ),
    IconButton: (
      props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
        icon?: React.ReactNode
      },
    ) => (
      <button
        type="button"
        aria-label={props['aria-label']}
        aria-expanded={props['aria-expanded']}
        onClick={props.onClick}
      >
        {props.icon}
      </button>
    ),
    Modal: ({
      children,
      visible,
    }: {
      children: React.ReactNode
      visible?: boolean
    }) => (visible ? <div>{children}</div> : null),
    Popover: ({
      children,
      content,
      visible,
      onVisibleChange,
    }: {
      children: React.ReactNode
      content: React.ReactNode
      visible?: boolean
      onVisibleChange?: (visible: boolean) => void
    }) => {
      return (
        <div>
          <span onClick={() => onVisibleChange?.(!visible)}>
            {children}
          </span>
          {visible ? (
            <div className="semi-popover-wrapper">{content}</div>
          ) : null}
        </div>
      )
    },
    SearchForm: () => <form data-testid="search-form" />,
    Select: (
      props: {
        value: string
        onChange: (value: string) => void
        optionList: { value: string; label: string }[]
        dropdownClassName?: string
        theme?: string
        size?: string
      } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>,
    ) => (
      <select
        aria-label={props['aria-label']}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      >
        {props.optionList.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    Tag: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    TextArea: () => <textarea />,
    Tabs: ({
      activeKey,
      onChange,
      tabList,
    }: {
      activeKey: string
      onChange: (key: string) => void
      tabList: { itemKey: string; tab: string }[]
    }) => (
      <div role="tablist">
        {tabList.map((item) => (
          <button
            key={item.itemKey}
            type="button"
            role="tab"
            aria-selected={activeKey === item.itemKey}
            onClick={() => onChange(item.itemKey)}
          >
            {item.tab}
          </button>
        ))}
      </div>
    ),
    Timeline,
  }
})

import ChangeManagementView, {
  type ChangeChatVersion,
  type ChangeEditorVersion,
} from '@/modules/vibecoding/components/ChangeManagementView'
import { matchesDateRange } from '@/modules/vibecoding/components/change-management-utils'
import ReleaseManagementView, {
  type PublishedVersion,
} from '@/modules/vibecoding/components/ReleaseManagementView'

const author = {
  name: '孙思媛',
  avatarUrl:
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
}

const currentVersion: ChangeEditorVersion = {
  id: 'current',
  versionNumber: 2,
  label: '当前编辑器内容',
  description: '当前工作区中的编辑内容',
  author,
  createdAt: new Date('2026-09-29T14:15:00').getTime(),
  pageIds: ['home'],
}

const historicalVersion: ChangeEditorVersion = {
  id: 'draft-v4',
  versionNumber: 1,
  label: '优化首屏布局',
  description: '历史编辑器快照',
  author,
  createdAt: new Date('2026-09-28T21:41:00').getTime(),
  pageIds: ['home'],
}

const chatVersion: ChangeChatVersion = {
  id: 's-1',
  title: '对话版本 1',
  summary: '当前对话中的需求、生成结果与修改上下文',
  author,
  createdAt: new Date('2026-09-29T14:20:00').getTime(),
  current: true,
}

const historicalChatVersion: ChangeChatVersion = {
  ...chatVersion,
  id: 's-old',
  title: '对话版本 0',
  createdAt: new Date('2026-09-28T13:10:00').getTime(),
  current: false,
}

function renderView(
  onRestoreEditorVersion = vi.fn(),
  chatVersions: ChangeChatVersion[] = [],
  onRestoreChatVersion = vi.fn(),
  selectedVersionId?: string,
) {
  render(
    <ChangeManagementView
      projectName="冬日召集令 · 复刻"
      pages={[{ id: 'home', label: '首页' }]}
      chatVersions={chatVersions}
      editorVersions={[historicalVersion]}
      currentEditorVersion={currentVersion}
      pendingEditorChanges={0}
      selectedVersionId={selectedVersionId}
      selectionRequest={selectedVersionId ? 1 : 0}
      onRestoreChatVersion={onRestoreChatVersion}
      onRestoreEditorVersion={onRestoreEditorVersion}
      onUpdateDraftVersion={vi.fn()}
      onEditDraftVersion={vi.fn()}
      onDeleteDraftVersion={vi.fn()}
    />,
  )
  return { onRestoreChatVersion, onRestoreEditorVersion }
}

afterEach(cleanup)

describe('ChangeManagementView', () => {
  it('shows author and time for both chat and editor versions', () => {
    renderView(vi.fn(), [chatVersion])

    expect(screen.getAllByText('孙思媛')).toHaveLength(3)
    expect(screen.getByText('V1')).toBeInTheDocument()
    expect(screen.getByText('V2')).toBeInTheDocument()
    expect(screen.getByText('创建于 14:20')).toBeInTheDocument()
    expect(screen.getByText('保存于 14:15')).toBeInTheDocument()
    expect(screen.getByText('保存于 21:41')).toBeInTheDocument()
  })

  it('defaults to editor versions and keeps restore out of the card body', async () => {
    const user = userEvent.setup()
    const { onRestoreEditorVersion } = renderView()

    expect(screen.getByText('当前编辑器内容')).toBeInTheDocument()
    expect(screen.getByText('优化首屏布局')).toBeInTheDocument()

    await user.click(screen.getByText('优化首屏布局'))

    expect(onRestoreEditorVersion).not.toHaveBeenCalled()
  })

  it('restores a historical editor version only from its menu command', async () => {
    const user = userEvent.setup()
    const { onRestoreEditorVersion } = renderView()

    await user.click(screen.getByLabelText('管理草稿：优化首屏布局'))
    const restore = screen.getByRole('button', { name: '回到该版本' })
    expect(restore).toBeInTheDocument()

    await user.click(restore)

    expect(onRestoreEditorVersion).toHaveBeenCalledTimes(1)
    expect(onRestoreEditorVersion).toHaveBeenCalledWith('draft-v4')
    expect(
      screen.queryByRole('button', { name: '回到该版本' }),
    ).not.toBeInTheDocument()
  })

  it('does not offer restore for the current editor version', async () => {
    const user = userEvent.setup()
    renderView()

    await user.click(screen.getByLabelText('管理草稿：当前编辑器内容'))

    expect(
      screen.queryByRole('button', { name: '回到该版本' }),
    ).not.toBeInTheDocument()
  })

  it('restores a historical chat version from its menu command', async () => {
    const user = userEvent.setup()
    const onRestoreChatVersion = vi.fn()
    renderView(
      vi.fn(),
      [chatVersion, historicalChatVersion],
      onRestoreChatVersion,
    )

    await user.click(screen.getByLabelText('管理对话版本：对话版本 0'))
    await user.click(screen.getByRole('button', { name: '回到该对话版本' }))

    expect(onRestoreChatVersion).toHaveBeenCalledTimes(1)
    expect(onRestoreChatVersion).toHaveBeenCalledWith('s-old')
  })

  it('marks the current chat version restore action as unavailable', async () => {
    const user = userEvent.setup()
    renderView(vi.fn(), [chatVersion])

    await user.click(screen.getByLabelText('管理对话版本：对话版本 1'))

    expect(screen.getByRole('button', { name: '当前对话版本' })).toBeDisabled()
  })

  it('closes a version menu after clicking outside it', async () => {
    const user = userEvent.setup()
    renderView(vi.fn(), [chatVersion])

    await user.click(screen.getByLabelText('管理对话版本：对话版本 1'))
    expect(
      screen.getByRole('button', { name: '当前对话版本' }),
    ).toBeInTheDocument()

    await user.click(document.body)

    expect(
      screen.queryByRole('button', { name: '当前对话版本' }),
    ).not.toBeInTheDocument()
  })

  it('marks a requested source version as selected', () => {
    renderView(vi.fn(), [], vi.fn(), 'draft-v4')

    expect(
      screen
        .getByText('优化首屏布局')
        .closest('[data-change-version-id="draft-v4"]'),
    ).toHaveAttribute('aria-current', 'true')
  })
})

describe('ReleaseManagementView', () => {
  it('opens the source version from a published record', async () => {
    const user = userEvent.setup()
    const onViewSourceVersion = vi.fn()
    const publishedVersion: PublishedVersion = {
      id: 'published-1',
      pageId: 'home',
      sourceVersionId: 'draft-v4',
      label: '优化首屏布局',
      author,
      createdAt: new Date('2026-09-29T15:00:00').getTime(),
      current: true,
    }

    render(
      <ReleaseManagementView
        projectName="冬日召集令 · 复刻"
        configuration={<div>发布配置内容</div>}
        pages={[{ id: 'home', label: '首页' }]}
        versions={[publishedVersion]}
        onViewSourceVersion={onViewSourceVersion}
      />,
    )

    await user.click(screen.getByRole('tab', { name: '发布历史' }))
    await user.click(screen.getByRole('button', { name: '查看变更' }))

    expect(onViewSourceVersion).toHaveBeenCalledWith('draft-v4')
  })
})

describe('matchesDateRange', () => {
  it('includes the full start and end dates', () => {
    expect(
      matchesDateRange(
        new Date('2026-09-28T00:00:00').getTime(),
        '2026-09-28',
        '2026-09-28',
      ),
    ).toBe(true)
    expect(
      matchesDateRange(
        new Date('2026-09-28T23:59:59.999').getTime(),
        '2026-09-28',
        '2026-09-28',
      ),
    ).toBe(true)
    expect(
      matchesDateRange(
        new Date('2026-09-29T00:00:00').getTime(),
        '2026-09-28',
        '2026-09-28',
      ),
    ).toBe(false)
  })
})
