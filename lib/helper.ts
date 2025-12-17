import { InstrumentConfig, InstrumentProp } from '@/types';

export function getDate(date: Date | string) {
    const d = new Date(date);
    const formatted = d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    return formatted;
}

export function normalizeSymbol(sym: string) {
    return sym.includes('/') ? sym.replace('/', '') : sym;
}

export const INSTRUMENTS: Record<string, InstrumentConfig> = {
    EURUSD: { contractSize: 100_000, digits: 5, marginFactor: 1, symbolType: 'forex' },
    GBPUSD: { contractSize: 100_000, digits: 5, marginFactor: 1, symbolType: 'forex' },
    USDJPY: { contractSize: 100_000, digits: 3, marginFactor: 1, symbolType: 'forex' },
    EURUSDm: { contractSize: 100_000, digits: 5, marginFactor: 1, symbolType: 'forex' },

    XAUUSD: { contractSize: 100, digits: 2, marginFactor: 1, symbolType: 'metal' },
    XAGUSD: { contractSize: 5000, digits: 3, marginFactor: 1, symbolType: 'metal' },

    BTCUSD: { contractSize: 1, digits: 2, marginFactor: 0.5, symbolType: 'crypto' },
    ETHUSD: { contractSize: 1, digits: 2, marginFactor: 0.5, symbolType: 'crypto' },
    LTCUSD: { contractSize: 1, digits: 2, marginFactor: 0.5, symbolType: 'crypto' },
};

export function getInstrumentConfig(symbol: string): InstrumentConfig {
    return INSTRUMENTS[symbol];
}

export function calculatePnl(
    instrument: string,
    side: 'buy' | 'sell',
    openPrice: number,
    closePrice: number,
    closingVolume: number
) {
    const { contractSize } = getInstrumentConfig(instrument);

    if (!contractSize) return;

    const pnl: number =
        side === 'buy'
            ? (closePrice - Number(openPrice)) * Number(closingVolume) * contractSize
            : (Number(openPrice) - closePrice) * Number(closingVolume) * contractSize;

    return pnl;
}

export const addToFavorite = async (instrumentId: string): Promise<InstrumentProp | void> => {
    if (!instrumentId || instrumentId === '') return;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/instruments/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                instrumentId,
                sortOrder: 1,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to add instrument to Favorite');
        }

        const data = await response.json();
        console.log('add data', data);
        return data.data as InstrumentProp;
    } catch (err: unknown) {
        throw err;
    }
};

export const removeFromFavorite = async (instrumentId: string): Promise<{ id: string } | void> => {
    if (!instrumentId || instrumentId === '') return;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/instruments/${instrumentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to remove instrument from Favorite');
        }

        const data = await response.json();
        console.log('remove data', data);
        return data.data;
    } catch (err: unknown) {
        throw err;
    }
};
