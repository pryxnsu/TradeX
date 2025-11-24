'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInstrument } from '@/hooks/useInstrument';
import Instrument from './Instrument';
import { useAccount } from '@/hooks/useAccount';
import { normalizeSymbol } from '@/lib/helper';
import { toast } from 'sonner';

interface PricesProp {
    buy: number;
    sell: number;
    time: number;
}

type Side = 'buy' | 'sell';

function calculateTpandSl(side: Side, prices: PricesProp) {
    if (side === 'buy') {
        return {
            tp: prices.buy * 1.002,
            sl: prices.buy * 0.998,
        };
    } else {
        return {
            tp: prices.sell * 0.998,
            sl: prices.sell * 1.002,
        };
    }
}

function validateTpSl(side: Side, price: number, tp?: number, sl?: number): string | null {
    if (tp !== undefined && tp !== 0) {
        if (side === 'buy' && tp <= price) {
            return 'Take Profit must be higher than current price for Buy orders';
        }
        if (side === 'sell' && tp >= price) {
            return 'Take Profit must be lower than current price for Sell orders';
        }
    }
    if (sl !== undefined && sl !== 0) {
        if (side === 'buy' && sl >= price) {
            return 'Stop Loss must be lower than current price for Buy orders';
        }
        if (side === 'sell' && sl <= price) {
            return 'Stop Loss must be higher than current price for Sell orders';
        }
    }
    return null;
}

