---
title: ts
createTime: 2025/05/06 13:40:14
permalink: /article/i9o48jeb/
---

## 1、说说 typescript 的数据类型有哪些？
- boolean（布尔类型）：let flag:boolean = true;
- number（数字类型）：let num:number = 123;
- string（字符串类型）：let str:string = ‘this is ts’;
- array（数组类型）：let arr:Array = [1, 2];
- tuple（元组类型）允许表示一个已知元素数量和类型的数组，let tupleArr:[number, string, boolean];
- enum（枚举类型）：enum Color {Red, Green, Blue}
- any（任意类型）：let num:any = 123;
- null 和 undefined 类型：let num:number | undefined; // 数值类型 或者 undefined
- void 类型：用于标识方法返回值的类型，表示该方法没有返回值。
- never 类型 never是其他类型 （包括null和 undefined）的子类型，可以赋值给任何类型，代表从不会出现的值。但是没有类型是 never 的子类型，这意味着声明 never 的变量只能被 never 类型所赋值。
- 11、object 对象类型：let obj:object;

## 2、说说你对 TypeScript 中高级类型的理解？有哪些？
TypeScript高级类型

基本组合类型
- 联合类型 (|) ──── 可以是多种类型之一
- 交叉类型 (&) ──── 多种类型的合并

工具类型
- Partial<T/> ────── 将所有属性变为可选
- Required<T/> ───── 将所有属性变为必选
- Readonly<T/> ───── 将所有属性变为只读
- Pick<T,K/> ─────── 从T中选择K属性
- Omit<T,K/> ─────── 从T中排除K属性
- Exclude<T,U/> ──── 从T中排除可以赋值给U的类型
- Extract<T,U/> ──── 从T中提取可以赋值给U的类型
- NonNullable<T/> ── 从T中排除null和undefined
- ReturnType<T/> ─── 获取函数类型的返回类型
- InstanceType<T/> ─ 获取构造函数类型的实例类型

高级特性
- 条件类型 ──────── T extends U ? X : Y
- 映射类型 ──────── { [P in K]: T }
- 模板字面量类型 ── `${T}${U}`
- 递归类型 ──────── 自引用类型定义
- 类型推断 ──────── infer关键字

## 3、TypeScript中type和interface的区别

- 语法定义：一个是interface，一个是type
- 扩展方式不同：interface使用extends扩展，type使用交叉类型(&)扩展
- 声明合并:interface支持声明合并,type不支持声明合并
- 表达能力:type可以表示联合类型,type可以表示元组类型,type可以使用typeof获取类型,ype可以使用条件类型
