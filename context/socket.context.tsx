'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SocketContext } from '@/hooks/useSocket';
import { IncomingSocketEventType, SocketMessageType, User } from '@/types';
import { getLocalStorage } from '@/lib/localStorage';
import { toast } from 'sonner';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export interface IncomingInsSocketMsgProp {
    symbol: string;
    bid: number;
    ask: number;
    time: number;
}

export type ConnectionStatus =
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error'
    | 'reconnecting';

export interface SocketContextType {
    socketRef: React.RefObject<WebSocket | null>;
    connectionStatus: ConnectionStatus;
    connectionError: string | null;
    incomingInsSocketMsg: IncomingInsSocketMsgProp[] | null;
    incomingPositionsSocketMsg: IncomingSocketEventType[];
    send: (data: SocketMessageType) => void;
}

interface SocketProviderProp {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProp> = ({ children }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [incomingInsSocketMsg, setIncomingInsSocketMsg] = useState<
        IncomingInsSocketMsgProp[] | null
    >(null);
    const [incomingPositionsSocketMsg, setIncomingPositionsSocketMsg] = useState<
        IncomingSocketEventType[]
    >([]);
    const priceCacheRef = useRef(new Map<string, IncomingInsSocketMsgProp>());

    const reconnectAttemptsRef = useRef<number>(0);
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000;
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const favInstrumentsOfUser: string[] | null = getLocalStorage('fav-instruments');

    const connect = useCallback(() => {
        if (socketRef.current) return;

        try {
            const user: User | null = getLocalStorage('user');
            if (!user) {
                console.log('Socket: Connection failed... Reload page');
                return;
            }
            console.log('Socket: Connecting...');
            setConnectionStatus('connecting');
            const socket = new WebSocket(`${WS_URL}/${user.id}`);
            socketRef.current = socket;

            connectionTimeoutRef.current = setTimeout(() => {
                if (socket.readyState !== WebSocket.OPEN) {
                    console.error('[Socket] Connection timeout');
                    setConnectionStatus('error');
                    setConnectionError('Connection timeout, Server not responding');
                    socket.close();
                    reconnect();
                }
            }, 10 * 1000);

            socket.onopen = () => {
                if (connectionTimeoutRef.current) {
                    clearTimeout(connectionTimeoutRef.current);
                    connectionTimeoutRef.current = null;
                }

                reconnectAttemptsRef.current = 0;

                setConnectionStatus('connected');
                setConnectionError(null);
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

            socket.onclose = ev => {
                if (connectionTimeoutRef.current) {
                    clearTimeout(connectionTimeoutRef.current);
                    connectionTimeoutRef.current = null;
                }

                if (ev.wasClean) {
                    socketRef.current = null;
                    setConnectionStatus('disconnected');
                    console.log('[Socket OnClose] Socket Disconnected');
                } else {
                    socketRef.current = null;
                    setConnectionStatus('error');
                    setConnectionError('Connection lost');
                    console.log('[Socket OnClose] Socket Disconnected unexpectedly');
                    reconnect();
                }
            };

            socket.onerror = (err: unknown) => {
                setConnectionStatus('error');
                setConnectionError('Something went wrong');
                console.error('Socket on error', err);
            };

            socket.onmessage = async ({ data }) => {
                const parsedData = JSON.parse(data);

                switch (parsedData.e) {
                    case 'orders': {
                        if (parsedData.t === 'new') {
                            if (parsedData.d) {
                                console.log('Order has been executed', parsedData.d.orderId);
                            }
                        } else if (parsedData.t === 'del') {
                            if (parsedData.d) {
                                console.log('Order has been deleted', parsedData.d.orderId);
                            }
                        }
                    }

                    case 'positions': {
                        const side = parsedData.d.type === 'buy' ? 'Buy' : 'Sell';
                        if (parsedData.t === 'open') {
                            if (!parsedData.d) break;

                            console.log('Position has been opened', parsedData.d.positionId);

                            toast.success('Position opened.', {
                                description: `${side} ${parsedData.d.volume} lots ${parsedData.d.instrument} at ${parsedData.d.openPrice}`,
                            });
                        } else if (parsedData.t === 'upd') {
                            console.log('Position has been updated', parsedData.d.positionId);
                        } else if (parsedData.t === 'part_close') {
                            console.log('Position has been closed parted', parsedData.d.positionId);

                            toast.success('Position closed parted', {
                                description: `${side} ${parsedData.d.volume} lots ${parsedData.d.instrument} at ${parsedData.d.openPrice}`,
                            });
                        } else if (parsedData.t === 'close') {
                            console.log('Position has been closed', parsedData.d.positionId);

                            toast.success('Position closed.', {
                                description: `${side} ${parsedData.d.volume} lots ${parsedData.d.instrument} at ${parsedData.d.openPrice}`,
                            });
                        }
                        setIncomingPositionsSocketMsg(prev => [...prev, parsedData]);
                    }

                    case 'deals': {
                        if (parsedData.t === 'in') {
                            console.log('Deals has been done!');
                        }
                    }

                    case 'account': {
                        if (parsedData.t === 'upd') {
                            if (!parsedData.d) break;
                        }
                    }
                }

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
            setConnectionStatus('error');
            setConnectionError('Something went wrong while connecting...');
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
                connectionTimeoutRef.current = null;
            }

            if (socketRef.current) {
                if (favInstrumentsOfUser) {
                    subscribeUnsubscribe('unsubscribe', 'instruments', favInstrumentsOfUser);
                }
                subscribeUnsubscribe('unsubscribe', 'orders', ['all']);
                subscribeUnsubscribe('unsubscribe', 'positions', ['all']);
                subscribeUnsubscribe('unsubscribe', 'deals', ['all']);
                subscribeUnsubscribe('unsubscribe', 'accounts', ['all']);
                socketRef.current.close();
            }
        };
    }, [subscribeUnsubscribe]);

    const reconnect = () => {
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            setConnectionStatus('error');
            setConnectionError('Failed to connect with server! Please try again later');
            console.error('[Socket] Max reconnection attempts reached');
            return;
        }

        const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
            30000
        );

        reconnectAttemptsRef.current += 1;
        setConnectionStatus('reconnecting');

        console.log(
            `[Socket] Reconnecting in ${delay}ms... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
        );

        socketRef.current = null;

        setTimeout(() => connect(), delay);
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (priceCacheRef.current.size > 0) {
                const latestPrices = Array.from(
                    priceCacheRef.current.values()
                ) as IncomingInsSocketMsgProp[];
                setIncomingInsSocketMsg(latestPrices);
            }
        }, 100);
        return () => clearInterval(intervalId);
    }, []);

    const value = {
        socketRef,
        connectionStatus,
        connectionError,
        incomingInsSocketMsg,
        incomingPositionsSocketMsg,
        send,
    };
    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