export default function BidPanel({ onClose }: { onClose: () => void }) {
    const [prices, setPrices] = useState<PricesProp>();
    const [side, setSide] = useState<Side>('buy');
    const [orderType, setOrderType] = useState<'market' | 'pending'>('market');
    const [volume, setVolume] = useState<number>(0.1);
    const [takeProfit, setTakeProfit] = useState<number | undefined>(undefined);
    const [stopLoss, setStopLoss] = useState<number | undefined>(undefined);
    const [isOrderPlacing, setIsOrderPlacing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { selectedSymbol } = useInstrument();
    const { incomingInsSocketMsg } = useSocket();

    useEffect(() => {
        if (!incomingInsSocketMsg || !Array.isArray(incomingInsSocketMsg)) return;

        const instrument = incomingInsSocketMsg.find(ins => ins.symbol === selectedSymbol);
        if (instrument) {
            setPrices({
                buy: instrument.ask,
                sell: instrument.bid,
                time: instrument.time,
            });
        }
    }, [incomingInsSocketMsg, selectedSymbol]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const { name } = target;
        const valueAsNumber = target.valueAsNumber;
        const parsed = Number.isFinite(valueAsNumber) ? valueAsNumber : parseFloat(target.value);
        const numericValue = Number.isFinite(parsed) ? parsed : 0;

        setError(null);

        if (name === 'volume') {
            setVolume(Math.max(0.01, numericValue));
        } else if (name === 'takeProfit') {
            setTakeProfit(numericValue || undefined);
        } else if (name === 'stopLoss') {
            setStopLoss(numericValue || undefined);
        }
    };

    const adjustVolume = (delta: number) => {
        const newVolume = Number(Math.max(0.01, volume + delta).toFixed(2));
        setVolume(newVolume);
    };

    const adjustTakeProfit = (delta: number) => {
        if (!prices) return;
        const basePrice = side === 'buy' ? prices.buy : prices.sell;
        const step = basePrice * 0.0001;
        const current = takeProfit || basePrice;
        const newValue = Number((current + delta * step).toFixed(5));
        setTakeProfit(newValue);
    };

    const adjustStopLoss = (delta: number) => {
        if (!prices) return;
        const basePrice = side === 'buy' ? prices.buy : prices.sell;
        const step = basePrice * 0.0001;
        const current = stopLoss || basePrice;
        const newValue = Number((current + delta * step).toFixed(5));
        setStopLoss(newValue);
    };

    const { wallet } = useAccount();

    const placeOrder = useCallback(
        async (data: {
            instrument: string;
            price: number;
            sl: number | undefined;
            tp: number | undefined;
            type: number;
            volume: number;
        }) => {
            setIsOrderPlacing(true);
            setError(null);
            try {
                if (!wallet?.id) {
                    throw new Error('Wallet not found. Please log in.');
                }

                const { instrument, price, sl, tp, type, volume } = data;

                if (!price || !instrument || !volume) {
                    throw new Error('Missing required order parameters');
                }

                if (isNaN(price) || price <= 0) {
                    throw new Error('Invalid price');
                }

                if (volume < 0.01) {
                    throw new Error('Minimum volume is 0.01 lots');
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/accounts/${wallet.id}/orders`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            oneClick: false,
                            instrument,
                            price,
                            sl: sl === undefined ? 0 : sl,
                            tp: tp === undefined ? 0 : tp,
                            type,
                            volume,
                        }),
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || `Failed to place order: ${response.statusText}`
                    );
                }

                toast.success('Order placed successfully', {
                    description: `${side.toUpperCase()} ${volume} lots of ${selectedSymbol} at ${price.toFixed(5)}`,
                });

                onClose();
            } catch (err: unknown) {
                console.error('[Error] Failed to place order', err);

                const errMsg =
                    err instanceof Error ? err.message : 'Something went wrong while placing order';

                setError(errMsg);
                toast.error('Order Failed', {
                    description: errMsg,
                });
            } finally {
                setIsOrderPlacing(false);
            }
        },
        [wallet?.id, side, selectedSymbol, onClose]
    );

    const handlePlaceOrder = useCallback(() => {
        if (!prices || !side) return;

        const currentPrice = side === 'buy' ? prices.buy : prices.sell;

        const validationError = validateTpSl(side, currentPrice, takeProfit, stopLoss);
        if (validationError) {
            setError(validationError);
            toast.error('Validation Error', { description: validationError });
            return;
        }

        placeOrder({
            instrument: normalizeSymbol(selectedSymbol),
            price: currentPrice,
            sl: stopLoss,
            tp: takeProfit,
            type: side === 'buy' ? 0 : 1,
            volume,
        });
    }, [prices, side, takeProfit, stopLoss, volume, selectedSymbol, placeOrder]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div className="flex items-center gap-2">
                    <Instrument symbol={selectedSymbol} iconSize={25} />
                </div>
                <button
                    onClick={onClose}
                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form className="space-y-4 p-4" onSubmit={e => e.preventDefault()}>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            onClick={() => setSide('sell')}
                            variant={'outline'}
                            className={cn(
                                'flex h-15 cursor-pointer flex-col items-start gap-1 rounded-sm border border-red-400 p-3 text-base hover:bg-transparent',
                                side === 'sell' ? 'bg-red-500 hover:bg-red-500' : 'bg-transparent'
                            )}
                        >
                            <div
                                className={cn(
                                    'text-sm font-thin text-red-600',
                                    side === 'sell' && 'text-white'
                                )}
                            >
                                Sell
                            </div>
                            <div
                                className={cn(
                                    'text-xs text-red-600',
                                    side === 'sell' && 'text-white'
                                )}
                            >
                                {prices?.sell.toLocaleString()}
                            </div>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setSide('buy')}
                            variant={'outline'}
                            className={cn(
                                'flex h-15 cursor-pointer flex-col items-start gap-1 rounded-sm border border-blue-400 p-3 text-base hover:bg-transparent',
                                side === 'buy' ? 'bg-blue-500 hover:bg-blue-500' : 'bg-transparent'
                            )}
                        >
                            <div
                                className={cn(
                                    'text-sm font-thin text-blue-600',
                                    side === 'buy' && 'text-white'
                                )}
                            >
                                Buy
                            </div>
                            <div
                                className={cn(
                                    'text-xs text-blue-600',
                                    side === 'buy' && 'text-white'
                                )}
                            >
                                {prices?.buy.toLocaleString()}
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant={orderType === 'market' ? 'default' : 'outline'}
                        className="cursor-pointer rounded-sm text-sm"
                        onClick={() => {
                            setOrderType('market');
                        }}
                    >
                        Market
                    </Button>
                    <Button
                        disabled
                        type="button"
                        variant={orderType === 'pending' ? 'default' : 'outline'}
                        className="cursor-pointer rounded-sm text-sm"
                        onClick={() => {
                            setOrderType('pending');
                        }}
                    >
                        Pending
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Volume</label>
                    <div className="flex items-center overflow-hidden rounded-sm border border-gray-200">
                        <Input
                            type="number"
                            name="volume"
                            value={volume}
                            onChange={handleInputChange}
                            className="border-0 text-sm shadow-none ring-0 focus:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Not set"
                        />
                        <span className="px-3 text-xs text-gray-500">Lots</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                            onClick={() => adjustVolume(-0.01)}
                        >
                            −
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                            onClick={() => adjustVolume(0.01)}
                        >
                            +
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-900">Take Profit</label>
                        <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden rounded-sm border border-gray-200">
                        <Input
                            onSelect={() => {
                                if (!side || !prices) return;
                                const data = calculateTpandSl(side, prices);
                                setTakeProfit(Number(data.tp.toFixed(4)));
                            }}
                            type="number"
                            name="takeProfit"
                            value={takeProfit}
                            onChange={handleInputChange}
                            placeholder="Not set"
                            className="border-0 text-sm shadow-none ring-0 focus:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                            onClick={() => adjustTakeProfit(-1)}
                        >
                            −
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                            onClick={() => adjustTakeProfit(1)}
                        >
                            +
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-900">Stop Loss</label>
                        <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden rounded-sm border border-gray-200">
                        <Input
                            onSelect={() => {
                                if (!side || !prices) return;
                                const data = calculateTpandSl(side, prices);
                                setStopLoss(Number(data.sl.toFixed(4)));
                            }}
                            type="number"
                            name="stopLoss"
                            value={stopLoss}
                            onChange={handleInputChange}
                            placeholder="Not set"
                            className="border-0 text-sm shadow-none ring-0 focus:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                            onClick={() => adjustStopLoss(-1)}
                        >
                            −
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                            onClick={() => adjustStopLoss(1)}
                        >
                            +
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <Button
                        onClick={handlePlaceOrder}
                        disabled={isOrderPlacing || !prices || !wallet?.id}
                        variant={'outline'}
                        className={cn(
                            'h-11 rounded-sm',
                            side === 'buy'
                                ? 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white disabled:bg-blue-300'
                                : 'bg-red-500 text-white hover:bg-red-500 hover:text-white disabled:bg-red-300'
                        )}
                    >
                        {isOrderPlacing
                            ? 'Placing order...'
                            : `Confirm ${side?.toUpperCase()} ${volume} lots`}
                    </Button>
                    <Button
                        type="button"
                        variant={'outline'}
                        className="h-11"
                        onClick={onClose}
                        disabled={isOrderPlacing}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
