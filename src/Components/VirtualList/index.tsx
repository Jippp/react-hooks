import { FC, useState, useRef, useMemo, useEffect, useCallback } from 'react'
import './index.css'

// 子列表高度，固定为100
const ITEMSIZE = 100

type ListDataType = number[]

interface Props {
  listData: ListDataType
}

const VirtualList: FC<Props> = ({ listData }) => {
  // 需要展示的区域数据
  const [showList, setShowList] = useState<ListDataType>([])
  const [beforeList, setBeforeList] = useState<ListDataType>([])
  const [afterList, setAfterList] = useState<ListDataType>([])
  // 展示区域偏移量
  const [wrapTranslate, setWrapTranslate] = useState<number>(0)
  const listWrapRef = useRef<HTMLDivElement>(null)
  const listScrollRef = useRef<HTMLDivElement>(null)
  const itemWrapRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback((e: HTMLElementEventMap['scroll'] | number) => {
    if(listWrapRef.current) {
      // 实际展示的条数
      const actualShowCount = ~~(listWrapRef.current.clientHeight / ITEMSIZE)
      const top = typeof e === 'number' ? e : e.target ? (e.target as HTMLElement).scrollTop : 0
      const showStartIndex = ~~(top / ITEMSIZE)
      const showEndIndex = showStartIndex + actualShowCount
      const len = listData.length
  
      // 偏移量
      setWrapTranslate(top - top % ITEMSIZE)
  
      setBeforeList([listData[showStartIndex]])
      setAfterList(showEndIndex < len ? [listData[showEndIndex]] : [])
      // 实际展示的列表
      setShowList(listData.slice(showStartIndex + 1, showEndIndex))
    }
  }, [setShowList, listData])

  // 注册监听scroll的事件函数
  useEffect(() => {
    const dom = listWrapRef.current
    if(dom) {
      handleScroll(0)
      dom.addEventListener('scroll', handleScroll, false)
    }
    return () => {
      dom && dom.removeEventListener('scroll', handleScroll, false)
    }
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
