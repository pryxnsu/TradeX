import { useCallback, useEffect, useRef } from 'react';
import type { LogicalRange, Time } from 'lightweight-charts';
import { cn } from '@/lib/utils';
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
import { Candle } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { IncomingInsSocketMsgProp } from '@/context/socket.context';
import { Spinner } from './ui/spinner';
import { fetchHistoryCandles } from '@/context/instrument.context';

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
        timeVisible: true,
        secondsVisible: false,
        shiftVisibleRangeOnNewBar: true,
    },
};

const getStartCandle = (timestamp: number, timeFrameMinutes: number) => {
    const intervalMs = timeFrameMinutes * 60_000;
    return Math.floor(timestamp / intervalMs) * intervalMs;
};

// this is for demo chart only, real chart is not implemented yet
export default function Chart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const candlesRef = useRef<Candle[]>([]);
    const lastCandleRef = useRef<Candle | null>(null);

    const { candles, setCandles, selectedSymbol, timeFrame, error, isLoading } = useInstrument();

    useEffect(() => {
        if (!containerRef.current) {
            console.log('Container ref not available');
            return;
        }

        if (chartRef.current) {
            console.log('Chart already initialized');
            return;
        }

        console.log('Initializing chart...');
        const chart = createChart(containerRef.current, chartOptions);

        const series = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        chartRef.current = chart;
        seriesRef.current = series;

        return () => {
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, [isLoading]);

    /* --------------------------------- Handle resize events --------------------------------- */
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

    /* --------------------------------- Backward scrolling --------------------------------- */
    useEffect(() => {
        if (!chartRef.current || !seriesRef.current) {
            return;
        }

        if (candles.length === 0) {
            return;
        }

        const chart = chartRef.current;
        const series = seriesRef.current;

        let isLoadingMore = false;
        const THRESHOLD = 50;

        const handleVisibleRangeChange = async (newRange: LogicalRange | null) => {
            if (!newRange) {
                return;
            }

            if (isLoadingMore) {
                return;
            }

            const barsInfo = series.barsInLogicalRange(newRange);

            if (barsInfo !== null && barsInfo.barsBefore < THRESHOLD) {
                isLoadingMore = true;

                const historicalCount = -100;

                const from = candles[0].time - timeFrame * 60 * 1000;

                const candlesHistory = await fetchHistoryCandles(selectedSymbol, timeFrame, from, historicalCount);

                if (candlesHistory.length > 0) {
                    const oldestExisting = candles[0].time;
                    const filteredHistory = candlesHistory.filter(c => c.time < oldestExisting);

                    if (filteredHistory.length > 0) {
                        setCandles((prev: Candle[]) => [...filteredHistory, ...prev]);
                    }
                }
            }
        };

        chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

        return () => {
            chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
        };
    }, [candles.length]);

    useEffect(() => {
        if (seriesRef.current && candles.length > 0) {
            const timezoneOffsetSeconds = new Date().getTimezoneOffset() * -60;

            const formattedData = candles.map(candle => {
                const timeInSeconds = Math.floor(candle.time / 1000) + timezoneOffsetSeconds;

                return {
                    time: timeInSeconds as Time,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                };
            });

            seriesRef.current.setData(formattedData);
            candlesRef.current = [...candles];
            if (candles.length > 0) {
                lastCandleRef.current = { ...candles[candles.length - 1] };
            }
        }
    }, [candles, timeFrame]);

    /* --------------------------------- form candles realtime  --------------------------------- */

    const handleTick = useCallback(
        (tick: IncomingInsSocketMsgProp) => {
            if (tick.symbol !== selectedSymbol) return;

            const price = tick.bid;
            const tsMs = getStartCandle(tick.time, timeFrame);
            const tsSeconds = Math.floor(tsMs / 1000);

            const timezoneOffsetSeconds = new Date().getTimezoneOffset() * -60;
            const localTsSeconds = tsSeconds + timezoneOffsetSeconds;

            const last = lastCandleRef.current;
            const lastTsSeconds = last ? Math.floor(last.time / 1000) : 0;

            if (!last || lastTsSeconds !== tsSeconds) {
                const newCandle: Candle = {
                    time: tsMs,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                };

                candlesRef.current.push(newCandle);
                lastCandleRef.current = newCandle;

                seriesRef.current?.update({
                    time: localTsSeconds as Time,
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
                time: localTsSeconds as Time,
                open: last.open,
                high: last.high,
                low: last.low,
                close: last.close,
            });
        },
        [selectedSymbol, timeFrame]
    );

    const { incomingInsSocketMsg } = useSocket();

    useEffect(() => {
        if (!incomingInsSocketMsg) return;

        incomingInsSocketMsg.forEach((tick: IncomingInsSocketMsgProp) => {
            handleTick(tick);
        });
    }, [handleTick, incomingInsSocketMsg]);

    if (error) {
        return <div className="h-full w-full flex-col overflow-hidden bg-white pt-20 text-center">{error}</div>;
    }

    return (
        <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
            <div className="relative ml-1 flex-1 overflow-hidden rounded-sm">
                <div
                    ref={containerRef}
                    className={cn('h-full w-full', candles.length > 0 && isLoading && 'opacity-60')}
                />
                {candles.length === 0 && isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <Spinner />
                    </div>
                )}
            </div>
        </div>
    );
}
