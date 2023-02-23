const fs = require('fs')

const { STATICPATH } = require('./config')


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

module.exports = uploadFile