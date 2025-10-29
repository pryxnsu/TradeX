import type { InstrumentContextType } from '@/context/instrument.context';
import { createContext, useContext } from 'react';

export const InstrumentContext = createContext<InstrumentContextType | null>(null);

export const useInstrument = () => {
    const context = useContext(InstrumentContext);
    if (!context) {
        throw new Error('Instrument must be use in Instrument Provider');
    }
    return context;
};
