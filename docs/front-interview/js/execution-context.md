---
title: JavaScript执行上下文与变量提升
createTime: 2025/04/23 10:47:28
permalink: /article/js-execution-context/
---

# JavaScript执行上下文与变量提升

## 执行上下文概念

执行上下文（Execution Context）是JavaScript中最重要的核心概念之一，它是JavaScript引擎运行和追踪代码执行的环境抽象。理解执行上下文有助于深入掌握JavaScript的执行机制、变量提升、作用域链等概念。

### 执行上下文类型

JavaScript中有三种主要类型的执行上下文：

1. **全局执行上下文（Global Execution Context）**
   - 代码开始执行时创建的默认上下文
   - 创建全局对象（浏览器中是window，Node.js中是global）
   - 将this指向全局对象
   - 一个程序中只有一个全局执行上下文

2. **函数执行上下文（Function Execution Context）**
   - 每次调用函数时创建
   - 包含函数的参数、局部变量和this值
   - 函数执行完毕后，上下文被销毁

3. **Eval执行上下文（Eval Execution Context）**
   - 在eval函数中运行的代码的执行上下文
   - 在实际开发中很少使用，因为有安全和性能问题

```text
执行上下文的类型:

+---------------------------+
| 全局执行上下文            |
| - 全局变量与函数          |
| - this -> 全局对象        |
+---------------------------+
          ↓
+---------------------------+
| 函数执行上下文            |
| - 函数参数与局部变量      |
| - this -> 调用者或指定对象|
+---------------------------+
          ↓
+---------------------------+
| 嵌套函数执行上下文        |
| - 嵌套函数的变量与参数    |
| - this -> 调用者或指定对象|
+---------------------------+
```

### 执行上下文的创建过程

执行上下文的创建分为两个阶段：

1. **创建阶段**：
   - 创建变量对象/词法环境（保存变量、函数声明和参数）
   - 建立作用域链
   - 确定this值

2. **执行阶段**：
   - 变量赋值
   - 函数引用
   - 执行代码

```javascript
console.log(name); // undefined (变量提升)
var name = "张三";

function sayHello() {
  console.log(age); // undefined (变量提升)
  var age = 25;
  console.log(`你好，我是${name}，今年${age}岁`);
}

sayHello(); // 你好，我是张三，今年25岁
```

### 执行栈（调用栈）

JavaScript引擎使用执行栈（Call Stack）来管理执行上下文。它遵循后进先出（LIFO）的原则：

```javascript
function first() {
  console.log("进入first函数");
  second();
  console.log("离开first函数");
}

function second() {
  console.log("进入second函数");
  third();
  console.log("离开second函数");
}

function third() {
  console.log("进入third函数");
  console.log("离开third函数");
}

// 调用第一个函数
first();

// 输出:
// 进入first函数
// 进入second函数
// 进入third函数
// 离开third函数
// 离开second函数
// 离开first函数
```

执行栈的工作原理可以如下示意：

```text
执行栈流程:

1. 初始状态
+------------------+
| 全局执行上下文    |
+------------------+

2. 调用first()
+------------------+
| first执行上下文   |
+------------------+
| 全局执行上下文    |
+------------------+

3. 调用second()
+------------------+
| second执行上下文  |
+------------------+
| first执行上下文   |
+------------------+
| 全局执行上下文    |
+------------------+

4. 调用third()
+------------------+
| third执行上下文   |
+------------------+
| second执行上下文  |
+------------------+
| first执行上下文   |
+------------------+
| 全局执行上下文    |
+------------------+

5. third()执行完毕
+------------------+
| second执行上下文  |
+------------------+
| first执行上下文   |
+------------------+
| 全局执行上下文    |
+------------------+

... 以此类推，直到回到全局上下文
```

当调用栈中上下文过多，会导致栈溢出：

