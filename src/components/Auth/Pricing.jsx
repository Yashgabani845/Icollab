import React from "react";
import "../../CSS/Homepage/pricing.css";

const Pricing = () => {
  return (
    <section className="pricing-section">
      <h2 className="pricing-title">Choose Your Plan</h2>
      <div className="pricing-cards">
        {/* Free Tier */}
        <div className="pricing-card free">
          <h3 className="pricing-card-title">Free</h3>
          <p className="pricing-price">₹0 / year</p>
          <ul className="pricing-features">
            <li>Messaging</li>
            <li>Video Calling</li>
            <li>Group Calling</li>
            <li>Project Management</li>
          </ul>
          <button className="pricing-button">Get Started</button>
        </div>

        {/* Premium Tier */}
        <div className="pricing-card premium">
          <h3 className="pricing-card-title">Premium</h3>
          <p className="pricing-price">₹199 / year</p>
          <ul className="pricing-features">
            <li>All Free Features</li>
            <li>AI Tools for Project Management</li>
            <li>Task Management</li>
            <li>Message Summarizer</li>
          </ul>
          <button className="pricing-button">Upgrade Now</button>
        </div>

        {/* Advanced Tier */}
        <div className="pricing-card advanced">
          <h3 className="pricing-card-title">Advanced</h3>
          <p className="pricing-price">₹399 / year</p>
          <ul className="pricing-features">
            <li>All Premium Features</li>
            <li>Extra Space</li>
            <li>File Storage</li>
          </ul>
          <button className="pricing-button">Get Advanced</button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
