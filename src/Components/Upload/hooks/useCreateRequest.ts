// 只封装请求的hook，并不做loading等状态处理
import axios from 'axios'
import { usePersistFn } from 'ahooks'
import { isFunction } from 'lodash'

import { CommonRequestProps, RequsetProps } from '../types'

const useCreateRequest = ({ url }: CommonRequestProps) => {
  const request = axios.create({
    baseURL: url,
    timeout: 100000,
  })

  const postRequset = usePersistFn(({
    path, formData, config, onStart, onSuccess, onError
  }: RequsetProps) => {
    isFunction(onStart) && onStart(true)
    return new Promise((resolve, reject) => {
      request.post(path, formData, config).then((data) => {
        isFunction(onSuccess) && onSuccess(data.data);
        resolve(data.data)
      }, () => {
        const err = new Error('reject error')
        isFunction(onError) && onError(err);
        reject(err)
      })
    })
  })

  return { request, postRequset }
}
export default useCreateRequest