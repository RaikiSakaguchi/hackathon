import React, { useEffect, useState } from 'react';
import './reset.css';
import './App.css';
import './msg.css'
import Messages from './Messages';
import InputArea from './InputArea';
import EditMessage from './EditMessage';
// import { LoginForm } from './LoginForm';

type Msg = {
  id : string
  editorID : string
  date : string
  content : string
  isEdit : boolean
}

function App() {
  const [isEditing, setIsEdit] = useState<boolean>(false);
  const [messageData, setMessage] = useState<Msg[]>();
  const [editingMsgId, setEditMsgId] = useState<string>("");
  const [editingMsgContent, setContent] = useState<string>("");
  useEffect(() => {
    fetchMessages();},[])
  const scrollToEnd = () => {
    const chatArea = document.getElementById("chat_area")
    chatArea?.scrollTo(0, chatArea?.scrollHeight);
  }
  var observer = new MutationObserver(()=>{scrollToEnd()})
  const chat = document.getElementById("chat_area")
  const config = {
    childList: true,
  }
  if (chat != null) {
    observer.observe(chat, config);
  }
  const handleIsEdit = (id: string, content: string) => {
    setIsEdit(true);
    setEditMsgId(id);
    setContent(content);
  }
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        "https://hackathon2-5xie62mgea-uc.a.run.app/message",
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
    const editMessage = async (id: string, content: string) => {
      try {
        const editedMsg = await fetch(
          "https://hackathon2-5xie62mgea-uc.a.run.app/edit",
          {
            method: "POST",
            body: JSON.stringify({
              id: id,
              content : content,
            }),
          }
          );
        if (!editedMsg.ok) {
          throw Error(`Failed to create user: ${editedMsg.status}`);
        }
        fetchMessages();
        setIsEdit(false);
      } catch (err) {
        console.error(err);
      }
    }

    return (
    <div className="App">
      <header>
        <h1>This is HEADER!!!</h1>
        {/* <LoginForm/> */}
      </header>
      <div className="contents">
        <div className="side_container">
          <p>hello from side bar</p>
          <p>hello from side bar</p>
        </div>
        <div className="main_container">
          <div id='chat_area' className="msg_container">
            {messageData?.map((m_data: Msg) => (
              <Messages
                setIsEditing={handleIsEdit}
                id={m_data.id}
                name={m_data.editorID}
                date={m_data.date}
                content={m_data.content}
                isEdit={m_data.isEdit}/>
              ))}
          </div>
          <InputArea sendMessage={sendMessage}/>
        </div>
      </div>
      {isEditing && (
        <EditMessage editMessage={editMessage} content={editingMsgContent} id={editingMsgId}/>
      )}
    </div>
  );
}

export default App;