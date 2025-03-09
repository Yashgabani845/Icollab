import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/Auth/Loginpage";
import SignupPage from "./components/Auth/Signuppage";
import Homepage from "./components/Homepage/Homepage";
import Contact from "./components/Homepage/Contact";
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
import CreateChannel from "./components/Dashboard/CreateChannel";
import ChannelChat from "./components/Chat/ChannelChat"; // Import new channel chat component
import Mesh from "./components/VideoChat/Mesh";
import ProjectManager from "./components/Dashboard/ProjectManager";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/mesh" element={<Mesh />} />
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
        <Route path="/workspace/:workspaceName/create-channel" element={<CreateChannel />} />
        <Route path="/workspace/:workspaceName/channel/:channelId" element={<ChannelChat />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/livechat" element={<ChatComponent />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<Contact />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/workspace/:workspaceId/projects" element={<ProjectManager />} />
      </Routes>
    </Router>
  );
};

export default App;
