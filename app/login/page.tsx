'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, Lock, Zap, Fingerprint } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase(), password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Welcome, ${data.user.display_name}!`, {
                    icon: '🕶️',
                    style: {
                        background: '#000000',
                        color: '#FFC107',
                        border: '1px solid #FFC107',
                    },
                });
                setTimeout(() => router.push('/home'), 500);
            } else {
                toast.error(data.error || 'Invalid credentials', {
                    style: {
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #FFC107',
                    },
                });
            }
        } catch (error) {
            toast.error('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-black">
            <Toaster position="top-center" />

            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 193, 7, 0.05) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255, 193, 7, 0.05) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>

            {/* Animated Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full opacity-5 border border-[#FFC107]"
                        style={{
                            width: '200px',
                            height: '200px',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            x: [0, Math.random() * 100 - 50],
                            y: [0, Math.random() * 100 - 50],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 20,
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative h-[calc(100vh-100px)] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo Section */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex justify-center mb-6">
                            <img
                                src="/favicon.ico"
                                alt="Blinders Logo"
                                className="w-80 h-80"
                                style={{
                                    filter: 'invert(20%) sepia(85%) saturate(1352%) hue-rotate(359deg) brightness(102%) contrast(101%)',
                                }}
                            />
                        </div>

                        <motion.h2
                            className="text-2xl text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ marginBottom: '12px' }}
                        >
                            Secure Access Portal
                        </motion.h2>
                    </motion.div>

                    {/* Login Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="p-16 bg-[rgba(255,193,7,0.05)] backdrop-blur-2xl border border-[rgba(255,193,7,0.2)] rounded-2xl shadow-2xl"
                    >
                        <form onSubmit={handleLogin} className="space-y-10">
                            {/* Blinders ID Input */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-white mb-4" style={{ marginBottom: '7px', marginLeft: '6px', marginTop: '7px' }}>
                                    <Shield className="w-6 h-6 text-[#FFC107]" />
                                    <label className="text-lg font-medium">Blinders ID</label>
                                </div>
                                <div className="relative" style={{ marginBottom: '7px', marginLeft: '6px', marginRight: '6px' }}>
                                    <Input
                                        type="text"
                                        placeholder="Enter your Blinders ID"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-15 bg-black/50 border border-[rgba(255,193,7,0.2)] text-white focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] rounded-2xl px-6 py-6 transition-all duration-300 text-lg"
                                        style={{ paddingLeft: '10px' }}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-white mb-4" style={{ marginBottom: '7px', marginLeft: '6px', marginTop: '7px' }}>
                                    <Lock className="w-6 h-6 text-[#FFC107]" />
                                    <label className="text-lg font-medium">Password</label>
                                </div>
                                <div className="relative" style={{ marginBottom: '7px', marginLeft: '6px', marginRight: '6px' }}>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-15 bg-black/50 border border-[rgba(255,193,7,0.2)] text-white focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] rounded-2xl px-6 py-6 pr-16 transition-all duration-300 text-lg"
                                        style={{ paddingLeft: '10px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FFC107] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-15 w-108 bg-gradient-to-r from-[#FFC107] to-[#FFD54F] hover:from-[#FFD54F] hover:to-[#FFC107] text-black font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-[#FFC107]/20 flex items-center justify-center text-lg"
                                style={{ marginBottom: '15px', marginTop: '15px', marginLeft: '7px', marginRight: '7px' }}
                            >
                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-4"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
                                            />
                                            <span>Authenticating...</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="submit"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center justify-center gap-4"
                                        >
                                            <Fingerprint className="w-8 h-8" />
                                            <span>Access Securely</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </form>

                        {/* Security Badge */}
                        <motion.div
                            className="mt-6 flex h-10 items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-[rgba(255,193,7,0.1)] to-[rgba(255,193,7,0.05)] border border-[rgba(255,193,7,0.2)]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Shield className="w-4 h-4 text-[#FFC107]" />
                            <span className="text-xs text-gray-400">Encrypted & Secure by Arthur</span>
                        </motion.div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        style={{ marginTop: '7px' }}
                    >
                        <p className="text-xs text-gray-500">
                            © 2026 Blinders. All access secured.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}