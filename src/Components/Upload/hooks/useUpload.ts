import { useState } from 'react'

import { usePersistFn } from 'ahooks'
import SparkMD5 from 'spark-md5'

import useImmer from '@/hooks/useImmer'

import { UploadRequestProps, ChunkInfoProps, ChunkInfoEnum } from '../types'
import { MERGEFILESPATH, CHUNKSIZE, ALLFILENAME } from '../config'
import useRequest from './useRequest'

const useUpload = ({ url, path, files }: UploadRequestProps) => {
  const [allLoading, setAllLoading] = useState(false)
  const [singleLoading, updateSingleLoading] = useImmer<Record<string, boolean>>({})
  // 请求列表 中断请求时使用
  const [requestList, updateRequestList] = useImmer<Record<string, Promise<unknown> | null>>({})

  const { post } = useRequest({ url })

  // TODO: 待完善 单/多文件上传，统一上传
  const uploadAll = usePersistFn(() => {
    if(files && files.length) {
      const formData = new FormData()
      for(let i = 0; i < files.length; i++) {
        formData.set(files[i].name, files[i])
      }
      post({
        path,
        formData,
        fileName: ALLFILENAME,
        setLoading: setAllLoading,
      })
    }
  })

  // 单文件上传
  const commonUpload = usePersistFn((
    file: File | Blob, 
    chunkName?: string, 
    chunkInfo?: ChunkInfoProps
  ) => {
    const formData = new FormData()
    const resultFileName = chunkName || file.name
    formData.set(resultFileName, file)
    // 大文件部分包上传，formData添加额外的信息
    if(chunkInfo) {
      for(const key in chunkInfo) {
        formData.set(key, chunkInfo[key as keyof ChunkInfoProps])
      }
    }
    const setLoading = (status: boolean) => {
      updateSingleLoading(d => {
        d[resultFileName] = status
      })
    }
    const removeRequest = () => {
      updateRequestList(d => {
        d[resultFileName] = null
      })
    }
    const promise = post({
      path,
      formData,
      fileName: resultFileName,
      setLoading,
      onSuccess: removeRequest,
      onError: removeRequest,
    })
    updateRequestList(d => {
      d[resultFileName] = promise
    })
  })

  const getFileHash = usePersistFn((fileList) => {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer();
      const fileLen = fileList.length;

      function hashNext(count: number) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(fileList[count]);
        reader.onload = (e: ProgressEvent<FileReader>) => {
          count++;
          spark.append((e.target as FileReader).result as ArrayBuffer);
          if (count === fileLen) {
            resolve(spark.end())
          } else {
            hashNext(count);
          }
        };
        reader.onerror = () => {
          reject('hash error!')
        }
      }
      hashNext(0);

    }) as Promise<string>
  })
  const sliceFile = usePersistFn((file) => {
    let chunkIndex = 0
    const chunkList: Blob[] = []

    function spliceFile() {
      chunkList.push(file.slice(chunkIndex * CHUNKSIZE, (chunkIndex + 1) * CHUNKSIZE))
      if(++chunkIndex * CHUNKSIZE < file.size) {
        spliceFile()
      }
    }
    spliceFile()
    return {
      chunkCount: chunkIndex, chunkList
    }
  })

  // 大文件上传需要分包
  // TODO loading没有处理
  const bigFileUpload = usePersistFn((chunkList: (File | Blob)[], fileName, fileHash) => {
    chunkList.forEach((chunk, chunkIndex) => {
      commonUpload(chunk, `${fileName}_${chunkIndex}`, {
        [ChunkInfoEnum.chunkIndex]: String(chunkIndex),
        [ChunkInfoEnum.fileName]: fileName,
        [ChunkInfoEnum.fileHash]: fileHash
      })
    })
  })

  const singleUpload = usePersistFn(async (file: File) => {
    if(file.size > CHUNKSIZE) {
      const { chunkCount, chunkList } = sliceFile(file)
      const hash = await getFileHash(chunkList)

      bigFileUpload(chunkList, file.name, hash)
      // 发送一个合并请求
      Promise.all(Object.values(requestList)).then(() => {
        const mergeFormData = new FormData()
        mergeFormData.set(ChunkInfoEnum.chunkCount, String(chunkCount))
        mergeFormData.set(ChunkInfoEnum.fileName, file.name)
        mergeFormData.set(ChunkInfoEnum.fileHash, hash)
        post({
          path: MERGEFILESPATH, formData: mergeFormData
        })
      })
    }else {
      commonUpload(file)
    }
  })

  return { uploadAll, singleUpload, singleLoading, allLoading }
}

export default useUpload