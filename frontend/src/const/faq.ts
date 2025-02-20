import { FAQData } from '../components/FAQ';

export const faqData: FAQData[] = [
  {
    question: 'What is Massa Name System ?',
    answer:
      'Massa Name System is a decentralized naming service which allows users and smart contracts to be recognized on the Massa blockchain.',
  },
  {
    question: 'How do I register a name ?',
    answer:
      'To register a name, you need to connect your Massa wallet and enter the name you want to register in the register section. If the name is available, you can register it by paying the registration fee.',
  },
  {
    question: 'How much does it cost to register a name ?',
    answer:
      'The cost depends on the size of the name. 10000 coins for 2 characters, 1000 coins for 3 characters, 100 coins for 4 characters, 10 coins for 5 characters and 1 coin for 6 and more characters. An little additional amount is taken to cover storage fees. You can see the exact price while typing a domain in the register section.',
  },
  {
    question: 'How do I transfer a name ?',
    answer:
      'Massa Names are NFTs and can be transferred like any other NFT. You can transfer them on purrfect universe using the icon at the top of the page.',
  },
  {
    question: 'Can I change the address my name is targeting ?',
    answer:
      'Yes you can change the address your name is targeting by using the edit icon in the management section. It will change the target address but you will still be the owner of the name.',
  },
  {
    question: 'For how long is a name registered ?',
    answer: 'Forever.',
  },
  {
    question: 'Can I free my name and get my coins back ?',
    answer:
      'Yes you can free your name using the trash icon in the management section. You will get half of the coins you paid for the registration back.',
  },
];
