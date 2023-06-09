import React from "react";
import { useState } from "react";
import pen from "./images/pencil.svg"
import { StringifyOptions } from "querystring";
import noimage from "./images/user_icon.png"

type Props = {
  setIsEditing: (id: string, content: string) => void
  id: string
  name: string
  date: string
  content: string
  isEdit: boolean
  isEditorMatch: boolean
  photo: string
}

function Messages(props: Props) {
  const isEditing = () => {
    props.setIsEditing(props.id, props.content);
  }
  return(
    <div className="message">
      <div className="msg_head">
        <img src={props.photo}
          alt=""
          className={props.isEditorMatch ? "my_photo": "their_photo"}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = noimage;
            }}/>
        <h1 className="senderName">{props.name}</h1>
        <p className="date">{props.date}</p>
        {props.isEditorMatch && (
          <img
            className="edit_icon btn"
            src={pen}
            alt="編集"
            onClick={() => {isEditing()}}
            title="メッセージを編集"/>
        )}
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