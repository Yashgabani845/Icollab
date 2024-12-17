  import React from 'react';
import "../../CSS/Homepage/navbar.css";
import logo from "../../Images/logo.jpg";
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <img src={logo} className='logo'   />
          <ul className="navbar-menu">
            <li><a href="#">Features</a></li>
            <li><a href="#">Solutions</a></li>
            <li><a href="#">Enterprise</a></li>
            <li><a href="#">Resources</a></li>
            <li><a href="#">Pricing</a></li>
          </ul>
        </div>
        <div className="navbar-right">
          <button className="talk-to-sales-btn">TALK TO SALES</button>
          <button className="get-started-btn">GET STARTED</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;