import { FC, useMemo } from 'react'

import { usePersistFn } from 'ahooks';

import Loading from '@/Components/Upload/loading'

import styled from 'styled-components'
import './style.less'

interface PreviewProps {
  file: File;
  loading: boolean;
  onUpload: Function;
  onAbort: Function;
}

// 图片格式 用于预览判断
const imgExitsReg = new RegExp(/png|pneg|jpg|jpeg|webp/)

const Preview: FC<PreviewProps> = ({ file, loading, onUpload, onAbort }) => {

  const { blobUrl, fileExit } = useMemo(() => {
    return {
      blobUrl: URL.createObjectURL(file),
      fileExit: file.type
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
    if(loading) {
      onAbort(file.name)
    }
  })

  return (
    <PreviewContainer className="jx-preview" >
      <div className="jx-preview-img">
        {/* TODO 文件类型兼容 */}
        {
          imgExitsReg.test(fileExit) ? (
            <img src={blobUrl} alt={file.name} width="100%" height='100%' onLoad={onLoad}/>
          ) : (
            <video autoPlay width="100%" height='100%'>
              <source src={blobUrl} type={fileExit} onLoad={onLoad}/>
            </video>
          )
        }
        
      </div>
      <div className="jx-preview-info">
        <button className="jx-preview-button" onClick={onCancelClick}>{ loading ? '取消' : 'xx' }</button>
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

const PreviewContainer = styled.div`
`
/* .jx-preview-img {
  background: url(${({ src }) => src}) no-repeat 100% 100% / cover;
} */