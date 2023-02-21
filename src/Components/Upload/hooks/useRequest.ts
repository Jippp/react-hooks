import { useRef } from 'react'

import { usePersistFn } from 'ahooks'
import { isFunction } from 'lodash'

import useCreateRequest from './useCreateRequest'
import { RequsetProps, CommonRequestProps } from '../types'
import { LOADINGMINTIME } from '../config'

const useRequest = ({ url }: CommonRequestProps) => {
  // 记录定时器id 后续清除
  const timerRef = useRef<Map<string, NodeJS.Timeout | null>>(new Map())

  const { postRequset } = useCreateRequest({ url })
  // 再封装一层，绑定状态
  const post = usePersistFn(({
    path, formData, fileName = '', setLoading, onStart, onSuccess, onError
  }: RequsetProps & {
    fileName?: string,
    setLoading?: (status: boolean) => void
  }) => {
    const hasSetLoading = isFunction(setLoading)
    return postRequset({ 
      path, 
      formData,
      onStart: () => {
        if(timerRef.current.get(fileName)) {
          clearTimeout(timerRef.current.get(fileName)!)
          timerRef.current.set(fileName, null)
        }
        hasSetLoading && setLoading(true)
        isFunction(onStart) && onStart()
      },
      onSuccess: (data) => {
        if(hasSetLoading) {
          timerRef.current.set(fileName, setTimeout(() => {
            setLoading(false)
          }, LOADINGMINTIME))
        }
        isFunction(onSuccess) && onSuccess(data)
      },
      onError: (err) => {
        hasSetLoading && setLoading(false)
        isFunction(onError) && onError(err)
      }
    })
  })

  return { post }
}

export default useRequest