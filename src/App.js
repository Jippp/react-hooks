// import UseSize from './demo/UseSize'
// import ImmerDemo from './demo/UseImmer';
// import CreateCtxDemo from './demo/UseCreateCtx';
import MiniStore from './demo/checkMiniStore';
// import VirtualList from './Components/VirtualList'
// import SlideCard from './Components/slideCard'

function App() {
  return (
    <div className="App">
      {/* useSize hook demo */}
      {/* <UseSize /> */}
      {/* <ImmerDemo /> */}
      {/* <CreateCtxDemo /> */}
      <MiniStore />

      {/* 虚拟列表展示 */}
      {/* <VirtualList listData={ Array.from(new Array(1000), (_, i) => i + 1) } /> */}
      {/* <SlideCard /> */}
    </div>
  );
}

export default App;
