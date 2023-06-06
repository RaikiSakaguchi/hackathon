import React from "react";

type Props = {
  name: string
  date: string
  content: string
}

function Messages(props: Props) {
  return(
    <div className="message">
      <div className="head">
        <h1>{props.name}</h1>
        <p>{props.date}</p>
      </div>
      <div className="text">
        <p>{props.content}</p>
      </div>
    </div>
  )
}

export default Messages;