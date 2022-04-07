/**
 * 可左右滑动的组件，目前并不完善，需要后续支持
 */
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'

import { useSize } from '../../hooks/useSize'
import './index.css'

const ARROWWIDTH = 50
const ITEMWIDTH = 120
const ITEMSPLITWIDTH = 12

const SlideCard = ({
  // 一屏一屏还是一个一个
  type,
  // 父元素尺寸
  containerSize,
  itemSize,
  // 自定义左右按钮
  arrow,
  // 内容列表数组
  itemList
}) => {

  const contentRef = useRef(null)
  const containerRef = useRef(null)
  const [contentPosition, setContentPosition] = useState(0)
  const [leftShow, setLeftShow] = useState(false)
  const [rightShow, setRightShow] = useState(false)

  const { width: containerWidth } = useSize(containerRef)
  const { width: contentWidth } = useSize(contentRef)

  const onceScroll = useMemo(() => {
    const oneItemWidth = ITEMWIDTH + ITEMSPLITWIDTH
    return ~~(((containerWidth || 0) - ARROWWIDTH * 2) / oneItemWidth) * oneItemWidth
  }, [containerWidth])

  // 向左可以到达的最大距离
  const contentToLeftMaxLeft = useMemo(() => {
    return (containerWidth || 0) - (contentWidth || 0)
  }, [containerWidth, contentWidth])
  
  // 判断左右按钮显隐
  useEffect(() => {
    setLeftShow(contentPosition < 0)
    setRightShow(contentPosition > contentToLeftMaxLeft)
  }, [contentPosition, contentToLeftMaxLeft])

  // 如果需要每次切换滑动不同的距离，可以自定义规则
  const handleSlide = useCallback((type) => {
    if(type === 'left') {
      setContentPosition(d => {
        // d += 110
        d += onceScroll
        return Math.min(d, 0)
      })
    }
    if(type === 'right') {
      setContentPosition(d => {
        // d -= 110
        d -= onceScroll
        return Math.max(d, contentToLeftMaxLeft)
      })
    }
  }, [contentToLeftMaxLeft, onceScroll])

  return (
    <div className="container" ref={containerRef}>
      <div className="content" ref={contentRef} style={{ left: contentPosition + 'px' }}>
        <div className="item">1</div>
        <div className="item">2</div>
        <div className="item">3</div>
        <div className="item">4</div>
        <div className="item">5</div>
        <div className="item">6</div>
        <div className="item">7</div>
        <div className="item">8</div>
        <div className="item">9</div>
        <div className="item">10</div>
      </div>
      {
        leftShow ? <div className="left" onClick={() => handleSlide('left')}>&lt;</div> : null
      }
      {
        rightShow ? <div className="right" onClick={() => handleSlide('right')}>&gt;</div> : null
      }      
    </div>
  )
}

export default SlideCard