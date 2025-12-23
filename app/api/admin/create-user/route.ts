import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { hashPassword, validatePassword } from '@/lib/auth';
import { generateBlindersId } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Check if requester is admin
        const cookieStore = await cookies();
        const userId = cookieStore.get('blinders_session')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const adminClient = getAdminClient();

        // Verify admin role
        const { data: adminUser } = await adminClient
            .from('blinders_users')
            .select('role')
            .eq('id', userId)
            .single();

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        const { displayName, password } = await request.json();

        if (!displayName || !password) {
            return NextResponse.json(
                { error: 'Display name and password are required' },
                { status: 400 }
            );
        }

        // Validate password
        const validation = validatePassword(password);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.message },
                { status: 400 }
            );
        }

        // Get count of existing users to generate Blinders ID
        const { count } = await adminClient
            .from('blinders_users')
            .select('*', { count: 'exact', head: true });

        const blindersId = generateBlindersId(count || 0);
        const passwordHash = await hashPassword(password);

        // Create new user
        const { data: newUser, error } = await adminClient
            .from('blinders_users')
            .insert({
                blinders_id: blindersId,
                password_hash: passwordHash,
                display_name: displayName,
                role: 'member',
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Add user to default group rooms
        const { data: rooms } = await adminClient
            .from('chat_rooms')
            .select('id')
            .in('name', ['professional_level', 'study_circle']);

        if (rooms) {
            const roomMemberships = rooms.map(room => ({
                room_id: room.id,
                user_id: newUser.id,
            }));

            await adminClient
                .from('room_members')
                .insert(roomMemberships);
        }

        // Create admin chat room for this user
        const { data: adminChatRoom } = await adminClient
            .from('chat_rooms')
            .insert({
                name: `admin_chat_${newUser.id}`,
                type: 'direct',
                created_by: userId,
            })
            .select()
            .single();

        if (adminChatRoom) {
            await adminClient
                .from('room_members')
                .insert([
                    { room_id: adminChatRoom.id, user_id: userId },
                    { room_id: adminChatRoom.id, user_id: newUser.id },
                ]);
        }

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                blinders_id: blindersId,
                display_name: displayName,
            },
        });
    } catch (error) {
        console.error('User creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

// Get all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('blinders_session')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const adminClient = getAdminClient();

        // Verify admin role
        const { data: adminUser } = await adminClient
            .from('blinders_users')
            .select('role')
            .eq('id', userId)
            .single();

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get all users
        const { data: users, error } = await adminClient
            .from('blinders_users')
            .select('id, blinders_id, display_name, role, is_active, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
