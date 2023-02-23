import { useState } from 'react'

import { usePersistFn } from 'ahooks'

import { UploadRequestProps } from '../types'
import {  ALLFILENAME } from '../config'
import useRequest from './useRequest'
import useSingleUpload from './useSingleUpload'

const useUpload = ({ url, path, files }: UploadRequestProps) => {
  const [allLoading, setAllLoading] = useState(false)

  const { singleAbort, singleUpload, singleLoading } = useSingleUpload({ url, path })

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

  return { 
    uploadAll, 
    singleUpload, 
    singleAbort,
    singleLoading, 
    allLoading 
  }
}

export default useUpload