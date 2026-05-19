import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { KNOWLEDGE_LIBRARY } from '../data/knowledge-library'
import { SKILLS_LIBRARY } from '../data/skills-library'
import { getDefaultWorldForKind, getWorld } from '../data/worlds'
import type { IpKind } from '@/shared/storage/ip-profile'

/** A user-saved voice, captured from upload or record. Snapshots the tuning
 *  at save time so we can restore those signature params later. */
export interface CustomVoice {
  id: string
  label: string
  source: 'upload' | 'record'
  createdAt: number
  fileName?: string
  durationSec?: number
  pitch: number
  rate: number
  timbre: number
  intonation: number
  style: number
}

export type VoiceAge = 'child' | 'young' | 'middle' | 'old'
export type VoiceLanguage = 'zh' | 'en' | 'ja' | 'multi'
export type VoiceTrait = 'warm' | 'cool' | 'bright' | 'husky' | 'sweet' | 'magnetic'
export type VoiceEmotion = 'neutral' | 'angry' | 'cold' | 'happy' | 'hate' | 'sad'

export interface VoicePreset {
  id: string
  label: string
  /** Short human-readable description */
  hint: string
  /** Pitch 0.5 - 2 (1 = neutral) */
  pitch: number
  /** Rate 0.5 - 2 (1 = neutral) */
  rate: number
  /** 嗓音粗细 0..1 (0 = 细, 1 = 粗). Defaults to 0.5 when omitted. */
  timbre?: number
  /** 上下起伏 0..1 (0 = 平稳, 1 = 起伏). Defaults to 0.5 when omitted. */
  intonation?: number
  /** 说话方式 1..6. Defaults to 1 when omitted. */
  style?: number
  /** Preferred gender when picking a SpeechSynthesisVoice */
  gender: 'female' | 'male' | 'any'
  /** Rough age bucket for filtering. */
  age?: VoiceAge
  /** Preferred locale (zh-CN first, en fallback) */
  locale?: string
  language?: VoiceLanguage
  traits?: VoiceTrait[]
  /** Whether the preset advertises multi-emotion support. */
  multiEmotion?: boolean
  image?: string
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'straight-girl',
    label: '直爽女大',
    hint: '爽利 · 中性',
    pitch: 1.05, rate: 1.05, timbre: 0.45, intonation: 0.6, style: 2,
    gender: 'female', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['bright', 'cool'], multiEmotion: true,
  },
  {
    id: 'low-cannon',
    label: '低音炮',
    hint: '低沉 · 磁性',
    pitch: 0.7, rate: 0.9, timbre: 0.85, intonation: 0.3, style: 5,
    gender: 'male', age: 'middle', locale: 'zh-CN', language: 'zh',
    traits: ['magnetic', 'husky'], multiEmotion: true,
  },
  {
    id: 'brave-sister',
    label: '英气飒姐',
    hint: '洒脱 · 带劲',
    pitch: 1, rate: 1.1, timbre: 0.55, intonation: 0.7, style: 3,
    gender: 'female', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['cool', 'bright'], multiEmotion: true,
  },
  {
    id: 'sunny-boy',
    label: '阳光小男孩',
    hint: '清亮 · 活泼',
    pitch: 1.2, rate: 1.2, timbre: 0.3, intonation: 0.9, style: 2,
    gender: 'male', age: 'child', locale: 'zh-CN', language: 'zh',
    traits: ['bright'], multiEmotion: true,
  },
  {
    id: 'soft-girl',
    label: '温柔少女',
    hint: '偏高 · 轻快',
    pitch: 1.25, rate: 0.95, timbre: 0.3, intonation: 0.55, style: 1,
    gender: 'female', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['warm', 'sweet'], multiEmotion: true,
  },
  {
    id: 'charming-girl',
    label: '明媚女声',
    hint: '明亮 · 上扬',
    pitch: 1.18, rate: 1.05, timbre: 0.38, intonation: 0.75, style: 2,
    gender: 'female', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['bright', 'sweet'], multiEmotion: true,
  },
  {
    id: 'daiyu',
    label: '黛玉',
    hint: '含蓄 · 清冷',
    pitch: 1.1, rate: 0.85, timbre: 0.3, intonation: 0.4, style: 1,
    gender: 'female', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['cool', 'sweet'], multiEmotion: true,
  },
  {
    id: 'xinxin',
    label: '欣妹',
    hint: '亲切 · 自然',
    pitch: 1.08, rate: 1, timbre: 0.4, intonation: 0.55, style: 2,
    gender: 'female', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['warm', 'sweet'], multiEmotion: true,
  },
  {
    id: 'crayon-shin',
    label: '蜡笔小新',
    hint: '调皮 · 跳跃',
    pitch: 1.35, rate: 1.15, timbre: 0.35, intonation: 0.95, style: 2,
    gender: 'male', age: 'child', locale: 'zh-CN', language: 'zh',
    traits: ['bright'], multiEmotion: true,
  },
  {
    id: 'monkey-bro',
    label: '猴哥',
    hint: '洪亮 · 豪迈',
    pitch: 0.95, rate: 1.15, timbre: 0.7, intonation: 0.8, style: 3,
    gender: 'male', age: 'middle', locale: 'zh-CN', language: 'zh',
    traits: ['magnetic', 'bright'], multiEmotion: true,
  },
  {
    id: 'sticky-girl',
    label: '糯音女孩',
    hint: '软糯 · 粘',
    pitch: 1.3, rate: 0.9, timbre: 0.25, intonation: 0.5, style: 1,
    gender: 'female', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['warm', 'sweet'], multiEmotion: true,
  },
  {
    id: 'chubby-smart',
    label: '聪慧胖仔',
    hint: '憨厚 · 活',
    pitch: 0.9, rate: 1.05, timbre: 0.65, intonation: 0.6, style: 3,
    gender: 'male', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['warm'], multiEmotion: true,
  },
  {
    id: 'intellectual',
    label: '知性青年',
    hint: '平 · 稳',
    pitch: 0.9, rate: 1, timbre: 0.5, intonation: 0.4, style: 4,
    gender: 'male', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['magnetic'], multiEmotion: true,
  },
  {
    id: 'cool-girl',
    label: '冷静少女',
    hint: '偏低 · 稳',
    pitch: 0.95, rate: 0.9, timbre: 0.45, intonation: 0.2, style: 3,
    gender: 'female', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['cool'], multiEmotion: true,
  },
  {
    id: 'calm-uncle',
    label: '沉稳大叔',
    hint: '低 · 慢',
    pitch: 0.75, rate: 0.85, timbre: 0.8, intonation: 0.3, style: 5,
    gender: 'male', age: 'middle', locale: 'zh-CN', language: 'zh',
    traits: ['magnetic', 'husky'], multiEmotion: true,
  },
  {
    id: 'swift-guy',
    label: '爽快小哥',
    hint: '干脆 · 带劲',
    pitch: 1, rate: 1.15, timbre: 0.5, intonation: 0.7, style: 3,
    gender: 'male', age: 'young', locale: 'zh-CN', language: 'zh',
    traits: ['bright', 'cool'], multiEmotion: true,
  },
]

