// src/pages/notifications.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function NotificationsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/notifications/index');
  }, []);
  
  return null;
}

