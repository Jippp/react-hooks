import { FC, useMemo } from 'react'

import { usePersistFn } from 'ahooks';

import Loading from '@/Components/Upload/components/loading'

import styled from 'styled-components'
import './style.less'

interface PreviewProps {
  file: File;
  loading: boolean;
  error: Error | boolean;
  onUpload: Function;
  onAbort: Function;
}

// 图片格式 用于预览判断
const imgExitsReg = new RegExp(/png|pneg|jpg|jpeg|webp/)
const videoExitReg = new RegExp(/mp4/)

const Preview: FC<PreviewProps> = ({ file, loading, error, onUpload, onAbort }) => {

  const { blobUrl, fileExit, fileName } = useMemo(() => {
    return {
      blobUrl: URL.createObjectURL(file),
      fileExit: file.type,
      fileName: file.name
    }
  }, [file])

  const onLoad = usePersistFn(() => {
    URL.revokeObjectURL(blobUrl)
  })

  const onUploadClick = usePersistFn(() => {
    if(!loading) {
      onUpload(file)
    }
  })

  const onCancelClick = usePersistFn(() => {
    onAbort(file.name)
  })

  const previewDom = useMemo(() => {
    return imgExitsReg.test(fileExit) ? (
      <img src={blobUrl} alt={fileName} width="100%" height='100%' onLoad={onLoad}/>
    ) : videoExitReg.test(fileExit) ? (
      <video autoPlay width="100%" height='100%'>
        <source src={blobUrl} type={fileExit} onLoad={onLoad}/>
      </video>
    ) : <div>{ fileName }</div>
  }, [fileExit, blobUrl, fileName, onLoad])

  return (
    <PreviewContainer className="jx-preview" uploading={loading}>
      <div className="jx-preview-img">
        { previewDom }
      </div>
      <div className="jx-preview-info">
        {
          loading || error ? (
            <button 
              className="jx-preview-button jx-preview-desc-buttom" 
              onClick={() => loading ? onCancelClick() : null}
            >
              { loading ? '取消' : error ? '错误' : '-' }
            </button>
          ) : null
        }
        {
          loading ? <Loading /> : (
            <button 
              className="jx-preview-button"
              onClick={onUploadClick}
            >
              上传
            </button>
          )
        }
      </div>
    </PreviewContainer>
  )
}

export default Preview

const PreviewContainer = styled.div<{ uploading: boolean }>`
  & .jx-preview-button.jx-preview-desc-buttom {
    cursor: ${({ uploading }) => uploading ? 'pointer' : 'default'};
  }
`
