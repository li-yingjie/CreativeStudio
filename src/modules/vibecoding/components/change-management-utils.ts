export function matchesDateRange(
  value: number,
  startDate: string,
  endDate: string,
) {
  const timestamp = new Date(value).getTime()
  const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null
  const end = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null
  return (
    (start === null || timestamp >= start) &&
    (end === null || timestamp <= end)
  )
}
