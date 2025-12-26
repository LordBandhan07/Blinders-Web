import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Fetch members error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch members' },
                { status: 500 }
            );
        }

        return NextResponse.json({ members: profiles || [] });
    } catch (error) {
        console.error('Get members API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
