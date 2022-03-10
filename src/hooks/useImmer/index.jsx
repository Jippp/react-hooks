import { useState } from 'react'
import { usePersistFn } from 'ahooks'
import produce from 'immer'

const useImmer = (initialState) => {
  const [state, setState] = useState(initialState)

  const updateState = usePersistFn((updater) => {
    setState(produce(updater))
  })

  return [state, updateState]
}

export default useImmer