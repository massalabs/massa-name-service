import { Args, Client, EOperationStatus, ICallData, IDatastoreEntryInput, MAX_GAS_CALL, bytesToStr, bytesToU256, bytesToU64, u256ToBytes } from '@massalabs/massa-web3';
import { ToastContent, toast } from '@massalabs/react-ui-kit';
import { useState } from 'react';
import { DEFAULT_OP_FEES, SC_ADDRESS } from '../const/sc';
import { OperationToast } from '../lib/connectMassaWallets/components/OperationToast';
import { logSmartContractEvents } from '../lib/connectMassaWallets/utils';
import { stringToBytes } from 'viem';

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

interface DnsDeleteParams {
    tokenId: bigint;
}

interface DnsUserEntryListParams {
    address: string;
}

interface DnsChangeTargetParams {
    domain: string;
    targetAddress: string;
}

export interface DnsUserEntryListResult {
    domain: string;
    targetAddress: string;
    tokenId: bigint;
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

    async function getUserEntryList(params: DnsUserEntryListParams): Promise<DnsUserEntryListResult[]> {
        let resultBalance = await client?.smartContracts().readSmartContract({
            targetAddress: SC_ADDRESS,
            targetFunction: 'balanceOf',
            parameter: new Args().addString(params.address).serialize(),
        });
        if (!resultBalance) {
            toast.error('Failed to get user entry list', {duration: 5000});
            return [];
        }
        let balance = bytesToU256(resultBalance.returnValue);
        let list: DnsUserEntryListResult[] = [];
        let addressBytes = stringToBytes(params.address);
        for (let i = 0n; balance > 0 && i < 10000000n; i += 128n) {
            let listAsked: IDatastoreEntryInput[] = [];
            const prefix = [0x04]
            for (let j = 0n; j < 128n; j++) {
                const tokenId = u256ToBytes(j);
                listAsked.push({
                    address: SC_ADDRESS,
                    key: Uint8Array.from([...prefix, ...tokenId])
                });
            }
            let results = await client?.publicApi().getDatastoreEntries(listAsked);
            if (!results) {
                toast.error('Failed to get user entry list', {duration: 5000});
                return [];
            }
            for (let j = 0; j < results.length; j++) {
                let entry = results[j].candidate_value;
                if (!entry || entry.length == 0) {
                    continue;
                }
                if (compareUint8Array(entry, addressBytes)) {
                    let tokenId = i + BigInt(j);
                    let resultDomain = await client?.smartContracts().readSmartContract({
                        targetAddress: SC_ADDRESS,
                        targetFunction: 'getDomainFromTokenId',
                        parameter: new Args().addU256(tokenId).serialize(),
                    });
                    if (!resultDomain) {
                        toast.error('Failed to get user entry list', {duration: 5000});
                        return [];
                    }
                    const domain = bytesToStr(resultDomain.returnValue);
                    let targetAddress = await client?.smartContracts().readSmartContract({
                        targetAddress: SC_ADDRESS,
                        targetFunction: 'dnsResolve',
                        parameter: new Args().addString(domain).serialize(),
                    });
                    if (!targetAddress) {
                        toast.error('Failed to get user entry list', {duration: 5000});
                        return [];
                    }
                    list.push({
                        domain: domain,
                        targetAddress: bytesToStr(targetAddress.returnValue),
                        tokenId: tokenId,
                    });
                    // Rate limiting
                    await sleep(1000);
                    balance -= 1n;
                }
            }
            // Rate limiting
            await sleep(1000);
        }
        return list;
    }
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    function compareUint8Array(a: Uint8Array, b: Uint8Array) {
        if (a.length != b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;
    }

    function deleteDnsEntry(params: DnsDeleteParams) {
        let args = new Args();
        args.addU256(params.tokenId);
        callSmartContract('dnsFree', args.serialize(), {
            pending: "Entry deleting in progress",
            success: "Successfully deleted",
            error: "Failed to delete",
        }, { showInProgressToast: true });
    }

    function changeTargetAddressDnsEntry(params: DnsChangeTargetParams) {
        let args = new Args();
        args.addString(params.domain);
        args.addString(params.targetAddress);
        callSmartContract('dnsUpdateTarget', args.serialize(), {
            pending: "Updating target address in progress",
            success: "Successfully updated",
            error: "Failed to update",
        }, { showInProgressToast: true });
    }

    return {
        opId,
        isPending,
        isSuccess,
        isError,
        dnsAlloc,
        getAllocCost,
        getUserEntryList,
        deleteDnsEntry,
        changeTargetAddressDnsEntry
    };
}