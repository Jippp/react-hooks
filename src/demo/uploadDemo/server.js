// 文件上传后台服务
const Koa = require('koa')
const { koaBody } = require('koa-body')
const http = require('http')
const path = require('path')
const fs = require('fs')

const PORT = '8081'
const UPLOADFILESPATH = '/uploadFiles'
// const CHECKFILESPATH = '/checkFiles'
const STATICPATH = path.join(__dirname, '/assets')
// 白名单
const ALLOWORIGIN = ['http://localhost:3000', 'http://10.17.223.232:3000'];

const app = new Koa()

// if(fs.existsSync(STATICPATH)) {
//   fs.mkdirSync(STATICPATH)
// }
app.use(koaBody({
  formidable: {
    uploadDir: STATICPATH
  },
  // 解析body 放到ctx.request.files中
  multipart: true
}))

// 跨域
app.use((ctx, next) => {
  if(ALLOWORIGIN.includes(ctx.request.header.origin)) {
    ctx.set('Access-Control-Allow-Headers', '*')
    ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin)
  }
  next()
})

app.use(ctx => {
  const { files, url } = ctx.request
  if(url === UPLOADFILESPATH) {
    const fileList = Object.values(files)
    let responseMsg = ''
    if(fileList && fileList.length) {
      // 对文件重命名
      fileList.forEach(file => {
        const oldNamePath = file.filepath.replace(/\\/, '/')
        const newNamePath = `${STATICPATH}/${file.originalFilename}`
        fs.renameSync(oldNamePath, newNamePath)
      })
      responseMsg = 'file upload success!'
    }else {
      responseMsg = 'no file!'
    }
    ctx.body = {
      msg: responseMsg
    }
  }
})

const server = http.createServer(app.callback())
server.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT}`)
})