```javascript
// 递归函数导致栈溢出示例
function recursion() {
  recursion(); // 不断调用自身而没有终止条件
}

// recursion(); // 将导致 "Maximum call stack size exceeded" 错误
```

## 变量提升（Hoisting）

变量提升是JavaScript的一个特性，它将变量和函数声明移动到它们所在作用域的顶部。这是因为JavaScript引擎在执行代码之前，会先在创建阶段处理所有的声明。

### 变量提升机制

1. **变量提升**：使用`var`声明的变量在作用域顶部创建并初始化为`undefined`

```javascript
console.log(name); // undefined，而不是错误
var name = "张三";

// 上面的代码等同于:
var name; // 声明提升
console.log(name); // undefined
name = "张三"; // 赋值不会提升
```

2. **函数提升**：函数声明会整体提升，包括函数体

```javascript
// 可以在声明前调用函数
sayHello(); // "你好，世界"

function sayHello() {
  console.log("你好，世界");
}

// 上面的代码等同于:
function sayHello() {
  console.log("你好，世界");
}
sayHello();
```

3. **函数表达式不会被整体提升**

```javascript
sayHi(); // TypeError: sayHi is not a function

var sayHi = function() {
  console.log("Hi!");
};

// 上面的代码等同于:
var sayHi; // 只有变量声明被提升
sayHi(); // sayHi是undefined，不是函数
sayHi = function() { // 赋值不会提升
  console.log("Hi!");
};
```

### 变量和函数提升的优先级

函数声明的提升优先级高于变量声明：

```javascript
console.log(foo); // [Function: foo]，而不是undefined

var foo = "bar";
function foo() {
  return "foo";
}

console.log(foo); // "bar"

// 上面的代码等同于:
function foo() { // 函数声明提升且优先级较高
  return "foo";
}
var foo; // 变量声明被忽略，因为已经有同名函数声明
console.log(foo); // 输出函数
foo = "bar"; // 赋值操作
console.log(foo); // "bar"
```

### 实际代码中的提升效果

理解变量提升对于调试代码和理解JavaScript的执行顺序至关重要：

```javascript
var x = 1; // 全局变量

function outer() {
  console.log(x); // undefined，而不是1
  var x = 2; // 局部变量
  console.log(x); // 2
}

outer();
console.log(x); // 1

// 上面的代码等同于:
var x = 1;
function outer() {
  var x; // 变量声明提升
  console.log(x); // undefined
  x = 2; // 变量赋值
  console.log(x); // 2
}
outer();
console.log(x); // 1
```

## 暂时性死区与块级作用域

ES6引入的`let`和`const`声明添加了块级作用域和暂时性死区概念，改变了传统的变量提升行为。

### let、const与块级作用域

使用`let`和`const`声明的变量具有块级作用域，只在声明它们的块（由{}包围的区域）内可见：

```javascript
{
  let blockScoped = "我只在这个块内可见";
  const alsoBlockScoped = "我也只在这个块内可见";
  var notBlockScoped = "我在整个函数作用域可见";
  
  console.log(blockScoped); // "我只在这个块内可见"
  console.log(alsoBlockScoped); // "我也只在这个块内可见"
}

console.log(notBlockScoped); // "我在整个函数作用域可见"
// console.log(blockScoped); // ReferenceError: blockScoped is not defined
// console.log(alsoBlockScoped); // ReferenceError: alsoBlockScoped is not defined
```

在循环中使用`let`可以为每次迭代创建新的绑定：

```javascript
// 使用var的循环问题
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3
  }, 100);
}

// 使用let的循环
for (let j = 0; j < 3; j++) {
  setTimeout(function() {
    console.log(j); // 0, 1, 2
  }, 100);
}
```

### 暂时性死区（Temporal Dead Zone, TDZ）

暂时性死区是指从块作用域的开始到变量声明之前的区域，在这个区域中，变量虽然已经存在，但不能被访问：

