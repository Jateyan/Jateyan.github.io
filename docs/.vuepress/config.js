import { blogPlugin } from "@vuepress/plugin-blog";
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";

export default defineUserConfig({
  lang: "en-US",
  title: "柠檬小站",
  description: "个人记录博客",
  theme: defaultTheme({
    logo: "https://vuejs.press/images/hero.png",
    navbar: [
      {
        text: "首页",
        link: "/",
      },
      {
        text: "前端",
        link: "/front/",
        children: [
          {
            text: "angular开发实战",
            link: "/front/angular-note/angular-enterprise-development", // 建议修改为英文命名,避免中文和空格导致的路径问题
          },
        ],
      },
      {
        text: "其它",
        link: "/other/",
      },
      {
        text: "工具",
        link: "/tool/",
      },
      // {
      //   text: '',
      //   link: '/tag/',
      // },
      // {
      //   text: 'Timeline',
      //   link: '/timeline/',
      // },
    ],
  }),

  plugins: [
    blogPlugin({
      // // Only files under posts are articles
      // filter: ({ filePathRelative }) =>
      //   filePathRelative ? filePathRelative.startsWith('posts/') : false,
      // // Getting article info
      // getInfo: ({ frontmatter, title, data }) => ({
      //   title,
      //   author: frontmatter.author || '',
      //   date: frontmatter.date || null,
      //   category: frontmatter.category || [],
      //   tag: frontmatter.tag || [],
      //   excerpt:
      //     // Support manually set excerpt through frontmatter
      //     typeof frontmatter.excerpt === 'string'
      //       ? frontmatter.excerpt
      //       : data?.excerpt || '',
      // }),
      // // Generate excerpt for all pages excerpt those users choose to disable
      // excerptFilter: ({ frontmatter }) =>
      //   !frontmatter.home &&
      //   frontmatter.excerpt !== false &&
      //   typeof frontmatter.excerpt !== 'string',
      // category: [
      //   {
      //     key: 'category',
      //     getter: (page) => page.frontmatter.category || [],
      //     layout: 'Category',
      //     itemLayout: 'Category',
      //     frontmatter: () => ({
      //       title: 'Categories',
      //       sidebar: false,
      //     }),
      //     itemFrontmatter: (name) => ({
      //       title: `Category ${name}`,
      //       sidebar: false,
      //     }),
      //   },
      //   {
      //     key: 'tag',
      //     getter: (page) => page.frontmatter.tag || [],
      //     layout: 'Tag',
      //     itemLayout: 'Tag',
      //     frontmatter: () => ({
      //       title: 'Tags',
      //       sidebar: false,
      //     }),
      //     itemFrontmatter: (name) => ({
      //       title: `Tag ${name}`,
      //       sidebar: false,
      //     }),
      //   },
      // ],
      // type: [
      //   {
      //     key: 'article',
      //     // Remove archive articles
      //     filter: (page) => !page.frontmatter.archive,
      //     layout: 'Article',
      //     frontmatter: () => ({
      //       title: 'Articles',
      //       sidebar: false,
      //     }),
      //     // Sort pages with time and sticky
      //     sorter: (pageA, pageB) => {
      //       if (pageA.frontmatter.sticky && pageB.frontmatter.sticky)
      //         return pageB.frontmatter.sticky - pageA.frontmatter.sticky
      //       if (pageA.frontmatter.sticky && !pageB.frontmatter.sticky) return -1
      //       if (!pageA.frontmatter.sticky && pageB.frontmatter.sticky) return 1
      //       if (!pageB.frontmatter.date) return 1
      //       if (!pageA.frontmatter.date) return -1
      //       return (
      //         new Date(pageB.frontmatter.date).getTime() -
      //         new Date(pageA.frontmatter.date).getTime()
      //       )
      //     },
      //   },
      //   {
      //     key: 'timeline',
      //     // Only article with date should be added to timeline
      //     filter: (page) => page.frontmatter.date instanceof Date,
      //     // Sort pages with time
      //     sorter: (pageA, pageB) =>
      //       new Date(pageB.frontmatter.date).getTime() -
      //       new Date(pageA.frontmatter.date).getTime(),
      //     layout: 'Timeline',
      //     frontmatter: () => ({
      //       title: 'Timeline',
      //       sidebar: false,
      //     }),
      //   },
      // ],
      // hotReload: true,
    }),
  ],

  bundler: viteBundler(),
});
