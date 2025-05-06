---
title: vite
createTime: 2025/04/30 10:57:58
permalink: /article/4ujbsx18/
---

# Vite面试题大纲

## 基础概念

1. **Vite是什么？它的核心特点是什么？**
   - Vite是一个现代前端构建工具，由Vue.js的创建者尤雨溪开发
   - 利用浏览器原生ES模块导入（ESM）实现开发服务器
   - 使用Rollup进行生产环境打包
   - 开发环境下无需打包，按需编译，实现极速的冷启动和热更新
   
   **原理解析**：
   
   Vite的核心原理是利用浏览器原生支持的ES模块系统，开发环境下不打包源码，而是直接让浏览器请求所需模块。这种按需加载的方式避免了传统打包工具构建整个应用的开销。
   
   ```javascript
   // 传统打包工具(webpack)的开发流程
   项目源码 -> 构建整个应用 -> 启动开发服务器 -> 浏览器加载
   
   // Vite的开发流程
   启动开发服务器 -> 浏览器请求模块 -> Vite处理请求的模块 -> 浏览器接收并执行
   ```
   
   **开发环境和生产环境的工作方式**：
   
   ```
   ┌─────────────────────────────┐
   │       开发环境 (Dev)         │
   ├─────────────────────────────┤
   │ 1. 原生ESM                  │
   │ 2. 无需打包                 │
   │ 3. 按需编译                 │
   │ 4. 热模块替换(HMR)          │
   └─────────────────────────────┘
           │
           ▼
   ┌─────────────────────────────┐
   │       生产环境 (Build)      │
   ├─────────────────────────────┤
   │ 1. 使用Rollup打包           │
   │ 2. 高度优化的静态资源       │
   │ 3. CSS代码分割              │
   │ 4. 预设的优化配置           │
   └─────────────────────────────┘
   ```

2. **Vite与传统构建工具(如Webpack)相比有哪些优势和劣势？**
   - **优势**：
     - 开发服务器启动速度极快（无需打包）
     - HMR性能更好，只需重新编译修改的文件
     - 按需编译，提高开发效率
     - 开箱即用的优化配置
     - 简洁直观的配置方式
   
   - **劣势**：
     - 生态系统相较Webpack较小
     - 仅支持ESM模块规范，对于CommonJS支持有限
     - 对旧版浏览器兼容性支持需额外配置
     - 尚未经过大规模长期项目验证
   
   **性能对比**：
   
   ```
   ┌────────────────────────────────────────────────────┐
   │                     启动时间对比                    │
   ├────────────────────────────────────────────────────┤
   │                                                    │
   │  Webpack ████████████████████████████████████ 30s  │
   │                                                    │
   │  Vite    ████ 3s                                   │
   │                                                    │
   └────────────────────────────────────────────────────┘
   
   ┌────────────────────────────────────────────────────┐
   │                     HMR速度对比                     │
   ├────────────────────────────────────────────────────┤
   │                                                    │
   │  Webpack ████████████ 1.2s                         │
   │                                                    │
   │  Vite    █ 0.1s                                    │
   │                                                    │
   └────────────────────────────────────────────────────┘
   ```
   
   **代码示例对比**：
   
   ```html
   <!-- Webpack开发环境中的模块请求 -->
   <script src="/bundle.js"></script>
   
   <!-- Vite开发环境中的模块请求 -->
   <script type="module">
     import { createApp } from '/node_modules/.vite/vue.js'
     import App from '/src/App.vue'
     // 原生ESM直接导入
   </script>
   ```

3. **什么是ESM？它如何使Vite比传统打包工具更快？**
   - ESM是ECMAScript Module的缩写，是JavaScript官方的标准模块系统
   - 浏览器原生支持通过`<script type="module">`加载ESM
   - ESM支持静态分析，可以在编译时确定依赖关系
   - 支持异步加载模块，按需执行
   
   **Vite利用ESM的优势**：
   
   ```javascript
   // 浏览器请求main.js
   import { createApp } from 'vue'
   import App from './App.vue'
   import './index.css'
   
   // Vite拦截这些导入请求:
   // 1. 将vue重定向到/node_modules/.vite/vue.js
   // 2. 编译App.vue为JavaScript
   // 3. 转换index.css为可注入的JavaScript
   ```
   
   **浏览器请求流程**：
   
   ```
   ┌──────────────┐    请求模块     ┌──────────────┐     按需转换     ┌──────────────┐
   │              ├───────────────► │              ├────────────────► │              │
   │    浏览器    │                 │  Vite Server  │                 │  源代码文件  │
   │              │ ◄───────────────┤              │ ◄────────────────┤              │
   └──────────────┘   返回转换后的   └──────────────┘     读取文件     └──────────────┘
                       模块代码
   ```

