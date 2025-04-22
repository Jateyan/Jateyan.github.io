---
title: Node.js全栈开发
description: Node.js核心原理、异步编程、框架应用与性能优化
head:
  - - meta
    - name: keywords
      content: Node.js, JavaScript, Express, Koa, MongoDB, 微服务, 性能优化
  - - meta
    - name: charset
    - content: UTF-8
  - - meta
    - http-equiv: Content-Type
    - content: text/html; charset=utf-8
lang: zh-CN
---

# Node.js全栈开发

## Node.js基础

### 运行时架构

Node.js是一个基于Chrome V8引擎的JavaScript运行时环境，它的架构设计使JavaScript能够在服务器端高效运行。以下是Node.js核心架构组件及其工作原理。

#### 架构概述

Node.js架构由几个关键组件构成，彼此协同工作形成完整的运行时环境：

```
+---------------------------------------------+
|               Node.js 应用                   |
+---------------------------------------------+
|                                             |
|  +-------------+        +-----------------+ |
|  |    用户代码   |        |    内置模块      | |
|  +-------------+        +-----------------+ |
|                                             |
+---------------------------------------------+
|                  绑定层                      |
+---------------------------------------------+
|                                             |
| +----------+  +--------+  +----------------+|
| |    V8    |  | libuv  |  |   其他C/C++库   ||
| +----------+  +--------+  +----------------+|
|                                             |
+---------------------------------------------+
|                操作系统                      |
+---------------------------------------------+
```

##### V8引擎

V8是Google开发的高性能JavaScript引擎，为Node.js提供了JavaScript执行环境。

**核心特性：**
- 将JavaScript代码编译为机器码而非解释执行
- 高效的内存管理和垃圾回收
- 优化的对象系统
- 支持ECMAScript标准

```javascript
// V8处理JavaScript的示例
function calculateFibonacci(n) {
  if (n <= 1) return n;
  return calculateFibonacci(n-1) + calculateFibonacci(n-2);
}

console.log(calculateFibonacci(10)); // V8会优化这个递归调用
```

##### libuv

libuv是Node.js的核心库之一，提供了跨平台的异步I/O能力。

**主要功能：**
- 事件循环实现
- 跨平台文件系统操作
- 网络I/O操作
- 线程池管理
- 信号处理

```javascript
// libuv处理的异步文件操作示例
const fs = require('fs');

// 这个API调用会被转发到libuv的线程池处理
fs.readFile('/path/to/file', (err, data) => {
  if (err) throw err;
  console.log('文件读取完成');
});

console.log('继续执行其他代码'); // 立即执行，不等待文件读取
```

##### 事件循环

事件循环是Node.js的核心执行模型，使单线程的JavaScript能高效处理并发操作。

**事件循环流程：**

```
    +----------------+
    |    开始循环     |
    +-------+--------+
            |
            v
    +-------+--------+
    |   timers阶段   | <-- setTimeout, setInterval回调
    +-------+--------+
            |
            v
    +-------+--------+
    | pending回调阶段 | <-- 系统操作延迟的回调
    +-------+--------+
            |
            v
    +-------+--------+
    |  idle, prepare  | <-- 内部使用
    +-------+--------+
            |
            v
    +-------+--------+
    |   poll阶段     | <-- 处理新I/O事件，获取新I/O回调
    +-------+--------+
            |
            v
    +-------+--------+
    |   check阶段    | <-- setImmediate回调
    +-------+--------+
            |
            v
    +-------+--------+
    |   close阶段    | <-- 关闭回调 如socket.on('close',...)
    +-------+--------+
            |
            v
    +-------+--------+
    |  更多待处理?   | --是--> 回到timers阶段
    +-------+--------+
            |
            否
            v
    +-------+--------+
    |    结束程序    |
    +----------------+
```

```javascript
// 事件循环执行顺序示例
console.log('1 - 开始');

setTimeout(() => {
  console.log('2 - 定时器回调');
}, 0);

setImmediate(() => {
  console.log('3 - 立即回调');
});

process.nextTick(() => {
  console.log('4 - nextTick回调');
});

console.log('5 - 结束');

// 输出顺序:
// 1 - 开始
// 5 - 结束
// 4 - nextTick回调
// 2 - 定时器回调
// 3 - 立即回调
```

##### 模块系统

Node.js的模块系统允许代码组织和重用，主要基于CommonJS规范，同时在新版本中支持ES模块。

**模块类型：**
- 核心模块 - Node.js自带的模块如fs、http
- 文件模块 - 本地文件中的JavaScript代码
- 第三方模块 - npm安装的外部包

```javascript
// CommonJS模块示例
// math.js
exports.add = function(a, b) {
  return a + b;
};

// app.js
const math = require('./math');
console.log(math.add(2, 3)); // 输出: 5
```

##### 内置模块

Node.js提供了丰富的内置模块，处理常见的服务器端任务：

- **fs** - 文件系统操作
- **http/https** - HTTP/HTTPS服务器和客户端
- **path** - 路径处理工具
- **os** - 操作系统信息
- **stream** - 流数据处理
- **buffer** - 二进制数据操作
- **crypto** - 加密功能
- **child_process** - 子进程管理

```javascript
// 内置模块使用示例
const os = require('os');
const fs = require('fs');
const http = require('http');

// 系统信息
console.log(`运行平台: ${os.platform()}`);
console.log(`CPU架构: ${os.arch()}`);
console.log(`可用内存: ${os.freemem() / 1024 / 1024} MB`);

// 创建HTTP服务器
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(3000);

console.log('服务器运行在 http://localhost:3000/');
```

#### 执行模型

Node.js的执行模型具有独特的特点，以下是详细介绍：

##### 单线程模型

Node.js使用单线程执行JavaScript代码，避免了多线程编程的复杂性。

**特点和优势：**
- 简化编程模型，无需线程同步
- 避免线程上下文切换开销
- 有效利用系统资源
- 通过事件驱动处理并发

**局限性：**
- CPU密集型任务会阻塞主线程
- 需要谨慎处理异常以防进程崩溃

```
单线程与多线程对比:

单线程模型(Node.js):
线程1: [任务A] -> [任务B] -> [任务C] -> [任务D]
       处理方式: 利用异步I/O在等待时执行其他任务

多线程模型:
线程1: [任务A] -> [等待I/O] --------------------> [处理结果]
线程2: -----------> [任务B] -> [等待I/O] -------> [处理结果]
线程3: -----------------------> [任务C] -------> [处理结果]
```

```javascript
// 单线程模型示例
function blockingOperation() {
  // 长时间运行的同步操作会阻塞整个Node.js进程
  const start = Date.now();
  while(Date.now() - start < 3000) {
    // 执行密集计算
  }
  return '操作完成';
}

console.log('开始执行');
console.log(blockingOperation()); // 这会阻塞约3秒
console.log('执行结束'); // 3秒后才会执行
```

##### 事件驱动

Node.js采用事件驱动编程模型，通过回调函数和事件监听处理异步操作。

**工作流程：**
1. 注册事件和回调
2. 事件触发时执行回调
3. 主线程空闲时继续处理事件队列

```
事件驱动工作流程:

+-------------+    +-------------+    +-------------+
| 注册事件处理 | -> | 事件进入队列 | -> | 事件循环处理 |
+-------------+    +-------------+    +-------------+
                           ^                 |
                           |                 v
                   +----------------+    +-------------+
                   | 外部事件触发器  | <- | 执行回调函数 |
                   +----------------+    +-------------+
```

```javascript
// 事件驱动编程示例
const EventEmitter = require('events');

// 创建事件发射器
class JobProcessor extends EventEmitter {
  processData(data) {
    // 异步处理数据
    console.log('开始处理数据');
    
    setTimeout(() => {
      // 完成后触发事件
      const result = data.toUpperCase();
      this.emit('processed', result);
    }, 1000);
  }
}

// 创建实例
const processor = new JobProcessor();

// 注册事件监听器
processor.on('processed', (result) => {
  console.log('处理完成，结果:', result);
});

// 启动处理
processor.processData('hello node.js');
console.log('处理请求已提交'); // 立即执行
```

##### 非阻塞I/O

Node.js使用非阻塞I/O模型，允许在等待I/O操作完成时继续执行其他代码。

**特点：**
- I/O操作不会阻塞主线程
- 可以同时处理多个I/O请求
- 回调函数在I/O完成时执行
- 提高了资源利用率

```
阻塞I/O vs 非阻塞I/O:

阻塞I/O:
+--------+  +------------+  +----------+
| 发起I/O | → | 等待I/O完成 | → | 处理结果 |
+--------+  +------------+  +----------+
      |          |               |
      v          v               v
时间轴 ------------------------------------>

非阻塞I/O:
+--------+                     +----------+
| 发起I/O | ------------------> | 处理结果 |
+--------+                     +----------+
      |                             |
      v                             v
时间轴 ------------------------------------>
       |                    |
       v                    v
    +----------+        +----------+
    | 执行其他任务 |        | I/O完成通知 |
    +----------+        +----------+
```

```javascript
// 非阻塞I/O示例
const fs = require('fs');

console.log('开始读取文件');

// 非阻塞文件读取
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    return console.error('读取错误:', err);
  }
  console.log('文件内容:', data);
});

console.log('继续执行其他操作'); // 立即执行，不等待文件读取完成
```

##### 回调机制

回调机制是Node.js处理异步操作的基本方式，遵循"错误优先"的回调模式。

**特点：**
- 函数作为参数传递给异步操作
- 操作完成后执行回调函数
- 错误优先的参数顺序(第一个参数为错误对象)
- 支持嵌套回调(可能导致回调地狱)

```javascript
// 错误优先回调示例
const fs = require('fs');

// 读取配置文件
function loadConfig(configPath, callback) {
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      return callback(err); // 出错时调用回调并传递错误
    }
    
    try {
      const config = JSON.parse(data);
      callback(null, config); // 成功时第一个参数为null，第二个参数为结果
    } catch (parseError) {
      callback(parseError); // 解析错误
    }
  });
}

// 使用loadConfig函数
loadConfig('./config.json', (err, config) => {
  if (err) {
    console.error('无法加载配置:', err);
    return;
  }
  
  console.log('配置已加载:', config);
  // 使用配置继续执行...
});
```

##### 错误处理

在Node.js中，正确处理错误对构建稳健应用至关重要。

**错误处理策略：**
- 同步代码中使用try/catch
- 异步代码中通过错误优先回调处理
- 使用Promise的.catch()或try/await捕获错误
- 使用process事件处理未捕获的错误

```javascript
// Node.js错误处理示例

// 1. 同步错误处理
try {
  const result = JSON.parse('{"invalidJSON":');
  console.log(result);
} catch (error) {
  console.error('解析错误:', error.message);
}

// 2. 异步错误处理 - 回调方式
fs.readFile('nonexistent.txt', (err, data) => {
  if (err) {
    console.error('读取错误:', err.message);
    return;
  }
  console.log(data);
});

// 3. Promise错误处理
const fsPromises = require('fs').promises;
fsPromises.readFile('nonexistent.txt')
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.error('Promise错误:', err.message);
  });

// 4. 全局未捕获错误处理
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 记录错误，执行清理操作
  // 注意: 捕获未处理的异常后应该重启进程，不应继续运行
  process.exit(1);
});

// 5. 未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 可以选择在这里终止进程
});
```

#### 核心特性

Node.js具有一系列关键特性，使其成为高效的服务器端JavaScript环境：

##### CommonJS规范

Node.js最初采用CommonJS模块系统，使JavaScript具备模块化能力。

**主要特点：**
- 模块作用域 - 变量不会污染全局命名空间
- 模块缓存 - 模块在首次加载后被缓存
- 同步加载 - 模块按需加载，顺序执行

```javascript
// CommonJS模块示例

// logger.js - 定义模块
function log(message) {
  console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
}

function error(message) {
  console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
}

// 导出模块功能
module.exports = {
  log,
  error
};

// app.js - 使用模块
const logger = require('./logger');

logger.log('应用启动');
// 尝试处理操作
try {
  // 一些可能抛出错误的代码
  throw new Error('操作失败');
} catch (err) {
  logger.error(err.message);
}
```

##### ES Module支持

Node.js现在也支持ES模块系统，与浏览器使用的标准JavaScript模块保持一致。

**特点：**
- 静态导入/导出 - 编译时确定模块结构
- 命名导出和默认导出
- 动态导入支持
- 严格模式默认启用

```javascript
// ES模块示例

// math.mjs
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export default class Calculator {
  constructor() {
    this.value = 0;
  }
  
  add(num) {
    this.value += num;
    return this;
  }
  
  subtract(num) {
    this.value -= num;
    return this;
  }
  
  getValue() {
    return this.value;
  }
}

// app.mjs
import Calculator, { add, multiply } from './math.mjs';

console.log(add(5, 3)); // 8
console.log(multiply(5, 3)); // 15

const calc = new Calculator();
console.log(calc.add(10).subtract(4).getValue()); // 6

// 动态导入
async function loadModule() {
  const math = await import('./math.mjs');
  console.log(math.add(7, 2)); // 9
}

loadModule();
```

##### 全局对象

Node.js提供了一系列全局对象和全局变量，在任何模块中都可以直接使用。

**主要全局对象：**
- `global` - 全局命名空间，类似浏览器的window
- `process` - 提供当前Node.js进程信息和控制
- `Buffer` - 处理二进制数据
- `__dirname` - 当前模块目录名
- `__filename` - 当前模块文件名
- `console` - 控制台输出工具
- `setTimeout/setInterval` - 定时器函数
- `require` - 模块加载函数

```javascript
// 全局对象和变量示例

// 进程信息
console.log(`Node.js版本: ${process.version}`);
console.log(`进程ID: ${process.pid}`);
console.log(`当前工作目录: ${process.cwd()}`);
console.log(`环境变量: ${JSON.stringify(process.env.NODE_ENV)}`);

// 模块信息
console.log(`当前文件: ${__filename}`);
console.log(`当前目录: ${__dirname}`);

// Buffer操作
const buf = Buffer.from('Hello, Node.js!');
console.log(buf); // <Buffer 48 65 6c 6c 6f 2c 20 4e 6f 64 65 2e 6a 73 21>
console.log(buf.toString()); // Hello, Node.js!

// 定时器
const timerId = setTimeout(() => {
  console.log('定时器执行');
}, 1000);

// 清除定时器
// clearTimeout(timerId);

// 进程事件
process.on('exit', (code) => {
  console.log(`进程退出，代码: ${code}`);
});

// 命令行参数
console.log('命令行参数:', process.argv);
```

##### 进程管理

Node.js提供了多种管理进程的机制，包括创建子进程和控制当前进程。

**主要特性：**
- 通过`child_process`模块创建子进程
- 进程间通信
- 集群模式支持多核CPU
- 优雅的进程退出

```javascript
// 进程管理示例
const { spawn, exec, fork } = require('child_process');

// 1. 使用spawn执行命令(流式处理输出)
const ls = spawn('ls', ['-la']);

ls.stdout.on('data', (data) => {
  console.log(`输出: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`错误: ${data}`);
});

ls.on('close', (code) => {
  console.log(`子进程退出，代码: ${code}`);
});

