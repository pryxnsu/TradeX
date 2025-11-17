'use client';

import { useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { useSocket } from '@/hooks/useSocket';
import { calculatePnl, normalizeSymbol } from '@/lib/helper';
import { Spinner } from './ui/spinner';
import Position from './Position';
import { IncomingInsSocketMsgProp } from '@/context/socket.context';
import { BriefcaseBusiness } from 'lucide-react';
import { IncomingSocketPositionsType, OpenPositionProp } from '@/types';

export default function OpenPositions({ activeTab }: { activeTab: string }) {
    const { incomingInsSocketMsg, incomingPositionsSocketMsg } = useSocket();
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

    // update open positions -> adding new opened positon
    useEffect(() => {
        if (
            !incomingPositionsSocketMsg ||
            !Array.isArray(incomingPositionsSocketMsg) ||
            incomingPositionsSocketMsg.length === 0
        )
            return;

        setOpenPositions(prev => {
            try {
                const newPositions = incomingPositionsSocketMsg.filter(
                    item => item.e === 'positions' && item.t === 'open' && item.d
                );

                if (newPositions.length === 0) return prev;

                const positionsToAdd: OpenPositionProp[] = [];

                for (const newPosition of newPositions) {
                    const positionData = newPosition.d as IncomingSocketPositionsType;

                    if (
                        !positionData.positionId ||
                        !positionData.instrument ||
                        positionData.openPrice === undefined ||
                        positionData.volume === undefined
                    ) {
                        console.warn('Invalid position data:', positionData);
                        continue;
                    }

                    const positionExists = prev.some(p => p.position === positionData.positionId);
                    if (positionExists) {
                        continue;
                    }

                    const upPosition: OpenPositionProp = {
                        symbol: positionData.instrument,
                        type: positionData.type,
                        volume: positionData.volume,
                        openPrice: positionData.openPrice,
                        tp: positionData.tp,
                        sl: positionData.sl,
                        position: positionData.positionId,
                        currentPrice: positionData.price,
                        openTime: new Date(positionData.openTime),
                        swap: positionData.swap || 0,
                        pnl: positionData.profit || 0,
                    };

                    positionsToAdd.push(upPosition);
                }

                return positionsToAdd.length > 0 ? [...positionsToAdd, ...prev] : prev;
            } catch (err: unknown) {
                console.error('Error processing new positions:', err);
                return prev;
            }
        });
    }, [incomingPositionsSocketMsg, setOpenPositions]);

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
