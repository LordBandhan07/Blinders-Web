import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { newPassword } = await request.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Get session from cookies
        const cookieStore = await cookies();
        const authToken = cookieStore.get('supabase-auth-token');

        console.log('🔍 Auth token exists:', !!authToken);

        if (!authToken) {
            console.error('❌ No auth token in cookies');
            return NextResponse.json(
                { error: 'Not authenticated - please login again' },
                { status: 401 }
            );
        }

        // Create admin client for password update
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Verify token and get user
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authToken.value);

        if (userError || !user) {
            console.error('❌ Token verification failed:', userError);
            return NextResponse.json(
                { error: 'Invalid session - please login again' },
                { status: 401 }
            );
        }

        console.log('✅ User verified:', user.id);

        // Update password using admin client
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error('❌ Password update error:', updateError);
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        console.log('✅ Password updated in Supabase Auth');

        // Save password to profiles table for admin visibility
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ latest_password: newPassword })
            .eq('id', user.id);

        if (profileError) {
            console.error('⚠️ Profile update error:', profileError);
            // Don't fail - password is already changed
        } else {
            console.log('✅ Password saved to profiles for admin');
        }

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error: any) {
        console.error('❌ Change password API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
