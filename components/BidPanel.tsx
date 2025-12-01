'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInstrument } from '@/hooks/useInstrument';
import Instrument from './Instrument';
import { useAccount } from '@/hooks/useAccount';
import { normalizeSymbol } from '@/lib/helper';
import { toast } from 'sonner';
import { useBid } from '@/hooks/useBid';
import { Spinner } from './ui/spinner';
import { PricesProp, Side } from '@/types';

function calculateTpandSl(side: Side, selectedSymbolPrice: PricesProp) {
    if (side === 'buy') {
        return {
            tp: selectedSymbolPrice.buy * 1.002,
            sl: selectedSymbolPrice.buy * 0.998,
        };
    } else {
        return {
            tp: selectedSymbolPrice.sell * 0.998,
            sl: selectedSymbolPrice.sell * 1.002,
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

const placeOrder = async (data: {
    walletId: string | undefined;
    instrument: string;
    price: number;
    sl: number | undefined;
    tp: number | undefined;
    type: number;
    volume: number;
}) => {
    try {
        const { walletId, instrument, price, sl, tp, type, volume } = data;

        if (!walletId) {
            throw new Error('Wallet not found. Please log in.');
        }

        if (!price || !instrument || !volume) {
            throw new Error('Missing required order parameters');
        }

        if (isNaN(price) || price <= 0) {
            throw new Error('Invalid price');
        }

        if (volume < 0.01) {
            throw new Error('Minimum volume is 0.01 lots');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/accounts/${walletId}/orders`, {
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
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to place order: ${response.statusText}`);
        }
    } catch (err: unknown) {
        throw err;
    }
};

export default function BidPanel({ onClose }: { onClose: () => void }) {
    const { selectedSymbol, selectedSymbolPrice } = useInstrument();
    const { wallet } = useAccount();
    const {
        side,
        setSide,
        orderType,
        setOrderType,
        volume,
        setVolume,
        takeProfit,
        setTakeProfit,
        stopLoss,
        setStopLoss,
        isOrderPlacing,
        setIsOrderPlacing,
        error,
        setError,
        tpWarning,
        slWarning,
    } = useBid();

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
        if (!selectedSymbolPrice) return;
        const basePrice = side === 'buy' ? selectedSymbolPrice.buy : selectedSymbolPrice.sell;
        const step = basePrice * 0.0001;
        const current = takeProfit || basePrice;
        const newValue = Number((current + delta * step).toFixed(5));
        setTakeProfit(newValue);
    };

    const adjustStopLoss = (delta: number) => {
        if (!selectedSymbolPrice) return;
        const basePrice = side === 'buy' ? selectedSymbolPrice.buy : selectedSymbolPrice.sell;
        const step = basePrice * 0.0001;
        const current = stopLoss || basePrice;
        const newValue = Number((current + delta * step).toFixed(5));
        setStopLoss(newValue);
    };

    const handlePlaceOrder = useCallback(async () => {
        if (!selectedSymbolPrice || !side) return;

        const currentPrice = side === 'buy' ? selectedSymbolPrice.buy : selectedSymbolPrice.sell;

        const validationError = validateTpSl(side, currentPrice, takeProfit, stopLoss);
        if (validationError) {
            setError(validationError);
            toast.error('Validation Error', { description: validationError });
            return;
        }
        setIsOrderPlacing(true);
        try {
            await placeOrder({
                walletId: wallet?.id,
                instrument: normalizeSymbol(selectedSymbol),
                price: currentPrice,
                sl: stopLoss,
                tp: takeProfit,
                type: side === 'buy' ? 0 : 1,
                volume,
            });

            toast.success('Order placed successfully', {
                description: `${side.toUpperCase()} ${volume} lots of ${selectedSymbol} at ${currentPrice.toFixed(2)}`,
            });
        } catch (err: unknown) {
            console.error('[Error] Failed to place order', err);

            const errMsg = err instanceof Error ? err.message : 'Something went wrong while placing order';

            setError(errMsg);
            toast.error('Order Failed', {
                description: errMsg,
            });
        } finally {
            setIsOrderPlacing(false);
        }
    }, [selectedSymbolPrice, side, takeProfit, stopLoss, volume, selectedSymbol, placeOrder]);

    if (!selectedSymbolPrice?.buy || !selectedSymbolPrice?.sell) {
        return (
            <div className="flex h-full items-center justify-center gap-3">
                Connecting to server <Spinner className="size-6" />
            </div>
        );
    }
    return (
        <div className="w-full">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div className="flex items-center gap-2">
                    <Instrument symbol={selectedSymbol} iconSize={25} />
                </div>
                <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
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
                            <div className={cn('text-sm font-thin text-red-600', side === 'sell' && 'text-white')}>
                                Sell
                            </div>
                            <div className={cn('text-xs text-red-600', side === 'sell' && 'text-white')}>
                                {selectedSymbolPrice?.sell.toLocaleString()}
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
                            <div className={cn('text-sm font-thin text-blue-600', side === 'buy' && 'text-white')}>
                                Buy
                            </div>
                            <div className={cn('text-xs text-blue-600', side === 'buy' && 'text-white')}>
                                {selectedSymbolPrice?.buy.toLocaleString()}
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
                            className="[appearance:textfield] border-0 text-sm shadow-none ring-0 focus:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                if (!side || !selectedSymbolPrice) return;
                                const data = calculateTpandSl(side, selectedSymbolPrice);
                                setTakeProfit(Number(data.tp.toFixed(2)));
                            }}
                            type="number"
                            name="takeProfit"
                            value={takeProfit ?? ''}
                            onChange={handleInputChange}
                            placeholder="Not set"
                            className="[appearance:textfield] border-0 text-sm shadow-none ring-0 focus:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                    {tpWarning && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">{tpWarning}</div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-900">Stop Loss</label>
                        <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden rounded-sm border border-gray-200">
                        <Input
                            onSelect={() => {
                                if (!side || !selectedSymbolPrice) return;
                                const data = calculateTpandSl(side, selectedSymbolPrice);
                                setStopLoss(Number(data.sl.toFixed(2)));
                            }}
                            type="number"
                            name="stopLoss"
                            value={stopLoss ?? ''}
                            onChange={handleInputChange}
                            placeholder="Not set"
                            className="[appearance:textfield] border-0 text-sm shadow-none ring-0 focus:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                    {slWarning && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">{slWarning}</div>
                    )}
                </div>

                {error && (
                    <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
                )}

                <div className="flex flex-col gap-2">
                    <Button
                        onClick={handlePlaceOrder}
                        disabled={isOrderPlacing || !selectedSymbolPrice || !wallet?.id}
                        variant={'outline'}
                        className={cn(
                            'h-11 cursor-pointer rounded-sm',
                            side === 'buy'
                                ? 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white disabled:bg-blue-300'
                                : 'bg-red-500 text-white hover:bg-red-500 hover:text-white disabled:bg-red-300'
                        )}
                    >
                        {isOrderPlacing ? 'Placing order...' : `Confirm ${side?.toUpperCase()} ${volume} lots`}
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
