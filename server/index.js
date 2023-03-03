// 文件上传后台服务
const Koa = require('koa')
const { koaBody } = require('koa-body')
const http = require('http')

const uploadFile = require('./uploadFile')
const mergeFile = require('./mergeFile')
const checkFile = require('./checkFile')

const { PORT, UPLOADFILESPATH, MERGEFILESPATH, CHECKFILESPATH, STATICPATH, ALLOWORIGIN } = require('./config')

const app = new Koa()

app.use(koaBody({
  formidable: {
    uploadDir: STATICPATH
  },
  // 解析body 放到ctx.request.files中
  multipart: true
}))

// 跨域
app.use((ctx, next) => {
  if(ALLOWORIGIN.some(origin => ctx.request.header.origin.includes(origin))) {
    ctx.set('Access-Control-Allow-Headers', '*')
    ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin)
  }
  next()
})

app.use(ctx => {
  const { files, url } = ctx.request
  if(url === UPLOADFILESPATH) {
    uploadFile(ctx, files)
  }else if(url === MERGEFILESPATH) {
    mergeFile(ctx)
  }else if(url === CHECKFILESPATH) {
    checkFile(ctx, files)
  }else {
    ctx.response.status = 403
    ctx.body = {
      msg: 'Request Error!',
      reason: 'Can`t find path!'
    }
  }
})

const server = http.createServer(app.callback())
server.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT}`)
})