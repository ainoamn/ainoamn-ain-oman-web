// src/hooks/useOptimizedImage.ts
export const useOptimizedImage = (src: string, size: { width: number; height: number }) => {
  const [optimizedSrc, setOptimizedSrc] = useState('');
  
  useEffect(() => {
    const optimizeImage = async () => {
      if (typeof window === 'undefined') return;
      
      // استخدام service مثل Cloudinary أو imgix لتحسين الصور
      const optimized = `https://res.cloudinary.com/demo/image/fetch/w_${size.width},h_${size.height},c_fill/${encodeURIComponent(src)}`;
      setOptimizedSrc(optimized);
    };
    
    optimizeImage();
  }, [src, size]);
  
  return optimizedSrc;
};