import { useState, type ReactNode } from 'react'
import { ProductToolbar } from './Toolbar'

type ProjectInfoSection = 'basic' | 'flow' | 'document'

/** 基础信息与项目文档共用一个产品对象，避免在项目树里重复占位。 */
export default function ProjectInfoView({
  basicInfo,
  coreFlow,
  documentContent,
}: {
  basicInfo: ReactNode
  coreFlow?: ReactNode
  documentContent: ReactNode
}) {
  const [section, setSection] = useState<ProjectInfoSection>(coreFlow ? 'flow' : 'basic')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ProductToolbar
        tabs={
          <div className="flex items-center gap-1" role="group" aria-label="基础信息内容">
            <button
              type="button"
              aria-pressed={section === 'basic'}
              onClick={() => setSection('basic')}
              className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-subtle)] hover:text-[var(--color-ink)]/80 aria-pressed:bg-[var(--color-ink)]/[0.07] aria-pressed:text-[var(--color-ink)]/90"
            >
              基础信息
            </button>
            {coreFlow ? (
              <button
                type="button"
                aria-pressed={section === 'flow'}
                onClick={() => setSection('flow')}
                className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-subtle)] hover:text-[var(--color-ink)]/80 aria-pressed:bg-[var(--color-ink)]/[0.07] aria-pressed:text-[var(--color-ink)]/90"
              >
                活动主流程
              </button>
            ) : null}
            <button
              type="button"
              aria-pressed={section === 'document'}
              onClick={() => setSection('document')}
              className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-subtle)] hover:text-[var(--color-ink)]/80 aria-pressed:bg-[var(--color-ink)]/[0.07] aria-pressed:text-[var(--color-ink)]/90"
            >
              文档
            </button>
          </div>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {section === 'basic' ? basicInfo : section === 'flow' ? coreFlow : documentContent}
      </div>
    </div>
  )
}
