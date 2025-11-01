import React from 'react';
import { InstrumentProvider } from '@/context/instrument.context';
import { UserProvider } from '@/context/user.context';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <InstrumentProvider>{children}</InstrumentProvider>;
        </UserProvider>
    );
}
