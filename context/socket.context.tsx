'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SocketContext } from '@/hooks/useSocket';
import { SocketMessageType, User } from '@/types';
import { getLocalStorage } from '@/lib/localStorage';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

interface FavInsSocketMsgProp {
    symbol: string;
    bid: number;
    ask: number;
}

export interface SocketContextType {
    socketRef: React.RefObject<WebSocket | null>;
    isConnected: boolean;
    favInsSocketMsg: FavInsSocketMsgProp[] | null;
    send: (data: SocketMessageType) => void;
}

interface SockerProviderProp {
    children: React.ReactNode;
}

export const SockerProvider: React.FC<SockerProviderProp> = ({ children }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [favInsSocketMsg, setFavInsSocketMsg] = useState<FavInsSocketMsgProp[] | null>(null);
    const priceCache = useRef(new Map<string, FavInsSocketMsgProp>());

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

    // subscribe instrument
    const subscribeInstruments = useCallback(
        (symbols: string[]) => {
            const subscribeMessage = {
                subscribe: {
                    event: 'instruments',
                    symbols,
                },
            };
            try {
                send(subscribeMessage);
            } catch (err: unknown) {
                console.error('[Error] occurred in subscribe instrument', err);
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
                        subscribeInstruments(favInstrumentsOfUser);
                    }
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
                    console.log(parsedData);
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
                                const priceData = parsedData as {
                                    symbol: string;
                                    bid: number;
                                    ask: number;
                                };
                                priceCache.current.set(parsedData.symbol, priceData);
                                break;
                            } else if (parsedData['open']) {
                                console.log('candle instrument triggered');
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
                socketRef.current.close();
            }
        };
    }, [subscribeInstruments]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (priceCache.current.size > 0) {
                const latestPrices = Array.from(
                    priceCache.current.values()
                ) as FavInsSocketMsgProp[];
                setFavInsSocketMsg(latestPrices);
            }
        }, 500);
        return () => clearInterval(intervalId);
    }, []);

    const value = {
        socketRef,
        isConnected,
        favInsSocketMsg,
        send,
    };
    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
