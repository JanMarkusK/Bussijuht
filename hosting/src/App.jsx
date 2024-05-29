// src/App.jsx
import React from 'react';
import './App.css';
import BusDriver from './components/BusDriver';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bus Driver Game</h1>
        <BusDriver />
      </header>
    </div>
  );
}

export default App;
