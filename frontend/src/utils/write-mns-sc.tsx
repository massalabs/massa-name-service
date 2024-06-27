import {
  Args,
  Client,
  EOperationStatus,
  ICallData,
  MAX_GAS_CALL,
  bytesToStr,
  bytesToU64,
  toMAS,
} from '@massalabs/massa-web3';
import { ToastContent, toast } from '@massalabs/react-ui-kit';
import { useState } from 'react';
import { DEFAULT_OP_FEES, SC_ADDRESS } from '../const/sc';
import { OperationToast } from '../lib/connectMassaWallets/components/OperationToast';
import { logSmartContractEvents } from '../lib/connectMassaWallets/utils';
import { ExplorerApiClient } from '../ExplorerApiClient';

interface ToasterMessage {
  pending: string;
  success: string;
  error: string;
  timeout?: string;
}

export interface DnsAllocParams {
  domain: string;
  targetAddress: string;
  coins?: bigint;
}

export interface DnsDeleteParams {
  tokenId: bigint;
}

interface DnsUserEntryListParams {
  address: string;
}

export interface DnsChangeTargetParams {
  domain: string;
  targetAddress: string;
}

export interface DnsTransferParams {
  currentOwner: string;
  newOwner: string;
  tokenId: bigint;
}

export interface DnsUserEntryListResult {
  domain: string;
  targetAddress: string;
  tokenId: bigint;
}

export interface DnsGetAllocCostResponse {
  price: bigint | null;
  error?: string;
}

type callSmartContractOptions = {
  coins?: bigint;
  fee?: bigint;
  showInProgressToast?: boolean;
};

