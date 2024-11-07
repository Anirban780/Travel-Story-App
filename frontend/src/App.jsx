import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Home from './pages/Home/Home';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {/* Define the root route that handles redirects */}
          <Route path="/" element={<Root />} />
          
          {/* Define other routes */}
          <Route path="/dashboard" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </div>
  );
};

// Root component to handle the redirect logic
const Root = () => {
    const isAuthenticated = !!localStorage.getItem("token");

    // Redirect based on authentication status
    return isAuthenticated ? (
      <Navigate to="/dashboard" />
    ) : (
      <Navigate to="/login" />
    );
};

export default App;
