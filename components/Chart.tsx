import { useEffect, useRef } from 'react';
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

    // candles
    const { candles } = useInstrument();

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
            // console.log('enr', entries)
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