/** Freeform personality tag chips — user can toggle multiple */
export const PERSONALITY_TAGS = [
  '外向',
  '内向',
  '活泼',
  '冷静',
  '幽默',
  '严肃',
  '理性',
  '感性',
  '温柔',
  '倔强',
  '乐观',
  '神秘',
] as const

export type PersonalityTag = (typeof PERSONALITY_TAGS)[number]

/* ── MBTI ── */
export type MbtiAxis = 'IE' | 'SN' | 'TF' | 'JP'
export interface MbtiAxes {
  IE: 'I' | 'E'
  SN: 'S' | 'N'
  TF: 'T' | 'F'
  JP: 'J' | 'P'
}
export const MBTI_AXES: {
  key: MbtiAxis
  options: [string, string]
  hint: [string, string]
}[] = [
  { key: 'IE', options: ['I', 'E'], hint: ['内向', '外向'] },
  { key: 'SN', options: ['S', 'N'], hint: ['实感', '直觉'] },
  { key: 'TF', options: ['T', 'F'], hint: ['理性', '感性'] },
  { key: 'JP', options: ['J', 'P'], hint: ['判断', '感知'] },
]
export const MBTI_DESCRIPTIONS: Record<string, string> = {
  INTJ: '战略家 · 独立的远见者',
  INTP: '逻辑学家 · 创新的思考者',
  ENTJ: '指挥官 · 大胆果断的领袖',
  ENTP: '辩论家 · 机智多变的探索者',
  INFJ: '提倡者 · 安静神秘的理想主义者',
  INFP: '调停者 · 富有同情心的诗人',
  ENFJ: '主人公 · 鼓舞人心的引路人',
  ENFP: '竞选者 · 热情洋溢的自由灵魂',
  ISTJ: '物流师 · 务实可靠的实干家',
  ISFJ: '守卫者 · 温柔体贴的守护者',
  ESTJ: '总经理 · 出色的组织者',
  ESFJ: '执政官 · 受欢迎的支持者',
  ISTP: '鉴赏家 · 大胆实用的实验者',
  ISFP: '探险家 · 灵活迷人的艺术家',
  ESTP: '企业家 · 精力充沛的行动派',
  ESFP: '表演者 · 自发的娱乐者',
}
export function mbtiCode(m: MbtiAxes): string {
  return `${m.IE}${m.SN}${m.TF}${m.JP}`
}

/* ── Linked posts ── */
export interface PersonaPost {
  id: string
  title: string
  url: string
}

