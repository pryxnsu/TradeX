'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Crosshair,
    TrendingUp,
    Minus,
    Circle,
    Square,
    Triangle,
    Type,
    Ruler,
    Smile,
    Brush,
    GitBranch,
    ArrowUpRight,
    Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolItem {
    id: string;
    icon: React.ElementType;
    label: string;
    shortcut?: string;
}

interface ToolGroup {
    id: string;
    tools: ToolItem[];
}

const TOOL_GROUPS: ToolGroup[] = [
    {
        id: 'cursor',
        tools: [{ id: 'crosshair', icon: Crosshair, label: 'Crosshair', shortcut: 'C' }],
    },
    {
        id: 'lines',
        tools: [
            { id: 'trendline', icon: TrendingUp, label: 'Trend Line', shortcut: 'T' },
            { id: 'horizontal', icon: Minus, label: 'Horizontal Line', shortcut: 'H' },
            { id: 'ray', icon: ArrowUpRight, label: 'Ray', shortcut: 'R' },
        ],
    },
    {
        id: 'fibonacci',
        tools: [{ id: 'fib-retracement', icon: GitBranch, label: 'Fib Retracement', shortcut: 'F' }],
    },
    {
        id: 'shapes',
        tools: [
            { id: 'rectangle', icon: Square, label: 'Rectangle' },
            { id: 'circle', icon: Circle, label: 'Circle' },
            { id: 'triangle', icon: Triangle, label: 'Triangle' },
        ],
    },
    {
        id: 'annotation',
        tools: [
            { id: 'text', icon: Type, label: 'Text', shortcut: 'X' },
            { id: 'brush', icon: Brush, label: 'Brush', shortcut: 'B' },
        ],
    },
    {
        id: 'patterns',
        tools: [{ id: 'emoji', icon: Smile, label: 'Emoji & Stickers' }],
    },
    {
        id: 'measure',
        tools: [
            { id: 'ruler', icon: Ruler, label: 'Measure', shortcut: 'M' },
            { id: 'price-range', icon: Hash, label: 'Price Range' },
        ],
    },
];

interface ChartSidebarProps {
    onToolSelect?: (toolId: string) => void;
}

export default function ChartSidebar({ onToolSelect }: ChartSidebarProps) {
    const [activeTool, setActiveTool] = useState<string>('crosshair');

    const handleToolClick = (toolId: string) => {
        setActiveTool(toolId);
        onToolSelect?.(toolId);
    };

    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex h-full w-10 flex-col items-center py-2">
                {TOOL_GROUPS.map((group, groupIndex) => (
                    <React.Fragment key={group.id}>
                        {group.tools.map(tool => (
                            <Tooltip key={tool.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToolClick(tool.id)}
                                        className={cn(
                                            'mb-0.5 h-8 w-8 p-0 transition-all duration-150',
                                            activeTool === tool.id
                                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                                        )}
                                    >
                                        <tool.icon className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="flex items-center gap-2">
                                    <span>{tool.label}</span>
                                    {tool.shortcut && (
                                        <kbd className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-neutral-600">
                                            {tool.shortcut}
                                        </kbd>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        {groupIndex < TOOL_GROUPS.length - 1 && <div className="my-1.5 h-px w-5 bg-neutral-200" />}
                    </React.Fragment>
                ))}
            </div>
        </TooltipProvider>
    );
}
