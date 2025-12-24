import LandingNavbar from '@/components/LandingNavbar';
import HeroSection from '@/components/HeroSection';
import LandingFooter from '@/components/LandingFooter';

export default function Home() {
    return (
        <main className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
            <LandingNavbar />
            <HeroSection />
            <LandingFooter />
        </main>
    );
}
