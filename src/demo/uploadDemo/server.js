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
const STATICPATH = path.join(__dirname, '/assets').replace(/\\/g, '/')
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
  let responseMsg = '', status = 200
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
    status = 400
    responseMsg = 'no file!'
  }
  ctx.response.status = status
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
  let responseMsg = '', status = 200
  const bigFileDirPath = path.join(STATICPATH, `/${fileName}`)
  const readDirPath = `${STATICPATH}/${fileHash}`
  const writeStream = fs.createWriteStream(bigFileDirPath)
  
  function merge(i) {
    const readPath = `${readDirPath}/${fileHash}_${i}`;

    if(fs.existsSync(readPath)) {
      const readStream = fs.createReadStream(readPath)
      // end: true 当读取结束时结束写入，如果是writable，则会自动调用writable.end()，即不可再写入
      readStream.pipe(writeStream, { end: false })
      // 如果readable过程中发生错误，writable也不会自动关闭，需要手动触发writable.end()，防止内存泄露
      readStream.on('end', () => {
        fs.unlinkSync(readPath)
        if(++i < chunkCount) {
          merge(i)
        }else {
          writeStream.end()
          fs.rmdir(readDirPath, err => {
            if(err) console.log(err)
          })
        }
      })
      readStream.on('error', (err) => {
        if(err) {
          console.log(err)
          writeStream.end()
        }
      })
    }else {
      status = 404
      responseMsg = 'Upload Error: no find chunk!'
    }
  }
  merge(0)

  ctx.response.status = status
  ctx.body = {
    msg: responseMsg || 'Big file upload success!'
  }
}

app.use(ctx => {
  const { files, url } = ctx.request
  if(url === UPLOADFILESPATH) {
    uploadFile(ctx, files)
  }else if(url === MERGEFILESPATH) {
    mergeFile(ctx)
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