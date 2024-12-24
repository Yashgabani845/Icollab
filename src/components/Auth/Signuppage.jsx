import React from "react";
import "../../CSS/Auth/auth.css";
import google from "../../Images/google.png";

const SignupPage = () => {
  const handleGoogleSignup = () => {
    // Google signup logic here
    console.log("Google Signup triggered");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Sign Up</h1>
        <form>
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>
        <div className="divider">or</div>
        <button onClick={handleGoogleSignup} className="google-btn">
        <img src={google} alt="Google" className="google" />

          Sign up with Google
        </button>
        <p>
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
