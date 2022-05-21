import React from 'react';
import Landing from './pages/Landing';
import Project from './pages/Project';
import Admin from './pages/Admin';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = (props) => {
  return (
    <Router>
      <Routes>
        <Route exact path="/project/:projectId" element={<Project />} />
        <Route exact path="/" element={<Landing />} />
        <Route exact path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};
export default App;
