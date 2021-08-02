import { useLayoutEffect, useState } from 'react'

export const useSize = (node) => {
  const [size, setSize] = useState({})

  
  useLayoutEffect(() => {
    // 判断node 还是 ref
    const el = 'current' in node ? node?.current : node
    const ro = new ResizeObserver(entries => {
      setSize({
        width: entries[0]?.target?.clientWidth,
        height: entries[0]?.target?.clientHeight,
      })
    })

    ro.observe(el)

    return () => ro.disconnect()
  }, [node])

  return size
}