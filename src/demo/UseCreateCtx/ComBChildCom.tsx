import { ChangeEvent, useCallback } from 'react'
import { useCtx } from './provider'

// ComB组件的子组件
const ComBChildCom = () => {

  // 通过useCreateCtx在顶部获取状态
  // 并不会使中间组件(ComB)重新渲染
  const { 
    state: { info },
    update,
  } = useCtx()

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value
    update(d => {
      d.info = message
    })
  }, [update])

  console.log('ComBChildCom render')

  return (
    <>
      <div>ComB组件的子组件共享ctx中的info信息： { info }</div>
      <input type="text" defaultValue='更改info信息' onChange={ handleChange } />
    </>
  )
}

export default ComBChildCom