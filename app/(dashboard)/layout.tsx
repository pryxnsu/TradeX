import React from 'react';
import { InstrumentProvider } from '@/context/instrument.context';
import { SocketProvider } from '@/context/socket.context';
import { UserProvider } from '@/context/user.context';
import { AccountProvider } from '@/context/account.context';
import Loader from '@/components/Loader';
import { BidProvider } from '@/context/bid.context';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <SocketProvider>
                <AccountProvider>
                    <InstrumentProvider>
                        <BidProvider>
                            <Loader>{children}</Loader>
                        </BidProvider>
                    </InstrumentProvider>
                </AccountProvider>
            </SocketProvider>
        </UserProvider>
    );
}
