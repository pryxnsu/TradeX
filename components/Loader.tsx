'use client';

import { useAccount } from "@/hooks/useAccount";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "./ui/spinner";

export default function Loader({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading: userLoading } = useUser();
    const { walletLoading } = useAccount();

    useEffect(() => {
        if (!userLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, userLoading, router]);

    if (userLoading || walletLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (!userLoading || !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
