'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import GoogleIcon from '@/components/Icons/Google';

export default function Page() {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex h-full w-full flex-col items-center">
                <div className="flex h-11/12 w-2/3 flex-col justify-center gap-4 md:w-1/2 lg:w-1/4">
                    <h1 className="text-center text-3xl font-bold md:mb-2 md:text-5xl">Login to TradeX</h1>
                    <Button
                        onClick={() => (window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`)}
                        className="bg-muted hover:bg-muted h-11 cursor-pointer border px-6 py-4 text-black ring-1 ring-neutral-200 ring-offset-1 dark:text-white dark:ring-neutral-800"
                    >
                        <GoogleIcon />
                        <span className="text-sm">Continue with Google</span>
                    </Button>
                </div>

                <div className="mb-4 flex-1 content-end">
                    <p className="text-center text-xs">
                        By clicking continue, you agree to our <br />
                        <Link href="/legal/terms-of-services" className="font-semibold underline">
                            Terms and Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/legal/privacy-policy" className="font-semibold underline">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
