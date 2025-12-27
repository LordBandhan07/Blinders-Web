'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstall(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
        }

        setDeferredPrompt(null);
        setShowInstall(false);
    };

    if (!showInstall) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-[#0a0a0a] border-2 border-[#FFC107] rounded-xl p-4 shadow-2xl max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <Download className="w-6 h-6 text-[#FFC107]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">Install Blinders App</h3>
                        <p className="text-gray-400 text-sm mb-3">
                            Install our app for quick access and offline support
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleInstall}
                                className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold"
                            >
                                Install
                            </Button>
                            <Button
                                onClick={() => setShowInstall(false)}
                                variant="outline"
                                className="border-[rgba(255,193,7,0.3)] text-white hover:bg-[rgba(255,193,7,0.1)]"
                            >
                                Later
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
