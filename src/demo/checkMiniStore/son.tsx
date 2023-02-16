import { useSelector } from './context'
// import { useCtx } from './context'

const Son = () => {
  console.log('son render!')
  const sonName = useSelector(state => state.sonName)
  // const { state: { sonName } } = useCtx()

  return (
    <>
      Son com
      <h2>this is name: {sonName}</h2>
      {/* <GrandSon /> */}
    </>
  )
}

export default Son