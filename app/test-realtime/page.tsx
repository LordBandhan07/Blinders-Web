'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RealtimeTest() {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState('Not started');

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
        console.log(msg);
    };

    useEffect(() => {
        addLog('🔍 Starting Realtime Test...');

        // Test 1: Check if user is authenticated
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                addLog(`✅ User authenticated: ${session.user.id}`);
            } else {
                addLog('❌ No user session - LOGIN REQUIRED');
                setStatus('ERROR: Not logged in');
                return;
            }
        });

        // Test 2: Subscribe to realtime
        addLog('📡 Creating realtime channel...');
        const channel = supabase
            .channel('diagnostic-test')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'direct_messages',
                },
                (payload) => {
                    addLog(`🎉 REALTIME EVENT RECEIVED: ${JSON.stringify(payload)}`);
                    setStatus('✅ WORKING!');
                }
            )
            .subscribe((status) => {
                addLog(`📊 Subscription status: ${status}`);
                setStatus(status);

                if (status === 'SUBSCRIBED') {
                    addLog('✅ Successfully subscribed! Send a message now.');
                } else if (status === 'CHANNEL_ERROR') {
                    addLog('❌ CHANNEL ERROR - Realtime is broken on Supabase');
                } else if (status === 'TIMED_OUT') {
                    addLog('❌ TIMEOUT - Realtime service not responding');
                }
            });

        return () => {
            addLog('🔕 Cleaning up...');
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
            <h1 style={{ color: '#FFC107' }}>🔬 Realtime Diagnostic Test</h1>
            <div style={{
                background: '#222',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '2px solid #FFC107'
            }}>
                <h2>Status: <span style={{ color: status.includes('ERROR') || status.includes('CHANNEL_ERROR') ? 'red' : '#FFC107' }}>{status}</span></h2>
            </div>

            <div style={{
                background: '#111',
                padding: '15px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '500px',
                overflow: 'auto'
            }}>
                <h3 style={{ color: '#FFC107' }}>Console Logs:</h3>
                {logs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '5px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                        {log}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', background: '#222', borderRadius: '8px' }}>
                <h3 style={{ color: '#FFC107' }}>Instructions:</h3>
                <ol style={{ lineHeight: '1.8' }}>
                    <li>Open this page in TWO different browsers (or incognito + normal)</li>
                    <li>Login as different users in each</li>
                    <li>In one browser, go to Chat and send a DM</li>
                    <li>Watch this diagnostic page - does it show "REALTIME EVENT RECEIVED"?</li>
                </ol>
                <p style={{ color: '#FFC107', fontWeight: 'bold', marginTop: '15px' }}>
                    If you see "SUBSCRIBED" but NO events when sending messages → RLS is blocking<br />
                    If you see "CHANNEL_ERROR" or "TIMED_OUT" → Realtime is disabled in Supabase project settings
                </p>
            </div>
        </div>
    );
}
