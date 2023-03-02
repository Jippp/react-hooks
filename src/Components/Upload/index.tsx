import { FC, useRef, useState, useEffect, useMemo } from 'react'
import { usePersistFn } from 'ahooks'

import useImmer from '@/hooks/useImmer'
import useUpload from './hooks/useUpload'
import { UPLOADFILESPATH } from './config'
import { UploadProps, UploadRequestProps } from './types'
import Loading from './components/loading'
import Preview from './components/preview'

import './style.less'

const defaultUploadReqProps: UploadRequestProps = {
  url: '',
  path: UPLOADFILESPATH,
  files: null
}

const Upload:FC<UploadProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileList | null>(null)

  const [uploadReqProps, updateUploadReqProps] = useImmer(defaultUploadReqProps)

  const { singleUpload, singleAbort, singleStatus, uploadAll, allLoading } = useUpload(uploadReqProps)

  // body拖拽阻止默认事件 防止打开
  useEffect(() => {
    const body = document.body
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
    }
    body.addEventListener('drop', handleDrop)
    return () => {
      if(body) body.removeEventListener('drop', handleDrop)
    }
  }, [])

  useEffect(() => {
    updateUploadReqProps(d => {
      d.files = files
    })
  }, [files, updateUploadReqProps])
  
  useEffect(() => {
    updateUploadReqProps(d => {
      d.url = url
    })
  }, [url, updateUploadReqProps])
  
  const onInputChange = usePersistFn(() => {
    if(inputRef.current) {
      setFiles(inputRef.current.files)
    }
  })

  const onClick = usePersistFn(() => {
    if(inputRef.current) {
      inputRef.current.click()
    }
  })

  const onDrop = usePersistFn((e) => {
    e.preventDefault()
    setFiles(e.dataTransfer.files)
  })

  const moreFile = useMemo(() => files && files.length > 1, [files])

  console.log('%caa', 'color: red; font-size: 20px', singleStatus);

  return (
    <div className="jx-upload-wrapper">
      <div 
        className='jx-upload' 
        onClick={onClick}
        ref={containerRef}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onDragLeave={e => e.preventDefault()}
      >
        <input type="file" multiple className='no-display' ref={inputRef} onChange={onInputChange} />
        <button className="jx-upload-button jx-upload-choose-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"></path>
          </svg>
          <span>选择文件</span>
        </button>
      </div>
      {
        moreFile ? (
          <div
            className='jx-upload-all jx-upload'
            onClick={uploadAll}
          >
            <button className='jx-upload-button'>上传文件</button>
          </div>
        ) : null
      }
      {
        moreFile && allLoading ? <Loading theme='dark' /> : null
      }
      <div className="jx-upload-preview">
        {
          files && files.length ? (
            Array.from(files).map((file, idx) => (
              <Preview 
                key={idx}
                file={file}
                loading={singleStatus[file.name] ? singleStatus[file.name].loading : false}
                error={singleStatus[file.name] ? singleStatus[file.name].error : false}
                onUpload={singleUpload}
                onAbort={singleAbort}
              />
            ))
          ) : '暂无待上传图片'
        }
      </div>
    </div>
  )
}

export default Upload
