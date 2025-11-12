/**
 * Fetch candles of selected instrument(symbol)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { InstrumentContext } from '@/hooks/useInstrument';
import { Candle } from '@/types';
import { setLocalStorage } from '@/lib/localStorage';
import { normalizeSymbol } from '@/lib/helper';

export interface InstrumentContextType {
    selectedSymbol: string;
    candles: Candle[];
    setCandles: (candle: Candle[]) => void;
    isLoading: boolean;
    error: string;
    handleChangeSymbol: (symbol: string, type: string) => void;
    timeFrame: number;
    setTimeFrame: (tf: number) => void;
}

interface InstrumentProviderProp {
    children: React.ReactNode;
}

function calculateFrom(interval: number, count: number) {
    const now = Date.now();

    // minutes : milliseconds
    const msPerInterval: Record<string, number> = {
        '1': 60_000,
        '5': 5 * 60_000,
        '15': 15 * 60_000,
        '30': 30 * 60_000,
        '60': 60 * 60_000,
        '240': 4 * 60 * 60_000,
        '1440': 24 * 60 * 60_000,
        '10800': 7 * 24 * 60 * 60_000,
        '43200': 30 * 24 * 60 * 60_000,
    };

    const intervalMs = msPerInterval[interval] ?? 5 * 60_000;
    return now - count * intervalMs;
}

export const InstrumentProvider: React.FC<InstrumentProviderProp> = ({ children }) => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USD');
    const [type, setType] = useState<string>('stock');
    const [candles, setCandles] = useState<Candle[]>([]);
    const [timeFrame, setTimeFrame] = useState(5); // 5min // measuring in unit minutes
    const [from] = useState<number>(() => calculateFrom(5 * 60_000, 200));
    const [count] = useState(200); // candles count
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // fetching history candles data of selected instrument
    useEffect(() => {
        const fetchCandles = async () => {
            setError('');
            setIsLoading(true);
            const sym = normalizeSymbol(selectedSymbol);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/instruments/${sym}/${type}/candles?time_frame=${timeFrame}&from=${from}&count=${count}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    }
                );

                const data = await response.json();
                const sorted = data.priceHistory.sort((a: Candle, b: Candle) => a.time - b.time);
                setCandles(sorted);
            } catch (err: unknown) {
                console.error(`Error in fetching symbol ${selectedSymbol} candle`, err);
                const errMsg =
                    err instanceof Error
                        ? err.message
                        : 'Something went wrong while fetching candles data';
                setError(errMsg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCandles();
    }, [count, from, selectedSymbol, timeFrame, type]);

    // update the symbol and fetch new data according to symbol
    const handleChangeSymbol = (symbol: string, type: string) => {
        setSelectedSymbol(symbol);
        setLocalStorage('selected-symbol', symbol);
        setType(type);
    };

    // saving selected array symbol in local storage
    useEffect(() => {
        setLocalStorage('selected-symbol', selectedSymbol);
    }, [selectedSymbol]);    

    const value = {
        selectedSymbol,
        candles,
        setCandles,
        isLoading,
        error,
        timeFrame,
        setTimeFrame,
        handleChangeSymbol,
    };

    return <InstrumentContext.Provider value={value}>{children}</InstrumentContext.Provider>;
};
