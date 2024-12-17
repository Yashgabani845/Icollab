import logo from './logo.svg';
import VideoChat from './components/Videochat';
import Mesh from './components/Mesh';
import './App.css';
import Homepage from './components/Homepage/Homepage';
import Dashboard from './components/Dashboard/Dashboard';
function App() {
  return (
    <div className="App">
      <Homepage/>
      <Dashboard/>
    </div>
  );
}

export default App;
