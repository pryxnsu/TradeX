import { AccountContextType } from '@/context/account.context';
import { createContext, useContext } from 'react';

export const AccountContext = createContext<AccountContextType | null>(null);

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('Account must be use in Account Provider');
    }
    return context;
};
