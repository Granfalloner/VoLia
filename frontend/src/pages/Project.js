import React from 'react';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { useParams } from 'react-router-dom';

const stripeStyles = {
  backgroundImage: 'url("/bg2.png")',
  minHeight: '265px',
};

const Project = (props) => {
  const { projectID } = useParams();
  const { title, description } = projectsData[projectID];
  return (
    <div>
      <Header />
      <div className="text-center">Project: {title}</div>
    </div>
  );
};
export default Project;
