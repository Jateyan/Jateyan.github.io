import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
  {
    text: "首页",
    link: "/",
  },
  {
    text: "课程",
    items: [
      {
        text: "angular开发实战",
        link: "/custom/course/angular-note/angular开发实战",
      },
    ],
  },
  {
    text: "前端",
    items: [
      {
        text: "html",
        link: "/custom/front/html/",
      },
      {
        text: "js",
        link: "/custom/front/js/",
      },
      {
        text: "css",
        link: "/custom/front/css/",
      },
      {
        text: "网络",
        link: "/custom/front/network/",
      },
      {
        text: "angular",
        items:[
          {
            text: "angular文章大纲",
            link: "/custom/front/angular/index.md",
          },
        ]
      },
      {
        text: "vue",
        items:[
          {
            text: "vue文章大纲",
            link: "/custom/front/vue/index.md",
          },
          {
            text: "架构",
            link: "/custom/front/vue/架构.md",
          },
          {
            text: "响应式系统",
            link: "/custom/front/vue/响应式系统.md",
          },
            {
              text: "Composition API",
              link: "/custom/front/vue/Composition-API.md",
            },
            {
              text: "性能优化",
              link: "/custom/front/vue/性能优化.md",
            },
            {
              text: "内置组件",
              link: "/custom/front/vue/内置组件.md",
            },
            {
              text: "新增API",
              link: "/custom/front/vue/新增API.md",
            },
            {
              text: "模板与指令",
              link: "/custom/front/vue/模板与指令.md",
            },
            {
              text: "TypeScript",
              link: "/custom/front/vue/TypeScript.md",
            },
        ]
      },
      {
        text: "react",
        items:[
          {
            text: "react文章大纲",
            link: "/custom/front/react/index.md",
          },
        ]
      },
    ],
  },
  {
    text: "面试",
    items: [
      {
        text: "网络",
        link: "/custom/interview/network/",
      },
      {
        text: "angular",
        link: "/custom/interview/angular/index.md",
      },
    ],
  },
  // {
  //   text: "AI",
  //   items:[]
  // },
  // {
  //   text: "其它",
  //   items:[]
  // },
  // {
  //   text: "工具",
  //   items:[]
  // },
  // {
  //   text: 'Python教程',
  //   items:[]
  // }
  {
    text: 'PDF文档',
    link: '/pdfs/',
  },
])
