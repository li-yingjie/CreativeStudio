export interface WikiObjectOption {
  id: string
  title: string
  cover: string
}

export const WIKI_OBJECTS: WikiObjectOption[] = [
  {
    id: 'ling-cage',
    title: '灵笼',
    cover: '/assets/wiki/object-covers/ling-cage.jpg',
  },
  {
    id: 'xiyouji',
    title: '西游记',
    cover: '/assets/wiki/covers/xiyouji.webp',
  },
  {
    id: 'santi',
    title: '三体',
    cover: '/assets/wiki/covers/santi.webp',
  },
  {
    id: 'eyasha',
    title: '鹅鸭杀',
    cover: '/assets/wiki/covers/eyasha.webp',
  },
]

export const DEFAULT_WIKI_OBJECT_ID = WIKI_OBJECTS[0].id

export function getWikiObject(id: string) {
  return WIKI_OBJECTS.find((object) => object.id === id) ?? WIKI_OBJECTS[0]
}
