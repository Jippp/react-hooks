import { FC, Fragment, useRef } from 'react'
import { Provider, useDispatch } from './context'
// import { Provider, useCtx } from './context'

import Son from './son'
import Daughter from './daughter'

const Content: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const daughterRef = useRef<HTMLInputElement>(null)
  const update = useDispatch()
  // const { update } = useCtx()

  return (
    <Fragment>
      <input 
        ref={inputRef}
        type="text" 
        onChange={() => {
          update(d => {
            d.sonName = inputRef.current ? inputRef.current.value : ''
          })
        }} 
        placeholder='输入修改sonname'
      />
      <Son />

      <hr />
      
      <input 
        ref={daughterRef}
        type="text" 
        onChange={(e) => {
          update(d => {
            d.daughterName = daughterRef.current ? daughterRef.current.value : ''
          })
        }} 
        placeholder='输入修改daughtername'
      />
      <Daughter />
    </Fragment>
  )
}

const MiniStore: FC = () => {
  return (
    <Provider>
      <Content />
    </Provider>
  )
}

export default MiniStore