// src/lib/animations.ts - مكتبة animations محسّنة
export const animations = {
  // Fade animations
  fadeIn: 'animate-[fadeIn_0.3s_ease-in-out]',
  fadeOut: 'animate-[fadeOut_0.3s_ease-in-out]',
  fadeInUp: 'animate-[fadeInUp_0.5s_ease-out]',
  fadeInDown: 'animate-[fadeInDown_0.5s_ease-out]',
  
  // Scale animations
  scaleIn: 'animate-[scaleIn_0.3s_ease-out]',
  scaleOut: 'animate-[scaleOut_0.3s_ease-in]',
  pulse: 'animate-pulse',
  
  // Slide animations
  slideInRight: 'animate-[slideInRight_0.4s_ease-out]',
  slideInLeft: 'animate-[slideInLeft_0.4s_ease-out]',
  slideInUp: 'animate-[slideInUp_0.4s_ease-out]',
  slideInDown: 'animate-[slideInDown_0.4s_ease-out]',
  
  // Bounce
  bounce: 'animate-bounce',
  
  // Spin
  spin: 'animate-spin',
  
  // Custom transitions
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-300 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
  },
  
  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    scaleDown: 'hover:scale-95 transition-transform duration-200',
    lift: 'hover:-translate-y-1 hover:shadow-xl transition-all duration-200',
    glow: 'hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300',
  },
};

// Keyframes للإضافة في tailwind.config.js
export const keyframes = {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  fadeOut: {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  fadeInUp: {
    '0%': { opacity: '0', transform: 'translateY(20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  fadeInDown: {
    '0%': { opacity: '0', transform: 'translateY(-20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  scaleIn: {
    '0%': { opacity: '0', transform: 'scale(0.9)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
  scaleOut: {
    '0%': { opacity: '1', transform: 'scale(1)' },
    '100%': { opacity: '0', transform: 'scale(0.9)' },
  },
  slideInRight: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(0)' },
  },
  slideInLeft: {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(0)' },
  },
  slideInUp: {
    '0%': { transform: 'translateY(100%)' },
    '100%': { transform: 'translateY(0)' },
  },
  slideInDown: {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(0)' },
  },
};

