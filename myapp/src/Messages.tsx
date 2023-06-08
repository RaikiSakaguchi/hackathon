import React from "react";
import { useState } from "react";
import pen from "./images/pencil.svg"
import { StringifyOptions } from "querystring";

type Props = {
  setIsEditing: (id: string, content: string) => void
  id: string
  name: string
  date: string
  content: string
  isEdit: boolean
}

function Messages(props: Props) {
  const isEditing = () => {
    props.setIsEditing(props.id, props.content);
  }
  return(
    <div className="message">
      <div className="msg_head">
        <h1 className="senderName">{props.name}</h1>
        <p className="date">{props.date}</p>
        <img className="edit_icon btn" src={pen} alt="編集" title="メッセージを編集" onClick={isEditing}/>
      </div>
      <div className="text">
        <p>{props.content}</p>
        {props.isEdit && (
          <p className="is_edit">（編集済み）</p>
        )}
      </div>
    </div>
  )
}

export default Messages;