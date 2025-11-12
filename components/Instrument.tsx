'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

const getIconPath = (symbol: string): string => {
    const symbolLower = symbol.toLowerCase();

    const iconMap: { [key: string]: string } = {
        aapl: '/icons/aapl.svg',
        btc: '/icons/btc.svg',
        bitcoin: '/icons/btc.svg',
        usd: '/icons/usd.svg',
        eur: '/icons/eur.svg',
        jpy: '/icons/jpy.svg',
        eth: '/icons/eth.svg',
    };

    return iconMap[symbolLower] || '';
};

export default function Instrument({
    symbol,
    iconSize,
    className,
}: {
    symbol: string;
    iconSize: number;
    className?: string;
}) {
    const isDoubleSymbol = symbol.includes('/');
    const icons = [];
    if (isDoubleSymbol) {
        const first = symbol.split('/')[0];
        const second = symbol.split('/')[1];
        icons.push(first);
        icons.push(second);
    } else {
        icons.push(symbol);
    }
    return (
        <div className={cn('flex items-center gap-3 px-2 py-1', className)}>
            <div className="h-fit w-fit shrink-0">
                {isDoubleSymbol ? (
                    <div
                        className="relative"
                        style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                    >
                        <div
                            className="absolute overflow-hidden rounded-full ring-[1px] ring-neutral-300"
                            style={{
                                width: `${iconSize * 0.7}px`,
                                height: `${iconSize * 0.7}px`,
                                zIndex: 1,
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                border: '2px solid white',
                            }}
                        >
                            <Image
                                src={getIconPath(icons[0])}
                                alt={`${icons[0]} icon`}
                                width={iconSize * 0.7}
                                height={iconSize * 0.7}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div
                            className="absolute overflow-hidden rounded-full ring-[1px] ring-neutral-300"
                            style={{
                                width: `${iconSize * 0.7}px`,
                                height: `${iconSize * 0.7}px`,
                                zIndex: 2,
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                border: '2px solid white',
                            }}
                        >
                            <Image
                                src={getIconPath(icons[1])}
                                alt={`${icons[1]} icon`}
                                width={iconSize * 0.7}
                                height={iconSize * 0.7}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                ) : (
                    <div
                        className="overflow-hidden rounded-full"
                        style={{
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                        }}
                    >
                        <Image
                            src={getIconPath(icons[0])}
                            alt={`${symbol} icon`}
                            width={iconSize}
                            height={iconSize}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium">{symbol}</p>
            </div>
        </div>
    );
}
