import React from 'react';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { useParams } from 'react-router-dom';

const Project = (props) => {
  const { projectID } = useParams();
  const { title, description } = projectsData[projectID];
  return (
    <div>
      <Header />
      <div
        className="text-center rounded-lg bg-white h-64 mt-8 m-auto"
        style={{
          maxWidth: '1000px',
          backgroundImage: 'url("/projectBG.png")',
          backgroundRepeat: 'no-repeat',
        }}
      >
        Project: {title}
      </div>
    </div>
  );
};
export default Project;