// 2. 使用exec执行命令(缓冲输出)
exec('find . -type f | wc -l', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行错误: ${error}`);
    return;
  }
  console.log(`文件数量: ${stdout}`);
});

// 3. 使用fork运行Node.js模块作为独立进程
// worker.js内容: 
// process.on('message', (msg) => {
//   console.log('Worker收到:', msg);
//   process.send({result: msg.num * 2});
// });

const worker = fork('./worker.js');

worker.on('message', (msg) => {
  console.log('主进程收到:', msg);
});

worker.send({num: 123});

// 4. 优雅退出
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，准备关闭');
  
  // 清理资源
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
  
  // 如果清理超时，强制退出
  setTimeout(() => {
    console.error('强制退出');
    process.exit(1);
  }, 5000);
});
```

##### 缓冲区处理

Buffer是Node.js处理二进制数据的核心机制，为I/O操作和网络通信提供支持。

**主要特性：**
- 创建和操作二进制数据
- 字符编码转换
- 与流无缝配合
- 内存高效的数据处理

```javascript
// Buffer操作示例

// 创建Buffer
const buf1 = Buffer.alloc(10); // 创建一个10字节的Buffer，填充0
const buf2 = Buffer.from('Hello, Node.js'); // 从字符串创建Buffer
const buf3 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // 从字节数组创建

// 写入数据
buf1.write('Hi');
console.log(buf1); // <Buffer 48 69 00 00 00 00 00 00 00 00>

// 读取数据
console.log(buf2.toString()); // Hello, Node.js
console.log(buf3.toString()); // Hello

// Buffer转换
console.log(buf2.toJSON()); // { type: 'Buffer', data: [72, 101, 108, 108, 111, 44, 32, 78, 111, 100, 101, 46, 106, 115] }

// 编码转换
const buf4 = Buffer.from('你好，Node.js', 'utf8');
console.log(buf4.length); // 字节长度
console.log(buf4.toString('hex')); // 转换为16进制字符串

// Buffer拼接
const buf5 = Buffer.concat([buf2, Buffer.from(' is awesome')]);
console.log(buf5.toString()); // Hello, Node.js is awesome

// Buffer比较
console.log(Buffer.compare(buf2, buf3)); // 比较两个Buffer

// Buffer查找
console.log(buf2.indexOf('Node')); // 找出'Node'在buf2中的位置

// Buffer复制
const bufTarget = Buffer.alloc(buf2.length);
buf2.copy(bufTarget);
console.log(bufTarget.toString()); // Hello, Node.js
```

以上就是Node.js运行时架构的详细介绍，包括其组成部分和核心特性。了解这些基础知识有助于更好地利用Node.js开发高效的服务器端应用。

### Node.js模块系统

Node.js模块系统是其核心设计之一，允许开发者将代码分割成独立、可重用的部分。这种模块化设计极大提高了代码的可维护性和复用性。Node.js支持两种模块系统：CommonJS（传统）和ES模块（较新）。

#### CommonJS模块

CommonJS是Node.js采用的原生模块系统，它定义了模块的加载、导出和依赖管理机制。

##### require机制

require是CommonJS模块系统的核心功能，用于加载和缓存模块。

**加载流程：**

```
+---------------------------+
| 1. 解析模块路径            |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 2. 检查模块缓存            |
+-------------+-------------+
              |
              v
+-------------+-------------+     是     +----------------+
| 3. 模块在缓存中？          +----------->| 返回缓存的模块  |
+-------------+-------------+            +----------------+
              | 否
              v
+-------------+-------------+
| 4. 加载模块文件            |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 5. 包装模块代码            |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 6. 执行模块代码            |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 7. 缓存模块导出            |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 8. 返回模块导出            |
+-------------+-------------+
```

```javascript
// require的使用示例

// 加载核心模块
const fs = require('fs');
const path = require('path');

// 加载本地模块（相对路径）
const myModule = require('./my-module');
const utils = require('../utils');

// 加载node_modules中的模块（不带路径）
const express = require('express');
const lodash = require('lodash');

// 加载JSON文件
const config = require('./config.json');
console.log(config.appName); // 直接作为对象使用

// 动态加载模块
function loadModule(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    console.error(`无法加载模块 ${moduleName}:`, error.message);
    return null;
  }
}

const dynamicModule = loadModule('./dynamic-module');
```

##### 模块缓存

Node.js对所有加载的模块进行缓存，以避免重复加载同一模块。

**缓存特性：**
- 模块在首次加载后被缓存
- 后续require同一模块将返回缓存的实例
- 模块缓存存储在`require.cache`对象中
- 可以通过操作`require.cache`清除缓存

```javascript
// 模块缓存示例

// moduleA.js
console.log('moduleA被加载');
module.exports = {
  name: 'Module A',
  count: 0,
  increment() {
    this.count++;
    return this.count;
  }
};

// app.js
console.log('首次加载moduleA');
const moduleA1 = require('./moduleA'); // 输出: moduleA被加载
moduleA1.increment();
console.log(moduleA1.count); // 输出: 1

console.log('再次加载moduleA');
const moduleA2 = require('./moduleA'); // 不会再输出加载信息
moduleA2.increment();
console.log(moduleA2.count); // 输出: 2（与moduleA1共享同一实例）

// 清除模块缓存
delete require.cache[require.resolve('./moduleA')];

console.log('清除缓存后再次加载moduleA');
const moduleA3 = require('./moduleA'); // 输出: moduleA被加载
console.log(moduleA3.count); // 输出: 0（新的实例）
```

##### 模块解析

Node.js模块解析是一个复杂过程，根据不同类型的模块路径采用不同的解析策略。

**模块路径解析规则：**

1. **核心模块**: 如`fs`、`http`等，直接从Node.js内部加载
2. **文件模块**:
   - 如果路径以`/`、`./`或`../`开头，则作为相对路径处理
   - 尝试直接加载文件
   - 尝试加载.js、.json、.node扩展名
   - 尝试加载目录（查找package.json或index.js）
3. **node_modules模块**:
   - 从当前目录的node_modules查找
   - 递归向上级目录的node_modules查找

```
模块解析路径查找顺序:

+----------------------------------------------+
| require('moduleA') - 非核心模块、非相对路径    |
+----------------------------------------------+
               |
      +--------+--------+
     /                   \
    v                     v
+----------+       +------------------+
| 核心模块? | 是---> | 返回内置核心模块  |
+----------+       +------------------+
    | 否
    v
+-----------------------------+
| 在当前目录node_modules查找   |
+-----------------------------+
    | 未找到
    v
+-----------------------------+
| 在父级目录node_modules查找   |
+-----------------------------+
    | 未找到            递归向上
    v                     |
+-------------+            |
| 到达根目录? | --否---------+
+-------------+
    | 是
    v
+-----------------------------+
| 抛出"找不到模块"错误         |
+-----------------------------+
```

```javascript
// 模块解析示例

// 假设项目结构:
// /project
//   /node_modules
//     /moduleA
//       index.js
//   /src
//     /utils
//       helper.js
//     app.js

// /project/src/app.js
const path = require('path');

// 1. 加载核心模块
const fs = require('fs'); // 直接加载Node.js核心模块

// 2. 相对路径加载
const helper = require('./utils/helper'); // 加载 /project/src/utils/helper.js

// 3. 绝对路径加载
const config = require('/project/config.js'); // 加载 /project/config.js

// 4. node_modules加载
const moduleA = require('moduleA'); // 从 /project/node_modules/moduleA 加载

// 查看模块的完整解析路径
console.log(require.resolve('moduleA'));
console.log(require.resolve('./utils/helper'));

// 显示模块搜索路径
console.log(module.paths);
// 输出类似:
// [
//   '/project/src/node_modules',
//   '/project/node_modules',
//   '/node_modules'
// ]
```

##### 循环依赖

Node.js模块系统可以处理循环依赖（两个或多个模块相互依赖），但需要注意可能的陷阱。

**循环依赖处理方式：**
- Node.js允许模块间循环依赖
- 被循环依赖的模块可能只被部分加载
- 使用"父模块优先"规则解决循环依赖

```
循环依赖示例:

moduleA 引用 moduleB
     ^         |
     |         |
     +---------+
     moduleB 引用 moduleA
```

```javascript
// 循环依赖示例

// a.js
console.log('a模块开始加载');
exports.loaded = false;
const b = require('./b');
console.log('在a模块中，b.loaded =', b.loaded);
exports.loaded = true;
console.log('a模块加载完成');

// b.js
console.log('b模块开始加载');
exports.loaded = false;
const a = require('./a'); // 此时a模块还未完全加载
console.log('在b模块中，a.loaded =', a.loaded); // a.loaded = false
exports.loaded = true;
console.log('b模块加载完成');

// main.js
console.log('主模块开始');
const a = require('./a');
console.log('在主模块中，a.loaded =', a.loaded);
console.log('在主模块中，require("./b").loaded =', require('./b').loaded);
console.log('主模块结束');

/* 输出:
主模块开始
a模块开始加载
b模块开始加载
在b模块中，a.loaded = false
b模块加载完成
在a模块中，b.loaded = true
a模块加载完成
在主模块中，a.loaded = true
在主模块中，require("./b").loaded = true
主模块结束
*/
```

##### 模块封装

Node.js在执行模块代码前会将其封装在一个函数中，提供私有作用域和特定的变量。

**封装函数：**

```javascript
(function(exports, require, module, __filename, __dirname) {
  // 模块代码在这里执行
  // ...
  
  // 模块可以通过多种方式导出功能
  // 1. exports.xxx = xxx
  // 2. module.exports = xxx
});
```

**封装提供的变量：**
- `exports` - 导出对象的快捷引用 (exports === module.exports)
- `require` - 加载其他模块的函数
- `module` - 当前模块的引用
- `__filename` - 当前模块的文件路径
- `__dirname` - 当前模块的目录路径

```javascript
// 模块封装示例

// 创建一个模块 - math.js
console.log('模块内部:');
console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
console.log('require:', typeof require);
console.log('exports === module.exports:', exports === module.exports);

// 使用exports添加属性
exports.add = function(a, b) {
  return a + b;
};

// 错误方式: 直接赋值exports会切断与module.exports的引用
// exports = { multiply: (a, b) => a * b }; // 这样会导致导出失败

// 正确方式: 使用module.exports直接赋值
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

// 加载模块
// const math = require('./math');
// console.log(math.add(10, 5)); // 15
// console.log(math.multiply(10, 5)); // 50
```

#### ES模块支持

从Node.js v12开始，提供了对ES模块的原生支持，与浏览器端的模块系统保持一致。

##### import/export

ES模块使用`import`和`export`语法，支持静态分析和树摇优化。

**基本语法：**
- `export` - 导出声明
- `export default` - 导出默认值
- `import` - 导入模块
- `import()` - 动态导入（返回Promise）

```javascript
// ES模块示例

// math.mjs
// 命名导出
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 默认导出
export default class Calculator {
  constructor(initialValue = 0) {
    this.value = initialValue;
  }
  
  add(num) {
    this.value += num;
    return this;
  }
  
  getValue() {
    return this.value;
  }
}

// app.mjs
// 导入默认导出和命名导出
import Calculator, { add, subtract } from './math.mjs';

console.log(add(5, 3)); // 8
console.log(subtract(10, 4)); // 6

const calc = new Calculator(10);
console.log(calc.add(5).getValue()); // 15

// 导入所有导出为命名空间对象
import * as mathModule from './math.mjs';
console.log(mathModule.add(2, 3)); // 5
console.log(new mathModule.default().add(20).getValue()); // 20
```

##### 动态导入

ES模块支持动态导入，允许按需、条件加载模块。

**动态导入特点：**
- 返回Promise对象
- 可在任何位置使用
- 支持条件导入
- 适用于代码分割和延迟加载

```javascript
// 动态导入示例

// app.mjs
async function loadModule() {
  try {
    // 动态导入返回Promise
    const mathModule = await import('./math.mjs');
    
    console.log(mathModule.add(7, 3)); // 10
    
    const calc = new mathModule.default();
    console.log(calc.add(5).getValue()); // 5
    
    return mathModule;
  } catch (error) {
    console.error('模块加载失败:', error);
  }
}

// 条件导入
async function conditionalImport(useNewVersion) {
  if (useNewVersion) {
    const { newFeature } = await import('./new-module.mjs');
    return newFeature();
  } else {
    const { legacyFeature } = await import('./legacy-module.mjs');
    return legacyFeature();
  }
}

// 使用动态导入
loadModule().then(module => {
  console.log('模块加载完成:', Object.keys(module));
});
```

##### 命名空间

ES模块支持导入所有导出项作为命名空间对象，方便组织和使用。

```javascript
// 命名空间示例

// utils.mjs
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount);
}

export const DEFAULT_OPTIONS = {
  dateFormat: 'YYYY-MM-DD',
  locale: 'zh-CN'
};

// app.mjs
// 导入所有内容到命名空间
import * as Utils from './utils.mjs';

console.log(Utils.formatDate(new Date())); // 2023-04-07
console.log(Utils.formatCurrency(12345.67)); // ¥12,345.67
console.log(Utils.DEFAULT_OPTIONS.locale); // zh-CN
```

##### 兼容性处理

在同一项目中同时使用CommonJS和ES模块需要处理好两者之间的兼容性问题。

**兼容策略：**
- 使用`.mjs`扩展名明确标识ES模块
- 在`package.json`中设置`"type": "module"`
- 使用动态`import()`在CommonJS中加载ES模块
- 使用`createRequire`在ES模块中使用`require`

```javascript
// 兼容性处理示例

// CommonJS模块加载ES模块
// cjs-module.js
(async () => {
  // 使用动态import在CommonJS中加载ES模块
  const { default: Calculator, add } = await import('./math.mjs');
  
  console.log(add(5, 3)); // 8
  console.log(new Calculator().add(10).getValue()); // 10
})();

// ES模块加载CommonJS模块
// esm-module.mjs
import { createRequire } from 'module';

// 创建require函数
const require = createRequire(import.meta.url);

// 使用require加载CommonJS模块
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

console.log(_.chunk([1, 2, 3, 4, 5], 2)); // [[1, 2], [3, 4], [5]]
console.log(path.join(__dirname, 'data')); // /path/to/data
```

##### 混合模式

在大型项目中，可能需要混合使用CommonJS和ES模块，可通过设置和工具实现平滑过渡。

**实现混合模式的方法：**
- 使用双包模式（提供CommonJS和ES模块两种版本）
- 使用条件导出（通过package.json的exports字段）
- 使用打包工具如Webpack或Rollup处理转换

```json
// package.json中的条件导出配置
{
  "name": "my-library",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
```

#### 包管理

Node.js的包管理系统通过npm（Node Package Manager）提供，是构建Node.js应用的基础设施。

##### NPM使用

npm是Node.js默认的包管理器，用于安装、发布和管理包依赖。

**常用npm命令：**

```
+-------------------+----------------------------------------+
| 命令               | 功能描述                               |
+-------------------+----------------------------------------+
| npm init          | 初始化新的package.json文件              |
| npm install       | 安装所有依赖                            |
| npm install pkg   | 安装特定包                              |
| npm install -g    | 全局安装包                              |
| npm uninstall     | 卸载包                                  |
| npm update        | 更新包                                  |
| npm run script    | 运行package.json中定义的脚本            |
| npm publish       | 发布包到npm仓库                         |
| npm search        | 搜索包                                  |
| npm list          | 列出已安装的包                          |
+-------------------+----------------------------------------+
```

```shell
# npm常用命令示例

# 初始化新项目
npm init -y

# 安装依赖
npm install express

# 安装开发依赖
npm install --save-dev jest

# 安装特定版本
npm install lodash@4.17.20

# 全局安装工具
npm install -g nodemon

# 列出已安装的包
npm list --depth=0

# 运行脚本
npm run start

# 更新包
npm update

# 卸载包
npm uninstall moment
```

##### package.json

package.json是Node.js项目的核心配置文件，定义了项目的元数据、依赖和脚本等信息。

**主要字段：**
- `name` - 包名称
- `version` - 包版本
- `dependencies` - 运行依赖
- `devDependencies` - 开发依赖
- `scripts` - 脚本命令
- `main` - 主入口文件
- `type` - 模块系统类型（"commonjs"或"module"）
- `engines` - Node.js版本要求
- `exports` - 条件导出配置

```json
// package.json示例
{
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "示例Node.js应用",
  "main": "index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.js",
    "build": "webpack --mode production"
  },
  "keywords": ["node", "example", "tutorial"],
  "author": "开发者名称",
  "license": "MIT",
  "dependencies": {
    "express": "^4.17.1",
    "mongoose": "^5.12.3",
    "dotenv": "^8.2.0",
    "joi": "^17.4.0"
  },
  "devDependencies": {
    "jest": "^26.6.3",
    "nodemon": "^2.0.7",
    "eslint": "^7.24.0",
    "webpack": "^5.35.0",
    "webpack-cli": "^4.6.0"
  },
  "engines": {
    "node": ">=12.0.0"
  }
}
```

##### 依赖管理

正确管理依赖是Node.js项目开发的关键环节，包括依赖类型、依赖锁定和安全更新。

**依赖类型：**
- `dependencies` - 生产环境所需依赖
- `devDependencies` - 仅开发环境所需依赖
- `peerDependencies` - 插件所需的宿主包
- `optionalDependencies` - 可选依赖

**依赖版本控制：**
- 精确版本: `"express": "4.17.1"`
- 补丁版本更新: `"express": "~4.17.1"` (4.17.x)
- 次版本更新: `"express": "^4.17.1"` (4.x.y)
- 任意版本: `"express": "*"`

```javascript
// 依赖管理示例

// 1. 安装不同类型的依赖
// 运行时依赖
// npm install express mongoose

// 开发依赖
// npm install --save-dev jest eslint

// 2. 使用依赖锁文件
// package-lock.json或yarn.lock确保依赖版本一致性

// 3. 更新依赖
// npm update
// npm outdated查看过时依赖

// 4. 依赖安全检查
// npm audit
// npm audit fix

// 5. 依赖分析
// npm list --depth=1
// npm why package-name
```

##### 版本控制

Node.js包遵循语义化版本控制，有助于管理依赖和发布更新。

**语义化版本格式：**
- 主版本.次版本.补丁版本 (e.g., 2.4.1)
- 主版本: 不兼容的API更改
- 次版本: 向后兼容的功能添加
- 补丁版本: 向后兼容的问题修复

```
版本控制流程:

  +------------+    +-----------+    +------------+
  |  1.0.0     +--->| 1.1.0     +--->| 2.0.0      |
  | 初始版本    |    | 功能增加   |    | 破坏性变更  |
  +------------+    +-----------+    +------------+
        |                |                 |
        v                v                 v
  +------------+    +-----------+    +------------+
  |  1.0.1     |    | 1.1.1     |    | 2.0.1      |
  | 错误修复    |    | 错误修复   |    | 错误修复   |
  +------------+    +-----------+    +------------+
```

##### 发布流程

开发自己的Node.js包并发布到npm仓库的标准流程。

**发布步骤：**
1. 创建并完善package.json
2. 编写代码和文档
3. 测试包功能
4. 注册npm账号
5. 登录npm (`npm login`)
6. 发布包 (`npm publish`)
7. 管理版本更新

```shell
# 发布包的步骤示例

# 1. 创建package.json
npm init

# 2. 开发包功能
# 创建index.js和其他源文件

# 3. 测试
npm test

# 4. 登录npm
npm login

# 5. 发布包
npm publish

# 6. 更新版本
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0

# 7. 发布新版本
npm publish
```

### 内置模块

Node.js提供了丰富的内置模块，用于处理常见的服务器端任务。这些模块无需安装，可以直接使用`require`引入。

#### 文件系统(fs)

文件系统(fs)模块是Node.js中用于与文件系统交互的核心模块，提供了文件操作的API。

##### 模块结构

fs模块提供同步和异步两种API风格，覆盖了文件操作的各个方面：

```
fs模块API结构:

+------------------------------+
|        文件系统模块 (fs)      |
+------------------------------+
            |
    +-------+-------+
    |               |
+---+----+     +----+---+
| 同步API |     | 异步API |
+---+----+     +----+---+
    |               |
    v               v
+---------+     +---------+
| 方法名后 |     | 使用回调 |
| 带Sync  |     | 或Promise|
+---------+     +---------+
```

##### 文件读写

**异步读写文件：**

```javascript
// 异步读取文件
const fs = require('fs');

// 回调方式
fs.readFile('./config.json', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
    return;
  }
  console.log('文件内容:', data);
});

// Promise方式 (Node.js 10+)
const fsPromises = require('fs').promises;

fsPromises.readFile('./config.json', 'utf8')
  .then(data => {
    console.log('文件内容:', data);
  })
  .catch(err => {
    console.error('读取文件失败:', err);
  });

// async/await方式
async function readConfigFile() {
  try {
    const data = await fsPromises.readFile('./config.json', 'utf8');
    console.log('文件内容:', data);
    return data;
  } catch (err) {
    console.error('读取文件失败:', err);
    throw err;
  }
}

// 异步写入文件
const content = JSON.stringify({name: 'Node.js', version: '14.0.0'}, null, 2);

// 回调方式
fs.writeFile('./output.json', content, 'utf8', (err) => {
  if (err) {
    console.error('写入文件失败:', err);
    return;
  }
  console.log('文件写入成功');
});

// Promise方式
fsPromises.writeFile('./output.json', content, 'utf8')
  .then(() => {
    console.log('文件写入成功');
  })
  .catch(err => {
    console.error('写入文件失败:', err);
  });
```

**同步读写文件：**

```javascript
// 同步读写文件示例
const fs = require('fs');

try {
  // 同步读取文件 - 会阻塞事件循环
  const data = fs.readFileSync('./config.json', 'utf8');
  console.log('文件内容:', data);
  
  // 同步写入文件
  const content = JSON.stringify({name: 'Node.js', version: '14.0.0'}, null, 2);
  fs.writeFileSync('./output.json', content, 'utf8');
  console.log('文件写入成功');
} catch (err) {
  console.error('文件操作失败:', err);
}

console.log('同步操作完成'); // 等文件操作完成后才会执行
```

##### 同步与异步对比

同步和异步文件操作在执行流程和性能上有显著区别：

```
执行流程对比:

同步操作:
+--------+  +------------+  +-------------+
| 开始    | → | 文件操作    | → | 继续执行代码 |
+--------+  +------------+  +-------------+
     |           |                |
     v           v                v
时间轴 ---------------------------------->

异步操作:
+--------+                 +-------------+
| 开始    | --------------> | 继续执行代码 |
+--------+                 +-------------+
     |                            |
     v                            v
时间轴 ---------------------------------->
     |        |
     |        v
     |    +-------------+
     +--> | 文件操作回调 |
          +-------------+
```

**使用场景建议：**
- 同步API：适用于简单脚本、启动配置加载、单次操作
- 异步API：适用于Web服务器、高并发场景、需要避免阻塞的场景

##### 文件信息与操作

**获取文件信息：**

```javascript
// 获取文件信息
const fs = require('fs');

// 异步方式
fs.stat('./example.txt', (err, stats) => {
  if (err) {
    console.error('获取文件信息失败:', err);
    return;
  }
  
  console.log('文件大小:', stats.size, '字节');
  console.log('创建时间:', stats.birthtime);
  console.log('修改时间:', stats.mtime);
  console.log('是否为文件:', stats.isFile());
  console.log('是否为目录:', stats.isDirectory());
});

// 同步方式
try {
  const stats = fs.statSync('./example.txt');
  console.log('文件大小:', stats.size, '字节');
} catch (err) {
  console.error('获取文件信息失败:', err);
}
```

**文件操作：**

```javascript
// 文件操作示例
const fs = require('fs');
const fsPromises = fs.promises;

// 重命名文件
fs.rename('oldName.txt', 'newName.txt', (err) => {
  if (err) throw err;
  console.log('文件重命名成功');
});

// 复制文件
fs.copyFile('source.txt', 'destination.txt', (err) => {
  if (err) throw err;
  console.log('文件复制成功');
});

// 删除文件
fs.unlink('toDelete.txt', (err) => {
  if (err) throw err;
  console.log('文件删除成功');
});

// 截断文件
fs.truncate('file.txt', 1024, (err) => {
  if (err) throw err;
  console.log('文件已截断为1kb');
});

// 修改文件权限
fs.chmod('file.txt', 0o755, (err) => {
  if (err) throw err;
  console.log('文件权限已修改');
});

// 检查文件是否存在
fs.access('file.txt', fs.constants.F_OK, (err) => {
  console.log(`${err ? '文件不存在' : '文件存在'}`);
});

// 文件是否可读
fs.access('file.txt', fs.constants.R_OK, (err) => {
  console.log(`${err ? '文件不可读' : '文件可读'}`);
});
```

##### 目录操作

**创建与读取目录：**

```javascript
// 目录操作示例
const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

// 创建目录
fs.mkdir('./new-directory', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('目录创建成功');
});

// 读取目录内容
fs.readdir('./my-directory', (err, files) => {
  if (err) throw err;
  console.log('目录内容:');
  files.forEach(file => {
    console.log(file);
  });
});

// 带有详细信息的目录读取
fs.readdir('./my-directory', { withFileTypes: true }, (err, dirents) => {
  if (err) throw err;
  
  dirents.forEach(dirent => {
    console.log(`名称: ${dirent.name}, 是文件: ${dirent.isFile()}, 是目录: ${dirent.isDirectory()}`);
  });
});

// 递归遍历目录
async function traverseDirectory(dirPath) {
  try {
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        console.log(`目录: ${fullPath}`);
        await traverseDirectory(fullPath); // 递归遍历子目录
      } else {
        console.log(`文件: ${fullPath}`);
      }
    }
  } catch (err) {
    console.error('遍历目录失败:', err);
  }
}

// 使用遍历函数
traverseDirectory('./project');
```

**删除目录：**

```javascript
// 删除目录
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

// 删除空目录
fs.rmdir('./empty-directory', (err) => {
  if (err) throw err;
  console.log('空目录已删除');
});

// 递归删除目录及其内容 (Node.js 12+)
fs.rm('./directory-to-remove', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('目录及其内容已删除');
});

// 旧版本递归删除目录
async function removeDirectory(dirPath) {
  try {
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await removeDirectory(fullPath); // 先递归删除子目录
      } else {
        await fsPromises.unlink(fullPath); // 删除文件
      }
    }
    
    // 最后删除空目录
    await fsPromises.rmdir(dirPath);
    console.log(`已删除目录: ${dirPath}`);
  } catch (err) {
    console.error(`删除目录失败: ${dirPath}`, err);
  }
}
```

##### 流式操作

文件流是处理大文件的理想方式，可以分块读写数据而不必一次性加载整个文件到内存：

```javascript
// 文件流操作示例
const fs = require('fs');
const path = require('path');

// 创建可读流
const readStream = fs.createReadStream('./large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024 // 64KB的块
});

// 创建可写流
const writeStream = fs.createWriteStream('./output-file.txt');

// 读取事件
readStream.on('data', (chunk) => {
  console.log(`接收到${chunk.length}字节的数据`);
});

readStream.on('end', () => {
  console.log('文件读取完成');
});

readStream.on('error', (err) => {
  console.error('读取出错:', err);
});

// 使用管道复制文件 - 最简单的方式
readStream.pipe(writeStream);

// 手动写入方式
readStream.on('data', (chunk) => {
  // 处理数据
  const processedChunk = chunk.toString().toUpperCase();
  
  // 写入数据
  const canContinue = writeStream.write(processedChunk);
  
  // 如果缓冲区已满，暂停读取
  if (!canContinue) {
    readStream.pause();
  }
});

// 当缓冲区清空时继续读取
writeStream.on('drain', () => {
  readStream.resume();
});

// 结束处理
readStream.on('end', () => {
  writeStream.end();
});

writeStream.on('finish', () => {
  console.log('写入完成');
});
```

```
流操作处理大文件的优势:

传统方法:
+----------------+
| 读取整个文件    |
+-------+--------+
        |
        v
+-------+--------+
| 消耗大量内存    |
+-------+--------+
        |
        v
+-------+--------+
| 处理整个数据    |
+-------+--------+
        |
        v
+-------+--------+
| 写入整个文件    |
+----------------+

流式操作:
+----------------+
| 读取数据块1     |
+-------+--------+
        |
        v
+-------+--------+
| 处理数据块1     |
+-------+--------+
        |
        v
+-------+--------+
| 写入数据块1     |
+----------------+
        |
        v
+----------------+
| 读取数据块2     |
+-------+--------+
        |
        v
+-------+--------+
| 处理数据块2     |
+-------+--------+
        |
        v
+-------+--------+
| 写入数据块2     |
+----------------+
        |
       ...
```

##### 监视文件变化

Node.js可以监视文件或目录的变化，非常适合开发热重载、配置自动更新等场景：

```javascript
// 监视文件变化
const fs = require('fs');

// 监视单个文件
fs.watchFile('./config.json', (curr, prev) => {
  console.log('配置文件已更改');
  console.log('上次修改时间:', prev.mtime);
  console.log('当前修改时间:', curr.mtime);
  
  // 重新加载配置
  try {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    console.log('新配置已加载:', config);
  } catch (err) {
    console.error('加载新配置失败:', err);
  }
});

// 监视文件或目录(更高效)
const watcher = fs.watch('./src', { recursive: true }, (eventType, filename) => {
  console.log(`事件类型: ${eventType}`);
  if (filename) {
    console.log(`文件名: ${filename}`);
  }
  
  // 处理变化...
});

// 停止监视
// watcher.close();

// 处理监视错误
watcher.on('error', (error) => {
  console.error('监视错误:', error);
});
```

##### fs/promises API

Node.js 10之后引入了基于Promise的文件系统API，提供了更现代的异步文件操作方式：

```javascript
// fs/promises API示例
const fs = require('fs').promises;

async function fileOperations() {
  try {
    // 读取文件
    const data = await fs.readFile('./input.txt', 'utf8');
    console.log('文件内容:', data);
    
    // 写入文件
    await fs.writeFile('./output.txt', 'Hello Node.js', 'utf8');
    
    // 附加内容到文件
    await fs.appendFile('./output.txt', '\nMore content', 'utf8');
    
    // 复制文件
    await fs.copyFile('./output.txt', './backup.txt');
    
    // 获取文件信息
    const stats = await fs.stat('./output.txt');
    console.log('文件大小:', stats.size);
    
    // 创建目录
    await fs.mkdir('./new-folder', { recursive: true });
    
    // 读取目录
    const files = await fs.readdir('./');
    console.log('目录内容:', files);
    
    // 重命名文件
    await fs.rename('./backup.txt', './renamed.txt');
    
    // 删除文件
    await fs.unlink('./renamed.txt');
    
    console.log('所有操作完成');
  } catch (err) {
    console.error('出错:', err);
  }
}

fileOperations();
```

##### 最佳实践

**文件操作性能建议：**

```
文件操作性能优化:

✅ 推荐做法               ❌ 避免做法
────────────────────────────────────────
✅ 异步API               ❌ 同步API (在服务中)
✅ 流式处理大文件         ❌ 一次性读取大文件  
✅ 批量操作               ❌ 频繁小型操作
✅ 缓存频繁访问的文件     ❌ 重复读取相同文件
✅ 延迟写入(防抖)         ❌ 频繁写入
✅ 监视变化而非轮询       ❌ 定时检查文件变化
```

**错误处理：**

```javascript
// 文件操作错误处理示例
const fs = require('fs').promises;

async function safeFileOperation(filePath, operation) {
  try {
    // 检查文件是否存在
    try {
      await fs.access(filePath, fs.constants.F_OK);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`文件不存在: ${filePath}`);
        return null;
      }
      throw error;
    }
    
    // 执行操作
    return await operation(filePath);
  } catch (error) {
    // 错误处理与分类
    if (error.code === 'EACCES') {
      console.error(`权限拒绝: ${filePath}`);
    } else if (error.code === 'ENOSPC') {
      console.error('磁盘空间不足');
    } else if (error.code === 'EMFILE') {
      console.error('打开的文件过多');
    } else {
      console.error(`文件操作错误: ${error.message}`);
    }
    
    // 可选: 发送错误通知
    // notifyError(error);
    
    return null;
  }
}

// 使用安全文件操作
async function readConfigSafely() {
  const config = await safeFileOperation('./config.json', async (path) => {
    const data = await fs.readFile(path, 'utf8');
    return JSON.parse(data);
  });
  
  if (config) {
    console.log('配置已加载:', config);
  } else {
    console.log('使用默认配置');
    return { default: true };
  }
}
```

**安全性考虑：**

```javascript
// 文件操作安全实践
const fs = require('fs').promises;
const path = require('path');

// 安全的文件路径解析
function safeJoinPath(basePath, userPath) {
  // 标准化并验证用户输入路径
  const normalizedPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(basePath, normalizedPath);
  
  // 确保结果在基础目录内
  if (!fullPath.startsWith(basePath)) {
    throw new Error('路径越界');
  }
  
  return fullPath;
}

// 使用范例
async function getUserFile(userId, fileName) {
  const basePath = './user-files';
  
  try {
    // 验证并构建安全的文件路径
    const userDir = safeJoinPath(basePath, userId);
    const filePath = safeJoinPath(userDir, fileName);
    
    // 检查文件是否存在
    await fs.access(filePath, fs.constants.F_OK);
    
    // 读取文件内容
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.message === '路径越界') {
      console.error('安全警告: 尝试访问限制区域外的文件');
      // 记录安全事件
    } else if (error.code === 'ENOENT') {
      console.error('文件不存在');
    } else {
      console.error('文件访问错误:', error);
    }
    return null;
  }
}
```

通过以上详细的API介绍和实践示例，您应该能够掌握Node.js文件系统模块的核心功能和最佳使用方式。

#### 网络模块(http/https)

HTTP/HTTPS模块是Node.js中处理网络通信的核心模块，允许创建服务器和客户端。

##### HTTP服务器

Node.js可以通过内置的http模块轻松创建HTTP服务器：

```javascript
// 创建基本HTTP服务器
const http = require('http');

// 创建服务器实例
const server = http.createServer((req, res) => {
  // 设置状态码和响应头
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  
  // 根据请求路径返回不同内容
  if (req.url === '/') {
    res.end('首页');
  } else if (req.url === '/about') {
    res.end('关于我们');
  } else {
    res.statusCode = 404;
    res.end('页面不存在');
  }
});

// 监听端口
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}/`);
});
```

**请求对象(req)的主要属性和方法：**

```
请求对象属性和方法:

