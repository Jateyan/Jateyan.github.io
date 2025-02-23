export const navbar = [
  {
    text: "首页",
    link: "/",
  },
  {
    text: "课程",
    link: "/course/",
    children: [
      {
        text: "angular开发实战",
        link: "/course/angular-note/angular开发实战",
      },
    ],
  },
  {
    text: "前端",
    link: "/front/",
    children: [
      {
        text: "html",
        link: "/front/html/",
      },
      {
        text: "js",
        link: "/front/js/",
      },
      {
        text: "css",
        link: "/front/css/",
      },
      {
        text: "网络",
        link: "/front/network/",
      },
    ],
  },
  {
    text: "面试",
    link: "/interview/",
    children: [
      {
        text: "网络",
        link: "/interview/network/",
      },
    ],
  },
  {
    text: "AI",
    link: "/ai/",
  },
  {
    text: "其它",
    link: "/other/",
  },
  {
    text: "工具",
    link: "/tool/",
  },
  {
    text: 'Python教程',
    link: '/python-tutorial.html'
  }
]; 