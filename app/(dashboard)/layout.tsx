import React from 'react';
import { InstrumentProvider } from '@/context/instrument.context';
import { SocketProvider } from '@/context/socket.context';
import { UserProvider } from '@/context/user.context';
import { AccountProvider } from '@/context/account.context';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <SocketProvider>
                <AccountProvider>
                    <InstrumentProvider>{children}</InstrumentProvider>
                </AccountProvider>
            </SocketProvider>
        </UserProvider>
    );
}
