import { createContext, useContext, useEffect, useRef, useMemo, useState } from 'react'
import { isEqual } from 'lodash'
import { usePersistFn } from 'ahooks'
import Pubsub from 'pubsub-js'
import useImmer from '../../hooks/useImmer'

const PUBSUBPUBLISH = Symbol()

const useForceUpdate = () => {
  const [, setState] = useState(false);
  return usePersistFn(() => setState((val) => !val));
};

const createStore = (initialCtx = {}) => {
  const ctx = createContext({
    getState: () => initialCtx,
    dispatch: () => {}
  })

  function Provider({children}) {
    const [state, update] = useImmer(initialCtx)

    useEffect(() => {
      Pubsub.publish(PUBSUBPUBLISH)
    }, [state])

    const getState = usePersistFn(() => state);

    const store = useMemo(() => ({
      getState,
      dispatch: update
    }), [getState, update])

    return <ctx.Provider value={store}>{ children }</ctx.Provider>
  }

  const useSelector = (selector) => {
    const store = useContext(ctx)
    const forceUpdate = useForceUpdate();

    const preSelector = useRef(selector)
    const preState = useRef(selector(store.getState()))

    preSelector.current = selector
    preState.current = selector(store.getState())

    useEffect(() => {
      const checkState = () => {
        const nextState = preSelector.current(store.getState())
        if(!isEqual(nextState, preState.current)) {
          // 更新
          forceUpdate()
        }
      }
      const token = Pubsub.subscribe(PUBSUBPUBLISH, checkState)
      return () => {
        Pubsub.unsubscribe(token);
      };
    }, [store, forceUpdate])

    return preState.current
  }

  const useDispatch = () => {
    const store = useContext(ctx)
    return store.dispatch
  }

  return { Provider, useSelector, useDispatch }
}

export default createStore