'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    id: string;
    display_name: string;
    email: string;
    profile_photo_url?: string;
    is_online: boolean;
    role: string;
}

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender_name?: string;
    sender_photo?: string;
}

export default function SingleChatPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch all users
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch messages when user selected
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
        }
    }, [selectedUser]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/members');
            const data = await response.json();

            if (response.ok) {
                setUsers(data.members || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const response = await fetch(`/api/dm/route?recipientId=${userId}`);
            const data = await response.json();

            if (response.ok) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const response = await fetch('/api/dm/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: selectedUser.id,
                    content: newMessage.trim()
                })
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages(selectedUser.id);
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Connection error');
        }
    };

    const filteredUsers = users.filter(user =>
        user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen flex bg-black">
            {/* User List - Left Column */}
            <div className="w-80 border-r border-[rgba(255,193,7,0.2)] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-[rgba(255,193,7,0.2)]">
                    <h2 className="text-xl font-bold text-white mb-3">Single Chat</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-[rgba(255,193,7,0.05)] border-[rgba(255,193,7,0.3)] text-white"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400">Loading...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">No users found</div>
                    ) : (
                        filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`p-4 cursor-pointer border-b border-[rgba(255,193,7,0.1)] hover:bg-[rgba(255,193,7,0.05)] ${selectedUser?.id === user.id ? 'bg-[rgba(255,193,7,0.1)]' : ''
                                    }`}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="w-12 h-12 border-2 border-[#FFC107]">
                                            {user.profile_photo_url ? (
                                                <img src={user.profile_photo_url} alt={user.display_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <AvatarFallback className="bg-[#FFC107] text-black font-bold">
                                                    {user.display_name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        {user.is_online && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold">{user.display_name}</h3>
                                        <p className="text-gray-400 text-sm">{user.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Conversation - Right Column */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-[rgba(255,193,7,0.2)] flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-[#FFC107]">
                                {selectedUser.profile_photo_url ? (
                                    <img src={selectedUser.profile_photo_url} alt={selectedUser.display_name} className="w-full h-full object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-[#FFC107] text-black font-bold">
                                        {selectedUser.display_name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <h3 className="text-white font-bold">{selectedUser.display_name}</h3>
                                <p className="text-gray-400 text-sm">{selectedUser.is_online ? 'Online' : 'Offline'}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-400 mt-10">
                                    <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className="flex gap-3">
                                        <div className="flex-1">
                                            <div className="bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] rounded-lg p-3">
                                                <p className="text-white">{msg.content}</p>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    {new Date(msg.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-[rgba(255,193,7,0.2)]">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 bg-[rgba(255,193,7,0.05)] border-[rgba(255,193,7,0.3)] text-white"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="bg-[#FFC107] hover:bg-[#FFD54F] text-black"
                                >
                                    <Send size={20} />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-xl">Select a user to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
