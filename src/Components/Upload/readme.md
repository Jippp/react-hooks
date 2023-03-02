## 文件上传

包含拖拽上传、单个文件上传、多个文件上传、大文件上传等需求

- [x] 拖拽上传

- [x] 单文件上传

- [x] 多文件上传
  - [x] 统一loading
  - [x] 统一上传

- [x] 大文件上传：分包
  - [x] 并发请求数限制

- [x] 取消上传

- [x] 取消的请求重新上传
  - [x] 新加一个接口，检查已上传部分

### 注意点
- 大文件上传的时候会分包，所有包请求完成才会发送合并请求
  - Promise.all()监听时如果不做请求数量限制，会一次将所有的请求都通知到浏览器，等待浏览器的发送
  - 浏览器对请求数量作了限制，同一个域下最多同时发送6个请求
  - 如果这里不做限制的话，数量过多会导致卡死的情况
  - 应该做一层限制，比如等待4个或6个请求完成之后，再通知浏览器发送剩下的请求，直到所有请求发送完成