'use client';

import { useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { useSocket } from '@/hooks/useSocket';
import { calculatePnl, normalizeSymbol } from '@/lib/helper';
import { Spinner } from './ui/spinner';
import Position from './Position';
import { IncomingInsSocketMsgProp } from '@/context/socket.context';
import { BriefcaseBusiness } from 'lucide-react';

export default function OpenPositions({ activeTab }: { activeTab: string }) {
    const { incomingInsSocketMsg } = useSocket();
    const { setWallet, openPositions, setOpenPositions, openPositionLoading, openPositionError } = useAccount();

    // update current price & pnl of open positions
    useEffect(() => {
        if (!incomingInsSocketMsg || !Array.isArray(incomingInsSocketMsg)) return;

        setOpenPositions(prevPos => {
            if (prevPos.length === 0) return prevPos;

            try {
                const priceDataMap = new Map<string, IncomingInsSocketMsgProp>();

                incomingInsSocketMsg.forEach(msg => {
                    const normalizedSymbol = normalizeSymbol(msg.symbol);
                    priceDataMap.set(normalizedSymbol, msg);
                });

                let totalPnl = 0;
                const updatedPositions = prevPos.map(p => {
                    const normalizedPositionSymbol = normalizeSymbol(p.symbol);
                    const updatedPriceData = priceDataMap.get(normalizedPositionSymbol);

                    if (!updatedPriceData) {
                        return p;
                    }

                    const side = p.type === 0 ? 'buy' : 'sell';
                    const currentPrice = p.type === 0 ? updatedPriceData.ask : updatedPriceData.bid;

                    const updatedPnl =
                        calculatePnl(
                            normalizedPositionSymbol,
                            side,
                            p.openPrice,
                            currentPrice,
                            p.volume
                        ) ?? 0;

                    totalPnl += updatedPnl;

                    return {
                        ...p,
                        pnl: updatedPnl,
                        currentPrice,
                    };
                });

                setWallet(prevWall => {
                    if (!prevWall) return prevWall;

                    const baseBalance = prevWall.balance ?? 0;
                    const margin = prevWall.margin ?? 0;

                    const equity = baseBalance + totalPnl;
                    const freeMargin = equity - margin;

                    return {
                        ...prevWall,
                        equity: Number(equity.toFixed(2)),
                        freeMargin: Number(freeMargin.toFixed(2)),
                    };
                });

                return updatedPositions;
            } catch (err: unknown) {
                console.error('Error updating positions and wallet:', err);
                return prevPos;
            }
        });
    }, [incomingInsSocketMsg]);

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
