import React from 'react';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { useParams } from 'react-router-dom';

const Tier = ({ name, amount, currency, period }) => (
  <div className="card card-normal m-w-60 w-60 bg-base-100 shadow-xl flex-auto max-h-96 m-auto ">
    <div className="card-body">
      <h2 className="card-title text-sm font-bold text-center m-auto">
        {name}
      </h2>
      <p className=""></p>
      <div className="text-center text-neutral mb-2 mt-8">
        {amount} {currency} / {period}
      </div>
      <div className="card-actions justify-center">
        <button className="btn w-100">Subscribe</button>
      </div>
    </div>
  </div>
);

const Project = (props) => {
  const { projectID } = useParams();
  const { title, description, tiers } = projectsData[projectID];
  return (
    <div>
      <Header />
      <div style={{ maxWidth: '1000px' }} className="m-auto">
        <div
          className="rounded-lg bg-white h-64 p-12 mt-8 m-auto"
          style={{
            backgroundImage: 'url("/projectBG.png")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top',
            paddingTop: '150px',
          }}
        >
          <div className="font-bold text-lg">{title}</div>
          <div>{description}</div>
        </div>
        <h3 className="mt-8 mb-2 text-xl text-center font-bold">
          Select a membership level
        </h3>
        <div className="container-lg mx-12 my-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Tier {...tier} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Project;
