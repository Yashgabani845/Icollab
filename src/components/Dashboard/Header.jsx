import React from "react";
import "../../CSS/Dashboard/Header.css"

const Header = () => {
  return (
    <div className="header">
      <input type="text" placeholder="Search yash" className="search-bar" />
      <div className="header-tabs">
        <button>Messages</button>
        <button>Add canvas</button>
        <button>+</button>
      </div>
      <div className="options">
        <span>...</span> {/* Three-dot menu */}
      </div>
    </div>
  );
};

export default Header;
