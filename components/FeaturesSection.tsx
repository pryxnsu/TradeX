import { Activity, Code, Layers, Zap } from 'lucide-react';
import React from 'react';

const features = [
    {
        name: 'Real-time Market Data',
        description: 'Live price updates streamed seamlessly using WebSockets for a realistic trading experience.',
        icon: Activity,
    },
    {
        name: 'Interactive Charting',
        description: 'Advanced, responsive financial charts integrated for technical analysis and data visualization.',
        icon: Layers,
    },
    {
        name: 'Simulated Execution',
        description: 'A custom matching engine built to handle order placements, mock trades, and portfolio tracking instantly.',
        icon: Zap,
    },
    {
        name: 'Modern Tech Stack',
        description: 'Engineered with Next.js, TailwindCSS, and a robust backend to demonstrate full-stack capabilities.',
        icon: Code,
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 sm:py-32 bg-white/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[400px] h-[400px] rounded-full bg-emerald-100/40 blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-teal-100/40 blur-[100px]"></div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base/7 font-semibold text-emerald-600">Project Highlights</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
                        Built to demonstrate complex systems
                    </p>
                    <p className="mt-6 text-lg/8 text-slate-600">
                        This application is a portfolio project showcasing how to handle real-time data, state management, and complex financial UIs.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-2">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/60 p-8 shadow-sm transition-all hover:shadow-md hover:bg-white backdrop-blur-xl group">
                                <dt className="flex items-center gap-x-4 text-xl font-semibold text-slate-900">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 group-hover:bg-emerald-600 transition-colors duration-500">
                                        <feature.icon className="size-6 text-emerald-600 group-hover:text-white transition-colors duration-500" aria-hidden="true" />
                                    </div>
                                    {feature.name}
                                </dt>
                                <dd className="mt-6 flex flex-auto flex-col text-base/7 text-slate-600">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