/* ── Knowledge / Skill / Worldview cards ── */
export interface KnowledgeCard {
  id: string
  title: string
  content: string
  tags?: string[]
  /** Which IP track this card belongs to — 'real' or 'virtual'. */
  kind: IpKind
}

export interface SkillCard {
  id: string
  title: string
  content: string
  tags?: string[]
  /** Which IP track this card belongs to — 'real' or 'virtual'. */
  kind: IpKind
}

const MAX_GALLERY = 4


interface PersonaState {
  name: string
  bio: string
  traits: string[]

  /** Notion-style persona doc — free-text per section. */
  roleDoc: string
  goalDoc: string
  taskDoc: string
  /** Response-tone guide — how this persona speaks. Bullet-style. Shows up
   *  as the 回复语气 section so the user has an obvious snippet to select
   *  when asking the chat to rewrite. */
  toneDoc: string
  /** Unified block-editor HTML for the persona composer.
   *  May contain inline `<span class="persona-tag" data-ref-id="..">` chips
   *  that reference installed knowledge / skill cards. */
  personaDoc: string

  mbti: MbtiAxes
  gallery: string[]
  posts: PersonaPost[]

  voicePresetId: string
  voicePitch: number
  voiceRate: number
  /** 嗓音粗细 — timbre thickness, 0..1. 0 = 细/clear, 1 = 粗/hoarse. */
  voiceTimbre: number
  /** 上下起伏 — intonation spread, 0..1. 0 = 平稳, 1 = 大起大落. */
  voiceIntonation: number
  /** 说话方式 1..6 — delivery style, analogous to Mii voice style. */
  voiceStyle: number
  /** 情绪 tag — affects which emotion is used when sampling. */
  voiceEmotion: VoiceEmotion
  /** User-saved voices from upload / record. `voicePresetId` may reference
   *  either a built-in `VOICE_PRESETS` id or a `customVoices[].id`. */
  customVoices: CustomVoice[]
  /** Ids (preset or custom) the user favorited. */
  voiceFavorites: string[]
  /** SpeechSynthesisVoice.voiceURI chosen when sampling (may be null if
   *  the browser hasn't populated voices yet). */
  voiceURI: string | null

  /** Live mouth-open weight (0..1). Driven by VoicePanel during playback. */
  mouthWeight: number

  gender: string
  race: string
  birthday: string

  /** Current portrait shown in AppearanceCard, chat preview, etc. */
  portraitUrl: string

  /** IDs of knowledge cards currently installed on this persona, referencing `KNOWLEDGE_LIBRARY`. */
  knowledgeIds: string[]
  /** IDs of skill cards currently installed, referencing `SKILLS_LIBRARY`. */
  skillIds: string[]
  worldview: string

  /** Currently selected world-setting (see `src/modules/editor/data/worlds.ts`). */
  currentWorldId: string

  /** How the gallery / album surfaces on the persona editor:
   *  - 'avatar': stacked behind the avatar with a hover popover
   *  - 'row':    a standalone card next to worldview / voice */
  albumLayout: 'avatar' | 'row'

  /** False until the user publishes for the first time. Drives the
   *  primary CTA in EditorShell between "发布" and "更新". */
  published: boolean
  markPublished: () => void

  installKnowledge: (id: string) => void
  uninstallKnowledge: (id: string) => void
  installSkill: (id: string) => void
  uninstallSkill: (id: string) => void
  setWorldview: (v: string) => void
  /** Bulk-apply a world preset — swaps persona identity, worldview, recommended knowledge/skills. */
  applyWorld: (worldId: string) => void
  /** Ensure the persona belongs to the given IP track (real/virtual). If the
   *  currently-applied world mismatches, reset to that track's default world. */
  syncKind: (kind: IpKind) => void

  setName: (name: string) => void
  setBio: (bio: string) => void
  setGender: (v: string) => void
  setRace: (v: string) => void
  setBirthday: (v: string) => void
  setPortraitUrl: (url: string) => void
  setRoleDoc: (v: string) => void
  setGoalDoc: (v: string) => void
  setTaskDoc: (v: string) => void
  setToneDoc: (v: string) => void
  setPersonaDoc: (v: string) => void
  toggleTrait: (t: string) => void
  addCustomTrait: (t: string) => void
  reorderTraits: (from: number, to: number) => void
  setMbtiAxis: <K extends MbtiAxis>(key: K, value: MbtiAxes[K]) => void
  addGalleryImage: (dataUrl: string) => void
  removeGalleryImage: (index: number) => void
  /** Overwrite the entire gallery list (capped at MAX_GALLERY). Used by the
   *  AI 补全其他视角 flow to drop in a curated set of views at once. */
  setGallery: (urls: string[]) => void
  setAlbumLayout: (layout: 'avatar' | 'row') => void
  addPost: (post: Omit<PersonaPost, 'id'>) => void
  removePost: (id: string) => void
  setVoicePreset: (id: string) => void
  setVoicePitch: (v: number) => void
  setVoiceRate: (v: number) => void
  setVoiceTimbre: (v: number) => void
  setVoiceIntonation: (v: number) => void
  setVoiceStyle: (n: number) => void
  setVoiceEmotion: (e: VoiceEmotion) => void
  toggleVoiceFavorite: (id: string) => void
  /** Save a new custom voice. Returns its generated id. Automatically
   *  activates it via `setVoicePreset`. */
  addCustomVoice: (
    input: Pick<CustomVoice, 'source' | 'fileName' | 'durationSec'> & {
      label?: string
    },
  ) => string
  removeCustomVoice: (id: string) => void
  setVoiceURI: (uri: string | null) => void
  setMouthWeight: (w: number) => void
}

