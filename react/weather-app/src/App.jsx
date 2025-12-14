import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function Input({ cityName, setCityName, setData, setError }) {
  const handleClick = async () => {
    try {
      const { data } = await axios.get(
        `https://api.weatherapi.com/v1/current.json?q=${cityName}&key=${
          import.meta.env.VITE_API_KEY
        }`
      );
      setData(data);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div className='input-container'>
      <label htmlFor='cityInput'>Enter your city's name:</label>
      <input
        id='cityInput'
        type='text'
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
      />
      <button onClick={handleClick}>Go</button>
    </div>
  );
}

function Infos({ data, error }) {
  if (!data && !error) return null;
  if (error) return <div className='error'>Error: {error.message}</div>;

  return (
    <div className='info-container'>
      <div>
        <b>Location:</b> {data.location.name}, {data.location.region},{' '}
        {data.location.country}
      </div>
      <div>
        <b>Temperature:</b> {data.current.temp_c}°C (Feels like{' '}
        {data.current.feelslike_c}°C)
      </div>
      <div>
        <b>Pressure:</b> {data.current.pressure_mb} mb
        <b> | Precipitation:</b> {data.current.precip_mm} mm
        <b> | Humidity:</b> {data.current.humidity}%
      </div>
      <div>
        <b>Last updated:</b> {data.current.last_updated}
      </div>
    </div>
  );
}

function App() {
  const [cityName, setCityName] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className='app-container'>
      <h1>Weather App</h1>
      <Input
        cityName={cityName}
        setCityName={setCityName}
        setData={setData}
        setError={setError}
      />
      <Infos data={data} error={error} />
    </div>
  );
}

export default App;
