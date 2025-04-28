---
title: JavaScript对象与原型
date: 2023-07-15
permalink: /front-interview/js/object-prototype
---

# JavaScript对象与原型

## JavaScript对象基础

JavaScript中的对象是一种复合值，它将多个值（原始类型或其他对象）聚合在一起，通过键（属性名）来访问这些值（属性值）。JavaScript中几乎所有东西都是对象或可以作为对象处理。

### 对象的本质

JavaScript对象本质上是属性的集合，类似于哈希表或字典。每个属性都是一个键值对，其中键（属性名）是字符串或Symbol，值可以是任何JavaScript值（包括函数）。

```javascript
// 创建简单对象
const person = {
  name: '张三',
  age: 30,
  isEmployed: true,
  skills: ['JavaScript', 'HTML', 'CSS'],
  address: {
    city: '北京',
    district: '海淀区'
  },
  greet: function() {
    console.log(`你好，我是${this.name}`);
  }
};

// 访问属性
console.log(person.name); // '张三'
console.log(person['age']); // 30 - 使用方括号语法
person.greet(); // '你好，我是张三'
```

对象具有以下特点：

```text
JavaScript对象特点:

1. 动态性 - 可以随时添加、修改、删除属性
2. 引用传递 - 对象通过引用传递，而不是值
3. 可嵌套 - 属性值可以是其他对象
4. 无序性 - 属性在对象中的顺序不固定
5. 可扩展 - 对象可以通过原型链继承其他对象的属性
```

### 访问对象属性

对象属性可以通过两种语法访问：

1. **点语法**：`object.property`
2. **方括号语法**：`object['property']`

方括号语法更灵活，可以使用变量、特殊字符和空格：

```javascript
const propertyName = 'age';
console.log(person[propertyName]); // 30

// 特殊属性名需要使用方括号语法
const specialObject = {
  'special-name': 'special value',
  '123': 456
};

console.log(specialObject['special-name']); // 'special value'
console.log(specialObject['123']); // 456
```

### 对象的属性操作

JavaScript对象支持动态添加、修改和删除属性：

```javascript
const car = {
  brand: 'Toyota',
  model: 'Camry'
};

// 添加新属性
car.year = 2023;
car['color'] = 'blue';

// 修改现有属性
car.model = 'Corolla';

// 检查属性是否存在
console.log('brand' in car); // true
console.log(car.hasOwnProperty('year')); // true
console.log('price' in car); // false

// 删除属性
delete car.color;
console.log('color' in car); // false
```

### 属性简写

ES6提供了对象属性的简写语法：

```javascript
// 变量名作为属性名，变量值作为属性值
const name = '张三';
const age = 30;

// 属性简写
const person = { name, age };
console.log(person); // { name: '张三', age: 30 }

// 方法简写
const calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  }
};

console.log(calculator.add(5, 3)); // 8
```

### 计算属性名

ES6还支持在对象字面量中使用计算属性名：

```javascript
const prefix = 'user_';
const id = 1234;

const user = {
  [prefix + id]: true,
  [`data_${id}`]: {
    name: '张三',
    role: 'admin'
  }
};

console.log(user.user_1234); // true
console.log(user.data_1234.name); // '张三'
```

### 对象的遍历

有多种方法可以遍历对象的属性：

```javascript
const person = {
  name: '张三',
  age: 30,
  job: '工程师'
};

// 1. for...in循环（包括原型链上的可枚举属性）
for (const key in person) {
  if (person.hasOwnProperty(key)) {
    console.log(`${key}: ${person[key]}`);
  }
}

// 2. Object.keys()（仅自有可枚举属性）
Object.keys(person).forEach(key => {
  console.log(`${key}: ${person[key]}`);
});

// 3. Object.values()（ES2017，仅值）
Object.values(person).forEach(value => {
  console.log(value);
});

// 4. Object.entries()（ES2017，键值对）
Object.entries(person).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});
```

### 对象的浅拷贝

创建对象的浅拷贝（只复制对象本身，不复制嵌套对象）的方法：

```javascript
const original = { a: 1, b: { c: 2 } };

// 1. Object.assign()
const copy1 = Object.assign({}, original);

// 2. 展开运算符（ES2018）
const copy2 = { ...original };

// 浅拷贝的局限性
original.b.c = 3;
console.log(copy1.b.c); // 3 - 嵌套对象是引用，会受到原对象修改的影响
console.log(copy2.b.c); // 3
```

