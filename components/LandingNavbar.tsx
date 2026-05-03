import Link from 'next/link';

export default function LandingNavbar() {
    return (
        <nav className="animate-in fade-in slide-in-from-top-4 fixed top-6 right-0 left-0 z-50 flex justify-center px-4 duration-1000">
            <div className="flex w-full max-w-6xl items-center justify-between rounded-full border border-slate-300/50 bg-white/80 px-8 py-3.5 transition-all">
                <Link
                    href="/"
                    className="group flex items-center gap-2 transition-transform duration-300 active:scale-95"
                >
                    <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 italic transition-colors group-hover:text-emerald-600">
                        TradeX
                    </span>
                </Link>

                <div className="flex items-center">
                    <Link
                        href="/login"
                        className="rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </nav>
    );
}