4. **Vite的预构建功能是什么？它解决了什么问题？**
   - Vite会预构建项目依赖项（node_modules中的第三方库）
   - 将CommonJS/UMD转换为ESM格式以供浏览器使用
   - 将有大量内部模块的依赖包转换为单个模块提高加载性能
   - 缓存预构建结果提高后续启动速度
   
   **预构建过程**：
   
   ```
   依赖预构建流程：
   1. 分析项目中的依赖
   2. 使用esbuild将依赖转换为ESM
   3. 缓存结果到node_modules/.vite
   4. 后续启动时优先使用缓存
   ```
   
   **代码示例**：
   
   ```javascript
   // vite.config.js - 自定义预构建选项
   export default {
     optimizeDeps: {
       // 强制预构建这些依赖
       include: ['lodash-es', 'vue'],
       // 排除不需要预构建的依赖
       exclude: ['large-library'],
       // 自定义esbuild选项
       esbuildOptions: {
         // esbuild配置
       }
     }
   }
   ```

## 配置与使用

5. **如何创建Vite项目？支持哪些框架模板？**
   - 使用Vite提供的脚手架工具创建项目
   - 支持Vue、React、Preact、Lit、Svelte等流行框架
   - 可选TypeScript支持
   
   **创建项目命令**：
   
   ```bash
   # 使用npm
   npm create vite@latest my-app -- --template vue
   
   # 使用yarn
   yarn create vite my-app --template react-ts
   
   # 使用pnpm
   pnpm create vite my-app -- --template svelte
   ```
   
   **可用模板列表**：
   
   | 框架    | JavaScript | TypeScript      |
   | ------- | ---------- | --------------- |
   | Vue     | vue        | vue-ts          |
   | React   | react      | react-ts        |
   | Preact  | preact     | preact-ts       |
   | Lit     | lit        | lit-ts          |
   | Svelte  | svelte     | svelte-ts       |
   | Vanilla | vanilla    | vanilla-ts      |

6. **Vite的配置文件有哪些特点？如何配置常见选项？**
   - 使用ESM格式的配置文件(vite.config.js/ts)
   - 支持智能类型提示
   - 可基于命令或环境变量使用条件配置
   - 提供丰富的插件和集成选项
   
   **基本配置示例**：
   
   ```javascript
   // vite.config.js
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'
   import path from 'path'
   
   export default defineConfig({
     // 使用插件
     plugins: [vue()],
     
     // 开发服务器选项
     server: {
       port: 3000,
       open: true,
       proxy: {
         '/api': {
           target: 'http://localhost:8080',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api/, '')
         }
       }
     },
     
     // 路径别名
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src')
       }
     },
     
     // 构建选项
     build: {
       outDir: 'dist',
       assetsDir: 'assets',
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true
         }
       },
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['vue', 'vue-router'],
             utils: ['lodash-es']
           }
         }
       }
     },
     
     // CSS相关选项
     css: {
       preprocessorOptions: {
         scss: {
           additionalData: `@import "@/styles/variables.scss";`
         }
       }
     }
   })
   ```
   
   **环境特定配置**：
   
   ```javascript
   // vite.config.js
   export default defineConfig(({ command, mode }) => {
     const isProduction = mode === 'production'
     
     return {
       // 根据环境返回不同配置
       plugins: isProduction ? [productionPlugins] : [devPlugins],
       build: {
         minify: isProduction ? 'terser' : false
       }
     }
   })
   ```

7. **Vite如何处理各种类型的资源（CSS、静态资源等）？**
   - CSS: 支持预处理器，CSS模块化，PostCSS
   - 静态资源: 基于ESM的统一导入方式
   - JSON: 支持具名导入优化tree-shaking
   - Web Workers: 简化的导入方式
   
   **CSS处理**：
   
   ```javascript
   // 导入CSS
   import './style.css'
   
   // CSS模块 - style.module.css
   import styles from './style.module.css'
   element.className = styles.header
   
   // 使用预处理器
   import './style.scss'
   
   // PostCSS配置
   // postcss.config.js
   module.exports = {
     plugins: [
       require('autoprefixer'),
       require('postcss-nested')
     ]
   }
   ```
   
   **静态资源处理**：
   
   ```javascript
   // 导入资源路径
   import imgUrl from './img.png'
   document.getElementById('hero').src = imgUrl
   
   // 导入资源为字符串
   import svgContent from './icon.svg?raw'
   
   // 显式加载资源为URL
   import jsURL from './worker.js?url'
   
   // 导入JSON (支持具名导入)
   import { version } from './package.json'
   console.log(version)
   
   // Web Worker
   import Worker from './worker?worker'
   const worker = new Worker()
   ```