```javascript
{
  // 从这里开始是age的TDZ
  // console.log(age); // ReferenceError: Cannot access 'age' before initialization
  
  let age = 25; // TDZ结束
  console.log(age); // 25
}
```

暂时性死区的存在使得`typeof`操作符对未声明的变量也不再安全：

```javascript
// 对未声明的变量使用typeof是安全的
console.log(typeof undeclaredVar); // "undefined"

// 但对处于TDZ的变量使用typeof会抛出错误
// console.log(typeof tdz); // ReferenceError: Cannot access 'tdz' before initialization
let tdz = "在TDZ中";
```

## 实际应用与面试问题

### 1. 解释执行上下文和变量提升的关系

**答**：执行上下文的创建阶段包括处理变量声明，这就是变量提升的本质。当JavaScript引擎创建执行上下文时，它会扫描当前作用域中的所有变量和函数声明，并在内存中为它们分配空间。对于`var`声明的变量，引擎会将其初始化为`undefined`；对于函数声明，引擎会将整个函数存储在内存中。这个过程使得变量和函数可以在它们的声明之前被访问，这就是所谓的"提升"。

### 2. 分析下面代码的输出并解释原因

```javascript
function example() {
  console.log(a); // ?
  console.log(foo()); // ?
  
  var a = 1;
  function foo() {
    return 2;
  }
}

example();
```

**答**：输出是`undefined`和`2`。原因是：
- 变量`a`的声明被提升，但初始值为`undefined`，赋值语句不会被提升
- 函数`foo`的声明被完全提升，包括函数体，所以调用`foo()`时可以正常返回`2`

等价于：

```javascript
function example() {
  var a;
  function foo() {
    return 2;
  }
  
  console.log(a); // undefined
  console.log(foo()); // 2
  
  a = 1;
}

example();
```

### 3. let、const和var的区别

**答**：主要区别包括：

1. **作用域**：
   - `var`：函数作用域，在整个函数中可见
   - `let`和`const`：块级作用域，只在声明它们的块中可见

2. **提升行为**：
   - `var`：变量提升，声明提升并初始化为`undefined`
   - `let`和`const`：声明提升但不初始化，形成暂时性死区（TDZ）

3. **重复声明**：
   - `var`：允许在同一作用域中重复声明
   - `let`和`const`：禁止在同一块作用域中重复声明

4. **全局对象属性**：
   - `var`：在全局作用域声明的变量会成为全局对象的属性
   - `let`和`const`：不会成为全局对象的属性

5. **不可变性**：
   - `var`和`let`：声明后可以重新赋值
   - `const`：声明时必须初始化，且不能重新赋值（但对象内容可以修改）

### 4. 解释暂时性死区（TDZ）

**答**：暂时性死区是ES6引入的概念，指的是从块作用域的开始到变量声明之前的区域，在这个区域中，变量虽然已经存在（因为声明会被提升），但不能被访问。这是因为`let`和`const`声明的变量在声明之前不会被初始化，而是保持"未初始化"状态。尝试在暂时性死区中访问这些变量会导致`ReferenceError`错误。TDZ的存在使得代码更安全，因为它防止了在变量初始化前使用，从而避免了一些难以发现的bug。

### 5. 为什么会有变量提升设计？

**答**：变量提升的设计有几个历史和实际原因：

1. **简化解析过程**：JavaScript引擎在执行前先扫描整个作用域，收集所有声明，简化了解析过程

2. **支持相互递归函数**：函数提升使得相互调用的函数可以在任何位置定义

3. **编程便利性**：允许在实现细节之前先编写函数调用，使代码按照逻辑顺序而非声明顺序组织

4. **历史原因**：JavaScript早期设计决策，为了保持向后兼容性而保留

尽管变量提升有一些好处，但它也可能导致难以理解的代码和意外的行为，因此ES6引入的`let`和`const`通过暂时性死区缓解了这些问题。

### 6. 如何处理执行上下文中的this

