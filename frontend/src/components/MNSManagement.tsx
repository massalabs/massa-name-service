import { useAccountStore } from "../lib/connectMassaWallets/store";
import { MNSClaim } from "./MNSClaim";
import { MNSList } from "./MNSList";

export function MNSManagement() {
    const {
        connectedAccount,
        currentProvider,
    } = useAccountStore();

    const connected = !!connectedAccount && !!currentProvider;
    return (
        <>
            {!connected ? (
                <h2 className="mas-h2  text-center">
                    Please connect your wallet above
                </h2>
            ) : (
                <div className="grid grid-cols-1 divide-y">
                <MNSClaim />
                <MNSList />
                </div>
            )}
        </>
    )
}