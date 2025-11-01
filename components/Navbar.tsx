'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Info, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { setLocalStorage } from '@/lib/localStorage';
import { cn } from '@/lib/utils';
import FavoriteInstruments from './FavoriteInstruments';
import { useUser } from '@/hooks/useUser';

interface BalanceRow {
    label: string;
    value: string;
}

interface Account {
    type: 'Real' | 'Demo';
    id: string;
    balance: string;
    color: string;
}

export default function Navbar() {
    const { user } = useUser();
    const [selectedAccount, setSelectedAccount] = useState<string>('real');

    const balanceRows: BalanceRow[] = [
        { label: 'Balance', value: '0.00 USD' },
        { label: 'Equity', value: '0.00 USD' },
        { label: 'Margin', value: '0.00 USD' },
        { label: 'Free margin', value: '0.00 USD' },
        { label: 'Margin level', value: '-' },
        { label: 'Account leverage', value: '1:200' },
    ];

    const accounts: Account[] = [
        {
            type: 'Real',
            id: '128260396',
            balance: '0.00 USD',
            color: 'bg-yellow-100 text-yellow-700',
        },
        {
            type: 'Demo',
            id: '272638969',
            balance: '10,029.62 USD',
            color: 'bg-green-100 text-green-700',
        },
    ];

    const menuItems = [
        { label: 'Manage Accounts', icon: true },
        { label: 'Transaction History', icon: true },
        { label: 'Download Trading Log', icon: true },
    ];
    return (
        <div className="flex w-full items-center justify-between px-4 py-3">
            <div className="flex items-center justify-between gap-6">
                <h1 className="text-4xl font-semibold text-yellow-500">Exness</h1>

                <div className="max-w-3xl">
                    <FavoriteInstruments />
                </div>
            </div>

            <div className="flex items-center gap-10">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-fit w-fit border-none py-px shadow-none ring-neutral-300 hover:ring-1"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'rounded-xs px-1 py-[2px] text-xs font-medium',
                                            selectedAccount == 'real'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-600 text-yellow-200'
                                        )}
                                    >
                                        {selectedAccount[0].toLocaleUpperCase() +
                                            selectedAccount.slice(1)}
                                    </div>
                                    <span className="text-xs text-black">Standard</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">0.00 USD</span>
                                    <ChevronDown />
                                </div>
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 px-3 py-2">
                        <div className="mx-auto w-full max-w-md">
                            <div className="space-y-2">
                                {balanceRows.map((row, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-gray-600">{row.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-gray-900">
                                                {row.value}
                                            </span>
                                            <button className="text-gray-400 transition-colors hover:text-gray-600">
                                                <Info size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Button variant="outline">Withdraw</Button>
                                <Button variant="outline">Deposit</Button>
                            </div>

                            <div className="mt-5">
                                <h3 className="mb-2 text-sm text-gray-600">Choose an account</h3>
                                <div className="space-y-3">
                                    {accounts.map(account => (
                                        <Button
                                            variant={'outline'}
                                            key={account.type}
                                            onClick={() => {
                                                setSelectedAccount(account.type.toLowerCase());
                                                setLocalStorage('active:account', account.id);
                                            }}
                                            className={`h-fit w-full justify-start rounded-lg border py-1 transition-colors ${
                                                selectedAccount === account.type.toLowerCase() &&
                                                'bg-neutral-100'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-left">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span
                                                            className={`rounded px-2 py-1 text-xs font-semibold ${account.color}`}
                                                        >
                                                            {account.type}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            #{account.id} Standard
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-gray-900">
                                                        {account.balance}
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-5 border-t border-gray-200">
                                {menuItems.map((item, index) => (
                                    <button
                                        key={index}
                                        className="flex w-full items-center justify-between border-b border-gray-200 py-2 text-gray-900 transition-colors last:border-b-0 hover:bg-gray-50"
                                    >
                                        <span className="font-medium">{item.label}</span>
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <UserCircle />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 px-0 py-1">
                        <div className="py-2">
                            <div className="border-b px-3 pb-4">{user?.email}</div>
                            <div className="pt-3">
                                <Button
                                    className="h-11 w-full justify-start rounded-none border-none shadow-none"
                                    variant="outline"
                                >
                                    <LogOut />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <div>
                    <Button variant={'outline'} className="px-10">
                        Deposit now
                    </Button>
                </div>
            </div>
        </div>
    );
}
