import LandingNavbar from '@/components/LandingNavbar';
import HeroSection from '@/components/HeroSection';
import LandingFooter from '@/components/LandingFooter';

export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            <LandingNavbar />
            <HeroSection />
            <LandingFooter />
        </main>
    );
}
