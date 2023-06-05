import React from 'react';
import logo from './logo.svg';
import './reset.css';
import './App.css';
import './msg.css'
import Messages from './Messages';
import InputArea from './InputArea';

function App() {
  return (
    <div className="App">
      <header>
        <h1>This is HEADER!!!</h1>
      </header>
      <div className="contents">
        <div className="side_container">
          <p>hello from side bar hello from side bar</p>
        </div>
        <div className="main_container">
          <div className="msg_container">
            <Messages/>
            <Messages/>
            <Messages/>
            <Messages/>
            <Messages/>
            <Messages/>
            <Messages/>
            <Messages/>
            <Messages/>
            <Messages/>
          </div>
          <InputArea/>
        </div>
      </div>
    </div>
  );
}

export default App;
