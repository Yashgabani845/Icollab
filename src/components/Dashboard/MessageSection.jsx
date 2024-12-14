import React from "react";
import "../../CSS/Dashboard/MessageSection.css"

const MessageSection = () => {
  return (
    <div className="message-section">
      <h1>👋 Welcome to the #yashgabani channel</h1>
      <p>
        This channel is for everything #yashgabani. Hold meetings, share docs and
        make decisions together.
      </p>
      <div className="messages">
        <div className="message">
          <strong>gabani yash</strong> <span>10:56</span>
          <p>joined #yashgabani.</p>
        </div>
      </div>
    </div>
  );
};

export default MessageSection;
