import React, { useState } from "react";
import send_icon from "./images/send.svg"
import "./editMsg.css"

type Props = {
  editMessage: (id: string, content: string) => void;
  content: string
  id: string
}

function EditMessage(props: Props) {
  const [msgContent, setContent] = useState<string>(props.content);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      send(event);
    }
  }
  const send = (event : React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    if (msgContent != "") {
      props.editMessage(props.id, msgContent);
    }
    setContent("");
  }
  return(
    <div className="message_editor">
      <div className="window">
      <div className="edit_head">
        <p>×</p>
      </div>
      <form onSubmit={send}>
      <textarea
        placeholder='メッセージを入力'
        rows={3}
        name="message"
        value={msgContent}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}></textarea>
      <button title="編集完了" className='send_btn btn' type="submit">
        <img src={send_icon} className="send_icon" alt="submit"/>
      </button>
      </form>
      </div>
    </div>
  )
}

export default EditMessage;