**答**：`this`是执行上下文的一部分，它的值取决于函数的调用方式：

```javascript
// 1. 全局上下文
console.log(this); // window (浏览器) 或 global (Node.js)

// 2. 普通函数调用
function showThis() {
  console.log(this);
}
showThis(); // window 或 global

// 3. 对象方法调用
const obj = {
  name: "张三",
  sayName() {
    console.log(this.name);
  }
};
obj.sayName(); // "张三" (this指向obj)

// 4. 构造函数调用
function Person(name) {
  this.name = name;
  this.sayHi = function() {
    console.log(`Hi, I'm ${this.name}`);
  };
}
const person = new Person("李四");
person.sayHi(); // "Hi, I'm 李四" (this指向person实例)

// 5. 显式绑定(call, apply, bind)
function greet() {
  console.log(`你好，${this.name}`);
}
const user = { name: "王五" };
greet.call(user); // "你好，王五"
greet.apply(user); // "你好，王五"
const boundGreet = greet.bind(user);
boundGreet(); // "你好，王五"

// 6. 箭头函数
const arrowThis = {
  name: "赵六",
  sayName: function() {
    const arrow = () => {
      console.log(this.name);
    };
    arrow();
  }
};
arrowThis.sayName(); // "赵六" (箭头函数没有自己的this，使用外围作用域的this)
```

箭头函数没有自己的this，它继承外围词法作用域的this值，这在回调函数中特别有用。

### 7. 闭包与执行上下文的关系

**答**：闭包与执行上下文紧密相关：当一个函数在另一个函数内部定义，并且内部函数引用了外部函数的变量，内部函数就形成了一个闭包。即使外部函数的执行上下文已经从执行栈中弹出（函数执行完毕），其变量对象仍然会被内部函数的作用域链引用，从而这些变量不会被垃圾回收。

```javascript
function outer() {
  const message = "Hello";
  
  return function inner() {
    console.log(message); // 访问outer的变量
  };
}

const innerFunc = outer(); // outer的执行上下文已结束
innerFunc(); // "Hello" - 仍然可以访问message
```

闭包是JavaScript中实现数据隐藏和模块模式的关键机制。

## 深入理解执行环境与作用域链

### 变量环境与词法环境

ES5引入了词法环境(LexicalEnvironment)和变量环境(VariableEnvironment)的概念，它们是执行上下文的重要组成部分：

```text
执行上下文的组成:
+----------------------------+
| 执行上下文                  |
|                            |
| +------------------------+ |
| | 词法环境 (LexicalEnv)   | |
| | - let, const声明       | |
| | - 函数声明             | |
| +------------------------+ |
|                            |
| +------------------------+ |
| | 变量环境 (VariableEnv)  | |
| | - var声明              | |
| +------------------------+ |
|                            |
| this绑定                   |
+----------------------------+
```

词法环境主要由两部分组成：
1. **环境记录(Environment Record)**：存储变量和函数声明
2. **外部环境引用(Outer Reference)**：指向外部词法环境的引用，形成作用域链

### 作用域链的形成与工作原理

作用域链是词法环境的外部环境引用链接形成的，用于变量查找：

```javascript
const global = "全局变量";

function outer() {
  const outerVar = "外部变量";
  
  function middle() {
    const middleVar = "中间变量";
    
    function inner() {
      const innerVar = "内部变量";
      console.log(innerVar); // 当前词法环境
      console.log(middleVar); // 父词法环境
      console.log(outerVar); // 祖父词法环境
      console.log(global); // 全局词法环境
    }
    
    inner();
  }
  
  middle();
}

outer();
```

作用域链工作原理：

```text
作用域链查找过程:

1. 当inner函数查找变量时，按照以下顺序查找:

+-------------------+
| inner词法环境     |  <- 首先查找自己的词法环境
| - innerVar        |
+-------------------+
          |
          v 没找到则查找外部环境
