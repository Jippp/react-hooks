## 常用的 hooks以及组件 总结

## hook

---

### useSize

​ 基于`ahooks`这个库，用于监听 dom 的尺寸变化

`useSize(dom | ref) => size: {width, height}`

​ 最主要的 api 就是`ResizeObserver`构造函数来监听 size 变化

```react
const size = useSize(dom)
```

### useImmer

基于`immer`库封装的一个管理对象信息的hook

react的`useState`对于对象的更新会很不方便，需要新创建一个对象来更新，使用该hook可以更优雅的解决管理对象状态的问题

用法如下：

```jsx
const [info, updateInfo] = useImmer({
  a: {
    b: 'info'
  }
})

// 更新时只需要直接操作即可
updateInfo({ a } => {
  a.b = 'updateInfo'
})

```

## 组件

---

### VirtualList

虚拟列表的组件，目前只支持固定子列表
大致思路就是每次只渲染展示区域内的列表

白屏解决：在头部和尾部多渲染一个列表

> 浏览器对滚动条高度做了一个限制，极限值为 33554400，超出这个值滚动条不再增加
