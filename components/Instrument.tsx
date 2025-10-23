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
    };

    return iconMap[symbolLower] || '/icons/btc.svg';
};

export default function Instrument({ symbol, iconSize ,className }: { symbol: string; iconSize: number; className?: string }) {
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
        <div className={cn("flex gap-3 items-center px-2 py-1", className)}>
            <div className="h-fit w-fit shrink-0">
                {isDoubleSymbol ? (
                    <div className="relative flex items-center">
                        <div className="relative h-6 w-6">
                            <Image
                                src={getIconPath(icons[0])}
                                alt={`${symbol} icon`}
                                width={iconSize-10}
                                height={iconSize-10}
                                className="absolute rounded-full object-cover"
                                style={{
                                    width: `${iconSize-10}px`,
                                    height: `${iconSize-10}px`,
                                    zIndex: 0,
                                    left: 0,
                                    top: 0,
                                }}
                            />
                            <Image
                                src={getIconPath(icons[1])}
                                alt={`${symbol} icon`}
                                width={iconSize-10}
                                height={iconSize-10}
                                className={cn("absolute rounded-full object-cover")}
                                style={{
                                    width: `${iconSize-10}px`,
                                    height: `${iconSize-10}px`,
                                    zIndex: 1,
                                    left: '12px',
                                    top: '2px',
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <Image
                        src={getIconPath(icons[0])}
                        alt={`${symbol} icon`}
                        width={iconSize}
                        height={iconSize}
                        style={
                            { width: `${iconSize}px`,
                            height: `${iconSize}px`,}
                        }
                        className="rounded-full object-cover"
                    />
                )}
            </div>
            <div>
                <p className="text-base font-medium">{symbol}</p>
            </div>
        </div>
    );
}
