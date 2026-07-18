import {
  File,
  FileCode2,
  FileCog,
  FileJson,
  FileText,
  Image as ImageIcon,
  Palette,
} from '@/shared/icons'

export function getFileIcon(name: string): typeof File {
  const lower = name.toLowerCase()
  if (/\.(tsx|ts|jsx|js|mjs|cjs)$/.test(lower)) return FileCode2
  if (/\.json$/.test(lower)) return FileJson
  if (/\.(css|less|scss|sass|styl)$/.test(lower)) return Palette
  if (/\.(yaml|yml|toml|ini|env)$/.test(lower)) return FileCog
  if (/\.(md|mdx|txt)$/.test(lower)) return FileText
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/.test(lower)) return ImageIcon
  return File
}
