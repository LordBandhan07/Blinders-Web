'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to passkey lock first
    router.push('/passkey-lock');
  }, [router]);

  return null;
}
