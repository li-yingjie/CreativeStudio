import type { ProjectKind } from './ProjectProductView'

/** Lightweight fallback used before the backend intent classifier returns. */
export function classifyProjectKind(prompt: string): ProjectKind {
  const normalized = prompt.toLowerCase()
  if (/(分身|avatar|persona|chat[-\s]?bot)/i.test(normalized)) return 'ai-avatar'
  if (/(网页\s*游戏|web[-\s]?(game|gaming)|html5\s*游戏|h5\s*游戏|浏览器\s*游戏)/i.test(normalized)) {
    return 'web-game'
  }
  if (
    /(营销\s*h5|活动\s*h5|h5\s*(活动|页面|落地页)|营销活动|互动活动|活动落地页)/i.test(normalized)
  ) {
    return 'marketing-h5'
  }
  if (/(小游戏|做.{0,8}游戏|开发.{0,8}游戏|\bgame\b)/i.test(normalized)) return 'web-game'
  if (/(网站|网页|官网|website|web[-\s]?(site|app)|web\s*端|\bweb\b)/i.test(normalized)) {
    return 'web-app'
  }
  if (/(小程序|mini[-\s]?program|\bapp\b)/i.test(normalized)) return 'mini-program'
  if (/(方案|提案|报告|brief|看板|复盘|分析|策略|种草|投放)/i.test(normalized)) {
    return 'ops-proposal'
  }
  return 'mini-program'
}
