'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Shield, Lock, Mail, Zap } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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

            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />
            <div className="absolute inset-0 grid-bg opacity-20" />

            {/* Mouse Gradient - YELLOW */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 193, 7, 0.1), transparent 40%)`,
                }}
            />

            {/* Floating Orbs - YELLOW */}
            {isMounted && (
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: Math.random() * 300 + 50,
                                height: Math.random() * 300 + 50,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: 'radial-gradient(circle, rgba(255, 193, 7, 0.1), transparent)',
                                filter: 'blur(40px)',
                            }}
                            animate={{
                                x: [0, Math.random() * 100 - 50],
                                y: [0, Math.random() * 100 - 50],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                repeatType: 'reverse',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Particles - YELLOW */}
            {isMounted && (
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: '#FFC107',
                            }}
                            animate={{
                                y: [0, -50, 0],
                                opacity: [0.2, 1, 0.2],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-8 sm:p-10 md:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="w-full max-w-lg"
                >
                    {/* Logo Section */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {/* Logo - MOBILE FRIENDLY */}
                        <motion.div
                            className="flex items-center justify-center mb-8"
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 relative">
                                <img
                                    src="/blinders-logo.svg"
                                    alt="Blinders Logo"
                                    className="w-full h-full object-contain"
                                    style={{
                                        filter: 'brightness(0) saturate(100%) invert(77%) sepia(85%) saturate(1352%) hue-rotate(359deg) brightness(102%) contrast(101%)',
                                        WebkitFilter: 'brightness(0) saturate(100%) invert(77%) sepia(85%) saturate(1352%) hue-rotate(359deg) brightness(102%) contrast(101%)'
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-7xl font-black mb-4"
                            style={{
                                background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFC107 100%)',
                                backgroundSize: '200% 200%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                        >
                            BLINDERS
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.div
                            className="flex items-center justify-center gap-3 text-gray-400 text-base sm:text-lg tracking-widest"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Zap className="w-5 h-5 text-[#FFC107]" />
                            <span>THE FUTURE AGENTS</span>
                            <Zap className="w-5 h-5 text-[#FFC107]" />
                        </motion.div>
                    </motion.div>

                    {/* Login Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <Card className="p-8 sm:p-10 backdrop-blur-xl bg-[rgba(255,193,7,0.05)] border-2 border-[rgba(255,193,7,0.2)] hover:border-[#FFC107] transition-all duration-500">
                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-3 mb-8 p-4 rounded-xl bg-gradient-to-r from-[rgba(255,193,7,0.1)] to-[rgba(255,193,7,0.05)] border border-[rgba(255,193,7,0.3)]">
                                <Shield className="w-6 h-6 text-[#FFC107]" />
                                <span className="text-base font-semibold text-white">
                                    Secure Access Portal
                                </span>
                                <Lock className="w-5 h-5 text-[#FFC107]" />
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Email Input */}
                                <motion.div
                                    className="space-y-3"
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <label className="text-base font-medium text-white flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-[#FFC107]" />
                                        Email ID
                                    </label>
                                    <div className="relative group">
                                        <Input
                                            type="email"
                                            placeholder="arthur.b@blinders.chief"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-5 pr-5 h-14 text-lg transition-all duration-300 group-hover:border-[#FFC107]/50 bg-black/50 border-[rgba(255,193,7,0.2)] text-white rounded-xl"
                                        />
                                        <motion.div
                                            className="absolute inset-0 rounded-xl pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            style={{
                                                boxShadow: '0 0 20px rgba(255, 193, 7, 0.2)',
                                            }}
                                        />
                                    </div>
                                </motion.div>

                                {/* Password Input */}
                                <motion.div
                                    className="space-y-3"
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <label className="text-base font-medium text-white flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-[#FFC107]" />
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-5 pr-14 h-14 text-lg transition-all duration-300 group-hover:border-[#FFC107]/50 bg-black/50 border-[rgba(255,193,7,0.2)] text-white rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                        </button>
                                        <motion.div
                                            className="absolute inset-0 rounded-xl pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            style={{
                                                boxShadow: '0 0 20px rgba(255, 193, 7, 0.2)',
                                            }}
                                        />
                                    </div>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="pt-2"
                                >
                                    <Button
                                        type="submit"
                                        className="w-full h-16 text-lg font-semibold relative overflow-hidden group bg-[#FFC107] hover:bg-[#FFD54F] text-black rounded-xl"
                                        disabled={isLoading}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                        className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
                                                    />
                                                    <span>Authenticating...</span>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="submit"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    <Zap className="w-6 h-6" />
                                                    <span>Access Blinders</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    </Button>
                                </motion.div>
                            </form>

                            {/* Footer Note */}
                            <motion.div
                                className="mt-8 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    🔒 Authorized personnel only<br />
                                    Contact the <span className="text-[#FFC107] font-semibold">God of Blinders</span> for access
                                </p>
                            </motion.div>
                        </Card>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="mt-10 text-center space-y-3"
                    >
                        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4" />
                            Secured by Blinders Protocol v2.0
                        </p>
                        <p className="text-sm text-gray-500">
                            "The future is secured by those who remain unseen"
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
