// 只封装请求的hook，并不做loading等状态处理
import axios from 'axios'
import { usePersistFn } from 'ahooks'
import { isFunction } from 'lodash'

import { CommonRequestProps, RequsetProps } from '../types'

const useCreateRequest = ({ url }: CommonRequestProps) => {
  const request = axios.create({
    baseURL: url,
    timeout: 10000,
  })

  const postRequset = usePersistFn(({
    path, formData, config, onStart, onSuccess, onError
  }: RequsetProps) => {
    isFunction(onStart) && onStart(true)
    const promise = new Promise((resolve, reject) => {
      request.post(path, formData, config).then((data) => {
        isFunction(onSuccess) && onSuccess(data);
        resolve(data)
      }, () => {
        reject()
      }).catch(onError)
    })
    return promise
  })

  return { request, postRequset }
}
export default useCreateRequest