'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import RecentlyOpenedInstruments from './RecentlyOpenedInstruments';
import { useUser } from '@/hooks/useUser';
import { useAccount } from '@/hooks/useAccount';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from './ui/spinner';

const MENU_ITEMS = [
    { label: 'Manage Accounts', icon: true },
    { label: 'Transaction History', icon: true },
    { label: 'Download Trading Log', icon: true },
];

export default function Navbar() {
    const { user } = useUser();
    const { wallet } = useAccount();

    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/logout`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to logout. Please try again');
            }

            const data = await response.json();
            toast.success('Logout', { description: data.message });
            router.push('/login');
        } catch (err: unknown) {
            console.error(`Error in logout`, err);
            const errMsg = err instanceof Error ? err.message : 'Something went wrong while logging out';
            toast.error('Validation Error', { description: errMsg });
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (isLoggingOut) {
        return (
            <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center gap-2 bg-white/80 backdrop-blur-sm">
                <p className="text-lg font-medium">Logging out...</p>
                <Spinner className="size-4" />
            </div>
        );
    }
    return (
        <div className="flex h-16 w-full items-center justify-between px-4">
            <div className="flex items-center justify-between gap-6">
                <h1 className="text-4xl font-semibold text-yellow-500">TradeX</h1>

                <div className="max-w-3xl">
                    <RecentlyOpenedInstruments />
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
                                            'rounded-xs px-1 py-0.5 text-xs font-medium',
                                            wallet?.type == 'real'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-600 text-yellow-200'
                                        )}
                                    >
                                        {wallet?.type.toUpperCase() || 'Demo'}
                                    </div>
                                    <span className="text-xs text-black">Standard</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                        {wallet?.equity.toFixed(2) || 0.0} {wallet?.currency || 'USD'}
                                    </span>
                                    <ChevronDown />
                                </div>
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 px-4 py-3">
                        <div className="mx-auto w-full max-w-md">
                            <div className="space-y-2">
                                <BalanceRow name="Balance" value={wallet?.balance.toFixed(2) || 0.0} />
                                <BalanceRow name="Equity" value={wallet?.equity.toFixed(2) || 0.0} />
                                <BalanceRow name="Margin" value={wallet?.margin.toFixed(2) || 0.0} />
                                <BalanceRow name="Free Margin" value={wallet?.freeMargin.toFixed(2) || 0.0} />
                                <BalanceRow name="Account Leverage" value={`1:${wallet?.leverage || 0}`} />
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Button variant="outline">Withdraw</Button>
                                <Button variant="outline">Deposit</Button>
                            </div>

                            <div className="mt-5 border-t border-gray-200">
                                {MENU_ITEMS.map(item => (
                                    <button
                                        key={item.label}
                                        className="flex w-full items-center justify-between border-b border-gray-200 py-2 text-gray-900 transition-colors last:border-b-0 hover:bg-gray-50"
                                    >
                                        <span className="text-sm font-medium">{item.label}</span>
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
                                    onClick={handleLogout}
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

function BalanceRow({ name, value }: { name: string; value: string | number | undefined }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{name}</span>
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{value?.toLocaleString()}</span>
            </div>
        </div>
    );
}
