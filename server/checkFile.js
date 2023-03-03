const fs = require('fs')

const { STATICPATH } = require('./config')

/**
 * 检查已上传文件的请求
 * 需要传fileHash、fileName(必传)，多个用,分隔开
 * @param {*} ctx 
 */
const checkFile = (ctx) => {
  const { fileHash, fileName } = ctx.request.body
  let response = {}
  if(fileName) {
    const fileNameList = fileName.split(',')
    fileNameList.forEach((name, index) => {
      // 先检查完整的文件
      if(fs.existsSync(`${STATICPATH}/${name}`)) {
        response[name] = true
      }else if(fileHash) {
        const fileHashList = fileHash.split(',')
        // 有hash再检查具体的包
        if(fs.existsSync(`${STATICPATH}/${fileHashList[index]}`)) {
          const bigFileDir = fs.readdirSync(`${STATICPATH}/${fileHashList[index]}`)
          if(bigFileDir && bigFileDir.length) {
            // 具体包以字符串数组形式返回
            response[name] = bigFileDir.map(dir => +dir.split('_')[1])
          }else {
            console.log(`Read ${STATICPATH}/${fileHashList[index]} Error`)
          }
        }else {
          // 没有找到文件
          response[name] = false
        }
      }else {
        // 没有找到文件
        response[name] = false
      }
    })
  }else {
    ctx.response.status = 404
    response.err = 'Must a fileName!'
  }

  ctx.body = response
}

module.exports = checkFile