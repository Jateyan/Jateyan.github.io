---
title: JavaScript作用域与闭包
createTime: 2025/04/23 10:46:28
permalink: /article/js-scope-closure/
---

# JavaScript作用域与闭包

## 作用域概念

作用域是变量与函数可访问性的规则集合，决定了代码在何处以及如何查找变量。JavaScript中的作用域体系至关重要，是理解闭包、变量提升等高级概念的基础。

### 作用域类型

JavaScript中有几种不同类型的作用域：

1. **全局作用域**：在代码的任何地方都能访问的变量
2. **函数作用域**：在函数内部定义的变量只能在函数内部访问
3. **块级作用域**：ES6引入，通过let和const关键字创建的作用域，仅在块内部可访问
4. **模块作用域**：ES6模块中的变量仅在模块内部可访问

```javascript
// 全局作用域
const globalVar = 'I am global';

function exampleFunction() {
  // 函数作用域
  const functionVar = 'I am function-scoped';
  console.log(globalVar);      // 可访问全局变量
  console.log(functionVar);    // 可访问函数内变量
  
  if (true) {
    // 块级作用域
    let blockVar = 'I am block-scoped';
    const blockConst = 'I am also block-scoped';
    var functionScopedVar = 'I am function-scoped despite being in a block';
    
    console.log(blockVar);     // 可访问
    console.log(globalVar);    // 可访问
  }
  
  // console.log(blockVar);    // 错误：blockVar is not defined
  // console.log(blockConst);  // 错误：blockConst is not defined
  console.log(functionScopedVar); // 可访问，因为var声明的是函数作用域
}

// console.log(functionVar);   // 错误：functionVar is not defined
```

### 作用域链

当JavaScript引擎查找变量时，它首先在当前作用域中查找，如果找不到，则沿着作用域链向外查找，直到全局作用域。

```javascript
const globalVar = 'global';

function outer() {
  const outerVar = 'outer';
  
  function inner() {
    const innerVar = 'inner';
    console.log(innerVar);  // 'inner' - 当前作用域
    console.log(outerVar);  // 'outer' - 外部作用域
    console.log(globalVar); // 'global' - 全局作用域
  }
  
  inner();
}

outer();
```

作用域链示意图：

```text
作用域链示意:

+-------------------+
| 全局作用域         |
| - globalVar       |
+-------------------+
         ↑
         |
+-------------------+
| outer函数作用域    |
| - outerVar        |
+-------------------+
         ↑
         |
+-------------------+
| inner函数作用域    |
| - innerVar        |
+-------------------+
```

### 词法作用域与动态作用域

JavaScript使用**词法作用域**（也称为静态作用域），这意味着函数的作用域在函数定义时确定，而不是在函数调用时。

```javascript
const value = 'global';

function first() {
  const value = 'first';
  second();
}

function second() {
  console.log(value); // 输出 'global'，而不是 'first'
}

first();
```

在上面的例子中，`second()`函数访问的`value`变量是全局作用域中的，因为函数的作用域是由函数声明的位置决定的，而不是函数调用的位置。

相比之下，**动态作用域**是基于函数调用栈确定的，函数的作用域在函数调用时确定。JavaScript不使用动态作用域，但某些语言如Bash脚本使用动态作用域。

### 作用域相关面试问题

1. **词法作用域与动态作用域的区别？**
   
   答：词法作用域是在代码编写阶段确定的，函数的作用域由函数定义的位置决定。而动态作用域是在运行时确定的，函数的作用域由函数调用的位置决定。JavaScript使用词法作用域。

2. **var、let和const的作用域区别？**
   
   答：
   - `var`：函数作用域，在整个函数内可见
   - `let`和`const`：块级作用域，仅在声明它们的块内可见
   - `var`声明会被提升，而`let`和`const`受暂时性死区限制

3. **什么是变量遮蔽(shadowing)？**
   
   答：当内部作用域中的变量与外部作用域中的变量同名时，内部变量会"遮蔽"外部变量。例如：

   ```javascript
   const x = 10;
   function example() {
     const x = 20;  // 遮蔽外部的x
     console.log(x); // 20
   }
   example();
   console.log(x);  // 10
   ```

## 闭包

闭包是JavaScript中最强大也最常被误解的概念之一，是函数与词法环境的结合，使函数可以访问其定义时的作用域。

### 闭包的定义与形成

闭包由以下条件形成：
1. 内部函数引用了外部函数的变量
2. 内部函数在外部函数之外被调用

```javascript
function createCounter() {
  let count = 0;  // 外部函数的局部变量
  
  return function() {  // 内部函数
    count++;  // 引用外部函数的变量
    return count;
  };
}

const counter = createCounter();  // 创建闭包
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3
```

