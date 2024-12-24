import React, { useState } from "react";
import { FaBold, FaItalic, FaUnderline, FaSmile, FaMicrophone, FaFile, FaCode, FaPen, FaPaperPlane } from "react-icons/fa";
import "../../CSS/Dashboard/input.css";

const CanvasPage = () => {
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  return (
    <div className="canvas-page">
      <h2>Canvas</h2>
      <div className="input-container">
        <div className="toolbar">
          <button title="Bold"><FaBold /></button>
          <button title="Italic"><FaItalic /></button>
          <button title="Underline"><FaUnderline /></button>
          <button title="Emojis"><FaSmile /></button>
          <button title="Voice Note"><FaMicrophone /></button>
          <button title="Attach Document"><FaFile /></button>
          <button title="Insert Code"><FaCode /></button>
          <button title="Annotate"><FaPen /></button>
        </div>
        <div className="input-box">
          <input
            type="text"
            placeholder="Type your message here..."
            value={message}
            onChange={handleInputChange}
          />
          <button className="send-button" onClick={handleSend} title="Send">
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasPage;
