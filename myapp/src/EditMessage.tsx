import React, { useState } from "react";
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
      <div className="edit_head">
        <p>×</p>
      </div>
      <form>
      <textarea
        placeholder='メッセージを入力'
        rows={3}
        name="message"
        value={msgContent}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}></textarea>
      <button title="編集完了" type="submit">編集完了</button>
      </form>
    </div>
  )
}

export default EditMessage;