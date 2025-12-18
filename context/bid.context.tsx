'use client';

import { useEffect, useMemo, useState } from 'react';
import { BidContext } from '@/hooks/useBid';
import { Side } from '@/types';
import { useInstrument } from '@/hooks/useInstrument';
import { useSocket } from '@/hooks/useSocket';

export interface BidContextType {
    side: Side;
    setSide: React.Dispatch<React.SetStateAction<Side>>;
    orderType: 'market' | 'pending';
    setOrderType: React.Dispatch<React.SetStateAction<'market' | 'pending'>>;
    volume: number;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
    takeProfit: number | undefined;
    setTakeProfit: React.Dispatch<React.SetStateAction<number | undefined>>;
    stopLoss: number | undefined;
    setStopLoss: React.Dispatch<React.SetStateAction<number | undefined>>;
    isOrderPlacing: boolean;
    setIsOrderPlacing: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    tpWarning: string | null;
    slWarning: string | null;
}

export interface BidProviderProp {
    children: React.ReactNode;
}

export const BidProvider: React.FC<BidProviderProp> = ({ children }) => {
    const { selectedSymbol, selectedSymbolPrice, setSelectedSymbolPrice } = useInstrument();

    const [side, setSide] = useState<Side>('buy');
    const [orderType, setOrderType] = useState<'market' | 'pending'>('market');
    const [volume, setVolume] = useState<number>(0.1);
    const [takeProfit, setTakeProfit] = useState<number | undefined>(undefined);
    const [stopLoss, setStopLoss] = useState<number | undefined>(undefined);
    const [isOrderPlacing, setIsOrderPlacing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { incomingInsSocketMsg } = useSocket();

    useEffect(() => {
        if (!incomingInsSocketMsg || !Array.isArray(incomingInsSocketMsg)) return;

        const instrument = incomingInsSocketMsg.find(ins => ins.symbol === selectedSymbol);
        if (instrument) {
            setSelectedSymbolPrice({
                buy: instrument.ask,
                sell: instrument.bid,
                time: instrument.time,
            });
        }
    }, [incomingInsSocketMsg, selectedSymbol, setSelectedSymbolPrice]);

    const { tpWarning, slWarning } = useMemo(() => {
        if (!selectedSymbolPrice || !side) return { tpWarning: null, slWarning: null };

        const { buy, sell } = selectedSymbolPrice;
        let tp = null;
        let sl = null;

        if (takeProfit && takeProfit !== 0) {
            if (side === 'buy' && takeProfit <= buy) {
                tp = `Must be above ${buy}`;
            } else if (side === 'sell' && takeProfit >= sell) {
                tp = `Must be below ${sell}`;
            }
        }

        if (stopLoss && stopLoss !== 0) {
            if (side === 'buy' && stopLoss >= sell) {
                sl = `Must be below ${sell}`;
            } else if (side === 'sell' && stopLoss <= buy) {
                sl = `Must be above ${buy}`;
            }
        }

        return { tpWarning: tp, slWarning: sl };
    }, [selectedSymbolPrice, side, takeProfit, stopLoss]);

    const value = {
        side,
        setSide,
        orderType,
        setOrderType,
        volume,
        setVolume,
        takeProfit,
        setTakeProfit,
        stopLoss,
        setStopLoss,
        isOrderPlacing,
        setIsOrderPlacing,
        error,
        setError,
        tpWarning,
        slWarning,
    };
    return <BidContext.Provider value={value}>{children}</BidContext.Provider>;
};
