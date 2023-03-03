/**
 * 统一上传的处理
 */
import { useState, useEffect } from 'react'

import { usePersistFn } from 'ahooks'

import { UploadRequestProps } from '../types'
import useSingleUpload from './useSingleUpload'

const useUpload = ({ url, path, files }: UploadRequestProps) => {
  const [allLoading, setAllLoading] = useState(false)

  const { singleAbort, singleUpload, singleStatus } = useSingleUpload({ url, path })

  useEffect(() => {
    setAllLoading(Object.values(singleStatus).some(item => item.loading))
  }, [singleStatus])

  const uploadAll = usePersistFn(() => {
    if(files && files.length) {
      for(let i = 0; i < files.length; i++) {
        singleUpload(files[i])
      }
    }
  })

  return { 
    uploadAll, 
    singleUpload, 
    singleAbort,
    singleStatus, 
    allLoading 
  }
}

export default useUpload