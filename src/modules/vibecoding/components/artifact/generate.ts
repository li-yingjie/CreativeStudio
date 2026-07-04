import { streamChat } from '@/shared/api/chat'
import { DEFAULT_AVATAR_PREVIEW, type AvatarAppConfig } from '../AvatarConfigData'

/**
 * AI-generated product configs (the "从 0 生成" path). The conversation drives
 * Kimi to emit a structured config JSON, which we parse + normalize into a real
 * config object and render live via the runtime-config store. No sandbox: the
 * artifact is data running on the real framework.
 */

/** Best-effort extract a JSON object from an LLM reply (strips ``` fences and
 *  any surrounding prose, then parses the outermost {...}). */
function extractJsonObject(text: string): Record<string, unknown> | null {
  if (!text) return null
  // Strip markdown code fences.
  let s = text.replace(/```(?:json)?/gi, '').trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  s = s.slice(start, end + 1)
  try {
    return JSON.parse(s) as Record<string, unknown>
  } catch {
    return null
  }
}

const asString = (v: unknown, fallback: string): string =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback
const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : []

const AVATAR_GEN_SYSTEM = `你是「抖音 AI 工坊」的「AI 分身」配置生成器。根据用户的一句话需求，设计一个抖音 AI 分身，并且**只输出一个 JSON 对象**（不要任何解释、不要 markdown 代码块）。字段：
{
  "name": "分身昵称（简短，2-8 字）",
  "displayName": "聊天页显示名（可带后缀，如 xxxSensei）",
  "description": "一句话定位",
  "bio": ["主页副标题（一句人设介绍）", "商务合作: xxxxxx"],
  "seedAiReply": "用户发『你好』时，分身的第一条回复，要体现人设语气、口语化、亲切",
  "skills": ["技能1", "技能2"],
  "knowledge": ["知识库1", "知识库2"],
  "comments": [
    {"user": "用户昵称", "text": "用户的评论/提问", "time": "2 小时前", "likes": "328", "reply": "分身的自动回复，体现人设"}
  ]
}
要求：贴合用户描述的人设与领域；skills/knowledge 各 2-3 个；comments 给 2-3 条真实可信的；只输出 JSON。`

/** Generate an AI 分身 config from a one-line prompt. Falls back to seeded
 *  defaults for any missing field so the result is always renderable. */
export async function generateAvatarConfig(
  prompt: string,
  projectName: string,
): Promise<AvatarAppConfig> {
  const full = await streamChat([
    { role: 'system', content: AVATAR_GEN_SYSTEM },
    { role: 'user', content: prompt },
  ])
  const j = extractJsonObject(full) ?? {}
  const d = DEFAULT_AVATAR_PREVIEW

  const name = asString(j.name, projectName)
  const description = asString(j.description, prompt.slice(0, 24))
  const skills = asStringArray(j.skills)
  const knowledge = asStringArray(j.knowledge)
  const bio = asStringArray(j.bio)

  type RawComment = { user?: unknown; text?: unknown; time?: unknown; likes?: unknown; reply?: unknown }
  const comments = Array.isArray(j.comments)
    ? (j.comments as RawComment[])
        .map((c) => ({
          user: asString(c?.user, '匿名用户'),
          text: asString(c?.text, ''),
          time: asString(c?.time, '刚刚'),
          likes: asString(c?.likes, '0'),
          reply: asString(c?.reply, ''),
        }))
        .filter((c) => c.text && c.reply)
    : []

  return {
    space: 'aicore_personal',
    appID: `app_gen_${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    iconURL: d.avatarUrl,
    systemPrompt: asString(
      j.systemPrompt,
      `# 角色\n\n${name} —— ${description}\n\n# 风格\n\n按用户需求贴合人设，专业、亲切、有温度。`,
    ),
    modelInfo: { modelKey: 'doubao-pro-32k', modelName: 'Doubao-pro-32k' },
    toolInfoList: [],
    knowledgeInfoList: knowledge.map((n, i) => ({ id: `kb_gen_${i}`, name: n })),
    skillInfoList: skills.map((n, i) => ({ id: `sk_gen_${i}`, name: n })),
    preview: {
      displayName: asString(j.displayName, name),
      avatarUrl: d.avatarUrl,
      bio: bio.length > 0 ? bio : [description],
      timestamp: d.timestamp,
      seedUserMessage: '你好',
      seedAiReply: asString(j.seedAiReply, d.seedAiReply),
      comments: comments.length > 0 ? comments : d.comments,
    },
  }
}
