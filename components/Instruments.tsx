'use client';

import { useEffect, useState } from 'react';
import { MoreVertical, Search, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PanelTypes } from '@/types';
import { InstrumentRow } from './InstrumentRow';
import { Input } from './ui/input';
import { Spinner } from './ui/spinner';
import { useSocket } from '@/hooks/useSocket';
import { setLocalStorage } from '@/lib/localStorage';

export interface InstrumentProp {
    signal: string;
    symbol: string;
    bid: number;
    ask: number;
    change: string;
    pl?: string;
}

export default function Instruments({ onClose }: { onClose: (type: PanelTypes) => void }) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [instruments, setInstruments] = useState<InstrumentProp[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [flashColors, setFlashColors] = useState<
        Map<string, { ask: string | null; bid: string | null }>
    >(new Map());

    useEffect(() => {
        const fetchFavoritesInstruments = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/instruments/favorites`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setInstruments(data.data);
                    const favSymbols = data.data.map((ins: InstrumentProp) => ins.symbol);
                    setLocalStorage('fav-instruments', favSymbols);
                }
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'An unexpected error occurred while parsing';
                setError(errorMessage);
                console.error('Error in fetching instruments', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavoritesInstruments();
    }, []);

    // update prices of instrument sent by ws server
    const { favInsSocketMsg } = useSocket();

    useEffect(() => {
        if (!favInsSocketMsg || !Array.isArray(favInsSocketMsg)) return;

        setInstruments(prev => {
            const newFlashColors = new Map<string, { ask: string | null; bid: string | null }>();

            const updatedInstruments = prev.map(ins => {
                const priceData = favInsSocketMsg.find(
                    (msg: { symbol: string }) => msg.symbol === ins.symbol
                );
                if (priceData) {
                    const askFlash =
                        priceData.ask > ins.ask
                            ? 'bg-green-500 text-white'
                            : priceData.ask < ins.ask
                              ? 'bg-red-500 text-white'
                              : null;

                    const bidFlash =
                        priceData.bid > ins.bid
                            ? 'bg-green-500 text-white'
                            : priceData.bid < ins.bid
                              ? 'bg-red-500 text-white'
                              : null;

                    // Store flash colors per symbol
                    if (askFlash || bidFlash) {
                        newFlashColors.set(ins.symbol, { ask: askFlash, bid: bidFlash });
                    }

                    return {
                        ...ins,
                        bid: priceData.bid,
                        ask: priceData.ask,
                    };
                }
                return ins;
            });

            // Update flash colors map
            if (newFlashColors.size > 0) {
                setFlashColors(newFlashColors);

                setTimeout(() => {
                    setFlashColors(current => {
                        const updated = new Map(current);
                        newFlashColors.forEach((_, symbol) => {
                            updated.delete(symbol);
                        });
                        return updated;
                    });
                }, 500);
            }

            return updatedInstruments;
        });
    }, [favInsSocketMsg]);

    if (error && !isLoading) {
        return <div className="p-4">{error}</div>;
    }
    return (
        <div className="mx-auto p-3">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-sm text-black">INSTRUMENTS</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-foreground">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={() => onClose(null)}
                        variant="ghost"
                        size="icon"
                        className="text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
                    <Input
                        placeholder="Search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-background border-input text-foreground placeholder:text-muted-foreground pl-10"
                    />
                </div>
            </div>

            <div className="bg-card h-full overflow-hidden rounded-lg">
                {isLoading ? (
                    <div className="w-full">
                        <Spinner className="mx-auto size-6" />
                    </div>
                ) : (
                    <Table className="flex-1">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Symbol</TableHead>
                                <TableHead className="w-20 text-center">Signal</TableHead>
                                <TableHead className="w-[120px]">Bid</TableHead>
                                <TableHead className="w-[120px]">Ask</TableHead>
                                <TableHead className="w-[150px]">1D change</TableHead>
                                <TableHead className="w-[120px]">P/L, USD</TableHead>
                                <TableHead className="w-[60px]">
                                    <Star size={15} className="w-full text-center" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!isLoading &&
                                instruments?.map(instrument => {
                                    const flash = flashColors.get(instrument.symbol);
                                    return (
                                        <InstrumentRow
                                            key={instrument?.symbol}
                                            instrument={instrument}
                                            flashAskColor={flash?.ask || null}
                                            flashBidColor={flash?.bid || null}
                                        />
                                    );
                                })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
