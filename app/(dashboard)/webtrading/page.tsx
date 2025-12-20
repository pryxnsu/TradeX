'use client';

import { cn } from '@/lib/utils';
import Instruments from '@/components/Instruments';
import Navbar from '@/components/Navbar';
import Chart from '@/components/Chart';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Menu, Settings } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useActivePanel } from '@/hooks/useActivePanel';
import { useState, useRef, Activity, useEffect } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { PanelTypes } from '@/types';
import BidPanel from '@/components/BidPanel';
import Positions from '@/components/Positions';
import WalletBalance from '@/components/Balance';
import { ChartSidebar, ChartToolbar } from '@/components/chart';

const BUTTONS = [
    {
        title: 'instruments',
        icon: <Menu />,
    },
    {
        title: 'calender',
        icon: <Calendar />,
    },
    {
        title: 'settings',
        icon: <Settings />,
    },
];

export const DEFAULT_SIZE_OF_POSITION_PANEL = 7;
export const OPENED_SIZE_OF_POSITION_PANEL = 35;

export default function Page() {
    const {
        activePanel,
        handleActivePanel,
        handlePanelResize,
        isPanelVisible,
        setIsPanelVisible,
        leftPanelSize,
        positionPanelOpen,
        handlePositionPanelOpen,
    } = useActivePanel();

    const positionPanelRef = useRef<ImperativePanelHandle | null>(null);
    const [placeBidPanel, setPlaceBidPanel] = useState<boolean>(true);
    const [chartFullScreen, setChartFullScreen] = useState<boolean>(false);

    const handleChartMaximizeToggle = () => {
        setChartFullScreen(!chartFullScreen);
        setPlaceBidPanel(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && chartFullScreen) {
                setChartFullScreen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [chartFullScreen]);

    return (
        <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-neutral-100">
            <header className="bg-white">
                <Navbar />
            </header>

            <main className="mt-1 flex flex-1 bg-neutral-100">
                <aside className="mr-1 rounded-tr-sm bg-white">
                    <div className="mt-5 flex flex-col gap-6 px-2">
                        {BUTTONS.map(button => (
                            <Button
                                key={button.title}
                                onClick={() => {
                                    handleActivePanel(button.title as PanelTypes);
                                    setIsPanelVisible(true);
                                }}
                                variant={'outline'}
                                className={cn(
                                    'h-8 w-8 cursor-pointer',
                                    activePanel == button.title && 'bg-neutral-100'
                                )}
                            >
                                {button.icon}
                            </Button>
                        ))}
                    </div>
                </aside>
                <ResizablePanelGroup direction="horizontal" className="h-full w-full flex-1">
                    {/* left instruments panel  */}
                    <Activity mode={activePanel && isPanelVisible ? 'visible' : 'hidden'}>
                        <>
                            <ResizablePanel
                                defaultSize={leftPanelSize || 25}
                                onResize={handlePanelResize}
                                className="mr-1 max-w-1/2 rounded-tl-sm rounded-tr-sm bg-white"
                            >
                                <Activity mode={activePanel === 'instruments' ? 'visible' : 'hidden'}>
                                    <Instruments onClose={handleActivePanel} />
                                </Activity>

                                <Activity mode={activePanel === 'calender' ? 'visible' : 'hidden'}>
                                    <p>Calender </p>
                                </Activity>

                                <Activity mode={activePanel === 'settings' ? 'visible' : 'hidden'}>
                                    <p>Settings </p>
                                </Activity>
                            </ResizablePanel>

                            {/* handle showing only if side panel exists */}
                            <ResizableHandle className="bg-transparent" />
                        </>
                    </Activity>

                    {/* right panel  */}
                    <ResizablePanel
                        defaultSize={isPanelVisible && activePanel ? 100 - (leftPanelSize || 25) : 100}
                        className="flex h-full flex-1 flex-col rounded-tl-sm bg-neutral-100"
                    >
                        <div className="flex h-full">
                            <ResizablePanelGroup direction="vertical" className="flex-1">
                                {/* Chart  */}
                                <ResizablePanel defaultSize={93} className="flex">
                                    <div
                                        className={cn(
                                            'flex flex-col bg-neutral-100',
                                            chartFullScreen ? 'fixed inset-0 z-50' : 'min-w-0 flex-1'
                                        )}
                                    >
                                        <div className="flex h-10 shrink-0 items-center justify-between rounded-tl-sm bg-white px-2 text-center">
                                            <div>
                                                <ChartToolbar onFullscreen={handleChartMaximizeToggle} />
                                            </div>
                                            {!chartFullScreen && (
                                                <Button
                                                    onClick={() => setPlaceBidPanel(!placeBidPanel)}
                                                    variant={'outline'}
                                                    className="h-7 w-7 cursor-pointer rounded-sm"
                                                >
                                                    {placeBidPanel ? <ChevronRight /> : <ChevronLeft />}
                                                </Button>
                                            )}
                                        </div>
                                        <div className="mt-1 flex flex-1 overflow-hidden">
                                            <div className="h-full min-w-10 shrink-0 rounded-r-sm bg-white">
                                                <ChartSidebar />
                                            </div>
                                            <Chart />
                                        </div>
                                    </div>
                                </ResizablePanel>

                                {/* resize handle  */}
                                <ResizableHandle className="bg-transparent" />

                                {/* Positions  */}
                                <ResizablePanel
                                    ref={positionPanelRef}
                                    defaultSize={
                                        positionPanelOpen
                                            ? OPENED_SIZE_OF_POSITION_PANEL
                                            : DEFAULT_SIZE_OF_POSITION_PANEL
                                    }
                                    minSize={DEFAULT_SIZE_OF_POSITION_PANEL}
                                    onResize={handlePositionPanelOpen}
                                    className="mt-1 flex h-fit min-h-12 w-full flex-col rounded-sm bg-white"
                                >
                                    <Positions
                                        positionPanelOpen={positionPanelOpen}
                                        positionPanelRef={positionPanelRef}
                                    />
                                </ResizablePanel>
                            </ResizablePanelGroup>

                            {/* Place bid  */}
                            <Activity mode={placeBidPanel ? 'visible' : 'hidden'}>
                                <div className="ml-1 w-[280px] max-w-[280px] min-w-[280px] rounded-l-sm bg-white">
                                    <BidPanel onClose={() => setPlaceBidPanel(false)} />
                                </div>
                            </Activity>
                        </div>

                        {/* wallet balance */}
                        <WalletBalance />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
    );
}
