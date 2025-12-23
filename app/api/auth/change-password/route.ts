import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, validatePassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { newPassword } = await request.json();

        // Validate new password
        const validation = validatePassword(newPassword);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.message },
                { status: 400 }
            );
        }

        // Get user ID from session
        const cookieStore = await cookies();
        const userId = cookieStore.get('blinders_session')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password in database
        const { error } = await supabase
            .from('blinders_users')
            .update({
                password_hash: newPasswordHash,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
        );
    }
}