+-------------------+
| middle词法环境    |
| - middleVar       |
+-------------------+
          |
          v 仍没找到则继续向上
+-------------------+
| outer词法环境     |
| - outerVar        |
+-------------------+
          |
          v 最后查找全局环境
+-------------------+
| 全局词法环境      |
| - global          |
+-------------------+
```

如果在整个作用域链中都没有找到变量，则在严格模式下抛出ReferenceError，非严格模式下会在全局创建该变量（意外全局变量）。

### 变量屏蔽（Shadowing）

当内部作用域中的变量与外部作用域的变量同名时，内部变量会"屏蔽"外部变量：

```javascript
const value = "全局值";

function shadowExample() {
  const value = "局部值";
  console.log(value); // "局部值"，屏蔽了全局变量
  
  function innerShadow() {
    const value = "最内层值";
    console.log(value); // "最内层值"，屏蔽了外层变量
  }
  
  innerShadow();
}

shadowExample();
console.log(value); // "全局值"
```

## 执行上下文与异步代码

JavaScript是单线程的，但它通过事件循环处理异步代码。异步代码与执行上下文的交互是理解JavaScript运行时行为的关键。

### 事件循环与执行上下文

当异步操作（如setTimeout、Promise等）触发回调函数时，这些回调会在适当的时机被添加到事件队列，然后由事件循环将它们添加到执行栈：

```javascript
console.log("开始");

setTimeout(function() {
  console.log("定时器回调");
}, 0);

Promise.resolve().then(function() {
  console.log("Promise回调");
});

console.log("结束");

// 输出顺序:
// "开始"
// "结束"
// "Promise回调"
// "定时器回调"
```

尽管setTimeout的延迟是0毫秒，它仍然会在Promise回调之后执行，这是因为Promise回调是微任务(Microtask)，而setTimeout回调是宏任务(Macrotask)，微任务比宏任务优先级高。

### 闭包在异步环境中的应用

异步代码经常使用闭包捕获执行上下文中的变量：

```javascript
function asyncExample() {
  const message = "Hello from async";
  
  setTimeout(function() {
    // 即使asyncExample的执行上下文已结束
    // 这个函数仍能通过闭包访问message变量
    console.log(message);
  }, 1000);
}

asyncExample();
// 一秒后输出: "Hello from async"
```

## 高级面试问题与解答

### 1. 分析并修复以下代码的问题

```javascript
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
// 输出五个5，而不是0,1,2,3,4
```

**答**：问题在于循环中使用`var`声明，导致`i`在函数作用域中共享，当定时器回调执行时，循环已经结束，`i`的值为5。解决方案：

```javascript
// 方案1：使用IIFE创建闭包
for (var i = 0; i < 5; i++) {
  (function(index) {
    setTimeout(function() {
      console.log(index);
    }, 1000);
  })(i);
}

// 方案2：使用let声明创建块级作用域
for (let i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
```

### 2. 解释以下代码的输出并说明原因

```javascript
console.log(1);

setTimeout(function() {
  console.log(2);
}, 0);

Promise.resolve().then(function() {
  console.log(3);
}).then(function() {
  console.log(4);
});

console.log(5);
```

**答**：输出顺序是`1, 5, 3, 4, 2`。原因是：
1. 同步代码直接执行，输出`1`和`5`
2. 异步代码被分为微任务（Promise回调）和宏任务（setTimeout回调）
3. 同步代码执行完后，先执行所有微任务，输出`3`和`4`
4. 最后执行宏任务队列，输出`2`

这展示了JavaScript事件循环的执行顺序：同步代码 > 微任务 > 宏任务。

### 3. 实现一个函数，可以限制异步操作的并发数

**答**：这需要理解执行上下文、闭包和异步操作：

```javascript
/**
 * 控制异步任务并发数的函数
 * @param {Array} tasks - 异步任务数组
 * @param {number} limit - 最大并发数
 * @returns {Promise} 所有任务完成的Promise
 */
function limitConcurrency(tasks, limit) {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0) {
      resolve([]);
      return;
    }
    
    const results = [];
    let index = 0;      // 下一个待执行的任务索引
    let count = 0;      // 当前正在执行的任务数
    
    // 启动初始任务
    function start() {
      // 边界条件检查：所有任务都已完成
      if (index === tasks.length && count === 0) {
        resolve(results);
        return;
      }
      
      // 当有可执行任务且未达到并发上限时执行
      while(index < tasks.length && count < limit) {
        const currentIndex = index;
        const task = tasks[currentIndex];
        
        // 更新计数器
        count++;
        index++;
        
        // 执行任务并处理结果
        Promise.resolve(task())
          .then(result => {
            results[currentIndex] = result;
            count--;
            // 尝试启动下一批任务
            start();
          })
          .catch(err => {
            reject(err);
          });
      }
    }
    
    // 开始执行任务
    start();
  });
}

