import { Provider } from './provider'
import ComA from './ComA'
import ComB from './ComB'

// Provider包裹的都可以共享状态，并且不会造成不必要的渲染
const CreateCtxDemo = () => {
  return (
    <Provider>
      <ComA />
      <ComB />
    </Provider>
  ) 
}

export default CreateCtxDemo