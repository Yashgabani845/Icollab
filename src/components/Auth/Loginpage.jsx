  import React from "react";
  import "../../CSS/Auth/auth.css";
  import google from "../../Images/google.png";

  const LoginPage = () => {
    const handleGoogleLogin = () => {
      // Google login logic here
      console.log("Google Login triggered");
    };

    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Log In</h1>
          <form>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" className="auth-btn">Log In</button>
          </form>
          <div className="divider">or</div>
          <button onClick={handleGoogleLogin} className="google-btn">
          <img src={google} alt="Google" className="google" />

            Log in with Google
          </button>
          <p>
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    );
  };

  export default LoginPage;