function minBigInt(a: bigint, b: bigint) {
  return a < b ? a : b;
}
export function useWriteMNS(client?: Client) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [opId, setOpId] = useState<string | undefined>(undefined);
  const [list, setList] = useState<DnsUserEntryListResult[]>([]);
  const [listSpinning, setListSpinning] = useState(false);
  const explorer_api = new ExplorerApiClient();

  async function getAllocCost(
    params: DnsAllocParams,
  ): Promise<DnsGetAllocCostResponse> {
    let price = 0n;
    try {
      let args = new Args();
      args.addString(params.domain);
      args.addString(params.targetAddress);
      let response = await client?.smartContracts().readSmartContract({
        targetAddress: SC_ADDRESS,
        targetFunction: 'dnsAllocCost',
        parameter: args.serialize(),
      });
      if (!response) {
        return {
          price: null,
          error: 'Failed to get alloc cost',
        };
      }
      price = bytesToU64(response.returnValue);
    } catch (error) {
      return {
        price: null,
        error:
          'Name can only be 2-100 characters long and can contains only lowercase letters, numbers and hyphens.',
      };
    }
    try {
      let args = new Args();
      args.addString(params.domain);
      let result = await client?.smartContracts().readSmartContract({
        targetAddress: SC_ADDRESS,
        targetFunction: 'dnsResolve',
        parameter: args.serialize(),
      });
      if (!result) {
        return {
          price: null,
          error: 'Failed to get alloc cost',
        };
      }
      return {
        price: null,
        error: `Domain already registered by ${bytesToStr(result.returnValue)}`,
      };
    } catch (error) {
      try {
        let resultBalance = await client
          ?.publicApi()
          .getAddresses([params.targetAddress]);
        if (!resultBalance) {
          return {
            price: null,
            error: 'Failed to get alloc cost',
          };
        }
        let balance = BigInt(
          (
            parseFloat(resultBalance[0].candidate_balance) * 1_000_000_000
          ).toFixed(0),
        );
        if (balance < price) {
          return {
            price: null,
            error: `The price of the domain is ${toMAS(price).toFixed(
              4,
            )} MAS. Your balance is ${toMAS(balance).toFixed(
              4,
            )} MAS. Please top up your account.`,
          };
        }
      } catch (error) {
        return {
          price: null,
          error:
            'Your account does not exist in the Massa network. Transfer 0.1 MAS to your account to create it onchain.',
        };
      }
      return {
        price: price,
      };
    }
  }

  function callSmartContract(
    targetFunction: string,
    parameter: number[],
    messages: ToasterMessage,
    {
      coins = BigInt(0),
      fee = DEFAULT_OP_FEES,
      showInProgressToast = false,
    }: callSmartContractOptions = {},
  ) {
    if (!client) {
      throw new Error('Massa client not found');
    }
    if (isPending) {
      throw new Error('Operation is already pending');
    }
    setIsSuccess(false);
    setIsError(false);
    setIsPending(false);
    let operationId: string | undefined;
    let toastId: string | undefined;

    const callData = {
      targetAddress: SC_ADDRESS,
      targetFunction,
      parameter,
      coins,
      fee,
    } as ICallData;

    client
      .smartContracts()
      .readSmartContract(callData)
      .then((response) => {
        const gasCost = BigInt(response.info.gas_cost);
        return minBigInt(gasCost + (gasCost * 20n) / 100n, MAX_GAS_CALL);
      })
      .then((maxGas: bigint) => {
        callData.maxGas = maxGas;
        return client.smartContracts().callSmartContract(callData);
      })
      .then((opId) => {
        operationId = opId;
        setOpId(opId);
        setIsPending(true);
        if (showInProgressToast) {
          toastId = toast.loading(
            (t) => (
              <ToastContent t={t}>
                <OperationToast
                  title={messages.pending}
                  operationId={operationId}
                />
              </ToastContent>
            ),
            {
              duration: Infinity,
            },
          );
        }
        return client
          .smartContracts()
          .awaitMultipleRequiredOperationStatus(opId, [
            EOperationStatus.SPECULATIVE_ERROR,
            EOperationStatus.FINAL_ERROR,
            EOperationStatus.SPECULATIVE_SUCCESS,
          ]);
      })
      .then((status: EOperationStatus) => {
        if (status !== EOperationStatus.SPECULATIVE_SUCCESS) {
          throw new Error('Operation failed', { cause: { status } });
        }
        setIsSuccess(true);
        setIsPending(false);
        toast.dismiss(toastId);
        const baseAccount = client.wallet().getBaseAccount();
        if (client && baseAccount) {
          getUserEntryList({
            address: baseAccount.address()!,
          });
        }
        toast.success((t) => (
          <ToastContent t={t}>
            <OperationToast
              title={messages.success}
              operationId={operationId}
            />
          </ToastContent>
        ));
      })
      .catch((error) => {
        console.error(error);
        toast.dismiss(toastId);
        setIsError(true);
        setIsPending(false);

        if (!operationId) {
          console.error('Operation ID not found');
          toast.error((t) => (
            <ToastContent t={t}>
              <OperationToast title={messages.error} />
            </ToastContent>
          ));
          return;
        }

        if (
          [
            EOperationStatus.FINAL_ERROR,
            EOperationStatus.SPECULATIVE_ERROR,
          ].includes(error.cause?.status)
        ) {
          toast.error((t) => (
            <ToastContent t={t}>
              <OperationToast
                title={messages.error}
                operationId={operationId}
              />
            </ToastContent>
          ));
          logSmartContractEvents(client, operationId);
        } else {
          toast.error((t) => (
            <ToastContent t={t}>
              <OperationToast
                title={messages.timeout || 'Operation timeout'}
                operationId={operationId}
              />
            </ToastContent>
          ));
        }
      });
  }

  function dnsAlloc(params: DnsAllocParams) {
    let args = new Args();
    args.addString(params.domain);
    args.addString(params.targetAddress);
    callSmartContract(
      'dnsAlloc',
      args.serialize(),
      {
        pending: 'Entry registering in progress',
        success: 'Successfully registered',
        error: 'Failed to register',
      },
      { coins: params.coins, showInProgressToast: true },
    );
  }

  async function getUserEntryList(
    params: DnsUserEntryListParams,
  ): Promise<DnsUserEntryListResult[]> {
    setListSpinning(true);
    // let map_list_asked: Map<string, number> = new Map();
    let resultBalance = await client?.smartContracts().readSmartContract({
      targetAddress: SC_ADDRESS,
      targetFunction: 'balanceOf',
      parameter: new Args().addString(params.address).serialize(),
    });
    if (!resultBalance) {
      toast.error('Failed to get user entry list', { duration: 5000 });
      setListSpinning(false);
      return [];
    }

    let list: DnsUserEntryListResult[] = [];

    let domains = await explorer_api.getDomainOwnedByAddress(params.address);

    let dns_infos = await explorer_api.getDomainsInfo(domains);

    for (const domain in dns_infos) {
      list.push({
        domain: domain,
        targetAddress: dns_infos[domain].target_address,
        tokenId: dns_infos[domain].tokenId,
      });
    }

    setList(list);
    setListSpinning(false);
    return list;
  }

  function deleteDnsEntry(params: DnsDeleteParams) {
    let args = new Args();
    args.addU256(params.tokenId);
    callSmartContract(
      'dnsFree',
      args.serialize(),
      {
        pending: 'Entry deleting in progress',
        success: 'Successfully deleted',
        error: 'Failed to delete',
      },
      { showInProgressToast: true },
    );
  }

  function changeTargetAddressDnsEntry(params: DnsChangeTargetParams) {
    let args = new Args();
    args.addString(params.domain);
    args.addString(params.targetAddress);
    callSmartContract(
      'dnsUpdateTarget',
      args.serialize(),
      {
        pending: 'Updating target address in progress',
        success: 'Successfully updated',
        error: 'Failed to update',
      },
      { showInProgressToast: true },
    );
  }

  function changeOwnershipDnsEntry(params: DnsTransferParams) {
    let args = new Args();
    console.log(params.tokenId);
    console.log(params.currentOwner);
    args.addString(params.currentOwner);
    args.addString(params.newOwner);
    args.addU256(params.tokenId);
    callSmartContract(
      'transferFrom',
      args.serialize(),
      {
        pending: 'Updating ownership in progress',
        success: 'Successfully updated',
        error: 'Failed to update',
      },
      { showInProgressToast: true },
    );
  }

  return {
    opId,
    isPending,
    isSuccess,
    isError,
    list,
    listSpinning,
    dnsAlloc,
    getAllocCost,
    getUserEntryList,
    deleteDnsEntry,
    changeTargetAddressDnsEntry,
    changeOwnershipDnsEntry,
  };
}
