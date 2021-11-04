import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import './index.css'

// 子列表高度，固定为100
const ITEMSIZE = 100

const VirtualList = ({ listData }) => {
  // 需要展示的区域数据
  const [showList, setShowList] = useState([])
  const [beforeList, setBeforeList] = useState([])
  const [afterList, setAfterList] = useState([])
  // 展示区域偏移量
  const [wrapTranslate, setWrapTranslate] = useState()
  const listWrapRef = useRef()
  const listScrollRef = useRef()
  const itemWrapRef = useRef()

  const handleScroll = useCallback((e) => {
    // 实际展示的条数
    const actualShowCount = ~~(listWrapRef.current.clientHeight / ITEMSIZE)
    const top = e.target ? e.target.scrollTop : 0
    const showStartIndex = ~~(top / ITEMSIZE)
    const showEndIndex = showStartIndex + actualShowCount
    const len = listData.length

    // 偏移量
    setWrapTranslate(top - top % ITEMSIZE)

    setBeforeList([listData[showStartIndex]])
    setAfterList(showEndIndex < len ? [listData[showEndIndex]] : [])
    // 实际展示的列表
    setShowList(listData.slice(showStartIndex + 1, showEndIndex))
  }, [setShowList, listData])

  // 注册监听scroll的事件函数
  useEffect(() => {
    const dom = listWrapRef.current
    handleScroll(0)
    dom.addEventListener('scroll', handleScroll, false)
    return () => dom.removeEventListener('scroll', handleScroll, false)
  }, [handleScroll])

  // 设置滚动条高度
  /** 浏览器对滚动条的极限高度作了一个限制 33554400 */
  const listScrollHeight = useMemo(() => {
    return ITEMSIZE * listData.length
  }, [listData])

  return (
    <div className={'ItemContainer'} ref={listWrapRef}>
      <div 
        className="item-scroll"
        ref={listScrollRef} 
        style={{ height: listScrollHeight + 'px' }}
      ></div>
      <div 
        className={'item-wrap'}
        ref={itemWrapRef}
        style={{ transform: `translateY(${wrapTranslate}px)` }}
      >
        {
          beforeList.map((item, i) => <div className="item" key={i}>{item}</div>)
        }
        {showList.map((item, i) => <div className="item" key={i}>{item}</div>)}
        {
          afterList.length ? afterList.map((item, i) => <div className="item" key={i}>{item}</div>) : null
        }
      </div>
    </div>
  )
}

export default VirtualList
// import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
// import './index.css'

// // 子列表高度，固定为100
// const ITEMSIZE = 100

// const VirtualList = ({ listData }) => {
//   return (
//     <div className={'ItemContainer'}>
//       <div 
//         className="item-scroll"
//       ></div>
//       <div 
//         className={'item-wrap'}
//       >
//         {listData.map((item, i) => <div className="item" key={i}>{item}</div>)}
//       </div>
//     </div>
//   )
// }

// export default VirtualList