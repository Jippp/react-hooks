// 只封装请求的hook，并不做loading等状态处理
import axios from 'axios'
import { usePersistFn } from 'ahooks'
import { isFunction } from 'lodash'

import { CommonRequestProps, RequsetProps } from '../types'

const useCreateRequest = ({ url }: CommonRequestProps) => {
  const request = axios.create({
    baseURL: url,
    timeout: 60000,
  })

  const postRequset = usePersistFn(({
    path, formData, onStart, onSuccess, onError
  }: RequsetProps) => {
    isFunction(onStart) && onStart(true)
    return request.post(path, formData).then(onSuccess).catch(onError)
  })

  return { request, postRequset }
}
export default useCreateRequest