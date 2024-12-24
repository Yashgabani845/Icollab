import React from "react";
import "../../CSS/Dashboard/MessageSection.css"

const MessageSection = () => {
  return (
    <div className="message-section">
      <h1>👋 Welcome to the #project channel</h1>
      <p>
        This channel is for everything #project. Hold meetings, share docs and
        make decisions together.
      </p>
      <div className="messages">
        <div className="message">
          <strong>Yash Gabani</strong> <span>10:56</span>
          <p>joined #yashgabani.</p>
        </div>
        <div className="message">
          <strong>Meet Antala</strong> <span>12:31</span>
          <p>joined #meetantala.</p>
        </div>
      </div>
    </div>
  );
};

export default MessageSection;
