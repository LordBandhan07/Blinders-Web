import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key (use only in API routes)
export const getAdminClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

// Database types - EMAIL BASED
export interface BlindersUser {
    id: string;
    email: string;
    password_hash: string;
    display_name: string;
    avatar_url?: string;  // Supabase Storage URL
    role: 'admin' | 'member';
    is_active: boolean;
    can_change_email: boolean;
    created_at: string;
    updated_at: string;
}

export interface ChatRoom {
    id: string;
    name: string;
    type: 'group' | 'direct';
    created_by: string;
    created_at: string;
}

export interface Message {
    id: string;
    room_id: string;
    sender_id: string;
    content?: string;
    message_type: 'text' | 'voice' | 'image' | 'video';
    media_url?: string;  // Supabase Storage URL
    media_size?: number;  // File size in bytes
    media_duration?: number;  // Duration in seconds for voice/video
    created_at: string;
    is_read: boolean;
}

export interface RoomMember {
    id: string;
    room_id: string;
    user_id: string;
    joined_at: string;
}

// Storage helper functions
export const uploadFile = async (
    bucket: 'avatars' | 'chat-images' | 'chat-videos' | 'chat-voice',
    file: File,
    userId: string
): Promise<{ url: string | null; error: Error | null }> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            return { url: null, error };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return { url: publicUrl, error: null };
    } catch (error) {
        return { url: null, error: error as Error };
    }
};

export const deleteFile = async (
    bucket: 'avatars' | 'chat-images' | 'chat-videos' | 'chat-voice',
    filePath: string
): Promise<{ error: Error | null }> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        return { error };
    } catch (error) {
        return { error: error as Error };
    }
};

// Get file URL from storage path
export const getFileUrl = (
    bucket: 'avatars' | 'chat-images' | 'chat-videos' | 'chat-voice',
    filePath: string
): string => {
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
};
