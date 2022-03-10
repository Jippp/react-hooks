## 常用的 hooks以及组件 总结

---

## hook

---

### useSize

​ 基于`ahooks`这个库，用于监听 dom 的尺寸变化

`useSize(dom | ref) => size: {width, height}`

​ 最主要的 api 就是`ResizeObserver`构造函数来监听 size 变化

```react
const size = useSize(dom)
```

---

## 组件

---

### VirtualList

虚拟列表的组件，目前只支持固定子列表
大致思路就是每次只渲染展示区域内的列表

白屏解决：在头部和尾部多渲染一个列表

> 浏览器对滚动条高度做了一个限制，极限值为 33554400，超出这个值滚动条不再增加
