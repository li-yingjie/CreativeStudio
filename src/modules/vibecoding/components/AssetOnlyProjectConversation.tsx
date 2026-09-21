import {
  ASSET_LIBRARY_LABEL,
  PROJECT_DOCUMENT_LABEL,
} from './ProjectProductView'
import { getAssetOnlyProjectConversation } from './data/asset-only-project-conversations'
import {
  AssistantMessage,
  ToolStatus,
  UserMessage,
} from './XiahuaChatUI'

export default function AssetOnlyProjectConversation({
  projectTitle,
  onOpen,
}: {
  projectTitle: string
  onOpen: (label: string) => void
}) {
  const script = getAssetOnlyProjectConversation(projectTitle)
  if (!script) return null

  let turn = 0
  return (
    <div data-asset-project-history={projectTitle}>
      <UserMessage text={script.request} index={turn++} />
      <ToolStatus title="读取项目来源" lines={script.sourceCheck} running={false} />
      <AssistantMessage text={script.proposal} index={turn++} />
      <UserMessage text={script.confirmation} index={turn++} />
      <ToolStatus title="生成并校验交付" lines={script.productionCheck} running={false} />
      <AssistantMessage
        text={script.completion}
        cards={[script.documentCard, script.assetCard]}
        index={turn++}
        onOpenCard={(card) =>
          onOpen(
            card.type === 'doc'
              ? PROJECT_DOCUMENT_LABEL
              : ASSET_LIBRARY_LABEL,
          )
        }
      />
    </div>
  )
}
