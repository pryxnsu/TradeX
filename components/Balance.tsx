'use client';

import { useAccount } from '@/hooks/useAccount';
import { Spinner } from './ui/spinner';

export default function WalletBalance() {
    const { wallet, walletLoading, walletError } = useAccount();

    if (walletError) {
        return (
            <div className="mt-1 flex h-12 w-full items-center justify-between gap-6 rounded-tl-sm bg-white px-3">
                {walletError}
            </div>
        );
    }

    if (walletLoading) {
        return (
            <div className="mt-1 flex h-12 w-full items-center justify-between gap-6 rounded-tl-sm bg-white px-3">
                <Spinner />
            </div>
        );
    }
    return (
        <footer className="mt-1 flex h-12 gap-6 rounded-tl-sm bg-white px-3 font-mono">
            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Equity:</span>
                <span className="text-xs font-medium text-neutral-900">
                    {wallet?.equity} {wallet?.currency}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Free margin:</span>
                <span className="text-xs font-medium text-neutral-900">
                    {wallet?.freeMargin} {wallet?.currency}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Balance:</span>
                <span className="text-xs font-medium text-neutral-900">
                    {wallet?.balance} {wallet?.currency}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Margin:</span>
                <span className="text-xs font-medium text-neutral-900">
                    {wallet?.margin} {wallet?.currency}
                </span>
            </div>
        </footer>
    );
}
