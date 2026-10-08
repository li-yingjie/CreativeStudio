import { describe, expect, it, vi } from 'vitest'
import {
  applyH5LabBoard,
  applyH5LabInsertedElements,
  h5LabKindOf,
  h5LabLabelOf,
  h5LabPathOf,
} from '@/modules/vibecoding/components/h5-lab/h5-lab-overrides'

describe('H5 Lab video overrides', () => {
  it('classifies and labels video nodes', () => {
    const video = document.createElement('video')
    video.title = '结果生成动画'

    expect(h5LabKindOf(video)).toBe('video')
    expect(h5LabLabelOf(video)).toBe('结果生成动画')
  })

  it('writes src overrides back to the video element', () => {
    const root = document.createElement('div')
    const video = document.createElement('video')
    video.className = 'result-loading-video'
    video.src = '/before.mp4'
    root.appendChild(video)
    const path = h5LabPathOf(root, video)
    const load = vi
      .spyOn(HTMLMediaElement.prototype, 'load')
      .mockImplementation(() => undefined)

    expect(path).toBe('video.result-loading-video')
    applyH5LabBoard(root, {
      [path as string]: { src: '/after.mp4' },
    })

    expect(video.getAttribute('src')).toBe('/after.mp4')
    expect(load).toHaveBeenCalledOnce()
    load.mockRestore()
  })

  it('keeps inserted elements out of the page document flow', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)

    applyH5LabInsertedElements(root, [
      {
        id: 'heading-1',
        caseId: 'winter',
        stateId: 'default',
        parentPath: '',
        kind: 'heading',
        label: '标题',
        html: '<h2>标题文本</h2>',
      },
    ])

    const inserted = root.querySelector<HTMLElement>('[data-h5-inserted="heading-1"]')
    expect(inserted?.style.position).toBe('absolute')
    expect(inserted?.style.display).toBe('flow-root')
    expect(inserted?.dataset.h5FreePosition).toBe('true')

    applyH5LabInsertedElements(root, [])
    expect(root.querySelector('[data-h5-inserted]')).toBeNull()
    root.remove()
  })
})
