import type { WorkItem } from './api'

/** '2025-05-05[ HH:MM]' → '2025年05月05日 00:01'。没带时间时由 id
 *  稳定派生一个演示值。 */
export function fmtWorkDate(w: WorkItem): string {
  const [datePart, timePart] = w.publishedAt.split(' ')
  const [y, mo, d] = datePart.split('-')
  let time = timePart
  if (!time) {
    let h = 0
    for (const ch of w.id) h = (h * 31 + ch.charCodeAt(0)) % 1440
    time = `${String(Math.floor(h / 60)).padStart(2, '0')}:${String(h % 60).padStart(2, '0')}`
  }
  return `${y}年${mo}月${d}日 ${time}`
}
