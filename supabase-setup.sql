-- Blinders FINAL Production Database - Email Based Authentication
-- Black & Yellow Theme
-- WITH SUPABASE STORAGE SETUP
-- Run this ENTIRE script in Supabase SQL Editor

-- Drop existing tables
DROP TABLE IF EXISTS room_members CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS blinders_users CASCADE;

-- Create blinders_users table with EMAIL authentication
CREATE TABLE blinders_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,  -- Will store Supabase Storage URL
    role TEXT NOT NULL DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    can_change_email BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_rooms table
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_by UUID REFERENCES blinders_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table with media support
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES blinders_users(id),
    content TEXT,
    message_type TEXT NOT NULL DEFAULT 'text',  -- 'text', 'image', 'video', 'voice'
    media_url TEXT,  -- Supabase Storage URL for media files
    media_size BIGINT,  -- File size in bytes
    media_duration INTEGER,  -- Duration in seconds for voice/video
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

-- Create room_members table
CREATE TABLE room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES blinders_users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Create indexes
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
CREATE INDEX idx_blinders_users_email ON blinders_users(email);

-- Enable Row Level Security
ALTER TABLE blinders_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all operations on blinders_users" ON blinders_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_rooms" ON chat_rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on room_members" ON room_members FOR ALL USING (true);

-- Insert default chat rooms
INSERT INTO chat_rooms (name, type) VALUES
    ('professional_level', 'group'),
    ('study_circle', 'group');

-- Insert PRODUCTION users with EMAIL IDs
INSERT INTO blinders_users (email, password_hash, display_name, role, can_change_email) VALUES 
('arthur.b@blinders.chief', '$2a$10$VFJ1PaAdnRiXxZfD4FMCjO97u6legVy7oEyv5.TiRZSjbUgNUYHVy', 'Arthur Shelby - God of Blinders', 'admin', true);

INSERT INTO blinders_users (email, password_hash, display_name, role, can_change_email) VALUES 
('steve.s@blinders.president', '$2a$10$l/bbdg7SaWl4uDClIg0/Uueh8Bok8HHQ3ngMxGfjmoSsPlqslP5Iq', 'Steve Rogers - President', 'member', false);

INSERT INTO blinders_users (email, password_hash, display_name, role, can_change_email) VALUES 
('robert.s@blinders.chiefmember', '$2a$10$8vYa/aqF1h5hTsbNR.MgOuD./C6WartqEhTEqwqUAcoH/dUiiaBz.', 'Robert Downey - Chief Member', 'member', false);

INSERT INTO blinders_users (email, password_hash, display_name, role, can_change_email) VALUES 
('anthoni.b@blinders.seniormember', '$2a$10$sKYAwI9Ngm4ySoEuZJzNcOeCBKpWRwcyOamJ8atvTe2QS1JXvVygG', 'Anthony Mackie - Senior Member', 'member', false);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_blinders_users_updated_at
    BEFORE UPDATE ON blinders_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE '  BLINDERS - Black & Yellow Theme';
    RAISE NOTICE '  Email-Based Authentication';
    RAISE NOTICE '  WITH SUPABASE STORAGE SUPPORT';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Login Credentials:';
    RAISE NOTICE '-------------------';
    RAISE NOTICE 'arthur.b@blinders.chief / LordBandhan@Blinders07';
    RAISE NOTICE 'steve.s@blinders.president / MrSteve@Blinders7';
    RAISE NOTICE 'robert.s@blinders.chiefmember / MrRobert@Blinders7';
    RAISE NOTICE 'anthoni.b@blinders.seniormember / MrAnthony@Blinders7';
    RAISE NOTICE '';
    RAISE NOTICE 'Storage Buckets to Create:';
    RAISE NOTICE '- avatars (for user profile pictures)';
    RAISE NOTICE '- chat-images (for image messages)';
    RAISE NOTICE '- chat-videos (for video messages)';
    RAISE NOTICE '- chat-voice (for voice messages)';
    RAISE NOTICE '================================================';
END $$;
