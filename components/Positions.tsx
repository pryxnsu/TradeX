'use client';
/**
 * show all active, closed and pendind positions of user
 */

import { ChevronUp, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from './ui/button';
import {
    DEFAULT_SIZE_OF_POSITION_PANEL,
    OPENED_SIZE_OF_POSITION_PANEL,
} from '@/app/(dashboard)/webtrading/page';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { RefObject, useState } from 'react';
import ClosedPositions from './ClosedPositions';

export default function Positions({
    positionPanelOpen,
    positionPanelRef,
}: {
    positionPanelOpen: boolean;
    positionPanelRef: RefObject<ImperativePanelHandle | null>;
}) {
    const [activePositionTab, setActivePositionTab] = useState('open');
    return (
        <Tabs
            value={activePositionTab}
            onValueChange={setActivePositionTab}
            defaultValue="open"
            className="mt-1 flex h-full flex-col px-2"
        >
            <TabsList className="flex h-fit w-full shrink-0 items-center justify-between gap-4 rounded-none bg-transparent">
                <div className="space-x-5">
                    <TabsTrigger value="open">Open</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="closed">Closed</TabsTrigger>
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
                        onClick={() => {
                            positionPanelRef.current?.resize(OPENED_SIZE_OF_POSITION_PANEL);
                        }}
                    >
                        <ChevronUp size={18} className="cursor-pointer" />
                    </Button>
                )}
            </TabsList>
            <TabsContent value="open" className="flex-1 overflow-auto">
                Open Positions (Coming soon)
            </TabsContent>
            <TabsContent value="pending" className="flex-1 overflow-auto">
                Pending Positions (Coming soon)
            </TabsContent>
            <TabsContent value="closed" className="flex-1 overflow-auto">
                <ClosedPositions activeTab={activePositionTab} />
            </TabsContent>
        </Tabs>
    );
}
