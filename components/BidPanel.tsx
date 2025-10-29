'use client';

import { useState } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInstrument } from '@/hooks/useInstrument';
import Instrument from './Instrument';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BidPanel({onClose}: {onClose: () => void}) {
    const [formType, setFormType] = useState('regular');
    const [orderType, setOrderType] = useState('market');
    const [volume, setVolume] = useState('0.01');
    const [takeProfit, setTakeProfit] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [sliderValue, setSliderValue] = useState([34]);

    const sellPercentage = sliderValue[0];
    const buyPercentage = 100 - sellPercentage;

    const {selectedSymbol} = useInstrument();
    return (
        <div className="w-full">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div className="flex items-center gap-2">
                    <Instrument symbol={selectedSymbol} iconSize={25}/>
                    {/* <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500"> */}
                        {/* <span className="text-xs font-bold text-white">₿</span> */}
                    {/* </div> */}
                    {/* <span className="font-semibold text-gray-900">BTC</span> */}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-4 p-4">
                {/* Form Type Selector */}
                {/* <Select value={formType} onValueChange={setFormType}>
                        <SelectTrigger className="w-full bg-white border-gray-200">
                            <SelectValue placeholder="Regular form" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="regular">Regular form</SelectItem>
                            <SelectItem value="advanced">Advanced form</SelectItem>
                        </SelectContent>
                    </Select>
                */}

                {/* Sell/Buy Display */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                            <div className="text-xs font-medium text-red-600">Sell</div>
                            <div className="text-lg font-semibold text-red-600">113,330.70</div>
                        </div>
                        <div className="rounded-lg border border-blue-300 bg-blue-50 p-3">
                            <div className="text-xs font-medium text-blue-600">Buy</div>
                            <div className="text-lg font-semibold text-blue-600">113,348.70</div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white">
                            18.00 USD
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-red-600">{sellPercentage}%</span>
                            <span className="text-blue-600">{buyPercentage}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant={orderType === 'market' ? 'default' : 'outline'}
                        className="text-sm"
                        onClick={() => setOrderType('market')}
                    >
                        Market
                    </Button>
                    <Button
                        variant={orderType === 'pending' ? 'default' : 'outline'}
                        className="text-sm"
                        onClick={() => setOrderType('pending')}
                    >
                        Pending
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Volume</label>
                    <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-gray-200">
                        <Input
                            type="text"
                            value={volume}
                            onChange={e => setVolume(e.target.value)}
                            className="border-0 text-sm"
                            placeholder="0.00"
                        />
                        <span className="px-3 text-xs text-gray-500">Lots</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                        >
                            −
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
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
                    <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-gray-200">
                        <Input
                            type="text"
                            value={takeProfit}
                            onChange={e => setTakeProfit(e.target.value)}
                            placeholder="Not set"
                            className="border-0 text-sm"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                        >
                            −
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
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
                    <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-gray-200">
                        <Input
                            type="text"
                            value={stopLoss}
                            onChange={e => setStopLoss(e.target.value)}
                            placeholder="Not set"
                            className="border-0 text-sm"
                        />
                        {/* <Select>
                                <SelectTrigger className="w-20 border-0 border-l border-gray-200 rounded-none">
                                    <SelectValue placeholder="Price" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="price">Price</SelectItem>
                                    <SelectItem value="percent">Percent</SelectItem>
                                </SelectContent>
                            </Select> 
                        */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                        >
                            −
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none border-l border-gray-200"
                        >
                            +
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
