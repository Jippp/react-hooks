import { useState, useEffect, useCallback } from 'react'

const Usestate = () => {
  const [count, setCount] = useState(0)

  

  const changeCount = () => {
    setCount(count + 1)
  }


  const getCount = useCallback(() => {
    console.log(count)
  }, [count])

  useEffect(() => {
    getCount()
  }, [count, getCount])

  return (
    <div>
      <button onClick={changeCount}>点击count++</button>
      {count}
      <button onClick={getCount}>点击console count</button>
    </div>
  )
}

export default Usestate