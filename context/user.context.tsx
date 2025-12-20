'use client';

import { UserContext } from '@/hooks/useUser';
import { setLocalStorage } from '@/lib/localStorage';
import { User } from '@/types';
import { useEffect, useState } from 'react';

export interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string;
}

interface UserProviderProp {
    children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProp> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setIsLoading(false);
                        setUser(null);
                        setIsAuthenticated(false);
                        return;
                    }
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const data = await response.json();
                setUser(data.user);
                setIsAuthenticated(true);
                setLocalStorage('user', data.user);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Something went wrong while fetching user';
                setError(errorMessage);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const value = { user, isAuthenticated, isLoading, error };
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
