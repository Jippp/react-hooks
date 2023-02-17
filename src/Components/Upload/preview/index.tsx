import { FC, useMemo } from 'react'

import { usePersistFn } from 'ahooks';

import Loading from '@/Components/Upload/loading'

import styled from 'styled-components'
import './style.less'

interface PreviewProps {
  file: File;
  loading: boolean;
  onUpload: Function;
}

const Preview: FC<PreviewProps> = ({ file, loading, onUpload }) => {

  const blobUrl = useMemo(() => {
    const blob = new Blob([file])
    return URL.createObjectURL(blob)
  }, [file])

  const onLoad = usePersistFn(() => {
    URL.revokeObjectURL(blobUrl)
  })

  const onClick = usePersistFn(() => {
    if(!loading) {
      onUpload(file)
    }
  })

  return (
    <PreviewContainer src={blobUrl} className="jx-preview" onLoad={onLoad}>
      <div className="jx-preview-img"></div>
      <div className="jx-preview-info">
        <button className="jx-preview-button">预览</button>
        {
          loading ? <Loading /> : (
            <button 
              className="jx-preview-button"
              onClick={onClick}
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

const PreviewContainer = styled.div<{ src: string }>`
  .jx-preview-img {
    background: url(${({ src }) => src}) no-repeat 100% 100% / cover;
  }
`