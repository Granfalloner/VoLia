import React, { useState } from 'react';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { initWallet } from '../crypto.js';

const stripeStyles = {
  backgroundImage: 'url("/bg2.png")',
  minHeight: '265px',
};

const Banner = () => (
  <div style={stripeStyles} className="text-center">
    <h1 className="text-3xl pt-20">
      <b>Vol</b>unteers’ <b>Lia</b>ison — Make it regular
    </h1>

    <div className="max-w-2xl mt-5 m-auto">
      Provide volunteers with regular CRYPTO donation. Your donation will be
      immediately received by volunteer.
    </div>
  </div>
);

const Project = ({ title, description, projectID }) => (
  <div className="card card-normal m-w-80 w-80 bg-base-100 shadow-xl flex-auto max-h-96 m-auto">
    <div className="card-body">
      <h2 className="card-title">{title}</h2>
      <p className="line-clamp-3">{description}</p>
      <div className="card-actions justify-end">
        <a className="btn btn-link" href={`/project/${projectID}`}>
          Donate Now
        </a>
      </div>
    </div>
  </div>
);

const Landing = (props) => {
  const [address, setAddress] = useState(undefined);

  const onConnectWallet = async () => {
    const address = await initWallet();
    setAddress(address);
  };

  return (
    <div>
      <Header address={address} connectWallet={onConnectWallet} />
      <Banner />
      <div className="container-lg mx-12 my-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projectsData.map(({ title, description }, index) => (
          <Project
            projectID={index}
            title={title}
            description={description}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};
export default Landing;
