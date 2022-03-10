import { useCallback } from 'react'
import { useCtx, Provider } from './provider'

// 子组件
const ComA = () => {

  const { 
    state: { message },
    update
   } = useCtx()

  const handleChange = useCallback((e) => {
    const target = e.target.value
    update(d => {
      d.message = target
    })
  }, [update])

  return (
    <>
      <div>{ message }</div>
      <input type="text" onChange={ handleChange } />
    </>
  )
}


// Provider包裹的都可以共享状态，并且不会造成不必要的渲染
const CreateCtxDemo = () => {
  return (
    <Provider>
      <ComA />
    </Provider>
  ) 
}

export default CreateCtxDemo