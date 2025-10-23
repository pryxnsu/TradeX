'use client';

import { useState } from 'react';
import { MoreVertical, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PanelTypes } from '@/types';
import { InstrumentRow } from './InstrumentRow';
import { Input } from './ui/input';

// for testing
const instruments = [
    {
        id: 1,
        symbol: 'AAPL',
        signal: 'down' as const,
        bid: '257.53',
        ask: '257.67',
        change: '-',
        changePercent: '-',
        pl: '-',
        trend: null,
        isFavorite: true,
    },
    {
        id: 2,
        symbol: 'EUR/USD',
        signal: 'up' as const,
        bid: '1.15946',
        ask: '1.15954',
        change: '0.11%',
        changePercent: '-0.11%',
        pl: '-',
        trend: 'down' as const,
        isFavorite: true,
    },
    {
        id: 3,
        symbol: 'GBP/USD',
        signal: 'up' as const,
        bid: '1.33490',
        ask: '1.33500',
        change: '0.01%',
        changePercent: '-0.01%',
        pl: '-',
        trend: 'down' as const,
        isFavorite: true,
    },
    {
        id: 4,
        symbol: 'USD/JPY',
        signal: 'up' as const,
        bid: '152.643',
        ask: '152.653',
        change: '0.43%',
        changePercent: '0.43%',
        pl: '-',
        trend: 'up' as const,
        isFavorite: true,
    },
    {
        id: 5,
        symbol: 'USTEC',
        signal: 'down' as const,
        bid: '24,947.35',
        ask: '24,948.14',
        change: '0.32%',
        changePercent: '0.32%',
        pl: '-',
        trend: 'up' as const,
        isFavorite: true,
    },
    {
        id: 6,
        symbol: 'USOIL',
        signal: 'up' as const,
        bid: '61.297',
        ask: '61.315',
        change: '2.14%',
        changePercent: '2.14%',
        pl: '-',
        trend: 'up' as const,
        isFavorite: true,
    },
];

export default function Instruments({ onClose }: { onClose: (type: PanelTypes) => void }) {
    const [searchQuery, setSearchQuery] = useState<string>('');
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
                <Table className="flex-1">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Symbol</TableHead>
                            <TableHead className="w-[80px] text-center">Signal</TableHead>
                            <TableHead className="w-[120px]">Bid</TableHead>
                            <TableHead className="w-[120px]">Ask</TableHead>
                            <TableHead className="w-[150px]">1D change</TableHead>
                            <TableHead className="w-[120px]">P/L, USD</TableHead>
                            <TableHead className="w-[60px] text-right">★</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {instruments.map(instrument => (
                            <InstrumentRow key={instrument.id} instrument={instrument} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
