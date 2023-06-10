import React from "react";
import { useState } from "react";
import pen from "./images/pencil.svg"
import delImg from "./images/delete.svg"
import noimage from "./images/user_icon.png"
import { StringifyOptions } from "querystring";
import ConfirmDelete from "./ConfirmDelete";

type Props = {
  setIsEditing: (id: string, content: string) => void
  deleteMsg: (id: string) => void
  id: string
  name: string
  date: string
  content: string
  isEdit: boolean
  isEditorMatch: boolean
  photo: string
}

function Messages(props: Props) {
  const [tryDelete, setTryDelete] = useState<boolean>(false);
  const isEditing = () => {
    props.setIsEditing(props.id, props.content);
  }
  return(
    <div className="message">
      {tryDelete && (
        <ConfirmDelete
          delete={() => props.deleteMsg(props.id)}
          close={() => setTryDelete(false)}
          content={props.content}/>
      )}
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
        <div>
          <img
            className="edit_icon btn"
            src={pen}
            alt="編集"
            onClick={() => {isEditing()}}
            title="メッセージを編集"/>
          <img
            className="delete_icon btn"
            src={delImg}
            alt="消去"
            onClick={() => {setTryDelete(true)}}
            title="メッセージを消去"/>
        </div>
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