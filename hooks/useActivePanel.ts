import { PanelTypes } from '@/types';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import { useEffect, useState } from 'react';
import { DEFAULT_SIZE_OF_POSITION_PANEL } from '@/app/(dashboard)/webtrading/page';

// manage current active pandel
export const useActivePanel = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activePanel, setActivePanel] = useState<PanelTypes>(null);
    const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
    const [leftPanelSize, setLeftPanelSize] = useState<number>(() => {
        const size = getLocalStorage('left:panel:size');
        return typeof size === 'number' && size > 0 && size < 50 ? size : 25;
    });
    const [positionPanelOpen, setPositionPanelOpen] = useState<boolean>(() => {
        const isActive = getLocalStorage<boolean>('active:position-panel');
        return typeof isActive === 'boolean' ? isActive : false;
    });

    useEffect(() => {
        (() => {
            const tab = getLocalStorage<PanelTypes>('active:panel');
            if (tab) {
                setActivePanel(tab);
            }
            setIsLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (leftPanelSize <= 5 || leftPanelSize >= 50) return;

        const timeout = setTimeout(() => {
            setLocalStorage('left:panel:size', Math.ceil(leftPanelSize));
        }, 500);

        return () => clearTimeout(timeout);
    }, [leftPanelSize]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLocalStorage('active:position-panel', positionPanelOpen);
        }, 500);

        return () => clearTimeout(timeout);
    }, [positionPanelOpen]);

    const handleActivePanel = (panelName: PanelTypes) => {
        setActivePanel(panelName);
        setLocalStorage('active:panel', panelName);
    };

    // side panel
    const handlePanelResize = (size: number) => {
        if (size <= 5) {
            setIsPanelVisible(false);
            setActivePanel(null);
        } else {
            setLeftPanelSize(size);
        }
    };

    // manage position panel open/close state
    const handlePositionPanelOpen = (size: number) => {
        if (size > DEFAULT_SIZE_OF_POSITION_PANEL) {
            setPositionPanelOpen(true);
        } else {
            setPositionPanelOpen(false);
        }
    };
    return {
        isLoading,
        activePanel,
        handleActivePanel,
        handlePanelResize,
        isPanelVisible,
        setIsPanelVisible,
        leftPanelSize,
        handlePositionPanelOpen,
        positionPanelOpen,
    };
};
