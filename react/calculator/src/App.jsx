import { useState } from 'react';
import * as math from 'mathjs';
import './App.css';

function App() {
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    try {
      setAnswer(math.evaluate(expression));
    } catch (error) {
      setAnswer('Invalid expression');
    }
  };

  return (
    <>
      <label>
        Enter your expression:{' '}
        <input
          type='text'
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
        />
      </label>{' '}
      <button onClick={handleSubmit}>=</button>
      <div>Answer = {answer}</div>
    </>
  );
}

export default App;
