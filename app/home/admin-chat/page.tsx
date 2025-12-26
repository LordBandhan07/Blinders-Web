'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Search, Mic, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface User {
    id: string;
    email: string;
    display_name: string;
    role: string;
    is_online: boolean;
    avatar_url?: string;
}

interface DirectMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    type: 'text' | 'voice' | 'image';
    media_url?: string;
    is_read: boolean;
    created_at: string;
}

export default function AdminChatPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('/api/auth/user');
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUserId(data.user.id);
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .neq('role', 'admin') // Exclude admin from list
                    .order('display_name');

                if (error) throw error;
                setUsers(data || []);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Fetch messages when user is selected
    useEffect(() => {
        if (!selectedUser || !currentUserId) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(
                    `/api/dm?userId=${currentUserId}&otherUserId=${selectedUser.id}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages || []);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`dm-${selectedUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUserId}))`,
                },
                (payload) => {
                    setMessages((current) => [...current, payload.new as DirectMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedUser, currentUserId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || !currentUserId) return;

        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            const response = await fetch('/api/dm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: currentUserId,
                    receiver_id: selectedUser.id,
                    content: messageContent,
                    type: 'text',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            toast.success('Message sent!', {
                style: {
                    background: '#000000',
                    color: '#FFC107',
                    border: '1px solid #FFC107',
                },
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setNewMessage(messageContent);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-black">
                <div className="text-[#FFC107] text-xl">Loading...</div>
            </div>
        );
    }

    // User Selection View
    if (!selectedUser) {
        return (
            <div className="h-full bg-black" style={{ padding: '30px' }}>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div style={{ marginBottom: '30px' }}>
                        <h1 className="text-4xl font-bold text-white" style={{ marginBottom: '10px' }}>
                            Admin Chat
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Select a user to start messaging
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative" style={{ marginBottom: '30px' }}>
                        <Search
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0a0a0a] border-[rgba(255,193,7,0.2)] text-white rounded-xl text-lg"
                            style={{ paddingLeft: '50px', height: '55px' }}
                        />
                    </div>

                    {/* User Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '20px' }}>
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    onClick={() => setSelectedUser(user)}
                                    className="bg-[#0a0a0a] border-[rgba(255,193,7,0.2)] hover:border-[#FFC107] cursor-pointer transition-all"
                                    style={{ padding: '20px' }}
                                >
                                    <div className="flex items-center" style={{ gap: '15px' }}>
                                        <Avatar className="w-14 h-14 border-2 border-[#FFC107]">
                                            <AvatarFallback className="bg-[#FFC107] text-black font-bold text-lg">
                                                {user.display_name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-lg">
                                                {user.display_name}
                                            </h3>
                                            <p className="text-gray-400 text-sm">{user.email}</p>
                                        </div>
                                        <div
                                            className={`w-3 h-3 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-500'
                                                }`}
                                        />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Chat View
    return (
        <div className="absolute inset-0 flex flex-col bg-black">
            {/* Chat Header */}
            <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-[rgba(255,193,7,0.2)]" style={{ padding: '15px 20px' }}>
                <div className="max-w-4xl mx-auto flex items-center" style={{ gap: '15px' }}>
                    <Button
                        variant="ghost"
                        onClick={() => setSelectedUser(null)}
                        className="text-[#FFC107] hover:bg-[rgba(255,193,7,0.1)]"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <Avatar className="w-12 h-12 border-2 border-[#FFC107]">
                        <AvatarFallback className="bg-[#FFC107] text-black font-bold">
                            {selectedUser.display_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h2 className="text-white font-bold text-xl">{selectedUser.display_name}</h2>
                        <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                    </div>
                    <div
                        className={`w-3 h-3 rounded-full ${selectedUser.is_online ? 'bg-green-500' : 'bg-gray-500'
                            }`}
                    />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
                <div className="max-w-4xl mx-auto">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500" style={{ paddingTop: '60px' }}>
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.map((msg) => {
                                const isOwnMessage = msg.sender_id === currentUserId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`rounded-2xl max-w-md ${isOwnMessage
                                                    ? 'bg-[rgba(255,193,7,0.2)] border border-[rgba(255,193,7,0.3)]'
                                                    : 'bg-[#0a0a0a] border border-[rgba(255,193,7,0.2)]'
                                                }`}
                                            style={{ padding: '12px 16px' }}
                                        >
                                            <p className="text-white text-base">{msg.content}</p>
                                            <p className="text-xs text-gray-500" style={{ marginTop: '4px' }}>
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 bg-[#0a0a0a] border-t border-[rgba(255,193,7,0.2)]" style={{ padding: '15px 20px' }}>
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex" style={{ gap: '10px' }}>
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-[rgba(255,193,7,0.1)] border-[rgba(255,193,7,0.2)] text-white rounded-xl text-lg"
                            style={{ height: '55px', padding: '0 20px' }}
                        />
                        <Button
                            type="submit"
                            className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold rounded-xl"
                            style={{ width: '55px', height: '55px', padding: '0' }}
                            disabled={!newMessage.trim()}
                        >
                            <Send size={22} />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
