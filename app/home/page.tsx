'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PWAInstallPrompt from '@/components/pwa-install-prompt';

export default function HomePage() {
    const router = useRouter();

    const features = [
        {
            icon: MessageSquare,
            title: 'Secure Communication',
            description: 'Access Professional Level, Study Circle, and direct Admin chat channels.',
            action: () => router.push('/home/chat'),
        },
        {
            icon: Users,
            title: 'Team Members',
            description: 'View all Blinders agents and their online status.',
            action: () => router.push('/home/members'),
        },
        {
            icon: Shield,
            title: 'Account Settings',
            description: 'Manage your profile and update your security credentials.',
            action: () => router.push('/home/settings'),
        },
    ];

    return (
        <>
            <PWAInstallPrompt />
            <div className="h-full overflow-y-auto" style={{ padding: '15px' }}>
                <div className="max-w-6xl mx-auto">
                    {/* Header - Precise Spacing */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginBottom: '20px' }}
                    >
                        <h1
                            className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#FFC107] to-[#FFD54F] bg-clip-text text-transparent"
                            style={{ marginBottom: '10px' }}
                        >
                            Welcome to Blinders
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg">
                            Your secure command center for classified operations.
                        </p>
                    </motion.div>

                    {/* Feature Cards - Precise Gaps */}
                    <div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        style={{ marginBottom: '20px' }}
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="h-full hover:border-[#FFC107] transition-all cursor-pointer group bg-[rgba(255,193,7,0.05)] border-[rgba(255,193,7,0.2)]">
                                        <CardHeader style={{ padding: '20px' }}>
                                            <div
                                                className="w-14 h-14 rounded-lg bg-[#FFC107] flex items-center justify-center group-hover:scale-110 transition-transform"
                                                style={{ marginBottom: '15px' }}
                                            >
                                                <Icon className="w-7 h-7 text-black" />
                                            </div>
                                            <div>
                                                <CardTitle
                                                    className="text-lg text-white"
                                                    style={{ marginBottom: '7px' }}
                                                >
                                                    {feature.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm text-gray-400 leading-relaxed">
                                                    {feature.description}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent style={{ padding: '0 20px 20px 20px' }}>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-between group-hover:text-[#FFC107] text-base h-11"
                                                onClick={feature.action}
                                                style={{ marginTop: '7px' }}
                                            >
                                                Access
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Status Banner - Precise Padding */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ marginBottom: '20px' }}
                    >
                        <Card className="bg-gradient-to-r from-[rgba(255,193,7,0.1)] to-[rgba(255,193,7,0.05)] border-[rgba(255,193,7,0.3)]">
                            <CardContent style={{ padding: '20px' }}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full bg-[#FFC107] animate-pulse flex-shrink-0" />
                                        <div>
                                            <p
                                                className="font-semibold text-base text-white"
                                                style={{ marginBottom: '6px' }}
                                            >
                                                System Status: Operational
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                All channels are secure and encrypted
                                            </p>
                                        </div>
                                    </div>
                                    <Shield className="w-8 h-8 text-[#FFC107]" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Stats - Precise Spacing */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-3 gap-4 sm:gap-6"
                    >
                        <Card className="bg-[rgba(255,193,7,0.05)] border-[rgba(255,193,7,0.2)]">
                            <CardContent
                                className="text-center"
                                style={{ padding: '20px' }}
                            >
                                <p
                                    className="text-3xl sm:text-4xl font-bold text-[#FFC107]"
                                    style={{ marginBottom: '7px' }}
                                >
                                    3
                                </p>
                                <p className="text-xs sm:text-sm text-gray-400">Active Channels</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[rgba(255,193,7,0.05)] border-[rgba(255,193,7,0.2)]">
                            <CardContent
                                className="text-center"
                                style={{ padding: '20px' }}
                            >
                                <p
                                    className="text-3xl sm:text-4xl font-bold text-[#FFC107]"
                                    style={{ marginBottom: '7px' }}
                                >
                                    24/7
                                </p>
                                <p className="text-xs sm:text-sm text-gray-400">Secure Access</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[rgba(255,193,7,0.05)] border-[rgba(255,193,7,0.2)]">
                            <CardContent
                                className="text-center"
                                style={{ padding: '20px' }}
                            >
                                <p
                                    className="text-3xl sm:text-4xl font-bold text-[#FFC107]"
                                    style={{ marginBottom: '7px' }}
                                >
                                    100%
                                </p>
                                <p className="text-xs sm:text-sm text-gray-400">Encrypted</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
