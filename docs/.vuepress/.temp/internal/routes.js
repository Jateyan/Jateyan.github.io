export const redirects = JSON.parse("{\"/preview/custom-component.example.html\":\"/article/nrv6jx0i/\",\"/preview/markdown.html\":\"/article/pwh98lnr/\",\"/custom/interview/%E6%B5%8F%E8%A7%88%E5%99%A8%E5%8E%9F%E7%90%86.html\":\"/article/jglqoszm/\",\"/notes/demo/bar.html\":\"/demo/a5ygiuyx/\",\"/notes/demo/foo.html\":\"/demo/mgo1vntv/\",\"/notes/demo/\":\"/demo/\",\"/custom/course/angular-note/angular%E5%BC%80%E5%8F%91%E5%AE%9E%E6%88%98.html\":\"/article/envm43wh/\",\"/custom/front/css/flex.html\":\"/article/szvgq90m/\",\"/custom/front/js/IntersectionObserver.html\":\"/article/11kabumz/\",\"/custom/front/js/%E4%BA%8B%E4%BB%B6%E5%BE%AA%E7%8E%AF%E6%9C%BA%E5%88%B6.html\":\"/article/58uvabcv/\",\"/custom/interview/%E7%BD%91%E7%BB%9C/%E6%B5%8F%E8%A7%88%E5%99%A8%E5%8E%9F%E7%90%86.html\":\"/article/shw7v3nf/\"}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/index.html.js"), meta: {"title":""} }],
  ["/pdfs/", { loader: () => import(/* webpackChunkName: "pdfs_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/pdfs/index.html.js"), meta: {"title":"PDF文档库"} }],
  ["/article/nrv6jx0i/", { loader: () => import(/* webpackChunkName: "article_nrv6jx0i_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/article/nrv6jx0i/index.html.js"), meta: {"title":"自定义组件"} }],
  ["/article/pwh98lnr/", { loader: () => import(/* webpackChunkName: "article_pwh98lnr_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/article/pwh98lnr/index.html.js"), meta: {"title":"Markdown"} }],
  ["/article/jglqoszm/", { loader: () => import(/* webpackChunkName: "article_jglqoszm_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/article/jglqoszm/index.html.js"), meta: {"title":"浏览器原理"} }],
  ["/demo/a5ygiuyx/", { loader: () => import(/* webpackChunkName: "demo_a5ygiuyx_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/demo/a5ygiuyx/index.html.js"), meta: {"title":"bar"} }],
  ["/demo/mgo1vntv/", { loader: () => import(/* webpackChunkName: "demo_mgo1vntv_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/demo/mgo1vntv/index.html.js"), meta: {"title":"foo"} }],
  ["/demo/", { loader: () => import(/* webpackChunkName: "demo_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/demo/index.html.js"), meta: {"title":"Demo"} }],
  ["/article/envm43wh/", { loader: () => import(/* webpackChunkName: "article_envm43wh_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/article/envm43wh/index.html.js"), meta: {"title":"angular开发实战"} }],
  ["/article/szvgq90m/", { loader: () => import(/* webpackChunkName: "article_szvgq90m_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/article/szvgq90m/index.html.js"), meta: {"title":"flex"} }],
  ["/article/11kabumz/", { loader: () => import(/* webpackChunkName: "article_11kabumz_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/article/11kabumz/index.html.js"), meta: {"title":"IntersectionObserver"} }],
  ["/article/58uvabcv/", { loader: () => import(/* webpackChunkName: "article_58uvabcv_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/article/58uvabcv/index.html.js"), meta: {"title":"事件循环机制"} }],
  ["/custom/interview/angular/", { loader: () => import(/* webpackChunkName: "custom_interview_angular_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/custom/interview/angular/index.html.js"), meta: {"title":"Angular 高级开发核心大纲"} }],
  ["/article/shw7v3nf/", { loader: () => import(/* webpackChunkName: "article_shw7v3nf_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/article/shw7v3nf/index.html.js"), meta: {"title":"浏览器原理"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/404.html.js"), meta: {"title":""} }],
  ["/blog/", { loader: () => import(/* webpackChunkName: "blog_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/blog/index.html.js"), meta: {"title":"博客"} }],
  ["/blog/tags/", { loader: () => import(/* webpackChunkName: "blog_tags_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/blog/tags/index.html.js"), meta: {"title":"标签"} }],
  ["/blog/archives/", { loader: () => import(/* webpackChunkName: "blog_archives_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/blog/archives/index.html.js"), meta: {"title":"归档"} }],
  ["/blog/categories/", { loader: () => import(/* webpackChunkName: "blog_categories_index.html" */"F:/project/Jateyan.github.io/docs/.vuepress/.temp/pages/blog/categories/index.html.js"), meta: {"title":"分类"} }],
]);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateRoutes) {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
  }
  if (__VUE_HMR_RUNTIME__.updateRedirects) {
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ routes, redirects }) => {
    __VUE_HMR_RUNTIME__.updateRoutes(routes)
    __VUE_HMR_RUNTIME__.updateRedirects(redirects)
  })
}
