import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import {
  ACG_NEW_YEAR_ASSET_GROUPS,
  EVERNIGHT_ASSET_GROUPS,
  GARUDA_ASSET_GROUPS,
  HOT_TOPIC_BANNER_ASSET_GROUPS,
  JINGXIN_LIVESTREAM_ASSET_GROUPS,
  LIFE_SERVICE_RESOURCE_POSITION_ASSET_GROUPS,
  MAGICX_HEADER_ASSET_GROUPS,
  SPRING_GALA_ASSET_GROUPS,
  XINZAI_IP_ASSET_GROUPS,
  XIAHUA_ASSET_GROUPS,
  resolveAssetPrompt,
} from '../src/modules/vibecoding/components/ProjectAssetCatalog.ts'
import { ASSET_CATALOG, ASSET_CENTER_CATEGORIES } from '../src/modules/vibecoding/assets/assetCatalog.ts'
import { resources } from '../src/modules/vibecoding/components/resources/resources-data.ts'
import { skills } from '../src/modules/vibecoding/components/skills/skills-data.ts'
import { ASSET_ONLY_PROJECT_CONVERSATIONS } from '../src/modules/vibecoding/components/data/asset-only-project-conversations.ts'
import {
  JINGXIN_LIVESTREAM_ASSET_PROJECT,
  LIFE_SERVICE_RESOURCE_POSITION_PROJECT,
  MAGICX_HEADER_ASSET_PROJECT,
  XINZAI_IP_ASSET_PROJECT,
} from '../src/modules/vibecoding/components/ProjectProductView.ts'

function publicPath(src) {
  return fileURLToPath(new URL(`../public${src}`, import.meta.url))
}

function framePath(src, index) {
  const match = src.match(/^(.*?)(\d+)(\.[a-z0-9]+)$/i)
  if (!match) return src
  const [, prefix, frame, extension] = match
  return `${prefix}${String(index).padStart(frame.length, '0')}${extension}`
}

function verifyCatalog(groups) {
  const items = groups.flatMap((group) => group.items)
  const ids = items.map((item) => item.id)

  assert.equal(ids.every(Boolean), true)
  assert.equal(new Set(ids).size, ids.length)

  items.forEach((item) => {
    const prompt = resolveAssetPrompt(item)
    assert.ok(prompt.text.trim(), `${item.id} is missing a Prompt`)
    assert.ok(prompt.skillLabel.trim(), `${item.id} is missing a skill label`)
    assert.ok(prompt.model.trim(), `${item.id} is missing a model`)
    assert.ok(
      existsSync(publicPath(item.src)),
      `${item.id} points to a missing public asset: ${item.src}`,
    )

    if (item.frames) {
      const lastFrame = framePath(item.src, item.frames - 1)
      assert.ok(
        existsSync(publicPath(lastFrame)),
        `${item.id} points past its final sequence frame: ${lastFrame}`,
      )
    }
  })

  return items
}

test('ACG catalog exposes the 15 verified Figma deliverables with Prompt metadata', () => {
  const items = verifyCatalog(ACG_NEW_YEAR_ASSET_GROUPS)
  assert.equal(items.length, 15)
  assert.equal(
    items.every((item) => item.src.startsWith('/assets/figma-deliverables/acg/')),
    true,
  )
})

test('Garuda catalog keeps every logical asset addressable by one Prompt', () => {
  const items = verifyCatalog(GARUDA_ASSET_GROUPS)
  assert.equal(items.length, 51)
  assert.equal(
    items.filter((item) => (item.kind ?? 'image') === 'image').length,
    40,
  )
  assert.equal(items.filter((item) => item.kind === 'audio').length, 9)
  assert.equal(items.filter((item) => item.kind === 'video').length, 2)
})

