import { FC } from 'react'
import Upload from '@/Components/Upload'

import './style.less'

const UploadDemo: FC<any> = () => {
  return (
    <div className="demo-container">
      <Upload
        url='http://10.17.223.232:8081'
      />
    </div>
  )
}

export default UploadDemo