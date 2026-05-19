export type IpKind = 'real' | 'virtual'

export interface IpProfile {
  kind: IpKind
  imageUrl?: string
  textPrompt?: string
  createdAt: number
  updatedAt: number
}

const KEY = 'ip-editor:ip-profile'

export function getIpProfile(): IpProfile | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as IpProfile
  } catch {
    return null
  }
}

export function saveIpProfile(
  input: Pick<IpProfile, 'kind' | 'imageUrl' | 'textPrompt'>
): IpProfile {
  const now = Date.now()
  const existing = getIpProfile()
  const next: IpProfile = {
    ...input,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage disabled */
  }
  return next
}

export function clearIpProfile() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* storage disabled */
  }
}

export function hasIpProfile(): boolean {
  return !!getIpProfile()
}
