'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const CORRECT_PASSKEY = '12032011';
const MAX_ATTEMPTS = 3;

export default function PasskeyLockPage() {
    const router = useRouter();
    const [passkey, setPasskey] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [isLoggedOut, setIsLoggedOut] = useState(false); // Track if user was logged out


    const handleNumberClick = (num: string) => {
        if (passkey.length < 8) {
            setPasskey(passkey + num);
        }
    };

    const handleDelete = () => {
        setPasskey(passkey.slice(0, -1));
    };

    const handleSubmit = async () => {
        if (passkey === CORRECT_PASSKEY) {
            // Check if user is still logged in (check both cookie and localStorage for mobile)
            const authToken = document.cookie.split('; ').find(row => row.startsWith('supabase-auth-token='));

            const storedSession = localStorage.getItem('supabase-session');
            if (authToken || storedSession) {
                // User still logged in - unlock and go to home
                const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
                const sessionData = {
                    unlocked: true,
                    expiresAt,
                    timestamp: new Date().toISOString()
                };

                localStorage.setItem('passkey-session', JSON.stringify(sessionData));

                // Set cookie for middleware
                document.cookie = `passkey-unlocked=true; path=/; max-age=${24 * 60 * 60}`;

                toast.success('🛡️ Blinders Unlocked!', {
                    style: {
                        background: '#000000',
                        color: '#FFC107',
                        border: '1px solid #FFC107',
                    },
                });

                router.push('/home');
            } else {
                // User logged out (after 3 failures) - go to login
                toast.success('✅ Correct passkey! Please login again.', {
                    style: {
                        background: '#000000',
                        color: '#FFC107',
                        border: '1px solid #FFC107',
                    },
                });

                router.push('/login');
            }
        } else {
            // Wrong passkey
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setPasskey('');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);

            if (newAttempts >= MAX_ATTEMPTS) {
                // Silent logout in background - don't redirect
                localStorage.removeItem('supabase-session');
                document.cookie = 'supabase-auth-token=; path=/; max-age=0';
                document.cookie = 'passkey-unlocked=; path=/; max-age=0';

                // Call logout API silently
                fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });

                // Mark as logged out to hide counter permanently
                setIsLoggedOut(true);

                toast.error('❌ Too many failed attempts. Session cleared. Enter correct passkey to continue.', {
                    style: {
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #FFC107',
                    },
                    duration: 5000,
                });

                // Reset attempts so user can continue trying
                setAttempts(0);
            } else {
                toast.error(`❌ Wrong passkey! ${MAX_ATTEMPTS - newAttempts} attempts remaining`, {
                    style: {
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #FFC107',
                    },
                });
            }
        }
    };

    const handleLogout = async () => {
        // Clear passkey session
        localStorage.removeItem('passkey-session');
        localStorage.removeItem('supabase-session');
        document.cookie = 'passkey-unlocked=; path=/; max-age=0';

        // Call logout API
        await fetch('/api/auth/logout', { method: 'POST' });

        // Redirect to login
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center" style={{ padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                {/* Shield Icon */}
                <motion.div
                    animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <Shield size={100} className="text-[#FFC107]" strokeWidth={1.5} />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-[#FFC107] opacity-20 blur-xl rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Title */}
                <h3 className="text-gray-400 text-2xl font-bold text-center mb-8" style={{ marginTop: '20px' }}>
                    Enter your passkey to unlock
                </h3>

                {/* PIN Display */}
                <div className="flex justify-center gap-3 mb-8" style={{ padding: '20px' }}>
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${i < passkey.length
                                ? 'border-[#FFC107] bg-[rgba(255,193,7,0.1)]'
                                : 'border-[rgba(255,193,7,0.3)] bg-black'
                                }`}
                        >
                            {i < passkey.length && (
                                <div className="w-3 h-3 bg-[#FFC107] rounded-full" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Attempts Counter - Hidden after 3 failures */}
                {!isLoggedOut && attempts < MAX_ATTEMPTS && (
                    <div className="text-center mb-6" style={{ marginBottom: '10px' }}>
                        <p className="text-gray-400 text-sm">
                            Attempts remaining: <span className="text-[#FFC107] font-bold">{MAX_ATTEMPTS - attempts}/{MAX_ATTEMPTS}</span>
                        </p>
                    </div>
                )}

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <Button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="h-16 text-2xl font-bold bg-[rgba(255,193,7,0.1)] hover:bg-[rgba(255,193,7,0.2)] text-white border border-[rgba(255,193,7,0.3)] rounded-xl"
                        >
                            {num}
                        </Button>
                    ))}
                    <Button
                        onClick={handleDelete}
                        className="h-16 text-xl bg-[rgba(255,193,7,0.1)] hover:bg-[rgba(255,193,7,0.2)] text-white border border-[rgba(255,193,7,0.3)] rounded-xl"
                    >
                        ⌫
                    </Button>
                    <Button
                        onClick={() => handleNumberClick('0')}
                        className="h-16 text-2xl font-bold bg-[rgba(255,193,7,0.1)] hover:bg-[rgba(255,193,7,0.2)] text-white border border-[rgba(255,193,7,0.3)] rounded-xl"
                    >
                        0
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={passkey.length !== 8}
                        className="h-16 text-xl bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold rounded-xl disabled:opacity-50"
                    >
                        ✓
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
