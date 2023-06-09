import React, { useEffect, useState } from 'react';
import './reset.css';
import './App.css';
import './msg.css'
import scrollDown from "./images/down.svg"
import noimage from './images/user_icon.png'
import Messages from './Messages';
import InputArea from './InputArea';
import EditMessage from './EditMessage';
import { LoginForm } from './LoginForm';
import { fireAuth } from './firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { userInfo } from 'os';

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
    chatArea?.scrollTo({
      top: chatArea.scrollHeight,
      behavior: 'smooth'
    });
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
        scrollToEnd();
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
  const deleteMessage = async (id: string) => {
    try {
      const editedMsg = await fetch(
        "https://hackathon2-5xie62mgea-uc.a.run.app/edit",
        {
          method: "DELETE",
          body: JSON.stringify({
            id: id
          }),
        }
        );
      if (!editedMsg.ok) {
        throw Error(`Failed to edit message: ${editedMsg.status}`);
      }
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  }

  return (
  <div className="App">
    <header>
      <h1>Hackathon Chat App</h1>
      {loginUser && (
        <div className="user_box">
          <img
            src={loginUser.photoURL ? loginUser.photoURL : ""}
            className='user_icon'
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = noimage;
              }}
            alt=""/>
          <LoginForm scroll={scrollToEnd}/>
        </div>
      )}
    </header>
    <div className="contents">
      <div className="side_container">
        <p>hello from side bar</p>
        <p>hello from side bar</p>
        <img
          src={scrollDown}
          className='btn scroll_btn'
          alt="最新の投稿へ"
          onClick={scrollToEnd}
          title='最新の投稿へ'/>
      </div>
      {loginUser ?
      <div className="main_container">
        <div id='chat_area' className="msg_container">
          {messageData?.map((m_data: Msg) => (
            <Messages
              setIsEditing={handleIsEdit}
              deleteMsg={deleteMessage}
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
        <LoginForm scroll={scrollToEnd}/>
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