在上面的例子中，`createCounter`函数返回一个内部函数，这个内部函数引用了外部函数的`count`变量。即使`createCounter`函数执行完毕，内部函数仍然保持对`count`变量的引用，这就形成了闭包。

### 闭包的内存模型

闭包的内存模型可以理解为：内部函数通过作用域链引用了外部函数的变量对象。

```text
创建闭包后的内存模型:

创建counter时:
+----------------------------+
| createCounter执行上下文     |     
| - count: 0                 |
+----------------------------+
          ↑
          | [[Scope]]
+----------------------------+
| 返回的函数 (counter)        |
| - 函数代码                  |
+----------------------------+

执行counter后，createCounter已执行完毕，但其变量对象被保留:
+----------------------------+
| 被保留的变量对象            |     
| - count: 1, 2, 3...        |
+----------------------------+
          ↑
          | [[Scope]]
+----------------------------+
| counter函数                |
| - 函数代码                  |
+----------------------------+
```

### 闭包的应用场景

闭包在JavaScript中有许多重要的应用场景：

1. **数据封装与私有变量**

```javascript
function createPerson(name) {
  // name是私有变量
  return {
    getName: function() {
      return name;
    },
    setName: function(newName) {
      name = newName;
    }
  };
}

const person = createPerson('Alice');
console.log(person.getName());  // 'Alice'
person.setName('Bob');
console.log(person.getName());  // 'Bob'
// console.log(person.name);    // undefined，无法直接访问
```

2. **函数工厂**

```javascript
function multiplyBy(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

3. **模块模式**

```javascript
const counter = (function() {
  let count = 0;  // 私有变量
  
  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    },
    getValue: function() {
      return count;
    }
  };
})();

console.log(counter.increment());  // 1
console.log(counter.increment());  // 2
console.log(counter.decrement());  // 1
console.log(counter.getValue());   // 1
```

4. **回调函数与事件处理**

```javascript
function setupButton(buttonId, message) {
  const button = document.getElementById(buttonId);
  
  button.addEventListener('click', function() {
    // 这是一个闭包，保留了对message的引用
    alert(message);
  });
}

setupButton('helloButton', 'Hello, World!');
setupButton('goodbyeButton', 'Goodbye!');
```

5. **延续局部变量的寿命**

```javascript
function delayedGreeting(name) {
  // name变量通常在函数执行完毕后就会被回收
  setTimeout(function() {
    // 由于闭包，name变量在这里仍然可用
    console.log('Hello, ' + name);
  }, 1000);
}

delayedGreeting('Alice');  // 一秒后输出 "Hello, Alice"
```

### 闭包与循环

闭包在循环中的使用需要特别注意：

```javascript
// 常见错误示例
function createFunctions() {
  var functions = [];
  
  for (var i = 0; i < 3; i++) {
    functions.push(function() {
      console.log(i);
    });
  }
  
  return functions;
}

var functions = createFunctions();
functions[0]();  // 期望: 0, 实际: 3
functions[1]();  // 期望: 1, 实际: 3
functions[2]();  // 期望: 2, 实际: 3
```

这是因为闭包捕获的是变量本身，而不是变量的值。当循环结束时，i的值为3，所有函数都引用同一个i。

**解决方案1：使用立即执行函数创建额外作用域**

```javascript
function createFunctions() {
  var functions = [];
  
  for (var i = 0; i < 3; i++) {
    functions.push(
      (function(value) {
        return function() {
          console.log(value);
        };
      })(i)
    );
  }
  
  return functions;
}

var functions = createFunctions();
functions[0]();  // 0
functions[1]();  // 1
functions[2]();  // 2
```

**解决方案2：使用let创建块级作用域**

```javascript
function createFunctions() {
  const functions = [];
  
  for (let i = 0; i < 3; i++) {
    functions.push(function() {
      console.log(i);
    });
  }
  
  return functions;
}

const functions = createFunctions();
functions[0]();  // 0
functions[1]();  // 1
functions[2]();  // 2
```

### 闭包陷阱与性能考虑

闭包虽然强大，但使用不当会导致内存泄漏和性能问题：

1. **内存泄漏**

```javascript
function setupHandler() {
  const element = document.getElementById('button');
  const heavyData = new Array(10000000).fill('*');
  
  element.addEventListener('click', function() {
    // 闭包引用了heavyData，即使事件不再需要它
    console.log('Element clicked, data length:', heavyData.length);
  });
}

setupHandler();
// heavyData不会被垃圾回收，即使它可能再也不会被使用
```

2. **解决方案：注意引用清理**

```javascript
function setupHandler() {
  const element = document.getElementById('button');
  const heavyData = new Array(10000000).fill('*');
  
  function clickHandler() {
    console.log('Element clicked');
    // 不引用heavyData
  }
  
  element.addEventListener('click', clickHandler);
}

