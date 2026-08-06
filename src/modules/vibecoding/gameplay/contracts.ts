export type RegistryDomain = 'asset' | 'capability' | 'knowledge' | 'rule'

export type PatchActor = 'agent' | 'operator' | 'import'

export interface SemanticPatch<Path extends string, Value = unknown> {
  op: 'replace'
  path: Path
  value: Value
  actor: PatchActor
  reason?: string
  baseRevision: number
}

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue<Path extends string = string> {
  code: string
  path?: Path
  severity: ValidationSeverity
  message: string
}

export interface GameplayPackageManifest {
  id: string
  name: string
  version: string
  category: string
  owner: string
  compatibleSurfaces: readonly string[]
  runtimeAdapters: readonly string[]
  status: 'stable' | 'beta' | 'deprecated'
}

export interface GenerationReference {
  id: string
  name: string
  version: string
  domain: RegistryDomain
  kind: string
  role: string
  inheritedFrom: string
}

export interface FieldOwnership<Path extends string = string> {
  path: Path
  owner: 'agent' | 'operator' | 'import' | 'inherited'
  revision: number
}

export interface ActivityRevision<Path extends string = string> {
  revision: number
  source: string
  generatedAt: string
  generationBasis: readonly GenerationReference[]
  fieldOwnership: readonly FieldOwnership<Path>[]
}