const DEFAULT_PRESET =
  VOICE_PRESETS.find((p) => p.id === 'intellectual') ?? VOICE_PRESETS[0]

/** Escape raw persona-text before inserting it into contentEditable HTML. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Build the initial HTML body for the PersonaComposer from the three
 *  legacy prompt-engineering docs. Each section becomes a bold heading
 *  followed by one paragraph per non-empty line. */
function composePersonaDoc(
  roleDoc: string,
  goalDoc: string,
  taskDoc: string,
  toneDoc?: string,
): string {
  const section = (label: string, body: string): string => {
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean)
    const paras = lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('')
    return `<p><strong>${label}</strong></p>${paras}`
  }
  const parts = [
    section('角色', roleDoc),
    section('目标', goalDoc),
    section('任务', taskDoc),
  ]
  if (toneDoc && toneDoc.trim()) parts.push(section('回复语气', toneDoc))
  return parts.join('<p><br></p>')
}

/** Read the IP kind from localStorage synchronously so the store's initial
 *  persona matches what the user picked at onboarding on first load. */
function readInitialIpKind(): IpKind {
  if (typeof window === 'undefined') return 'virtual'
  try {
    const raw = window.localStorage.getItem('ip-editor:ip-profile')
    if (!raw) return 'virtual'
    const parsed = JSON.parse(raw) as { kind?: IpKind }
    return parsed.kind === 'real' ? 'real' : 'virtual'
  } catch {
    return 'virtual'
  }
}

