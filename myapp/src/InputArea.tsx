import React, { useState } from "react";
import send_icon from "./images/send.svg"

type Props = {
  sendMessage: (editorId: string, date: string, content: string, isEdit: boolean) => void;
  editorId: string
}

function InputArea(props: Props) {
  const [msgContent, setContent] = useState<string>("");
  const [editorId, setEditorId] = useState<string>(props.editorId);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const send = (event : React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = ("0" + now.getHours()).slice(-2);
    const minute = ("0" + now.getMinutes()).slice(-2);
    const formattedDate = `${year}/${month}/${day} ${hour}:${minute}`;
    if (msgContent != "") {
      props.sendMessage(editorId, formattedDate, msgContent, isEdit);
    }
    setContent("");
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      send(event);
    }
  }
  return (
    <form className="input_area" onSubmit={send}>
      <textarea
        placeholder='メッセージを入力'
        rows={3}
        name="message"
        value={msgContent}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}></textarea>
      <button title="送信" className='send_btn btn' type="submit">
        <img src={send_icon} className="send_icon" alt="send" />
      </button>
    </form>
  )
}

export default InputArea;