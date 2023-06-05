import React from "react";

function InputArea() {
  return (
    <div className="input_area">
      <textarea placeholder='メッセージを入力' rows={3} name="message"></textarea>
      <input className='send_btn' type="submit"/>
    </div>
  )
}

export default InputArea;