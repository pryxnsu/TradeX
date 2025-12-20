'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MoreVertical, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstrumentProp, PanelTypes } from '@/types';
import { Input } from './ui/input';
import { Spinner } from './ui/spinner';
import { useSocket } from '@/hooks/useSocket';
import { setLocalStorage } from '@/lib/localStorage';
import { useInstrument } from '@/hooks/useInstrument';
import { toast } from 'sonner';
import InstrumentsTable from './InstrumentsTable';
import { addToFavorite, removeFromFavorite } from '@/lib/helper';
import { useDebouncedCallback } from 'use-debounce';

export default function Instruments({ onClose }: { onClose: (type: PanelTypes) => void }) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [instruments, setInstruments] = useState<InstrumentProp[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchedInstruments, setSearchedInstruments] = useState<InstrumentProp[]>([]);
    const [flashColors, setFlashColors] = useState<Map<string, { ask: string | null; bid: string | null }>>(new Map());

    const { selectedSymbol, setSelectedSymbolPrice } = useInstrument();

    useEffect(() => {
        const fetchFavoritesInstruments = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/instruments/favorites`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    // adding isFavorite field in data
                    const updatedData =
                        Array.isArray(data.data) &&
                        data.data.map((x: InstrumentProp) => {
                            return {
                                ...x,
                                isFavorite: true,
                            };
                        });
                    setInstruments(updatedData);

                    const favSymbols = data.data.map((ins: InstrumentProp) => ins.symbol);

                    // intial price of selected symbol
                    const _selectedSymbolPrice: InstrumentProp = data.data.find(
                        (ins: InstrumentProp) => ins.symbol === selectedSymbol
                    );
                    setLocalStorage('fav-instruments', favSymbols);
                    if (!_selectedSymbolPrice) return;

                    setSelectedSymbolPrice({
                        buy: _selectedSymbolPrice.bid,
                        sell: _selectedSymbolPrice.ask,
                        time: Date.now(),
                    });
                }
            } catch (err: unknown) {
                console.error('Error in fetching instruments', err);
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while parsing';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavoritesInstruments();
    }, [selectedSymbol, setSelectedSymbolPrice]);

    // update prices of instrument sent by ws server
    const { incomingInsSocketMsg } = useSocket();

    const flashTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    useEffect(() => {
        if (!incomingInsSocketMsg || !Array.isArray(incomingInsSocketMsg)) return;

        setInstruments(prev => {
            const newFlashColors = new Map<string, { ask: string | null; bid: string | null }>();

            const updatedInstruments = prev.map(ins => {
                const priceData = incomingInsSocketMsg.find((msg: { symbol: string }) => msg.symbol === ins.symbol);
                if (priceData) {
                    const askFlash =
                        priceData.ask > ins.ask
                            ? 'bg-green-500 text-white'
                            : priceData.ask < ins.ask
                              ? 'bg-red-500 text-white'
                              : null;

                    const bidFlash =
                        priceData.bid > ins.bid
                            ? 'bg-green-500 text-white'
                            : priceData.bid < ins.bid
                              ? 'bg-red-500 text-white'
                              : null;

                    // Store flash colors per symbol
                    if (askFlash || bidFlash) {
                        newFlashColors.set(ins.symbol, { ask: askFlash, bid: bidFlash });

                        const existingTimeout = flashTimeoutsRef.current.get(ins.symbol);
                        if (existingTimeout) {
                            clearTimeout(existingTimeout);
                        }

                        const timeoutId = setTimeout(() => {
                            setFlashColors(current => {
                                const updated = new Map(current);
                                updated.delete(ins.symbol);
                                return updated;
                            });
                            flashTimeoutsRef.current.delete(ins.symbol);
                        }, 300);

                        flashTimeoutsRef.current.set(ins.symbol, timeoutId);
                    }

                    return {
                        ...ins,
                        bid: priceData.bid,
                        ask: priceData.ask,
                    };
                }
                return ins;
            });

            if (newFlashColors.size > 0) {
                setFlashColors(newFlashColors);
            }

            return updatedInstruments;
        });
    }, [incomingInsSocketMsg]);

    const handleInstrumentSearch = async (query?: string) => {
        const target = query ?? searchQuery;
        if (!target || target === '') {
            setSearchedInstruments([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/instruments/search?symbol=${target}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to search instrument');
            }

            const data = await response.json();

            // adding isFavorite field in data
            const symbols = instruments.map(x => x.symbol);

            const updatedData =
                Array.isArray(data.data) &&
                data.data.map((ins: InstrumentProp) => ({
                    ...ins,
                    isFavorite: symbols.includes(ins.symbol),
                }));
            setSearchedInstruments(updatedData);
        } catch (err: unknown) {
            console.log('[Error] occured while search instrument', err);
            const errMsg = err instanceof Error ? err.message : 'Failed to search instrument';
            toast.error('Error occurred', {
                description: errMsg,
            });
        } finally {
            setIsSearching(false);
        }
    };

    const debouncedSearch = useDebouncedCallback((query: string) => {
        handleInstrumentSearch(query);
    }, 1000);

    const handleAddFavorite = useCallback(async (id: string) => {
        setSearchedInstruments(prev =>
            prev.map(ins =>
                ins.id === id
                    ? {
                          ...ins,
                          isFavorite: true,
                      }
                    : ins
            )
        );

        try {
            const res = await addToFavorite(id);
            if (!res) return;

            setInstruments(prev =>
                prev.some(x => x.id === res.id)
                    ? prev
                    : [
                          ...prev,
                          {
                              ...res,
                              isFavorite: true,
                          },
                      ]
            );
        } catch (err: unknown) {
            console.error('[Error] occured while adding instrument to favorites', err);
            const errMsg = err instanceof Error ? err.message : 'Failed to add instrument';

            toast.error('Error occurred', {
                description: errMsg,
            });
        }
    }, []);

    const handleRemoveFavorite = async (id: string) => {
        setInstruments(prev => prev.filter(x => x.id !== id));

        try {
            const res = await removeFromFavorite(id);
            if (!res) return;
        } catch (err: unknown) {
            console.error('[Error] occured while remove instrument from favorites', err);
            const errMsg = err instanceof Error ? err.message : 'Failed to remove instrument';

            toast.error('Error occurred', {
                description: errMsg,
            });
        }
    };

    useEffect(() => {
        const timeoutsMap = flashTimeoutsRef.current;
        return () => {
            timeoutsMap.forEach(timeout => clearTimeout(timeout));
            timeoutsMap.clear();
        };
    }, []);

    if (error && !isLoading) {
        return <div className="p-4">{error}</div>;
    }
    return (
        <div className="mx-auto flex h-full flex-col py-3">
            <div className="mb-6 flex items-center justify-between px-3">
                <h1 className="text-sm text-black">INSTRUMENTS</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-foreground">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                    <Button onClick={() => onClose(null)} variant="ghost" size="icon" className="text-foreground">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="relative mb-6 flex gap-4 px-3">
                <div className="border-input bg-background focus-within:ring-ring relative flex flex-1 items-center rounded-md border focus-within:ring-2">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
                    <Input
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value.toUpperCase();
                            setSearchQuery(val);
                            debouncedSearch(val);
                        }}
                        className="text-foreground placeholder:text-muted-foreground border-none bg-transparent pl-10 shadow-none focus-visible:ring-0"
                    />
                    {searchQuery && (
                        <X
                            onClick={() => {
                                setSearchQuery('');
                                setSearchedInstruments([]);
                                debouncedSearch.cancel();
                            }}
                            size={18}
                            className="text-muted-foreground mr-2 cursor-pointer"
                        />
                    )}
                </div>
            </div>

            <div className="bg-card h-full flex-1 overflow-x-scroll overflow-y-hidden rounded-lg">
                {isLoading ? (
                    <div className="w-full">
                        <Spinner className="mx-auto size-6" />
                    </div>
                ) : (
                    <InstrumentsTable
                        isLoading={searchedInstruments ? isSearching : isLoading}
                        instruments={searchedInstruments.length > 0 ? searchedInstruments : instruments}
                        flashColors={flashColors}
                        isSearched={searchedInstruments.length > 0 ? true : false}
                        addInstrumentToFavorite={handleAddFavorite}
                        removeInstrumentToFavorite={handleRemoveFavorite}
                    />
                )}
            </div>
        </div>
    );
}
