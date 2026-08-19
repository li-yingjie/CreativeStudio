import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

import {
  ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT,
  ACG_FROM_DOC_REPLAY_COMPLETED_PATH,
} from '../src/modules/vibecoding/components/AcgFromDocGenerationReplayScript.ts'
import {
  ACG_FROM_DOC_CHAPTERS,
  ACG_FROM_DOC_PROJECT,
  ACG_FROM_DOC_SOURCE_URL,
} from '../src/modules/vibecoding/components/AcgFromDocData.ts'
import { ACG_FROM_DOC_ASSET_GROUPS } from '../src/modules/vibecoding/components/ProjectAssetCatalog.ts'
import { ACG_FROM_DOC_BRAND_KIT_CANDIDATES } from '../src/modules/vibecoding/assets/acgExperienceBrandKit.ts'

const stepIds = new Set(
  ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.map((step) => step.id),
)

test('from-doc ACG replay keeps every branch target resolvable', () => {
  ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.forEach((step) => {
    const targets = [
      step.nextTo,
      step.gate?.confirmTo,
      step.gate?.altTo,
      ...(step.gate?.choices ?? []).map((choice) => choice.to),
    ].filter(Boolean)
    targets.forEach((target) => {
      assert.ok(stepIds.has(target), `${step.id} points to missing ${target}`)
    })
  })
  assert.ok(ACG_FROM_DOC_REPLAY_COMPLETED_PATH.every((index) => index >= 0))
})

test('from-doc ACG replay asks exactly three user decisions', () => {
  const gateIds = ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.filter(
    (step) => step.gate,
  ).map((step) => step.id)
  assert.deepEqual(gateIds, [
    'acg-doc-scope-choice',
    'acg-doc-gameplay-choice',
    'acg-doc-visual-choice',
  ])
  gateIds.forEach((id) => {
    const choices =
      ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.find((step) => step.id === id)
        ?.gate?.choices ?? []
    assert.equal(choices.filter((choice) => !choice.input).length, 3)
    assert.equal(choices.filter((choice) => choice.input).length, 1)
  })
  assert.equal(
    ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.find(
      (step) => step.id === 'acg-doc-wireframe-ready',
    )?.gate,
    undefined,
  )
})

test('from-doc project is isolated from the legacy Figma-backed ACG project', () => {
  assert.equal(ACG_FROM_DOC_PROJECT, 'ACG 新春会 · 从需求生成')
  assert.notEqual(ACG_FROM_DOC_PROJECT, '2026 抖音 ACG 新春会')
  assert.equal(
    ACG_FROM_DOC_SOURCE_URL,
    'https://bytedance.larkoffice.com/docx/VBFIdHa1Jovf12xEbUTcbxjynvb',
  )

  const adoptedText = ACG_FROM_DOC_REPLAY_COMPLETED_PATH.map(
    (index) => ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT[index],
  )
    .map((step) =>
      step.view.kind === 'ai' || step.view.kind === 'user'
        ? step.view.text
        : '',
    )
    .join('\n')
  assert.match(adoptedText, /不读取旧 Figma|不读取旧 Figma 方案/)
  assert.doesNotMatch(adoptedText, /node \d+[:：]\d+/)
})

test('from-doc project resolves the requirement to six chapters', () => {
  assert.equal(ACG_FROM_DOC_CHAPTERS.length, 6)
  assert.deepEqual(
    ACG_FROM_DOC_CHAPTERS.map((chapter) => chapter.title),
    [
      '抽象奇境',
      '美学圣殿',
      '欢愉乐园',
      '治愈绿洲',
      '燃斗竞技场',
      '羁绊回响谷',
    ],
  )
})

