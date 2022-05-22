function getTiers(projectId) {
  return [
    {
      name: 'Supporter Level 1',
      currency: 'usdc',
      amount: 200,
      period: 'month',
      tokenId: 1,
      tierIndex: 0,
    },
    {
      name: 'Supporter Level 2',
      currency: 'usdc',
      amount: 400,
      period: 'month',
      tokenId: 1,
      tierIndex: 1,
    },
    {
      name: 'Supporter Level 3',
      currency: 'usdc',
      amount: 600,
      period: 'month',
      tokenId: 1,
      tierIndex: 2,
    },
  ];
}

const PROJECTS = [
  {
    projectId: 1,
    image: '/projects/Iryna Mischenko.jpg',
    title: 'Iryna Mischenko',
    tiers: getTiers(1),
    description:
      'My approach is to announce a very particular fundraise for 1-2 days to buy one thing, for example a military off-road car. Once we did it, I publish a report about a purchase and start a new fundraising. For me, it’s very crucial in terms of fundraising to know soldiers in person or if my friends know them, so we can help real particular people. Secondly, I must be sure that what we bought is really in place and doing its work (shooting, flying etc), and not is being resold on a secondary market. Over 400,000 dollars have been collected in 80 days. ',
  },
  {
    projectId: 2,
    title: 'Denys Koshelnik',
    image: '/projects/Denys Koshelnik.jpg',
    tiers: getTiers(2),
    description:
      'We’re a team of 10 people, and we use our own cars (5) to help soldiers from Ukrainian army, ​​Territorial Defense Forces with needed equipments.',
  },
  {
    projectId: 3,
    title: 'Anna Pavlovna',
    image: '/projects/Anna Pavlovna.jpg',
    tiers: getTiers(3),
    description:
      'Our team also covering humanitarian aids, we’re helping children, elderlies and also protecting some ​​animal shelters in Kyiv and the cities nearby.',
  },
];

export default PROJECTS;
