'use client';

import { useAccount } from '@/hooks/useAccount';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from './ui/spinner';
import { useSocket } from '@/hooks/useSocket';

export default function Loader({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading: userLoading } = useUser();
    const { connectionStatus, connectionError } = useSocket();
    const { walletLoading } = useAccount();

    useEffect(() => {
        if (!userLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, userLoading, router]);

    if (connectionStatus === 'error' || connectionError) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-3">
                <div className="text-lg font-semibold text-red-600">Connection Error</div>
                <div className="text-center text-sm text-gray-600">
                    {connectionError || 'Unable to connect to server'}
                </div>
                <div className="text-xs text-gray-400">Please check your connection and refresh</div>
            </div>
        );
    }

    if (userLoading || walletLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (connectionStatus === 'connecting') {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-3">
                <Spinner className="size-8" />
                <div className="text-sm text-gray-600">Connecting to server...</div>
            </div>
        );
    }

    if (connectionStatus === 'reconnecting') {
        return (
            <div className="flex h-screen items-center justify-center gap-3">
                <div className="text-sm font-medium text-amber-600">Connection lost, reconnecting...</div>
                <Spinner className="size-8" />
            </div>
        );
    }

    if (connectionStatus === 'disconnected') {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-3">
                <div className="text-lg font-semibold text-gray-700">Disconnected</div>
                <div className="text-sm text-gray-600">Connection was closed</div>
            </div>
        );
    }

    if (!userLoading && !isAuthenticated) {
        return null;
    }

    if (connectionStatus === 'connected') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <Spinner className="size-8" />
        </div>
    );
}