## 创建对象的方法

JavaScript提供了多种创建对象的方法，每种方法都有其适用场景。

### 对象字面量

最简单、最常用的创建对象方法：

```javascript
const person = {
  name: '张三',
  age: 30,
  greet() {
    console.log(`你好，我是${this.name}`);
  }
};
```

优势：语法简洁、直观，适合创建单个对象。

### 构造函数

使用构造函数可以创建相同"类型"的多个对象：

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function() {
    console.log(`你好，我是${this.name}`);
  };
}

const person1 = new Person('张三', 30);
const person2 = new Person('李四', 25);

person1.greet(); // '你好，我是张三'
person2.greet(); // '你好，我是李四'
```

构造函数的执行步骤：
1. 创建一个新的空对象
2. 将构造函数的`this`指向这个新对象
3. 执行构造函数中的代码
4. 返回这个新对象

注意事项：
- 构造函数通常首字母大写，以区分普通函数
- 必须使用`new`关键字调用，否则`this`会指向全局对象（非严格模式下）
- 每个实例都有独立的方法副本，可能导致内存浪费

### 原型模式

为了解决构造函数创建重复方法的问题，可以使用原型模式：

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 在原型上添加方法
Person.prototype.greet = function() {
  console.log(`你好，我是${this.name}`);
};

Person.prototype.getAge = function() {
  return this.age;
};

const person1 = new Person('张三', 30);
const person2 = new Person('李四', 25);

// 原型方法由所有实例共享
person1.greet(); // '你好，我是张三'
person2.greet(); // '你好，我是李四'
```

优势：
- 所有实例共享原型上的方法，节省内存
- 即使在创建实例后添加的原型方法也可以被所有实例访问

### 工厂模式

工厂模式是一种创建对象的设计模式，隐藏了创建对象的复杂性：

```javascript
function createPerson(name, age) {
  return {
    name,
    age,
    greet() {
      console.log(`你好，我是${this.name}`);
    }
  };
}

const person1 = createPerson('张三', 30);
const person2 = createPerson('李四', 25);

person1.greet(); // '你好，我是张三'
```

优势：
- 无需使用`new`关键字
- 可以在创建前进行复杂的逻辑处理
- 可以创建特定"类型"的对象而不暴露构造逻辑

缺点：
- 无法识别对象类型（所有实例都是普通对象）
- 每个实例都有独立的方法副本

### 组合使用构造函数和原型

结合构造函数和原型的优点，是创建对象的常用方式：

```javascript
function Person(name, age) {
  // 实例属性（每个实例独立）
  this.name = name;
  this.age = age;
  this.interests = [];
}

// 原型方法（所有实例共享）
Person.prototype.greet = function() {
  console.log(`你好，我是${this.name}`);
};

Person.prototype.addInterest = function(interest) {
  this.interests.push(interest);
};

const person1 = new Person('张三', 30);
const person2 = new Person('李四', 25);

person1.addInterest('编程');
person1.addInterest('音乐');

person2.addInterest('体育');

console.log(person1.interests); // ['编程', '音乐']
console.log(person2.interests); // ['体育']
```

优势：
- 实例属性在构造函数中定义，每个实例独立
- 方法在原型上定义，所有实例共享
- 兼顾灵活性和内存效率

### Object.create()方法

ES5引入的`Object.create()`方法可以以指定的原型创建新对象：

```javascript
// 创建一个作为原型的对象
const personProto = {
  greet() {
    console.log(`你好，我是${this.name}`);
  },
  init(name, age) {
    this.name = name;
    this.age = age;
    return this;
  }
};

// 以personProto为原型创建新对象
const person1 = Object.create(personProto).init('张三', 30);
const person2 = Object.create(personProto).init('李四', 25);

person1.greet(); // '你好，我是张三'
```

`Object.create()`还可以指定新对象的属性描述符：

```javascript
const person = Object.create(personProto, {
  name: {
    value: '张三',
    writable: true,
    enumerable: true
  },
  age: {
    value: 30,
    writable: true,
    enumerable: true
  }
});

person.greet(); // '你好，我是张三'
```

优势：
- 可以显式指定对象的原型
- 可以创建没有原型的对象：`Object.create(null)`
- 可以同时定义属性及其特性

### ES6 Class语法

