import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const decreaseHandler = () => {
    setCount(count - 1);
  };

  const increaseHandler = () => {
    setCount(count + 1);
  };

  return (
    <>
      <h1>{count}</h1>
      <button onClick={decreaseHandler}>Decrease</button>
      <button onClick={increaseHandler}>Increase</button>
    </>
  );
}

export default App;
