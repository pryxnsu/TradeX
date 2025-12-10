import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative h-[140vh] min-h-screen w-full overflow-hidden bg-black pt-52 pb-20">
            <div className="absolute inset-0 bg-[url(/bg.webp)] bg-cover bg-center bg-no-repeat opacity-60" />
            <div className="absolute inset-0 bg-black/10" />{' '}
            <div className="relative z-10 container mx-auto flex flex-col items-center px-6 text-center">
                <h1 className="max-w-11/12 text-5xl font-medium tracking-tight text-white drop-shadow-sm sm:text-8xl">
                    Trade Live in the Global Markets
                </h1>

                <Link href={'/login'}>
                    <Button className="mt-12 h-10 cursor-pointer rounded-xl border border-amber-300/30 bg-linear-to-r from-amber-300 to-yellow-500 px-8 font-bold text-gray-900 shadow-xs transition-all hover:scale-102 hover:shadow-md">
                        Start
                    </Button>
                </Link>
            </div>
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-black/10 to-transparent" />
        </section>
    );
}
