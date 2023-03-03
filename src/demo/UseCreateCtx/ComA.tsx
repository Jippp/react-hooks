import { FC, ChangeEvent, useCallback } from 'react'
import { useCtx } from './provider'

// 子组件
const ComA: FC = () => {

  const { 
    state: { message },
    update
   } = useCtx()

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target.value
    update(d => {
      d.message = target
    })
  }, [update])

  console.log('ComA render')

  return (
    <>
      <div>{ message }</div>
      <input type="text" onChange={ handleChange } />
    </>
  )
}

export default ComA