ES6引入的Class语法提供了更清晰的面向对象编程体验：

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
    this.interests = [];
  }
  
  greet() {
    console.log(`你好，我是${this.name}`);
  }
  
  addInterest(interest) {
    this.interests.push(interest);
  }
  
  static create(name, age) {
    return new Person(name, age);
  }
}

const person1 = new Person('张三', 30);
const person2 = Person.create('李四', 25);

person1.greet(); // '你好，我是张三'
person2.greet(); // '你好，我是李四'
```

优势：
- 语法更清晰、更接近传统面向对象语言
- 内置了常用功能，如构造方法、静态方法
- 易于实现继承（使用`extends`关键字）

### 单例模式

单例模式确保一个类只有一个实例，并提供一个全局访问点：

```javascript
const Singleton = (function() {
  let instance;
  
  function createInstance() {
    return {
      name: 'singleton',
      getTime() {
        return new Date().getTime();
      }
    };
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();

console.log(instance1 === instance2); // true
```

优势：
- 确保类只有一个实例
- 提供对该实例的全局访问点
- 延迟初始化，提高性能

### 使用模块模式创建对象

模块模式使用闭包创建有私有变量和方法的对象：

```javascript
const Counter = (function() {
  // 私有变量
  let count = 0;
  
  // 返回公共接口
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getValue() {
      return count;
    }
  };
})();

console.log(Counter.increment()); // 1
console.log(Counter.increment()); // 2
console.log(Counter.getValue()); // 2
console.log(Counter.decrement()); // 1

// 无法直接访问私有变量
console.log(Counter.count); // undefined
```

优势：
- 封装私有状态和行为
- 只暴露必要的公共接口
- 避免全局命名空间污染

### 对象创建方法的选择

选择对象创建方法时的考虑因素：

```text
对象创建方法选择指南:

1. 简单对象 → 对象字面量
2. 多个相似对象 → 构造函数+原型 或 Class
3. 需要继承 → Class 或 Object.create()
4. 需要私有变量 → 模块模式 或 ES2022私有字段
5. 全局单一实例 → 单例模式
6. 对象工厂 → 工厂模式
```

在实际开发中，通常会根据项目需求综合使用多种模式。现代JavaScript开发中，使用ES6 Class语法创建对象是最常见的方式，因为它语法清晰且易于扩展。 

## 原型链与原型继承

JavaScript 的继承机制与大多数面向对象语言不同，它使用原型链实现继承。理解原型链是掌握 JavaScript 的关键。

### 原型链基础

每个 JavaScript 对象都有一个内部属性 `[[Prototype]]`（在浏览器中通常通过 `__proto__` 访问），指向它的原型对象。当查找对象的属性时，如果对象本身没有这个属性，JavaScript 会沿着原型链向上查找。

```ascii
原型链查找流程:
    
对象本身
    |
    v
对象的原型 (Object.prototype)
    |
    v
原型的原型 (null)
```

下面是一个基本示例：

```javascript
// 创建一个构造函数
function Person(name) {
  this.name = name;
}

// 在构造函数的原型上添加方法
Person.prototype.sayHello = function() {
  console.log(`你好，我是${this.name}`);
};

// 创建实例
const person1 = new Person('张三');

// 查找属性的过程
console.log(person1.name); // '张三' - 直接在对象上找到
person1.sayHello(); // '你好，我是张三' - 在原型上找到

console.log(person1.toString()); // '[object Object]' - 在 Object.prototype 上找到
console.log(person1.nonExistentProperty); // undefined - 整个原型链都没找到
```

### 原型链图解

以下是原型链的详细结构：

```text
实例对象 (person1)
  |
  | [[Prototype]] (__proto__)
  v
构造函数的原型 (Person.prototype)
  |
  | [[Prototype]] (__proto__)
  v
Object.prototype
  |
  | [[Prototype]] (__proto__)
  v
null
```

这个结构可以通过代码验证：

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`你好，我是${this.name}`);
};

const person1 = new Person('张三');

// 验证原型链
console.log(person1.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true
```

### 属性查找与修改

当访问对象的属性时，JavaScript 引擎会执行以下步骤：

1. 检查对象自身是否有该属性
2. 如果没有，检查对象的原型
3. 如果仍然没有，继续沿着原型链查找
4. 如果整个原型链都没有，返回 `undefined`

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.species = '人类';

const person1 = new Person('张三');

// 查找属性
console.log(person1.name); // '张三' - 对象自身的属性
console.log(person1.species); // '人类' - 原型上的属性

// 修改属性
person1.species = '超人'; // 在对象上创建新属性，不会修改原型
console.log(person1.species); // '超人'
console.log(Person.prototype.species); // '人类' - 原型未被修改

// 删除对象属性后，会显示原型上的同名属性
delete person1.species;
console.log(person1.species); // '人类' - 显示原型上的属性
```

修改属性的行为总结：

1. 读取属性：沿着原型链向上查找
2. 设置属性：只在对象自身添加或修改属性，不影响原型
3. 删除属性：只能删除对象自身的属性，不能删除原型上的属性

### 检查原型关系

JavaScript 提供了多种方法检查对象与原型之间的关系：

```javascript
function Person(name) {
  this.name = name;
}

const person1 = new Person('张三');

// 1. instanceof 运算符 - 检查对象是否为某个构造函数的实例
console.log(person1 instanceof Person); // true
console.log(person1 instanceof Object); // true
console.log(person1 instanceof Array); // false

// 2. isPrototypeOf() 方法 - 检查一个对象是否存在于另一个对象的原型链上
console.log(Person.prototype.isPrototypeOf(person1)); // true
console.log(Object.prototype.isPrototypeOf(person1)); // true

// 3. Object.getPrototypeOf() - 获取对象的原型
console.log(Object.getPrototypeOf(person1) === Person.prototype); // true

// 4. __proto__ 属性（非标准但广泛支持）
console.log(person1.__proto__ === Person.prototype); // true
```

### 构造函数、原型和实例的关系

在 JavaScript 中，构造函数、原型和实例之间有着密切的关系：

```text
构造函数、原型和实例关系:

+-------------+
| 构造函数 Person |
+-------------+
       |
       | prototype
       v
+----------------+
| Person.prototype |
+----------------+
       ^
       | [[Prototype]]
       |
  +---------+
  | 实例 person1 |
  +---------+
```

这些关系通过以下属性连接：

1. 每个函数都有一个 `prototype` 属性，指向其原型对象
2. 每个原型对象都有一个 `constructor` 属性，指回构造函数
3. 每个实例都有一个内部 `[[Prototype]]` 属性，指向构造函数的原型

```javascript
function Person(name) {
  this.name = name;
}

const person1 = new Person('张三');

// 1. 构造函数与原型
console.log(Person.prototype.constructor === Person); // true

// 2. 实例与原型
console.log(Object.getPrototypeOf(person1) === Person.prototype); // true

// 3. 实例与构造函数
console.log(person1.constructor === Person); // true (通过原型继承而来)
```

### Function 对象和 Object 对象的关系

JavaScript 中的内置对象 `Function` 和 `Object` 有一个有趣的关系：

```text
Function 和 Object 关系:

+----------------+      prototype      +-----------------+
| Function 构造函数 | -----------------> | Function.prototype |
+----------------+                     +-----------------+
        ^                                      ^
        |                                      |
        | [[Prototype]]                        | [[Prototype]]
        |                                      |
+----------------+      prototype      +-----------------+
| Object 构造函数   | -----------------> | Object.prototype  |
+----------------+                     +-----------------+
                                               ^
                                               |
                                               | [[Prototype]]
                                               |
                                      +------------------+
                                      | 用户创建的对象 person1 |
                                      +------------------+
```

这种关系可以在代码中验证：

```javascript
// Function 构造函数是由自己的原型创建的
console.log(Function.__proto__ === Function.prototype); // true

// Object 构造函数也是一个函数，由 Function.prototype 创建
console.log(Object.__proto__ === Function.prototype); // true

// Function.prototype 是一个对象，其原型是 Object.prototype
console.log(Function.prototype.__proto__ === Object.prototype); // true

// Object.prototype 是原型链的顶端
console.log(Object.prototype.__proto__ === null); // true
```

### 原型继承

JavaScript 中实现继承的主要方式是原型继承。以下是几种常见的继承模式：

#### 1. 原型链继承

通过将一个构造函数的原型设置为另一个构造函数的实例来实现继承：

```javascript
// 父构造函数
function Animal(species) {
  this.species = species;
}

Animal.prototype.makeSound = function() {
  console.log('动物发出声音');
};

// 子构造函数
function Dog(name, species) {
  this.name = name;
  Animal.call(this, species); // 继承属性
}

// 继承方法 - 设置原型链
Dog.prototype = new Animal(); // 不推荐的方式，会调用两次父构造函数
Dog.prototype.constructor = Dog; // 修复 constructor 指向

Dog.prototype.bark = function() {
  console.log('汪汪汪!');
};

const myDog = new Dog('旺财', '犬类');
console.log(myDog.species); // '犬类'
myDog.makeSound(); // '动物发出声音'
myDog.bark(); // '汪汪汪!'
```

缺点：
- 继承的属性会出现在原型上，所有实例共享
- 创建子类实例时无法向父类构造函数传参
- 调用两次父构造函数

#### 2. 借用构造函数（经典继承）

在子构造函数内部调用父构造函数，传入子对象的 `this` 来继承属性：

```javascript
function Animal(species) {
  this.species = species;
  this.colors = ['black', 'white'];
}

function Dog(name, species) {
  // 借用父构造函数
  Animal.call(this, species);
  this.name = name;
}

const myDog = new Dog('旺财', '犬类');
console.log(myDog.species); // '犬类'
console.log(myDog.colors); // ['black', 'white']

// 验证实例独立
myDog.colors.push('brown');
const anotherDog = new Dog('小黑', '犬类');
console.log(anotherDog.colors); // ['black', 'white'] - 不受影响
```

优点：
- 可以向父构造函数传参
- 避免了原型链继承中的属性共享问题

缺点：
- 方法在构造函数中定义，每个实例都有自己的方法副本
- 无法继承原型上的方法

#### 3. 组合继承（最常用）

结合原型链和借用构造函数，继承属性和方法：

```javascript
function Animal(species) {
  this.species = species;
  this.colors = ['black', 'white'];
}

Animal.prototype.makeSound = function() {
  console.log('动物发出声音');
};

function Dog(name, species) {
  // 借用构造函数继承属性
  Animal.call(this, species);
  this.name = name;
}

// 原型链继承方法
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log('汪汪汪!');
};

const myDog = new Dog('旺财', '犬类');
console.log(myDog.species); // '犬类'
myDog.makeSound(); // '动物发出声音'
myDog.bark(); // '汪汪汪!'

// 验证实例独立
myDog.colors.push('brown');
const anotherDog = new Dog('小黑', '犬类');
console.log(anotherDog.colors); // ['black', 'white'] - 不受影响
```

优点：
- 结合了两种继承方式的优点
- 属性定义在实例上，方法共享在原型上
- 可以向父构造函数传参

#### 4. 寄生式继承

在原型继承的基础上增强对象，添加额外属性和方法：

```javascript
function createAnimal(species) {
  return {
    species: species,
    makeSound() {
      console.log('动物发出声音');
    }
  };
}

function createDog(name, species) {
  // 创建基础对象
  const dog = createAnimal(species);
  
  // 增强对象
  dog.name = name;
  dog.bark = function() {
    console.log('汪汪汪!');
  };
  
  return dog;
}

const myDog = createDog('旺财', '犬类');
console.log(myDog.species); // '犬类'
myDog.makeSound(); // '动物发出声音'
myDog.bark(); // '汪汪汪!'
```

#### 5. ES6 Class 继承

ES6 提供了更清晰的继承语法：

```javascript
class Animal {
  constructor(species) {
    this.species = species;
    this.colors = ['black', 'white'];
  }
  
  makeSound() {
    console.log('动物发出声音');
  }
}

class Dog extends Animal {
  constructor(name, species) {
    super(species); // 调用父类构造函数
    this.name = name;
  }
  
  bark() {
    console.log('汪汪汪!');
  }
  
  // 重写父类方法
  makeSound() {
    super.makeSound(); // 调用父类方法
    console.log('狗的叫声');
  }
}

const myDog = new Dog('旺财', '犬类');
console.log(myDog.species); // '犬类'
myDog.makeSound(); // '动物发出声音' 然后 '狗的叫声'
myDog.bark(); // '汪汪汪!'
```

ES6 `class` 继承的优点：
- 语法清晰，接近传统面向对象语言
- 内部使用原型继承实现
- 可以方便地调用父类方法（使用 `super`）

尽管有多种实现继承的方式，在现代 JavaScript 开发中，ES6 的 `class` 语法是首选，因为它简洁明了且功能完整。但理解原型链的工作原理仍然非常重要，因为这是 JavaScript 对象系统的核心机制。 