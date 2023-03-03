const path = require('path')
const fs = require('fs')

const { STATICPATH } = require('./config')

/**
 * 大文件上传处理合并文件的请求
 * @param {*} ctx
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

module.exports = mergeFile