'use client';

import { ClosedPositonProp } from '@/types';
import { useEffect, useState } from 'react';
import Position from './Position';
import { Spinner } from './ui/spinner';

export default function ClosedPositions({ activeTab }: { activeTab: string }) {
    const [closedPositions, setClosedPositions] = useState<ClosedPositonProp[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClosedPositions = async () => {
            const now = new Date();
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(now.getMonth() - 1);
            const fromDate = oneMonthAgo.getTime();
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accounts/history/positions?fromDate=${fromDate.toString()}&toDate=${Date.now().toString()}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setClosedPositions(data.positions);
                    setError(null);
                }
            } catch (err: unknown) {
                console.error('Error in fetching active positions', err);

                const errMsg =
                    err instanceof Error
                        ? err.message
                        : 'Something went wrong while fetching active positions';
                setError(errMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClosedPositions();
    }, []);

    if (error) {
        return <div className="mt-1 w-full text-center font-medium text-red-500">{error}</div>;
    }

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Spinner className="size-6" />
            </div>
        );
    }
    return <Position activeTab={activeTab} p={closedPositions} />;
}
