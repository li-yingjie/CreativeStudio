import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import {
  Button,
  Card,
  Dropdown,
  IconButton,
  Input,
  Modal,
  Select,
  Tag,
  TextArea,
  Timeline,
} from '@douyinfe/semi-ui'
import {
  Copy,
  GitBranch,
  History,
  MoreHorizontal,
  Palette,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from '@/shared/icons'
import { matchesDateRange } from './change-management-utils'
import '@douyinfe/semi-ui/dist/css/semi.min.css'

export interface ChangeChatVersion {
  id: string
  title: string
  summary: string
  author: VersionAuthor
  createdAt: number
  current?: boolean
}

export interface ChangeEditorVersion {
  id: string
  versionNumber: number
  label: string
  description?: string
  author: VersionAuthor
  createdAt: number
  pageIds?: string[]
}

export interface VersionAuthor {
  name: string
  avatarUrl: string
}

interface Props {
  projectName: string
  pages: { id: string; label: string }[]
  chatVersions: ChangeChatVersion[]
  editorVersions: ChangeEditorVersion[]
  currentEditorVersion: ChangeEditorVersion
  pendingEditorChanges: number
  selectedVersionId?: string | null
  selectionRequest?: number
  onRestoreChatVersion: (id: string) => void
  onRestoreEditorVersion: (id: string) => void
  onUpdateDraftVersion: (
    id: string,
    patch: { label: string; description: string },
  ) => void
  onEditDraftVersion: (id: string) => void
  onDeleteDraftVersion: (id: string) => void
}

function formatTime(value: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value)
}

function dateLabel(value: number) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('zh-CN', {
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function matchesQuery(query: string, ...values: (string | undefined)[]) {
  const normalized = query.trim().toLocaleLowerCase('zh-CN')
  return (
    !normalized ||
    values.some((value) =>
      value?.toLocaleLowerCase('zh-CN').includes(normalized),
    )
  )
}

async function writeClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    return copied
  }
}

function AuthorMeta({
  author,
  action,
  createdAt,
}: {
  author: VersionAuthor
  action: '创建' | '保存' | '发布'
  createdAt: number
}) {
  return (
    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10.5px] text-[var(--color-ink)]/42">
      <img
        src={author.avatarUrl}
        alt=""
        className="size-[18px] min-w-[18px] shrink-0 rounded-full border border-[var(--color-ink)]/8 object-cover"
      />
      <span className="max-w-[120px] truncate text-[var(--color-ink)]/58">
        {author.name}
      </span>
      <span className="shrink-0">
        {action}于 {formatTime(createdAt)}
      </span>
    </div>
  )
}

function EditedPages({
  versionNumber,
  pageIds,
  pages,
}: {
  versionNumber: number
  pageIds?: string[]
  pages: { id: string; label: string }[]
}) {
  if (!pageIds?.length) {
    return (
      <div className="mt-2 flex items-center gap-2 text-[10.5px] text-[var(--color-ink)]/35">
        <span className="shrink-0 rounded border border-[var(--divider)] bg-white px-1.5 py-0.5 font-medium text-[var(--color-ink)]/70">
          V{versionNumber}
        </span>
        <span>Workspace 全局变更</span>
      </div>
    )
  }
  const pageMap = new Map(pages.map((page) => [page.id, page.label]))
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <span className="shrink-0 rounded border border-[var(--divider)] bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--color-ink)]/70">
        V{versionNumber}
      </span>
      {pageIds.map((pageId) => (
        <Tag
          key={pageId}
          size="small"
          color="grey"
          type="light"
          className="max-w-[220px]"
        >
          <span className="truncate">{pageMap.get(pageId) ?? '页面'}</span>
          <span className="ml-1 shrink-0 font-mono opacity-55">{pageId}</span>
        </Tag>
      ))}
    </div>
  )
}

