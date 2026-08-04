import XiahuaBuildFlow from './XiahuaBuildFlow'
import { TEMPLATE_CLONE_SCRIPT } from './XiahuaBuildScript'

/** 夏日冲浪项目的静态历史对话：展示它是如何从模板复刻出来的。 */
export default function SummerSurfConversationMock({ onReplay }: { onReplay: () => void }) {
  return (
    <XiahuaBuildFlow
      step={TEMPLATE_CLONE_SCRIPT.length - 1}
      path={TEMPLATE_CLONE_SCRIPT.map((_, index) => index)}
      script={TEMPLATE_CLONE_SCRIPT}
      onReplay={onReplay}
    />
  )
}
