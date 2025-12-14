'use client';
/**
 * show all active, closed and pendind positions of user
 */

import { ChevronUp, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from './ui/button';
import { DEFAULT_SIZE_OF_POSITION_PANEL, OPENED_SIZE_OF_POSITION_PANEL } from '@/app/(dashboard)/webtrading/page';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { Activity, RefObject, useState } from 'react';
import OpenPositions from './OpenPositions';
import ClosedPositions from './ClosedPositions';

export default function Positions({
    positionPanelOpen,
    positionPanelRef,
}: {
    positionPanelOpen: boolean;
    positionPanelRef: RefObject<ImperativePanelHandle | null>;
}) {
    const [activePositionTab, setActivePositionTab] = useState('open');

    function openPanel() {
        positionPanelRef?.current?.resize(OPENED_SIZE_OF_POSITION_PANEL);
    }
    return (
        <Tabs
            value={activePositionTab}
            onValueChange={setActivePositionTab}
            defaultValue="open"
            className="mt-1 flex h-full flex-col gap-0 px-2"
        >
            <TabsList className="flex h-fit w-full shrink-0 items-center justify-between gap-4 rounded-none border-b bg-transparent pb-2">
                <div className="space-x-5">
                    <TabsTrigger value="open" onClick={openPanel}>
                        Open
                    </TabsTrigger>
                    <TabsTrigger value="pending" onClick={openPanel}>
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="closed" onClick={openPanel}>
                        Closed
                    </TabsTrigger>
                </div>

                {/* open / close position panel  */}
                {positionPanelOpen ? (
                    <Button
                        variant={'outline'}
                        className={'cursor-pointer'}
                        onClick={() => {
                            positionPanelRef?.current?.resize(DEFAULT_SIZE_OF_POSITION_PANEL);
                        }}
                    >
                        <X size={18} className="cursor-pointer" />
                    </Button>
                ) : (
                    <Button
                        variant={'ghost'}
                        className={'cursor-pointer hover:border-none hover:bg-transparent'}
                        onClick={openPanel}
                    >
                        <ChevronUp size={18} className="cursor-pointer" />
                    </Button>
                )}
            </TabsList>
            <Activity mode={activePositionTab === 'open' ? 'visible' : 'hidden'}>
                <div className="h-full flex-1 overflow-auto">
                    <OpenPositions activeTab={activePositionTab} />
                </div>
            </Activity>
            <Activity mode={activePositionTab === 'pending' ? 'visible' : 'hidden'}>
                <div className="flex-1 overflow-auto">Pending Positions (Coming soon)</div>
            </Activity>
            <Activity mode={activePositionTab === 'closed' ? 'visible' : 'hidden'}>
                <div className="flex-1 overflow-auto">
                    <ClosedPositions activeTab={activePositionTab} />
                </div>
            </Activity>
        </Tabs>
    );
}
