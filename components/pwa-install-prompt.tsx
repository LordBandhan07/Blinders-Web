'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after 3 seconds
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if app was installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }

        setDeferredPrompt(null);
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-4 right-4 z-50 max-w-sm"
            >
                <Card className="p-4 backdrop-blur-xl bg-[rgba(255,193,7,0.05)] border-2 border-[#FFC107]/50 shadow-2xl">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#FFC107]">
                            <Smartphone className="w-5 h-5 text-black" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">
                                Install Blinders App
                            </h3>
                            <p className="text-xs text-gray-400 mb-3">
                                Install our app for quick access and offline support
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleInstall}
                                    className="flex-1 bg-[#FFC107] hover:bg-[#FFD54F] text-black"
                                >
                                    <Download size={16} className="mr-2" />
                                    Install
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowPrompt(false)}
                                    className="px-2 text-gray-400 hover:text-white"
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
