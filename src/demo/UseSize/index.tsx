import { useRef } from "react"
import { useSize } from '../../hooks/useSize'

const UseSize = () => {
  const ref = useRef<HTMLDivElement>(null)
  const size = useSize(ref)
  return (
    <div>
      <div ref={ref}>this is content</div>
      <div>width change: {size.width}</div>
    </div>
  )
}

export default UseSize