import { BidContextType } from '@/context/bid.context';
import { createContext, useContext } from 'react';

export const BidContext = createContext<BidContextType | null>(null);

export const useBid = () => {
    const context = useContext(BidContext);
    if (!context) {
        throw new Error('Bid must be use in Bid Provider');
    }
    return context;
};
