import { defineClientConfig } from 'vuepress/client'
import Tabs from 'F:/project/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/Tabs.vue'
import CodeTabs from 'F:/project/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/CodeTabs.vue'
import PDFViewer from 'F:/project/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/PDFViewer.vue'
import Plot from 'F:/project/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/Plot.vue'
import FileTreeItem from 'F:/project/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/FileTreeItem.vue'

import 'F:/project/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/styles/index.css'

export default defineClientConfig({
  enhance({ router, app }) {
    app.component('Tabs', Tabs)
    app.component('CodeTabs', CodeTabs)
    app.component('PDFViewer', PDFViewer)
    app.component('Plot', Plot)
    app.component('FileTreeItem', FileTreeItem)
  }
})
