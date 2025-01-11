import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../CSS/Homepage/navbar.css";
import logo from "../../Images/logo.png";
import { FaUserCircle } from 'react-icons/fa';
 
import { FiPlusCircle, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';

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

  const truncateEmail = (email) => {
    return email.length > 15 ? `${email.substring(0, 15)}...` : email;
  };

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="logo-link">
          <span className="logo-text">Icollab</span>
        </Link>
        <nav className="nav-links">
          <ul>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
        <div className="action-buttons">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <FiSearch className="search-icon" />
          </div>
          <button className="workspace-btn" title="Create Workspace">
            <FiPlusCircle />
            <Link to="/dashboard">Create Workspace</Link>
          </button>
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-menu-btn">
              <FaUserCircle className="avatar" />
                <span>{truncateEmail(userName)}</span>
              </button>
              <div className="user-dropdown">
                <button onClick={() => navigate("/profile")}>
                  <FiUser />
                  <span>Profile</span>
                </button>
                <button onClick={handleLogout}>
                  <FiLogOut />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Sign In </Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
