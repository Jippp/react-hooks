import { useState, useEffect } from 'react'

import { usePersistFn } from 'ahooks'

import { UploadRequestProps } from '../types'
import useSingleUpload from './useSingleUpload'

const useUpload = ({ url, path, files }: UploadRequestProps) => {
  const [allLoading, setAllLoading] = useState(false)

  const { singleAbort, singleUpload, singleLoading } = useSingleUpload({ url, path })

  useEffect(() => {
    setAllLoading(Object.values(singleLoading).some(item => item))
  }, [singleLoading])

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
    singleLoading, 
    allLoading 
  }
}

export default useUpload