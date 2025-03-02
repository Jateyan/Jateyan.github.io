import comp from "E:/Jateyan.github.io/docs/.vuepress/.temp/pages/pdfs/index.html.vue"
const data = JSON.parse("{\"path\":\"/pdfs/\",\"title\":\"PDF文档库\",\"lang\":\"zh-CN\",\"frontmatter\":{\"gitInclude\":[]},\"headers\":[],\"readingTime\":{\"minutes\":0.18,\"words\":54},\"filePathRelative\":\"pdfs/README.md\",\"categoryList\":[{\"id\":\"8fa516\",\"sort\":10001,\"name\":\"pdfs\"}]}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
