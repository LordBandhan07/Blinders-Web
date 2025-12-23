'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Crown, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Member {
    id: string;
    blinders_id: string;
    display_name: string;
    role: 'admin' | 'member';
    is_online: boolean;
    avatar_url?: string;
}

export default function MembersPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data - will be replaced with real data from Supabase
    const members: Member[] = [
        {
            id: '1',
            blinders_id: 'BLND-001',
            display_name: 'Chief of Blinders',
            role: 'admin',
            is_online: true,
        },
        {
            id: '2',
            blinders_id: 'BLND-002',
            display_name: 'Agent Shadow',
            role: 'member',
            is_online: true,
        },
        {
            id: '3',
            blinders_id: 'BLND-003',
            display_name: 'Agent Phoenix',
            role: 'member',
            is_online: false,
        },
    ];

    const filteredMembers = members.filter(
        (member) =>
            member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.blinders_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
                        Blinders Members
                    </h1>
                    <p className="text-[var(--foreground-secondary)]">
                        All authorized agents in the organization
                    </p>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]" size={20} />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search members..."
                            className="pl-10"
                        />
                    </div>
                </motion.div>

                {/* Members List */}
                <div className="space-y-3">
                    {filteredMembers.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:border-[var(--primary-accent)] transition-all cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="w-14 h-14">
                                                <AvatarImage src={member.avatar_url} />
                                                <AvatarFallback>
                                                    {member.display_name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div
                                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--secondary-bg)] ${member.is_online ? 'bg-[var(--success)]' : 'bg-gray-500'
                                                    }`}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-[var(--foreground)]">
                                                    {member.display_name}
                                                </h3>
                                                {member.role === 'admin' && (
                                                    <Crown className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-[var(--foreground-secondary)]">
                                                {member.blinders_id}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Circle
                                                className={`w-2 h-2 ${member.is_online ? 'fill-[var(--success)] text-[var(--success)]' : 'fill-gray-500 text-gray-500'
                                                    }`}
                                            />
                                            <span className="text-sm text-[var(--foreground-secondary)]">
                                                {member.is_online ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredMembers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <p className="text-[var(--foreground-secondary)]">No members found</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
