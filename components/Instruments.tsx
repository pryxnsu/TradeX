'use client';

import { useEffect, useState } from 'react';
import { MoreVertical, Search, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PanelTypes } from '@/types';
import { InstrumentRow } from './InstrumentRow';
import { Input } from './ui/input';
import { Spinner } from './ui/spinner';

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
                                instruments?.map(instrument => (
                                    <InstrumentRow
                                        key={instrument?.symbol}
                                        instrument={instrument}
                                    />
                                ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
