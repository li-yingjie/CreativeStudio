import type { CSSProperties } from 'react'
import {
  GAME_UI_HEIGHT,
  GAME_UI_WIDTH,
  nodesForScreen,
  type GameUiNode,
  type GameUiScreenId,
} from './GameUiModel'
import type { GameUiSlice } from './GameUiSlices'

interface Props {
  screen: GameUiScreenId
  src: string
  stale?: boolean
  generating?: boolean
  nodes: GameUiNode[]
  slices?: GameUiSlice[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onSelectArtifact?: () => void
}

export function TowerDefenseArtifactFrame({
  screen,
  src,
  stale = false,
  generating = false,
  nodes,
  slices = [],
  selectedId,
  onSelect: _onSelect,
  onSelectArtifact,
}: Props) {
  const visible = nodesForScreen(nodes, screen)
  const pickArtifact = () => {
    if (onSelectArtifact) onSelectArtifact()
    else onSelect(null)
  }

  return (
    <div
      className="relative overflow-hidden bg-black"
      style={{ width: GAME_UI_WIDTH, height: GAME_UI_HEIGHT }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) pickArtifact()
      }}
    >
      <img
        src={src}
        alt=""
        className="absolute inset-0 size-full object-cover"
        onPointerDown={(event) => {
          event.stopPropagation()
          pickArtifact()
        }}
      />
      {stale ? (
        <div className="absolute inset-0 bg-[#121A1C]/35" />
      ) : null}
      {generating ? (
        <div className="absolute inset-0 grid place-items-center bg-black/45 text-[12px] font-medium text-white">
          正在按标注生成这一屏…
        </div>
      ) : null}
      {visible.map((node) => {
        const selected = selectedId === node.id
        const slice = slices.find((item) => item.nodeId === node.id)
        const boxSrc = slice?.bbox ?? node
        const box: CSSProperties = {
          left: `${(boxSrc.x / GAME_UI_WIDTH) * 100}%`,
          top: `${(boxSrc.y / GAME_UI_HEIGHT) * 100}%`,
          width: `${(boxSrc.width / GAME_UI_WIDTH) * 100}%`,
          height: `${(boxSrc.height / GAME_UI_HEIGHT) * 100}%`,
        }
        return (
          <div
            key={node.id}
            aria-hidden
            data-game-ui-artifact-node={node.id}
            className={`pointer-events-none absolute ${selected ? 'z-20 outline outline-2 outline-[#2f6bff]' : ''}`}
            style={box}
          />
        )
      })}
    </div>
  )
}

export default TowerDefenseArtifactFrame
