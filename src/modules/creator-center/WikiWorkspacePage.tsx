import { useState } from 'react'
import { useProductSideNav } from '@/shared/storage/product-side-nav'
import WikiEditorPage, { WikiSideNav } from './WikiEditorPage'
import {
  DEFAULT_WIKI_OBJECT_ID,
  getWikiObject,
} from './wiki-object-data'

/** 百科产品层：世界书默认已开通，进入即编辑器（Landing 首页暂时隐藏）。 */
export default function WikiWorkspacePage() {
  const [activeDoc, setActiveDoc] = useState('未命名设定')
  const [activeObjectId, setActiveObjectId] = useState(DEFAULT_WIKI_OBJECT_ID)
  const sidebarCollapsed = useProductSideNav((state) => state.collapsed.wiki)
  const setSidebarCollapsed = useProductSideNav((state) => state.setCollapsed)
  const activeObject = getWikiObject(activeObjectId)

  const selectObject = (id: string) => {
    setActiveObjectId(getWikiObject(id).id)
    setActiveDoc('未命名设定')
  }

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <WikiSideNav
        activeDoc={activeDoc}
        activeObjectId={activeObject.id}
        collapsed={sidebarCollapsed}
        onPickDoc={setActiveDoc}
        onCollapse={() => setSidebarCollapsed('wiki', !sidebarCollapsed)}
        onSelectObject={selectObject}
      />

      <div className="relative min-w-0 flex-1">
        <WikiEditorPage
          activeDoc={activeDoc}
          activeObjectTitle={activeObject.title}
          sidebarCollapsed={sidebarCollapsed}
          onExpandSidebar={() => setSidebarCollapsed('wiki', false)}
        />
      </div>
    </div>
  )
}
