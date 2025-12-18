/**
 * Fetch candles of selected instrument(symbol)
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { InstrumentContext } from '@/hooks/useInstrument';
import { Candle, PricesProp } from '@/types';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';
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
    updateTimeFrame: (timeFrame: number) => void;
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

const FROM = Number.MAX_SAFE_INTEGER;
const COUNT = -300;

export const InstrumentProvider: React.FC<InstrumentProviderProp> = ({ children }) => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>(() => {
        const currSelectedSymbol: string | null = getLocalStorage('selected-symbol');
        if (currSelectedSymbol) return currSelectedSymbol;
        const favoriteSymbols = getLocalStorage<string[]>('fav-instruments');
        return favoriteSymbols?.length ? favoriteSymbols[0] : 'BTC/USD';
    });
    const [selectedSymbolPrice, setSelectedSymbolPrice] = useState<PricesProp | undefined>();
    const [candles, setCandles] = useState<Candle[]>([]);
    const [timeFrame, setTimeFrame] = useState(() => {
        const currTimeFrame: string | null = getLocalStorage('timeframe');
        const tf = Number(currTimeFrame);
        return currTimeFrame !== null && !isNaN(tf) ? tf : 5;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const fetchCandles = useCallback(async () => {
        setIsLoading(true);
        try {
            const candles = await fetchHistoryCandles(selectedSymbol, timeFrame, FROM, COUNT);
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
    }, [selectedSymbol, timeFrame]);

    useEffect(() => {
        fetchCandles();
    }, [fetchCandles]);

    const handleChangeSymbol = (symbol: string) => {
        setSelectedSymbol(symbol);
    };

    const updateTimeFrame = (timeFrame: number): void => {
        setTimeFrame(timeFrame);
        setLocalStorage('timeframe', timeFrame);
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
        updateTimeFrame,
        handleChangeSymbol,
    };

    return <InstrumentContext.Provider value={value}>{children}</InstrumentContext.Provider>;
};
