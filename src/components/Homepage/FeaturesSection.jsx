import React from "react";
import "../../CSS/Homepage/features.css";
import logo from '../../Images/logo.jpg';

const FeaturesSection = () => {
  return (
    <section className="features" id="features">
      <div className="container">
        <h2>Features</h2>
        <div className="feature-cards">
          <div className="feature-card">
          <img src={logo} alt="Logo" />

            <h3>Channels</h3>
            <p>Organize conversations by topics, projects, or teams.</p>
          </div>
          <div className="feature-card">
          <img src={logo} alt="Logo" />

            <h3>Messaging</h3>
            <p>Real-time messaging for instant collaboration.</p>
          </div>
          <div className="feature-card">
          <img src={logo} alt="Logo" />

            <h3>Integrations</h3>
            <p>Connect your favorite tools like GitHub and Google Drive.</p>
          </div>
          <div className="feature-card">
          <img src={logo} alt="Logo" />

            <h3>Channels</h3>
            <p>Organize conversations by topics, projects, or teams.</p>
          </div>
          <div className="feature-card">
          <img src={logo} alt="Logo" />

            <h3>Channels</h3>
            <p>Organize conversations by topics, projects, or teams.</p>
          </div>
          <div className="feature-card">
          <img src={logo} alt="Logo" />

            <h3>Channels</h3>
            <p>Organize conversations by topics, projects, or teams.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