+--------------------+-----------------------------------+
| 属性/方法           | 描述                             |
+--------------------+-----------------------------------+
| req.url            | 请求的URL路径                     |
| req.method         | HTTP方法 (GET, POST等)            |
| req.headers        | 请求头对象                        |
| req.httpVersion    | HTTP版本                          |
| req.socket         | 底层socket                        |
| req.on('data')     | 获取请求体数据的事件              |
| req.on('end')      | 请求体接收完成的事件              |
+--------------------+-----------------------------------+
```

**响应对象(res)的主要属性和方法：**

```
响应对象属性和方法:

+------------------------+-----------------------------------+
| 属性/方法               | 描述                             |
+------------------------+-----------------------------------+
| res.statusCode         | 设置HTTP状态码                    |
| res.setHeader()        | 设置响应头                        |
| res.writeHead()        | 设置状态码和多个响应头            |
| res.write()            | 发送响应体数据块                  |
| res.end()              | 结束响应，发送剩余数据            |
| res.getHeader()        | 获取已设置的响应头                |
| res.removeHeader()     | 移除响应头                        |
+------------------------+-----------------------------------+
```

##### 处理请求数据

处理POST请求体数据:

```javascript
// 处理POST请求数据
const http = require('http');

const server = http.createServer((req, res) => {
  // 只处理POST请求
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('只支持POST方法');
    return;
  }
  
  // 存储请求体片段
  const chunks = [];
  
  // 接收数据
  req.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  // 数据接收完成
  req.on('end', () => {
    // 合并所有数据块
    const body = Buffer.concat(chunks).toString();
    
    // 尝试解析JSON数据
    let data;
    try {
      data = JSON.parse(body);
      
      // 处理数据
      console.log('接收到的数据:', data);
      
      // 发送响应
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: '数据接收成功',
        receivedData: data
      }));
    } catch (error) {
      res.statusCode = 400;
      res.end('无效的JSON数据');
    }
  });
  
  // 处理请求错误
  req.on('error', (err) => {
    console.error('请求处理错误:', err);
    res.statusCode = 500;
    res.end('服务器错误');
  });
});

server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000/');
});
```

##### HTTP客户端

Node.js也可用于创建HTTP客户端，发出请求：

```javascript
// HTTP客户端请求示例
const http = require('http');
const https = require('https');

// 发送GET请求
function httpGet(url) {
  return new Promise((resolve, reject) => {
    // 选择http或https模块
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      // 检查状态码
      const { statusCode } = res;
      if (statusCode !== 200) {
        res.resume(); // 消费响应数据以释放内存
        reject(new Error(`请求失败，状态码: ${statusCode}`));
        return;
      }
      
      // 设置编码
      res.setEncoding('utf8');
      
      // 收集数据
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      
      // 处理请求完成
      res.on('end', () => {
        try {
          // 尝试解析JSON
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          // 返回原始数据
          resolve(rawData);
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

// 发送POST请求
function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    // 将数据转换为JSON字符串
    const postData = JSON.stringify(data);
    
    // 解析URL以获取主机名和路径
    const urlObj = new URL(url);
    
    // 请求选项
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    // 选择http或https模块
    const client = urlObj.protocol === 'https:' ? https : http;
    
    // 创建请求
    const req = client.request(options, (res) => {
      // 检查状态码
      const { statusCode } = res;
      
      // 设置编码
      res.setEncoding('utf8');
      
      // 收集数据
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      
      // 处理请求完成
      res.on('end', () => {
        try {
          // 尝试解析JSON
          const parsedData = JSON.parse(rawData);
          resolve({ statusCode, data: parsedData });
        } catch (e) {
          // 返回原始数据
          resolve({ statusCode, data: rawData });
        }
      });
    });
    
    // 处理请求错误
    req.on('error', (e) => {
      reject(e);
    });
    
    // 写入数据并结束请求
    req.write(postData);
    req.end();
  });
}

// 使用示例
async function makeRequests() {
  try {
    // GET请求
    const userData = await httpGet('https://jsonplaceholder.typicode.com/users/1');
    console.log('用户数据:', userData);
    
    // POST请求
    const createResult = await httpPost('https://jsonplaceholder.typicode.com/posts', {
      title: '测试标题',
      body: '测试内容',
      userId: 1
    });
    console.log('创建结果:', createResult);
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}

makeRequests();
```

##### HTTPS服务器

创建HTTPS服务器需要SSL证书：

```javascript
// 创建HTTPS服务器
const https = require('https');
const fs = require('fs');

// 读取SSL证书和密钥
const options = {
  key: fs.readFileSync('私钥.pem'),
  cert: fs.readFileSync('证书.pem')
};

// 创建服务器
https.createServer(options, (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('安全的HTTPS服务器');
}).listen(443, () => {
  console.log('HTTPS服务器运行在 https://localhost:443/');
});
```

##### 路由系统

简单的路由实现:

```javascript
// 简单的路由系统
const http = require('http');
const url = require('url');

// 路由处理函数
const routes = {
  'GET': {
    '/': (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('首页');
    },
    '/about': (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('关于我们');
    }
  },
  'POST': {
    '/api/users': (req, res) => {
      // 接收POST数据
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          res.writeHead(201, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            message: '用户创建成功',
            user: data
          }));
        } catch (e) {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: '无效的JSON数据'}));
        }
      });
    }
  }
};

// 创建服务器
const server = http.createServer((req, res) => {
  // 解析URL和查询参数
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method.toUpperCase();
  
  // 查找路由处理函数
  const routeHandler = routes[method] && routes[method][path];
  
  if (routeHandler) {
    // 路由存在，调用处理函数
    routeHandler(req, res);
  } else {
    // 路由不存在，返回404
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
  }
});

// 启动服务器
server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000/');
});
```

##### 中间件模式

实现简单的中间件机制：

```javascript
// 简单的中间件实现
const http = require('http');

// 中间件系统
class Application {
  constructor() {
    this.middlewares = [];
  }
  
  // 添加中间件
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  // 创建HTTP服务器
  listen(port, callback) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });
    
    server.listen(port, callback);
    return server;
  }
  
  // 处理请求
  handleRequest(req, res) {
    // 执行中间件链
    let index = 0;
    
    const next = () => {
      // 所有中间件执行完毕
      if (index >= this.middlewares.length) {
        return;
      }
      
      // 获取当前中间件
      const middleware = this.middlewares[index++];
      
      // 执行中间件，传入next函数
      middleware(req, res, next);
    };
    
    // 开始执行中间件链
    next();
  }
}

// 使用示例
const app = new Application();

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 响应时间中间件
app.use((req, res, next) => {
  const start = Date.now();
  
  // 扩展res.end方法来计算请求时间
  const originalEnd = res.end;
  res.end = function() {
    const duration = Date.now() - start;
    console.log(`请求处理时间: ${duration}ms`);
    
    // 调用原始的end方法
    return originalEnd.apply(this, arguments);
  };
  
  next();
});

// 路由中间件
app.use((req, res, next) => {
  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('首页');
  } else if (req.url === '/about') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('关于我们');
  } else {
    next(); // 继续下一个中间件
  }
});

// 404处理中间件
app.use((req, res) => {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 Not Found');
});

// 启动服务器
app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000/');
});
```

以上是Node.js网络模块的基本使用示例，涵盖了HTTP服务器、客户端、路由和中间件的实现。通过这些功能，可以构建丰富的网络应用。

#### 路径模块(path)

路径模块提供了处理文件和目录路径的工具函数，是文件操作的基础支持。

##### 路径组件

path模块提供了各种方法来处理路径的各个组成部分：

```javascript
// 路径组件示例
const path = require('path');

