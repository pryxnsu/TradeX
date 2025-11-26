'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github, Star } from 'lucide-react';

export default function LandingNavbar() {
    return (
        <nav className="fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
            <div className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/20 bg-white/10 px-6 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-serif text-2xl font-bold tracking-wide text-white italic">
                        Exness
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            className="h-9 rounded-full font-medium text-white hover:bg-white/20 hover:text-white"
                        >
                            Sign in
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
