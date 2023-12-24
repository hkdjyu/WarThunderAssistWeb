import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import Instrument from './Components/Instrument';

function App() {

  // fetch data from https://localhost:1000
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("https://192.168.1.225:1000")
      .then((res) => res.json())
      .then((data) => setData(data.message))
      .catch((err) => console.log(err));
  }, []);



  return (
    <div className="App">
      <header className="App-header">
        {/* <Instrument /> */}
        <p>{!data ? "Loading..." : data}</p>
      </header>
    </div>
  );
}

export default App;
