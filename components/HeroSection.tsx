import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden pt-40 pb-32">
            <div className="relative z-10 container mx-auto flex flex-col items-center px-6 text-center">
                <h1 className="mt-12 max-w-4xl text-6xl font-bold tracking-tight text-balance text-slate-900 md:text-8xl">
                    Trade Live in the{' '}
                    <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Global Markets
                    </span>
                </h1>

                <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                    <Link href={'/login'}>
                        <Button className="text-md h-12 cursor-pointer rounded-xl bg-slate-900 px-5 font-medium text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl">
                            Get Started
                        </Button>
                    </Link>
                </div>

                <div className="group relative mt-24 w-full max-w-6xl px-4">
                    <div className="absolute -inset-4 rounded-[2.5rem] bg-linear-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100"></div>

                    <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/50 p-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-3xl">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                            <div className="aspect-video w-full">
                                <iframe
                                    className="h-full w-full"
                                    src={process.env.NEXT_PUBLIC_DEMO_URL}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
