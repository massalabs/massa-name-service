import { useState } from 'react';
import {
  Client,
  EOperationStatus,
  ICallData,
  MAX_GAS_CALL,
} from '@massalabs/massa-web3';
import { ToastContent, toast } from '@massalabs/react-ui-kit';

import { OperationToast } from '../components/OperationToast';
import { logSmartContractEvents } from '../utils';
import Intl from '../i18n/i18n';

interface ToasterMessage {
  pending: string;
  success: string;
  error: string;
  timeout?: string;
}

function minBigInt(a: bigint, b: bigint) {
  return a < b ? a : b;
}

export function useWriteSmartContract(client?: Client, isMainnet?: boolean) {
  const [isPending, setIsPending] = useState(false);
  const [isOpPending, setIsOpPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [opId, setOpId] = useState<string | undefined>(undefined);

  function callSmartContract(
    targetFunction: string,
    targetAddress: string,
    parameter: number[],
    messages: ToasterMessage,
    coins = BigInt(0),
  ) {
    if (!client) {
      throw new Error('Massa client not found');
    }
    if (isOpPending) {
      throw new Error('Operation is already pending');
    }
    setIsSuccess(false);
    setIsError(false);
    setIsOpPending(false);
    setIsPending(true);
    let operationId: string | undefined;
    let toastId: string | undefined;

    const callData = {
      targetAddress,
      targetFunction,
      parameter,
      coins,
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
        setOpId(operationId);
        setIsOpPending(true);
        toastId = toast.loading(
          (t) => (
            <ToastContent t={t}>
              <OperationToast
                isMainnet={isMainnet}
                title={messages.pending}
                operationId={operationId}
              />
            </ToastContent>
          ),
          {
            duration: Infinity,
          },
        );
        return client
          .smartContracts()
          .awaitMultipleRequiredOperationStatus(operationId, [
            EOperationStatus.SPECULATIVE_ERROR,
            EOperationStatus.FINAL_ERROR,
            EOperationStatus.FINAL_SUCCESS,
          ]);
      })
      .then((status: EOperationStatus) => {
        if (status !== EOperationStatus.FINAL_SUCCESS) {
          throw new Error('Operation failed', { cause: { status } });
        }
        setIsSuccess(true);
        setIsOpPending(false);
        setIsPending(false);
        toast.dismiss(toastId);
        toast.success((t) => (
          <ToastContent t={t}>
            <OperationToast
              isMainnet={isMainnet}
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
        setIsOpPending(false);
        setIsPending(false);

        if (!operationId) {
          console.error('Operation ID not found');
          toast.error((t) => (
            <ToastContent t={t}>
              <OperationToast isMainnet={isMainnet} title={messages.error} />
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
                isMainnet={isMainnet}
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
                isMainnet={isMainnet}
                title={
                  messages.timeout || Intl.t('send-coins.steps.failed-timeout')
                }
                operationId={operationId}
              />
            </ToastContent>
          ));
        }
      });
  }

  return {
    opId,
    isOpPending,
    isPending,
    isSuccess,
    isError,
    callSmartContract,
  };
}
