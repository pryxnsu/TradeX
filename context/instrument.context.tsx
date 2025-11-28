/**
 * Fetch candles of selected instrument(symbol)
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { InstrumentContext } from '@/hooks/useInstrument';
import { Candle, PricesProp } from '@/types';
import { setLocalStorage } from '@/lib/localStorage';
import { normalizeSymbol } from '@/lib/helper';

export interface InstrumentContextType {
    selectedSymbol: string;
    selectedSymbolPrice: PricesProp | undefined;
    setSelectedSymbolPrice: (data: PricesProp) => void;
    candles: Candle[];
    setCandles: (candle: Candle[] | ((prev: Candle[]) => Candle[])) => void;
    isLoading: boolean;
    error: string;
    handleChangeSymbol: (symbol: string) => void;
    timeFrame: number;
}

interface InstrumentProviderProp {
    children: React.ReactNode;
}

export async function fetchHistoryCandles(
    symbol: string,
    timeFrame: number,
    from: number,
    count: number
): Promise<Candle[]> {
    const sym = normalizeSymbol(symbol);
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/instruments/${sym}/candles?time_frame=${timeFrame}&from=${from}&count=${count}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Chart candles');
        }

        const data = await response.json();
        return data.priceHistory;
    } catch (err: unknown) {
        throw err;
    }
}

export const InstrumentProvider: React.FC<InstrumentProviderProp> = ({ children }) => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USD');
    const [selectedSymbolPrice, setSelectedSymbolPrice] = useState<PricesProp | undefined>();
    const [candles, setCandles] = useState<Candle[]>([]);
    const [from] = useState<number>(Number.MAX_SAFE_INTEGER);
    const [timeFrame, setTimeFrame] = useState(5);
    const [count] = useState(-300);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const fetchCandles = useCallback(async () => {
        try {
            const candles = await fetchHistoryCandles(selectedSymbol, timeFrame, from, count);
            setCandles(candles);

            if (candles && candles.length > 0) {
                const latestCandle = candles[candles.length - 1];
                setSelectedSymbolPrice({
                    buy: latestCandle.close,
                    sell: latestCandle.close,
                    time: latestCandle.time,
                });
            }
        } catch (err: unknown) {
            console.error(`Error in fetching symbol ${selectedSymbol} candle`, err);
            const errMsg = err instanceof Error ? err.message : 'Something went wrong while fetching candles data';
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCandles();
    }, []);

    const handleChangeSymbol = (symbol: string) => {
        setSelectedSymbol(symbol);
        setLocalStorage('selected-symbol', symbol);
    };

    useEffect(() => {
        setLocalStorage('selected-symbol', selectedSymbol);
    }, [selectedSymbol]);

    const value = {
        selectedSymbol,
        selectedSymbolPrice,
        setSelectedSymbolPrice,
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
