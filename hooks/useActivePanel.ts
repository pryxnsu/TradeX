import { PanelTypes } from '@/types';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import { useEffect, useState } from 'react';

// manage current active pandel 
export const useActivePanel = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activePanel, setActivePanel] = useState<PanelTypes>(null);
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    useEffect(() => {
        (() => {
            const tab = getLocalStorage<PanelTypes>('active:panel');
            if (tab) {
                setActivePanel(tab);
            }
            setIsLoading(false);
        })();
    }, []);


    const handleActivePanel = (panelName: PanelTypes) => {
        setActivePanel(panelName);
        setLocalStorage('active:panel', panelName);
    };

    const handlePanelResize = (size: number) => {
        if (size <= 5) {
            setIsPanelVisible(false);
            setActivePanel(null);
        }
    };
    return {
        isLoading,
        activePanel,
        handleActivePanel,
        handlePanelResize,
        isPanelVisible,
        setIsPanelVisible
    };
};
