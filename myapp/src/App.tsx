import React, { useState } from 'react';
import logo from './logo.svg';
import './reset.css';
import './App.css';
import './msg.css'
import Messages from './Messages';
import InputArea from './InputArea';

type Msg = {
  id : string
  editorID : string
  date : string
  content : string
  isEdit : boolean
}

function App() {
  const [messageData, setMessage] = useState<Msg[]>();
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        "https://hackathon2-5xie62mgea-uc.a.run.app/messages",
        {
          method: "GET"
        },
      );
      if (!res.ok) {
          throw Error(`Failed to fetch messages: ${res.status}`);
      }
      const message = await res.json();
      setMessage(message);
    } catch (err) {
      console.error(err);
    }
  }
  const sendMessage = async (editorId: string, date: string, content: string, isEdit: boolean) => {
    console.log(content)
    try {
      const formInfo = await fetch(
        "https://hackathon2-5xie62mgea-uc.a.run.app/message",
        {
          method: "POST",
          body: JSON.stringify({
            editorID : editorId,
            date : date,
            content : content,
            isEdit : isEdit
          }),
        }
      );
      if (!formInfo.ok) {
        throw Error(`Failed to create user: ${formInfo.status}`);
      }
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="App">
      <header>
        <h1>This is HEADER!!!</h1>
      </header>
      <div className="contents">
        <div className="side_container">
          <p>hello from side bar</p>
          <p>hello from side bar</p>
        </div>
        <div className="main_container">
          <div className="msg_container">
            {messageData?.map((m_data: Msg) => (
              <Messages name={m_data.editorID} date={m_data.date} content={m_data.content}/>
            ))}
          </div>
          <InputArea sendMessage={sendMessage}/>
        </div>
      </div>
    </div>
  );
}

export default App;
