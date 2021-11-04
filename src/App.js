import UseSize from './demo/UseSize'
import VirtualList from './Components/VirtualList'

function App() {
  return (
    <div className="App">
      <UseSize />
      <VirtualList listData={ Array.from(new Array(1000), (_, i) => i + 1) } />
    </div>
  );
}

export default App;
