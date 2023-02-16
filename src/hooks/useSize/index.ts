import { useLayoutEffect, useState } from 'react'

interface Size {
  width?: number,
  height?: number
}
export const useSize = (node: HTMLElement | React.RefObject<HTMLElement>) => {
  const [size, setSize] = useState<Size>({})

  useLayoutEffect(() => {
    if(node) {
      // 判断node 还是 ref
      const el = 'current' in node ? node.current : node
      const ro = new ResizeObserver(entries => {
        setSize({
          width: entries[0]?.target?.clientWidth,
          height: entries[0]?.target?.clientHeight,
        })
      })

      if(el) ro.observe(el)

      return () => ro.disconnect()
    }
  }, [node])

  return size
}