'use client';

import { cn } from '@/lib/utils';
import Instruments from '@/components/Instruments';
import Navbar from '@/components/Navbar';
import Chart from '@/components/Chart';
import { Button } from '@/components/ui/button';
import { Calendar, Menu, Settings } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useActivePanel } from '@/hooks/useActivePanel';
import { useState, useRef } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { PanelTypes } from '@/types';
import BidPanel from '@/components/BidPanel';
import Positions from '@/components/Positions';

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
    const { activePanel, handleActivePanel, handlePanelResize, isPanelVisible, setIsPanelVisible } =
        useActivePanel();

    const positionPanelRef = useRef<ImperativePanelHandle | null>(null);
    const [positionPanelOpen, setPositionPanelOpen] = useState(false);
    const [placeBidPanel, setPlaceBidPanel] = useState(true);

    // manage position panel open/close state
    const handlePositionPanelOpen = (size: number) => {
        if (size > DEFAULT_SIZE_OF_POSITION_PANEL) {
            setPositionPanelOpen(true);
        } else {
            setPositionPanelOpen(false);
        }
    };
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
                    {activePanel && isPanelVisible && (
                        <>
                            <ResizablePanel
                                defaultSize={30}
                                onResize={handlePanelResize}
                                className="mr-1 w-sm max-w-fit rounded-tl-sm rounded-tr-sm bg-white"
                            >
                                {activePanel == 'instruments' && (
                                    <Instruments onClose={handleActivePanel} />
                                )}
                                {activePanel == 'calender' && <p>Calender</p>}
                                {activePanel == 'settings' && <p>Settings</p>}
                            </ResizablePanel>

                            {/* handle showing only if side panel exists */}
                            <ResizableHandle className="bg-transparent" />
                        </>
                    )}
                    {/* right panel  */}
                    <ResizablePanel
                        defaultSize={70}
                        className="flex h-full flex-1 flex-col rounded-tl-sm bg-neutral-100"
                    >
                        <ResizablePanelGroup direction="vertical" className="flex-1">
                            {/* Chart  */}
                            <ResizablePanel defaultSize={93} className="flex">
                                <Chart />
                                {/* Place bid  */}
                                {placeBidPanel && (
                                    <div className="ml-1 w-[40%] rounded-l-sm bg-white">
                                        <BidPanel onClose={() => setPlaceBidPanel(false)} />
                                    </div>
                                )}
                            </ResizablePanel>

                            {/* resize handle  */}
                            <ResizableHandle className="bg-transparent" />

                            {/* Positions  */}
                            <ResizablePanel
                                ref={positionPanelRef}
                                defaultSize={DEFAULT_SIZE_OF_POSITION_PANEL}
                                minSize={DEFAULT_SIZE_OF_POSITION_PANEL}
                                onResize={handlePositionPanelOpen}
                                className="mt-1 flex h-full w-full flex-col rounded-sm bg-white"
                            >
                                <Positions
                                    positionPanelOpen={positionPanelOpen}
                                    positionPanelRef={positionPanelRef}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>

                        {/* wallet balance */}
                        <footer className="mt-1 flex h-12 gap-6 rounded-tl-sm bg-white px-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neutral-600">Equity:</span>
                                <span className="text-sm font-medium text-neutral-900">
                                    1000.00 USD
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neutral-600">Free margin:</span>
                                <span className="text-sm font-medium text-neutral-900">
                                    1000.00 USD
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neutral-600">Balance:</span>
                                <span className="text-sm font-medium text-neutral-900">
                                    1000.00 USD
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neutral-600">Margin:</span>
                                <span className="text-sm font-medium text-neutral-900">
                                    1000.00 USD
                                </span>
                            </div>
                        </footer>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
    );
}
