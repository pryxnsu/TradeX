'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SocketContext } from '@/hooks/useSocket';
import { SocketMessageType, User } from '@/types';
import { getLocalStorage } from '@/lib/localStorage';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export interface IncomingInsSocketMsgProp {
    symbol: string;
    bid: number;
    ask: number;
    time: number;
}

export interface SocketContextType {
    socketRef: React.RefObject<WebSocket | null>;
    isConnected: boolean;
    incomingInsSocketMsg: IncomingInsSocketMsgProp[] | null;
    send: (data: SocketMessageType) => void;
}

interface SocketProviderProp {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProp> = ({ children }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [incomingInsSocketMsg, setIncomingInsSocketMsg] = useState<IncomingInsSocketMsgProp[] | null>(null);
    const priceCacheRef = useRef(new Map<string, IncomingInsSocketMsgProp>());

    // send message to ws server
    const send = useCallback((msg: SocketMessageType) => {
        try {
            if (socketRef.current && socketRef.current.readyState == WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify(msg));
            } else {
                console.error('[Error] socket not connected, Failed to send message:', msg);
            }
        } catch (err: unknown) {
            console.error('[Error] occurred in send event over ws', err);
        }
    }, []);

    // send subscribe or unsubscribe instruments and chart event message to ws server
    const subscribeUnsubscribe = useCallback(
        (action: 'subscribe' | 'unsubscribe', event: string, symbols: string[]) => {
            let message: SocketMessageType;
            if (action === 'subscribe') {
                message = {
                    subscribe: { event, symbols },
                };
            } else {
                message = {
                    unsubscribe: { event, symbols },
                };
            }
            try {
                send(message);
            } catch (err: unknown) {
                console.error(`[Error] in ${action} instruments: ${err}`);
            }
        },
        [send]
    );

    useEffect(() => {
        if (socketRef.current) return;
        const favInstrumentsOfUser: string[] | null = getLocalStorage('fav-instruments');
        const connect = () => {
            try {
                const user: User | null = getLocalStorage('user');
                if (!user) {
                    console.log('Socket: Connection failed... Reload page');
                    return;
                }
                console.log('Socket: Connecting...');
                const socket = new WebSocket(`${WS_URL}/${user.id}`);
                socketRef.current = socket;

                socket.onopen = () => {
                    setIsConnected(true);
                    console.log('Socket: Connected');

                    if (favInstrumentsOfUser) {
                        // send event of subscribe favorite symbols
                        subscribeUnsubscribe('subscribe', 'instruments', favInstrumentsOfUser);
                    }

                    // subscribes orders, positions, deals, accounts
                    subscribeUnsubscribe('subscribe', 'orders', ['all']);
                    subscribeUnsubscribe('subscribe', 'positions', ['all']);
                    subscribeUnsubscribe('subscribe', 'deals', ['all']);
                    subscribeUnsubscribe('subscribe', 'account', ['all']);
                };

                socket.onclose = () => {
                    socketRef.current = null;
                    setIsConnected(false);
                    console.log('Socket: Disconnected');
                };

                socket.onerror = (err: unknown) => {
                    console.error('Socket on error', err);
                };

                socket.onmessage = async ({ data }) => {
                    const parsedData = JSON.parse(data);
                    switch (parsedData.event) {
                        case 'subscribe': {
                            console.log(`Socket: Subcribed to: ${favInstrumentsOfUser}`);
                            break;
                        }

                        case 'unsubscribe': {
                            console.log(`Socket: Unsubcribed symbol success`);
                            break;
                        }

                        default: {
                            // Favorite instrument data
                            if (parsedData['bid']) {
                                const priceData = parsedData as IncomingInsSocketMsgProp;
                                priceCacheRef.current.set(priceData.symbol, priceData);
                                break;
                            }
                        }
                    }
                };
            } catch (err: unknown) {
                console.error('[Error] Failed to connect to websocket', err);
            }
        };
        connect();

        return () => {
            if (socketRef.current) {
                if (favInstrumentsOfUser) {
                    subscribeUnsubscribe('subscribe', 'instruments', favInstrumentsOfUser);
                }
                subscribeUnsubscribe('unsubscribe', 'orders', ['all']);
                subscribeUnsubscribe('unsubscribe', 'positions', ['all']);
                subscribeUnsubscribe('unsubscribe', 'deals', ['all']);
                subscribeUnsubscribe('unsubscribe', 'accounts', ['all']);
                socketRef.current.close();
            }
        };
    }, [subscribeUnsubscribe]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (priceCacheRef.current.size > 0) {
                const latestPrices = Array.from(
                    priceCacheRef.current.values()
                ) as IncomingInsSocketMsgProp[];
                setIncomingInsSocketMsg(latestPrices);
            }
        }, 500);
        return () => clearInterval(intervalId);
    }, []);

    const value = {
        socketRef,
        isConnected,
        incomingInsSocketMsg,
        send,
    };
    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