const INITIAL_KIND = readInitialIpKind()
const DEFAULT_WORLD_FOR_KIND = getDefaultWorldForKind(INITIAL_KIND)
const DEFAULT_WORLD = getWorld(DEFAULT_WORLD_FOR_KIND)
const DEFAULT = DEFAULT_WORLD.defaults

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
  name: DEFAULT.name,
  bio: DEFAULT.bio,
  traits: [...DEFAULT.traits],

  gender: DEFAULT.gender,
  race: DEFAULT.race,
  birthday: DEFAULT.birthday,

  portraitUrl: DEFAULT.portraitUrl,

  roleDoc: DEFAULT.roleDoc,
  goalDoc: DEFAULT.goalDoc,
  taskDoc: DEFAULT.taskDoc,
  toneDoc: DEFAULT.toneDoc ?? '',
  personaDoc: composePersonaDoc(
    DEFAULT.roleDoc,
    DEFAULT.goalDoc,
    DEFAULT.taskDoc,
    DEFAULT.toneDoc,
  ),

  mbti: { ...DEFAULT.mbti },
  gallery: DEFAULT.gallery ? [...DEFAULT.gallery] : [],
  posts: [],

  voicePresetId: DEFAULT_PRESET.id,
  voicePitch: DEFAULT_PRESET.pitch,
  voiceRate: DEFAULT_PRESET.rate,
  voiceTimbre: 0.5,
  voiceIntonation: 0.5,
  voiceStyle: 1,
  voiceEmotion: 'neutral',
  customVoices: [],
  voiceFavorites: [],
  voiceURI: null,
  mouthWeight: 0,

  knowledgeIds: [...DEFAULT.knowledgeIds],
  skillIds: [...DEFAULT.skillIds],
  worldview: DEFAULT_WORLD.worldview,
  currentWorldId: DEFAULT_WORLD.id,

  albumLayout: 'row' as const,

  published: false,
  markPublished: () => set({ published: true }),

  installKnowledge: (id) =>
    set((s) => {
      if (s.knowledgeIds.includes(id)) return s
      if (!KNOWLEDGE_LIBRARY.some((k) => k.id === id)) return s
      return { knowledgeIds: [...s.knowledgeIds, id] }
    }),
  uninstallKnowledge: (id) =>
    set((s) => ({ knowledgeIds: s.knowledgeIds.filter((k) => k !== id) })),
  installSkill: (id) =>
    set((s) => {
      if (s.skillIds.includes(id)) return s
      if (!SKILLS_LIBRARY.some((k) => k.id === id)) return s
      return { skillIds: [...s.skillIds, id] }
    }),
  uninstallSkill: (id) =>
    set((s) => ({ skillIds: s.skillIds.filter((k) => k !== id) })),
  setWorldview: (v) => set({ worldview: v }),
  applyWorld: (worldId) => {
    const world = getWorld(worldId)
    const d = world.defaults
    const preset =
      VOICE_PRESETS.find((p) => p.id === d.voicePresetId) ?? null
    set({
      currentWorldId: world.id,
      worldview: world.worldview,
      name: d.name,
      bio: d.bio,
      gender: d.gender,
      race: d.race,
      birthday: d.birthday,
      portraitUrl: d.portraitUrl,
      gallery: d.gallery ? [...d.gallery] : [],
      traits: [...d.traits],
      mbti: { ...d.mbti },
      roleDoc: d.roleDoc,
      goalDoc: d.goalDoc,
      taskDoc: d.taskDoc,
      toneDoc: d.toneDoc ?? '',
      personaDoc: composePersonaDoc(d.roleDoc, d.goalDoc, d.taskDoc, d.toneDoc),
      knowledgeIds: [...d.knowledgeIds],
      skillIds: [...d.skillIds],
      published: false,
      ...(preset
        ? {
            voicePresetId: preset.id,
            voicePitch: preset.pitch,
            voiceRate: preset.rate,
          }
        : {}),
    })
  },
  syncKind: (kind) => {
    const current = getWorld(get().currentWorldId)
    if (current.kind === kind) return
    get().applyWorld(getDefaultWorldForKind(kind))
  },

  setName: (name) => set({ name }),
  setBio: (bio) => set({ bio }),
  setGender: (v) => set({ gender: v }),
  setRace: (v) => set({ race: v }),
  setBirthday: (v) => set({ birthday: v }),
  setPortraitUrl: (url) => set({ portraitUrl: url }),
  setRoleDoc: (v) => set({ roleDoc: v }),
  setToneDoc: (v) => set({ toneDoc: v }),
  setGoalDoc: (v) => set({ goalDoc: v }),
  setTaskDoc: (v) => set({ taskDoc: v }),
  setPersonaDoc: (v) => set({ personaDoc: v }),
  toggleTrait: (t) =>
    set((s) => ({
      traits: s.traits.includes(t)
        ? s.traits.filter((x) => x !== t)
        : [...s.traits, t],
    })),
  addCustomTrait: (t) =>
    set((s) => {
      const trimmed = t.trim()
      if (!trimmed || s.traits.includes(trimmed)) return s
      return { traits: [...s.traits, trimmed] }
    }),
  reorderTraits: (from, to) =>
    set((s) => {
      const next = [...s.traits]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return { traits: next }
    }),
  setMbtiAxis: (key, value) =>
    set((s) => ({ mbti: { ...s.mbti, [key]: value } })),
  addGalleryImage: (dataUrl) =>
    set((s) =>
      s.gallery.length >= MAX_GALLERY
        ? s
        : { gallery: [...s.gallery, dataUrl] }
    ),
  removeGalleryImage: (index) =>
    set((s) => ({ gallery: s.gallery.filter((_, i) => i !== index) })),
  setGallery: (urls) => set({ gallery: urls.slice(0, MAX_GALLERY) }),
  setAlbumLayout: (layout) => set({ albumLayout: layout }),
  addPost: (post) =>
    set((s) => ({
      posts: [
        ...s.posts,
        { ...post, id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
      ],
    })),
  removePost: (id) =>
    set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
  setVoicePreset: (id) => {
    const state = get()
    const custom = state.customVoices.find((v) => v.id === id)
    if (custom) {
      set({
        voicePresetId: custom.id,
        voicePitch: custom.pitch,
        voiceRate: custom.rate,
        voiceTimbre: custom.timbre,
        voiceIntonation: custom.intonation,
        voiceStyle: custom.style,
      })
      return
    }
    const preset = VOICE_PRESETS.find((p) => p.id === id) ?? DEFAULT_PRESET
    set({
      voicePresetId: preset.id,
      voicePitch: preset.pitch,
      voiceRate: preset.rate,
      voiceTimbre: preset.timbre ?? 0.5,
      voiceIntonation: preset.intonation ?? 0.5,
      voiceStyle: preset.style ?? 1,
    })
  },
  setVoicePitch: (v) => set({ voicePitch: v }),
  setVoiceRate: (v) => set({ voiceRate: v }),
  setVoiceTimbre: (v) => set({ voiceTimbre: v }),
  setVoiceIntonation: (v) => set({ voiceIntonation: v }),
  setVoiceStyle: (n) => set({ voiceStyle: n }),
  setVoiceEmotion: (e) => set({ voiceEmotion: e }),
  toggleVoiceFavorite: (id) => {
    const state = get()
    const has = state.voiceFavorites.includes(id)
    set({
      voiceFavorites: has
        ? state.voiceFavorites.filter((x) => x !== id)
        : [...state.voiceFavorites, id],
    })
  },
  addCustomVoice: ({ source, fileName, durationSec, label }) => {
    const state = get()
    const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const nextIndex = state.customVoices.length + 1
    // All user-created voices share the unified "我的音色" name; we append a
    // running index when there are multiples so the list stays readable.
    const defaultLabel =
      label ?? (nextIndex === 1 ? '我的音色' : `我的音色 ${nextIndex}`)
    const entry: CustomVoice = {
      id,
      label: defaultLabel,
      source,
      createdAt: Date.now(),
      fileName,
      durationSec,
      pitch: state.voicePitch,
      rate: state.voiceRate,
      timbre: state.voiceTimbre,
      intonation: state.voiceIntonation,
      style: state.voiceStyle,
    }
    set({
      customVoices: [entry, ...state.customVoices],
      voicePresetId: id,
    })
    return id
  },
  removeCustomVoice: (id) => {
    const state = get()
    const remaining = state.customVoices.filter((v) => v.id !== id)
    const fallbackId =
      state.voicePresetId === id
        ? remaining[0]?.id ?? VOICE_PRESETS[0].id
        : state.voicePresetId
    set({ customVoices: remaining })
    if (state.voicePresetId === id) {
      // Re-run setVoicePreset to sync tuning fields.
      const preset = VOICE_PRESETS.find((p) => p.id === fallbackId)
      const custom = remaining.find((v) => v.id === fallbackId)
      if (custom) {
        set({
          voicePresetId: custom.id,
          voicePitch: custom.pitch,
          voiceRate: custom.rate,
          voiceTimbre: custom.timbre,
          voiceIntonation: custom.intonation,
          voiceStyle: custom.style,
        })
      } else if (preset) {
        set({
          voicePresetId: preset.id,
          voicePitch: preset.pitch,
          voiceRate: preset.rate,
          voiceTimbre: preset.timbre ?? 0.5,
          voiceIntonation: preset.intonation ?? 0.5,
          voiceStyle: preset.style ?? 1,
        })
      }
    }
  },
  setVoiceURI: (uri) => set({ voiceURI: uri }),
  setMouthWeight: (w) => set({ mouthWeight: Math.max(0, Math.min(1, w)) }),
    }),
    {
      name: 'ip-editor:persona',
      version: 30,
      storage: createJSONStorage(() => localStorage),
      // v30: 约瑟夫 / Ailee 默认人设新增"回复语气"段落（toneDoc）—— 若用户的
      //      roleDoc 仍是 v29 默认值且 toneDoc 为空，则写入 v30 toneDoc 并重组
      //      personaDoc；用户改过的内容保留不动。
      // v29: 再次扩写约瑟夫 / Ailee 默认人设描述（roleDoc / goalDoc / taskDoc 都
      //      更饱满）—— 若用户的 roleDoc 仍是 v27 或 v28 默认值，则整体刷新到
      //      v29 默认并重组 personaDoc；用户自定义的内容保留不动。
      // v28: 扩写约瑟夫 / Ailee 默认人设描述 —— 若用户的 roleDoc 仍是旧版
      //      默认值，则刷新为新默认并重组 personaDoc；用户自定义的内容保留。
      // v27: 修复历史持久化里 portraitUrl / name / bio / personaDoc 被写空的脏
      //      数据 —— 对任何空字段重新拉一遍当前世界的 defaults。
      // v26: 约瑟夫（identity-v）默认音色改为知性青年。
      // v25: 强制刷新 Ailee 默认设定集到新的本地相册图（覆盖旧持久化状态）。
      // v24: Ailee 默认音色改为温柔少女 + 设定集补入本地相册图。
      // v23: 生活博主 Aily 改名为 Ailee。
      // v22: 赛博朋克角色 V 改名为 Lucy。
      // v21: 第五人格角色换成约瑟夫（摄影师）+ 缩短 bio/goalDoc。
      // 对匹配世界的旧数据直接拉取该世界的新 defaults，其他字段保持用户已有值。
      migrate: (persistedState, version) => {
        const s = persistedState as Partial<PersonaState> | null
        if (!s) return s as unknown as PersonaState
        let next: Partial<PersonaState> = s
        if (version < 21 && s.currentWorldId === 'identity-v') {
          const d = getWorld('identity-v').defaults
          next = {
            ...next,
            name: d.name,
            bio: d.bio,
            gender: d.gender,
            race: d.race,
            birthday: d.birthday,
            traits: [...d.traits],
            mbti: { ...d.mbti },
            roleDoc: d.roleDoc,
            goalDoc: d.goalDoc,
            taskDoc: d.taskDoc,
            personaDoc: composePersonaDoc(d.roleDoc, d.goalDoc, d.taskDoc),
          }
        }
        if (version < 22 && next.currentWorldId === 'cyber-night') {
          const d = getWorld('cyber-night').defaults
          next = {
            ...next,
            name: d.name,
            roleDoc: d.roleDoc,
            personaDoc: composePersonaDoc(d.roleDoc, next.goalDoc ?? d.goalDoc, next.taskDoc ?? d.taskDoc),
          }
        }
        if (version < 23 && next.currentWorldId === 'lifestyle-vlog') {
          const d = getWorld('lifestyle-vlog').defaults
          next = {
            ...next,
            name: d.name,
            roleDoc: d.roleDoc,
            personaDoc: composePersonaDoc(d.roleDoc, next.goalDoc ?? d.goalDoc, next.taskDoc ?? d.taskDoc),
          }
        }
        if (version < 24 && next.currentWorldId === 'lifestyle-vlog') {
          const d = getWorld('lifestyle-vlog').defaults
          const preset = VOICE_PRESETS.find((p) => p.id === d.voicePresetId)
          next = {
            ...next,
            gallery: d.gallery ? [...d.gallery] : next.gallery,
            ...(preset
              ? {
                  voicePresetId: preset.id,
                  voicePitch: preset.pitch,
                  voiceRate: preset.rate,
                }
              : {}),
          }
        }
        if (version < 25 && next.currentWorldId === 'lifestyle-vlog') {
          // Force Ailee's gallery to the committed defaults even if the
          // user already had an (empty or stale) gallery persisted.
          const d = getWorld('lifestyle-vlog').defaults
          if (d.gallery && d.gallery.length > 0) {
            next = { ...next, gallery: [...d.gallery] }
          }
        }
        if (version < 26 && next.currentWorldId === 'identity-v') {
          const d = getWorld('identity-v').defaults
          const preset = VOICE_PRESETS.find((p) => p.id === d.voicePresetId)
          if (preset) {
            next = {
              ...next,
              voicePresetId: preset.id,
              voicePitch: preset.pitch,
              voiceRate: preset.rate,
            }
          }
        }
        if (version < 27) {
          const worldId = next.currentWorldId ?? DEFAULT_WORLD.id
          const d = getWorld(worldId).defaults
          const stripped = (next.personaDoc ?? '').replace(/<[^>]*>/g, '').trim()
          const fallback: Partial<PersonaState> = {}
          if (!next.name) fallback.name = d.name
          if (!next.bio) fallback.bio = d.bio
          if (!next.portraitUrl) fallback.portraitUrl = d.portraitUrl
          if (!stripped) {
            fallback.roleDoc = next.roleDoc || d.roleDoc
            fallback.goalDoc = next.goalDoc || d.goalDoc
            fallback.taskDoc = next.taskDoc || d.taskDoc
            fallback.personaDoc = composePersonaDoc(
              fallback.roleDoc ?? '',
              fallback.goalDoc ?? '',
              fallback.taskDoc ?? '',
            )
          }
          if (!next.traits || next.traits.length === 0) fallback.traits = [...d.traits]
          if (!next.gallery || next.gallery.length === 0)
            fallback.gallery = d.gallery ? [...d.gallery] : []
          next = { ...next, ...fallback }
        }
        if (version < 29) {
          // 旧 roleDoc 的两个历史版本（v27 原始默认、v28 扩写一版）——
          // 只要当前 roleDoc 仍匹配其中之一，就认为用户没改过，直接整体升级。
          const OLD_JOSEPH_ROLES = [
            '你是约瑟夫——庄园里的宫廷摄影师，一位永不摘下礼帽的旧时代绅士。你说话慢、稳、带着维多利亚式的礼节，总习惯把人与事先放进取景框里端详一番，再开口。你相信"快门按下的那一瞬，一个人就被定住了"，所以很少匆忙下结论。你对同伴保持彬彬有礼的距离，对庄园抱有艺术家式的执拗——永远在等那一帧"最完美的光"。',
            '你是约瑟夫——庄园里的宫廷摄影师，一位永不摘下礼帽的旧时代绅士。你说话慢、稳、带着维多利亚式的礼节，总习惯把人与事先放进取景框里端详一番，再开口。你相信"快门按下的那一瞬，一个人就被定住了"，所以很少匆忙下结论。你对同伴保持彬彬有礼的距离，对庄园抱有艺术家式的执拗——永远在等那一帧"最完美的光"。你的口袋里揣着一只停了的旧怀表，遇到要紧的话题，会先取出来看一眼，像是给自己留一个停顿。你从不抢镜头，只会等——等雾散、等人转过身、等那道恰好斜过来的光。你不喜欢喧哗，却并不冷漠；只是笃信真正重要的话，说一次就够了。',
          ]
          const OLD_AILEE_ROLES = [
            '你是 Ailee——一个认真拍了三年日常的生活博主。你的语气温柔、日常、带一点撒娇，说话会先谢谢对方再讲自己的话。你最擅长把抽象的情绪翻译成一件小事："今天要不要给自己冲一杯冷萃" 比 "你要好好生活" 更像你会说的话。',
            '你是 Ailee——一个认真拍了三年日常的生活博主。你的语气温柔、日常、带一点撒娇，说话会先谢谢对方再讲自己的话。你最擅长把抽象的情绪翻译成一件小事："今天要不要给自己冲一杯冷萃" 比 "你要好好生活" 更像你会说的话。镜头前你面对观众，镜头后其实是个怕冷的人——随身带着一个温水杯、一本写满小计划的本子，出门前会把门口的绿植挨个摸一下再锁门。你不给大道理，只会递过来一件具体的小事：一条穿起来不紧绷的裙子、一杯能安静喝完的下午茶、一张贴在冰箱上的便签纸。你相信"过日子是练出来的"，所以自己也每天在练。',
          ]
          if (
            next.currentWorldId === 'identity-v' &&
            typeof next.roleDoc === 'string' &&
            OLD_JOSEPH_ROLES.includes(next.roleDoc)
          ) {
            const d = getWorld('identity-v').defaults
            next = {
              ...next,
              roleDoc: d.roleDoc,
              goalDoc: d.goalDoc,
              taskDoc: d.taskDoc,
              personaDoc: composePersonaDoc(d.roleDoc, d.goalDoc, d.taskDoc),
            }
          }
          if (
            next.currentWorldId === 'lifestyle-vlog' &&
            typeof next.roleDoc === 'string' &&
            OLD_AILEE_ROLES.includes(next.roleDoc)
          ) {
            const d = getWorld('lifestyle-vlog').defaults
            next = {
              ...next,
              roleDoc: d.roleDoc,
              goalDoc: d.goalDoc,
              taskDoc: d.taskDoc,
              personaDoc: composePersonaDoc(d.roleDoc, d.goalDoc, d.taskDoc),
            }
          }
        }
        if (version < 30) {
          // Inject the new 回复语气 (toneDoc) section for 约瑟夫 / Ailee when
          // their roleDoc still matches the current v29 default — i.e. the
          // user hasn't edited the persona description.
          if (next.currentWorldId === 'identity-v' || next.currentWorldId === 'lifestyle-vlog') {
            const d = getWorld(next.currentWorldId).defaults
            const hasTone = typeof next.toneDoc === 'string' && next.toneDoc.trim()
            if (!hasTone && typeof next.roleDoc === 'string' && next.roleDoc === d.roleDoc) {
              next = {
                ...next,
                toneDoc: d.toneDoc ?? '',
                personaDoc: composePersonaDoc(
                  d.roleDoc,
                  d.goalDoc,
                  d.taskDoc,
                  d.toneDoc,
                ),
              }
            }
          }
        }
        return next as PersonaState
      },
      // `mouthWeight` is live audio state — don't persist it.
      partialize: (s) => ({
        name: s.name,
        bio: s.bio,
        traits: s.traits,
        gender: s.gender,
        race: s.race,
        birthday: s.birthday,
        portraitUrl: s.portraitUrl,
        roleDoc: s.roleDoc,
        goalDoc: s.goalDoc,
        taskDoc: s.taskDoc,
        toneDoc: s.toneDoc,
        personaDoc: s.personaDoc,
        mbti: s.mbti,
        gallery: s.gallery,
        posts: s.posts,
        voicePresetId: s.voicePresetId,
        voicePitch: s.voicePitch,
        voiceRate: s.voiceRate,
        voiceTimbre: s.voiceTimbre,
        voiceIntonation: s.voiceIntonation,
        voiceStyle: s.voiceStyle,
        voiceEmotion: s.voiceEmotion,
        customVoices: s.customVoices,
        voiceFavorites: s.voiceFavorites,
        voiceURI: s.voiceURI,
        knowledgeIds: s.knowledgeIds,
        skillIds: s.skillIds,
        worldview: s.worldview,
        currentWorldId: s.currentWorldId,
        published: s.published,
      }),
    }
  )
)

/** Pick a best-matching SpeechSynthesisVoice for the given preset. */
export function pickVoiceForPreset(
  preset: VoicePreset | undefined,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  if (!preset || voices.length === 0) return voices[0]
  const locale = preset.locale ?? 'zh-CN'
  const localeMatches = voices.filter((v) => v.lang.startsWith(locale.split('-')[0]))
  const pool = localeMatches.length > 0 ? localeMatches : voices
  const genderGuess = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase()
    if (/(female|woman|girl|雅婷|小美|ting-ting|mei-jia|tracy)/i.test(n))
      return 'female'
    if (/(male|man|boy|国语|peter|alex|samantha)/i.test(n)) return 'male'
    return 'any'
  }
  const pref = preset.gender
  return (
    pool.find((v) => genderGuess(v) === pref) ??
    pool.find((v) => v.default) ??
    pool[0]
  )
}