test('catalog ids stay unique across projects', () => {
  const ids = [
    ACG_NEW_YEAR_ASSET_GROUPS,
    GARUDA_ASSET_GROUPS,
    HOT_TOPIC_BANNER_ASSET_GROUPS,
    XINZAI_IP_ASSET_GROUPS,
    JINGXIN_LIVESTREAM_ASSET_GROUPS,
    LIFE_SERVICE_RESOURCE_POSITION_ASSET_GROUPS,
    MAGICX_HEADER_ASSET_GROUPS,
  ]
    .flatMap((groups) => groups)
    .flatMap((group) => group.items)
    .map((item) => item.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('asset-only projects use source-backed files with complete project counts', () => {
  assert.equal(verifyCatalog(XINZAI_IP_ASSET_GROUPS).length, 13)
  assert.equal(verifyCatalog(JINGXIN_LIVESTREAM_ASSET_GROUPS).length, 8)
  assert.equal(
    verifyCatalog(LIFE_SERVICE_RESOURCE_POSITION_ASSET_GROUPS).length,
    8,
  )
  assert.equal(verifyCatalog(MAGICX_HEADER_ASSET_GROUPS).length, 4)

  const livestreamPreview = JINGXIN_LIVESTREAM_ASSET_GROUPS
    .flatMap((group) => group.items)
    .find((item) => item.id === 'jingxin-live-preview')
  assert.ok((livestreamPreview?.layerManifest?.layers.length ?? 0) > 1)
  assert.equal(livestreamPreview.layerManifest.layers[0].locked, true)
})

test('asset-only projects keep a traceable completed conversation instead of an empty chat', () => {
  const expectedProjects = [
    '生服热点 Banner',
    XINZAI_IP_ASSET_PROJECT,
    JINGXIN_LIVESTREAM_ASSET_PROJECT,
    LIFE_SERVICE_RESOURCE_POSITION_PROJECT,
    MAGICX_HEADER_ASSET_PROJECT,
  ]

  assert.deepEqual(
    Object.keys(ASSET_ONLY_PROJECT_CONVERSATIONS).sort(),
    expectedProjects.sort(),
  )
  expectedProjects.forEach((project) => {
    const conversation = ASSET_ONLY_PROJECT_CONVERSATIONS[project]
    assert.notEqual(conversation.sessionTitle, '新会话')
    assert.ok(conversation.request.length > 20)
    assert.ok(conversation.sourceCheck.length >= 3)
    assert.ok(conversation.productionCheck.length >= 3)
    assert.deepEqual(
      [conversation.documentCard.type, conversation.assetCard.type],
      ['doc', 'asset'],
    )
  })
})

test('several project libraries contain honest multi-layer examples', () => {
  const expected = [
    [HOT_TOPIC_BANNER_ASSET_GROUPS, 'hot-topic-industry-layered'],
    [ACG_NEW_YEAR_ASSET_GROUPS, 'acg-discovery-banner'],
    [SPRING_GALA_ASSET_GROUPS, 'gala-banner'],
    [EVERNIGHT_ASSET_GROUPS, 'evernight-banner'],
    [XIAHUA_ASSET_GROUPS, 'xh-kv-head'],
  ]

  expected.forEach(([groups, id]) => {
    const item = groups.flatMap((group) => group.items).find((candidate) => candidate.id === id)
    assert.ok(item, `${id} should exist`)
    assert.ok((item.layerManifest?.layers.length ?? 0) > 1, `${id} should expose a multi-layer manifest`)
  })

  for (const [groups, id] of expected.slice(1, 4)) {
    const item = groups.flatMap((group) => group.items).find((candidate) => candidate.id === id)
    assert.equal(item.layerManifest.templateRef.name, '智能分层编辑源')
    assert.match(item.layerManifest.layers[0].name, /像素保护基线/)
    assert.equal(item.layerManifest.layers[0].locked, true)
  }
})

test('resource detail references keep AI workbench fields per resource type', () => {
  const tool = resources.find((item) => item.id === 'kit-platform-headline-creator-tool')
  assert.equal(tool.externalId, 'KIT_PLATFORM-HEADLINE_CREATOR-TOOL-7633721570092845862')
  assert.deepEqual(tool.inputParameters.map((item) => item.name), ['paramMap', 'businessScene', 'abilityIDs'])
  assert.equal(tool.outputParameters[0].name, 'data')

  const knowledge = resources.find((item) => item.id === 'ai-workbench-knowledge-base')
  assert.equal(knowledge.knowledgeFiles.length, 1)
  assert.equal(knowledge.knowledgeFiles[0].status, '解析完成')

  const model = resources.find((item) => item.id === 'doubao-1-5-vision-pro-32k')
  assert.equal(model.modelDetail.status, '已上线')
  assert.equal(model.modelDetail.maxOutput, '12k')
  assert.equal(model.modelDetail.endpoint, 'ep-20250804145050-gnzfd')
})

test('POI skill keeps the AI workbench detail metadata and package source together', () => {
  const poiSkill = skills.find((item) => item.id === 'comment-poi-info-component-skill')

  assert.ok(poiSkill)
  assert.equal(poiSkill.provider, '抖音官方')
  assert.equal(poiSkill.updatedAt, '5-14 更新')
  assert.deepEqual(poiSkill.metrics?.map((metric) => metric.value), ['185', '2K', '86%'])
  assert.deepEqual(poiSkill.tools, ['地址信息获取工具', '评论组件'])
  assert.equal(poiSkill.skillPackage?.files[0]?.name, 'SKILL.md')
  assert.match(poiSkill.skillPackage?.files[0]?.content ?? '', /# POI 评论组件 Skill/)
  assert.match(poiSkill.skillPackage?.files[0]?.content ?? '', /get_comment_poi/)
})

test('activity templates describe organization and support zero-page delivery patterns', () => {
  const templates = ASSET_CATALOG.filter((item) => item.assetClass === 'activity-template')
  assert.ok(templates.length >= 5)
  assert.equal(
    templates.every((item) => {
      const profile = item.templateProfile
      return Boolean(
        profile?.purpose
        && profile.organization
        && profile.gameplay
        && profile.scale
        && profile.format
        && profile.fit
        && profile.systemMap.journey.length >= 4
        && profile.systemMap.assetInputs.length >= 4
        && profile.systemMap.outputs.length >= 3,
      )
    }),
    true,
  )

  const zeroPageTemplates = templates.filter((item) => (
    item.metrics.some((metric) => metric.label === '新增页面' && metric.value === '0 个')
  ))
  assert.deepEqual(
    zeroPageTemplates.map((item) => item.id).sort(),
    ['template.channel-resource-pack-no-page', 'template.live-program-asset-pack'],
  )
})

test('asset center exposes a page component library and durable governed assets', () => {
  assert.deepEqual(
    ASSET_CENTER_CATEGORIES.map((category) => category.id),
    ['brand', 'gameplay', 'page-component', 'ip', 'font'],
  )
  ASSET_CENTER_CATEGORIES.forEach((category) => {
    assert.ok(ASSET_CATALOG.some((item) => item.category === category.id), `${category.label} should not be empty`)
  })

  const pageComponents = ASSET_CATALOG.filter((item) => item.category === 'page-component')
  assert.equal(pageComponents.length, 6)
  assert.equal(
    pageComponents.every((item) => (item.visualReferences?.length ?? 0) === 1),
    true,
  )
  assert.deepEqual(
    pageComponents.map((item) => item.assetClass).sort(),
    ['h5-component', 'h5-component', 'lynx-component', 'lynx-component', 'native-component', 'native-component'],
  )
})

test('Xinzai IP Kit keeps official structure, expressions, actions, and image evidence together', () => {
  const xinzai = ASSET_CATALOG.find((item) => item.id === 'ip.xinzai-life-service-2026')
  assert.ok(xinzai)
  assert.equal(xinzai.category, 'ip')
  assert.equal(xinzai.assetClass, 'character-kit')
  assert.ok(xinzai.ipKitProfile)
  assert.equal(xinzai.ipKitProfile.expressions.count, 15)
  assert.equal(xinzai.ipKitProfile.expressions.names.length, 15)
  assert.equal(
    xinzai.ipKitProfile.actionCategories.reduce((total, category) => total + category.count, 0),
    30,
  )
  assert.equal(xinzai.visualReferences?.length, 13)
  xinzai.visualReferences?.forEach((reference) => {
    assert.ok(existsSync(publicPath(reference.src)), `Xinzai evidence is missing: ${reference.src}`)
  })
  assert.ok(existsSync(publicPath(xinzai.ipKitProfile.markdownPath)))
  assert.ok(existsSync(publicPath(xinzai.ipKitProfile.markdownPath.replace(/ip-kit\.md$/, 'image-group.json'))))
})

test('life-service resource-position kit separates delivery canvases from spec boards and exposes agent gates', () => {
  const kit = ASSET_CATALOG.find((item) => item.id === 'brand.douyin-life-service-resource-spec')
  assert.ok(kit)
  assert.equal(kit.category, 'brand')
  assert.equal(kit.registry, 'rule')
  assert.ok(kit.resourcePositionProfile)

  const profile = kit.resourcePositionProfile
  const topicBackground = profile.canvases.find((canvas) => canvas.id === 'topic-background')
  const topicBanner = profile.canvases.find((canvas) => canvas.id === 'topic-banner')
  assert.deepEqual(topicBackground?.logicalSize, { width: 375, height: 210 })
  assert.deepEqual(topicBackground?.exportSize, { width: 1125, height: 630 })
  assert.deepEqual(topicBanner?.logicalSize, { width: 343, height: 65 })
  assert.deepEqual(topicBanner?.exportSize, { width: 1029, height: 195 })
  assert.equal(profile.occlusion.find((rule) => rule.name === '顶部完全遮挡区')?.height, 20)
  assert.ok(profile.contentRules.some((rule) => rule.detail.includes('12px')))
  assert.ok(profile.validation.some((rule) => rule.code === 'SPEC_BOARD_SIZE_LEAK'))
  assert.ok(profile.validation.some((rule) => rule.code === 'UNRESOLVED_THEME_TOKEN'))

  const manifestPath = publicPath(profile.manifestPath)
  const markdownPath = publicPath(profile.markdownPath)
  assert.ok(existsSync(manifestPath))
  assert.ok(existsSync(markdownPath))
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  assert.equal(manifest.surfaces.length, 5)
  assert.equal(manifest.contentRules.minimumTextImageGap.value, 12)
  assert.ok(manifest.excludedBoardSizes.some((size) => size.width === 1952 && size.height === 1193))
})

test('hidden-object gameplay kit is human-readable, agent-callable, and explicit about unverified integrations', () => {
  const gameplay = ASSET_CATALOG.find((item) => item.id === 'gameplay.hidden-object.magpie-hunt')
  assert.ok(gameplay)
  assert.equal(gameplay.category, 'gameplay')
  assert.equal(gameplay.status, '内测中')
  assert.ok(gameplay.gameplayProfile)
  assert.deepEqual(gameplay.gameplayProfile.preset.stages, [5, 6, 6, 7, 7, 8, 8])
  assert.equal(gameplay.gameplayProfile.preset.totalTargets, 47)
  assert.equal(gameplay.gameplayProfile.preset.roundSeconds, 90)
  assert.ok(gameplay.gameplayProfile.contract.requiredArguments.includes('hotspotManifest'))
  assert.ok(gameplay.gameplayProfile.dependencies.some((entry) => entry.status === '待接入核验'))
  assert.ok(gameplay.gameplayProfile.acceptance.length >= 8)

  const manifestPath = publicPath('/assets/gameplay-kits/qixi-magpie-hunt-2026/manifest.json')
  const readmePath = publicPath('/assets/gameplay-kits/qixi-magpie-hunt-2026/README.md')
  assert.ok(existsSync(manifestPath))
  assert.ok(existsSync(readmePath))
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  assert.equal(manifest.id, gameplay.id)
  assert.equal(manifest.status, 'integration_required')
  assert.equal(manifest.preset.stages.reduce((total, stage) => total + stage.targetCount, 0), 47)
  assert.ok(manifest.validation.some((rule) => rule.code === 'HOTSPOT_COUNT_MISMATCH'))
  assert.ok(manifest.validation.some((rule) => rule.code === 'SOURCE_TOTAL_CONFLICT'))
})
