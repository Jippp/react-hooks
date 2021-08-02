## 常用的hooks总结

---

### useSize

​	基于`ahooks`这个库，用于监听dom的尺寸变化

`useSize(dom | ref) => size: {width, height}`

​	最主要的api就是`ResizeObserver`构造函数来监听size变化

```react
const size = useSize(dom)
```

