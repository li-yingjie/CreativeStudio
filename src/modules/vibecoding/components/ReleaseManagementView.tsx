import { useMemo, useState, type ReactNode } from 'react'
import {
  Button,
  Select,
  Tabs,
  Tag,
  Timeline,
} from '@douyinfe/semi-ui'
import {
  CheckCircle2,
  FileText,
} from '@/shared/icons'

export interface PublishedVersion {
  id: string
  pageId: string
  sourceVersionId: string
  label: string
  description?: string
  author: {
    name: string
    avatarUrl: string
  }
  createdAt: number
  current?: boolean
  channels?: string[]
}

interface Props {
  projectName: string
  configuration: ReactNode
  pages: { id: string; label: string }[]
  versions: PublishedVersion[]
  onViewSourceVersion: (sourceVersionId: string) => void
}

function formatTime(value: number) {
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export default function ReleaseManagementView({
  projectName,
  configuration,
  pages,
  versions,
  onViewSourceVersion,
}: Props) {
  const [tab, setTab] = useState<'config' | 'history'>('config')
  const [pageId, setPageId] = useState('all')
  const pageMap = useMemo(
    () => new Map(pages.map((page) => [page.id, page.label])),
    [pages],
  )
  const visibleVersions = useMemo(
    () =>
      [...versions]
        .filter((version) => pageId === 'all' || version.pageId === pageId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [pageId, versions],
  )
  return (
    <section className="@container flex min-h-0 flex-1 flex-col bg-white" aria-label="发布">
      <Tabs
        aria-label="发布内容"
        activeKey={tab}
        onChange={(key) => setTab(key as 'config' | 'history')}
        type="button"
        size="small"
        tabList={[
          { itemKey: 'config', tab: '发布配置' },
          { itemKey: 'history', tab: '发布历史' },
        ]}
        className="release-management-tabs h-12 shrink-0 border-b border-[var(--divider-soft)] px-5 pt-2"
      />

      {tab === 'config' ? (
        configuration
      ) : (
        <>
          {pages.length > 0 && (
            <header className="flex shrink-0 justify-end px-5 pt-4">
              <Select
                aria-label="按页面 ID 筛选"
                value={pageId}
                onChange={(value) => setPageId(String(value))}
                insetLabel="页面"
                optionList={[
                  { value: 'all', label: '全部页面' },
                  ...pages.map((page) => ({
                    value: page.id,
                    label: `${page.label} · ${page.id}`,
                  })),
                ]}
                className="release-page-select w-[260px] max-w-full @max-[420px]:w-full"
                dropdownClassName="release-page-select-dropdown"
                size="default"
              />
            </header>
          )}

          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-2 py-4">
            <div className="w-full">
              {visibleVersions.length === 0 ? (
                <div className="border-t border-[var(--divider-soft)] py-16 text-center text-[12px] text-[var(--color-ink)]/38">
                  该页面暂无发布记录
                </div>
              ) : (
                <Timeline
                  aria-label={`${projectName}的发布历史`}
                  className="release-version-timeline"
                >
                  {visibleVersions.map((version) => (
                    <Timeline.Item
                      key={version.id}
                      className={`release-version-timeline-item ${version.current ? 'release-version-current' : ''}`}
                    >
                      <article
                        className="min-w-0"
                      >
                        <div className="release-history-heading">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[14px] leading-6">
                            <span className="inline-flex min-w-0 items-center gap-2">
                              <img src={version.author.avatarUrl} alt="" className="size-6 shrink-0 rounded-full object-cover" />
                              <span className="max-w-[140px] truncate font-semibold text-[#1c1f23]" title={version.author.name}>{version.author.name}</span>
                            </span>
                            <span className="text-[#86898d]">发布于</span>
                            <time className="whitespace-nowrap tabular-nums text-[#86898d]" dateTime={new Date(version.createdAt).toISOString()}>{formatTime(version.createdAt)}</time>
                          </div>
                          <Button
                            onClick={() =>
                              onViewSourceVersion(version.sourceVersionId)
                            }
                            icon={<FileText size={14} strokeWidth={1.8} />}
                            theme="borderless"
                            type="tertiary"
                            size="small"
                            className="release-history-details"
                          >
                            查看变更
                          </Button>
                        </div>
                        <dl className="release-history-fields">
                          <dt>发布版本</dt>
                          <dd className="flex min-w-0 flex-wrap items-center gap-2" title={version.label}>
                            <Tag color={version.current ? 'green' : 'grey'} size="large" type="light" className="release-history-version-tag">
                              {version.label}{version.current ? ' · 当前线上版本' : ''}
                            </Tag>
                            {pageId === 'all' && <span className="truncate text-[11px] text-[#86898d]" title={version.pageId}>{pageMap.get(version.pageId) ?? '页面'}</span>}
                          </dd>
                          <dt>启用渠道</dt>
                          <dd className="flex min-w-0 flex-wrap gap-2">
                            {(version.channels ?? ['抖音AI工作台']).map((channel) => (
                              <span key={channel} className="release-history-channel">
                                <CheckCircle2 size={13} className="shrink-0 fill-[#36b34a] text-white" />
                                {channel}
                              </span>
                            ))}
                          </dd>
                        </dl>
                      </article>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
