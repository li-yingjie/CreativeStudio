import { create } from 'zustand'

/**
 * Runtime (AI-generated) product configs, keyed by project name. These override
 * the static mock configs in the *ConfigData modules, so a config produced from
 * conversation renders live on the real framework — without editing the seeded
 * presets. Empty by default ⇒ the 5 seeded demos keep using their static config.
 */
interface RuntimeConfigState {
  /** projectName → kind-specific config object (AvatarAppConfig / … ). */
  configs: Record<string, unknown>
  setConfig: (projectName: string, config: unknown) => void
  clearConfig: (projectName: string) => void
}

export const useRuntimeConfigStore = create<RuntimeConfigState>((set) => ({
  configs: {},
  setConfig: (projectName, config) =>
    set((s) => ({ configs: { ...s.configs, [projectName]: config } })),
  clearConfig: (projectName) =>
    set((s) => {
      if (!(projectName in s.configs)) return s
      const next = { ...s.configs }
      delete next[projectName]
      return { configs: next }
    }),
}))

/** Imperative setter for non-React callers (generation pipeline). */
export function setRuntimeConfig(projectName: string, config: unknown): void {
  useRuntimeConfigStore.getState().setConfig(projectName, config)
}

/** Imperative read for non-React callers. */
export function getRuntimeConfig(projectName: string): unknown {
  return useRuntimeConfigStore.getState().configs[projectName]
}
