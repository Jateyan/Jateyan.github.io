---
home: true
heroImage: https://vuejs.press/images/hero.png
heroText: 柠檬小站1
tagline: 专注全栈开发与技术分享
actions:
  - text: 开始阅读
    link: /guide/
    type: primary
  - text: 技术博客
    link: /blog/
    type: secondary
features:
  - title: 🚀 技术栈
    details: Vue3 / React / TypeScript / Node.js / Python / 微服务 / DevOps / 云原生
  - title: 💡 最佳实践
    details: 深入研究前端工程化、性能优化、架构设计等技术难点，分享实战经验
  - title: 🛠 开源项目
    details: 持续维护多个开源项目，涵盖前端工具链、组件库、脚手架等领域
  - title: 📚 学习资源
    details: 系统化的学习笔记、技术教程，助你构建完整的知识体系
  - title: 🔥 技术前沿
    details: 持续关注业界动态，分享前沿技术趋势和创新实践
  - title: 🌟 经验分享
    details: 多年大厂工作经验，分享技术选型、团队管理、职业发展等话题
footer: MIT Licensed | Copyright © 2024-present
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 添加页面动效
})
</script>

<style lang="less">
.home {
  // 自定义首页样式
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  .hero {
    text-align: center;
    margin-bottom: 4rem;

    img {
      max-width: 200px;
      margin: 2rem auto;
    }

    h1 {
      font-size: 3rem;
      margin: 1rem 0;
    }

    .description {
      font-size: 1.4rem;
      margin: 1rem 0;
    }

    .action-button {
      display: inline-block;
      padding: 0.8rem 1.6rem;
      margin: 1rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
      
      &.primary {
        background-color: var(--c-brand);
        color: var(--c-bg);
        
        &:hover {
          background-color: var(--c-brand-light);
        }
      }
      
      &.secondary {
        border: 1px solid var(--c-brand);
        color: var(--c-brand);
        
        &:hover {
          color: var(--c-bg);
          background-color: var(--c-brand);
        }
      }
    }
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem 0;

    .feature {
      background: var(--c-bg-light);
      padding: 2rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      h2 {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        color: var(--c-text);
      }

      p {
        color: var(--c-text-light);
        line-height: 1.6;
      }
    }
  }
}

@media (max-width: 719px) {
  .home {
    padding: 1rem;
    
    .features {
      grid-template-columns: 1fr;
    }
  }
}
</style>
