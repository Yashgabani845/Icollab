import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../CSS/Homepage/navbar.css";
import logo from "../../Images/logo.png";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("email");

    if (token) {
      setIsAuthenticated(true);
      setUserName(storedUser || "User"); 
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="container">
        <img src={logo} alt="Logo" className="logo" />
        <nav className="nav-links">
          <ul>
            <li><Link to="#features">Features</Link></li>
            <li><Link to="#contact">Contact</Link></li>
          </ul>
          <Link to="/dashboard"><button className="workspace">Create a New Workspace</button></Link>
        </nav>
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <span className="profile-name">Hi, {userName}</span>
              <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="login-btn">Log In</button>
              </Link>
              <Link to="/signup">
                <button className="signup-btn">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
