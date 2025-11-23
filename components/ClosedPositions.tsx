'use client';

import { ClosedPositonProp, IncomingSocketPositionsType } from '@/types';
import { useEffect, useState } from 'react';
import Position from './Position';
import { Spinner } from './ui/spinner';
import { BriefcaseBusiness } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export default function ClosedPositions({ activeTab }: { activeTab: string }) {
    const [closedPositions, setClosedPositions] = useState<ClosedPositonProp[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClosedPositions = async () => {
            const now = new Date();
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(now.getMonth() - 1);
            const fromDate = oneMonthAgo.getTime();
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accounts/history/positions?fromDate=${fromDate.toString()}&toDate=${Date.now().toString()}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setClosedPositions(data.positions);
                    setError(null);
                }
            } catch (err: unknown) {
                console.error('Error in fetching active positions', err);

                const errMsg =
                    err instanceof Error
                        ? err.message
                        : 'Something went wrong while fetching active positions';
                setError(errMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClosedPositions();
    }, []);

    const { incomingPositionsSocketMsg } = useSocket();

    // add closed position
    useEffect(() => {
        if (!incomingPositionsSocketMsg) return;

        setClosedPositions(prev => {
            if (prev.length === 0) return prev;

            const closePosition = incomingPositionsSocketMsg
                .filter(
                    item =>
                        item.e === 'positions' &&
                        (item.t === 'close' || item.t === 'part_close') &&
                        item.d
                )
                .map(item => {
                    const positionData = item.d as IncomingSocketPositionsType;
                    return {
                        dealId: positionData.dealId,
                        symbol: positionData.instrument,
                        type: positionData.type,
                        volume: positionData.volume,
                        openPrice: positionData.openPrice,
                        closePrice: positionData.price,
                        tp: positionData.tp,
                        sl: positionData.sl,
                        position: positionData.positionId,
                        openTime: new Date(positionData.openTime),
                        closeTime: new Date(positionData.closeTime as number),
                        swap: positionData.swap,
                        pnl: positionData.profit || 0,
                        marginRate: positionData.marginRate,
                        commission: positionData.commission,
                        fee: positionData.fee,
                        reason: positionData.reason,
                    } as ClosedPositonProp;
                });

            if (closePosition.length === 0) return prev;

            return [...prev, ...closePosition];
        });
    }, [incomingPositionsSocketMsg]);

    if (closedPositions.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div>
                    <BriefcaseBusiness size={35} className="mx-auto" />
                    <p className="mt-3">No closed positions</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="mt-1 w-full text-center font-medium text-red-500">{error}</div>;
    }

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Spinner className="size-6" />
            </div>
        );
    }
    return <Position activeTab={activeTab} p={closedPositions} />;
}
