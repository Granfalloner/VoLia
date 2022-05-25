function getTiers(projectId) {
  return [
    {
      name: 'Crypto Peasant',
      currency: 'usdc',
      amount: 200,
      period: 'month',
      tokenId: 1,
      tokenDecimals: 6,
      tierIndex: 0,
    },
    {
      name: 'Crypto Warrior',
      currency: 'usdc',
      amount: 400,
      period: 'month',
      tokenId: 1,
      tokenDecimals: 6,
      tierIndex: 1,
    },
    {
      name: 'Crypto Lord',
      currency: 'usdc',
      amount: 600,
      period: 'month',
      tokenId: 1,
      tokenDecimals: 6,
      tierIndex: 2,
    },
  ];
}

const PROJECTS = [
  {
    projectId: 1,
    image: '/projects/Iryna Mischenko.jpg',
    title: 'Iryna Mischenko',
    address: 'Ukraine',
    ethAddress: '0x261d6B800CBF0cf3F0df6a79ae4C62a70c3b42d1',
    tiers: getTiers(1),
    description:
      'Position: The former owner of the travel agency “Friends”. Currently, I’m a volunteer. I’m helping our military guys with all what they’re asking me for. ​​Description: My approach is to announce a very particular fundraise for 1-2 days to buy one thing, for example a military off-road car. Once we did it, I publish a report about a purchase and start a new fundraising. For me, it’s very crucial in terms of fundraising to know soldiers in person or if my friends know them, so we can help real particular people. Secondly, I must be sure that what we bought is really in place and doing its work (shooting, flying etc), and not is being resold on a secondary market. Over 400,000 dollars have been collected in 80 days. ',
  },
  {
    projectId: 2,
    title: 'Denys Koshelnik',
    address: 'Ukraine',
    ethAddress: '0x261d6B800CBF0cf3F0df6a79ae4C62a70c3b42d1',
    tiers: getTiers(1),
    image: '/projects/Denys Koshelnik.jpg',
    tiers: getTiers(2),
    description:
      'Position: Journalist, blogger, volunteer. ​​Description: We’re a team of 10 people, and we use our own cars (5) to help soldiers from Ukrainian army, ​​Territorial Defense Forces with needed equipments.',
  },
  {
    projectId: 3,
    title: 'Alla Pavlovna',
    address: 'Ukraine',
    ethAddress: '0x261d6B800CBF0cf3F0df6a79ae4C62a70c3b42d1',
    tiers: getTiers(1),
    image: '/projects/Anna Pavlovna.jpg',
    tiers: getTiers(3),
    description:
      'Position: Before the war, I was working in restaurant business, but we were always helping kids and nursing homes. ​​Description: Currently, we’re almost full-time volunteers. ​​ Our team is covering humanitarian aid, we’re helping children, displaced people, ​​ disabled persons, lonely mothers with kids and lonely elderlies.​​ I use individual approach in volunteering there are many people writing to me ​​ asking for the help, many of them are displaced people, ​​so I’m carefully reviewing their requests and try to provide individual special help for each of them, ​​like to select right sizes of clothes or shoes. I try to find the best stuff for them and ​​ I pack it by myself. The only fundraising we have now is for delivery needs. ​​We have to deliver humanitarian aids in Ukraine, and since the price for petrol is dramatically increased,​​ it became harder to transport the aid. Also protecting some ​​animal shelters in Kyiv and the cities nearby. ​​Almost 15% of the humanitarian help we received is for animals, ​​so we are spreading the news once we got it and try to deliver this food to those who need it.',
  },
];

export default PROJECTS;