setupHandler();
// heavyData可以被垃圾回收
```

3. **闭包与this绑定**

闭包不会自动绑定this，这可能导致预期之外的行为：

```javascript
const obj = {
  value: 42,
  getValue: function() {
    return this.value;
  },
  getValueLater: function() {
    setTimeout(function() {
      console.log(this.value); // undefined，因为this指向window
    }, 1000);
  }
};

obj.getValue();     // 42
obj.getValueLater(); // undefined
```

**解决方案**：

```javascript
const obj = {
  value: 42,
  getValueLater: function() {
    const self = this;
    setTimeout(function() {
      console.log(self.value); // 42，使用闭包捕获this
    }, 1000);
  }
};

// 或使用箭头函数
const obj2 = {
  value: 42,
  getValueLater: function() {
    setTimeout(() => {
      console.log(this.value); // 42，箭头函数不绑定自己的this
    }, 1000);
  }
};
```

## 垃圾回收与内存泄漏

JavaScript的垃圾回收机制与闭包的关系密切，理解这一点有助于编写高效且无内存泄漏的代码。

### JavaScript的垃圾回收机制

JavaScript引擎使用自动垃圾回收机制，主要方法有：

1. **引用计数法**：跟踪每个对象被引用的次数，计数为0时回收对象
2. **标记清除法**：从根对象开始，标记所有可达对象，然后清除未标记的对象

```text
垃圾回收过程示意图:

标记清除算法:
1. 从全局对象(root)开始标记
+-------------------+
| 全局对象 (root)    |
+-------------------+
        |
        v
+-------------------+     +-------------------+
| 可达对象 (被标记)   | --> | 可达对象 (被标记)   |
+-------------------+     +-------------------+
                            |
                            X  (无引用)
                          +-------------------+
                          | 不可达对象 (未标记) |
                          +-------------------+

2. 清除未标记对象
+-------------------+     +-------------------+
| 可达对象 (保留)    | --> | 可达对象 (保留)    |
+-------------------+     +-------------------+

                          [不可达对象被回收]
```

### 闭包与内存泄漏

闭包会保持对外部变量的引用，这可能导致内存泄漏：

1. **循环引用**

```javascript
function createLeak() {
  const leak = {};
  
  leak.closure = function() {
    // 引用外部的leak对象
    console.log(leak);
  };
  
  return leak;
}

const leakyObject = createLeak();
// 在某些较老的浏览器中，这可能导致leak对象无法被垃圾回收
```

2. **DOM引用**

```javascript
function setupHandler() {
  const element = document.getElementById('button');
  
  element.addEventListener('click', function() {
    // 闭包中引用了DOM元素
    console.log(element.id);
  });
  
  // 如果元素后续被从DOM中移除，但事件监听器未移除
  // 闭包会阻止element被垃圾回收
}
```

3. **大型闭包链**

```javascript
function createChain() {
  const largeData = new Array(1000000);
  
  function level1() {
    const level1Data = largeData.slice(0, 500000);
    
    function level2() {
      const level2Data = level1Data.slice(0, 200000);
      
      function level3() {
        // 通过作用域链可以访问所有上层数据
        console.log(largeData.length, level1Data.length, level2Data.length);
      }
      
      return level3;
    }
    
    return level2();
  }
  
  return level1();
}

const deepClosure = createChain();
// deepClosure函数会通过闭包持有大量数据引用
```

### 避免内存泄漏的最佳实践

1. **尽量减小闭包的作用域**

```javascript
// 不好的写法
function badClosure() {
  const largeData = new Array(1000000);
  const smallData = 'small';
  
  return function() {
    // 只使用smallData，但largeData也被保留
    return smallData;
  };
}

// 好的写法
function goodClosure() {
  const largeData = new Array(1000000);
  const smallData = 'small';
  
  const result = function() {
    // 只使用smallData
    return smallData;
  };
  
  largeData.length = 0; // 帮助垃圾回收
  return result;
}
```

2. **及时清除事件监听器**

```javascript
function setup() {
  const button = document.getElementById('button');
  
  function handleClick() {
    console.log('clicked');
  }
  
  button.addEventListener('click', handleClick);
  
  return function cleanup() {
    // 提供清理方法
    button.removeEventListener('click', handleClick);
  };
}

const cleanup = setup();
// 后续不再需要时
cleanup();
```

3. **使用WeakMap和WeakSet**

```javascript
// 使用WeakMap存储元数据，不阻止对象被回收
const cache = new WeakMap();

function processNode(node) {
  if (cache.has(node)) {
    return cache.get(node);
  }
  
  const result = expensiveComputation(node);
  cache.set(node, result);
  return result;
}

