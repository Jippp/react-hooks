import axios from 'axios'

import { CommonRequestProps } from './types'

const useCreateRequest = ({ url }: CommonRequestProps) => {
  const request = axios.create({
    baseURL: url,
    timeout: 60000,
  })
  return request
}
export default useCreateRequest