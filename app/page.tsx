import LandingNavbar from '@/components/LandingNavbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import LandingFooter from '@/components/LandingFooter';

export default function Home() {
    return (
        <main className="min-h-screen bg-[#FAFCFB] selection:bg-emerald-100 selection:text-emerald-900">
            <LandingNavbar />
            <HeroSection />
            <FeaturesSection />
            <LandingFooter />
        </main>
    );
}
