import { useCallback, useEffect, useRef } from 'react';
import {
    IChartApi,
    ISeriesApi,
    CandlestickSeries,
    createChart,
    type DeepPartial,
    type ChartOptions,
    ColorType,
} from 'lightweight-charts';
import { useInstrument } from '@/hooks/useInstrument';
import type { Time } from 'lightweight-charts';
import { Candle } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { IncomingInsSocketMsgProp } from '@/context/socket.context';

const chartOptions: DeepPartial<ChartOptions> = {
    layout: {
        textColor: '#000',
        background: { type: ColorType.Solid, color: '#fff' },
    },
    rightPriceScale: {
        visible: true,
        borderVisible: false,
    },
    timeScale: {
        borderVisible: true,
    },
};

// this is for demo chart only, real chart is not implemented yet
export default function Chart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const candlesRef = useRef<Candle[]>([]);
    const lastCandleRef = useRef<Candle | null>(null);

    // candles
    const { candles, selectedSymbol, timeFrame } = useInstrument();

    useEffect(() => {
        const chart = createChart(containerRef.current!, chartOptions);

        const series = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        chartRef.current = chart;
        seriesRef.current = series;

        chart.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
            if (!logicalRange || logicalRange.from == null) return;

            if (logicalRange.from < 10) {
                setTimeout(() => {
                    const formattedData = candles.map(candle => ({
                        time: candle.time as Time,
                        open: candle.open,
                        high: candle.high,
                        low: candle.low,
                        close: candle.close,
                    }));
                    if (seriesRef.current) seriesRef.current.setData(formattedData);
                }, 250);
            }
        });

        return () => chart.remove();
    }, [candles]);

    // Handle resize events
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !chartRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (chartRef.current) {
                    chartRef.current.applyOptions({ width, height });
                }
            }
        });

        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (seriesRef.current && candles.length > 0) {
            const formattedData = candles.map(candle => ({
                time: candle.time as Time,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
            }));
            seriesRef.current.setData(formattedData);
        }
    }, [candles]);

    // --------------------------------- form candles realtime  ---------------------------------

    // new candle starts.
    const getStartCandle = (timestamp: number, timeFrameMinutes: number) => {
        const intervalMs = timeFrameMinutes * 60_000;
        return Math.floor(timestamp / intervalMs) * intervalMs;
    };

    // form candles 
    const handleTick = useCallback(
        (tick: IncomingInsSocketMsgProp) => {
            
            if (tick.symbol !== selectedSymbol) return;

            const price = (tick.ask + tick.bid) / 2;
            const ts = getStartCandle(tick.time, timeFrame);

            const last = lastCandleRef.current;
            if (!last || last.time !== ts) {
                const newCandle: Candle = {
                    time: ts,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                };

                candlesRef.current.push(newCandle);
                lastCandleRef.current = newCandle;

                seriesRef.current?.update({
                    time: newCandle.time as unknown as Time,
                    open: newCandle.open,
                    high: newCandle.high,
                    low: newCandle.low,
                    close: newCandle.close,
                });
                return;
            }

            last.close = price;
            last.high = Math.max(last.high, price);
            last.low = Math.min(last.low, price);

            seriesRef.current?.update({
                time: last.time as Time,
                open: last.open,
                high: last.high,
                low: last.low,
                close: last.close,
            });
        },
        [lastCandleRef, selectedSymbol, timeFrame]
    );


    // rendering candle
    const { incomingInsSocketMsg } = useSocket();

    useEffect(() => {
        if (!incomingInsSocketMsg) return;

        incomingInsSocketMsg.forEach((tick: IncomingInsSocketMsgProp) => {
            handleTick(tick);
        });
    }, [handleTick, incomingInsSocketMsg]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            {/* topbar  */}
            <div className="h-10 shrink-0 rounded-tl-sm bg-white text-center">topbar</div>

            <div className="mt-1 flex flex-1 overflow-hidden">
                {/* toolbar */}
                <div className="h-full min-w-10 shrink-0 rounded-r-sm bg-white">T</div>
                {/* main chart candles  */}
                <div ref={containerRef} className="ml-1 flex-1 overflow-hidden rounded-sm" />
            </div>
        </div>
    );
}
