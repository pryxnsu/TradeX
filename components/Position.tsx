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
import { ClosedPositonProp, OpenPositionProp } from '@/types';
import { getDate } from '@/lib/helper';
import { cn } from '@/lib/utils';
import Instrument from './Instrument';

export default function Position({
    activeTab,
    p,
}: {
    activeTab: string;
    p: OpenPositionProp[] | ClosedPositonProp[];
}) {
    return (
        <div className="bg-card flex h-full flex-col overflow-hidden rounded-md pb-2">
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10">
                        <TableRow className="border-border">
                            <TableHead>Symbol</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Volume, lot</TableHead>
                            <TableHead>Open Price</TableHead>
                            {activeTab === 'closed' ? (
                                <TableHead>Close Price</TableHead>
                            ) : (
                                <TableHead>Current Price</TableHead>
                            )}
                            <TableHead>T/P</TableHead>
                            <TableHead>S/L</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Open Time</TableHead>
                            {activeTab === 'closed' && <TableHead>Close Time</TableHead>}
                            <TableHead>Swap, USD</TableHead>
                            <TableHead>P/L, USD</TableHead>
                            {activeTab === 'open' && <TableHead>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {p.map(pos => (
                            <TableRow
                                key={'dealId' in pos ? pos.dealId : pos.position}
                                className="border-border hover:bg-muted/30"
                            >
                                <TableCell className="text-foreground py-[3px] font-semibold">
                                    <div className="flex items-center gap-2">
                                        <Instrument symbol={pos.symbol} iconSize={24} />
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
                                <TableCell className="text-foreground text-center">
                                    {pos.tp > 0 ? pos.tp?.toFixed(2) : '-'}
                                </TableCell>
                                <TableCell className="text-foreground text-center">
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
