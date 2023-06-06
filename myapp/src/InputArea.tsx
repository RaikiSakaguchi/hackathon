import React, { useState } from "react";

type Props = {
  sendMessage: (editorId: string, date: string, content: string, isEdit: boolean) => void;
}

function InputArea(props: Props) {
  const [msgContent, setContent] = useState<string>("");
  const [editorId, setEditorId] = useState<string>("")
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const send = (event : React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    const time = new Date().toLocaleDateString();
    props.sendMessage(editorId, time, msgContent, isEdit);
  }
  return (
    <form className="input_area" onSubmit={send}>
      <textarea placeholder='メッセージを入力' rows={3} name="message" value={msgContent} onChange={(e) => setContent(e.target.value)}></textarea>
      <button className='send_btn' type="submit"/>
    </form>
  )
}

export default InputArea;