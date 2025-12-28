'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function useSessionMonitor() {
    const router = useRouter();
    const warningShown = useRef(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                // No session, but we might be on a public page
                // The middleware handles redirection for protected pages
                return;
            }

            // Check if token is about to expire (less than 5 minutes)
            const expiresAt = session.expires_at; // timestamp in seconds
            if (!expiresAt) return;

            const now = Math.floor(Date.now() / 1000);
            const timeRemaining = expiresAt - now;

            // If less than 5 minutes remaining
            if (timeRemaining < 300 && timeRemaining > 0) {
                if (!warningShown.current) {
                    toast('Session expiring soon', {
                        icon: '⚠️',
                        style: {
                            background: '#0a0a0a',
                            color: '#FFC107',
                            border: '1px solid #FFC107',
                        },
                    });
                    warningShown.current = true;
                }

                // Attempt minimal refresh
                const { error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError) {
                    console.error('Auto-refresh failed:', refreshError);
                } else {
                    console.log('Session auto-refreshed');
                    warningShown.current = false; // Reset warning flag
                }
            } else if (timeRemaining <= 0) {
                // Expired
                toast.error('Session expired. Please login again.');
                await supabase.auth.signOut();
                router.push('/login');
            }
        };

        // Check every minute
        const interval = setInterval(checkSession, 60 * 1000);

        // Initial check
        checkSession();

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                router.push('/login');
            } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
                console.log('Token refreshed/signed in, syncing cookie...');
                warningShown.current = false;

                // Sync the new token to the httpOnly cookie
                if (session) {
                    try {
                        await fetch('/api/auth/refresh', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ session }),
                        });
                        console.log('Session cookie synced');
                    } catch (err) {
                        console.error('Failed to sync session cookie:', err);
                    }
                }
            }
        });

        return () => {
            clearInterval(interval);
            subscription.unsubscribe();
        };
    }, [router]);
}
