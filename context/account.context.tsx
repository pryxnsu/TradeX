'use client';

import { AccountContext } from '@/hooks/useAccount';
import { setLocalStorage } from '@/lib/localStorage';
import { Wallet } from '@/types';
import { useEffect, useState } from 'react';

export interface AccountContextType {
    wallet: Wallet | null;
    setWallet: React.Dispatch<React.SetStateAction<Wallet | null>>;
    walletLoading: boolean;
    walletError: string | null;
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
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/wallet/demo`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch wallet: ${response.statusText}`);
                }

                const data = await response.json();
                setLocalStorage('active:account', data.data.id);
                setWallet(data.data);
                setError(null);
            } catch (err: unknown) {
                console.error('Error in fetching user wallet', err);

                const errMsg =
                    err instanceof Error
                        ? err.message
                        : 'Something went wrong while fetching wallet data';
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

export const AccountProvider: React.FC<AccountProviderProp> = ({ children }) => {
    // wallet
    const { wallet, setWallet, isLoading: walletLoading, error: walletError } = useFetchWallet();

    const value = {
        wallet,
        setWallet,
        walletLoading,
        walletError,
    };
    return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};
