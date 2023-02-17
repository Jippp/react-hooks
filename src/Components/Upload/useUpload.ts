import { useState, useRef } from 'react'

import { usePersistFn } from 'ahooks'
import { isFunction } from 'lodash'

import useImmer from '@/hooks/useImmer'

import useCreateRequest from './useCreateRequest'
import { UploadRequestProps, RequsetProps } from './types'
import { LOADINGMAXTIME, CHUNKSIZE } from './config'

const useUpload = ({ url, path, files }: UploadRequestProps) => {
  const [allLoading, setAllLoading] = useState(false)
  const [singleLoading, updateSingleLoading] = useImmer<Record<string, boolean>>({})
  const singleTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const [requestList, setRequestList] = useState<[]>([])

  const request = useCreateRequest({ url })

  const postRequset = usePersistFn(({
    path, formData, onStart, onSuccess, onError
  }: RequsetProps) => {
    isFunction(onStart) && onStart(true)
    request.post(path, formData).then(onSuccess).catch(onError)
  })

  // 分包上传
  // 1. 等待所有分包请求发送完成 再发送一个合并请求
  // 2. loading状态的管理，需要借助一个额外的请求队列来实现
  const spliceFile = usePersistFn((files) => {
    if(files && files.length) {
      for(let i = 0; i < files.length; i++) {
        const file = files[i]
        if(file.size > CHUNKSIZE) {
          const formData = new FormData()
          formData.set(`${file.name}_${i}`, file.slice(i * CHUNKSIZE, (i + 1) * CHUNKSIZE))
          postRequset({
            path,
            formData
          })
        }
      }
    }
  })

  // 单/多文件上传
  const uploadAll = usePersistFn(() => {
    if(files && files.length) {
      const formData = new FormData()
      for(let i = 0; i < files.length; i++) {
        formData.set(files[i].name, files[i])
      }
      postRequset({ 
        path, 
        formData, 
        onStart: () => {
          setAllLoading(true)
        },
        onSuccess: () => {
          setAllLoading(false)
        },
        onError: () => {
          setAllLoading(false)
        } 
      })
    }
  })

  const singleUpload = usePersistFn((file) => {
    const formData = new FormData()
    formData.set(file.name, file)
    postRequset({ 
      path, 
      formData,
      onStart: () => {
        if(singleTimerRef.current.get(file.name)) {
          clearTimeout(singleTimerRef.current.get(file.name))
        }
        updateSingleLoading(d => {
          d[file.name] = true
        })
      },
      onSuccess: () => {
        singleTimerRef.current.set(file.name, setTimeout(() => {
          updateSingleLoading(d => {
            d[file.name] = false
          })
        }, LOADINGMAXTIME))
      },
      onError: () => {
        updateSingleLoading(d => {
          d[file.name] = false
        })
      }
    })
  })

  return { uploadAll, singleUpload, singleLoading, allLoading }
}

export default useUpload