import type { ChatMessage } from './chat'

export type ChatQueueTurn = {
  id: string
  text: string
  includeInAiHistory: boolean
}

/** A turn can start only after every earlier AI-backed turn has completed. */
export function isChatQueueTurnActive(
  turns: readonly ChatQueueTurn[],
  index: number,
  hasReply: (turnId: string) => boolean,
): boolean {
  return !turns.slice(0, index).some(
    (turn) => turn.includeInAiHistory && !hasReply(turn.id),
  )
}

/** Build context at activation time so a queued turn includes every completed
 * assistant answer that precedes it, not the incomplete context from enqueue. */
export function buildChatQueueHistory(
  system: ChatMessage,
  turns: readonly ChatQueueTurn[],
  index: number,
  getReply: (turnId: string) => string | undefined,
): ChatMessage[] {
  const history: ChatMessage[] = [system]
  for (let turnIndex = 0; turnIndex <= index; turnIndex += 1) {
    const turn = turns[turnIndex]
    if (!turn?.includeInAiHistory) continue
    history.push({ role: 'user', content: turn.text })
    if (turnIndex < index) {
      const reply = getReply(turn.id)
      if (reply) history.push({ role: 'assistant', content: reply })
    }
  }
  return history
}
