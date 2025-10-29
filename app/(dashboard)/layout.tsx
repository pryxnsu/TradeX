import React from 'react';
import { InstrumentProvider } from '@/context/instrument.context';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <InstrumentProvider>{children}</InstrumentProvider>;
}
