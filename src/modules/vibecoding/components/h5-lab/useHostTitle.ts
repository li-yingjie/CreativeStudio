import { useEffect } from 'react'

/** case 页面本来是独立路由页，挂载时会把 `document.title` 改成自己的标题。
 *  它们又是懒加载的，一次性还原赶不上，所以在预览 / 编辑期间盯着 <title>
 *  把工坊的标题守回来。
 *
 *  标题在模块求值时抓：这个模块由画布和预览静态引入，而 case 页面是
 *  `React.lazy` 的，一定晚于这一行加载，所以这时拿到的还是工坊的标题。 */
const HOST_TITLE = typeof document === 'undefined' ? '' : document.title

export function useHostTitle() {
  useEffect(() => {
    if (!HOST_TITLE) return
    const restore = () => {
      if (document.title !== HOST_TITLE) document.title = HOST_TITLE
    }
    restore()
    const observer = new MutationObserver(restore)
    const titleEl = document.querySelector('title')
    if (titleEl) {
      observer.observe(titleEl, { childList: true, characterData: true, subtree: true })
    }
    observer.observe(document.head, { childList: true })
    return () => observer.disconnect()
  }, [])
}
