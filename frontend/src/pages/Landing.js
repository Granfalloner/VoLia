import React from 'react';
import Header from '../components/Header';

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
        <a href={`/project/${projectID}`}>Donate Now</a>
      </div>
    </div>
  </div>
);

const Landing = (props) => {
  return (
    <div>
      <Header />
      <Banner />
      <div className="container-lg mx-12 my-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Project
          projectID={1}
          title="Iryna Mischenko"
          description="My approach is to announce a very particular fundraise for 1-2 days to buy one thing, for example a military off-road car. Once we did it, I publish a report about a purchase and start a new fundraising. For me, it’s very crucial in terms of fundraising to know soldiers in person or if my friends know them, so we can help real particular people. Secondly, I must be sure that what we bought is really in place and doing its work (shooting, flying etc), and not is being resold on a secondary market. Over 400,000 dollars have been collected in 80 days.  "
        />
        <Project
          projectID={2}
          title="Denys Koshelnik"
          description="We’re a team of 10 people, and we use our own cars (5) to help soldiers from Ukrainian army, ​​Territorial Defense Forces with needed equipments."
        />
        <Project
          projectID={3}
          title="Anna Pavlovna"
          description="Our team also covering humanitarian aids, we’re helping children, elderlies and also protecting some ​​animal shelters in Kyiv and the cities nearby."
        />
      </div>
    </div>
  );
};
export default Landing;
