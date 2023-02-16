import { useState } from 'react'
import { usePersistFn } from 'ahooks'
import produce, { Draft } from 'immer'

function useImmer<T>(initialState: T) {
  const [state, setState] = useState(initialState)

  const updateState = usePersistFn((updater: (prevState: Draft<T>) => void | T) => {
    setState(produce(updater) as any)
  })

  return [state, updateState] as const
}

export default useImmer