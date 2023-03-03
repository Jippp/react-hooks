import ComBChildCom from "./ComBChildCom"

// 子组件
const ComB = () => {
  console.log('ComB render')
  return (
    <div>
      ComB组件
      <br />
      <ComBChildCom />
    </div>
  )
}

export default ComB