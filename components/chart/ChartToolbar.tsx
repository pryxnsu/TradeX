'use client';

import {
    Plus,
    CandlestickChart,
    Sigma,
    Grid3X3,
    Redo,
    Undo,
    Camera,
    Save,
    Settings,
    Maximize2,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useInstrument } from '@/hooks/useInstrument';

const TIMEFRAMES = [
    { label: '1m', value: 1 },
    { label: '5m', value: 5 },
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '1H', value: 60 },
    { label: '4H', value: 240 },
    { label: '1D', value: 1440 },
    { label: '1W', value: 10080 },
    { label: '1M', value: 43200 },
];

interface ChartToolbarProps {
    onFullscreen: () => void;
}

export default function ChartToolbar({ onFullscreen }: ChartToolbarProps) {
    const { timeFrame, updateTimeFrame } = useInstrument();
    const currentTimeframe = TIMEFRAMES.find(tf => tf.value === timeFrame) || TIMEFRAMES[1];
    return (
        <div className="flex h-10 w-full items-center justify-between">
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <Plus className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                        >
                            {currentTimeframe.label}
                            <ChevronDown className="h-3 w-3 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-32">
                        <DropdownMenuLabel className="text-xs text-neutral-500">Timeframe</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {TIMEFRAMES.map(tf => (
                            <DropdownMenuItem
                                key={tf.value}
                                onClick={() => updateTimeFrame(tf.value)}
                                className={cn('cursor-pointer', timeFrame === tf.value && 'bg-neutral-100 font-medium')}
                            >
                                {tf.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="mx-1 h-5 w-px bg-neutral-200" />

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <CandlestickChart className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <Sigma className="h-4 w-4" />
                    <span className="hidden sm:inline">Indicators</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Compare</span>
                </Button>

                <div className="mx-1 h-5 w-px bg-neutral-200" />

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    disabled
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    disabled
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                    <Save className="h-4 w-4" />
                    <span className="hidden md:inline">Save</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <Camera className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <Settings className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onFullscreen}
                    className="h-7 w-7 cursor-pointer p-0 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
