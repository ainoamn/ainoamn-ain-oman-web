// src/pages/tasks.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function TasksRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/tasks/index');
  }, []);
  
  return null;
}

