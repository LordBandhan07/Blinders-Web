'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Crown, Shield, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Member {
    id: string;
    email: string;
    display_name: string;
    role: string;
    is_online: boolean;
    profile_photo_url?: string;
}

export default function MembersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    // Fetch members and current user
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [membersResponse, userResponse] = await Promise.all([
                    supabase.from('profiles').select('*').order('display_name'),
                    supabase.auth.getUser()
                ]);

                if (membersResponse.error) throw membersResponse.error;
                setMembers(membersResponse.data || []);

                if (userResponse.data.user) {
                    setCurrentUserId(userResponse.data.user.id);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Subscribe to real-time updates and Presence
    useEffect(() => {
        if (!currentUserId) return;

        const channel = supabase.channel('global_presence')
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const onlineIds = new Set<string>();

                Object.values(newState).forEach((presences: any) => {
                    presences.forEach((presence: any) => {
                        if (presence.user_id) onlineIds.add(presence.user_id);
                    });
                });

                setOnlineUsers(onlineIds);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: currentUserId,
                        online_at: new Date().toISOString()
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    // Role hierarchy...
    const roleOrder: Record<string, number> = {
        'admin': 1,
        'president': 2,
        'chief_member': 3,
        'senior_member': 4,
    };

    const filteredMembers = members
        .map(m => ({
            ...m,
            is_online: (currentUserId && m.id === currentUserId) || onlineUsers.has(m.id)
        }))
        .filter(
            (member) =>
                member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            // Sort by online status first (optional, maybe keep role based?)
            // Keeping Role based sorting as primary
            const roleA = roleOrder[a.role] || 999;
            const roleB = roleOrder[b.role] || 999;

            if (roleA !== roleB) {
                return roleA - roleB;
            }

            return a.display_name.localeCompare(b.display_name);
        });

    const onlineCount = filteredMembers.filter(m => m.is_online).length;
    const totalCount = members.length;

    return (
        <div className="h-full overflow-y-auto bg-black" style={{ padding: '20px' }}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '25px' }}
                >
                    <h1
                        className="text-4xl font-bold text-white text-center"
                        style={{ marginBottom: '10px' }}
                    >
                        Blinders Members
                    </h1>
                    <div className="flex items-center" style={{ gap: '15px' }}>
                        <p className="text-gray-400 text-lg">
                            All authorized agents in the organization
                        </p>
                        <div
                            className="flex items-center bg-[rgba(255,193,7,0.1)] rounded-xl text-[#FFC107] font-semibold"
                            style={{ padding: '8px 15px', gap: '8px' }}
                        >
                            <div className="w-2 h-2 rounded-full bg-[#FFC107] animate-pulse" />
                            <span>{onlineCount}/{totalCount} Online</span>
                        </div>
                    </div>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ marginBottom: '25px' }}
                >
                    <div className="relative">
                        <Search
                            className="absolute text-gray-500"
                            size={20}
                            style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search members by name or email..."
                            className="bg-[#0a0a0a] border-[rgba(255,193,7,0.2)] text-white placeholder:text-gray-500 focus:border-[#FFC107] rounded-xl"
                            style={{ paddingLeft: '45px', height: '50px' }}
                        />
                    </div>
                </motion.div>

                {/* Members Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                    {filteredMembers.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="bg-[#0a0a0a] border-[rgba(255,193,7,0.2)] hover:border-[#FFC107] transition-all cursor-pointer group">
                                <div style={{ padding: '20px' }}>
                                    <div className="flex items-center" style={{ gap: '20px' }}>
                                        {/* Avatar with Status */}
                                        <div className="relative flex-shrink-0">
                                            <Avatar
                                                className="border-2 border-[rgba(255,193,7,0.3)] group-hover:border-[#FFC107] transition-all"
                                                style={{ width: '70px', height: '70px' }}
                                            >
                                                {member.profile_photo_url ? (
                                                    <img
                                                        src={member.profile_photo_url}
                                                        alt={member.display_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <AvatarFallback className="bg-[rgba(255,193,7,0.1)] text-[#FFC107] text-2xl font-bold">
                                                        {member.display_name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            {/* Online Status Indicator */}
                                            <div
                                                className={`absolute rounded-full border-2 border-[#0a0a0a] ${member.is_online ? 'bg-[#FFC107]' : 'bg-gray-600'
                                                    }`}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    bottom: '2px',
                                                    right: '2px'
                                                }}
                                            />
                                        </div>

                                        {/* Member Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center" style={{ gap: '8px', marginBottom: '6px' }}>
                                                <h3 className="font-bold text-white text-lg truncate">
                                                    {member.display_name}
                                                </h3>
                                                {member.role === 'admin' && (
                                                    <Crown className="text-[#FFC107]" size={18} />
                                                )}
                                            </div>

                                            <div
                                                className="flex items-center text-sm text-gray-400 truncate"
                                                style={{ gap: '6px', marginBottom: '10px' }}
                                            >
                                                <Mail size={14} className="flex-shrink-0" />
                                                <span className="truncate">{member.email}</span>
                                            </div>

                                            {/* Role Badge */}
                                            <div className="flex items-center">
                                                <div
                                                    className={`flex items-center rounded-lg font-semibold text-xs ${member.role === 'admin'
                                                        ? 'bg-[#FFC107] text-black'
                                                        : 'bg-[rgba(255,193,7,0.1)] text-[#FFC107] border border-[rgba(255,193,7,0.3)]'
                                                        }`}
                                                    style={{ padding: '6px 12px', gap: '6px' }}
                                                >
                                                    {member.role === 'admin' ? <Crown size={12} /> : <Shield size={12} />}
                                                    <span>{member.role === 'admin' ? 'Administrator' : 'Agent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* No Results */}
                {filteredMembers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                        style={{ paddingTop: '60px', paddingBottom: '60px' }}
                    >
                        <div
                            className="rounded-full bg-[rgba(255,193,7,0.1)] flex items-center justify-center mx-auto"
                            style={{ width: '80px', height: '80px', marginBottom: '20px' }}
                        >
                            <Search className="text-[#FFC107]" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white" style={{ marginBottom: '8px' }}>
                            No members found
                        </h3>
                        <p className="text-gray-400">
                            Try adjusting your search query
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
