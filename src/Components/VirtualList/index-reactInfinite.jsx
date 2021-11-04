import { useState, useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import './index.css'

const ReactInfinite = ({ listData }) => {
  const [list, setList] = useState(listData)

  const dataLength = useMemo(() => {
    return list.length
  }, [list])

  return (
    <InfiniteScroll
      dataLength={dataLength}
      next={() => setList(d => d.concat(Array.from(new Array(10000), (_, i) => d.length + i)))}
      hasMore={true}
    >
      {
        list.map((item, i) => <div className="item" key={i}>{item}</div>)
      }
    </InfiniteScroll>
  )
}

export default ReactInfinite