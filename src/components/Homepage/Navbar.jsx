import React from "react";
import { Link } from "react-router-dom";
import "../../CSS/Homepage/navbar.css";
import logo from "../../Images/logo.png";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container">
        <img src={logo} alt="Logo" className="logo" />
        <nav className="nav-links">
          <ul>
            <li><Link to="#features">Features</Link></li>
            <li><Link to="#contact">Contact</Link></li>
          </ul>
          <button className="workspace">Create a New Workspace</button>
        </nav>
        <div className="auth-buttons">
          <Link to="/login">
            <button className="login-btn">Log In</button>
          </Link>
          <Link to="/signup">
            <button className="signup-btn">Sign Up</button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