// 使用示例
const tasks = Array(10).fill(0).map((_, i) => {
  return () => new Promise(resolve => {
    const time = Math.random() * 1000;
    setTimeout(() => {
      console.log(`Task ${i} completed`);
      resolve(i);
    }, time);
  });
});

limitConcurrency(tasks, 3).then(results => {
  console.log('All tasks completed:', results);
});
```

这个示例展示了如何使用闭包（通过`start`函数）捕获并控制执行状态，以及如何使用Promise处理异步操作，这些都与执行上下文的理解密切相关。

### 4. ES6模块与CommonJS模块在执行上下文方面的区别

**答**：ES6模块和CommonJS模块在执行上下文处理方面有几个重要区别：

1. **执行时机**：
   - CommonJS模块在加载时执行（运行时加载）
   - ES6模块在解析时执行（编译时加载）

2. **作用域**：
   - CommonJS模块共享一个顶级作用域，模块内的变量是该模块私有的
   - ES6模块的每个导入/导出有自己的作用域，模块内的顶级变量不会泄漏到全局作用域

3. **this值**：
   - CommonJS模块的顶级this指向module.exports
   - ES6模块的顶级this是undefined

4. **循环依赖处理**：
   - CommonJS通过返回未完成的exports对象处理循环引用
   - ES6模块通过模块依赖图和绑定（而非值拷贝）处理循环引用

```javascript
// ES6模块
// moduleA.js
import { valueB } from './moduleB.js';
export let valueA = 'A';
console.log(valueB); // 在初始化阶段可能是undefined

// moduleB.js
import { valueA } from './moduleA.js';
export let valueB = 'B';
console.log(valueA); // 在初始化阶段可能是undefined

// VS CommonJS模块
// moduleA.js
exports.valueA = 'A';
const moduleB = require('./moduleB.js');
console.log(moduleB.valueB); // 'B'或undefined取决于循环引用

// moduleB.js
exports.valueB = 'B';
const moduleA = require('./moduleA.js');
console.log(moduleA.valueA); // 'A'或{}取决于循环引用
```

## 总结

JavaScript的执行上下文和变量提升机制是理解语言行为的基础，掌握这些概念对于编写高效、无bug的代码至关重要。

关键要点：
1. 执行上下文是JavaScript执行代码的环境，分为全局、函数和eval三种类型
2. 执行上下文创建过程包括创建变量对象、建立作用域链和确定this值
3. 变量提升是执行上下文创建阶段的结果，var声明的变量被提升并初始化为undefined
4. let和const引入了块级作用域和暂时性死区，使变量行为更可预测
5. 作用域链是由词法环境的外部引用链接形成的，用于变量查找
6. 理解执行上下文和事件循环的交互有助于掌握JavaScript的异步行为

在面试中，执行上下文和变量提升是高频考点，通常与闭包、this绑定、异步编程等话题结合。通过深入理解这些概念，你可以更好地解释JavaScript的行为和设计更健壮的应用程序。 