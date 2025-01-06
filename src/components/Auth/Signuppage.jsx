import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import google from "../../Images/google.png";
import "../../CSS/Auth/Signuppage.css";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleGoogleSignup = () => {
    console.log("Google Signup triggered");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Account created successfully!");
        console.log(data);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="signup-box">
        <div className="signup-form">
          <div className="logo">
            <div className="logo-square"></div>
          </div>

          <h1>Create your Account</h1>
          <p className="welcome-text">Join us! Select method to sign up:</p>

          <div className="social-buttons">
            <button className="social-btn google" onClick={handleGoogleSignup}>
              <img src={google} alt="Google" className="glogo" />
              <span className="google-text">Sign In With Google</span>
            </button>
          </div>

          <form className="signup-form-fields" onSubmit={handleSubmit}>
            <div className="name-fields">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="eye-icon" />
                ) : (
                  <Eye className="eye-icon" />
                )}
              </button>
            </div>

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="eye-icon" />
                ) : (
                  <Eye className="eye-icon" />
                )}
              </button>
            </div>

            <div className="form-options">
              <label className="terms">
                <input type="checkbox" required />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
            </div>

            <button type="submit" className="signup-btn">
              Create Account
            </button>
          </form>

          <p className="login-prompt">
            Already have an account? <a href="/login">Log in</a>
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

export default SignupPage;
