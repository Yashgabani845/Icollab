import React from 'react';
import '../CSS/frontview.css';

const FrontView = () => {
  return (
    <div className="front-view">
      <h1 className="title">Work without limits in Channels.</h1>
      <p className="description">
        Channels bring the right people and information together. Align on any topic, share collective knowledge and take action with AI at your side.
      </p>
      <div className="btn-container">
        <button className="get-started-btn">GET STARTED</button>
        <button className="talk-to-sales-btn">TALK TO SALES</button>
      </div>
    </div>
  );
};

export default FrontView;