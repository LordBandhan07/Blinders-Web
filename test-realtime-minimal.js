// MINIMAL REALTIME TEST
// Run this in browser console on your app page to test if Realtime works AT ALL

const testRealtime = async () => {
    console.log('🧪 Testing Supabase Realtime...');

    // Get the supabase client from window (if available)
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const client = createClient(supabaseUrl, supabaseKey);

    console.log('📡 Creating channel...');
    const channel = client
        .channel('test-channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'direct_messages',
            },
            (payload) => {
                console.log('✅ REALTIME EVENT RECEIVED:', payload);
                alert('REALTIME WORKS! Event: ' + payload.eventType);
            }
        )
        .subscribe((status) => {
            console.log('📊 Subscription status:', status);
            if (status === 'SUBSCRIBED') {
                console.log('✅ Successfully subscribed to realtime');
                alert('SUBSCRIBED! Now send a message from another user.');
            } else if (status === 'CHANNEL_ERROR') {
                console.error('❌ Channel error - Realtime is broken');
                alert('ERROR: Realtime channel failed');
            }
        });

    console.log('⏳ Waiting for events... Send a DM now.');

    // Keep channel alive for 2 minutes
    setTimeout(() => {
        console.log('🔕 Test complete, unsubscribing');
        client.removeChannel(channel);
    }, 120000);
};

// Auto-run
testRealtime();
