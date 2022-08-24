import { useSelector } from './context' 
// import { useCtx } from './context'

const Daughter = () => {
  console.log('daughter render!')
  const daughterName = useSelector(state => state.daughterName)
  // const { state: { daughterName } } = useCtx()

  return (
    <>
      Daughter com!
      <h2>this is name: {daughterName}</h2>
    </>
  )
}

export default Daughter