// 示例路径
const filePath = '/home/user/projects/app.js';

// 提取路径组件
console.log('目录名:', path.dirname(filePath));  // 输出: /home/user/projects
console.log('文件名:', path.basename(filePath)); // 输出: app.js
console.log('扩展名:', path.extname(filePath));  // 输出: .js

// 不带扩展名的文件名
console.log('不带扩展名的文件名:', path.basename(filePath, path.extname(filePath))); // 输出: app

// 解析路径对象
const pathObj = path.parse(filePath);
console.log('路径对象:', pathObj);
// 输出:
// {
//   root: '/',
//   dir: '/home/user/projects',
//   base: 'app.js',
//   ext: '.js',
//   name: 'app'
// }

// 从对象还原路径
const newPath = path.format({
  dir: '/home/user/documents',
  base: 'document.txt'
});
console.log('新路径:', newPath); // 输出: /home/user/documents/document.txt
```

##### 路径规范化

path模块提供了多种方法来规范化和解析路径：

```javascript
// 路径规范化示例
const path = require('path');

// 路径规范化
const normalizedPath = path.normalize('/home/user/../projects/./app.js');
console.log('规范化路径:', normalizedPath); // 输出: /home/projects/app.js

// 解析相对路径
const absolutePath = path.resolve('src', 'utils', 'helpers.js');
console.log('绝对路径:', absolutePath); // 输出取决于当前工作目录

// 连接路径片段
const joinedPath = path.join('/home', 'user', 'projects', 'app.js');
console.log('连接路径:', joinedPath); // 输出: /home/user/projects/app.js

// 计算相对路径
const relativePath = path.relative('/home/user/projects', '/home/user/documents/file.txt');
console.log('相对路径:', relativePath); // 输出: ../../documents/file.txt
```

**路径方法比较：**

```
方法比较:

+---------------+----------------------------------+------------------------------+
| 方法          | 用途                             | 特点                         |
+---------------+----------------------------------+------------------------------+
| path.join()   | 将多个路径段拼接成一个路径       | 使用平台特定分隔符，不解析   |
|               |                                  | 根路径                       |
+---------------+----------------------------------+------------------------------+
| path.resolve()| 将相对路径解析为绝对路径         | 从右到左处理，遇到根路径停止,|
|               |                                  | 如果没有根路径，加上当前目录 |
+---------------+----------------------------------+------------------------------+
| path.normalize| 规范化路径，解析..和.            | 处理重复的分隔符和相对路径段 |
+---------------+----------------------------------+------------------------------+
```

##### 平台差异处理

path模块提供了跨平台的路径处理能力：

```javascript
// 平台差异处理
const path = require('path');

// 路径分隔符
console.log('路径分隔符:', path.sep); // Windows: \ Linux/Mac: /

// 路径定界符
console.log('路径定界符:', path.delimiter); // Windows: ; Linux/Mac: :

// 创建特定平台路径
// Windows风格路径
const windowsPath = path.win32.join('C:', 'Users', 'username', 'Documents', 'file.txt');
console.log('Windows路径:', windowsPath); // 输出: C:\Users\username\Documents\file.txt

// POSIX风格路径(Linux/Mac)
const posixPath = path.posix.join('/home', 'username', 'documents', 'file.txt');
console.log('POSIX路径:', posixPath); // 输出: /home/username/documents/file.txt

// 是否是绝对路径
console.log('是否是绝对路径(Windows):', path.win32.isAbsolute('C:\\Users\\username'));  // true
console.log('是否是绝对路径(POSIX):', path.posix.isAbsolute('/home/username'));        // true
console.log('是否是绝对路径(相对):', path.isAbsolute('documents/file.txt'));           // false
```

##### URL和文件路径转换

Node.js提供了文件URL和系统路径之间的转换：

```javascript
// URL和路径转换
const url = require('url');
const path = require('path');

// 在Node.js 10+中，可以使用以下API
const { fileURLToPath, pathToFileURL } = require('url');

// 文件URL转路径
const fileUrl = 'file:///home/user/projects/app.js';
const filePath = fileURLToPath(fileUrl);
console.log('文件路径:', filePath); // 输出: /home/user/projects/app.js

// 路径转文件URL
const pathUrl = pathToFileURL('/home/user/documents/file.txt');
console.log('文件URL:', pathUrl.href); // 输出: file:///home/user/documents/file.txt
```

##### 实际应用场景

```javascript
// 路径模块的实际应用场景
const path = require('path');
const fs = require('fs');

// 1. 构建配置文件路径
function getConfigPath(configName) {
  // 假设配置文件在应用根目录的config文件夹下
  return path.join(process.cwd(), 'config', `${configName}.json`);
}

// 2. 确保目录存在
function ensureDirectoryExists(dirPath) {
  const normalizedPath = path.normalize(dirPath);
  
  // 递归创建目录
  if (!fs.existsSync(normalizedPath)) {
    // 获取父目录
    const parentDir = path.dirname(normalizedPath);
    
    // 确保父目录存在
    ensureDirectoryExists(parentDir);
    
    // 创建当前目录
    fs.mkdirSync(normalizedPath);
  }
  
  return normalizedPath;
}

// 3. 生成相对于项目根目录的文件路径
function getProjectPath(...relativePath) {
  // 假设项目根目录已设置为环境变量或常量
  const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();
  return path.join(PROJECT_ROOT, ...relativePath);
}

// 4. 解析模块路径
function resolveModulePath(moduleName) {
  try {
    // 尝试解析模块的主文件路径
    return require.resolve(moduleName);
  } catch (error) {
    console.error(`无法解析模块 ${moduleName}:`, error.message);
    return null;
  }
}

// 5. 根据文件类型选择处理器
function getFileHandler(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  // 根据扩展名返回不同的处理函数
  const handlers = {
    '.js': (content) => `执行JavaScript: ${content}`,
    '.json': (content) => `解析JSON: ${JSON.parse(content)}`,
    '.txt': (content) => `读取文本: ${content}`,
    '.md': (content) => `解析Markdown: ${content}`,
  };
  
  return handlers[ext] || ((content) => `未知文件类型: ${content}`);
}

// 使用示例
console.log('配置文件路径:', getConfigPath('database'));
console.log('项目源码路径:', getProjectPath('src', 'utils', 'helpers.js'));
console.log('Node.js核心模块路径:', resolveModulePath('fs'));
```

通过路径模块，我们可以安全地处理文件路径，避免不同操作系统之间的路径差异问题，确保应用在各种环境下的一致性。

#### 流模块(stream)

流(Stream)是Node.js中处理流式数据的抽象接口，它允许以高效的方式处理读写操作，尤其适合处理大文件和网络通信。

##### 流的类型

Node.js中有四种基本的流类型：

```
流的类型:

+---------------+-----------------------------------+------------------+
| 类型          | 功能                              | 常见实例          |
+---------------+-----------------------------------+------------------+
| 可读流        | 可以从中读取数据的源              | HTTP请求, fs读    |
| (Readable)    | 如文件读取、HTTP请求体            | 文件流, process.stdin |
+---------------+-----------------------------------+------------------+
| 可写流        | 可以向其写入数据的目标            | HTTP响应, fs写    |
| (Writable)    | 如文件写入、HTTP响应体            | 文件流, process.stdout |
+---------------+-----------------------------------+------------------+
| 双工流        | 可读也可写的流                    | TCP socket, zlib |
| (Duplex)      | 如TCP连接、转换流                 | 转换流           |
+---------------+-----------------------------------+------------------+
| 转换流        | 在读写过程中可以修改数据的双工流  | 压缩流, 加密流   |
| (Transform)   | 如压缩、加密                      | 解析器           |
+---------------+-----------------------------------+------------------+
```

##### 可读流

可读流允许从数据源读取数据：

```javascript
// 可读流示例
const fs = require('fs');

// 创建文件可读流
const readableStream = fs.createReadStream('大文件.txt', {
  encoding: 'utf8',     // 指定编码
  highWaterMark: 64 * 1024  // 缓冲区大小（64KB）
});

// 流模式处理
readableStream.on('data', (chunk) => {
  console.log(`接收到 ${chunk.length} 字节的数据`);
  // 处理数据块...
});

readableStream.on('end', () => {
  console.log('已读取所有数据');
});

readableStream.on('error', (err) => {
  console.error('读取错误:', err);
});
```

可读流有两种模式：

1. **流动模式(Flowing)**：数据自动从底层系统读取并通过EventEmitter接口提供给应用
2. **暂停模式(Paused)**：必须显式调用stream.read()方法来从流中获取数据块

```javascript
// 流动模式与暂停模式
const fs = require('fs');

// 创建可读流
const readableStream = fs.createReadStream('example.txt');

// 暂停模式 - 流创建时默认为暂停模式
readableStream.on('readable', () => {
  let chunk;
  while (null !== (chunk = readableStream.read())) {
    console.log(`读取 ${chunk.length} 字节的数据`);
    console.log(chunk.toString());
  }
});

// 切换到流动模式的方法:
// 1. 添加 'data' 事件处理器
// 2. 调用 resume() 方法
// 3. 调用 pipe() 方法将数据发送到可写流

// 切换到暂停模式:
// 调用 pause() 方法
```

##### 可写流

可写流允许向目标写入数据：

```javascript
// 可写流示例
const fs = require('fs');

// 创建文件可写流
const writableStream = fs.createWriteStream('输出.txt', {
  encoding: 'utf8',     // 指定编码
  flags: 'w'            // 写入模式 ('w': 覆盖, 'a': 追加)
});

// 写入数据
writableStream.write('第一行数据\n', 'utf8', () => {
  console.log('第一行已写入');
});

writableStream.write('第二行数据\n');

// 结束写入
writableStream.end('最后一行数据\n', () => {
  console.log('写入完成');
});

// 处理错误
writableStream.on('error', (err) => {
  console.error('写入错误:', err);
});

// 写入完成事件
writableStream.on('finish', () => {
  console.log('所有数据已被写入底层系统');
});
```

写入流的主要方法：
- `write(chunk[, encoding][, callback])`: 写入数据块
- `end([chunk][, encoding][, callback])`: 结束写入过程

##### 管道操作

管道(pipe)是流操作中最强大的功能，允许把可读流的输出直接连接到可写流的输入：

```javascript
// 使用管道复制文件
const fs = require('fs');

// 创建可读流和可写流
const readableStream = fs.createReadStream('源文件.mp4');
const writableStream = fs.createWriteStream('目标文件.mp4');

// 使用管道连接两个流
readableStream.pipe(writableStream);

// 处理完成事件
writableStream.on('finish', () => {
  console.log('文件复制完成');
});

// 处理错误
readableStream.on('error', (err) => {
  console.error('读取错误:', err);
});

writableStream.on('error', (err) => {
  console.error('写入错误:', err);
});
```

管道链：
```javascript
// 管道链示例 - 压缩文件
const fs = require('fs');
const zlib = require('zlib');

// 创建流
const readableStream = fs.createReadStream('大文件.txt');
const gzipStream = zlib.createGzip();
const writableStream = fs.createWriteStream('大文件.txt.gz');

// 链式调用pipe
readableStream
  .pipe(gzipStream)     // 压缩数据
  .pipe(writableStream) // 写入文件
  .on('finish', () => {
    console.log('文件压缩完成');
  });
```

##### 自定义流

可以通过继承流基类来创建自定义流：

```javascript
// 自定义转换流 - 将文本转换为大写
const { Transform } = require('stream');

class UppercaseTransform extends Transform {
  constructor(options) {
    // 调用父类构造函数
    super(options);
  }
  
  // 实现_transform方法
  _transform(chunk, encoding, callback) {
    // 将数据转换为大写
    const upperChunk = chunk.toString().toUpperCase();
    
    // 推送转换后的数据
    this.push(upperChunk);
    
    // 调用回调表示当前数据块处理完成
    callback();
  }
  
  // 可选: 实现_flush方法处理流结束时的操作
  _flush(callback) {
    // 推送额外的最终数据（如有）
    this.push('\n--- 转换结束 ---\n');
    
    // 调用回调表示所有处理完成
    callback();
  }
}

// 使用自定义转换流
const fs = require('fs');
const uppercaseTransform = new UppercaseTransform();

// 创建可读流和可写流
const readableStream = fs.createReadStream('input.txt');
const writableStream = fs.createWriteStream('output.txt');

// 管道连接
readableStream
  .pipe(uppercaseTransform)
  .pipe(writableStream)
  .on('finish', () => {
    console.log('转换并写入完成');
  });
```

##### 流事件

不同类型的流触发不同的事件：

```
可读流事件:
+---------------+---------------------------------------+
| 事件          | 描述                                  |
+---------------+---------------------------------------+
| data          | 当流将数据块传给消费者时               |
| end           | 当没有更多数据可读时                   |
| error         | 当接收和写入过程中发生错误时           |
| close         | 当流或其底层资源被关闭时               |
| readable      | 当流中有数据可读时                     |
+---------------+---------------------------------------+

可写流事件:
+---------------+---------------------------------------+
| 事件          | 描述                                  |
+---------------+---------------------------------------+
| drain         | 当可以继续写入数据到流时               |
| finish        | 当所有数据已被写入底层系统时           |
| error         | 当写入过程中发生错误时                 |
| close         | 当流或其底层资源被关闭时               |
| pipe          | 当流被可读流用pipe()方法作为目标时     |
| unpipe        | 当可读流上的unpipe()被调用时           |
+---------------+---------------------------------------+
```

##### 背压处理

背压(backpressure)是流操作中的重要概念，它处理当写入速度慢于读取速度时的情况：

```javascript
// 背压处理示例
const fs = require('fs');

// 创建可读流和可写流
const readableStream = fs.createReadStream('大文件.mp4');
const writableStream = fs.createWriteStream('目标文件.mp4');

// 手动实现背压控制
readableStream.on('data', (chunk) => {
  // 尝试写入数据块
  const canContinue = writableStream.write(chunk);
  
  // 如果缓冲区已满，暂停读取
  if (!canContinue) {
    console.log('背压: 暂停读取');
    readableStream.pause();
  }
});

// 当缓冲区清空时，继续读取
writableStream.on('drain', () => {
  console.log('背压: 继续读取');
  readableStream.resume();
});

// 处理结束和错误
readableStream.on('end', () => {
  writableStream.end();
});

readableStream.on('error', (err) => {
  console.error('读取错误:', err);
  writableStream.end();
});

writableStream.on('error', (err) => {
  console.error('写入错误:', err);
  readableStream.destroy();
});
```

##### 流的实际应用

```javascript
// 例1: HTTP服务器中的流处理
const http = require('http');
const fs = require('fs');
const server = http.createServer((req, res) => {
  // 视频流示例
  if (req.url === '/video') {
    const videoPath = 'big_buck_bunny.mp4';
    const stat = fs.statSync(videoPath);
    
    // 处理范围请求
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      
      // 创建特定范围的可读流
      fs.createReadStream(videoPath, { start, end }).pipe(res);
    } else {
      // 发送整个文件
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  }
  // 文件上传示例
  else if (req.url === '/upload' && req.method === 'POST') {
    const writableStream = fs.createWriteStream('uploaded_file');
    
    req.pipe(writableStream);
    
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('文件上传成功');
    });
  }
  else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000/');
});

// 例2: 数据处理管道
// CSV解析示例
const { Transform } = require('stream');
const fs = require('fs');

// 创建CSV解析转换流
class CSVParser extends Transform {
  constructor(options = {}) {
    options.objectMode = true; // 使流可以处理对象而不是缓冲区
    super(options);
    this._headers = null;
    this._remainder = '';
  }
  
  _transform(chunk, encoding, callback) {
    // 将缓冲区转换为字符串并添加之前的余下部分
    const lines = (this._remainder + chunk.toString()).split('\n');
    this._remainder = lines.pop(); // 保存可能不完整的最后一行
    
    // 处理头部
    if (!this._headers) {
      this._headers = lines.shift().split(',');
    }
    
    // 处理数据行
    for (const line of lines) {
      const values = line.split(',');
      if (values.length === this._headers.length) {
        // 创建对象，将每个值映射到对应的头部
        const obj = {};
        this._headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        this.push(obj);
      }
    }
    
    callback();
  }
  
  _flush(callback) {
    // 处理余下的最后一部分（如果有）
    if (this._remainder) {
      const values = this._remainder.split(',');
      if (values.length === this._headers.length) {
        const obj = {};
        this._headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        this.push(obj);
      }
    }
    callback();
  }
}

// 创建JSON格式化转换流
class JSONFormatter extends Transform {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
    this.firstChunk = true;
  }
  
  _transform(chunk, encoding, callback) {
    // 如果是第一个数据块，开始JSON数组
    if (this.firstChunk) {
      this.push('[\n');
      this.firstChunk = false;
    } else {
      this.push(',\n'); // 添加逗号分隔前一个对象
    }
    
    // 格式化对象为漂亮的JSON
    this.push(JSON.stringify(chunk, null, 2));
    callback();
  }
  
  _flush(callback) {
    // 结束JSON数组
    this.push('\n]');
    callback();
  }
}

// 使用管道链处理CSV并转换为JSON
fs.createReadStream('data.csv')
  .pipe(new CSVParser())
  .pipe(new JSONFormatter())
  .pipe(fs.createWriteStream('data.json'))
  .on('finish', () => {
    console.log('CSV转换为JSON完成');
  });
```

通过流模块，Node.js能够高效处理大量数据，实现高性能的I/O操作，这是构建可扩展应用的关键基础。

#### 进程模块(process/child_process)

Node.js提供了进程管理能力，包括主进程控制和子进程创建，用于充分利用多核CPU和执行外部命令。

##### process模块

process模块是一个全局对象，提供当前Node.js进程的信息和控制能力：

```javascript
// process基本用法
// 不需要require，可直接使用

// 进程信息
console.log('进程ID:', process.pid);
console.log('进程标题:', process.title);
console.log('Node.js版本:', process.version);
console.log('架构:', process.arch);
console.log('平台:', process.platform);
console.log('用户环境:', process.env);  // 环境变量对象
console.log('当前工作目录:', process.cwd());
console.log('运行时间(秒):', process.uptime());

// 内存使用
const memoryUsage = process.memoryUsage();
console.log('内存使用情况:', {
  rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`, // 常驻集大小
  heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`, // V8分配的总内存
  heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`, // V8使用的堆内存
  external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB` // 绑定到V8的C++对象的内存
});

// CPU使用
const cpuUsage = process.cpuUsage();
console.log('CPU使用情况(微秒):', {
  user: cpuUsage.user,  // 用户代码使用的CPU时间
  system: cpuUsage.system  // 系统代码使用的CPU时间
});
```

##### 进程事件和信号

process模块可以监听各种事件：

```javascript
// 进程事件监听
// 退出前执行清理工作
process.on('exit', (code) => {
  console.log(`进程即将退出，退出码: ${code}`);
  // 执行同步操作的清理代码
  // 注意: 这里不能执行异步操作，因为事件循环已经结束
});

