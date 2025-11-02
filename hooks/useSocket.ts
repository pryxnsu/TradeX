import type { SocketContextType } from '@/context/socket.context';
import { createContext, useContext } from 'react';

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('Socket must be use in Socket Provider');
    }
    return context;
};