function VersionInfoDialog({
  version,
  onClose,
  onSave,
}: {
  version: ChangeEditorVersion
  onClose: () => void
  onSave: (label: string, description: string) => void
}) {
  const [label, setLabel] = useState(version.label)
  const [description, setDescription] = useState(version.description ?? '')

  return (
    <Modal
      visible
      title="草稿信息"
      onCancel={onClose}
      width={520}
      footer={
        <>
          <Button theme="light" type="tertiary" onClick={onClose}>
            取消
          </Button>
          <Button
            theme="solid"
            type="primary"
            disabled={!label.trim()}
            onClick={() => onSave(label.trim(), description.trim())}
          >
            保存
          </Button>
        </>
      }
    >
      <div className="text-[#1c1f23]">
        <label className="mt-6 block">
          <span className="text-[13px] font-semibold">草稿名称</span>
          <Input
            autoFocus
            value={label}
            maxLength={50}
            onChange={setLabel}
            className="mt-2 w-full"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-[13px] font-semibold">
            草稿描述
            <span className="ml-1 font-normal text-[#1c1f23]/40">（选填）</span>
          </span>
          <TextArea
            value={description}
            maxLength={200}
            autosize={{ minRows: 4, maxRows: 4 }}
            onChange={setDescription}
            className="mt-2 w-full"
          />
          <span className="mt-1 block text-right text-[10px] text-[#1c1f23]/32">
            {description.length}/200
          </span>
        </label>
      </div>
    </Modal>
  )
}

function DeleteDraftDialog({
  version,
  onClose,
  onConfirm,
}: {
  version: ChangeEditorVersion
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      visible
      title="删除草稿？"
      onCancel={onClose}
      width={420}
      footer={
        <>
          <Button theme="light" type="tertiary" onClick={onClose}>
            取消
          </Button>
          <Button theme="solid" type="danger" onClick={onConfirm}>
            删除
          </Button>
        </>
      }
    >
      <p className="text-[12px] leading-5 text-[#1c1f23]/52">
        「{version.label}」删除后无法从版本管理中恢复。
      </p>
    </Modal>
  )
}

