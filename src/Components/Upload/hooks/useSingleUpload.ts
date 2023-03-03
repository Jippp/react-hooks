/** 
 * 单个文件上传涉及到的逻辑
*/
import { useRef } from 'react'
import { usePersistFn } from 'ahooks'

import RequestLimit from '@/utils/requestLimit'
import useImmer from '@/hooks/useImmer'

import { UploadRequestProps, ChunkInfoProps, ChunkInfoEnum, RequestListType, StatusList, StatusItem } from '../types'
import { MERGEFILESPATH, CHECKFILESPATH, CHUNKSIZE } from '../config'
import useRequest from './useRequest'
import { getFileHash, sliceFile, delayLoading } from '../util'

// 设置状态的默认值
const defaultSetStatus = {
  setLoading: (status: boolean) => null,
  setError: (error: Error | boolean) => null
}

// 限制请求数，写在顶层，防止重复创建
const pLimit = new RequestLimit()

const useSingleUpload = ({ url, path }: Pick<UploadRequestProps, 'path' | 'url'>) => {
  // 请求loading、失败
  const [singleStatus, updateSingleStatus] = useImmer<StatusList>({})
  // 请求中断方法 中断请求时使用
  const [requestList, updateRequestList] = useImmer<RequestListType>({})
  // 记录定时器id 后续清除
  const timerRef = useRef<Map<string, NodeJS.Timeout | null>>(new Map())

  const { post } = useRequest({ url })

  // 获取设置状态的方法
  const getSetStatus = usePersistFn((fileName: string) => {
    return {
      setLoading: (status: boolean) => {
        updateSingleStatus(d => {
          (d[fileName] || (d[fileName] = {} as StatusItem)).loading = status
        })
      },
      setError: (error: Error | boolean) => {
        updateSingleStatus(d => {
          (d[fileName] || (d[fileName] = {} as StatusItem)).error = error
        })
      },
    }
  })

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
    
    return pLimit.run(() => post({
      path: CHECKFILESPATH,
      formData: checkFormData,
    })) as Promise<Record<string, boolean | number[]>>
  })

  // 大文件的合并请求
  const mergeFileRequest = usePersistFn((
    chunkCount: number, 
    fileName: string, 
    hash: string,
  ) => {
    const mergeFormData = new FormData()
    mergeFormData.set(ChunkInfoEnum.chunkCount, String(chunkCount))
    mergeFormData.set(ChunkInfoEnum.fileName, fileName)
    mergeFormData.set(ChunkInfoEnum.fileHash, hash)

    return pLimit.run(() => post({
      path: MERGEFILESPATH, formData: mergeFormData, fileName
    }))
  })

  // 单个小文件或包上传的逻辑
  const commonUpload = usePersistFn((
    file: File | Blob, 
    /** chunk名称，如果有值说明是大文件上传 */
    chunkName?: string, 
    chunkInfo?: ChunkInfoProps,
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
    
    // 大文件状态特殊处理：分片状态没必要记录
    const setStatus = chunkName ? defaultSetStatus : getSetStatus(file.name)

    const removeRequest = () => {
      updateRequestList(d => {
        delete d[resultFileName]
      })
    }

    const onError = (err: Error | boolean) => {
      console.log('%cerrrrrr', 'color: red; font-size: 20px', err);
      removeRequest()
      setStatus.setError(err)
    }
    
    // 对请求数做个限制，防止一下子请求过多
    const promise = pLimit.run(() => post({
      path,
      formData,
      config: {
        signal: controller.signal
      },
      fileName: resultFileName,
      setLoading: setStatus.setLoading,
      onSuccess: removeRequest,
      onError,
    }))
    updateRequestList(d => {
      d[resultFileName] = controller
    })
    return { promise, controller }
  })

  // 文件上传的主函数，暴露出去以供使用
  const singleUpload = usePersistFn(async (file: File) => {
    const fileName = file.name
    const { setLoading, setError } = getSetStatus(fileName)
    setLoading(true)

    if(timerRef.current.has(fileName)) {
      clearTimeout(timerRef.current.get(fileName)!)
      timerRef.current.delete(fileName)
    }

    if(file.size > CHUNKSIZE) {
      let hash = '', checkFileResult: Record<string, any> = {}

      const { chunkCount, chunkList } = sliceFile(file)
      
      try {
        hash = await getFileHash(chunkList)
        checkFileResult = await checkFileRequest(file, hash)
      } catch (error) {
        timerRef.current.set(fileName, delayLoading(setLoading, false))
        setError(error as Error | boolean)
      }

      const currentResult = checkFileResult[fileName]

      // 检查文件上传情况，做不同的处理
      if(Array.isArray(currentResult) || !currentResult) {
        const list = handleBigFile(chunkList, fileName, hash, Array.isArray(currentResult) ? currentResult : undefined)

        Promise.all(list).then(() => {
          mergeFileRequest(chunkCount, fileName, hash)
        }).catch((error) => {
          setError(error)
        }).finally(() => {
          timerRef.current.set(fileName, delayLoading(setLoading, false))
        })

      }else {
        // 对于已上传文件的处理
        timerRef.current.set(fileName, delayLoading(setLoading, false))
      }

    }else {
      let checkFileResult: Record<string, any> = {}
      try {
        checkFileResult = await checkFileRequest(file)
      } catch (error) {
        setError(error as Error | boolean)
      }

      if(checkFileResult[fileName]) {
        timerRef.current.set(fileName, delayLoading(setLoading, false))
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
    singleStatus,
  }
}

export default useSingleUpload