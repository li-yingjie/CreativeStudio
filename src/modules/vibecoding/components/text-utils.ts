/** Truncate a string with an ellipsis at the given character length. */
export function truncate(s: string, max = 56): string {
  if (s.length <= max) return s
  return `${s.slice(0, max)}…`
}
