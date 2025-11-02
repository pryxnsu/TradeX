import React from 'react';
import { InstrumentProvider } from '@/context/instrument.context';
import { SockerProvider } from '@/context/socket.context';
import { UserProvider } from '@/context/user.context';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <SockerProvider>
                <InstrumentProvider>{children}</InstrumentProvider>
            </SockerProvider>
        </UserProvider>
    );
}
