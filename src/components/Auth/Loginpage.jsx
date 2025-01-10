import React, { useState } from "react";
import "../../CSS/Auth/LonginPage.css";
import google from "../../Images/google.png";
import { redirect } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from '../../config/firebase/firebase';
import { signInWithPopup } from 'firebase/auth';
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Verify with your backend
      const response = await fetch('http://localhost:5000/api/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          googleId: user.uid,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('email', user.email);
        navigate('/');
        alert('Google login successful!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      alert('Google login failed. Please try again.');
    }
  };

  
const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("email",email);
        navigate('/');
        alert("Login successful!");
      } else {
        console.error("Error:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="auth-container">
      <div className="login-box">
        <div className="login-form">
          <div className="logo">
            <div className="logo-square"></div>
          </div>

          <h1>Log in to your Account</h1>
          <p className="welcome-text">Welcome back!  Select method to log in:</p>

          <div className="social-buttons">
            <button className="social-btn google" onClick={handleGoogleLogin}>
              <img src={google} alt="Google" className="glogo" />
              Sign In With Google
            </button>
          </div>

          <form
            className="login-form-fields"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-field">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="toggle-password">
                <i className="eye-icon"></i>
              </button>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Log in
            </button>
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
