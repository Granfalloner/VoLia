import React from 'react';
import Header from '../components/Header';

const stripeStyles = {
  backgroundImage: 'url("/bg.png")',
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

const Landing = (props) => {
  return (
    <div className="">
      <Header />
      <Banner />
    </div>
  );
};
export default Landing;
