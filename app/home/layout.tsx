'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Settings, Users, LogOut, Menu, X, Home, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import InstallPrompt from '@/app/components/InstallPrompt';

interface LayoutProps {
    children: React.ReactNode;
}

export default function HomeLayout({ children }: LayoutProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userProfile, setUserProfile] = useState<{ email: string; display_name: string; role: string; profile_photo_url?: string } | null>(null);

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

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                console.log('🔍 Fetching user profile...');
                const response = await fetch('/api/auth/user');
                console.log('📡 Response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('📦 Full response data:', data);
                    console.log('👤 User object:', data.user);

                    if (data.user) {
                        console.log('✅ Setting profile:', data.user.email, data.user.display_name);
                        setUserProfile({
                            email: data.user.email,
                            display_name: data.user.display_name,
                            role: data.user.role,
                            profile_photo_url: data.user.profile_photo_url
                        });
                    } else {
                        console.error('❌ No user object in response');
                    }
                } else {
                    // 401 is expected after passkey unlock, don't spam console
                    if (response.status !== 401) {
                        const errorData = await response.json();
                        console.error('❌ API error:', response.status, errorData);
                    }
                }
            } catch (error) {
                console.error('❌ Fetch error:', error);
            }
        };
        fetchUserProfile();
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
        { id: 'home', label: 'Home', icon: Home, href: '/home' },
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
            {/* LOGO - FAVICON PNG YELLOW */}
            <div className="p-8 border-b border-[rgba(255,193,7,0.2)] relative">
                {/* Close Button - Top Right */}
                {isMobile && (
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[rgba(255,193,7,0.1)] text-gray-400 hover:text-[#FFC107] transition-colors"
                    >
                        <X size={30} />
                    </button>
                )}

                <div className="flex flex-col items-center gap-5 text-center">
                    {/* FAVICON LOGO - PNG YELLOW */}
                    <div className="relative w-60 h-55" style={{ marginTop: '48px', marginBottom: '48px' }}>
                        <img
                            src="/favicon.ico"
                            alt="Blinders"
                            className="w-60 h-55"
                            style={{
                                filter: 'brightness(0) saturate(100%) invert(77%) sepia(85%) saturate(1352%) hue-rotate(359deg) brightness(102%) contrast(101%)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* USER PROFILE - BIGGER */}
            <div className="p-8 border-b border-[rgba(255,193,7,0.2)]">
                <div className="flex items-center gap-5" style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '10px', marginRight: '10px' }}>
                    <Avatar className="w-16 h-16 border-2 border-[#FFC107]">
                        {userProfile?.profile_photo_url ? (
                            <img
                                src={userProfile.profile_photo_url}
                                alt={userProfile.display_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <AvatarFallback className="bg-[#FFC107] text-black font-bold text-xl">
                                {userProfile?.display_name?.substring(0, 2).toUpperCase() || 'BA'}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-xl">
                            {userProfile?.display_name || 'Loading...'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {userProfile?.email || 'Loading...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* NAVIGATION - PRECISE SPACING */}
            <nav className="flex-1" style={{ padding: '20px 15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={`w-full flex items-center rounded-xl transition-all text-lg font-bold ${isActive
                                    ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/50'
                                    : 'text-gray-300 hover:bg-[rgba(255,193,7,0.1)] hover:text-white'
                                    }`}
                                style={{
                                    padding: '15px 20px',
                                    gap: '15px',
                                    height: '60px'
                                }}
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon size={26} strokeWidth={2.5} />
                                <span>{item.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </nav>

            {/* LOGOUT - PRECISE SPACING */}
            <div className="border-t border-[rgba(255,193,7,0.2)]" style={{ padding: '20px 15px' }}>
                <Button
                    variant="outline"
                    className="w-full justify-start text-lg font-bold border-2 border-[rgba(255,193,7,0.3)] hover:bg-[rgba(255,193,7,0.1)] hover:text-white hover:border-[#FFC107] text-gray-300"
                    onClick={handleLogout}
                    style={{
                        padding: '15px 20px',
                        gap: '15px',
                        height: '60px'
                    }}
                >
                    <LogOut size={26} strokeWidth={2.5} />
                    <span>Logout</span>
                </Button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen w-full bg-black flex relative">
            {/* Mobile Menu Button - BIGGER NO BORDER */}
            {isMobile && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed top-6 left-6 z-50 p-5 rounded-xl bg-[#0a0a0a] text-white lg:hidden shadow-lg"
                >
                    {isSidebarOpen ? <X size={32} /> : <Menu size={32} />}
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

            {/* PWA Install Prompt */}
            <InstallPrompt />
        </div>
    );
}
