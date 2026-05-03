import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden pt-40 pb-32">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-200/30 blur-[120px] mix-blend-multiply"></div>
                <div className="absolute top-0 -right-20 h-[600px] w-[600px] rounded-full bg-amber-100/40 blur-[120px] mix-blend-multiply"></div>
                <div className="absolute top-60 left-1/2 -translate-x-1/2 h-[800px] w-[800px] rounded-full bg-teal-100/30 blur-[150px] mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9811a_1px,transparent_1px),linear-gradient(to_bottom,#10b9811a_1px,transparent_1px)] bg-size-[24px_24px] mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-60"></div>
            </div>

            <div className="relative z-10 container mx-auto flex flex-col items-center px-6 text-center">
                <h1 className="mt-12 max-w-4xl text-6xl font-bold tracking-tight text-balance text-slate-900 md:text-8xl font-oswald">
                    Trade Live in the{' '}
                    <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                        Global Markets
                    </span>
                </h1>

                <p className="mt-8 max-w-2xl text-lg text-slate-600 leading-relaxed md:text-xl">
                    A high-performance trading platform built to showcase real-time execution, advanced analytics, and modern web architecture.
                </p>

                <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                    <Link href={'/login'}>
                        <Button className="h-14 cursor-pointer rounded-full bg-slate-900 px-8 text-base font-medium text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:bg-emerald-900 hover:shadow-[0_12px_40px_rgba(5,150,105,0.2)]">
                            Start Trading Now
                        </Button>
                    </Link>
                    <Link href={'#demo'}>
                        <Button variant="outline" className="h-14 cursor-pointer rounded-full border-slate-200 bg-white/50 backdrop-blur-md px-8 text-base font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:bg-white hover:text-emerald-700">
                            Watch Demo
                        </Button>
                    </Link>
                </div>

                <div id="demo" className="group relative mt-24 w-full max-w-6xl px-4">
                    <div className="absolute -inset-1 rounded-[2.5rem] bg-linear-to-r from-emerald-500/30 via-teal-500/20 to-green-500/30 opacity-50 blur-3xl transition duration-700 group-hover:opacity-100 group-hover:duration-200"></div>

                    <div className="relative overflow-hidden rounded-4xl border border-white/60 bg-white/40 p-2 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-2xl transition-transform duration-500 hover:scale-[1.01]">
                        <div className="overflow-hidden rounded-3xl border border-white/20 bg-slate-950 shadow-inner">
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
