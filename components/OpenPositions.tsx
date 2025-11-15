'use client';

import { useAccount } from '@/hooks/useAccount';
import { Spinner } from './ui/spinner';
import Position from './Position';
import { BriefcaseBusiness } from 'lucide-react';

export default function OpenPositions({ activeTab }: { activeTab: string }) {
    const { openPositions, openPositionLoading, openPositionError } = useAccount();

    if (openPositions.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div>
                    <BriefcaseBusiness size={35} className="mx-auto" />
                    <p className="mt-3">No open positions</p>
                </div>
            </div>
        );
    }

    if (openPositionError) {
        <div className="mt-1 w-full text-center font-medium text-red-500">{openPositionError}</div>;
    }

    if (openPositionLoading) {
        return (
            <div className="mt-1 flex w-full items-center justify-between gap-6 rounded-tl-sm bg-white px-3">
                <Spinner className="size-6" />
            </div>
        );
    }
    return <Position activeTab={activeTab} p={openPositions} />;
}
