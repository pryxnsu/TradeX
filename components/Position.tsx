'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, X } from 'lucide-react';
import { ClosedPositonProp } from '@/types';
import { getDate } from '@/lib/helper';
import { cn } from '@/lib/utils';
import Instrument from './Instrument';

export default function Position({
    activeTab,
    p,
}: {
    activeTab: string;
    p: ClosedPositonProp[];
}) {
    return (
        <div className="h-full bg-card overflow-hidden rounded-md">
            <div className="overflow-x-auto">
                <Table className='h-full'>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-foreground font-semibold">Symbol</TableHead>
                            <TableHead className="text-foreground font-semibold">Type</TableHead>
                            <TableHead className="text-foreground text-right font-semibold">
                                Volume, lot
                            </TableHead>
                            <TableHead className="text-foreground text-right font-semibold">
                                Open Price
                            </TableHead>
                            {activeTab === 'closed' ? (
                                <TableHead className="text-foreground text-right font-semibold">
                                    Close Price
                                </TableHead>
                            ) : (
                                <TableHead className="text-foreground text-right font-semibold">
                                    Current Price
                                </TableHead>
                            )}
                            <TableHead className="text-foreground font-semibold">T/P</TableHead>
                            <TableHead className="text-foreground font-semibold">S/L</TableHead>
                            <TableHead className="text-foreground font-semibold">
                                Position
                            </TableHead>
                            <TableHead className="text-foreground font-semibold">
                                Open Time
                            </TableHead>
                            {activeTab === 'closed' && (
                                <TableHead className="text-foreground font-semibold">
                                    Close Time
                                </TableHead>
                            )}
                            <TableHead className="text-foreground text-right font-semibold">
                                Swap, USD
                            </TableHead>
                            <TableHead className="text-foreground text-right font-semibold">
                                P/L, USD
                            </TableHead>
                            {activeTab === 'open' && (
                                <TableHead className="text-foreground font-semibold">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {p.map(pos => (
                            <TableRow
                                key={'dealId' in pos ? pos.dealId : pos.position}
                                className="border-border hover:bg-muted/30"
                            >
                                <TableCell className="text-foreground font-semibold py-2">
                                    <div className="flex items-center gap-2">
                                        <Instrument symbol={pos.symbol} iconSize={24}/>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className={cn(
                                            pos.type === 0 ? 'text-blue-500' : 'text-red-500'
                                        )}
                                    >
                                        ● {pos.type == 0 ? 'Buy' : 'Sell'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-foreground text-left">
                                    {pos.volume.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-foreground text-left">
                                    {pos.openPrice.toLocaleString()}
                                </TableCell>
                                {'closePrice' in pos ? (
                                    <TableCell className="text-foreground text-left">
                                        {pos.closePrice?.toLocaleString()}
                                    </TableCell>
                                ) : (
                                    <TableCell className="text-foreground text-left">
                                        {pos.currentPrice.toLocaleString()}
                                    </TableCell>
                                )}
                                <TableCell className="text-center text-foreground">
                                    {pos.tp > 0 ? pos.tp?.toFixed(2) : '-'}
                                </TableCell>
                                <TableCell className="text-center text-foreground">
                                    {pos.sl > 0 ? pos.sl?.toFixed(2) : '-'}
                                </TableCell>
                                <TableCell className="text-foreground w-42 truncate font-mono text-sm">
                                    <div className="max-w-42 truncate">{pos.position}</div>
                                </TableCell>
                                <TableCell className="text-foreground text-sm">
                                    {getDate(pos.openTime)}
                                </TableCell>
                                {'closeTime' in pos && pos.closeTime && (
                                    <TableCell className="text-foreground text-sm">
                                        {getDate(pos.closeTime)}
                                    </TableCell>
                                )}
                                <TableCell className="text-foreground text-right">
                                    {pos.swap && pos?.swap > 0 ? pos.swap : '-'}
                                </TableCell>
                                <TableCell
                                    className={`text-right font-semibold ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {pos.pnl > 0 && '+'}
                                    {pos?.pnl.toFixed(2)}
                                </TableCell>
                                {activeTab === 'open' && (
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
