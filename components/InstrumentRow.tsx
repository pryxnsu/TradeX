'use client';


import { useState } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Star, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Instrument from './Instrument';
import { TableCell, TableRow } from '@/components/ui/table';

interface Instrument {
    id: number;
    symbol: string;
    signal: 'up' | 'down';
    bid: string;
    ask: string;
    change: string;
    changePercent: string;
    pl: string;
    trend: 'up' | 'down' | null;
    isFavorite: boolean;
}

interface InstrumentRowProps {
    instrument: Instrument;
}

export function InstrumentRow({ instrument }: InstrumentRowProps) {
    const [isFavorite, setIsFavorite] = useState(instrument.isFavorite);
    const isPositive = instrument.changePercent.startsWith('-') === false && instrument.changePercent !== '-';
    const isNegative = instrument.changePercent.startsWith('-') && instrument.changePercent !== '-';

    return (
        <TableRow className="select-none">
            <TableCell className="flex items-center gap-2">
                <span className="cursor-pointer">
                    <GripVertical size={16} />
                </span>
                <Instrument symbol={instrument.symbol} iconSize={20} />
            </TableCell>

            <TableCell className="text-center">
                <div
                    className={`inline-flex rounded p-1 ${
                        instrument.signal === 'up'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {instrument.signal === 'up' ? (
                        <ArrowUp className="h-4 w-4" />
                    ) : (
                        <ArrowDown className="h-4 w-4" />
                    )}
                </div>
            </TableCell>

            <TableCell>
                <div
                    className={`rounded px-2 py-1 font-mono text-sm font-semibold ${
                        instrument.signal === 'up'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {instrument.bid}
                </div>
            </TableCell>

            <TableCell>
                <div
                    className={`rounded px-2 py-1 font-mono text-sm font-semibold ${
                        instrument.signal === 'up'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {instrument.ask}
                </div>
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {isPositive ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : isNegative ? (
                            <ArrowDown className="h-4 w-4 text-red-600" />
                        ) : null}
                        <span
                            className={`font-mono text-sm font-semibold ${
                                isPositive
                                    ? 'text-green-600'
                                    : isNegative
                                      ? 'text-red-600'
                                      : 'text-foreground'
                            }`}
                        >
                            {instrument.change}
                        </span>
                    </div>
                    {instrument.trend && (
                        <div className="flex h-6 w-12 items-center justify-center">
                            {instrument.trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                        </div>
                    )}
                </div>
            </TableCell>

            <TableCell className="font-mono text-sm">{instrument.pl}</TableCell>

            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="text-yellow-500 hover:text-yellow-600"
                >
                    <Star
                        className="h-5 w-5"
                        fill={isFavorite ? 'currentColor' : 'none'}
                        stroke={isFavorite ? 'currentColor' : 'currentColor'}
                    />
                </Button>
            </TableCell>
        </TableRow>
    );
}
