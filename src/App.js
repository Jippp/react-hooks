// import UseSize from './demo/UseSize'
import ImmerDemo from './demo/UseImmer';
// import VirtualList from './Components/VirtualList'

function App() {
  return (
    <div className="App">
      {/* useSize hook demo */}
      {/* <UseSize /> */}
      <ImmerDemo />

      {/* 虚拟列表展示 */}
      {/* <VirtualList listData={ Array.from(new Array(1000), (_, i) => i + 1) } /> */}
    </div>
  );
}

export default App;
