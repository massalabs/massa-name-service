import { formatAmount } from '@massalabs/react-ui-kit';
import { Mas } from '@massalabs/massa-web3';

export function insufficientFundsMessage(cost: bigint, balance: bigint) {
  return `The price of the domain is ${
    formatAmount(cost, Mas.NB_DECIMALS).preview
  } MAS. Your balance is ${
    formatAmount(balance, Mas.NB_DECIMALS).preview
  } MAS. Please top up your account.`;
}

export function handleError(
  err: unknown,
  setError: (error: string | null) => void,
) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('An unexpected error occurred');
  }
}

export const OPERATION_MESSAGES = {
  delete: {
    pending: 'Entry deleting in progress',
    success: 'Successfully deleted',
    error: 'Failed to delete',
  },
  updateOwner: {
    pending: 'Updating target address in progress',
    success: 'Successfully updated',
    error: 'Failed to update',
  },
  updateTarget: {
    pending: 'Updating ownership in progress',
    success: 'Successfully updated',
    error: 'Failed to update',
  },
  claim: {
    pending: 'Entry registering in progress',
    success: 'Successfully registered',
    error: 'Failed to register',
  },
};
