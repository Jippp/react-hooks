/** 上传文件的接口 */
export const UPLOADFILESPATH = '/uploadFiles'
/** 大文件合并的接口 */
export const MERGEFILESPATH = '/mergeFiles'
/** 检查文件上传情况的接口 */
export const CHECKFILESPATH = '/checkFiles'

/** 为loading添加一个最低延时，防止过快导致的闪烁 */
export const LOADINGMINTIME = 500
/** 分包大小 */
export const CHUNKSIZE = 2 * 1024 * 1024
/** 多文件时统一上传的假定文件名，统一一个 否则会导致存储变大 */
export const ALLFILENAME = 'ALL_FILE_NAME'