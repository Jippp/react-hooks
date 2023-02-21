// 文件上传后台服务
const Koa = require('koa')
const { koaBody } = require('koa-body')
const http = require('http')
const path = require('path')
const fs = require('fs')

/** 服务端口 */
const PORT = '8081'
/** 上传请求 */
const UPLOADFILESPATH = '/uploadFiles'
/** 合并请求 */
const MERGEFILESPATH = '/mergeFiles'
/** 检查已上传文件的请求 */
// const CHECKFILESPATH = '/checkFiles'
/** 资源存储的路径 */
const STATICPATH = path.join(__dirname, '/assets')
/** 白名单 */
const ALLOWORIGIN = ['http://localhost:3000', 'http://10.17.223.232:3000'];

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
  if(ALLOWORIGIN.includes(ctx.request.header.origin)) {
    ctx.set('Access-Control-Allow-Headers', '*')
    ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin)
  }
  next()
})

/**
 * 处理上传文件的接口
 * @param {*} ctx 
 * @param {*} files 文件
 */
const uploadFile = (ctx, files) => {
  const fileList = Object.values(files)
  const { chunkIndex, fileHash } = ctx.request.body
  let responseMsg = ''
  if(fileList && fileList.length) {
    // 对文件重命名
    fileList.forEach(file => {
      const oldNamePath = file.filepath.replace(/\\/g, '/')
      let newNamePath = ''
      if(chunkIndex !== undefined) {
        // 大文件处理
        const bigFileDirPath = `${STATICPATH}/${fileHash}`
        newNamePath = `${bigFileDirPath}/${fileHash}_${chunkIndex}`
        if(!fs.existsSync(bigFileDirPath)) {
          fs.mkdirSync(bigFileDirPath)
        }
      }else {
        newNamePath = `${STATICPATH}/${file.originalFilename}`
      }
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

/**
 * 大文件上传处理合并文件的请求
 * @param {*} ctx 
 * @param {*} files 
 */
const mergeFile = (ctx) => {
  const { fileName, chunkCount, fileHash } = ctx.request.body
  // let responseMsg = ''
  const bigFileDirPath = path.join(STATICPATH, `/${fileName}`)
  const writeStream = fs.createWriteStream(bigFileDirPath)

  function merge(i) {
    const readPath = `${STATICPATH}/${fileHash}/${fileHash}_${i}`;
    console.log(readPath, fs.existsSync(readPath))
    if(fs.existsSync(readPath)) {
      const readStream = fs.createReadStream(readPath)
      readStream.pipe(writeStream, { end: false })
      readStream.on('end', () => {
        fs.unlink(readPath, (err) => {
          if(err) console.log(err)
        })
        if(++i < chunkCount) {
          merge(i)
        }else {
          fs.rmdirSync(bigFileDirPath)
        }
      })
    }
  }
  merge(0)

  ctx.body = {
    msg: 'Big File Upload Success!'
  }
}

app.use(ctx => {
  const { files, url } = ctx.request
  if(url === UPLOADFILESPATH) {
    uploadFile(ctx, files)
  }else if(url === MERGEFILESPATH) {
    mergeFile(ctx)
  }else {
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