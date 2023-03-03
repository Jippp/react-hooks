import { FC, useState, useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import './style.less'

interface Props {
  listData: number[]
}

const ReactInfinite: FC<Props> = ({ listData }) => {
  const [list, setList] = useState(listData)

  const dataLength = useMemo(() => {
    return list.length
  }, [list])

  return (
    <InfiniteScroll
      loader={<h4>Loading...</h4>}
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