// 当Node.js进程收到SIGINT信号(如按Ctrl+C)
process.on('SIGINT', () => {
  console.log('接收到SIGINT信号，准备关闭...');
  // 执行清理操作
  // ...
  // 一切完成后退出
  process.exit(0);
});

// 未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 记录错误日志
  // ...
  // 尝试优雅地关闭，但建议重启进程
  process.exit(1);
});

// 未处理的Promise拒绝(Node.js 6.6.0+)
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 记录错误信息
  // 注意: 在未来的Node.js版本中，未处理的Promise拒绝将导致进程崩溃
});

// 警告事件(例如过时API或使用不当)
process.on('warning', (warning) => {
  console.warn('警告:', warning.name);
  console.warn('消息:', warning.message);
  console.warn('堆栈:', warning.stack);
});
```

##### 进程输入/输出流

process提供了标准输入输出流的访问：

```javascript
// 标准输入输出
// 写入标准输出
process.stdout.write('这是标准输出\n');

// 写入标准错误
process.stderr.write('这是错误输出\n');

// 读取标准输入
console.log('请输入您的名字:');
process.stdin.on('data', (data) => {
  const name = data.toString().trim();
  console.log(`您好, ${name}!`);
  process.exit();
});
```

##### 进程控制

process模块允许控制进程执行流：

```javascript
// 进程控制
// 立即终止进程
// process.exit(1);  // 非零代码表示错误

// 下一个事件循环迭代开始时执行
process.nextTick(() => {
  console.log('这在当前操作之后、下一个事件循环迭代之前执行');
});

// 设置定时任务，在I/O操作完成后执行
setImmediate(() => {
  console.log('这在I/O回调之后执行');
});

// 发送自定义信号给进程
// 在另一个Node.js进程中，可以这样接收信号:
// process.on('SIGUSR1', () => { console.log('收到SIGUSR1信号'); });
// process.kill(otherPid, 'SIGUSR1');

// 获取命令行参数
console.log('命令行参数:', process.argv);

// 示例: 根据参数执行不同操作
const args = process.argv.slice(2); // 前两个参数是node路径和脚本路径
if (args.includes('--help')) {
  console.log('帮助信息...');
} else if (args.includes('--version')) {
  console.log('v1.0.0');
}
```

##### child_process模块

child_process模块可以创建子进程，执行系统命令或并行处理任务：

```javascript
// 子进程模块基本使用
const { exec, spawn, fork, execFile, execSync, spawnSync } = require('child_process');

// 1. exec - 执行shell命令，缓冲全部输出
exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行错误: ${error}`);
    return;
  }
  console.log(`标准输出: ${stdout}`);
  if (stderr) console.error(`标准错误: ${stderr}`);
});

// 2. spawn - 启动新进程，适合大量数据和长时间运行的进程
const ls = spawn('ls', ['-la']);

ls.stdout.on('data', (data) => {
  console.log(`输出: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`错误: ${data}`);
});

ls.on('close', (code) => {
  console.log(`子进程退出，退出码 ${code}`);
});

// 3. fork - 创建Node.js进程，与父进程通信
// 假设worker.js是一个Node.js脚本
const child = fork('worker.js');

// 发送消息给子进程
child.send({ type: 'START', data: { x: 1, y: 2 } });

// 接收子进程消息
child.on('message', (message) => {
  console.log('从子进程收到:', message);
});

// 处理子进程退出
child.on('exit', (code) => {
  console.log(`子进程退出，退出码: ${code}`);
});
```

下面是worker.js的示例：

```javascript
// worker.js - 子进程文件
process.on('message', (message) => {
  console.log('收到父进程消息:', message);
  
  // 模拟一些工作
  setTimeout(() => {
    // 完成后发送结果回父进程
    process.send({ type: 'RESULT', data: { result: message.data.x + message.data.y } });
  }, 1000);
});
```

##### 进程通信模式

进程间通信(IPC)是多进程应用的核心：

```javascript
// 进程通信示例 - 主进程
const { fork } = require('child_process');
const os = require('os');

// 创建与CPU核心数量相同的工作进程
const numCPUs = os.cpus().length;
const workers = [];

console.log(`创建 ${numCPUs} 个工作进程`);

// 任务数据
const tasks = [];
for (let i = 0; i < 100; i++) {
  tasks.push({ id: i, data: Math.random() * 100 });
}

// 创建工作进程
for (let i = 0; i < numCPUs; i++) {
  const worker = fork('task_worker.js');
  
  // 工作进程就绪时分配任务
  worker.on('message', (message) => {
    if (message.type === 'READY') {
      // 分配任务
      if (tasks.length > 0) {
        const task = tasks.pop();
        worker.send({ type: 'TASK', task });
      } else {
        // 没有更多任务
        worker.send({ type: 'EXIT' });
      }
    } else if (message.type === 'RESULT') {
      console.log(`任务 ${message.id} 完成，结果: ${message.result}`);
      
      // 继续分配更多任务
      if (tasks.length > 0) {
        const task = tasks.pop();
        worker.send({ type: 'TASK', task });
      } else {
        // 没有更多任务
        worker.send({ type: 'EXIT' });
      }
    }
  });
  
  worker.on('exit', () => {
    console.log(`工作进程 #${i} 退出`);
    
    // 从活动工作进程列表中移除
    workers.splice(workers.indexOf(worker), 1);
    
    // 当所有工作进程完成时退出主进程
    if (workers.length === 0) {
      console.log('所有工作进程已完成，主进程退出');
    }
  });
  
  workers.push(worker);
  
  // 告诉工作进程开始请求任务
  worker.send({ type: 'INIT' });
}
```

工作进程代码(task_worker.js)：

```javascript
// task_worker.js - 工作进程
process.on('message', (message) => {
  if (message.type === 'INIT') {
    // 初始化并请求任务
    process.send({ type: 'READY' });
  } else if (message.type === 'TASK') {
    // 处理任务
    const task = message.task;
    
    // 模拟工作处理
    setTimeout(() => {
      // 计算结果(示例: 数据的平方)
      const result = task.data * task.data;
      
      // 发送结果回主进程
      process.send({ 
        type: 'RESULT', 
        id: task.id, 
        result 
      });
    }, 100); // 模拟处理时间
  } else if (message.type === 'EXIT') {
    // 清理并退出
    process.exit(0);
  }
});
```

##### 使用子进程处理CPU密集型任务

```javascript
// CPU密集型任务示例 - 主文件
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// 计算第n个斐波那契数的函数(CPU密集型)
function calculateFibonacci(n) {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

if (isMainThread) {
  // 这是主线程代码
  console.time('使用workers');
  
  const numbers = [40, 41, 42, 43]; // 大数字导致计算密集
  let completed = 0;
  const results = [];
  
  // 为每个计算创建一个工作线程
  for (let i = 0; i < numbers.length; i++) {
    const worker = new Worker(__filename, {
      workerData: { number: numbers[i], index: i }
    });
    
    worker.on('message', (message) => {
      results[message.index] = message.result;
      completed++;
      
      if (completed === numbers.length) {
        console.log('所有工作线程完成，结果:', results);
        console.timeEnd('使用workers');
        
        // 比较单线程性能
        console.time('不使用workers');
        const singleResults = numbers.map(n => calculateFibonacci(n));
        console.log('单线程结果:', singleResults);
        console.timeEnd('不使用workers');
      }
    });
    
    worker.on('error', err => console.error(err));
    worker.on('exit', code => {
      if (code !== 0)
        console.error(`工作线程退出，退出码: ${code}`);
    });
  }
  
} else {
  // 这是工作线程代码
  const { number, index } = workerData;
  
  // 执行计算
  const result = calculateFibonacci(number);
  
  // 将结果发送回主线程
  parentPort.postMessage({ index, result });
}
```

##### 子进程的安全考虑

使用子进程时需要注意安全问题，特别是执行外部命令：

```javascript
// 安全注意事项 - 命令注入风险示例
const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/unsafe', (req, res) => {
  const userInput = req.query.command;
  
  // 危险: 直接将用户输入拼接到命令中
  // 攻击者可以输入类似 "file.txt; rm -rf *" 的值
  exec(`cat ${userInput}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(error.message);
    }
    res.send(stdout);
  });
});

// 安全版本
app.get('/safe', (req, res) => {
  const fileName = req.query.fileName;
  
  // 验证文件名格式，只允许字母数字字符和有限的特殊字符
  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    return res.status(400).send('无效的文件名');
  }
  
  // 使用execFile更安全，不会启动shell
  const { execFile } = require('child_process');
  execFile('cat', [fileName], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(error.message);
    }
    res.send(stdout);
  });
});

// 最安全：根本不使用外部命令，使用Node.js内置模块
app.get('/best', (req, res) => {
  const fileName = req.query.fileName;
  
  // 验证文件名
  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    return res.status(400).send('无效的文件名');
  }
  
  const fs = require('fs');
  const path = require('path');
  
  // 确保路径是安全的
  const safePath = path.join(__dirname, 'safe_files', fileName);
  
  // 验证最终路径不超出安全目录
  if (!safePath.startsWith(path.join(__dirname, 'safe_files'))) {
    return res.status(403).send('访问被拒绝');
  }
  
  fs.readFile(safePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send(data);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
```

##### 进程管理最佳实践

```javascript
// 进程管理最佳实践 - 集群模式
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isMaster) {
  // 主进程代码
  console.log(`主进程 ${process.pid} 正在运行`);
  
  // 记录工作进程状态
  let workersAlive = {};
  
  // 获取CPU核心数
  const numCPUs = os.cpus().length;
  
  // 创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workersAlive[worker.id] = true;
    
    // 工作进程通信
    worker.on('message', (message) => {
      if (message.type === 'STATUS') {
        console.log(`工作进程 ${worker.id} 状态: ${message.status}`);
      }
    });
  }
  
  // 工作进程退出时重启
  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 退出 (${signal || code})`);
    
    // 非正常退出时重启
    if (code !== 0 && workersAlive[worker.id]) {
      console.log(`工作进程 ${worker.id} 异常退出，重新启动`);
      const newWorker = cluster.fork();
      workersAlive[newWorker.id] = true;
      delete workersAlive[worker.id];
    }
  });
  
  // 定期检查工作进程
  setInterval(() => {
    for (const id in cluster.workers) {
      cluster.workers[id].send({ type: 'PING' });
    }
  }, 30000);
  
} else {
  // 工作进程代码
  console.log(`工作进程 ${process.pid} 启动`);
  
  // 创建HTTP服务器
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`工作进程 ${process.pid} 处理请求\n`);
  }).listen(8000);
  
  // 接收主进程的消息
  process.on('message', (message) => {
    if (message.type === 'PING') {
      // 响应健康检查
      process.send({ type: 'STATUS', status: 'HEALTHY' });
    }
  });
  
  // 发送就绪消息
  process.send({ type: 'STATUS', status: 'READY' });
  
  // 优雅退出
  process.on('SIGTERM', () => {
    console.log(`工作进程 ${process.pid} 接收到SIGTERM，准备关闭`);
    
    // 停止接受新请求
    server.close(() => {
      console.log(`工作进程 ${process.pid} 已关闭所有连接`);
      process.exit(0);
    });
    
    // 如果15秒后仍未退出，强制退出
    setTimeout(() => {
      console.log(`工作进程 ${process.pid} 强制退出`);
      process.exit(1);
    }, 15000);
  });
}
```

通过process和child_process模块，Node.js可以充分利用多核系统的性能，同时为多进程应用提供稳定和安全的运行环境。

#### 事件模块(events)

事件模块是Node.js的核心模块之一，提供了实现事件驱动编程的基础。它允许对象触发和处理自定义事件，是Node.js异步特性的关键组成部分。

##### EventEmitter基础

EventEmitter类是事件模块的核心：

```javascript
// EventEmitter基础示例
const EventEmitter = require('events');

// 创建EventEmitter实例
const myEmitter = new EventEmitter();

// 注册事件监听器
myEmitter.on('event', function(a, b) {
  console.log('事件触发! 参数:', a, b);
  console.log('this指向:', this === myEmitter); // true
});

// 触发事件
myEmitter.emit('event', 'arg1', 'arg2');
```

##### 事件处理方法

EventEmitter类提供了多种事件处理方法：

```javascript
// 事件处理方法示例
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// 1. on() - 添加事件监听器
myEmitter.on('regular', () => {
  console.log('常规事件监听器');
});

// 2. once() - 添加只执行一次的事件监听器
myEmitter.once('once', () => {
  console.log('这个监听器只会执行一次');
});

// 3. prependListener() - 添加事件监听器到监听器数组的开头
myEmitter.on('priority', () => {
  console.log('常规优先级');
});
myEmitter.prependListener('priority', () => {
  console.log('高优先级 - 先执行');
});

// 4. removeListener() / off() - 移除指定监听器
const listener = () => console.log('可移除的监听器');
myEmitter.on('removable', listener);
// 稍后移除
myEmitter.removeListener('removable', listener);
// 或者使用别名 (Node.js 10+)
// myEmitter.off('removable', listener);

// 5. removeAllListeners() - 移除全部监听器
myEmitter.on('cleanup', () => console.log('监听器 1'));
myEmitter.on('cleanup', () => console.log('监听器 2'));
// 移除特定事件的全部监听器
myEmitter.removeAllListeners('cleanup');
// 或者移除所有事件的全部监听器
// myEmitter.removeAllListeners();

// 测试以上方法
myEmitter.emit('regular');       // 输出: 常规事件监听器
myEmitter.emit('once');          // 输出: 这个监听器只会执行一次
myEmitter.emit('once');          // 不会有输出
myEmitter.emit('priority');      // 输出: 高优先级 - 先执行
                                // 输出: 常规优先级
myEmitter.emit('removable');     // 没有输出 (已移除)
myEmitter.emit('cleanup');       // 没有输出 (已移除)
```

##### 错误事件处理

错误事件是EventEmitter中的特殊事件：

```javascript
// 错误事件处理
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// 处理错误事件的最佳实践
myEmitter.on('error', (err) => {
  console.error('发生错误:', err.message);
  // 可以记录错误，但程序继续运行
});

// 触发错误事件
myEmitter.emit('error', new Error('出现问题!'));

// 如果没有错误监听器，Node.js会抛出异常并结束程序
// 未处理的错误事件示例
const badEmitter = new EventEmitter();
// 触发错误但没有错误处理器 - 会导致程序崩溃
// badEmitter.emit('error', new Error('未处理的错误'));
```

##### 自定义EventEmitter类

通过继承EventEmitter可以创建自定义事件发射器：

```javascript
// 自定义EventEmitter类
const EventEmitter = require('events');

// 定义一个自定义类继承EventEmitter
class MyStream extends EventEmitter {
  constructor() {
    super();
    // 初始化工作
  }
  
  write(data) {
    // 执行操作...
    this.emit('data', data); // 触发 'data' 事件
  }
  
  end() {
    // 执行结束操作...
    this.emit('end'); // 触发 'end' 事件
  }
  
  error(err) {
    this.emit('error', err); // 触发 'error' 事件
  }
}

// 使用自定义类
const stream = new MyStream();

// 添加事件监听器
stream.on('data', (data) => {
  console.log('收到数据:', data);
});

stream.on('end', () => {
  console.log('流结束');
});

stream.on('error', (err) => {
  console.error('流错误:', err.message);
});

// 触发事件
stream.write('一些数据');
stream.end();
stream.error(new Error('流处理错误'));
```

##### 异步与同步事件

事件默认是同步触发的，但可以使用process.nextTick()或setImmediate()使其异步：

```javascript
// 同步与异步事件示例
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// 同步事件
myEmitter.on('sync', () => {
  console.log('同步事件触发');
});

// 使用nextTick实现异步事件
myEmitter.on('async1', () => {
  process.nextTick(() => {
    console.log('nextTick异步事件触发');
  });
});

// 使用setImmediate实现异步事件
myEmitter.on('async2', () => {
  setImmediate(() => {
    console.log('setImmediate异步事件触发');
  });
});

console.log('开始');
myEmitter.emit('sync');    // 立即执行
myEmitter.emit('async1');  // 在当前事件循环结束时执行
myEmitter.emit('async2');  // 在下一个事件循环迭代时执行
console.log('结束');

// 输出顺序:
// 开始
// 同步事件触发
// 结束
// nextTick异步事件触发
// setImmediate异步事件触发
```

##### 事件监听器限制

Node.js默认限制每个事件最多有10个监听器，可以修改这个限制：

```javascript
// 监听器限制示例
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// 添加超过默认数量的监听器会收到警告
// 检查默认限制
console.log('默认最大监听器数:', myEmitter.getMaxListeners());  // 通常是10

// 修改特定实例的限制
myEmitter.setMaxListeners(20);
console.log('修改后最大监听器数:', myEmitter.getMaxListeners());  // 20

// 修改所有新实例的默认限制
EventEmitter.defaultMaxListeners = 15;
const anotherEmitter = new EventEmitter();
console.log('新实例最大监听器数:', anotherEmitter.getMaxListeners());  // 15

// 添加多个监听器
for (let i = 0; i < 12; i++) {
  myEmitter.on('many', () => console.log(`监听器 ${i}`));
}

// 获取某个事件的监听器数量
console.log('many事件监听器数量:', myEmitter.listenerCount('many'));  // 12

// 获取所有监听器
console.log('监听器函数:', myEmitter.listeners('many'));
```

##### 实用技巧

EventEmitter的一些实用模式和技巧：

```javascript
// 实用技巧示例
const EventEmitter = require('events');

// 1. 单例模式事件总线
// 创建全局事件总线
const eventBus = new EventEmitter();

// 在不同模块中使用
// 模块A
function moduleA() {
  // 发布事件
  eventBus.emit('A_READY', { data: 'A模块就绪' });
  
  // 监听其他模块事件
  eventBus.on('B_DATA', (data) => {
    console.log('A模块收到B模块数据:', data);
  });
}

// 模块B
function moduleB() {
  // 监听模块A事件
  eventBus.on('A_READY', (data) => {
    console.log('B模块知道A模块就绪:', data);
    // 响应
    eventBus.emit('B_DATA', { response: 'B模块响应' });
  });
}

// 模拟模块执行
moduleB();  // 先设置监听器
moduleA();  // 后触发事件

// 2. 事件队列与排队处理
class TaskQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
    
    // 当任务完成时处理队列中的下一项
    this.on('taskComplete', () => {
      this.processing = false;
      this.processNext();
    });
  }
  
  // 添加任务到队列
  addTask(task) {
    this.queue.push(task);
    // 如果没有处理中的任务，启动处理
    if (!this.processing) {
      this.processNext();
    }
  }
  
  // 处理下一个任务
  processNext() {
    if (this.queue.length === 0) {
      this.emit('empty');
      return;
    }
    
    this.processing = true;
    const task = this.queue.shift();
    
    // 触发任务开始事件
    this.emit('taskStart', task);
    
    // 模拟异步任务
    setTimeout(() => {
      task.run();
      // 触发任务完成事件
      this.emit('taskComplete', task);
    }, 1000);
  }
}

