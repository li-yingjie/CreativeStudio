import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MarketingImageCanvasEditor from '@/modules/vibecoding/components/MarketingImageCanvasEditor'

class ResizeObserverMock {
  constructor(
    private readonly callback: ResizeObserverCallback,
  ) {}

  observe() {
    this.callback(
      [{ contentRect: { width: 800 } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    )
  }

  disconnect() {}
  unobserve() {}
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Marketing media canvas', () => {
  it('finishes loading after video metadata becomes available', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    const createElement = document.createElement.bind(document)
    let metadataProbe: HTMLVideoElement | null = null
    vi.spyOn(document, 'createElement').mockImplementation(
      ((tagName: string, options?: ElementCreationOptions) => {
        const element = createElement(tagName, options)
        if (tagName === 'video' && !metadataProbe) {
          metadataProbe = element as HTMLVideoElement
          Object.defineProperties(metadataProbe, {
            videoWidth: { value: 1920 },
            videoHeight: { value: 1080 },
          })
        }
        return element
      }) as typeof document.createElement,
    )

    render(
      <MarketingImageCanvasEditor
        groups={[
          {
            id: 'page-media',
            title: '页面素材',
            items: [
              {
                id: 'loading-video',
                label: '识别视频',
                src: '/assets/climbing-cbti/videos/generating.mp4',
                kind: 'video',
              },
            ],
          },
        ]}
        focusSrc="/assets/climbing-cbti/videos/generating.mp4"
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('正在载入素材…')).toBeInTheDocument()
    fireEvent.loadedMetadata(metadataProbe as HTMLVideoElement)

    await waitFor(() => {
      expect(screen.queryByText('正在载入素材…')).not.toBeInTheDocument()
      expect(screen.getByLabelText('识别视频')).toBeInTheDocument()
    })
  })
})
