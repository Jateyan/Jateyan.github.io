import { defineClientConfig } from 'vuepress/client'
import Tabs from 'E:/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/Tabs.vue'
import CodeTabs from 'E:/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/CodeTabs.vue'
import PDFViewer from 'E:/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/PDFViewer.vue'
import Plot from 'E:/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/Plot.vue'
import FileTreeItem from 'E:/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/components/FileTreeItem.vue'

import 'E:/Jateyan.github.io/node_modules/vuepress-plugin-md-power/lib/client/styles/index.css'

export default defineClientConfig({
  enhance({ router, app }) {
    app.component('Tabs', Tabs)
    app.component('CodeTabs', CodeTabs)
    app.component('PDFViewer', PDFViewer)
    app.component('Plot', Plot)
    app.component('FileTreeItem', FileTreeItem)
  }
})