// 使用任务队列
const taskQueue = new TaskQueue();

// 监听队列事件
taskQueue.on('taskStart', (task) => {
  console.log(`开始任务: ${task.name}`);
});

taskQueue.on('taskComplete', (task) => {
  console.log(`完成任务: ${task.name}`);
});

taskQueue.on('empty', () => {
  console.log('队列为空，所有任务完成');
});

// 添加任务
taskQueue.addTask({
  name: '任务 1',
  run: () => console.log('执行任务 1')
});

taskQueue.addTask({
  name: '任务 2',
  run: () => console.log('执行任务 2')
});
```

##### 调试事件

调试EventEmitter事件流可以增强应用的可维护性：

```javascript
// 事件调试示例
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// 通过函数名便于在堆栈跟踪中识别
function handleEvent(data) {
  console.log('事件数据:', data);
  
  // 模拟错误
  if (data.error) {
    throw new Error('处理事件时出错');
  }
}

// 包装调试事件
function debugEvent(emitter, event) {
  const originalEmit = emitter.emit;
  
  // 重写emit方法进行调试
  emitter.emit = function(type, ...args) {
    if (type === event) {
      console.log(`[DEBUG] 事件 '${type}' 触发，参数:`, args);
      try {
        return originalEmit.apply(this, [type, ...args]);
      } catch (err) {
        console.error(`[DEBUG] 事件 '${type}' 处理时出错:`, err);
        throw err; // 继续传播错误
      } finally {
        console.log(`[DEBUG] 事件 '${type}' 处理完成`);
      }
    } else {
      return originalEmit.apply(this, [type, ...args]);
    }
  };
}

// 添加事件监听器
myEmitter.on('data', handleEvent);

// 应用调试包装
debugEvent(myEmitter, 'data');

// 测试正常事件流
myEmitter.emit('data', { id: 1, value: 'test' });

// 测试错误处理
try {
  myEmitter.emit('data', { error: true });
} catch (err) {
  console.log('捕获到主程序中的错误');
}
```

事件驱动编程是Node.js的核心特性，通过EventEmitter可以创建松耦合、高度可扩展的应用程序，使得处理异步操作和回调变得更加优雅。

#### 缓冲区模块(Buffer)

缓冲区(Buffer)是Node.js中处理二进制数据的核心模块，提供了在JavaScript中直接操作内存的能力，常用于处理文件、网络通信和加密等场景。

##### Buffer基础

Buffer是一个类似于数组的对象，但它专门用于存储字节数据：

```javascript
// Buffer基础示例
// 在Node.js中，Buffer是全局变量，不需要require

// 1. 创建Buffer
// 从字符串创建
const buf1 = Buffer.from('Hello, 世界');
console.log('buf1:', buf1);
console.log('buf1内容:', buf1.toString());  // 转换回字符串

// 从数组创建
const buf2 = Buffer.from([72, 101, 108, 108, 111]);  // ASCII值
console.log('buf2内容:', buf2.toString());  // "Hello"

// 创建指定大小的Buffer
const buf3 = Buffer.alloc(10);  // 创建10字节的Buffer，初始化为0
console.log('buf3:', buf3);

// 创建未初始化的Buffer(性能更好，但可能包含旧数据)
const buf4 = Buffer.allocUnsafe(10);
console.log('buf4(未初始化):', buf4);
// 填充安全值
buf4.fill(0);
console.log('buf4(已填充):', buf4);

// 2. 写入Buffer
buf3.write('Node.js');
console.log('写入后buf3:', buf3);
console.log('buf3内容:', buf3.toString());  // "Node.js"

// 3. 读取Buffer
console.log('buf1第一个字节:', buf1[0]);  // 获取第一个字节的值
// 使用readInt8/readUInt8方法
console.log('使用方法读取:', buf1.readUInt8(0));  // 同上

// 4. Buffer长度
console.log('buf1长度(字节):', buf1.length);
console.log('buf1字符串长度:', Buffer.from('Hello, 世界').toString().length);
// 注意: 一个中文字符在UTF-8中通常占3个字节
```

##### 编码与转换

Buffer支持多种字符编码：

```javascript
// 编码与转换示例
// 支持的编码: utf8, ascii, latin1, base64, hex, utf16le...

// 字符串到Buffer(指定编码)
const text = '你好，Node.js!';
const buf1 = Buffer.from(text, 'utf8');
console.log('UTF-8 Buffer:', buf1);
console.log('Buffer长度:', buf1.length);  // 比字符数多，因为中文占多字节

// Buffer到字符串(指定编码)
console.log('UTF-8解码:', buf1.toString('utf8'));

// Base64编码/解码
const base64Buf = Buffer.from(text);
const base64Str = base64Buf.toString('base64');
console.log('Base64编码:', base64Str);

// Base64解码
const decodedBuf = Buffer.from(base64Str, 'base64');
console.log('Base64解码:', decodedBuf.toString('utf8'));

// Hex(十六进制)编码/解码
const hexStr = buf1.toString('hex');
console.log('Hex编码:', hexStr);

// Hex解码
const fromHex = Buffer.from(hexStr, 'hex');
console.log('Hex解码:', fromHex.toString());

// ASCII编码(不支持非ASCII字符)
const asciiBuf = Buffer.from('Hello!', 'ascii');
console.log('ASCII Buffer:', asciiBuf);
console.log('ASCII解码:', asciiBuf.toString('ascii'));

// 字符编码转换
// 例如从UTF-8到UTF-16LE
const utf8Buf = Buffer.from(text, 'utf8');
const utf16Str = utf8Buf.toString('utf16le');
console.log('UTF-16LE编码:', Buffer.from(utf16Str, 'utf16le'));
```

##### Buffer操作

Buffer提供了丰富的操作方法：

```javascript
// Buffer操作示例
// 1. 连接Buffer
const buf1 = Buffer.from('Hello ');
const buf2 = Buffer.from('World');
const buf3 = Buffer.from('!');

// 使用concat方法
const combined = Buffer.concat([buf1, buf2, buf3]);
console.log('连接结果:', combined.toString());  // "Hello World!"

// 2. 比较Buffer
const buf4 = Buffer.from('1234');
const buf5 = Buffer.from('0123');
const buf6 = Buffer.from('1234');

// 使用compare方法
console.log('buf4 vs buf5:', buf4.compare(buf5));  // 1 (buf4 > buf5)
console.log('buf5 vs buf4:', buf5.compare(buf4));  // -1 (buf5 < buf4)
console.log('buf4 vs buf6:', buf4.compare(buf6));  // 0 (相等)

// 3. 复制Buffer
const source = Buffer.from('Hello');
const target = Buffer.alloc(5);  // 创建5字节的缓冲区
source.copy(target);
console.log('复制结果:', target.toString());  // "Hello"

// 部分复制
const partial = Buffer.alloc(10);
source.copy(partial, 2, 0, 3);  // 将source的0-3字节复制到partial的2位置开始
console.log('部分复制:', partial.toString());  // "  Hel"

// 4. 切片Buffer
const original = Buffer.from('Original Buffer');
// 切片是原Buffer的视图，不是复制
const slice = original.slice(0, 8);
console.log('切片内容:', slice.toString());  // "Original"

// 修改切片会影响原Buffer
slice[0] = 111;  // ASCII码为'o'
console.log('修改后原Buffer:', original.toString());  // "original Buffer"

// 5. 填充Buffer
const emptyBuf = Buffer.alloc(10);
emptyBuf.fill('X');
console.log('填充后:', emptyBuf.toString());  // "XXXXXXXXXX"

// 6. 查找Buffer
const haystack = Buffer.from('Node.js Buffer Module');
const needle = Buffer.from('Buffer');
console.log('查找结果:', haystack.indexOf(needle));  // 7
console.log('包含"Buffer":', haystack.includes(needle));  // true
```

##### 二进制数据操作

Buffer支持各种二进制数据读写操作，对网络协议和文件处理很重要：

```javascript
// 二进制数据操作示例
// 创建一个Buffer来存储不同类型的数据
const buf = Buffer.alloc(16);

// 写入整数
buf.writeInt8(123, 0);          // 写入8位整数(1字节)
buf.writeInt16LE(12345, 1);     // 写入16位小端整数(2字节)
buf.writeInt32BE(1234567890, 3); // 写入32位大端整数(4字节)
buf.writeFloatLE(3.1415, 7);    // 写入32位小端浮点数(4字节)
buf.writeDoubleLE(Math.PI, 11); // 写入64位小端双精度浮点数(8字节)

// 读取整数
console.log('Int8:', buf.readInt8(0));           // 123
console.log('Int16LE:', buf.readInt16LE(1));     // 12345
console.log('Int32BE:', buf.readInt32BE(3));     // 1234567890
console.log('FloatLE:', buf.readFloatLE(7));     // 约等于3.1415
console.log('DoubleLE:', buf.readDoubleLE(11));  // PI

// 创建用于网络协议的消息
const message = Buffer.alloc(16);
let offset = 0;

// 写入消息头(例如协议版本和消息类型)
message.writeUInt8(1, offset++);         // 协议版本
message.writeUInt8(5, offset++);         // 消息类型

// 写入消息长度
message.writeUInt16BE(12, offset);       // 消息体长度
offset += 2;

// 写入时间戳
message.writeUInt32BE(Date.now() / 1000 >>> 0, offset);
offset += 4;

// 写入数据
message.writeFloatBE(37.5, offset);      // 温度数据
offset += 4;
message.writeUInt32BE(123456, offset);   // 其他数据

console.log('协议消息:', message);

// 解析消息
offset = 0;
const parsed = {
  version: message.readUInt8(offset++),
  type: message.readUInt8(offset++),
  length: message.readUInt16BE(offset),
  timestamp: new Date(message.readUInt32BE(offset + 2) * 1000),
  temperature: message.readFloatBE(offset + 6),
  data: message.readUInt32BE(offset + 10)
};

console.log('解析结果:', parsed);
```

##### Buffer与流的结合

Buffer通常与流一起使用，特别是处理大型二进制数据时：

```javascript
// Buffer与流结合示例
const fs = require('fs');
const crypto = require('crypto');

// 使用Buffer读取二进制文件
function readFileIntoBuffer(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) return reject(err);
      resolve(data);  // data是一个Buffer
    });
  });
}

// 使用流处理大文件并进行Buffer操作
function processLargeFile(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    // 创建读取流
    const readStream = fs.createReadStream(inputFile, {
      highWaterMark: 64 * 1024  // 64KB块
    });
    
    // 创建写入流
    const writeStream = fs.createWriteStream(outputFile);
    
    // 创建哈希对象计算文件的校验和
    const hash = crypto.createHash('sha256');
    
    readStream.on('data', (chunk) => {
      // chunk是一个Buffer
      console.log(`处理 ${chunk.length} 字节的数据`);
      
      // 对数据进行处理
      // 例如，转换所有字母为大写(仅适用于文本数据)
      for (let i = 0; i < chunk.length; i++) {
        // 97-122是小写字母的ASCII码
        if (chunk[i] >= 97 && chunk[i] <= 122) {
          chunk[i] = chunk[i] - 32;  // 转换为大写
        }
      }
      
      // 更新哈希
      hash.update(chunk);
      
      // 写入转换后的数据
      writeStream.write(chunk);
    });
    
    readStream.on('end', () => {
      // 完成写入
      writeStream.end();
      
      // 获取最终哈希值
      const digest = hash.digest('hex');
      console.log('文件SHA-256哈希:', digest);
      
      resolve(digest);
    });
    
    readStream.on('error', reject);
    writeStream.on('error', reject);
  });
}

// 使用示例
// readFileIntoBuffer('image.png')
//   .then(buffer => {
//     console.log('文件大小:', buffer.length, '字节');
//     // 处理图像数据...
//   })
//   .catch(err => console.error('读取错误:', err));

// processLargeFile('input.txt', 'output.txt')
//   .then(hash => console.log('处理完成，哈希值:', hash))
//   .catch(err => console.error('处理错误:', err));
```

##### Buffer性能优化

Buffer操作性能对I/O密集型应用至关重要：

```javascript
// Buffer性能优化示例
// 1. 预分配Buffer
function processChunks(numberOfChunks, chunkSize) {
  console.time('预分配');
  // 预分配足够大的Buffer
  const buffer = Buffer.alloc(numberOfChunks * chunkSize);
  
  for (let i = 0; i < numberOfChunks; i++) {
    // 写入到预分配的Buffer
    buffer.write('X'.repeat(chunkSize), i * chunkSize);
  }
  console.timeEnd('预分配');
  
  console.time('连续分配');
  let chunks = [];
  for (let i = 0; i < numberOfChunks; i++) {
    // 每次分配新Buffer
    chunks.push(Buffer.from('X'.repeat(chunkSize)));
  }
  // 最后连接
  const result = Buffer.concat(chunks);
  console.timeEnd('连续分配');
}

// 测试预分配vs连续分配
// processChunks(10000, 100);

// 2. 复用Buffer
class BufferPool {
  constructor(bufferSize, poolSize) {
    this.bufferSize = bufferSize;
    this.pool = [];
    
    // 预创建池
    for (let i = 0; i < poolSize; i++) {
      this.pool.push(Buffer.alloc(bufferSize));
    }
    
    this.used = 0;
  }
  
  // 获取Buffer
  getBuffer() {
    if (this.used < this.pool.length) {
      return this.pool[this.used++];
    } else {
      // 池耗尽，创建新Buffer
      return Buffer.alloc(this.bufferSize);
    }
  }
  
  // 重置池
  reset() {
    this.used = 0;
  }
}

// 使用Buffer池
function processWithPool() {
  const pool = new BufferPool(1024, 10);
  
  console.time('使用池');
  for (let i = 0; i < 100; i++) {
    const buf = pool.getBuffer();
    // 使用Buffer...
    buf.fill(i % 256);
    
    // 处理完成后不需要释放，池会重置
  }
  console.timeEnd('使用池');
  
  // 重置池，以便再次使用
  pool.reset();
}

// 3. 高效串行化
function efficientSerialization() {
  const data = {
    id: 12345,
    name: 'Node.js',
    version: '14.15.4',
    features: ['async', 'stream', 'buffer']
  };
  
  console.time('JSON序列化');
  // 传统方法：JSON序列化，然后创建Buffer
  const jsonStr = JSON.stringify(data);
  const buf1 = Buffer.from(jsonStr);
  console.timeEnd('JSON序列化');
  
  console.time('直接写入Buffer');
  // 直接写入Buffer
  const buf2 = Buffer.alloc(256);  // 假设足够大
  let offset = 0;
  
  // 写入ID
  offset = buf2.writeUInt32LE(data.id, offset);
  
  // 写入名称
  const nameBytes = Buffer.from(data.name);
  offset = buf2.writeUInt8(nameBytes.length, offset);  // 先写入长度
  nameBytes.copy(buf2, offset);
  offset += nameBytes.length;
  
  // 写入版本
  const versionBytes = Buffer.from(data.version);
  offset = buf2.writeUInt8(versionBytes.length, offset);
  versionBytes.copy(buf2, offset);
  offset += versionBytes.length;
  
  // 写入特性数组
  offset = buf2.writeUInt8(data.features.length, offset);
  for (const feature of data.features) {
    const featureBytes = Buffer.from(feature);
    offset = buf2.writeUInt8(featureBytes.length, offset);
    featureBytes.copy(buf2, offset);
    offset += featureBytes.length;
  }
  
  // 裁剪多余空间
  const finalBuf = buf2.slice(0, offset);
  console.timeEnd('直接写入Buffer');
  
  console.log('JSON序列化大小:', buf1.length);
  console.log('直接写入大小:', finalBuf.length);
}

// 测试序列化性能
// efficientSerialization();
```

Buffer是Node.js处理二进制数据的核心机制，为文件I/O、网络通信、加密操作等提供了高效的底层支持。掌握Buffer的使用对于构建高性能的Node.js应用至关重要。

#### URL模块(url)

URL模块提供用于URL解析和处理的实用工具，是处理网络请求和路由的基础组件。

##### URL解析和格式化

Node.js提供两套处理URL的API：遗留API和WHATWG URL API：

```javascript
// URL解析和格式化示例
// Node.js提供了两种URL API

// 1. 遗留API: url.parse() 和 url.format()
const legacyUrl = require('url');

// 解析URL字符串
const parsedUrl = legacyUrl.parse('https://user:pass@example.com:8080/path/to/page?query=string#hash', true);
console.log('遗留API解析结果:');
console.log('- 协议:', parsedUrl.protocol);    // https:
console.log('- 主机名:', parsedUrl.hostname);  // example.com
console.log('- 端口:', parsedUrl.port);        // 8080
console.log('- 路径:', parsedUrl.pathname);    // /path/to/page
console.log('- 查询字符串:', parsedUrl.query);  // { query: 'string' } (解析为对象，因为传入true参数)
console.log('- 哈希:', parsedUrl.hash);        // #hash
console.log('- 认证信息:', parsedUrl.auth);    // user:pass

// 格式化URL对象为字符串
const formattedUrl = legacyUrl.format({
  protocol: 'https',
  hostname: 'example.com',
  port: 8080,
  pathname: '/path/to/resource',
  query: { id: 123, sort: 'desc' },
  hash: 'section2'
});
console.log('格式化URL:', formattedUrl);

// 2. WHATWG URL API (更现代，推荐使用)
// WHATWG URL API是全局的，也可以从url模块导入
const { URL, URLSearchParams } = require('url');

// 创建URL对象
const myUrl = new URL('https://user:pass@example.com:8080/path/to/page?query=string#hash');
console.log('WHATWG API解析结果:');
console.log('- 协议:', myUrl.protocol);      // https:
console.log('- 主机名:', myUrl.hostname);    // example.com
console.log('- 端口:', myUrl.port);          // 8080
console.log('- 路径名:', myUrl.pathname);    // /path/to/page
console.log('- 搜索参数:', myUrl.search);    // ?query=string
console.log('- 哈希:', myUrl.hash);          // #hash
console.log('- 用户信息:', myUrl.username, myUrl.password); // user pass

// 修改URL对象属性
myUrl.hostname = 'newdomain.com';
myUrl.port = 443;
myUrl.pathname = '/new/path';
console.log('修改后的URL:', myUrl.href);
```

##### 查询字符串处理

URL模块提供了查询字符串的解析和操作：

```javascript
// 查询字符串处理
// 使用URLSearchParams API
const { URLSearchParams } = require('url');

// 从字符串创建URLSearchParams
const params = new URLSearchParams('name=John&age=30&hobbies=reading&hobbies=coding');

// 获取值
console.log('name参数:', params.get('name'));          // John
console.log('age参数:', params.get('age'));            // 30
console.log('所有hobbies参数:', params.getAll('hobbies')); // [ 'reading', 'coding' ]

// 检查参数是否存在
console.log('包含name参数:', params.has('name'));      // true
console.log('包含gender参数:', params.has('gender'));  // false