8. **Vite开发服务器有哪些特点？如何配置代理和CORS？**
   - 基于原生ESM的开发服务器
   - 快速的模块热更新(HMR)
   - 内置代理配置能力
   - 灵活的中间件API
   
   **开发服务器配置**：
   
   ```javascript
   // vite.config.js
   export default defineConfig({
     server: {
       // 指定端口
       port: 3000,
       // 启动时自动打开浏览器
       open: true,
       // 允许局域网访问
       host: '0.0.0.0',
       // 启用HTTPS
       https: true,
       // 热更新配置
       hmr: {
         overlay: false
       },
       // 代理配置
       proxy: {
         // 字符串简写写法
         '/api': 'http://localhost:3001',
         // 选项写法
         '/api2': {
           target: 'http://jsonplaceholder.typicode.com',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api2/, '')
         },
         // 正则表达式写法
         '^/fallback/.*': {
           target: 'http://jsonplaceholder.typicode.com',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/fallback/, '')
         }
       },
       // 配置CORS
       cors: true
     }
   })
   ```

## 插件系统与扩展

9. **Vite的插件系统是怎样的？它与Rollup插件有什么关系？**
   - Vite的插件系统兼容Rollup插件API
   - 同时提供了Vite特有的钩子用于开发服务器
   - 插件可以拦截和转换请求、扩展配置、注入代码等
   - 通过插件机制实现框架集成和功能扩展
   
   **Vite插件钩子**：
   
   ```javascript
   // 自定义Vite插件示例
   export default function myPlugin() {
     return {
       // 插件名称
       name: 'my-plugin',
       
       // Rollup钩子 - 通用构建钩子
       options(options) {
         // 修改或扩展Rollup选项
         return options
       },
       
       resolveId(source) {
         // 自定义解析逻辑
         if (source === 'virtual-module') {
           return source // 返回source表示已解析
         }
         return null // 返回null让其他插件处理
       },
       
       load(id) {
         // 加载模块内容
         if (id === 'virtual-module') {
           return 'export default "这是一个虚拟模块"'
         }
         return null
       },
       
       transform(code, id) {
         // 转换代码
         if (id.endsWith('.special.js')) {
           return {
             code: code.replace(/console\.log/g, 'console.error'),
             map: null // 可以提供source map
           }
         }
       },
       
       // Vite特有钩子
       configureServer(server) {
         // 配置开发服务器
         server.middlewares.use((req, res, next) => {
           // 自定义中间件
           next()
         })
       },
       
       configResolved(resolvedConfig) {
         // 保存解析后的配置
         // 当插件需要访问最终解析的配置时很有用
       },
       
       transformIndexHtml(html) {
         // 转换index.html
         return html.replace(
           /<title>(.*?)<\/title>/,
           `<title>Modified Title</title>`
         )
       },
       
       handleHotUpdate(ctx) {
         // 自定义HMR更新处理
         // 可以过滤和定制HMR更新
       }
     }
   }
   ```
   
   **使用插件的方式**：
   
   ```javascript
   // vite.config.js
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'
   import legacy from '@vitejs/plugin-legacy'
   import myPlugin from './plugins/my-plugin'
   
   export default defineConfig({
     plugins: [
       vue(),
       legacy({
         targets: ['defaults', 'not IE 11']
       }),
       myPlugin({
         // 插件选项
       })
     ]
   })
   ```

