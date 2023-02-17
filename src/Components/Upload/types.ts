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
  onStart?: Function,
  onSuccess?: (data: any) => void,
  onError?: (err: Error | boolean) => void
}