test('visual confirmation and the 26-item production Asset BOM are on disk', () => {
  const items = ACG_FROM_DOC_ASSET_GROUPS.flatMap((group) => group.items)
  const styleCandidates = ACG_FROM_DOC_ASSET_GROUPS[0].items
  const productionAssets = items.filter((item) =>
    item.src.startsWith('/assets/acg-from-doc/generated/'),
  )
  assert.equal(styleCandidates.length, 3)
  assert.equal(productionAssets.length, 26)
  assert.equal(items.length, 29)
  assert.equal(
    items.filter((item) => item.prompt?.model === 'OpenAI ImageGen').length,
    29,
  )
  items.forEach((item) => {
    const path = new URL(`../public${item.src}`, import.meta.url)
    assert.ok(existsSync(path), `${item.src} must exist`)
  })
})

test('visual confirmation chooses one of three executable Brand Kits', () => {
  assert.equal(ACG_FROM_DOC_BRAND_KIT_CANDIDATES.length, 3)
  assert.equal(
    ACG_FROM_DOC_BRAND_KIT_CANDIDATES.filter((kit) => kit.recommended).length,
    1,
  )
  ACG_FROM_DOC_BRAND_KIT_CANDIDATES.forEach((kit) => {
    assert.match(kit.id, /^brand\.douyin-acg-/)
    assert.ok(kit.previewSrc)
    assert.ok(kit.heroSystem)
    assert.equal(kit.componentSkins.length, 4)
    assert.ok(kit.promptSignature)
  })

  const visualStep = ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.find(
    (step) => step.id === 'acg-doc-visual-choice',
  )
  assert.match(visualStep?.view.kind === 'ai' ? visualStep.view.text : '', /Brand Kit/)
  assert.equal(visualStep?.gate?.choices?.length, 4)
  assert.match(ACG_FROM_DOC_ASSET_GROUPS[0].title, /Brand Kit/)

  const page = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/AcgFromDocH5.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  const shell = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/VibeCodingPage.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  assert.match(page, /data-campaign-brand-kit=\{campaignBrandKit\.id\}/)
  assert.match(page, /campaignBrandKit\.previewSrc/)
  assert.match(shell, /brandKitId=\{selectedAcgFromDocBrandKit\.id\}/)
})

