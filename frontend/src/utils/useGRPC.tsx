import { useAccountStore } from '../lib/connectMassaWallets/store';
import { useState, useCallback } from 'react';
import { getClient } from './grpc-client';
import {
  AddressDatastoreKeysCandidate,
  QueryStateRequest,
} from '../proto-gen/massa/api/v1/public';

/**
 * Custom hook to make gRPC calls to the AddressDatastoreKeysFinal function.
 *
 * @param {Object} grpcClient - The initialized gRPC client object.
 * @returns {Object} - Contains loading state, error, data, and the call function.
 */
const useGRPC = () => {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  const { chainId } = useAccountStore();

  /**
   * Function to make the gRPC call.
   * @param {Object} request - The request payload to send to AddressDatastoreKeysFinal.
   */
  const datastoreKeysCandidate = useCallback(
    async (address: string, filter: Uint8Array = new Uint8Array()) => {
      if (!chainId) {
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const client = getClient(chainId);
        const addressDatastoreKeysCandidate =
          AddressDatastoreKeysCandidate.create({
            address,
            prefix: filter,
          });
        console.log(
          'addressDatastoreKeysCandidate',
          addressDatastoreKeysCandidate,
        );

        const request = QueryStateRequest.create({
          queries: [
            {
              requestItem: {
                oneofKind: 'addressDatastoreKeysCandidate',
                addressDatastoreKeysCandidate,
              },
            },
          ],
        });

        const { response } = await client.queryState(request);
        console.log('response', response);
        return response;
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [chainId],
  );

  return { loading, error, datastoreKeysCandidate };
};

export default useGRPC;
