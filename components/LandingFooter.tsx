import Link from 'next/link';

export default function LandingFooter() {
    return (
        <footer className="w-full">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-gray-500 md:flex-row">
                <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-gray-900 italic">TradeX</span>
                    <span className="mt-1">&copy; {new Date().getFullYear()}</span>
                </div>

                <div className="font-medium text-gray-400">
                    Built by{' '}
                    <Link
                        href="https://x.com/pryxnsu"
                        target="_blank"
                        className="text-gray-600 transition-colors hover:text-gray-900"
                    >
                        Priyanshu Kumar
                    </Link>
                </div>

                <div className="flex gap-6">
                    <Link href="#" className="transition-colors hover:text-gray-900">
                        Terms
                    </Link>
                    <Link href="#" className="transition-colors hover:text-gray-900">
                        Privacy
                    </Link>
                    <Link href="#" className="transition-colors hover:text-gray-900">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    );
}
