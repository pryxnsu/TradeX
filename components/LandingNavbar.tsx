import Link from 'next/link';

export default function LandingNavbar() {
    return (
        <nav className="animate-in fade-in slide-in-from-top-4 fixed top-6 right-0 left-0 z-50 flex justify-center px-4 duration-1000">
            <div className="flex w-full max-w-6xl items-center justify-between rounded-full border border-slate-200/60 bg-white/70 px-8 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-black/5 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_12px_44px_rgba(0,0,0,0.06)]">
                <Link
                    href="/"
                    className="group flex items-center gap-2 transition-transform duration-300 active:scale-95"
                >
                    <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 italic transition-colors group-hover:text-blue-600">
                        TradeX
                    </span>
                </Link>

                <div className="flex items-center">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </nav>
    );
}
