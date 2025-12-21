import { useInstrument } from '@/hooks/useInstrument';
import Instrument from './Instrument';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function RecentlyOpenedInstruments() {
    const { openedInstruments, handleChangeSymbol, selectedSymbol, handleCloseInstrument } = useInstrument();

    if (openedInstruments.length === 0) return null;

    return (
        <div className="flex h-full items-end gap-1 px-4">
            {openedInstruments.map(symbol => {
                const isActive = selectedSymbol === symbol;
                return (
                    <div
                        key={symbol}
                        onClick={() => handleChangeSymbol(symbol)}
                        className={cn(
                            'group relative flex h-full cursor-pointer items-center gap-2 border-b-[3px] p-4 transition-all duration-200 ease-in-out',
                            isActive ? 'border-black' : 'border-transparent hover:border-neutral-200'
                        )}
                    >
                        <Instrument symbol={symbol} iconSize={30} className="gap-2 bg-transparent p-0" />
                        {openedInstruments.length > 1 && (
                            <div
                                onClick={e => {
                                    e.stopPropagation();
                                    handleCloseInstrument(symbol);
                                }}
                                className="absolute top-1 -right-2 hidden h-fit w-fit cursor-pointer items-center rounded-sm border border-red-300 p-0.5 group-hover:flex hover:bg-red-50"
                            >
                                <X className="h-3 w-3 text-red-500" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
