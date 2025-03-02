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
    ],
  },
  {
    text: "面试",
    items: [
      {
        text: "网络",
        link: "/custom/interview/network/",
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
])
