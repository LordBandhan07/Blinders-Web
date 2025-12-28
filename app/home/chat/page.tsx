'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Image as ImageIcon, Hash, Crown, Shield, ChevronDown, Megaphone, ArrowLeft, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import EmojiPicker from '@/app/components/EmojiPicker';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface Message {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_photo_url?: string;
    content: string;
    timestamp: string;
    type?: 'text' | 'voice' | 'image' | 'video';
    media_url?: string;
    media_type?: string;
    created_at: string;
    reply_to?: string | null;
    reactions?: Reaction[];
}

interface Reaction {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
    profiles?: {
        display_name: string;
        profile_photo_url?: string;
    };
}

interface UserProfile {
    id: string;
    email: string;
    display_name: string;
    role: string;
    is_online: boolean;
    profile_photo_url?: string;
}

// Message Item Component (to handle swipe state properly)
interface MessageItemProps {
    msg: Message;
    index: number;
    currentUser: UserProfile | null;
    setReplyingTo: (msg: Message | null) => void;
    formatTime: (timestamp: string) => string;
    handleEmojiSelect: (emoji: string) => void;
    handleLongPressStart: (e: React.TouchEvent | React.MouseEvent, messageId: string) => void;
    handleLongPressEnd: () => void;
}

function MessageItem({ msg, index, currentUser, setReplyingTo, formatTime, handleEmojiSelect, handleLongPressStart, handleLongPressEnd }: MessageItemProps) {
    const [swipeX, setSwipeX] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const isOwnMessage = currentUser && msg.sender_id === currentUser.id;

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const currentTouch = e.touches[0].clientX;
        const diff = currentTouch - touchStart;

        // Only allow right swipe (positive diff) and limit to 80px
        if (diff > 0 && diff < 80) {
            setSwipeX(diff);
        }
    };

    const handleTouchEnd = () => {
        if (swipeX > 50) {
            // Trigger reply
            setReplyingTo(msg);
        }
        setSwipeX(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, x: swipeX }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} relative`}
            style={{ gap: '12px' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Reply Icon (shows on swipe) */}
            {swipeX > 20 && (
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[#FFC107]"
                    style={{ opacity: Math.min(swipeX / 50, 1) }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                    </svg>
                </div>
            )}

            <Avatar
                className={`flex-shrink-0 ${isOwnMessage ? 'bg-[#FFC107]' : 'bg-[rgba(255,193,7,0.2)]'} border-2 ${isOwnMessage ? 'border-[#FFC107]' : 'border-[rgba(255,193,7,0.3)]'}`}
                style={{ width: '45px', height: '45px' }}
            >
                {msg.sender_photo_url ? (
                    <img
                        src={msg.sender_photo_url}
                        alt={msg.sender_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <AvatarFallback className={isOwnMessage ? 'bg-[#FFC107] text-black' : 'bg-[rgba(255,193,7,0.2)] text-[#FFC107]'}>
                        {msg.sender_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                )}
            </Avatar>

            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-md`}>
                <div className="flex items-center" style={{ gap: '8px', marginBottom: '6px' }}>
                    <span className="text-sm font-semibold text-white">
                        {msg.sender_name}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatTime(msg.created_at)}
                    </span>
                </div>

                <div
                    className={`rounded-2xl ${isOwnMessage
                        ? 'bg-[rgba(255,193,7,0.2)] border border-[rgba(255,193,7,0.3)]'
                        : 'bg-[#0a0a0a] border border-[rgba(255,193,7,0.2)]'
                        }`}
                    style={{ padding: '12px 16px' }}
                >
                    <p className="text-white text-base">{msg.content}</p>

                    {/* Display Image */}
                    {msg.type === 'image' && msg.media_url && (
                        <img
                            src={msg.media_url}
                            alt="Uploaded image"
                            className="rounded-lg w-full sm:w-auto"
                            style={{
                                maxWidth: '300px',
                                maxHeight: '300px',
                                marginTop: '8px',
                                cursor: 'pointer'
                            }}
                            onClick={() => window.open(msg.media_url, '_blank')}
                        />
                    )}

                    {/* Display Video */}
                    {msg.type === 'video' && msg.media_url && (
                        <video
                            controls
                            className="rounded-lg"
                            style={{
                                maxWidth: '400px',
                                maxHeight: '300px',
                                marginTop: '8px'
                            }}
                        >
                            <source src={msg.media_url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}

                    {/* Display Voice Message */}
                    {msg.type === 'voice' && msg.media_url && (
                        <audio
                            controls
                            className="rounded-lg"
                            style={{
                                maxWidth: '300px',
                                marginTop: '8px'
                            }}
                        >
                            <source src={msg.media_url} type="audio/webm" />
                            Your browser does not support the audio tag.
                        </audio>
                    )}

                    {/* Reactions Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(
                                msg.reactions.reduce((acc, reaction) => {
                                    if (!acc[reaction.emoji]) {
                                        acc[reaction.emoji] = [];
                                    }
                                    acc[reaction.emoji].push(reaction);
                                    return acc;
                                }, {} as Record<string, Reaction[]>)
                            ).map(([emoji, reactions]) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleEmojiSelect(emoji)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] hover:bg-[rgba(255,193,7,0.2)] transition-colors relative group"
                                    title={reactions.map(r => r.profiles?.display_name || 'Unknown').join(', ')}
                                >
                                    <span className="text-sm">{emoji}</span>
                                    <span className="text-xs text-[#FFC107] font-semibold">{reactions.length}</span>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black border border-[#FFC107] rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap z-50">
                                        {reactions.map(r => r.profiles?.display_name || 'Unknown').join(', ')}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function ChatPage() {
    const [activeChannel, setActiveChannel] = useState<'announcements' | 'professional' | 'study' | 'dm'>('announcements');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' | 'voice' } | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    // Admin DM states
    const [dmUsers, setDmUsers] = useState<UserProfile[]>([]);
    const [selectedDmUser, setSelectedDmUser] = useState<UserProfile | null>(null);
    const [dmMessages, setDmMessages] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [sendingUsers, setSendingUsers] = useState<string[]>([]);

    // Emoji picker states
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState({ x: 0, y: 0 });
    const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = currentUser?.role === 'admin';

    // Admin channels
    const adminChannels = [
        { id: 'announcements' as const, name: 'Chief Announcements', icon: Megaphone, canSend: true },
        { id: 'professional' as const, name: 'Professional Level', icon: Shield, canSend: true },
        { id: 'study' as const, name: 'Study Circle', icon: Hash, canSend: true },
        { id: 'dm' as const, name: 'Single Chat', icon: MessageCircle, canSend: true },
    ];

    // Regular user channels
    const userChannels = [
        { id: 'announcements' as const, name: 'Chief Announcements', icon: Megaphone, canSend: false },
        { id: 'professional' as const, name: 'Professional Level', icon: Shield, canSend: true },
        { id: 'study' as const, name: 'Study Circle', icon: Hash, canSend: true },
        { id: 'dm' as const, name: 'Single Chat', icon: MessageCircle, canSend: true },
    ];

    const channels = isAdmin ? adminChannels : userChannels;
    const currentChannel = channels.find(c => c.id === activeChannel);

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/user');
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data.user);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Fetch users for DM when Single Chat channel is selected
    useEffect(() => {
        if (activeChannel === 'dm' && currentUser) {
            const fetchUsers = async () => {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .neq('id', currentUser?.id) // Exclude current user
                        .order('display_name');

                    if (error) throw error;

                    console.log('DM Users fetched:', data?.length, 'users');
                    setDmUsers(data || []);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };
            fetchUsers();
        } else {
            setDmUsers([]);
            setSelectedDmUser(null);
        }
    }, [activeChannel, currentUser?.id]);

    // Fetch messages for active channel
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // For DM channel, fetch messages with selected user
                if (activeChannel === 'dm') {
                    if (!currentUser || !selectedDmUser) return;

                    const response = await fetch(
                        `/api/dm?userId=${currentUser.id}&otherUserId=${selectedDmUser.id}`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        setDmMessages(data.messages || []);
                    }

                    setMessages([]); // Clear regular messages
                } else {
                    // Regular channel messages with sender profile photos
                    const { data, error } = await supabase
                        .from('messages')
                        .select(`
                            *,
                            profiles!messages_sender_id_fkey (
                                profile_photo_url
                            )
                        `)
                        .eq('channel', activeChannel)
                        .order('created_at', { ascending: true });

                    if (error) throw error;

                    // Map the data to include sender_photo_url
                    const messagesWithPhotos = (data || []).map((msg: any) => ({
                        ...msg,
                        sender_photo_url: msg.profiles?.profile_photo_url
                    }));

                    setMessages(messagesWithPhotos);
                    setDmMessages([]); // Clear DM messages
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                toast.error('Failed to load messages', {
                    style: {
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #FFC107',
                    },
                });
            }
        };

        fetchMessages();

        // Fetch reactions for messages
        const fetchReactions = async () => {
            const isDm = activeChannel === 'dm';
            const targetMessages = isDm ? dmMessages : messages;

            if (!targetMessages.length) return;

            try {
                const messageIds = targetMessages.map(m => m.id);
                const tableName = isDm ? 'dm_reactions' : 'message_reactions';

                // Fetch reactions for all messages
                const { data: reactions } = await supabase
                    .from(tableName)
                    .select(`
                        *,
                        profiles:user_id (
                            display_name,
                            profile_photo_url
                        )
                    `)
                    .in('message_id', messageIds);

                if (reactions) {
                    // Group reactions by message
                    const updatedMessages = targetMessages.map(msg => ({
                        ...msg,
                        reactions: reactions.filter(r => r.message_id === msg.id)
                    }));

                    if (isDm) {
                        setDmMessages(updatedMessages);
                    } else {
                        setMessages(updatedMessages);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch reactions:', error);
            }
        };

        if (messages.length > 0 || dmMessages.length > 0) {
            fetchReactions();
        }
    }, [activeChannel, selectedDmUser?.id, messages.length, dmMessages.length]);

    // Realtime subscription for DM messages
    useEffect(() => {
        if (activeChannel !== 'dm' || !selectedDmUser || !currentUser) return;

        console.log('🔔 Setting up DM realtime subscription');

        const channel = supabase
            .channel(`dm:${currentUser.id}:${selectedDmUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                },
                (payload) => {
                    const newMsg = payload.new as any;
                    // Check if message belongs to current conversation
                    if (
                        (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedDmUser.id) ||
                        (newMsg.sender_id === selectedDmUser.id && newMsg.receiver_id === currentUser.id)
                    ) {
                        console.log('📨 New DM received:', newMsg);
                        setDmMessages((current) => {
                            // Prevent duplicates
                            if (current.some(msg => msg.id === newMsg.id)) return current;
                            return [...current, newMsg];
                        });
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 DM subscription status:', status);
            });

        return () => {
            console.log('🔕 Unsubscribing from DM');
            supabase.removeChannel(channel);
        };
    }, [activeChannel, selectedDmUser?.id, currentUser?.id]);

    // Subscribe to real-time messages
    useEffect(() => {
        if (!activeChannel || activeChannel === 'dm') {
            console.log('⏭️ Skipping realtime for admin channel');
            return;
        }

        console.log('🔔 Setting up realtime subscription for:', activeChannel);

        const channel = supabase
            .channel(`messages:${activeChannel}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `channel=eq.${activeChannel}`,
                },
                async (payload) => {
                    console.log('📨 New message received:', payload.new);
                    const newMessage = payload.new as Message;

                    try {
                        // Fetch sender's profile photo in realtime
                        const { data: profile, error } = await supabase
                            .from('profiles')
                            .select('profile_photo_url')
                            .eq('id', newMessage.sender_id)
                            .single();

                        if (error) console.error('Profile fetch error:', error);

                        // Add profile photo to message
                        const messageWithPhoto = {
                            ...newMessage,
                            sender_photo_url: profile?.profile_photo_url || null
                        };

                        console.log('✅ Adding message to state:', messageWithPhoto);
                        setMessages((current) => [...current, messageWithPhoto]);
                    } catch (err) {
                        console.error('Error processing message:', err);
                        setMessages((current) => [...current, newMessage]);
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 Subscription status:', status);
            });

        return () => {
            console.log('🔕 Unsubscribing from:', activeChannel);
            supabase.removeChannel(channel);
        };
    }, [activeChannel]);

    // Typing indicator with Supabase Presence
    useEffect(() => {
        if (!activeChannel || activeChannel === 'dm' || !currentUser) return;

        const typingChannel = supabase.channel(`typing:${activeChannel}`, {
            config: {
                presence: {
                    key: currentUser.id,
                },
            },
        });

        // Subscribe to presence changes
        typingChannel
            .on('presence', { event: 'sync' }, () => {
                const state = typingChannel.presenceState();
                const typingUserIds = Object.keys(state)
                    .filter(id => id !== currentUser.id)
                    .map(id => {
                        const presenceData = state[id][0] as any;
                        return presenceData?.display_name;
                    })
                    .filter(Boolean);

                setTypingUsers(typingUserIds);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Typing presence subscribed');
                }
            });

        return () => {
            supabase.removeChannel(typingChannel);
        };
    }, [activeChannel, currentUser]);

    // Handle typing events
    const handleTyping = () => {
        if (!activeChannel || activeChannel === 'dm' || !currentUser) return;

        const typingChannel = supabase.channel(`typing:${activeChannel}`);

        // Track typing
        typingChannel.track({
            user_id: currentUser.id,
            display_name: currentUser.display_name,
            typing: true,
        });

        // Clear typing after 3 seconds
        setTimeout(() => {
            typingChannel.untrack();
        }, 3000);
    };

    // Clear typing immediately (when sending message)
    const clearTyping = () => {
        if (!activeChannel || activeChannel === 'dm' || !currentUser) return;

        const typingChannel = supabase.channel(`typing:${activeChannel}`);
        typingChannel.untrack();
    };

    // Sending indicator with Supabase Presence
    useEffect(() => {
        if (!activeChannel || activeChannel === 'dm' || !currentUser) return;

        const sendingChannel = supabase.channel(`sending:${activeChannel}`, {
            config: {
                presence: {
                    key: currentUser.id,
                },
            },
        });

        // Subscribe to sending presence changes
        sendingChannel
            .on('presence', { event: 'sync' }, () => {
                const state = sendingChannel.presenceState();
                const sendingUserNames = Object.keys(state)
                    .filter(id => id !== currentUser.id)
                    .map(id => {
                        const presenceData = state[id][0] as any;
                        return presenceData?.display_name;
                    })
                    .filter(Boolean);

                setSendingUsers(sendingUserNames);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Sending presence subscribed');
                }
            });

        return () => {
            supabase.removeChannel(sendingChannel);
        };
    }, [activeChannel, currentUser]);

    // Handle sending events
    const broadcastSending = (isSending: boolean) => {
        if (!activeChannel || activeChannel === 'dm' || !currentUser) return;

        const sendingChannel = supabase.channel(`sending:${activeChannel}`);

        if (isSending) {
            // Track sending
            sendingChannel.track({
                user_id: currentUser.id,
                display_name: currentUser.display_name,
                sending: true,
            });
        } else {
            // Stop tracking
            sendingChannel.untrack();
        }
    };

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!message.trim() && !mediaPreview) || !currentUser || !currentChannel?.canSend) return;

        const messageContent = message.trim() || (mediaPreview?.type === 'image' ? '📷 Image' : '🎤 Voice');
        const messageType = mediaPreview?.type || 'text';
        const mediaUrl = mediaPreview?.url;
        const replyToId = replyingTo?.id;

        // Clear typing indicator first, then show sending indicator
        clearTyping(); // Remove "User is typing..."
        setIsSendingMessage(true); // Start sending indicator
        broadcastSending(true); // Broadcast "User's message is coming..."
        setMessage(''); // Clear input immediately
        setMediaPreview(null); // Clear preview
        setReplyingTo(null); // Clear reply

        try {
            // For DM channel, send to selected user
            if (activeChannel === 'dm') {
                if (!selectedDmUser) {
                    throw new Error('No user selected');
                }

                const response = await fetch('/api/dm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender_id: currentUser.id,
                        receiver_id: selectedDmUser.id,
                        content: messageContent,
                        type: messageType,
                        media_url: mediaUrl,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('DM send failed:', response.status, errorData);
                    throw new Error(errorData.error || 'Failed to send message');
                }

                // Fetch updated messages
                const refreshResponse = await fetch(
                    `/api/dm?userId=${currentUser.id}&otherUserId=${selectedDmUser.id}`
                );
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setDmMessages(data.messages || []);
                }
            } else {
                // Regular channel message
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channel: activeChannel,
                        content: messageContent,
                        sender_id: currentUser.id,
                        sender_name: currentUser.display_name,
                        type: messageType,
                        media_url: mediaUrl,
                        reply_to: replyToId,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to send message');
                }
            }

            toast.success('Message sent!', {
                style: {
                    background: '#000000',
                    color: '#FFC107',
                    border: '1px solid #FFC107',
                },
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
            setMessage(messageContent); // Restore message on error
            if (mediaUrl) {
                setMediaPreview({ url: mediaUrl, type: messageType as 'image' | 'video' | 'voice' });
            }
        } finally {
            setIsSendingMessage(false); // Stop sending indicator
            broadcastSending(false); // Stop broadcasting
        }
    };

    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleVoiceRecord = async () => {
        if (!currentChannel?.canSend) {
            toast.error('You cannot send voice messages here');
            return;
        }

        // Check if environment supports recording
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error('Microphone not supported in this browser or context (requires HTTPS)', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
            return;
        }

        if (isRecording) {
            // Stop recording
            mediaRecorder?.stop();
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                // Check supported MIME types
                const mimeType = [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/mp4',
                    'audio/ogg;codecs=opus',
                    ''
                ].find(type => MediaRecorder.isTypeSupported(type));

                const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

                audioChunksRef.current = [];

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                recorder.onstop = async () => {
                    const type = mimeType || 'audio/webm';
                    const audioBlob = new Blob(audioChunksRef.current, { type });
                    stream.getTracks().forEach(track => track.stop());

                    if (audioBlob.size === 0) {
                        toast.error('Recording failed: No audio data captured');
                        return;
                    }

                    // Upload audio
                    await uploadVoiceMessage(audioBlob);
                };

                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);

                toast('Recording...', {
                    icon: '🎤',
                    style: {
                        background: '#000000',
                        color: '#FFC107',
                        border: '1px solid #FFC107',
                    },
                });
            } catch (error: any) {
                console.error('Microphone access error:', error);
                let errorMessage = 'Could not access microphone';

                if (error.name === 'NotAllowedError') {
                    errorMessage = 'Microphone permission denied';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'No microphone found';
                }

                toast.error(errorMessage, {
                    style: {
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #FFC107',
                    },
                });
            }
        }
    };

    const uploadVoiceMessage = async (audioBlob: Blob) => {
        if (!currentUser) return;

        setIsUploading(true);

        try {
            // Create file from blob
            const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', currentUser.id);
            formData.append('type', 'voice');

            // Upload file
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            const { url } = await uploadResponse.json();

            // Set preview instead of auto-sending
            setMediaPreview({ url, type: 'voice' });

            toast.success('Voice recorded! Add a caption and send.', {
                style: {
                    background: '#000000',
                    color: '#FFC107',
                    border: '1px solid #FFC107',
                },
            });
        } catch (error) {
            console.error('Voice upload error:', error);
            toast.error('Failed to upload voice message', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUpload = () => {
        if (!currentChannel?.canSend || isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        // Validate file type
        const isImage = file.type.startsWith('image/');

        if (!isImage) {
            toast.error('Please select an image file', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
            return;
        }

        // Validate file size (10MB for images)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            toast.error(`File too large. Maximum size is ${maxSizeMB}MB`, {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', currentUser.id);
            formData.append('type', 'image');

            // Upload file
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            const { url, type } = await uploadResponse.json();

            // Set preview instead of auto-sending
            setMediaPreview({ url, type });

            toast.success('Image uploaded! Add a caption and send.', {
                style: {
                    background: '#000000',
                    color: '#FFC107',
                    border: '1px solid #FFC107',
                },
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Long press handlers for emoji reactions
    const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent, messageId: string) => {
        const timer = setTimeout(() => {
            const touch = 'touches' in e ? e.touches[0] : e as React.MouseEvent;
            setEmojiPickerPosition({ x: touch.clientX, y: touch.clientY });
            setSelectedMessageForReaction(messageId);
            setShowEmojiPicker(true);
        }, 500); // 500ms hold

        setLongPressTimer(timer);
    };

    const handleLongPressEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const handleEmojiSelect = async (emoji: string) => {
        if (!selectedMessageForReaction) return;

        try {
            const apiUrl = activeChannel === 'dm' ? '/api/dm/reactions' : '/api/reactions';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageId: selectedMessageForReaction,
                    emoji,
                    action: 'add',
                }),
            });

            if (response.ok) {
                toast.success(`Reacted with ${emoji}`, {
                    style: {
                        background: '#000000',
                        color: '#FFC107',
                        border: '1px solid #FFC107',
                    },
                });
            }
        } catch (error) {
            console.error('Failed to add reaction:', error);
            toast.error('Failed to add reaction');
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const handleChannelSelect = (channelId: 'announcements' | 'professional' | 'study' | 'dm') => {
        setActiveChannel(channelId);
        setIsDropdownOpen(false);
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-black">
                <div className="text-[#FFC107] text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 flex flex-col bg-black">
            {/* Header with Channel Selector - FIXED */}
            <div className="flex-shrink-0 bg-[#0a0a0a] border-b border-[rgba(255,193,7,0.2)]" style={{ padding: '15px 20px' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between w-full" style={{ gap: '15px' }}>
                        {/* Left: Back button when user has selected a DM (replaces menu button position) */}
                        {activeChannel === 'dm' && selectedDmUser ? (
                            <button
                                onClick={() => setSelectedDmUser(null)}
                                className="text-[#FFC107] hover:text-[#FFD54F] transition-all p-2"
                            >
                                <ArrowLeft size={28} />
                            </button>
                        ) : (
                            // Empty div to maintain spacing
                            <div />
                        )}

                        {/* Right: Channel Selector Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center bg-[rgba(255,193,7,0.1)] hover:bg-[rgba(255,193,7,0.15)] text-[#FFC107] rounded-xl transition-all font-semibold"
                                style={{ padding: '12px 20px', gap: '10px' }}
                            >
                                {currentChannel && (
                                    <>
                                        <currentChannel.icon size={20} />
                                        <span>{currentChannel.name}</span>
                                        <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 bg-[#0a0a0a] border-2 border-[rgba(255,193,7,0.3)] rounded-xl shadow-lg overflow-hidden"
                                        style={{ marginTop: '10px', minWidth: '250px', zIndex: 50 }}
                                    >
                                        {channels.map((channel) => {
                                            const Icon = channel.icon;
                                            const isActive = activeChannel === channel.id;

                                            return (
                                                <button
                                                    key={channel.id}
                                                    onClick={() => handleChannelSelect(channel.id)}
                                                    className={`w-full flex items-center transition-all ${isActive
                                                        ? 'bg-[#FFC107] text-black'
                                                        : 'text-gray-300 hover:bg-[rgba(255,193,7,0.1)] hover:text-white'
                                                        }`}
                                                    style={{ padding: '15px 20px', gap: '12px' }}
                                                >
                                                    <Icon size={20} />
                                                    <div className="flex-1 text-left">
                                                        <div className="font-semibold">{channel.name}</div>
                                                        {!channel.canSend && (
                                                            <div className="text-xs opacity-70">Read-only</div>
                                                        )}
                                                    </div>
                                                    {isActive && (
                                                        <div className="w-2 h-2 rounded-full bg-black" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
                <div className="max-w-4xl mx-auto">
                    {/* DM: Show user selection grid */}
                    {activeChannel === 'dm' && !selectedDmUser ? (
                        <div>
                            <h2 className="text-2xl font-bold text-white" style={{ marginBottom: '20px' }}>
                                Select a user to message
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '15px' }}>
                                {dmUsers.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedDmUser(user)}
                                        className="bg-[#0a0a0a] border border-[rgba(255,193,7,0.2)] hover:border-[#FFC107] rounded-xl cursor-pointer transition-all"
                                        style={{ padding: '15px' }}
                                    >
                                        <div className="flex items-center" style={{ gap: '12px' }}>
                                            <Avatar className="w-12 h-12 border-2 border-[#FFC107]">
                                                {user.profile_photo_url ? (
                                                    <img
                                                        src={user.profile_photo_url}
                                                        alt={user.display_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <AvatarFallback className="bg-[#FFC107] text-black font-bold">
                                                        {user.display_name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold">{user.display_name}</h3>
                                                <p className="text-gray-400 text-sm">{user.email}</p>
                                            </div>
                                            <div
                                                className={`w-3 h-3 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-500'
                                                    }`}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : activeChannel === 'dm' && selectedDmUser ? (
                        // DM Messages
                        dmMessages.map((msg, index) => (
                            <MessageItem
                                key={msg.id}
                                msg={msg}
                                index={index}
                                currentUser={currentUser}
                                setReplyingTo={setReplyingTo}
                                formatTime={formatTime}
                                handleEmojiSelect={handleEmojiSelect}
                                handleLongPressStart={handleLongPressStart}
                                handleLongPressEnd={handleLongPressEnd}
                            />
                        ))
                    ) : activeChannel === 'dm' && dmMessages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                            style={{ paddingTop: '60px', paddingBottom: '60px' }}
                        >
                            <div
                                className="rounded-full bg-[rgba(255,193,7,0.15)] flex items-center justify-center mx-auto"
                                style={{ width: '80px', height: '80px', marginBottom: '20px' }}
                            >
                                <MessageCircle size={40} className="text-[#FFC107]" />
                            </div>
                            <h3
                                className="text-2xl font-bold text-white"
                                style={{ marginBottom: '10px' }}
                            >
                                No messages yet
                            </h3>
                            <p className="text-gray-400">
                                Start a conversation with {selectedDmUser?.display_name}
                            </p>
                        </motion.div>
                    ) : messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                            style={{ paddingTop: '60px', paddingBottom: '60px' }}
                        >
                            <div
                                className="rounded-full bg-[rgba(255,193,7,0.15)] flex items-center justify-center mx-auto"
                                style={{ width: '80px', height: '80px', marginBottom: '20px' }}
                            >
                                <Hash size={40} className="text-[#FFC107]" />
                            </div>
                            <h3
                                className="text-2xl font-bold text-white"
                                style={{ marginBottom: '10px' }}
                            >
                                Welcome to {currentChannel?.name}
                            </h3>
                            <p className="text-gray-400 text-lg">
                                {currentChannel?.canSend
                                    ? 'Start a conversation'
                                    : 'Read-only channel - Only the Chief can post here'}
                            </p>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <AnimatePresence>
                                {messages.map((msg, index) => (
                                    <MessageItem
                                        key={msg.id}
                                        msg={msg}
                                        index={index}
                                        currentUser={currentUser}
                                        setReplyingTo={setReplyingTo}
                                        formatTime={formatTime}
                                        handleEmojiSelect={handleEmojiSelect}
                                        handleLongPressStart={handleLongPressStart}
                                        handleLongPressEnd={handleLongPressEnd}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                    {/* Typing Indicator */}
                    {typingUsers.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm" style={{ padding: '10px 0' }}>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-[#FFC107] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-[#FFC107] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-[#FFC107] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span>
                                {typingUsers.length === 1
                                    ? `${typingUsers[0]} is typing...`
                                    : typingUsers.length === 2
                                        ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                                        : `${typingUsers.length} people are typing...`}
                            </span>
                        </div>
                    )}

                    {/* Sending Indicator */}
                    {sendingUsers.length > 0 && (
                        <div className="flex items-center gap-2 text-[#FFC107] text-sm font-semibold" style={{ padding: '10px 0' }}>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-[#FFC107] rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-[#FFC107] rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                                <span className="w-2 h-2 bg-[#FFC107] rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                            </div>
                            <span>
                                {sendingUsers.length === 1
                                    ? `${sendingUsers[0]}'s message is coming...`
                                    : sendingUsers.length === 2
                                        ? `${sendingUsers[0]} and ${sendingUsers[1]}'s messages are coming...`
                                        : `${sendingUsers.length} messages are coming...`}
                            </span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div >

            {/* Message Input - FIXED */}
            < div className="flex-shrink-0 bg-[#0a0a0a] border-t border-[rgba(255,193,7,0.2)]" style={{ padding: '15px 20px' }
            }>
                <div className="max-w-4xl mx-auto">
                    {/* Reply Preview */}
                    {replyingTo && (
                        <div
                            className="bg-[rgba(255,193,7,0.1)] border-l-4 border-[#FFC107] rounded-lg"
                            style={{ padding: '10px 12px', marginBottom: '12px' }}
                        >
                            <div className="flex items-start justify-between" style={{ gap: '12px' }}>
                                <div className="flex-1">
                                    <div className="flex items-center text-[#FFC107] text-sm font-semibold" style={{ marginBottom: '4px', gap: '6px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                                        </svg>
                                        <span>Replying to {replyingTo.sender_name}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm truncate">{replyingTo.content}</p>
                                </div>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                                >
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Media Preview */}
                    {mediaPreview && (
                        <div
                            className="bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] rounded-xl"
                            style={{ padding: '12px', marginBottom: '12px' }}
                        >
                            <div className="flex items-start" style={{ gap: '12px' }}>
                                {/* Preview Content */}
                                <div className="flex-1">
                                    {mediaPreview.type === 'image' && (
                                        <img
                                            src={mediaPreview.url}
                                            alt="Preview"
                                            className="rounded-lg"
                                            style={{ maxWidth: '200px', maxHeight: '150px' }}
                                        />
                                    )}
                                    {mediaPreview.type === 'voice' && (
                                        <div className="flex items-center text-[#FFC107]" style={{ gap: '8px' }}>
                                            <Mic size={20} />
                                            <span className="text-sm font-semibold">Voice message ready</span>
                                        </div>
                                    )}
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setMediaPreview(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    style={{ padding: '4px' }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    <form onSubmit={handleSendMessage} className="flex" style={{ gap: '10px' }}>
                        <div className="flex" style={{ gap: '6px' }}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleVoiceRecord}
                                className={`${isRecording
                                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                    : 'bg-[rgba(255,193,7,0.1)] hover:bg-[rgba(255,193,7,0.2)] text-[#FFC107]'
                                    } rounded-xl`}
                                style={{ width: '45px', height: '45px', padding: '0' }}
                                disabled={!currentChannel?.canSend || isUploading}
                            >
                                <Mic size={20} />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleImageUpload}
                                className="bg-[rgba(255,193,7,0.1)] hover:bg-[rgba(255,193,7,0.2)] text-[#FFC107] rounded-xl"
                                style={{ width: '45px', height: '45px', padding: '0' }}
                                disabled={!currentChannel?.canSend || isUploading}
                            >
                                <ImageIcon size={20} />
                            </Button>
                        </div>

                        <Input
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder={
                                isSendingMessage
                                    ? '📤 Sending...'
                                    : activeChannel === 'dm'
                                        ? 'Type a message...'
                                        : currentChannel?.canSend
                                            ? `Message in ${currentChannel.name}...`
                                            : 'Read-only channel'
                            }
                            disabled={activeChannel === 'dm' ? false : (!currentChannel?.canSend || isSendingMessage)}
                            className="flex-1 bg-black border-[rgba(255,193,7,0.2)] text-white placeholder:text-gray-500 focus:border-[#FFC107] rounded-xl disabled:opacity-50"
                            style={{ height: '45px', paddingLeft: '15px', paddingRight: '15px' }}
                        />

                        <Button
                            type="submit"
                            disabled={!message.trim() || (activeChannel === 'dm' ? false : !currentChannel?.canSend) || isSendingMessage}
                            className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ width: '45px', height: '45px', padding: '0' }}
                        >
                            {isSendingMessage ? (
                                <div className="animate-spin">⏳</div>
                            ) : (
                                <Send size={20} />
                            )}
                        </Button>
                    </form>

                    {/* Upload Progress Indicator */}
                    {isUploading && (
                        <div
                            className="flex items-center justify-center text-[#FFC107]"
                            style={{ marginTop: '10px', gap: '10px' }}
                        >
                            <div className="animate-spin rounded-full border-2 border-[#FFC107] border-t-transparent" style={{ width: '20px', height: '20px' }} />
                            <span className="text-sm font-semibold">Uploading file...</span>
                        </div>
                    )}

                    {!currentChannel?.canSend && (
                        <p
                            className="text-xs text-gray-500 text-center"
                            style={{ marginTop: '10px' }}
                        >
                            🔒 Read-only channel. Only the Chief can post announcements.
                        </p>
                    )}
                </div>
            </div >

            {/* Emoji Picker */}
            {
                showEmojiPicker && (
                    <EmojiPicker
                        onEmojiSelect={handleEmojiSelect}
                        onClose={() => {
                            setShowEmojiPicker(false);
                            setSelectedMessageForReaction(null);
                        }}
                        position={emojiPickerPosition}
                    />
                )
            }
        </div >
    );
}