test('replay tabs grow only while playback is active and final lands on preview', () => {
  const source = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/VibeCodingPage.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  assert.match(source, /if \(acgFromDocReplayToken === 0\) return/)
  assert.match(source, /onReplayStart=\{\(\) => \{[\s\S]*PROJECT_DOCUMENT_LABEL/)
  assert.match(source, /card\.id === 'acg-doc-gameplay'[\s\S]*gameplayConfirmed/)
  assert.match(source, /stepId === 'acg-doc-visual-choice'[\s\S]*ASSET_LIBRARY_LABEL/)
  assert.match(source, /productionAssetsReady[\s\S]*ACG_FROM_DOC_ASSET_GROUPS\.slice\(0, 1\)/)
  assert.match(source, /stepId === 'acg-doc-current-result'[\s\S]*'预览'/)
})

test('page is made of editable DOM components instead of a flattened screenshot', () => {
  const page = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/AcgFromDocH5.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  const editor = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/AcgFromDocEditPanel.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  assert.match(page, /sectionProps\('hero'\)/)
  assert.match(page, /elementProps\('journey', 'journey.progress'\)/)
  assert.match(page, /elementProps\('battle', 'battle.ranking'\)/)
  assert.match(page, /elementProps\('venue', 'venue.score'\)/)
  assert.match(page, /elementProps\('wish', 'wish.action'\)/)
  assert.match(page, /venue === 'main'/)
  assert.match(page, /SubVenue/)
  assert.match(editor, /单独编辑当前对象/)
  assert.match(editor, /页面按用户任务拆成 8 类组件/)
})

test('Figma title art, local scrolling, and sub-venue contrast stay regression-safe', () => {
  const page = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/AcgFromDocH5.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  const styles = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/AcgFromDocH5.css',
      import.meta.url,
    ),
    'utf8',
  )

  for (const file of ['title-lockup-base.svg', 'title-lockup-glyphs.svg']) {
    assert.ok(
      existsSync(
        new URL(`../public/assets/acg-from-doc/generated/${file}`, import.meta.url),
      ),
      `${file} must remain local and durable`,
    )
    assert.match(page, new RegExp(file.replace('.', '\\.')))
  }
  assert.doesNotMatch(page, /<strong>新春会<\/strong>/)
  assert.doesNotMatch(page, /scrollIntoView/)
  assert.match(
    styles,
    /\.acg-fg-wish-board \{[\s\S]*?overflow-x:\s*auto;[\s\S]*?scroll-snap-type:\s*x mandatory;/,
  )
  assert.match(
    styles,
    /\.acg-doc-h5\[data-brand-kit\] \.acg-doc-subvenue \{[\s\S]*?overflow-x:\s*hidden;[\s\S]*?linear-gradient/,
  )
  assert.match(
    styles,
    /\.acg-doc-h5\[data-brand-kit\] \.acg-doc-score-card \{[\s\S]*?background:[\s\S]*?linear-gradient/,
  )
})

test('every production asset is bound to the page component model', () => {
  const pageSources = [
    '../src/modules/vibecoding/components/AcgFromDocH5.tsx',
    '../src/modules/vibecoding/components/AcgFromDocData.ts',
  ]
    .map((path) => readFileSync(new URL(path, import.meta.url), 'utf8'))
    .join('\n')
  const productionAssets = ACG_FROM_DOC_ASSET_GROUPS.flatMap(
    (group) => group.items,
  ).filter((item) => item.src.startsWith('/assets/acg-from-doc/generated/'))

  assert.equal(productionAssets.length, 26)
  productionAssets.forEach((item) => {
    assert.match(
      pageSources,
      new RegExp(item.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      `${item.label} must be bound to an editable page component`,
    )
  })
})

test('Brand Kit visual QA prevents fixed chapter gaps and low-contrast vote controls', () => {
  const styles = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/AcgFromDocH5.css',
      import.meta.url,
    ),
    'utf8',
  )

  assert.match(
    styles,
    /\.acg-doc-h5\[data-brand-kit\] \.acg-doc-chapter \{[\s\S]*?min-height:\s*0;/,
  )
  assert.match(
    styles,
    /\.acg-doc-h5\[data-brand-kit\] \.acg-doc-chapter \.acg-doc-section__head h2 \{[\s\S]*?color:\s*#fff3d7;/,
  )
  assert.match(
    styles,
    /\.acg-doc-h5\[data-brand-kit\] \.acg-doc-vote > button:first-child \{[\s\S]*?background:\s*linear-gradient/,
  )
  assert.match(
    styles,
    /\.acg-doc-h5\[data-brand-kit\] \.acg-doc-vote > button:last-child \{[\s\S]*?background:\s*linear-gradient/,
  )
  assert.match(styles, /data-campaign-brand-kit="brand\.douyin-acg-manga-annual-2026"/)
  assert.match(styles, /data-campaign-brand-kit="brand\.douyin-acg-candy-arcade-2026"/)
})

test('interactive preview closes the six-task reward loop without leaking global state', () => {
  const page = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/AcgFromDocH5.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  const currentVenue = page.slice(
    page.indexOf('const figmaMainVenue'),
    page.indexOf("import.meta.env.MODE === '__legacy_acg_mock__'"),
  )

  assert.match(
    page,
    /const container = containerRef\.current[\s\S]{0,180}container\?\.querySelector/,
  )
  assert.match(
    page,
    /visitedVenues\.includes\('game'\)[\s\S]*visitedVenues\.includes\('anime'\)/,
  )
  assert.match(
    page,
    /const availableDraws = Math\.max\(0, completedTasks - usedDraws\)/,
  )
  assert.match(page, /setUsedDraws\(\(current\) => current \+ 1\)/)
  assert.match(
    page,
    /current === 'positive' \? 3 : current === 'negative' \? -1 : 0/,
  )
  assert.match(page, /setSubmissionOpen\(true\)/)
  assert.match(page, /MAIN_WORKS\[\(index \+ 3 \+ feedSeed\) % MAIN_WORKS\.length\]/)
  assert.equal(currentVenue.match(/<TaskRow\b/g)?.length, 6)
  assert.equal(page.match(/\['game', '游戏会场'\]/g)?.length, 1)
})
