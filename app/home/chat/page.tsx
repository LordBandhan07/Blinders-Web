'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Image as ImageIcon, Paperclip, Hash, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface Message {
    id: string;
    content: string;
    sender: string;
    sender_name: string;
    timestamp: string;
    type: 'text' | 'voice' | 'image';
    media_url?: string;
}

export default function ChatPage() {
    const [activeChannel, setActiveChannel] = useState<'professional' | 'study' | 'admin'>('professional');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const channels = [
        { id: 'professional' as const, name: 'Professional Level', icon: Crown, color: 'from-purple-500 to-pink-500' },
        { id: 'study' as const, name: 'Study Circle', icon: Hash, color: 'from-blue-500 to-cyan-500' },
        { id: 'admin' as const, name: 'Admin Chat', icon: Crown, color: 'from-orange-500 to-red-500' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Temporary message for UI
        const tempMessage: Message = {
            id: Date.now().toString(),
            content: message,
            sender: 'current-user',
            sender_name: 'You',
            timestamp: new Date().toISOString(),
            type: 'text',
        };

        setMessages([...messages, tempMessage]);
        setMessage('');

        // TODO: Send to API
        toast.success('Message sent!');
    };

    const handleVoiceRecord = () => {
        toast('Voice recording feature coming soon!', { icon: '🎤' });
    };

    const handleImageUpload = () => {
        toast('Image upload feature coming soon!', { icon: '📷' });
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header with Channel Selector */}
            <div className="bg-[var(--secondary-bg)] border-b border-[var(--border)] p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex gap-2">
                        {channels.map((channel) => {
                            const Icon = channel.icon;
                            const isActive = activeChannel === channel.id;

                            return (
                                <motion.button
                                    key={channel.id}
                                    onClick={() => setActiveChannel(channel.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                                            ? `bg-gradient-to-r ${channel.color} text-white`
                                            : 'bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{channel.name}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-accent)] to-[var(--secondary-accent)] flex items-center justify-center mx-auto mb-4">
                                {channels.find(c => c.id === activeChannel)?.icon && (
                                    <Icon className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                                Welcome to {channels.find(c => c.id === activeChannel)?.name}
                            </h3>
                            <p className="text-[var(--foreground-secondary)]">
                                {activeChannel === 'admin'
                                    ? 'Direct communication with the Chief of Blinders'
                                    : 'Announcements and updates from the Chief'}
                            </p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {messages.map((msg, index) => {
                                const isOwnMessage = msg.sender === 'current-user';

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src="" />
                                            <AvatarFallback>
                                                {msg.sender_name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-md`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-[var(--foreground)]">
                                                    {msg.sender_name}
                                                </span>
                                                <span className="text-xs text-[var(--foreground-secondary)]">
                                                    {formatDate(msg.timestamp)}
                                                </span>
                                            </div>

                                            <div
                                                className={`glass px-4 py-2 rounded-2xl ${isOwnMessage
                                                        ? 'bg-gradient-to-r from-[var(--primary-accent)]/20 to-[var(--secondary-accent)]/20'
                                                        : 'bg-[var(--card-bg)]'
                                                    }`}
                                            >
                                                <p className="text-[var(--foreground)]">{msg.content}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="bg-[var(--secondary-bg)] border-t border-[var(--border)] p-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleVoiceRecord}
                                className="w-10 h-10 p-0"
                            >
                                <Mic size={20} />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleImageUpload}
                                className="w-10 h-10 p-0"
                            >
                                <ImageIcon size={20} />
                            </Button>
                        </div>

                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={
                                activeChannel === 'admin'
                                    ? 'Message the Chief...'
                                    : 'Only the Chief can send messages here'
                            }
                            disabled={activeChannel !== 'admin'}
                            className="flex-1"
                        />

                        <Button
                            type="submit"
                            disabled={!message.trim() || activeChannel !== 'admin'}
                            className="w-12 h-12 p-0"
                        >
                            <Send size={20} />
                        </Button>
                    </form>

                    {activeChannel !== 'admin' && (
                        <p className="text-xs text-[var(--foreground-secondary)] mt-2 text-center">
                            This is a read-only channel. Only the Chief can post announcements.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Icon component for empty state
function Icon({ className }: { className?: string }) {
    return <Crown className={className} />;
}
