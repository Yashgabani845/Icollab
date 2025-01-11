import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../CSS/Dashboard/Message.css";


const Message = ({ text, sender }) => {
  return (
    <div className="message">
      <strong>{sender}:</strong> <span>{text}</span>
    </div>
  );
};

export default Message;
