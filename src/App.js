import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/Auth/Loginpage";
import SignupPage from "./components/Auth/Signuppage";
import Homepage from "./components/Homepage/Homepage";
import Dashboard from "./components/Dashboard/Dashboard";
import CanvasPage from "./components/Dashboard/Canvaspage";
import Pricing from "./components/Auth/Pricing";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/canvas" element={<CanvasPage />} />
        <Route path="/pricing" element={<Pricing/>}/>
      </Routes>
    </Router>
  );
};

export default App;
