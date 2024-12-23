import React from "react";
import "../../CSS/Homepage/hero.css";
import logo from '../../Images/logo.jpg'; 
const HeroSection = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Welcome to Icollab</h1>
          <p>Streamline your team's communication and productivity with Icollab.</p>
          <div className="hero-buttons">
            <button className="primary-btn">Get Started</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
