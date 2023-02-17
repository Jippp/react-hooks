import { FC } from 'react'

import './style.less'

const Loading: FC<any> = () => {
  return (
    <div className="jx-loading">
      <div className="jx-loading-l1 jx-loading-loader"></div>
      <div className="jx-loading-l2 jx-loading-loader"></div>
    </div>
  )
}

export default Loading