// 遍历所有参数
console.log('所有参数:');
for (const [key, value] of params.entries()) {
  console.log(`- ${key}: ${value}`);
}

// 修改参数
params.set('age', '31');          // 更新参数值
params.append('hobbies', 'music'); // 添加另一个hobbies值
params.append('location', 'New York'); // 添加新参数

// 删除参数
params.delete('hobbies');  // 删除所有hobbies参数

// 转换为字符串
console.log('更新后的查询字符串:', params.toString());

// 与URL结合使用
const myUrl = new URL('https://example.com/search');
myUrl.searchParams.set('q', 'Node.js URL');
myUrl.searchParams.set('sort', 'relevance');
console.log('带查询参数的URL:', myUrl.href);
```

##### URL解析细节

URL解析有多种方式和选项：

```javascript
// URL解析的细节和选项
const url = require('url');
const { URL } = url;

// 1. 相对URL解析
// WHATWG URL要求提供基本URL来解析相对URL
try {
  // 这会失败，因为'/path'是相对URL
  const invalid = new URL('/path');
} catch (err) {
  console.log('相对URL错误:', err.message);
}

// 正确的相对URL解析
const relative = new URL('/path', 'https://example.com');
console.log('相对URL解析结果:', relative.href);

// 使用另一个URL作为基础
const base = new URL('https://example.com/base/');
const resolved = new URL('../relative', base);
console.log('相对于其他URL:', resolved.href);

// 2. 遗留API的相对URL解析
// url.resolve() - 遗留API使用这个来解析相对URL
const resolvedLegacy = url.resolve('https://example.com/base/', '../relative');
console.log('遗留API相对URL解析:', resolvedLegacy);

// 3. URLs中的特殊字符处理
// 自动编码URL中的特殊字符
const specialChars = new URL('https://example.com/path with spaces?q=特殊字符');
console.log('编码后的URL:', specialChars.href);

// 手动编码和解码组件
const encoded = encodeURIComponent('特殊 字符 & 符号');
console.log('手动编码组件:', encoded);
console.log('解码:', decodeURIComponent(encoded));

// 4. URLs处理国际化域名(IDN)
const idn = new URL('https://例子.测试');
console.log('国际化域名处理:', idn.href);

// 5. URL有效性检查
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

console.log('有效URL检查:');
console.log('- https://example.com:', isValidUrl('https://example.com'));
console.log('- ftp://invalid:', isValidUrl('ftp://invalid'));
console.log('- 无协议:', isValidUrl('example.com'));
```

##### File URLs

Node.js专门处理文件URL的方法：

```javascript
// 文件URL处理
const { URL } = require('url');
const path = require('path');

// 从文件路径创建URL
function pathToFileURL(filePath) {
  // 确保绝对路径
  const absolutePath = path.resolve(filePath);
  
  // 转换为file:// URL格式
  let pathName = absolutePath.replace(/\\/g, '/');
  
  // 确保开头有/
  if (!pathName.startsWith('/')) {
    pathName = '/' + pathName;
  }
  
  return new URL(`file://${pathName}`);
}

// 从文件URL获取路径
function fileURLToPath(fileURL) {
  if (!(fileURL instanceof URL)) {
    fileURL = new URL(fileURL);
  }
  
  if (fileURL.protocol !== 'file:') {
    throw new Error('URL必须使用file:协议');
  }
  
  // 提取路径名
  let pathName = fileURL.pathname;
  
  // 在Windows上处理驱动器字母
  if (process.platform === 'win32') {
    pathName = pathName.substring(1); // 移除开头的/
    return pathName.replace(/\//g, '\\');
  }
  
  return pathName;
}

// 使用示例
console.log('文件路径到URL:');
console.log(pathToFileURL('/path/to/file.txt').href);

console.log('文件URL到路径:');
console.log(fileURLToPath('file:///path/to/file.txt'));

// Node.js 10.12.0+提供了原生的fileURLToPath和pathToFileURL方法
if (url.fileURLToPath) {
  console.log('使用原生方法:');
  
  const filePath = '/path/to/file.txt';
  const fileUrl = url.pathToFileURL(filePath).href;
  console.log('路径到URL:', fileUrl);
  
  console.log('URL到路径:', url.fileURLToPath(fileUrl));
}
```

##### URL处理最佳实践

以下是处理URL时的一些最佳实践和常见案例：

```javascript
// URL处理最佳实践
const { URL, URLSearchParams } = require('url');

// 1. 构建API请求URL
function buildApiUrl(baseUrl, endpoint, params) {
  // 确保baseUrl以/结尾，endpoint不以/开头
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // 组合URL
  const url = new URL(normalizedEndpoint, normalizedBase);
  
  // 添加查询参数
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // 处理数组值
      if (Array.isArray(value)) {
        value.forEach(item => url.searchParams.append(key, item));
      } else {
        url.searchParams.set(key, value);
      }
    });
  }
  
  return url.href;
}

// 使用示例
const apiUrl = buildApiUrl(
  'https://api.example.com/v1', 
  'search', 
  { 
    q: 'nodejs', 
    sort: 'relevance', 
    fields: ['title', 'description', 'author']
  }
);
console.log('构建的API URL:', apiUrl);

// 2. 规范化URL
function normalizeUrl(inputUrl) {
  // 确保URL有协议
  if (!inputUrl.includes('://')) {
    inputUrl = 'https://' + inputUrl;
  }
  
  const url = new URL(inputUrl);
  
  // 移除默认端口
  if ((url.protocol === 'http:' && url.port === '80') || 
      (url.protocol === 'https:' && url.port === '443')) {
    url.port = '';
  }
  
  // 确保路径以/结尾
  if (!url.pathname.endsWith('/') && !url.pathname.includes('.')) {
    url.pathname += '/';
  }
  
  // 按字母顺序排序查询参数
  const sortedParams = new URLSearchParams([...url.searchParams.entries()].sort());
  url.search = sortedParams.toString();
  
  return url.href;
}

console.log('规范化URLs:');
console.log(normalizeUrl('example.com/path'));
console.log(normalizeUrl('https://api.example.com:443/path?b=2&a=1'));

// 3. 安全URL验证
function isSafeUrl(inputUrl) {
  try {
    const url = new URL(inputUrl);
    
    // 只允许某些协议
    const safeProtocols = ['http:', 'https:'];
    if (!safeProtocols.includes(url.protocol)) {
      return false;
    }
    
    // 检查域名是否在允许列表中
    const safeDomains = ['example.com', 'api.example.com', 'cdn.example.com'];
    if (!safeDomains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain))) {
      return false;
    }
    
    // 验证通过
    return true;
  } catch (err) {
    // 无效URL
    return false;
  }
}

console.log('URL安全检查:');
console.log('- https://example.com/path:', isSafeUrl('https://example.com/path'));
console.log('- https://malicious.com:', isSafeUrl('https://malicious.com'));
console.log('- javascript:alert(1):', isSafeUrl('javascript:alert(1)'));

// 4. 解析和操作URL中的路径
function getPathSegments(inputUrl) {
  const url = new URL(inputUrl);
  
  // 移除开头和结尾的/，然后分割路径
  const cleanPath = url.pathname.replace(/^\/|\/$/g, '');
  return cleanPath ? cleanPath.split('/') : [];
}

console.log('路径段落:');
console.log(getPathSegments('https://example.com/api/v1/users/123'));
```

URL模块是Node.js中处理网络资源标识的核心组件，它提供了解析、构建和操作URL的强大工具，是网络应用程序的重要基础。

#### 实用工具模块(util)

util模块提供了各种实用函数，主要用于支持Node.js内部API，但也可以在应用程序中使用，提供了调试、类型检查、继承等功能。

##### 格式化和调试

util模块提供了多种格式化和调试辅助函数：

```javascript
// 格式化和调试功能
const util = require('util');

// 1. util.format() - 类似于printf格式化字符串
const formatted = util.format('你好，%s！今天是%d号。', '张三', 15);
console.log('格式化结果:', formatted);  // 你好，张三！今天是15号。

// 使用占位符:
// %s - 字符串
// %d - 数字
// %i - 整数
// %f - 浮点数
// %j - JSON
// %o - 对象(展开属性)
// %O - 对象(不展开属性)
// %% - 单个百分号

// 2. util.inspect() - 将对象转换为字符串以便调试
const obj = {
  name: '复杂对象',
  date: new Date(),
  nested: {
    a: 1,
    b: [2, 3, { c: 4 }]
  },
  func: function() { return 'hello'; },
  [Symbol('secret')]: 'hidden'
};

// 基本inspect
console.log('基本inspect:', util.inspect(obj));

// 自定义选项
const inspected = util.inspect(obj, {
  colors: true,           // 着色输出
  depth: 3,               // 对象递归深度
  showHidden: true,       // 显示不可枚举属性
  showProxy: true,        // 显示代理对象的目标和处理程序
  maxArrayLength: 5,      // 最大数组长度
  maxStringLength: 50,    // 最大字符串长度
  breakLength: 60,        // 换行长度
  compact: false,         // 单行数组
  sorted: true            // 按键排序
});

// 在实际环境中，使用console.log就可以，util.inspect主要用于自定义格式
console.log('自定义inspect:', '(控制台中有颜色效果)');

// 3. 自定义inspect
class MyClass {
  constructor(name) {
    this.name = name;
  }
  
  // 自定义inspect方法
  [util.inspect.custom](depth, opts) {
    return `<MyClass "${this.name}">`;
  }
}

const instance = new MyClass("测试实例");
console.log('自定义inspect类:', instance);

// 4. util.debuglog() - 条件调试日志
// 只有设置了NODE_DEBUG=module时才会输出
const debuglog = util.debuglog('myapp');
debuglog('这条消息只有在设置了NODE_DEBUG=myapp时才会显示');

// 使用: NODE_DEBUG=myapp node script.js
```

##### Promise和回调

util提供了在回调和Promise之间转换的工具：

```javascript
// Promise和回调相关工具
const util = require('util');
const fs = require('fs');

// 1. util.promisify() - 将回调函数转换为Promise
// 将回调风格的函数转换为返回Promise的函数
const readFile = util.promisify(fs.readFile);

// 使用Promise
async function readConfig() {
  try {
    const content = await readFile('config.json', 'utf8');
    console.log('读取成功:', content);
    return JSON.parse(content);
  } catch (err) {
    console.error('读取错误:', err.message);
    return {};
  }
}

// 2. util.callbackify() - 将Promise函数转换为回调风格
const callbackReadConfig = util.callbackify(async () => {
  const content = await readFile('config.json', 'utf8');
  return JSON.parse(content);
});

// 使用回调风格
callbackReadConfig((err, result) => {
  if (err) {
    console.error('回调错误:', err.message);
    return;
  }
  console.log('回调成功:', result);
});

// 3. util.promisify.custom 符号 - 自定义promisify行为
function customFn(arg1, arg2, callback) {
  callback(null, `结果: ${arg1}, ${arg2}`);
}

// 添加自定义promisify实现
customFn[util.promisify.custom] = (arg1, arg2) => {
  return Promise.resolve(`自定义promisify结果: ${arg1}, ${arg2}`);
};

const promisifiedCustom = util.promisify(customFn);

// 使用自定义promisify函数
promisifiedCustom('hello', 'world')
  .then(result => console.log(result))
  .catch(err => console.error(err));
```

##### 类型检查和比较

util提供了类型检查和对象比较功能：

```javascript
// 类型检查和比较工具
const util = require('util');

// 1. 类型检查函数
console.log('类型检查:');
console.log('- 是数组:', util.isArray([1, 2, 3]));                 // true
console.log('- 是布尔值:', util.isBoolean(true));                  // true
console.log('- 是null:', util.isNull(null));                      // true
console.log('- 是undefined:', util.isUndefined(undefined));       // true
console.log('- 是日期:', util.isDate(new Date()));                 // true
console.log('- 是错误:', util.isError(new Error()));               // true
console.log('- 是函数:', util.isFunction(() => {}));               // true
console.log('- 是数字:', util.isNumber(123));                      // true
console.log('- 是字符串:', util.isString('hello'));                // true
console.log('- 是符号:', util.isSymbol(Symbol('sym')));            // true
console.log('- 是正则表达式:', util.isRegExp(/regex/));            // true

// 注意: 这些方法已被废弃，推荐直接使用标准JavaScript检查
console.log('现代JS类型检查:');
console.log('- 是数组:', Array.isArray([1, 2, 3]));                // true
console.log('- 是布尔值:', typeof true === 'boolean');             // true
console.log('- 是null:', null === null);                          // true
console.log('- 是undefined:', typeof undefined === 'undefined');  // true
console.log('- 是日期:', value => value instanceof Date);          // 函数
console.log('- 是错误:', value => value instanceof Error);         // 函数
console.log('- 是函数:', typeof (() => {}) === 'function');        // true
console.log('- 是数字:', typeof 123 === 'number');                 // true
console.log('- 是字符串:', typeof 'hello' === 'string');           // true
console.log('- 是符号:', typeof Symbol('sym') === 'symbol');       // true
console.log('- 是正则表达式:', value => value instanceof RegExp);   // 函数

// 2. 对象比较 - 检查对象是否具有相同的属性和值
function Person(name) {
  this.name = name;
}

const obj1 = new Person('张三');
const obj2 = { name: '张三' };

console.log('对象比较:');
// 不比较构造函数和原型
console.log('- 浅层比较:', util.isDeepStrictEqual(obj1, obj2));  // true

// 添加方法
Person.prototype.greet = function() {
  return `你好，${this.name}`;
};

// 现在比较构造函数和原型
console.log('- 添加原型后:', util.isDeepStrictEqual(obj1, obj2));  // false

// 深比较复杂对象
const complex1 = {
  a: [1, 2, { c: 3 }],
  b: new Date(2020, 0, 1),
  c: /pattern/,
  d: new Map([['key', 'value']])
};

const complex2 = {
  a: [1, 2, { c: 3 }],
  b: new Date(2020, 0, 1),
  c: /pattern/,
  d: new Map([['key', 'value']])
};

const complex3 = {
  a: [1, 2, { c: 4 }],  // 值不同
  b: new Date(2020, 0, 1),
  c: /pattern/,
  d: new Map([['key', 'value']])
};

console.log('深比较相同对象:', util.isDeepStrictEqual(complex1, complex2));  // true
console.log('深比较不同对象:', util.isDeepStrictEqual(complex1, complex3));  // false
```

##### 继承和对象操作

util提供了对象继承和操作功能：

```javascript
// 继承和对象操作
const util = require('util');

// 1. util.inherits() - 实现原型继承(已废弃，推荐使用ES6类继承)
function Base() {
  this.name = 'Base';
  this.sayHello = function() {
    return `Hello from ${this.name}`;
  };
}

Base.prototype.baseMethod = function() {
  return 'Base method';
};

function Derived() {
  Base.call(this);
  this.name = 'Derived';
}

util.inherits(Derived, Base);

// 添加子类自己的方法
Derived.prototype.derivedMethod = function() {
  return 'Derived method';
};

// 测试继承
const instance = new Derived();
console.log('继承测试:');
console.log('- instance.name:', instance.name);                 // "Derived"
console.log('- instance.sayHello():', instance.sayHello());     // "Hello from Derived"
console.log('- instance.baseMethod():', instance.baseMethod()); // "Base method"
console.log('- instance.derivedMethod():', instance.derivedMethod()); // "Derived method"

// 2. 现代ES6类继承更推荐
class ModernBase {
  constructor() {
    this.name = 'ModernBase';
  }
  
  sayHello() {
    return `Hello from ${this.name}`;
  }
  
  baseMethod() {
    return 'ModernBase method';
  }
}

class ModernDerived extends ModernBase {
  constructor() {
    super();
    this.name = 'ModernDerived';
  }
  
  derivedMethod() {
    return 'ModernDerived method';
  }
  
  // 覆盖父类方法
  baseMethod() {
    return `Override: ${super.baseMethod()}`;
  }
}

// 测试ES6继承
const modernInstance = new ModernDerived();
console.log('\nES6类继承测试:');
console.log('- modernInstance.name:', modernInstance.name);                 // "ModernDerived"
console.log('- modernInstance.sayHello():', modernInstance.sayHello());     // "Hello from ModernDerived"
console.log('- modernInstance.baseMethod():', modernInstance.baseMethod()); // "Override: ModernBase method"
console.log('- modernInstance.derivedMethod():', modernInstance.derivedMethod()); // "ModernDerived method"

// 3. util.getSystemErrorName - 获取系统错误名称
const errName = util.getSystemErrorName(process.platform === 'win32' ? -4092 : 22); // EINVAL
console.log('\n系统错误名称:', errName);  // "EINVAL" 或其他错误代码

// 4. util.types - 更精确的类型检查 (Node.js 10+)
if (util.types) {
  console.log('\nutil.types类型检查:');
  console.log('- 是Promise:', util.types.isPromise(Promise.resolve()));
  console.log('- 是Date:', util.types.isDate(new Date()));
  console.log('- 是Map:', util.types.isMap(new Map()));
  console.log('- 是Set:', util.types.isSet(new Set()));
  console.log('- 是ArrayBuffer:', util.types.isArrayBuffer(new ArrayBuffer(10)));
  console.log('- 是TypedArray:', util.types.isTypedArray(new Uint8Array(10)));
  console.log('- 是RegExp:', util.types.isRegExp(/regex/));
  console.log('- 是NativeError:', util.types.isNativeError(new Error()));
  console.log('- 是内置对象:', util.types.isAnyArrayBuffer(new ArrayBuffer(10)));
}
```

##### 实用工具应用

util模块可以用于创建各种有用的工具：

```javascript
// 实用工具应用示例
const util = require('util');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

// 1. 创建日志工具
class Logger {
  constructor(name, options = {}) {
    this.name = name;
    this.options = {
      level: options.level || 'info',
      format: options.format || 'text',
      timestamp: options.timestamp !== false,
      ...options
    };
    
    // 日志级别权重
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }
  
  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.options.level];
  }
  
  _formatMessage(level, message, ...args) {
    const timestamp = this.options.timestamp ? `[${new Date().toISOString()}] ` : '';
    const prefix = `${timestamp}[${this.name}] [${level.toUpperCase()}]:`;
    
    if (typeof message === 'string') {
      return `${prefix} ${util.format(message, ...args)}`;
    } else {
      return `${prefix} ${util.inspect(message)}`;
    }
  }
  
  log(level, message, ...args) {
    if (!this._shouldLog(level)) return;
    
    const formatted = this._formatMessage(level, message, ...args);
    
    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'debug':
        console.debug(formatted);
        break;
    }
  }
  
  error(message, ...args) {
    this.log('error', message, ...args);
  }
  
  warn(message, ...args) {
    this.log('warn', message, ...args);
  }
  
  info(message, ...args) {
    this.log('info', message, ...args);
  }
  
  debug(message, ...args) {
    this.log('debug', message, ...args);
  }
}

// 使用日志工具
const logger = new Logger('AppService', { level: 'debug' });
logger.info('应用启动成功');
logger.debug('调试信息: %j', { user: 'admin', action: 'login' });
logger.warn('资源使用率高: CPU %d%%', 85);
logger.error('发生错误: %s', new Error('连接失败'));

