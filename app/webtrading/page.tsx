'use client';

import { cn } from '@/lib/utils';
import Instruments from '@/components/Instruments';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Calendar, Menu, Settings } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useActivePanel } from '@/hooks/useActivePanel';
import { PanelTypes } from '../../types';

const buttonsItems = [
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

export default function Page() {
    const { activePanel, handleActivePanel, handlePanelResize, isPanelVisible, setIsPanelVisible } = useActivePanel();

    return (
        <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-neutral-100">
            <header className="bg-white">
                <Navbar />
            </header>

            <main className="mt-1 flex flex-1 bg-neutral-100">
                <aside className="mr-1 rounded-tr-sm bg-white">
                    <div className="mt-5 flex flex-col gap-6 px-2">
                        {buttonsItems.map(button => (
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
                            <ResizableHandle className="w-fit" />
                        </>
                    )}
                    <ResizablePanel defaultSize={70} className="flex-1 rounded-tl-sm bg-white">
                        Chart area
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
    );
}
