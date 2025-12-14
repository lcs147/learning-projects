import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Inputs({
  props: { min, setMin, max, setMax, limit, setLimit, handleClick },
}) {
  return (
    <>
      <div>
        <label>
          min length:{' '}
          <input
            type='text'
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </label>{' '}
        <label>
          max length:{' '}
          <input
            type='text'
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </label>{' '}
        <label>
          limit:{' '}
          <input
            type='text'
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </label>
      </div>
      <div>
        <button onClick={handleClick}>Get random quotes</button>
      </div>
    </>
  );
}

function Quotes({ isLoading, error, data }) {
  if (isLoading) {
    return <div></div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <ul>
        {data.map((cur, id) => (
          <li key={id}>
            {cur.content} - {cur.author}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(50);
  const [limit, setLimit] = useState(1);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    try {
      const url = `https://api.quotable.io/quotes/random?minLength=${min}&maxLength=${max}&limit=${limit}`;
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Inputs
        props={{ min, setMin, max, setMax, limit, setLimit, handleClick }}
      />
      <Quotes isLoading={isLoading} error={error} data={data} />
    </>
  );
}

export default App;
