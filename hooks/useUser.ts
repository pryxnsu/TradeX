import { UserContextType } from '@/context/user.context';
import { createContext, useContext } from 'react';

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('User must be use in User Provider');
    }
    return context;
};
