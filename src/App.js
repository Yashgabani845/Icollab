import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/Auth/Loginpage";
import SignupPage from "./components/Auth/Signuppage";
import Homepage from "./components/Homepage/Homepage";
import CanvasPage from "./components/Dashboard/Canvaspage";
import Pricing from "./components/Auth/Pricing";
import Taskboard from "./components/Task/Taskboard";
import VideoChat from "./components/VideoChat/Videochat";
import VideoCall from "./components/VideoChat/VideoCall";
import CreateWorkspaceForm from './components/Dashboard/CreateWorkspaceForm';
import WorkspaceDetail from "./components/Dashboard/WorkspaceDetails";
import Chat from "./components/Chat/Chat";
import ChatComponent from "./components/Chat/ChatComponent";
import Workspace from "./components/Dashboard/Workspace";
import Profile from "./components/Auth/Profile";
import CreateChannelForm from "./components/Dashboard/CreateChannelForm";  // Import the channel creation form

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/canvas" element={<CanvasPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/task" element={<Taskboard />} />
        <Route path="/video" element={<VideoChat />} />
        <Route path="/videocall" element={<VideoCall />} />
        <Route path="/workspace/create" element={<CreateWorkspaceForm />} />
        <Route path="/dashboard" element={<Workspace />} />
        <Route path="/workspace/:workspaceName" element={<WorkspaceDetail />} />
        <Route path="/workspace/:workspaceName/create-channel" element={<CreateChannelForm />} /> {/* Route for creating new channel */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/livechat" element={<ChatComponent />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
