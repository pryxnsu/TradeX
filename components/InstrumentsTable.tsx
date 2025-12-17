import { Search, Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InstrumentRow } from './InstrumentRow';
import { InstrumentProp } from '@/types';
import { Spinner } from './ui/spinner';

export default function InstrumentsTable({
    isLoading,
    instruments,
    flashColors,
    isSearched,
    addInstrumentToFavorite,
    removeInstrumentToFavorite,
}: {
    isLoading: boolean;
    instruments: InstrumentProp[];
    flashColors: Map<string, { ask: string | null; bid: string | null }>;
    isSearched: boolean;
    addInstrumentToFavorite: (instrumentId: string) => void;
    removeInstrumentToFavorite: (instrumentId: string) => void;
}) {
    return (
        <>
            {instruments.length > 0 ? (
                <Table className="flex-1">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Symbol</TableHead>
                            <TableHead className="min-w-25 p-1 px-3 text-center">Signal</TableHead>
                            <TableHead className="min-w-25 p-1 px-3">Bid</TableHead>
                            <TableHead className="min-w-25 p-1 px-3">Ask</TableHead>
                            <TableHead className="w-[150px]">1D change</TableHead>
                            <TableHead className="w-[120px]">P/L, USD</TableHead>
                            <TableHead className="w-[60px]">
                                <Star size={15} className="w-full text-center" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <div className="flex w-full items-center justify-center py-4">
                                        <Spinner />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            instruments?.map(instrument => {
                                const flash = flashColors.get(instrument.symbol);
                                return (
                                    <InstrumentRow
                                        key={instrument?.symbol}
                                        instrument={instrument}
                                        flashAskColor={flash?.ask || null}
                                        flashBidColor={flash?.bid || null}
                                        isSearched={isSearched}
                                        isFavorite={instrument.isFavorite === true ? true : false}
                                        onAddToFav={addInstrumentToFavorite}
                                        onRemoveFromFav={removeInstrumentToFavorite}
                                    />
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                    <div>
                        <Search size={50} className="opacity-50" />
                    </div>
                    <p className="text-sm">No Instrument found</p>
                </div>
            )}
        </>
    );
}
