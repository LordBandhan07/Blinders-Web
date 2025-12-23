import { create } from 'zustand';
import { BlindersUser } from './supabase';

interface AuthState {
    user: BlindersUser | null;
    isLoading: boolean;
    setUser: (user: BlindersUser | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    setLoading: (loading) => set({ isLoading: loading }),
    logout: () => set({ user: null }),
}));

interface ChatState {
    activeRoom: string | null;
    messages: any[];
    setActiveRoom: (roomId: string | null) => void;
    addMessage: (message: any) => void;
    setMessages: (messages: any[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    activeRoom: null,
    messages: [],
    setActiveRoom: (roomId) => set({ activeRoom: roomId }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setMessages: (messages) => set({ messages }),
}));
