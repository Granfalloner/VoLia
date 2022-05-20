import React from 'react';
import Landing from './pages/Landing';
import Project from './pages/Project';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = (props) => {
  return (
    <Router>
      <Routes>
        <Route exact path="/project/:projectID" element={<Project />} />
        <Route exact path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
};
export default App;
