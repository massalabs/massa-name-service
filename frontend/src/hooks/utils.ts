import { formatAmount } from '@massalabs/react-ui-kit';
import { Mas } from '@massalabs/massa-web3';

export function insufficientFundsMessage(cost: bigint, balance: bigint) {
  return `The price of the domain is ${
    formatAmount(cost, Mas.NB_DECIMALS).preview
  } MAS. Your balance is ${
    formatAmount(balance, Mas.NB_DECIMALS).preview
  } MAS. Please top up your account.`;
}
