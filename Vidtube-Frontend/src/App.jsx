import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Register,
  HomePage,
  Login,
  Dashboard,
  MyProfile,
  UploadAVideo,
  Tweet,
  TweetNoLogin,
  Playlists,
} from "./pages/Index.jsx";

/**
 * Main App Component
 * Sets up routing for the entire VidTube application
 * Defines all available routes and their corresponding components
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Accessible to all users */}
        <Route path="/" element={<HomePage />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/TweetNoLogin" element={<TweetNoLogin />} />
        
        {/* Protected Routes - Require authentication */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/MyProfile" element={<MyProfile />} />
        <Route path="/UploadAVideo" element={<UploadAVideo />} />
        <Route path="/Tweet" element={<Tweet />} />
        <Route path="/Playlists" element={<Playlists />} />
      </Routes>
    </Router>
  );
}

export default App;
