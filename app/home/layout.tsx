'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Settings, Users, LogOut, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface LayoutProps {
    children: React.ReactNode;
}

export default function HomeLayout({ children }: LayoutProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('chat');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const navItems = [
        { id: 'chat', label: 'Chat', icon: MessageSquare, href: '/home/chat' },
        { id: 'members', label: 'Members', icon: Users, href: '/home/members' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/home/settings' },
    ];

    const handleNavClick = (item: typeof navItems[0]) => {
        setActiveTab(item.id);
        router.push(item.href);
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const SidebarContent = () => (
        <>
            {/* LOGO - BIG & YELLOW! */}
            <div className="p-8 border-b border-[rgba(255,193,7,0.2)]">
                <div className="flex flex-col items-center gap-5 text-center">
                    {/* BIG SVG LOGO - YELLOW */}
                    <div className="relative w-28 h-28">
                        <Image
                            src="/blinders-logo.svg"
                            alt="Blinders"
                            fill
                            className="object-contain"
                            style={{
                                filter: 'brightness(0) saturate(100%) invert(77%) sepia(85%) saturate(1352%) hue-rotate(359deg) brightness(102%) contrast(101%)'
                            }}
                        />
                    </div>
                    {/* BIG TEXT */}
                    <div>
                        <h1 className="text-4xl font-black text-[#FFC107] tracking-wider">BLINDERS</h1>
                        <p className="text-lg text-gray-300 mt-2 font-semibold">The Future Agents</p>
                    </div>
                </div>
            </div>

            {/* USER PROFILE - BIGGER */}
            <div className="p-8 border-b border-[rgba(255,193,7,0.2)]">
                <div className="flex items-center gap-5">
                    <Avatar className="w-16 h-16 border-2 border-[#FFC107]">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-[#FFC107] text-black font-bold text-xl">BA</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg text-white truncate">Blinders Agent</p>
                        <p className="text-sm text-gray-400 truncate mt-1">agent@blinders.com</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#FFC107] animate-pulse flex-shrink-0" />
                </div>
            </div>

            {/* NAVIGATION - BIG BUTTONS */}
            <nav className="flex-1 p-6 space-y-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => handleNavClick(item)}
                            className={`w-full flex items-center gap-5 px-6 py-4 rounded-xl transition-all text-lg font-bold ${isActive
                                    ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/50'
                                    : 'text-gray-300 hover:bg-[rgba(255,193,7,0.1)] hover:text-white'
                                }`}
                            whileHover={{ x: 6 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon size={26} strokeWidth={2.5} />
                            <span>{item.label}</span>
                        </motion.button>
                    );
                })}
            </nav>

            {/* LOGOUT - BIG BUTTON */}
            <div className="p-6 border-t border-[rgba(255,193,7,0.2)]">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-5 text-lg font-bold h-14 border-2 border-[rgba(255,193,7,0.3)] hover:bg-[rgba(255,193,7,0.1)] hover:text-white hover:border-[#FFC107] text-gray-300"
                    onClick={handleLogout}
                >
                    <LogOut size={26} strokeWidth={2.5} />
                    <span>Logout</span>
                </Button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen w-full bg-black flex relative">
            {/* Mobile Menu Button - BIGGER */}
            {isMobile && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed top-6 left-6 z-50 p-4 rounded-xl bg-[#0a0a0a] border-2 border-[rgba(255,193,7,0.3)] text-white lg:hidden shadow-lg"
                >
                    {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
                </motion.button>
            )}

            {/* Sidebar - Desktop - WIDER */}
            <aside className="hidden lg:flex lg:w-96 bg-[#0a0a0a] border-r border-[rgba(255,193,7,0.2)] flex-col">
                <SidebarContent />
            </aside>

            {/* Sidebar - Mobile - WIDER */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                        />

                        {/* Sidebar */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-96 bg-[#0a0a0a] border-r border-[rgba(255,193,7,0.2)] flex flex-col z-50 lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
