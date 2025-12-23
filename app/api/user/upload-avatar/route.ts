import { NextRequest, NextResponse } from 'next/server';
import { supabase, uploadFile } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Get user session
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('blinders_session')?.value;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user from database
        const { data: user, error: userError } = await supabase
            .from('blinders_users')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get file from form data
        const formData = await request.formData();
        const file = formData.get('avatar') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (2MB max)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 2MB.' },
                { status: 400 }
            );
        }

        // Upload to Supabase Storage
        const { url, error: uploadError } = await uploadFile('avatars', file, user.id);

        if (uploadError || !url) {
            return NextResponse.json(
                { error: 'Failed to upload avatar' },
                { status: 500 }
            );
        }

        // Update user avatar_url in database
        const { error: updateError } = await supabase
            .from('blinders_users')
            .update({ avatar_url: url })
            .eq('id', user.id);

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to update avatar URL' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            avatar_url: url,
            message: 'Avatar uploaded successfully'
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
