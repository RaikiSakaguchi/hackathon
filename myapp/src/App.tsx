import React, { useEffect, useState } from 'react';
import './reset.css';
import './App.css';
import './msg.css'
import Messages from './Messages';
import InputArea from './InputArea';
import EditMessage from './EditMessage';
import { LoginForm } from './LoginForm';
import { fireAuth } from './firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

type Msg = {
  id : string
  editorID : string
  editorName : string
  date : string
  content : string
  isEdit : boolean
  photo : string
}

function App() {
  const [loginUser, setLoginUser] = useState<User|null>(fireAuth.currentUser);
  const [isEditing, setIsEdit] = useState<boolean>(false);
  const [messageData, setMessage] = useState<Msg[]>();
  const [editingMsgId, setEditMsgId] = useState<string>("");
  const [editingMsgContent, setContent] = useState<string>("");
  // console.log(isEditing);
  useEffect(() => {
    onAuthStateChanged(fireAuth, (user) => {
      setLoginUser(user);
    })
    fetchMessages();
    scrollToEnd();
  },[])
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
    setEditMsgId(id);
    setContent(content);
    setIsEdit(true);
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
          throw Error(`Failed to send message: ${formInfo.status}`);
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
        throw Error(`Failed to edit message: ${editedMsg.status}`);
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
      {loginUser && (
        <LoginForm/>
      )}
    </header>
    <div className="contents">
      <div className="side_container">
        <p>hello from side bar</p>
        <p>hello from side bar</p>
      </div>
      {loginUser ?
      <div className="main_container">
        <div id='chat_area' className="msg_container">
          {messageData?.map((m_data: Msg) => (
            <Messages
              setIsEditing={handleIsEdit}
              id={m_data.id}
              name={m_data.editorName}
              date={m_data.date}
              content={m_data.content}
              isEdit={m_data.isEdit}
              photo={m_data.photo}
              isEditorMatch={m_data.editorID==loginUser.uid}
              />
            ))}
        </div>
        <InputArea editorId={loginUser.uid} sendMessage={sendMessage}/>
      </div>
      :
      <div className="main_container">
        <LoginForm/>
      </div>
      }
    </div>
    {isEditing ?
      <EditMessage 
        editMessage={editMessage}
        close={() => setIsEdit(false)}
        content={editingMsgContent}
        id={editingMsgId}/>
    : <div></div>}
  </div>
  );
}

export default App;