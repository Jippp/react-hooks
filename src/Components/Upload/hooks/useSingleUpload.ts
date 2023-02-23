/** 
 * 单个文件上传涉及到的逻辑
 */
import { usePersistFn } from 'ahooks'

import RequestLimit from '@/utils/requestLimit'
import useImmer from '@/hooks/useImmer'

import { UploadRequestProps, ChunkInfoProps, ChunkInfoEnum, RequestListType } from '../types'
import { MERGEFILESPATH, CHECKFILESPATH, CHUNKSIZE } from '../config'
import useRequest from './useRequest'
import { getFileHash, sliceFile } from './util'

// 限制请求数，写在顶层，防止重复创建
const pLimit = new RequestLimit()

const useSingleUpload = ({ url, path }: Pick<UploadRequestProps, 'path' | 'url'>) => {
  // 请求loading，按理来说只记录一个boolean值
  // TODO 优化空间
  const [singleLoading, updateSingleLoading] = useImmer<Record<string, boolean>>({})
  // 请求列表 中断请求时使用
  const [requestList, updateRequestList] = useImmer<RequestListType>({})

  const { post } = useRequest({ url })

  // 大文件多包上传发请求
  const handleBigFile = usePersistFn((
    chunkList: (File | Blob)[],
    fileName: string, 
    fileHash: string,
    chunkNumList?: number[]
  ) => {
    const list: Promise<unknown>[] = []
    chunkList.forEach((chunk, chunkIndex) => {
      if(!(Array.isArray(chunkNumList) && chunkNumList.includes(chunkIndex))) {
        const { promise } = commonUpload(chunk, `${fileName}_${chunkIndex}`, {
          [ChunkInfoEnum.chunkIndex]: String(chunkIndex),
          [ChunkInfoEnum.fileName]: fileName,
          [ChunkInfoEnum.fileHash]: fileHash
        })
        list.push(promise)
      }
    })

    return list
  })

  // 检查已上传的文件或文件包
  const checkFileRequest = usePersistFn((file: File, fileHash?: string) => {
    const checkFormData = new FormData()
    checkFormData.set(ChunkInfoEnum.fileName, file.name)
    if(fileHash) checkFormData.set(ChunkInfoEnum.fileHash, fileHash)
    
    return post({
      path: CHECKFILESPATH,
      formData: checkFormData,
      onError: (err) => {
        console.log(err)
      }
    }) as Promise<Record<string, boolean | number[]>>
  })

  // 大文件的合并请求
  const mergeFileRequest = usePersistFn((
    chunkCount: number, 
    fileName: string, 
    hash: string, 
    setLoading?: ((status: boolean) => void)
  ) => {
    const mergeFormData = new FormData()
    mergeFormData.set(ChunkInfoEnum.chunkCount, String(chunkCount))
    mergeFormData.set(ChunkInfoEnum.fileName, fileName)
    mergeFormData.set(ChunkInfoEnum.fileHash, hash)

    return post({
      path: MERGEFILESPATH, formData: mergeFormData, fileName, setLoading
    })
  })

  // 单个小文件或包上传的逻辑
  const commonUpload = usePersistFn((
    file: File | Blob, 
    /** chunk名称，如果有值说明是大文件上传 */
    chunkName?: string, 
    chunkInfo?: ChunkInfoProps
  ) => {
    const controller = new AbortController()
    const formData = new FormData()
    const resultFileName = chunkName || file.name
    formData.set(resultFileName, file)
    // 大文件部分包上传，formData添加额外的信息
    if(chunkInfo) {
      for(const key in chunkInfo) {
        formData.set(key, chunkInfo[key as keyof ChunkInfoProps])
      }
    }
    
    // 大文件loading特殊处理：分片loading没必要记录
    const setLoading = chunkName ? undefined : (status: boolean) => {
      updateSingleLoading(d => {
        d[resultFileName] = status
      })
    }

    const removeRequest = () => {
      updateRequestList(d => {
        delete d[resultFileName]
      })
    }
    
    // 对请求数做个限制，防止一下子请求过多
    const promise = pLimit.run(() => post({
      path,
      formData,
      config: {
        signal: controller.signal
      },
      fileName: resultFileName,
      setLoading,
      onSuccess: removeRequest,
      onError: removeRequest,
    }))
    updateRequestList(d => {
      d[resultFileName] = controller
    })
    return { promise, controller }
  })

  // 文件上传的主函数，暴露出去以供使用
  const singleUpload = usePersistFn(async (file: File) => {
    if(file.size > CHUNKSIZE) {
      const setLoading = (status: boolean) => {
        updateSingleLoading(d => {
          d[file.name] = status
        })
      }

      setLoading(true)

      const { chunkCount, chunkList } = sliceFile(file)
      const hash = await getFileHash(chunkList)

      const checkFileResult = await checkFileRequest(file, hash)
      const currentResult = checkFileResult[file.name]

      // 检查文件上传情况，做不同的处理
      if(Array.isArray(currentResult) || !currentResult) {
        const list = handleBigFile(chunkList, file.name, hash, Array.isArray(currentResult) ? currentResult : undefined)
        
        Promise.all(list)
          .then(() => {
            mergeFileRequest(chunkCount, file.name, hash, setLoading)
          }, () => {
            setLoading(false)
          })
          .catch((err) => {
            console.log(err)
          })
      }else {
        window.alert(`${file.name}已上传`)
      }
      setLoading(false)

    }else {
      const checkFileResult = await checkFileRequest(file)
      if(checkFileResult[file.name]) {
        window.alert(`${file.name}已上传`)
      }else {
        commonUpload(file)
      }
    }
  })

  // 取消请求
  const singleAbort = usePersistFn((fileName: string) => {
    for(let name in requestList) {
      if(name.includes(fileName) && requestList[name]) {
        requestList[name]!.abort()
      }
    }
  })

  return {
    singleUpload,
    singleAbort,
    singleLoading,
  }
}

export default useSingleUpload