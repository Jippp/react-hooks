const path = require('path')

/** 服务端口 */
const PORT = '8081'
/** 上传请求 */
const UPLOADFILESPATH = '/uploadFiles'
/** 合并请求 */
const MERGEFILESPATH = '/mergeFiles'
/** 检查已上传文件的请求 */
const CHECKFILESPATH = '/checkFiles'
/** 资源存储的路径 */
const STATICPATH = path.join(__dirname, '/assets')
/** 白名单 */
const ALLOWORIGIN = ['http://localhost', 'http://10.17.223.232'];

module.exports = {
  PORT, UPLOADFILESPATH, MERGEFILESPATH, CHECKFILESPATH, STATICPATH, ALLOWORIGIN
}