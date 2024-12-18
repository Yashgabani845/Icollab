import React from "react";
import "../../CSS/Homepage/homepage.css"

const Homepage = () => {
  return (
    <div className="homepage">
      <header className="header">
        <div className="container">
          <div className="logo">Icollab</div>
          <nav className="nav">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <button className="login">Log In</button>
            <button className="signup">Sign Up</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
          <div className="hero-image">
            <img
              src="https://slack.com/assets/imgs/homepage/hero-image.png"
              alt="Collaboration"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <h2>Features</h2>
          <div className="feature-cards">
            <div className="feature-card">
              <img
                src="../channel.png"
                alt="Channels"
              />
              <h3>Channels</h3>
              <p>Organize conversations by topics, projects, or teams.</p>
            </div>
            <div className="feature-card">
              <img
                src="https://slack.com/assets/imgs/icons/messaging.png"
                alt="Messaging"
              />
              <h3>Messaging</h3>
              <p>Real-time messaging for instant collaboration.</p>
            </div>
            <div className="feature-card">
              <img
                src="https://slack.com/assets/imgs/icons/integrations.png"
                alt="Integrations"
              />
              <h3>Integrations</h3>
              <p>Connect your favorite tools like GitHub and Google Drive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Icollab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
