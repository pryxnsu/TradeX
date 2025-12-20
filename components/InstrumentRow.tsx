'use client';

import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Star, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Instrument from './Instrument';
import { TableCell, TableRow } from '@/components/ui/table';
import { InstrumentProp } from '@/types';
import { useInstrument } from '@/hooks/useInstrument';

export function InstrumentRow({
    instrument,
    flashBidColor,
    flashAskColor,
    isSearched,
    isFavorite,
    onAddToFav,
    onRemoveFromFav,
}: {
    instrument: InstrumentProp;
    flashBidColor: string | null;
    flashAskColor: string | null;
    isSearched?: boolean;
    isFavorite: boolean;
    onAddToFav: (instrumentId: string) => void;
    onRemoveFromFav: (instrumentId: string) => void;
}) {
    const isPositive = String(instrument?.change).startsWith('-') === false && String(instrument.change) !== '-';
    const isNegative = String(instrument?.change).startsWith('-') && String(instrument.change) !== '-';

    // change selected symbol
    const { handleChangeSymbol } = useInstrument();

    // one day change
    const oneDayChange = isPositive ? '+' + instrument.change : instrument.change;
    return (
        <TableRow className="border-b select-none">
            <TableCell
                onClick={() => handleChangeSymbol(instrument.symbol)}
                className="sticky left-0 z-10 border-r bg-white px-3 shadow-[1px_0_0_0_#e5e7eb]"
            >
                <div className="flex items-center gap-2">
                    {isSearched === false && (
                        <span className="cursor-pointer">
                            <GripVertical size={16} />
                        </span>
                    )}
                    <Instrument symbol={instrument.symbol} iconSize={25} />
                </div>
            </TableCell>

            <TableCell className="z-5 text-center">
                <div
                    className={cn(
                        'inline-flex rounded-xs p-[2px]',
                        instrument?.signal === 'up' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    )}
                >
                    {instrument?.signal === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </div>
            </TableCell>

            <TableCell className="">
                <div
                    className={cn(
                        'mx-1 w-fit min-w-25 rounded px-2 py-1 font-mono text-xs font-semibold transition-colors duration-200',
                        flashBidColor
                    )}
                >
                    {instrument.bid.toLocaleString()}
                </div>
            </TableCell>

            <TableCell className="">
                <div
                    className={cn(
                        'mx-1 w-fit min-w-25 rounded px-2 py-1 font-mono text-xs font-semibold transition-colors duration-200',
                        flashAskColor
                    )}
                >
                    {instrument.ask.toLocaleString()}
                </div>
            </TableCell>

            <TableCell className="">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {isPositive ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : isNegative ? (
                            <ArrowDown className="h-4 w-4 text-red-600" />
                        ) : null}
                        <span
                            className={`font-mono text-xs font-semibold ${
                                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-foreground'
                            }`}
                        >
                            {oneDayChange}
                        </span>
                    </div>
                    {instrument.signal && (
                        <div className="flex h-6 w-12 items-center justify-center">
                            {instrument.signal === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                        </div>
                    )}
                </div>
            </TableCell>

            <TableCell className="px-3 font-mono text-xs">{instrument?.pl ?? '-'}</TableCell>

            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={
                        isFavorite === true ? () => onRemoveFromFav(instrument.id) : () => onAddToFav(instrument.id)
                    }
                    className={cn(
                        'cursor-pointer hover:bg-transparent',
                        isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-black hover:text-black'
                    )}
                >
                    <Star className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
