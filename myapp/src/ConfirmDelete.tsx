import React from "react";
import "./editMsg.css"
import delIcon from "./images/delete.svg"

type Props = {
  delete: () => void
  close: () => void
  content: string
}

function ConfirmDelete(props: Props) {
  const confirm = () => {
    props.delete();
    props.close();
  }
  return (
    <div className="del_msg">
      <div className="window">
        <p className="del_content">{props.content}</p>
        <img
          title="メッセージを消去"
          className="btn"
          src={delIcon}
          onClick={confirm}
          alt="消去" />
        <p className="btn" onClick={props.close}>×</p>
      </div>
    </div>
  )
}

export default ConfirmDelete;