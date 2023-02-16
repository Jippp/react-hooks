import { createContext, useContext } from 'react'
import { Draft } from 'immer'
import useImmer from '@/hooks/useImmer'

function createCtx<T extends {}>(initialCtx: T) {
  // 默认的context中的值
  const ctxValue = createContext({
    state: initialCtx,
    update: (() => {}) as (updater: (prevState: Draft<T>) => void | T) => void
  })

  const Provider = ({ children }: { children: React.ReactNode }) => {
    // 配合useImmer来管理context可以达到更好的更新效果
    const [state, update] = useImmer(initialCtx)
    return <ctxValue.Provider value={{ state, update }}>{children}</ctxValue.Provider>
  }

  const useCtx = () => {
    // 可以配合useContext而不需要在子组件中包裹Consumer来消费Provider的value
    return useContext(ctxValue)
  }

  return {useCtx, Provider} as const
}

export default createCtx