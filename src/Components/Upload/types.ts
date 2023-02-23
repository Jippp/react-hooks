import { AxiosRequestConfig } from "axios";

export interface UploadProps {
  url: string,
}

export interface CommonRequestProps {
  url: string,
}

export interface UploadRequestProps {
  url: string,
  path: string,
  files: FileList | null
}

export interface RequsetProps {
  path: string,
  formData: FormData,
  config?: AxiosRequestConfig<FormData>,
  onStart?: Function,
  onSuccess?: (data: any) => void,
  onError?: (err: Error | boolean) => void
}

/** 中断请求使用，记录内容 文件名：中断方法 */
export type RequestListType = Record<string, AbortController | null>

export enum ChunkInfoEnum {
  fileName = 'fileName',
  chunkIndex = 'chunkIndex',
  chunkCount = 'chunkCount',
  fileHash = 'fileHash'
}

/** 分包上传的额外信息 */
export interface ChunkInfoProps {
  /** 文件名称 */
  [ChunkInfoEnum.fileName]: string;
  /** 包索引 */
  [ChunkInfoEnum.chunkIndex]: string;
  /** 文件hash */
  [ChunkInfoEnum.fileHash]: string;
}

/** 合并请求的额外信息 */
export interface MergeInfoProps {
  /** 包数量 */
  [ChunkInfoEnum.chunkCount]: string;
  /** 文件名称 */
  [ChunkInfoEnum.fileName]: string;
  /** 文件hash */
  [ChunkInfoEnum.fileHash]: string;
}