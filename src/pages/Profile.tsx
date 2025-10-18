// Redirect from /Profile to /profile (fix for browser autocomplete)
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to lowercase profile
    router.replace('/profile');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      direction: 'rtl'
    }}>
      <p style={{ fontSize: '18px', color: '#666' }}>جاري التوجيه...</p>
    </div>
  );
}

