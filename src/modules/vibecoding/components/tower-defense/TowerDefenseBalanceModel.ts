export type TowerBalanceSectionKey =
  | 'rules'
  | 'towers'
  | 'enemies'
  | 'hero'
  | 'boss'
  | 'waves'
  | 'metrics'

export type TowerBalanceRow = {
  id: string
  name: string
  [key: string]: string | number
}

export interface TowerDefenseBalanceProfile {
  title: string
  sections: { key: TowerBalanceSectionKey; label: string }[]
  data: Record<Exclude<TowerBalanceSectionKey, 'metrics'>, TowerBalanceRow[]>
}

export type TowerBalancePlanKey =
  | 'lowerDifficulty'
  | 'increaseChallenge'
  | 'smoothPacing'
  | 'strengthenCounters'

export const TOWER_BALANCE_PLANS: readonly {
  key: TowerBalancePlanKey
  title: string
  tag: string
  when: string
  reason: string
  effect: string
}[] = [
  {
    key: 'lowerDifficulty',
    title: '降低难度',
    tag: '更容易守住',
    when: '适合：前两波掉血多、新手过不去。',
    reason: '依据：第2波铁骑和第4波飞鹰是当前主要压力点。',
    effect: '效果：减少前中期漏怪，初始经济略宽松。',
  },
  {
    key: 'increaseChallenge',
    title: '增加挑战',
    tag: '提高强度',
    when: '适合：三星太稳定、后期没有压迫感。',
    reason: '依据：如果试跑基地血量长期高于三星线，就需要加强后期。',
    effect: '效果：提高敌人生命和 Boss 输出，拉高通关压力。',
  },
  {
    key: 'smoothPacing',
    title: '平滑节奏',
    tag: '减少突变',
    when: '适合：某一波突然暴毙，但整体难度想保留。',
    reason: '依据：检查波次压力跳变，把压力从尖峰分摊到后续波。',
    effect: '效果：第2/4波降低尖峰，第5波承接一部分压力。',
  },
  {
    key: 'strengthenCounters',
    title: '强化克制',
    tag: '塔种更清晰',
    when: '适合：玩家无脑堆泛用塔，法术/对空存在感弱。',
    reason: '依据：当前存在高物抗敌人和飞行压力，需要突出克制塔价值。',
    effect: '效果：提高军师台、瞭望塔早期收益，让选择更明确。',
  },
]

