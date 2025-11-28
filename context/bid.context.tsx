'use client';

import { useEffect, useState } from 'react';
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
    const [tpWarning, setTpWarning] = useState<string | null>(null);
    const [slWarning, setSlWarning] = useState<string | null>(null);

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
    }, [incomingInsSocketMsg, selectedSymbol]);

    useEffect(() => {
        if (!selectedSymbolPrice || !side) return;

        const currentPrice = side === 'buy' ? selectedSymbolPrice.buy : selectedSymbolPrice.sell;

        if (takeProfit !== undefined && takeProfit !== 0) {
            if (side === 'buy' && currentPrice >= takeProfit) {
                setTpWarning(`Mininum ${selectedSymbolPrice.buy}`);
            } else if (side === 'sell' && currentPrice <= takeProfit) {
                setTpWarning(`Mininum ${selectedSymbolPrice.sell}`);
            } else {
                setTpWarning(null);
            }
        } else {
            setTpWarning(null);
        }

        if (stopLoss !== undefined && stopLoss !== 0) {
            if (side === 'buy' && currentPrice <= stopLoss) {
                setSlWarning(`Mininum ${selectedSymbolPrice.sell}`);
            } else if (side === 'sell' && currentPrice >= stopLoss) {
                setSlWarning(`Mininum ${selectedSymbolPrice.buy}`);
            } else {
                setSlWarning(null);
            }
        } else {
            setSlWarning(null);
        }
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
