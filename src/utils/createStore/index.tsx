import { createContext, useContext, useEffect, useRef, useMemo, useState } from 'react'
import { isEqual } from 'lodash'
import { usePersistFn } from 'ahooks'
import { Draft } from 'immer'
import Pubsub from 'pubsub-js'
import useImmer from '../../hooks/useImmer'

// 强制刷新
const useForceUpdate = () => {
  const [, setState] = useState(false);
  return usePersistFn(() => setState((val) => !val));
};

function createStore<T extends {}>(initialCtx: T) {
  // 标识发布订阅
  const PUBSUBPUBLISH = Symbol()

  type Dispatch = (updater: (prevState: Draft<T>) => void | T) => void

  const defaultDispatch:Dispatch = () => {}
  const ctx = createContext({
    getState: () => initialCtx,
    dispatch: defaultDispatch
  })

  const Provider =({ children }: { children: React.ReactNode }) => {
    const [state, update] = useImmer(initialCtx)

    useEffect(() => {
      Pubsub.publish(PUBSUBPUBLISH)
    }, [state])

    const getState = usePersistFn(() => state);

    const store = useMemo(() => ({
      getState,
      dispatch: update
    }), [getState, update])

    return <ctx.Provider value={store}>{children}</ctx.Provider>
  }

  const useSelector = (selector: (state: T) => typeof state[keyof typeof state]) => {
    const store = useContext(ctx)
    const forceUpdate = useForceUpdate();

    const preSelector = useRef(selector)
    const preState = useRef(selector(store.getState()))

    preSelector.current = selector
    preState.current = selector(store.getState())

    useEffect(() => {
      const checkState = () => {
        const nextState = preSelector.current(store.getState())
        // 更加细粒度话的监听变化，而不是createCtx那样所有用到的都会变化
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
    return useContext(ctx).dispatch
  }

  return { Provider, useSelector, useDispatch }
}

export default createStore