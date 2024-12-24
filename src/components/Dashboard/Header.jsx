import React from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/Dashboard/Header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleCanvasClick = () => {
    navigate("/canvas"); // Redirects to the Canvas Page
  };

  return (
    <div className="header">
      <input type="text" placeholder="Search" className="search-bar" />
      <div className="header-tabs">
        <button>Messages</button>
        <button onClick={handleCanvasClick}>Add Canvas</button>
      </div>
      <div className="options">
        <span>...</span> {/* Three-dot menu */}
      </div>
    </div>
  );
};

export default Header;