// 2. 创建自定义流转换器
// 将流中的文本转换为大写
class UppercaseTransform extends stream.Transform {
  constructor(options) {
    super(options);
  }
  
  _transform(chunk, encoding, callback) {
    // 转换为大写并推送
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

// 创建自定义Stream
const uppercaseTransform = new UppercaseTransform();

// 3. 文件处理工具
const FileUtils = {
  // 异步读取JSON文件
  async readJsonFile(filePath) {
    const readFile = util.promisify(fs.readFile);
    try {
      const content = await readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      logger.error('读取JSON文件失败: %s', err.message);
      throw err;
    }
  },
  
  // 异步写入JSON文件
  async writeJsonFile(filePath, data, pretty = false) {
    const writeFile = util.promisify(fs.writeFile);
    const mkdir = util.promisify(fs.mkdir);
    try {
      // 确保目录存在
      await mkdir(path.dirname(filePath), { recursive: true });
      
      // 序列化并写入
      const content = JSON.stringify(data, null, pretty ? 2 : 0);
      await writeFile(filePath, content, 'utf8');
      logger.debug('JSON写入成功: %s', filePath);
      return true;
    } catch (err) {
      logger.error('写入JSON文件失败: %s', err.message);
      throw err;
    }
  },
  
  // 递归扫描目录
  async scanDir(dir, pattern = null) {
    const readdir = util.promisify(fs.readdir);
    const stat = util.promisify(fs.stat);
    
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      let results = [];
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // 递归处理子目录
          const subResults = await this.scanDir(fullPath, pattern);
          results = results.concat(subResults);
        } else if (entry.isFile()) {
          // 检查是否匹配模式
          if (!pattern || pattern.test(entry.name)) {
            results.push(fullPath);
          }
        }
      }
      
      return results;
    } catch (err) {
      logger.error('扫描目录失败: %s', err.message);
      throw err;
    }
  }
};

// 使用FileUtils
// async function demo() {
//   try {
//     // 读取JSON
//     const config = await FileUtils.readJsonFile('config.json');
//     console.log('配置:', config);
//     
//     // 修改并写入
//     config.lastRun = new Date().toISOString();
//     await FileUtils.writeJsonFile('config.json', config, true);
//     
//     // 扫描目录
//     const jsFiles = await FileUtils.scanDir('./src', /\.js$/);
//     console.log('找到JS文件:', jsFiles);
//   } catch (err) {
//     console.error('发生错误:', err);
//   }
// }
// 
// demo();
```

util模块提供了一系列实用工具，可以简化常见任务，提高代码质量和可维护性。虽然有些API已经被标记为废弃，但它们仍被广泛使用，同时推荐使用较新的标准JavaScript或Node.js API。

#### 加密模块(crypto)

加密模块提供了用于加密、哈希和数字签名的功能，是Node.js安全功能的核心，可用于保护敏感数据和验证信息的完整性。

##### 哈希(Hash)

哈希用于将数据转换为固定长度的字符串，适用于密码存储和数据完整性验证：

```javascript
// 哈希功能示例
const crypto = require('crypto');

// 1. 创建简单哈希
function createHash(data, algorithm = 'sha256') {
  return crypto.createHash(algorithm)
    .update(data)
    .digest('hex');
}

// 支持的哈希算法示例: md5, sha1, sha256, sha512等
console.log('MD5:', createHash('hello world', 'md5'));
console.log('SHA1:', createHash('hello world', 'sha1'));
console.log('SHA256:', createHash('hello world', 'sha256'));
console.log('SHA512:', createHash('hello world', 'sha512'));

// 2. 使用二进制数据
const binaryData = Buffer.from([0x01, 0x02, 0x03, 0x04]);
console.log('二进制哈希:', createHash(binaryData));

// 3. 流式哈希计算
function hashStream(stream, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// 使用流哈希文件
// const fs = require('fs');
// const fileStream = fs.createReadStream('large-file.zip');
// hashStream(fileStream)
//   .then(hash => console.log('文件哈希:', hash))
//   .catch(err => console.error('哈希错误:', err));

// 4. 迭代哈希 - 密码存储最佳实践
function hashPassword(password, salt = null, iterations = 10000) {
  // 如果没有提供salt，生成随机salt
  salt = salt || crypto.randomBytes(16).toString('hex');
  
  // PBKDF2 - 密码衍生函数
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    iterations,
    64,        // 密钥长度
    'sha512'   // 摘要算法
  ).toString('hex');
  
  // 返回完整信息用于存储
  return {
    salt,
    hash,
    iterations,
    algorithm: 'pbkdf2-sha512'
  };
}

function verifyPassword(password, stored) {
  const verified = hashPassword(password, stored.salt, stored.iterations);
  return verified.hash === stored.hash;
}

// 使用示例
const password = 'my-secure-password';
const stored = hashPassword(password);
console.log('存储密码哈希:', stored);

// 验证
console.log('密码验证(正确):', verifyPassword(password, stored));
console.log('密码验证(错误):', verifyPassword('wrong-password', stored));
```

##### 加密和解密

对称加密用于加密和解密数据，需要共享密钥：

```javascript
// 对称加密示例
const crypto = require('crypto');

// 1. AES加密/解密
function encryptAES(text, key, iv = null) {
  // 确保密钥长度正确 (AES-256需要32字节密钥)
  const usedKey = crypto.scryptSync(key, 'salt', 32);
  
  // 生成或使用初始化向量(IV)
  const usedIV = iv || crypto.randomBytes(16);
  
  // 创建加密器
  const cipher = crypto.createCipheriv('aes-256-cbc', usedKey, usedIV);
  
  // 加密数据
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: usedIV.toString('hex'),
    encrypted
  };
}

function decryptAES(encrypted, key, iv) {
  // 转换密钥和IV
  const usedKey = crypto.scryptSync(key, 'salt', 32);
  const usedIV = Buffer.from(iv, 'hex');
  
  // 创建解密器
  const decipher = crypto.createDecipheriv('aes-256-cbc', usedKey, usedIV);
  
  // 解密数据
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// 使用示例
const text = '这是需要加密的敏感数据';
const secretKey = 'my-secret-encryption-key';

const encrypted = encryptAES(text, secretKey);
console.log('加密结果:', encrypted);

const decrypted = decryptAES(encrypted.encrypted, secretKey, encrypted.iv);
console.log('解密结果:', decrypted);

// 2. 其他对称加密算法
function encryptWithAlgorithm(text, key, algorithm = 'aes-256-cbc') {
  // 生成安全密钥
  const usedKey = crypto.scryptSync(key, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, usedKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    encrypted,
    algorithm
  };
}

function decryptWithAlgorithm(data, key) {
  const usedKey = crypto.scryptSync(key, 'salt', 32);
  const iv = Buffer.from(data.iv, 'hex');
  
  const decipher = crypto.createDecipheriv(data.algorithm, usedKey, iv);
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// 常用对称加密算法
// aes-128-cbc, aes-192-cbc, aes-256-cbc
// aes-128-gcm, aes-192-gcm, aes-256-gcm (更安全)
// chacha20-poly1305 (更现代)

const algorithms = [
  'aes-256-cbc',
  'aes-256-gcm',
  'chacha20-poly1305'
];

// 测试支持的算法
// 不是所有Node.js版本都支持所有算法
for (const algorithm of algorithms) {
  try {
    const result = encryptWithAlgorithm('测试数据', 'key', algorithm);
    console.log(`${algorithm} 加密成功`);
    
    const decrypted = decryptWithAlgorithm(result, 'key');
    console.log(`${algorithm} 解密结果: ${decrypted}`);
  } catch (err) {
    console.log(`${algorithm} 不支持: ${err.message}`);
  }
}
```

##### 非对称加密和签名

非对称加密使用公钥和私钥对，用于签名和加密：

```javascript
// 非对称加密和签名示例
const crypto = require('crypto');
const fs = require('fs');

// 1. 生成RSA密钥对
function generateRSAKeyPair(keySize = 2048) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: keySize,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  return { privateKey, publicKey };
}

// 使用生成的密钥对
const keyPair = generateRSAKeyPair();
console.log('RSA私钥:', keyPair.privateKey.substring(0, 64) + '...');
console.log('RSA公钥:', keyPair.publicKey.substring(0, 64) + '...');

// 2. RSA加密/解密
function encryptRSA(text, publicKey) {
  const buffer = Buffer.from(text);
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
    buffer
  );
  
  return encrypted.toString('base64');
}

function decryptRSA(encrypted, privateKey) {
  const buffer = Buffer.from(encrypted, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
    buffer
  );
  
  return decrypted.toString('utf8');
}

// 使用RSA加解密
const message = 'RSA加密的消息';
const encryptedMessage = encryptRSA(message, keyPair.publicKey);
console.log('RSA加密:', encryptedMessage);

const decryptedMessage = decryptRSA(encryptedMessage, keyPair.privateKey);
console.log('RSA解密:', decryptedMessage);

// 3. 数字签名
function signData(data, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  
  const signature = sign.sign(privateKey, 'base64');
  return signature;
}

function verifySignature(data, signature, publicKey) {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  
  return verify.verify(publicKey, signature, 'base64');
}

// 使用签名
const dataToSign = 'This is important data that needs integrity protection';
const signature = signData(dataToSign, keyPair.privateKey);
console.log('数字签名:', signature);

// 验证签名
const isValid = verifySignature(dataToSign, signature, keyPair.publicKey);
console.log('签名验证:', isValid);  // true

// 修改数据后验证
const isValidModified = verifySignature('Modified data', signature, keyPair.publicKey);
console.log('修改后验证:', isValidModified);  // false

// 4. 生成和验证证书 (高级)
// 通常使用OpenSSL或其他工具生成证书
// 这里展示简单的自签名证书流程
function generateSelfSignedCertificate() {
  // 仅作示例，生产环境请使用更完整的OpenSSL命令或专业工具
  
  // 1. 生成RSA密钥对
  const keys = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  
  // 2. 创建证书请求的属性
  const certAttrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'organizationName', value: 'Test Organization' },
    { name: 'organizationalUnitName', value: 'IT Department' },
    { name: 'localityName', value: 'City' },
    { name: 'stateOrProvinceName', value: 'State' },
    { name: 'countryName', value: 'CN' },
    { name: 'emailAddress', value: 'admin@example.com' }
  ];
  
  // 3. 创建证书请求
  /*
   * 注意: Node.js核心crypto模块不直接支持证书生成
   * 为了完整性，通常需要使用以下方法：
   * - 使用node-forge等第三方库
   * - 调用外部OpenSSL命令
   * - 使用Node.js的child_process模块执行OpenSSL命令
   */
  
  return keys;
}
```

##### HMAC和验证

HMAC是用于消息认证的哈希机制：

```javascript
// HMAC(基于哈希的消息认证码)
const crypto = require('crypto');

// 1. 创建HMAC
function createHMAC(data, key, algorithm = 'sha256') {
  return crypto.createHmac(algorithm, key)
    .update(data)
    .digest('hex');
}

// 使用示例
const apiKey = 'my-api-secret-key';
const message = 'authenticate-this-message';

const hmac = createHMAC(message, apiKey);
console.log('HMAC:', hmac);

// 2. API请求认证示例
function createAuthenticatedRequest(method, path, data, apiKey) {
  // 排序请求参数以确保一致性
  const payload = {
    method,
    path,
    data: JSON.stringify(data),
    timestamp: Date.now()
  };
  
  // 根据参数创建要签名的字符串
  const signatureString = Object.entries(payload)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  // 生成HMAC签名
  const signature = createHMAC(signatureString, apiKey);
  
  // 组装最终请求
  return {
    ...payload,
    signature
  };
}

// 验证请求
function verifyRequest(request, apiKey) {
  const { signature, ...payload } = request;
  
  // 重新生成签名字符串
  const signatureString = Object.entries(payload)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  // 验证签名
  const expectedSignature = createHMAC(signatureString, apiKey);
  return signature === expectedSignature;
}

// 使用示例
const requestData = {
  user_id: 123,
  action: 'update_profile',
  details: { name: 'New Name' }
};

const request = createAuthenticatedRequest('POST', '/api/user', requestData, apiKey);
console.log('认证请求:', request);

const isValid = verifyRequest(request, apiKey);
console.log('请求验证:', isValid);  // true

// 篡改请求数据
request.data = JSON.stringify({ user_id: 456, action: 'malicious_action' });
const isStillValid = verifyRequest(request, apiKey);
console.log('篡改后验证:', isStillValid);  // false
```

##### 密码学随机数

安全的随机数生成是加密应用的基础：

```javascript
// 安全随机数
const crypto = require('crypto');

// 1. 生成安全随机字节
function secureRandomBytes(size) {
  return crypto.randomBytes(size);
}

// 使用示例
const randomBytes = secureRandomBytes(32);  // 256位随机数
console.log('随机字节:', randomBytes.toString('hex'));

// 2. 生成随机字符串
function secureRandomString(length, encoding = 'hex') {
  // 计算需要的字节数
  // hex编码: 每字节产生2个字符, base64: 每3字节产生4个字符
  const bytesNeeded = encoding === 'hex' ? Math.ceil(length / 2) : Math.ceil(length * 3 / 4);
  
  const randomBytes = crypto.randomBytes(bytesNeeded);
  const randomString = randomBytes.toString(encoding);
  
  // 裁剪到所需长度(防止末尾可能多余的字符)
  return randomString.slice(0, length);
}

console.log('随机16字符HEX:', secureRandomString(16, 'hex'));
console.log('随机32字符HEX:', secureRandomString(32, 'hex'));
console.log('随机24字符Base64:', secureRandomString(24, 'base64'));

// 3. 生成随机整数
function secureRandomInt(min, max) {
  // 确保参数是整数
  min = Math.ceil(min);
  max = Math.floor(max);
  
  // 计算最大值与最小值的差
  const range = max - min + 1;
  
  // 计算需要多少位
  const bitsNeeded = Math.ceil(Math.log2(range));
  const bytesNeeded = Math.ceil(bitsNeeded / 8);
  
  // 生成掩码，用于去除多余的位
  const maxNum = Math.pow(2, bitsNeeded) - 1;
  
  // 循环直到找到有效范围内的随机数
  let randomValue;
  do {
    const randomBytes = crypto.randomBytes(bytesNeeded);
    randomValue = 0;
    
    // 从字节转换为整数
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = (randomValue << 8) | randomBytes[i];
    }
    
    // 应用掩码来去除多余的位
    randomValue = randomValue & maxNum;
    
  } while (randomValue >= range);
  
  return min + randomValue;
}

// 安全随机整数
console.log('随机整数(1-6):', secureRandomInt(1, 6));  // 模拟骰子
console.log('随机整数(1000-9999):', secureRandomInt(1000, 9999));  // 随机PIN码

// 4. 安全令牌生成
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// 生成各种令牌
console.log('API密钥:', generateToken(32));
console.log('会话令牌:', generateToken(64));
console.log('CSRF令牌:', generateToken(16));
```

##### 实际应用示例

以下是加密模块的实际应用场景：

```javascript
// 实际应用
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. 安全配置管理
class SecureConfig {
  constructor(configPath, encryptionKey) {
    this.configPath = configPath;
    this.encryptionKey = encryptionKey;
    this.keyBuffer = crypto.scryptSync(encryptionKey, 'salt', 32);
  }
  
  // 加载和解密配置
  async load() {
    try {
      if (!fs.existsSync(this.configPath)) {
        return {};
      }
      
      const fileData = JSON.parse(
        await fs.promises.readFile(this.configPath, 'utf8')
      );
      
      if (!fileData.encrypted) {
        return fileData;
      }
      
      const iv = Buffer.from(fileData.iv, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.keyBuffer, iv);
      
      let decrypted = decipher.update(fileData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (err) {
      console.error('加载配置失败:', err.message);
      return {};
    }
  }
  
  // 保存和加密配置
  async save(config) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.keyBuffer, iv);
      
      const dataStr = JSON.stringify(config);
      let encrypted = cipher.update(dataStr, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const fileData = {
        encrypted: true,
        iv: iv.toString('hex'),
        data: encrypted
      };
      
      await fs.promises.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.promises.writeFile(
        this.configPath,
        JSON.stringify(fileData),
        'utf8'
      );
      
      return true;
    } catch (err) {
      console.error('保存配置失败:', err.message);
      return false;
    }
  }
}

// 使用示例
async function testSecureConfig() {
  const config = new SecureConfig('./secure-config.json', 'my-secret-key');
  
  // 保存敏感数据
  await config.save({
    apiKeys: {
      service1: 'key1-abc123',
      service2: 'key2-xyz789'
    },
    database: {
      host: 'db.example.com',
      user: 'admin',
      password: 'super-secret-password'
    }
  });
  
  // 加载配置
  const loaded = await config.load();
  console.log('加载的配置:', loaded);
}

// 2. 安全密码重置令牌
class PasswordReset {
  constructor(secret) {
    this.secret = secret;
  }
  
  // 生成密码重置令牌
  generateToken(userId, expiresInMinutes = 60) {
    // 令牌有效期
    const expires = Date.now() + expiresInMinutes * 60 * 1000;
    
    // 令牌数据
    const data = `${userId}:${expires}`;
    
    // 生成签名
    const hmac = crypto.createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
    
    // 组合令牌
    return Buffer.from(`${data}:${hmac}`).toString('base64url');
  }
  
  // 验证令牌
  verifyToken(token) {
    try {
      // 解码令牌
      const decoded = Buffer.from(token, 'base64url').toString();
      const [userId, expires, signature] = decoded.split(':');
      
      // 检查是否过期
      if (Date.now() > parseInt(expires, 10)) {
        return { valid: false, reason: 'expired' };
      }
      
      // 重新计算签名
      const data = `${userId}:${expires}`;
      const expectedSignature = crypto.createHmac('sha256', this.secret)
        .update(data)
        .digest('hex');
      
      // 验证签名
      if (expectedSignature !== signature) {
        return { valid: false, reason: 'invalid' };
      }
      
      return { 
        valid: true, 
        userId: parseInt(userId, 10),
        expires: new Date(parseInt(expires, 10))
      };
    } catch (err) {
      return { valid: false, reason: 'malformed' };
    }
  }
}

// 使用示例
function testPasswordReset() {
  const resetHandler = new PasswordReset('reset-secret-key');
  
  // 为用户123生成令牌
  const token = resetHandler.generateToken(123, 60);
  console.log('密码重置令牌:', token);
  
  // 验证令牌
  const verification = resetHandler.verifyToken(token);
  console.log('令牌验证结果:', verification);
  
  // 验证无效令牌
  const invalidResult = resetHandler.verifyToken('invalid-token');
  console.log('无效令牌结果:', invalidResult);
}

// 运行示例
// testSecureConfig();
// testPasswordReset();
```

加密模块是Node.js提供的强大安全工具，通过合理使用哈希、加密和随机数生成功能，可以有效保护用户数据和系统安全。

##### 网络安全最佳实践

// ... existing code ...