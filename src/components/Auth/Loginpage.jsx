import React from "react";
import "../../CSS/Auth/LonginPage.css";
import google from "../../Images/google.png";

const LoginPage = () => {
  const handleGoogleLogin = () => {
    console.log("Google Login triggered");
  };

  return (
    <div className="auth-container">
      <div className="login-box">
        <div className="login-form">
          <div className="logo">
            <div className="logo-square"></div>
          </div>
          
          <h1>Log in to your Account</h1>
          <p className="welcome-text">Welcome back! Select method to log in:</p>
          
          <div className="social-buttons">
            <button className="social-btn google">
              <img  src={google} alt="Google" className="glogo" />
            Sign In With Google
            </button>
         
          </div>
          
          
          
          <form className="login-form-fields">
            <input type="email" placeholder="Email" required />
            <div className="password-field">
              <input type="password" placeholder="Password" required />
              <button type="button" className="toggle-password">
                <i className="eye-icon"></i>
              </button>
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
            
            <button type="submit" className="login-btn">Log in</button>
          </form>
          
          <p className="signup-prompt">
            Don't have an account? <a href="/signup">Create an account</a>
          </p>
        </div>
        
        <div className="info-section">
          <div className="info-content">
            <h2>Connect with every application.</h2>
            <p>Everything you need in an easily customizable dashboard.</p>
            <div className="decorative-elements">
              <div className="circle"></div>
              <div className="square"></div>
              <div className="triangle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;