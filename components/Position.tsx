'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, X } from 'lucide-react';
import { ClosedPositonProp, OpenPositionProp } from '@/types';
import { getDate } from '@/lib/helper';
import { cn } from '@/lib/utils';
import Instrument from './Instrument';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from './ui/label';

export default function Position({
    activeTab,
    p,
    onClose,
}: {
    activeTab: string;
    p: OpenPositionProp[] | ClosedPositonProp[];
    onClose?: (positionId: string, price: number, volume: number, closeById: number) => void;
}) {
    const [partialCloseVolume, setPartialCloseVolume] = useState<number>(0.1);
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
                                    <div className={cn(pos.type === 0 ? 'text-blue-500' : 'text-red-500')}>
                                        ● {pos.type == 0 ? 'Buy' : 'Sell'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-foreground text-left">{pos.volume.toFixed(2)}</TableCell>
                                <TableCell className="text-foreground text-left underline decoration-dashed">
                                    {pos.openPrice.toLocaleString()}
                                </TableCell>
                                {'closePrice' in pos ? (
                                    <TableCell className="text-foreground text-left underline decoration-dashed">
                                        {pos.closePrice?.toLocaleString()}
                                    </TableCell>
                                ) : (
                                    <TableCell className="text-foreground text-left underline decoration-dashed">
                                        {pos.currentPrice.toLocaleString()}
                                    </TableCell>
                                )}
                                <TableCell className="text-foreground px-1 text-center underline decoration-dashed">
                                    {pos.tp > 0 ? pos.tp?.toFixed(2) : '-'}
                                </TableCell>
                                <TableCell className="text-foreground px-1 text-center underline decoration-dashed">
                                    {pos.sl > 0 ? pos.sl?.toFixed(2) : '-'}
                                </TableCell>
                                <TableCell className="text-foreground w-42 truncate px-1 font-mono text-sm">
                                    <div className="max-w-42 truncate">{pos.position}</div>
                                </TableCell>
                                <TableCell className="text-foreground text-sm">{getDate(pos.openTime)}</TableCell>
                                {'closeTime' in pos && pos.closeTime && (
                                    <TableCell className="text-foreground px-1 text-sm">
                                        {getDate(pos.closeTime)}
                                    </TableCell>
                                )}
                                <TableCell className="text-foreground px-1 text-right">
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
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>

                                                <DialogContent className="w-1/3 rounded-xl px-5 py-3">
                                                    <DialogHeader className="space-y-1">
                                                        <DialogTitle className="flex items-center justify-between text-lg font-semibold">
                                                            <Instrument symbol={pos.symbol} iconSize={30} />
                                                            <span
                                                                className={cn(
                                                                    'mr-6 text-right text-sm',
                                                                    pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                                                                )}
                                                            >
                                                                {pos.pnl > 0 && '+'}
                                                                {pos?.pnl.toFixed(2)}
                                                            </span>
                                                        </DialogTitle>

                                                        <DialogDescription className="text-base">
                                                            {pos.volume} lots
                                                        </DialogDescription>

                                                        <DialogDescription className="flex justify-between">
                                                            <span>Buy at {pos.openPrice}</span>
                                                            {'currentPrice' in pos && <span>{pos?.currentPrice}</span>}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="mt-4 space-y-4">
                                                        <div className="grid gap-2">
                                                            <Label>Volume to close</Label>
                                                            <Input
                                                                onChange={e =>
                                                                    setPartialCloseVolume(Number(e.target.value))
                                                                }
                                                                id="close-volume"
                                                                placeholder="0.1"
                                                                defaultValue="0.1"
                                                                type="number"
                                                                step="0.01"
                                                            />

                                                            {partialCloseVolume > pos.volume && (
                                                                <p>
                                                                    Error: Close volume cant be more than existing
                                                                    volume
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button
                                                                disabled={partialCloseVolume > pos.volume}
                                                                variant={'destructive'}
                                                                className="w-full"
                                                                onClick={() => {
                                                                    if ('currentPrice' in pos) {
                                                                        onClose?.(
                                                                            pos.position,
                                                                            pos.currentPrice,
                                                                            partialCloseVolume,
                                                                            0.1
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                Partial Close
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                    <p className="text-center text-sm">
                                                        Estimate profit:{' '}
                                                        <span
                                                            className={cn(
                                                                pos.pnl > 0 ? 'text-green-500' : 'text-red-500'
                                                            )}
                                                        >
                                                            {pos.pnl > 0 && '+'}
                                                            {pos?.pnl.toFixed(2)}
                                                        </span>
                                                    </p>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                onClick={() => {
                                                    if ('currentPrice' in pos) {
                                                        onClose?.(pos.position, pos.currentPrice, pos.volume, 0);
                                                    }
                                                }}
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
