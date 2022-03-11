import { createContext, useContext } from 'react'
import useImmer from './../useImmer'

const useCreateCtx = (initialCtx = {}) => {

  // 默认的context中的值
  const ctxValue = createContext({
    state: '',
    update: () => {}
  })

  const Provider = (props) => {
    // 配合useImmer来管理context可以达到更好的更新效果
    const [state, update] = useImmer(initialCtx)
    return <ctxValue.Provider value={{ state, update }} { ...props } />
  }

  const useCtx = () => {
    // 可以配合useContext而不需要在子组件中包裹Consumer来消费Provider的value
    return useContext(ctxValue)
  }

  return [useCtx, Provider]
}

export default useCreateCtx