export function createDefaultTowerDefenseBalanceProfile(): TowerDefenseBalanceProfile {
  return {
    title: '塔防数值层',
    sections: [
      { key: 'rules', label: '关卡规则' },
      { key: 'towers', label: '防御塔' },
      { key: 'enemies', label: '敌人' },
      { key: 'hero', label: '英雄' },
      { key: 'boss', label: 'Boss' },
      { key: 'waves', label: '波次' },
      { key: 'metrics', label: '指标面板' },
    ],
    data: {
      rules: [
        { id: 'baseHp', name: '基地初始血量', value: 20, note: '失败条件：基地血量 <= 0' },
        { id: 'initialGold', name: '初始金币', value: 500, note: '开局建塔资源' },
        { id: 'waveCount', name: '关卡波数', value: 6, note: '当前塔防 MVP 固定 6 波' },
        { id: 'threeStarHp', name: '三星血量线', value: 16, note: '基地血量 >= 16' },
        { id: 'twoStarHp', name: '二星血量线', value: 8, note: '基地血量 >= 8' },
        { id: 'oneStarHp', name: '一星血量线', value: 1, note: '基地血量 >= 1' },
      ],
      towers: [
        { id: 'arrow_tower', name: '箭楼', level: 1, role: '泛用塔', damageType: 'physical', target: '空地', attack: 35, interval: 1.2, range: 3, cost: 100, counter: '刀兵、飞鹰' },
        { id: 'arrow_tower', name: '箭楼', level: 2, role: '泛用塔', damageType: 'physical', target: '空地', attack: 51, interval: 1.2, range: 3.45, cost: 150, counter: '刀兵、飞鹰' },
        { id: 'arrow_tower', name: '箭楼', level: 3, role: '泛用塔', damageType: 'physical', target: '空地', attack: 74, interval: 1.2, range: 3.9, cost: 250, counter: '刀兵、飞鹰' },
        { id: 'crossbow_camp', name: '重弩营', level: 1, role: '高单体', damageType: 'physical', target: '对地', attack: 80, interval: 2.2, range: 4, cost: 150, counter: '高血量地面、Boss' },
        { id: 'crossbow_camp', name: '重弩营', level: 2, role: '高单体', damageType: 'physical', target: '对地', attack: 116, interval: 2.2, range: 4.45, cost: 200, counter: '高血量地面、Boss' },
        { id: 'crossbow_camp', name: '重弩营', level: 3, role: '高单体', damageType: 'physical', target: '对地', attack: 168, interval: 2.2, range: 4.9, cost: 300, counter: '高血量地面、Boss' },
        { id: 'strategist_platform', name: '军师台', level: 1, role: '破甲法术', damageType: 'magic', target: '对地', attack: 55, interval: 1.5, range: 3, cost: 140, counter: '铁骑、术士' },
        { id: 'strategist_platform', name: '军师台', level: 2, role: '破甲法术', damageType: 'magic', target: '对地', attack: 80, interval: 1.5, range: 3.45, cost: 180, counter: '铁骑、术士' },
        { id: 'strategist_platform', name: '军师台', level: 3, role: '破甲法术', damageType: 'magic', target: '对地', attack: 116, interval: 1.5, range: 3.9, cost: 260, counter: '铁骑、术士' },
        { id: 'fire_oil_camp', name: '火油营', level: 1, role: '灼烧范围感', damageType: 'magic', target: '空地', attack: 40, interval: 2, range: 2, cost: 160, counter: '成群单位、空地混合' },
        { id: 'fire_oil_camp', name: '火油营', level: 2, role: '灼烧范围感', damageType: 'magic', target: '空地', attack: 58, interval: 2, range: 2.45, cost: 220, counter: '成群单位、空地混合' },
        { id: 'fire_oil_camp', name: '火油营', level: 3, role: '灼烧范围感', damageType: 'magic', target: '空地', attack: 84, interval: 2, range: 2.9, cost: 320, counter: '成群单位、空地混合' },
        { id: 'watchtower', name: '瞭望塔', level: 1, role: '对空专精', damageType: 'physical', target: '对空', attack: 60, interval: 1, range: 4, cost: 130, counter: '飞鹰斥候' },
        { id: 'watchtower', name: '瞭望塔', level: 2, role: '对空专精', damageType: 'physical', target: '对空', attack: 87, interval: 1, range: 4.45, cost: 180, counter: '飞鹰斥候' },
        { id: 'watchtower', name: '瞭望塔', level: 3, role: '对空专精', damageType: 'physical', target: '对空', attack: 126, interval: 1, range: 4.9, cost: 260, counter: '飞鹰斥候' },
      ],
      enemies: [
        { id: 'knife_soldier', name: '西凉刀兵', type: 'ground', hp: 200, attack: 30, interval: 1.2, speed: 1, physicalResistance: 0, magicResistance: 0, leakDamage: 1, rewardGold: 20, role: '基础兵' },
        { id: 'iron_cavalry', name: '西凉铁骑', type: 'ground', hp: 500, attack: 75, interval: 1.4, speed: 1.2, physicalResistance: 0.7, magicResistance: 0, leakDamage: 2, rewardGold: 40, role: '高血高物抗' },
        { id: 'sorcerer', name: '西凉术士', type: 'ground', hp: 300, attack: 55, interval: 1.6, speed: 0.8, physicalResistance: 0.85, magicResistance: 0, leakDamage: 2, rewardGold: 35, role: '高物抗慢速' },
        { id: 'eagle_scout', name: '飞鹰斥候', type: 'air', hp: 250, attack: 40, interval: 1.3, speed: 1.5, physicalResistance: 0, magicResistance: 0, leakDamage: 3, rewardGold: 30, role: '高速飞行单位' },
      ],
      hero: [
        { id: 'lvbu', name: '吕布', hp: 2600, attack: 140, interval: 1.5, target: '对地', damageTakenMultiplier: 1.18, regenPercent: 0.006, reviveTime: 30, note: '可操作移动防线' },
        { id: 'sweep', name: '方天横扫', hp: 0, attack: 280, interval: 25, target: '近身范围', damageTakenMultiplier: 0, regenPercent: 0, reviveTime: 0, note: '物理范围技能，范围 2.4' },
        { id: 'roar', name: '战神怒吼', hp: 0, attack: 380, interval: 40, target: '大范围', damageTakenMultiplier: 0, regenPercent: 0, reviveTime: 0, note: '法术范围技能，范围 3.2' },
      ],
      boss: [
        { id: 'liubei', name: '刘备 Boss', hp: 1200, attack: 120, interval: 1, speed: 1, armor: 0.1, leakDamage: 5, rewardGold: 300, note: '终局单体输出检验' },
        { id: 'dash', name: '龙魂突进', hp: 0, attack: 0, interval: 12, speed: 3, armor: 0, leakDamage: 0, rewardGold: 0, note: '向前突进 3 格' },
        { id: 'command', name: '仁德号令', hp: 0, attack: 0, interval: 18, speed: 1.2, armor: 0, leakDamage: 0, rewardGold: 0, note: '敌军加速 +20%，持续 8s' },
      ],
      waves: [
        { id: 'wave1', name: '第1波', knife_soldier: 8, iron_cavalry: 0, sorcerer: 0, eagle_scout: 0, boss: 0, reward: 100, spawnInterval: 1, bossDelay: 0 },
        { id: 'wave2', name: '第2波', knife_soldier: 6, iron_cavalry: 4, sorcerer: 0, eagle_scout: 0, boss: 0, reward: 120, spawnInterval: 1, bossDelay: 0 },
        { id: 'wave3', name: '第3波', knife_soldier: 5, iron_cavalry: 0, sorcerer: 5, eagle_scout: 0, boss: 0, reward: 150, spawnInterval: 0.8, bossDelay: 0 },
        { id: 'wave4', name: '第4波', knife_soldier: 4, iron_cavalry: 0, sorcerer: 0, eagle_scout: 8, boss: 0, reward: 180, spawnInterval: 0.7, bossDelay: 0 },
        { id: 'wave5', name: '第5波', knife_soldier: 5, iron_cavalry: 3, sorcerer: 3, eagle_scout: 3, boss: 0, reward: 200, spawnInterval: 0.6, bossDelay: 0 },
        { id: 'wave6', name: '第6波', knife_soldier: 8, iron_cavalry: 4, sorcerer: 4, eagle_scout: 4, boss: 1, reward: 0, spawnInterval: 0.8, bossDelay: 8 },
      ],
    },
  }
}

export function cloneTowerDefenseBalanceProfile(profile: TowerDefenseBalanceProfile) {
  return structuredClone(profile)
}
