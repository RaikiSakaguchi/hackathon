import React from "react";
import pen from "./images/pencil.svg"

type Props = {
  name: string
  date: string
  content: string
  isEdit: boolean
}

function Messages(props: Props) {
  return(
    <div className="message">
      <div className="head">
        <h1 className="senderName">{props.name}</h1>
        <p className="date">{props.date}</p>
        <img className="edit_icon" src={pen} alt="編集" title="メッセージを編集"/>
      </div>
      <div className="text">
        <p>{props.content}</p>
        {props.isEdit && (
          <p>（編集済み）</p>
        )}
      </div>
    </div>
  )
}

export default Messages;