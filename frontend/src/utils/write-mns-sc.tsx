import { Args, Client, EOperationStatus, ICallData, MAX_GAS_CALL, bytesToU64 } from '@massalabs/massa-web3';
import { ToastContent, toast } from '@massalabs/react-ui-kit';
import { useState } from 'react';
import { DEFAULT_OP_FEES, SC_ADDRESS } from '../const/sc';
import { OperationToast } from '../lib/connectMassaWallets/components/OperationToast';
import { logSmartContractEvents } from '../lib/connectMassaWallets/utils';

interface ToasterMessage {
    pending: string;
    success: string;
    error: string;
    timeout?: string;
}

interface DnsAllocParams {
    domain: string;
    targetAddress: string;
    coins?: bigint;
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

    async function getAllocCost(params: DnsAllocParams): Promise<bigint> {
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
                return 0n;
            }
            return bytesToU64(response.returnValue);
        } catch (error) {
            return 0n;
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
                        EOperationStatus.FINAL_SUCCESS,
                    ]);
            })
            .then((status: EOperationStatus) => {
                if (status !== EOperationStatus.FINAL_SUCCESS) {
                    throw new Error('Operation failed', { cause: { status } });
                }
                setIsSuccess(true);
                setIsPending(false);
                toast.dismiss(toastId);
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
                                title={messages.timeout || "Operation timeout"}
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
        callSmartContract('dnsAlloc', args.serialize(), {
            pending: "Entry claiming in progress",
            success: "Successfully claimed",
            error: "Failed to claim",
        }, { coins: params.coins, showInProgressToast: true });
    }

    return {
        opId,
        isPending,
        isSuccess,
        isError,
        dnsAlloc,
        getAllocCost
    };
}