// 当node不再被引用时，对应的缓存条目也会被自动回收
```

## 面试实战问题

### 1. 解释闭包的概念及其工作原理

**答**：闭包是函数与其词法环境的组合，它允许函数访问其定义时的作用域中的变量，即使在函数执行时，这些变量所在的作用域已经不存在。闭包的工作原理是：当内部函数引用了外部函数的变量，并且内部函数在外部函数执行完毕后仍然可访问时，JavaScript引擎会保留这些变量，形成闭包。

### 2. 实现一个计数器函数，不使用全局变量

**答**：

```javascript
function createCounter(initialValue = 0) {
  let count = initialValue;
  
  return {
    increment: function() {
      return ++count;
    },
    decrement: function() {
      return --count;
    },
    getValue: function() {
      return count;
    },
    reset: function() {
      count = initialValue;
      return count;
    }
  };
}

const counter = createCounter(5);
console.log(counter.increment()); // 6
console.log(counter.increment()); // 7
console.log(counter.decrement()); // 6
console.log(counter.getValue());  // 6
console.log(counter.reset());     // 5
```

### 3. 解释以下代码的输出并修复问题

```javascript
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
```

**答**：这段代码会输出五个5，而不是0,1,2,3,4。原因是setTimeout中的函数形成闭包，引用了外部的变量i。由于setTimeout是异步执行的，当定时器回调函数执行时，循环已经结束，i的值为5。

修复方法：

```javascript
// 方法1：使用IIFE创建新的作用域
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j);
    }, 1000);
  })(i);
}

// 方法2：使用let创建块级作用域
for (let i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
```

### 4. 使用闭包实现私有变量

**答**：

```javascript
function createBankAccount(initialBalance) {
  // 私有变量
  let balance = initialBalance;
  
  // 公共接口
  return {
    deposit: function(amount) {
      if (amount > 0) {
        balance += amount;
        return true;
      }
      return false;
    },
    withdraw: function(amount) {
      if (amount > 0 && balance >= amount) {
        balance -= amount;
        return true;
      }
      return false;
    },
    getBalance: function() {
      return balance;
    }
  };
}

const account = createBankAccount(100);
console.log(account.getBalance()); // 100
account.deposit(50);
console.log(account.getBalance()); // 150
account.withdraw(30);
console.log(account.getBalance()); // 120
// 无法直接访问balance变量
```

### 5. 解释闭包与内存泄漏的关系

**答**：闭包通过保持对外部作用域变量的引用，可能导致这些变量无法被垃圾回收，从而造成内存泄漏。特别是在以下情况：

1. 闭包中引用了大型数据结构
2. 闭包中引用了DOM元素，但元素已从文档中移除
3. 创建了长时间存在的闭包，但不再需要其引用的变量

为避免这种情况，应当：
- 限制闭包的作用域，只捕获需要的变量
- 在不需要时解除事件监听器
- 在闭包不再需要时，将捕获的引用设为null
- 使用WeakMap或WeakSet存储对象引用

### 6. 实现函数柯里化

**答**：函数柯里化是一种将接受多个参数的函数转换为一系列使用单一参数的函数的技术：

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

// 使用示例
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
console.log(curriedAdd(1, 2, 3)); // 6
```

### 7. 解释执行上下文与作用域的区别

**答**：
- **作用域**是静态的，在代码编写时确定，决定了变量的可访问性和生命周期。JavaScript使用词法作用域，变量的作用域由其在代码中的位置决定。
- **执行上下文**是动态的，在代码执行时创建，包含变量对象、作用域链和this值。执行上下文在函数调用时创建，函数返回时销毁。

作用域决定了变量的可见性，而执行上下文控制变量的生命周期和访问。作用域是词法特性（静态），执行上下文是运行时特性（动态）。

## 总结

作用域与闭包是JavaScript中最基础也最重要的概念，深入理解它们对于编写高效的JavaScript代码、实现优雅的设计模式以及避免常见陷阱至关重要。

关键要点：
1. JavaScript使用词法作用域，函数的作用域在函数定义时确定
2. 作用域类型包括全局作用域、函数作用域、块级作用域和模块作用域
3. 闭包是函数与其词法环境的组合，允许函数访问其定义时的作用域
4. 闭包的主要应用包括数据封装、函数工厂、模块模式等
5. 闭包可能导致内存泄漏，需要注意适时清理不再需要的引用
6. 通过合理使用闭包，可以实现私有变量、柯里化、记忆化等高级技术

在面试中，闭包与作用域是高频考点，不仅需要理解基本概念，还应能够编写实际应用示例，解决常见问题，如循环中的闭包陷阱、内存泄漏处理等。 