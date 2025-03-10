import React, { useEffect,useState } from "react";
import "../../CSS/Homepage/hero.css";
import { Link } from "react-router-dom";
import logo from '../../Images/logo.jpg'; 


const HeroSection = () => {
  const collaborationFeatures = [
    { name: "Real-time Chat", color: "#6264A7", icon: "💬" },
    { name: "Task Board", color: "#2EB67D", icon: "📋" },
    { name: "File Sharing", color: "#E01E5A", icon: "📁" },
    { name: "Video Calls", color: "#ECB22E", icon: "🎥" }
  ];

  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach(element => {
      element.classList.add('animate-in');
    });
  }, []);

  return (
    <section className="hero-section">
      {/* Decorative shapes */}
      <div className="shape shape-1 animate-on-mount"></div>
      <div className="shape shape-2 animate-on-mount"></div>
      <div className="shape shape-3 animate-on-mount"></div>
      
      {/* Animated overlays */}
      <div className="overlay overlay-left animate-on-mount"></div>
      <div className="overlay overlay-right animate-on-mount"></div>

      <div className="hero-container">
        <div className="hero-text animate-on-mount">
          <h2 className="hero-slogan">Connect. Learn. Collaborate</h2>
          <p className="hero-description">
            Transform your team's potential with seamless collaboration. 
            Share ideas, manage projects, and achieve goals together.
          </p>
        </div>

        <div className="cards-container">
          {/* Analytics Card */}
          <div className="hero-card card-side animate-on-mount">
            {/* Previous analytics card content */}
            <div className="card-content">
              <div className="metric">
                <span className="number">Free Forever</span>
              </div>
              <div className="activity-graph">
                <div className="graph-line"></div>
              </div>
              <p>With integration features</p>
            </div>
          </div>

          {/* Enhanced Main Center Card */}
          <div className="hero-card card-main animate-on-mount">
            <div className="card-content">
              <h3>Powerful Collaboration Suite</h3>
             
              <div className="integration-grid">
                {collaborationFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="feature-item"
                  >
                    <div 
                      className="feature-icon"
                      style={{ backgroundColor: feature.color }}
                    >
                      {feature.icon}
                    </div>
                    <span className="feature-name">{feature.name}</span>
                  </div>
                ))}
              </div>
             
              <p className="card-footer">
                Join teams already collaborating
              </p>
            </div>
          </div>

          {/* Insights Card */}
          <div className="hero-card card-side animate-on-mount">
            {/* Previous insights card content */}
            <div className="card-content">
              <h3>Team Insights</h3>
              <div className="insights-list">
                <div className="insight-item">
                  <div className="insight-icon">📈</div>
                  <p>Real-time collaboration metrics</p>
                </div>
                <div className="insight-item">
                  <div className="insight-icon">🎯</div>
                  <p>Project milestone tracking</p>
                </div>
                <div className="insight-item">
                  <div className="insight-icon">🤝</div>
                  <p>Team synergy analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;