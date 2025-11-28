'use client';

import { useEffect, useState } from 'react';
import { AccountContext } from '@/hooks/useAccount';
import { setLocalStorage } from '@/lib/localStorage';
import { IncomingSocketEventType, IncomingSocketPositionsType, OpenPositionProp, Wallet } from '@/types';

export interface AccountContextType {
    wallet: Wallet | null;
    setWallet: React.Dispatch<React.SetStateAction<Wallet | null>>;
    walletLoading: boolean;
    walletError: string | null;
    openPositions: OpenPositionProp[];
    setOpenPositions: React.Dispatch<React.SetStateAction<OpenPositionProp[]>>;
    openPositionLoading: boolean;
    openPositionError: string | null;
    handleClosePosition: (positionId: string, price: number, volume: number, closeById: number) => void;
    handlePositionEvent: (msg: IncomingSocketEventType) => void;
}

interface AccountProviderProp {
    children: React.ReactNode;
}

const useFetchWallet = () => {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/wallet/demo`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch wallet: ${response.statusText}`);
                }

                const data = await response.json();
                setLocalStorage('active:account', data.data.id);
                setWallet(data.data);
                setError(null);
            } catch (err: unknown) {
                console.error('Error in fetching user wallet', err);

                const errMsg = err instanceof Error ? err.message : 'Something went wrong while fetching wallet data';
                setError(errMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWallet();
    }, []);

    return {
        wallet,
        setWallet,
        isLoading,
        error,
    };
};

const useFetchOpenPositions = () => {
    const [openPositions, setOpenPositions] = useState<OpenPositionProp[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/accounts/positions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch positions: ${response.statusText}`);
                }

                const data = await response.json();
                setOpenPositions(data.positions);
                setError(null);
            } catch (err: unknown) {
                console.error('Error in fetching active positions', err);

                const errMsg =
                    err instanceof Error ? err.message : 'Something went wrong while fetching active positions';
                setError(errMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPositions();
    }, []);

    return {
        openPositions,
        setOpenPositions,
        isLoading,
        error,
    };
};

export const AccountProvider: React.FC<AccountProviderProp> = ({ children }) => {
    // wallet
    const { wallet, setWallet, isLoading: walletLoading, error: walletError } = useFetchWallet();

    // pending
    const {
        openPositions,
        setOpenPositions,
        isLoading: openPositionLoading,
        error: openPositionError,
    } = useFetchOpenPositions();

    const addPosition = (p: IncomingSocketPositionsType) => {
        setOpenPositions(prev => {
            try {
                if (!p.positionId || !p.instrument || p.openPrice === undefined || p.volume === undefined) {
                    console.warn('Invalid position data:', p);
                    return prev;
                }

                const positionExists = prev.some(pe => pe.position === p.positionId);
                if (positionExists) {
                    return prev;
                }

                const upPosition: OpenPositionProp = {
                    symbol: p.instrument,
                    type: p.type,
                    volume: p.volume,
                    openPrice: p.openPrice,
                    tp: p.tp,
                    sl: p.sl,
                    position: p.positionId,
                    currentPrice: p.price,
                    openTime: new Date(p.openTime),
                    swap: p.swap || 0,
                    pnl: p.profit || 0,
                };

                return [upPosition, ...prev];
            } catch (err: unknown) {
                console.error('Error processing new positions:', err);
                return prev;
            }
        });
    };

    const updateOpenPosition = (p: IncomingSocketPositionsType) => {
        setOpenPositions(prev => {
            try {
                if (!p.positionId) return prev;

                return prev.flatMap(pos => {
                    if (pos.position !== p.positionId) return pos;

                    if (p.volume <= 0) {
                        return [];
                    }

                    return {
                        ...pos,
                        volume: p.volume,
                        pnl: p.profit ?? pos.pnl,
                        currentPrice: p.price ?? pos.currentPrice,
                        sl: p.sl ?? pos.sl,
                        tp: p.tp ?? pos.tp,
                    };
                });
            } catch (err: unknown) {
                console.error('[Error] failed to update position', err);
                return prev;
            }
        });
    };

    const closeFullPosition = (p: IncomingSocketPositionsType) => {
        setOpenPositions(prev => {
            return prev.filter(item => item.position !== p.positionId);
        });
    };

    const handlePositionEvent = (msg: IncomingSocketEventType) => {
        switch (msg.t) {
            case 'open':
                addPosition(msg.d as IncomingSocketPositionsType);
                break;
            case 'upd':
                updateOpenPosition(msg.d as IncomingSocketPositionsType);
                break;
            case 'close': {
                closeFullPosition(msg.d as IncomingSocketPositionsType);
            }
            default:
                break;
        }
    };

    const handleClosePosition = async (positionId: string, price: number, volume: number, closeById: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accounts/${wallet?.id}/position/${positionId}/close`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        price,
                        volume,
                        closeById,
                    }),
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to close position: ${response.statusText}`);
            }
        } catch (err: unknown) {
            console.error('Error occured while closing position', err);
        }
    };

    const value = {
        wallet,
        setWallet,
        openPositions,
        setOpenPositions,
        walletLoading,
        walletError,
        openPositionLoading,
        openPositionError,
        handleClosePosition,
        handlePositionEvent,
    };
    return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};
