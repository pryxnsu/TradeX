import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-[url(/hero-bg.jpg)] bg-cover bg-center bg-no-repeat pt-52 pb-20">
            <div className="absolute inset-0 bg-black/10" />{' '}
            <div className="relative z-10 container mx-auto flex flex-col items-center px-6 text-center">
                <h1 className="font-serif text-6xl font-medium tracking-tight text-white italic drop-shadow-sm sm:text-8xl">
                    Exness
                </h1>

                <p className="mt-6 max-w-2xl text-xl leading-relaxed font-light text-white/90 drop-shadow-sm">
                    Exness clone (a trading platform). A personal project built with passion and modern tech.
                </p>

                <Link href={'/login'}>
                    <Button className="mt-12 h-10 cursor-pointer rounded-xl border border-white/10 bg-linear-to-r from-orange-500 to-red-500 px-6 font-semibold text-white shadow-lg hover:from-orange-600 hover:to-red-600">
                        Start
                    </Button>
                </Link>
            </div>
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-black/10 to-transparent" />
        </section>
    );
}
