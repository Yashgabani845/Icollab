import React from "react";
import "../../CSS/Homepage/navbar.css";
import logo from '../../Images/logo.png';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container">
      <img src={logo} alt="Logo" />
      <nav className="nav-links">
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#contact">Contact</a></li>
            <button className="workspace">Create a New Workspace</button>

          </ul>
        </nav>
        <div className="auth-buttons">
          <button className="login-btn">Log In</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
