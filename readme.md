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

---

## 方法

### createCtx

基于`useImmer`以及`useContext`/`createContext`可以方便的进行状态管理，对于一些公用状态可以直接从顶部获取，而不需要一层一层传递状态，避免了中间组件的重渲染以及繁琐的写法

用法如下：

```jsx
// 开发模块的顶层先将默认值传入
import createCtx from 'xxxuseCreateCtx'

const initialState = xxx

export const [useCtx, Provider] = createCtx(initialState)

// 使用时可以通过useCtx获取到顶部状态state以及更新状态的方法update
// 再从顶层引入Provider，包裹一下子组件
const {
  state,
  update
} = useCtx()

const Component = () => {
  return (
    <Provider>
      {/* 子组件 */}
    </Provider>  
  )
}

```

---

### createStore

对`createCtx`的改善，由于`createCtx`每次更新之后都会导致其消费组件更新，所以对其进行优化。
大致思路：使用的时候不再是`state.xxx`的形式了，而是通过`useSelector`这个hook来获取存储的数据，并且在这个hook当中对state进行了监听，如果发生了变化，就会调用`setState`来强制刷新这个组件，这样就可以保证其他组件不会更新，实现了更细粒度的更新

代码可以看[demo](./src/demo/checkMiniStore/)

---

## 组件

### VirtualList

虚拟列表的组件，目前只支持固定子列表
大致思路就是每次只渲染展示区域内的列表

白屏解决：在头部和尾部多渲染一个列表

> 浏览器对滚动条高度做了一个限制，极限值为 33554400，超出这个值滚动条不再增加
