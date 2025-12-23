'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleReload = () => {
        window.location.reload();
    };

    if (isOnline) return null;

    return (
        <div className="min-h-screen w-full bg-[var(--background)] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <Card className="p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative w-24 h-24">
                            <Image
                                src="/blinders-logo.svg"
                                alt="Blinders Logo"
                                fill
                                className="object-contain opacity-50"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-full bg-[var(--danger)]/20">
                                <WifiOff className="w-8 h-8 text-[var(--danger)]" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                            You're Offline
                        </h1>
                        <p className="text-[var(--foreground-secondary)]">
                            No internet connection detected. Please check your network and try again.
                        </p>
                    </div>

                    <Button
                        onClick={handleReload}
                        className="w-full"
                    >
                        <RefreshCw size={20} className="mr-2" />
                        Try Again
                    </Button>

                    <p className="text-xs text-[var(--foreground-secondary)] mt-4">
                        Some features may be available offline if you've visited them before.
                    </p>
                </Card>
            </motion.div>
        </div>
    );
}
