'use client';

import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Star, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Instrument from './Instrument';
import { TableCell, TableRow } from '@/components/ui/table';
import { InstrumentProp } from './Instruments';
import { useInstrument } from '@/hooks/useInstrument';

export function InstrumentRow({
    instrument,
    flashBidColor,
    flashAskColor,
}: {
    instrument: InstrumentProp;
    flashBidColor: string | null;
    flashAskColor: string | null;
}) {
    const isPositive =
        String(instrument?.change).startsWith('-') === false && String(instrument.change) !== '-';
    const isNegative =
        String(instrument?.change).startsWith('-') && String(instrument.change) !== '-';

    // change selected symbol
    const { handleChangeSymbol } = useInstrument();

    // one day change
    const oneDayChange = isPositive ? '+' + instrument.change : instrument.change;
    return (
        <TableRow className="select-none">
            <TableCell
                onClick={() => handleChangeSymbol(instrument.symbol, 'forex')}
                className="flex items-center gap-2"
            >
                <span className="cursor-pointer">
                    <GripVertical size={16} />
                </span>
                <Instrument symbol={instrument.symbol} iconSize={25} />
            </TableCell>

            <TableCell className="text-center">
                <div
                    className={`inline-flex rounded p-1 ${
                        instrument?.signal === 'up'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}
                >
                    {instrument?.signal === 'up' ? (
                        <ArrowUp className="h-4 w-4" />
                    ) : (
                        <ArrowDown className="h-4 w-4" />
                    )}
                </div>
            </TableCell>

            <TableCell>
                <div
                    className={`mx-2 rounded px-2 py-1 font-mono text-xs font-semibold transition-colors duration-200 ${flashBidColor}`}
                >
                    {instrument.bid.toLocaleString()}
                </div>
            </TableCell>

            <TableCell>
                <div
                    className={`mx-2 rounded px-2 py-1 font-mono text-xs font-semibold transition-colors duration-200 ${flashAskColor}`}
                >
                    {instrument.ask.toLocaleString()}
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
                            className={`font-mono text-xs font-semibold ${
                                isPositive
                                    ? 'text-green-600'
                                    : isNegative
                                      ? 'text-red-600'
                                      : 'text-foreground'
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

            <TableCell className="font-mono text-xs">{instrument?.pl ?? '-'}</TableCell>

            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    // TODO: add request to remove from favorite
                    className="cursor-pointer text-yellow-500 hover:bg-transparent hover:text-yellow-600"
                >
                    <Star className="h-5 w-5" fill="currentColor" stroke="currentColor" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