export default function ChangeManagementView({
  projectName,
  pages,
  chatVersions,
  editorVersions,
  currentEditorVersion,
  pendingEditorChanges,
  selectedVersionId,
  selectionRequest,
  onRestoreChatVersion,
  onRestoreEditorVersion,
  onUpdateDraftVersion,
  onEditDraftVersion,
  onDeleteDraftVersion,
}: Props) {
  const [tab, setTab] = useState<'all' | 'chat' | 'editor'>('all')
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [infoTarget, setInfoTarget] = useState<ChangeEditorVersion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ChangeEditorVersion | null>(
    null,
  )

  useEffect(() => {
    if (!selectedVersionId) return
    let scrollFrame = 0
    const resetFrame = requestAnimationFrame(() => {
      setTab('all')
      setQuery('')
      setStartDate('')
      setEndDate('')
      setOpenMenu(null)
      scrollFrame = requestAnimationFrame(() => {
        const target = [
          ...document.querySelectorAll<HTMLElement>(
            '[data-change-version-id]',
          ),
        ].find(
          (element) =>
            element.dataset.changeVersionId === selectedVersionId,
        )
        target?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      })
    })
    return () => {
      cancelAnimationFrame(resetFrame)
      cancelAnimationFrame(scrollFrame)
    }
  }, [selectedVersionId, selectionRequest])

  useEffect(() => {
    if (!openMenu) return
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (
        target?.closest('[data-change-menu-trigger], .change-version-menu')
      ) {
        return
      }
      setOpenMenu(null)
    }
    document.addEventListener('pointerdown', closeOutside, true)
    document.addEventListener('click', closeOutside, true)
    return () => {
      document.removeEventListener('pointerdown', closeOutside, true)
      document.removeEventListener('click', closeOutside, true)
    }
  }, [openMenu])

  const toggleMenu = (
    menuId: string,
    event: MouseEvent<HTMLButtonElement>,
    menuHeight: number,
  ) => {
    if (openMenu === menuId) {
      setOpenMenu(null)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const menuWidth = 176
    const top =
      rect.bottom + 4 + menuHeight <= window.innerHeight - 8
        ? rect.bottom + 4
        : Math.max(8, rect.top - menuHeight - 4)
    setMenuPosition({
      top,
      left: Math.max(
        8,
        Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth),
      ),
    })
    setOpenMenu(menuId)
  }

  const filteredChats = useMemo(
    () =>
      [...chatVersions]
        .filter(
          (version) =>
            matchesQuery(
              query,
              version.title,
              version.summary,
              version.author.name,
              version.id,
            ) && matchesDateRange(version.createdAt, startDate, endDate),
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [chatVersions, endDate, query, startDate],
  )
  const filteredEditors = useMemo(
    () =>
      [...editorVersions]
        .filter(
          (version) =>
            matchesQuery(
              query,
              version.label,
              version.description,
              `V${version.versionNumber}`,
            ) &&
            matchesDateRange(version.createdAt, startDate, endDate),
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [editorVersions, endDate, query, startDate],
  )
  const currentEditorVisible =
    matchesQuery(
      query,
      currentEditorVersion.label,
      currentEditorVersion.description,
      `V${currentEditorVersion.versionNumber}`,
    ) && matchesDateRange(currentEditorVersion.createdAt, startDate, endDate)
  const visibleTimes = [
    ...(tab !== 'editor'
      ? filteredChats.map((version) => version.createdAt)
      : []),
    ...(tab !== 'chat' && currentEditorVisible
      ? [currentEditorVersion.createdAt]
      : []),
    ...(tab !== 'chat'
      ? filteredEditors.map((version) => version.createdAt)
      : []),
  ]
  const dateGroups = [
    ...new Set(visibleTimes.sort((a, b) => b - a).map(dateLabel)),
  ]

  const copyDraftId = async (id: string) => {
    if (await writeClipboard(id)) {
      toast.success('草稿 ID 已复制')
    } else {
      toast.error('复制失败，请重试')
    }
    setOpenMenu(null)
  }

  const openEditor = (version: ChangeEditorVersion) => {
    setOpenMenu(null)
    onEditDraftVersion(version.id)
  }

  const chatMenu = (version: ChangeChatVersion) => {
    const menuId = `chat:${version.id}`
    return (
      <div data-change-menu-trigger>
        <IconButton
          aria-label={`管理对话版本：${version.title}`}
          aria-expanded={openMenu === menuId}
          onClick={(event) => toggleMenu(menuId, event, 56)}
          icon={<MoreHorizontal size={15} strokeWidth={1.8} />}
          size="small"
          theme="borderless"
        />
        {openMenu === menuId &&
          createPortal(
            <div
              className="change-version-menu ai-dropdown fixed z-[9999] min-w-[176px] overflow-hidden rounded-[8px] border border-black/[0.08] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
              style={menuPosition}
            >
              <Dropdown.Menu>
                <Dropdown.Item
                  disabled={version.current}
                  icon={<RotateCcw size={13} strokeWidth={1.8} />}
                  onClick={() => {
                    if (version.current) return
                    setOpenMenu(null)
                    onRestoreChatVersion(version.id)
                  }}
                >
                  {version.current ? '当前对话版本' : '回到该对话版本'}
                </Dropdown.Item>
              </Dropdown.Menu>
            </div>,
            document.body,
          )}
      </div>
    )
  }

  const menu = (version: ChangeEditorVersion, current = false) => {
    const menuId = `draft:${version.id}`
    return (
      <div data-change-menu-trigger>
        <IconButton
          aria-label={`管理草稿：${version.label}`}
          aria-expanded={openMenu === menuId}
          onClick={(event) => toggleMenu(menuId, event, current ? 184 : 228)}
          icon={<MoreHorizontal size={15} strokeWidth={1.8} />}
          size="small"
          theme="borderless"
        />
        {openMenu === menuId &&
          createPortal(
            <div
              className="change-version-menu ai-dropdown fixed z-[9999] min-w-[176px] overflow-hidden rounded-[8px] border border-black/[0.08] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
              style={menuPosition}
            >
              <Dropdown.Menu>
                {!current && (
                  <Dropdown.Item
                    icon={<RotateCcw size={13} strokeWidth={1.8} />}
                    onClick={() => {
                      setOpenMenu(null)
                      onRestoreEditorVersion(version.id)
                    }}
                  >
                    回到该版本
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  icon={<Pencil size={13} strokeWidth={1.8} />}
                  onClick={() => {
                    setOpenMenu(null)
                    setInfoTarget(version)
                  }}
                >
                  修改草稿信息
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<Palette size={13} strokeWidth={1.8} />}
                  onClick={() => openEditor(version)}
                >
                  {current ? '继续编辑草稿' : '编辑此草稿'}
                </Dropdown.Item>
                <Dropdown.Item
                  type="danger"
                  icon={<Trash2 size={13} strokeWidth={1.8} />}
                  onClick={() => {
                    setOpenMenu(null)
                    setDeleteTarget(version)
                  }}
                >
                  删除草稿
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<Copy size={13} strokeWidth={1.8} />}
                  onClick={() => void copyDraftId(version.id)}
                >
                  获取草稿 ID
                </Dropdown.Item>
              </Dropdown.Menu>
            </div>,
            document.body,
          )}
      </div>
    )
  }

  return (
    <section
      className="@container flex min-h-0 flex-1 flex-col bg-white"
      aria-label="变更管理"
    >
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="mx-auto w-full max-w-[980px]">
          <div className="mb-5 flex min-w-0 items-center gap-2">
            <History
              size={17}
              strokeWidth={1.8}
              className="text-[var(--color-ink)]/65"
            />
            <h1 className="text-[16px] font-semibold text-[var(--color-ink)]">
              变更记录
            </h1>
            <span className="truncate text-[11px] text-[var(--color-ink)]/35">
              {projectName}
            </span>
          </div>

          <div
            key={`${selectedVersionId ?? 'none'}:${selectionRequest ?? 0}`}
            className="change-history-search-form mb-6 flex flex-wrap items-center gap-2"
          >
            <Input
              aria-label="搜索变更"
              prefix={<Search size={14} strokeWidth={1.8} />}
              showClear
              value={query}
              placeholder="搜索版本"
              onChange={setQuery}
              className="min-w-[180px] flex-1"
            />
            <input
              aria-label="开始日期"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-8 rounded border border-[var(--divider)] bg-white px-2 text-[12px] text-[var(--color-ink)]"
            />
            <input
              aria-label="结束日期"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-8 rounded border border-[var(--divider)] bg-white px-2 text-[12px] text-[var(--color-ink)]"
            />
            <Select
              aria-label="变更类型"
              value={tab}
              onChange={(value) =>
                setTab(String(value) as 'all' | 'chat' | 'editor')
              }
              optionList={[
                { value: 'all', label: '全部变更类型' },
                { value: 'editor', label: '编辑器内容' },
                { value: 'chat', label: '对话流版本' },
              ]}
              className="w-[140px]"
            />
          </div>

          {dateGroups.length === 0 ? (
            <div className="border-t border-[var(--divider-soft)] py-16 text-center text-[12px] text-[var(--color-ink)]/38">
              没有匹配的版本
            </div>
          ) : (
            <Timeline className="change-history-timeline">
              {dateGroups.map((group) => (
                <Timeline.Item key={group}>
                  <h2 className="change-history-date">{group}</h2>

                  <div className="flex min-w-0 flex-col gap-2">
                    {tab !== 'editor' &&
                      filteredChats
                        .filter(
                          (version) => dateLabel(version.createdAt) === group,
                        )
                        .map((version) => (
                          <Card
                            key={version.id}
                            data-change-version-id={version.id}
                            aria-current={
                              selectedVersionId === version.id
                                ? 'true'
                                : undefined
                            }
                            bodyStyle={{ padding: '14px 16px' }}
                            className={`change-history-card ${
                              selectedVersionId === version.id
                                ? 'change-history-card-selected'
                                : ''
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <GitBranch
                                size={15}
                                strokeWidth={1.8}
                                className="mt-0.5 shrink-0 text-[var(--color-ink)]/40"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-[13px] font-semibold text-[var(--color-ink)]/82">
                                    {version.title}
                                  </span>
                                  {version.current && (
                                    <Tag size="small" color="grey" type="light">
                                      当前对话
                                    </Tag>
                                  )}
                                </div>
                                <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-[var(--color-ink)]/50">
                                  {version.summary}
                                </p>
                                <AuthorMeta
                                  author={version.author}
                                  action="创建"
                                  createdAt={version.createdAt}
                                />
                              </div>
                              {chatMenu(version)}
                            </div>
                          </Card>
                        ))}

                    {tab !== 'chat' &&
                      currentEditorVisible &&
                      dateLabel(currentEditorVersion.createdAt) === group && (
                        <Card
                          data-change-version-id={currentEditorVersion.id}
                          aria-current={
                            selectedVersionId === currentEditorVersion.id
                              ? 'true'
                              : undefined
                          }
                          bodyStyle={{ padding: '14px 16px' }}
                          className={`change-history-card change-history-card-current ${
                            selectedVersionId === currentEditorVersion.id
                              ? 'change-history-card-selected'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <Palette
                              size={15}
                              strokeWidth={1.8}
                              className="mt-0.5 shrink-0 text-[var(--color-ink)]/55"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-[13px] font-semibold text-[var(--color-ink)]/82">
                                  {currentEditorVersion.label}
                                </span>
                                <Tag size="small" color="grey" type="light">
                                  当前编辑器
                                </Tag>
                                <Tag size="small" color="grey" type="light">
                                  草稿
                                </Tag>
                                {pendingEditorChanges > 0 && (
                                  <span className="shrink-0 text-[10.5px] text-[var(--color-ink)]/42">
                                    {pendingEditorChanges} 项待应用
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-[var(--color-ink)]/48">
                                {currentEditorVersion.description ||
                                  '当前工作区中的编辑内容'}
                              </p>
                              <EditedPages
                                versionNumber={
                                  currentEditorVersion.versionNumber
                                }
                                pageIds={currentEditorVersion.pageIds}
                                pages={pages}
                              />
                              <AuthorMeta
                                author={currentEditorVersion.author}
                                action="保存"
                                createdAt={currentEditorVersion.createdAt}
                              />
                            </div>
                            {menu(currentEditorVersion, true)}
                          </div>
                        </Card>
                      )}

                    {tab !== 'chat' &&
                      filteredEditors
                        .filter(
                          (version) => dateLabel(version.createdAt) === group,
                        )
                        .map((version) => (
                          <Card
                            key={version.id}
                            data-change-version-id={version.id}
                            aria-current={
                              selectedVersionId === version.id
                                ? 'true'
                                : undefined
                            }
                            bodyStyle={{ padding: '14px 16px' }}
                            className={`change-history-card ${
                              selectedVersionId === version.id
                                ? 'change-history-card-selected'
                                : ''
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <History
                                size={15}
                                strokeWidth={1.8}
                                className="mt-0.5 shrink-0 text-[var(--color-ink)]/40"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-[13px] font-medium text-[var(--color-ink)]/78">
                                    {version.label}
                                  </span>
                                  <Tag size="small" color="grey" type="light">
                                    草稿
                                  </Tag>
                                </div>
                                <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-[var(--color-ink)]/45">
                                  {version.description ||
                                    '自动保存的编辑器快照'}
                                </p>
                                <EditedPages
                                  versionNumber={version.versionNumber}
                                  pageIds={version.pageIds}
                                  pages={pages}
                                />
                                <AuthorMeta
                                  author={version.author}
                                  action="保存"
                                  createdAt={version.createdAt}
                                />
                              </div>
                              {menu(version)}
                            </div>
                          </Card>
                        ))}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </div>
      </div>

      {infoTarget && (
        <VersionInfoDialog
          version={infoTarget}
          onClose={() => setInfoTarget(null)}
          onSave={(label, description) => {
            onUpdateDraftVersion(infoTarget.id, { label, description })
            toast.success('草稿信息已更新')
            setInfoTarget(null)
          }}
        />
      )}
      {deleteTarget && (
        <DeleteDraftDialog
          version={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            onDeleteDraftVersion(deleteTarget.id)
            setDeleteTarget(null)
          }}
        />
      )}
    </section>
  )
}