10. **常用的Vite插件有哪些？它们解决了什么问题？**
    - @vitejs/plugin-vue: 提供Vue单文件组件支持
    - @vitejs/plugin-react: 提供React支持
    - @vitejs/plugin-legacy: 为旧浏览器提供兼容性支持
    - vite-plugin-pwa: 添加PWA支持
    - vite-plugin-compression: 压缩构建输出
    
    **插件使用示例**：
    
    ```javascript
    // vite.config.js
    import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'
    import legacy from '@vitejs/plugin-legacy'
    import { VitePWA } from 'vite-plugin-pwa'
    import viteCompression from 'vite-plugin-compression'
    
    export default defineConfig({
      plugins: [
        vue(), // Vue SFC支持
        
        // 旧浏览器兼容性
        legacy({
          targets: ['> 1%', 'last 2 versions', 'not dead'],
          modernPolyfills: true
        }),
        
        // PWA支持
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
          manifest: {
            name: 'My App',
            short_name: 'App',
            theme_color: '#ffffff',
            icons: [
              // ...图标配置
            ]
          }
        }),
        
        // 构建压缩
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'gzip',
          ext: '.gz'
        })
      ]
    })
    ```
    
    **自定义插件示例 - 自动导入组件**：
    
    ```javascript
    // vite-plugin-auto-import.js
    export default function autoImport(options = {}) {
      const { components = {}, directives = {} } = options
      
      return {
        name: 'vite-plugin-auto-import',
        transform(code, id) {
          if (!id.endsWith('.vue')) return null
          
          // 创建导入语句
          let imports = ''
          let componentsMap = ''
          
          Object.entries(components).forEach(([name, path]) => {
            imports += `import ${name} from '${path}';\n`
            componentsMap += `'${name}': ${name},\n`
          })
          
          // 添加到代码中
          return {
            code: `${imports}\n${code.replace(
              '<script>',
              `<script>
              export default {
                components: {
                  ${componentsMap}
                  ...
                }
              }
              `
            )}`,
            map: null
          }
        }
      }
    }
    ```

11. **如何编写自定义Vite插件？请举例说明**
    - Vite插件是包含特定钩子的对象
    - 可以影响构建过程、开发服务器行为、代码转换等
    - 通常以函数形式编写，返回插件对象
    
    **简单的静态路由自动生成插件**：
    
    ```javascript
    // vite-plugin-auto-routes.js
    import fs from 'fs'
    import path from 'path'
    
    export default function autoRoutes(options = {}) {
      const {
        pagesDir = 'src/pages',
        routeOutput = 'src/router/routes.js',
        exclude = []
      } = options
      
      return {
        name: 'vite-plugin-auto-routes',
        
        // 在构建开始时运行
        buildStart() {
          const absolutePagesDir = path.resolve(pagesDir)
          const files = scanPagesDir(absolutePagesDir)
          
          // 生成路由数组
          const routes = files
            .filter(file => !exclude.some(ex => file.includes(ex)))
            .map(file => {
              const relativePath = file.replace(absolutePagesDir, '')
              const routePath = relativePath
                .replace(/index\.(vue|jsx|tsx)$/, '')
                .replace(/\.(vue|jsx|tsx)$/, '')
                .replace(/\\/g, '/')
                .replace(/\[([^\]]+)\]/g, ':$1') // [id] -> :id
              
              return {
                path: routePath || '/',
                component: `() => import('${file.replace(/\\/g, '/')}')`,
                name: routePath.replace(/\//g, '_') || 'home'
              }
            })
          
          // 生成路由文件内容
          const routesFileContent = `
            // 自动生成的路由文件，请勿手动修改
            export default [
              ${routes.map(route => `
                {
                  path: '${route.path}',
                  component: ${route.component},
                  name: '${route.name}'
                }
              `).join(',\n')}
            ]
          `
          
          // 写入文件
          fs.writeFileSync(
            path.resolve(routeOutput),
            routesFileContent,
            'utf-8'
          )
        },
        
        // 监听配置解析完成
        configResolved(config) {
          // 可以保存配置，以便在其他钩子中使用
          this.config = config
        },
        
        // 监听开发服务器启动
        configureServer(server) {
          // 监听文件变化，重新生成路由
          server.watcher.add(path.resolve(pagesDir))
          
          server.watcher.on('add', file => {
            if (file.match(/\.(vue|jsx|tsx)$/)) {
              this.buildStart()
            }
          })
          
          server.watcher.on('unlink', file => {
            if (file.match(/\.(vue|jsx|tsx)$/)) {
              this.buildStart()
            }
          })
        }
      }
    }
    
    // 辅助函数：扫描页面目录
    function scanPagesDir(dir, files = []) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          scanPagesDir(fullPath, files)
        } else if (/\.(vue|jsx|tsx)$/.test(entry.name)) {
          files.push(fullPath)
        }
      }
      
      return files
    }
    ```
