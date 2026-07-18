export type ProposalPackId = '综合推荐包' | '自然种草强化包' | '潜客覆盖包'

export interface PackProfile {
  id: ProposalPackId
  desc: string
  metrics: { a3: string; natural: string; afterSearch: string; budget: string }
  buckets: { name: string; count: string; budget: string; note: string }[]
  aiNote: string
}

export const PROPOSAL_PACKS: PackProfile[] = [
  {
    id: '综合推荐包',
    desc: '头部声量、本地垂类、素人规模和投广素材均衡组合',
    metrics: { a3: '128 万', natural: '46%', afterSearch: '34 万', budget: '¥50 万' },
    buckets: [
      { name: '头部品宣达人', count: '3', budget: '30%', note: '品牌声量、信任背书、内容样板' },
      { name: '本地垂类达人', count: '30', budget: '25%', note: '真实体验、场景种草、看后搜' },
      { name: '中腰部达人', count: '80', budget: '20%', note: '内容覆盖、商圈扩散' },
      { name: '素人挑战投稿', count: '300', budget: '8%', note: '低成本规模化内容氛围' },
      { name: '机构供给', count: '120', budget: '17%', note: '机构批量履约、内容稳定' },
    ],
    aiNote: 'A3 可达成（128 万 ≥ 120 万），但自然贡献 46% 略低于阈值 50%。建议把本地垂类预算从 25% 提升到 32%。',
  },
  {
    id: '自然种草强化包',
    desc: '提高本地垂类和中腰部达人占比，降低投广依赖',
    metrics: { a3: '122 万', natural: '56%', afterSearch: '38 万', budget: '¥50 万' },
    buckets: [
      { name: '头部品宣达人', count: '2', budget: '18%', note: '保留 1-2 位作为声量锚点' },
      { name: '本地垂类达人', count: '40', budget: '34%', note: '主力承担看后搜与自然贡献' },
      { name: '中腰部达人', count: '100', budget: '24%', note: '场景多样化覆盖核心商圈' },
      { name: '素人挑战投稿', count: '320', budget: '8%', note: '保留参与氛围' },
      { name: '机构供给', count: '120', budget: '16%', note: '机构 B 履约稳定' },
    ],
    aiNote: '自然贡献 56% 达标，但 A3 122 万距阈值仅 +2 万。适合内容自然贡献为优先目标的商家。',
  },
  {
    id: '潜客覆盖包',
    desc: '提升可投广内容和潜客匹配达人比例，拉高 A3',
    metrics: { a3: '146 万', natural: '39%', afterSearch: '42 万', budget: '¥50 万' },
    buckets: [
      { name: '头部品宣达人', count: '3', budget: '32%', note: '建立强势品牌认知' },
      { name: '本地垂类达人', count: '20', budget: '15%', note: '兜底真实体验' },
      { name: '中腰部达人', count: '60', budget: '14%', note: '广覆盖场景' },
      { name: '潜客匹配达人', count: '50', budget: '22%', note: '可投广素材产出主力' },
      { name: '机构供给', count: '160', budget: '17%', note: '提升投广素材规模' },
    ],
    aiNote: 'A3 拉到 146 万远超阈值，但自然贡献只有 39%，会触发投广依赖风险。仅在商家明确接受投广堆量时使用。',
  },
]

export function getPackProfile(id: ProposalPackId): PackProfile {
  return PROPOSAL_PACKS.find((pack) => pack.id === id) ?? PROPOSAL_PACKS[0]
}
